import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import E from '../public/assets/intake/engine.js';
import {onRequest} from '../functions/api/intake.js';
const db=new DatabaseSync(':memory:');
db.exec(readFileSync(new URL('../migrations/0003_intake_verification.sql',import.meta.url),'utf8'));
const prepare=sql=>({bind(...args){return{first:async()=>db.prepare(sql).get(...args),run:async()=>db.prepare(sql).run(...args)}}});
const env={INTAKE_EMAIL_ENABLED:'true',DB:{prepare,batch:async a=>Promise.all(a.map(x=>x.run()))},APP_ORIGIN:'https://intake.example',TURNSTILE_SITE_KEY:'fixture',TURNSTILE_SECRET:'fixture',RATE_SECRET:'fixture-only-pepper',GOOGLE_CLIENT_ID:'fixture',GOOGLE_CLIENT_SECRET:'fixture',GOOGLE_REFRESH_TOKEN:'fixture',MAIL_FROM:'sender@example.com',MAIL_TO:'owner@example.com'};
let sent=[],turnstile={success:true,hostname:'intake.example',action:'client-intake'},failMail=false,fetches=0,checks=0;
globalThis.fetch=async(url,options)=>{
 fetches++;
 if(url.includes('siteverify'))return Response.json(turnstile);
 if(url.includes('oauth2'))return Response.json({access_token:'fixture-only'});
 if(url.includes('gmail')){
  if(failMail)return new Response('',{status:503});
  const raw=Buffer.from(JSON.parse(options.body).raw,'base64url').toString();
  sent.push({raw,text:Buffer.from(raw.split('\r\n\r\n')[1],'base64').toString()});return Response.json({id:'fixture'});
 }
 throw Error('Unexpected network destination');
};
const call=async(data,{origin=env.APP_ORIGIN,headers={},method='POST',raw,environment=env}={})=>{
 const r=await onRequest({env:environment,request:new Request(env.APP_ORIGIN+'/api/intake',{method,headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},...(method==='GET'?{}:{body:raw??JSON.stringify(data)})})});
 return{status:r.status,data:await r.json(),headers:r.headers};
};
const reset=()=>{db.exec('DELETE FROM intake_rate_limits; DELETE FROM intake_code_requests; DELETE FROM intake_challenges;');turnstile={success:true,hostname:'intake.example',action:'client-intake'};failMail=false;};
const request=async(email='person@example.com')=>{const r=await call({action:'request',email,turnstile:'fixture'});assert.equal(r.status,200);return{id:r.data.id,code:sent.at(-1).text.match(/\b\d{6}\b/)[0],email};};
const contact={...E.freshContact(),name:'Example Person',email:'person@example.com',role:'Founder / Co-founder',country:'Serbia'};
const submission=c=>({action:'submit',id:c.id,code:c.code,contact:{...contact,email:c.email},assessments:{security:{...E.example(),aiGoal:''}},confirmSend:true});
async function check(name,fn){await fn();checks++;console.log('PASS',name);}
await check('Live delivery stays disabled unless explicitly enabled and configured',async()=>{
 const before=fetches;assert.equal((await call({},{environment:{}})).status,503);
 assert.equal((await call({},{environment:{...env,INTAKE_EMAIL_ENABLED:'false'}})).status,503);assert.equal(fetches,before);
});
await check('Same-origin JSON, request size, method and honeypot checks',async()=>{
 assert.equal((await call({}, {origin:'https://attacker.example'})).status,403);
 assert.equal((await call({}, {headers:{'Content-Type':'text/plain'}})).status,415);
 assert.equal((await call({}, {method:'PUT'})).status,405);
 assert.equal((await call({}, {raw:'{bad'})).status,400);
 assert.equal((await call({}, {raw:' '.repeat(16001)})).status,413);
 assert.equal((await call({action:'request',email:contact.email,turnstile:'fixture',website:'bot'})).status,400);
 assert.equal((await call({action:'request',email:contact.email,turnstile:'fixture',extra:'ignored?'})).status,400);
});
await check('Server validates Turnstile success, hostname and action',async()=>{
 for(const value of [{success:false},{success:true,hostname:'evil.example',action:'client-intake'},{success:true,hostname:'intake.example',action:'enquiry'}]){turnstile=value;assert.equal((await call({action:'request',email:contact.email,turnstile:'fixture'})).status,403);}
 reset();
});
await check('Email header injection and malformed domain/local parts are rejected server-side',async()=>{
 for(const email of ['person@example.com\r\nBcc: victim@example.com','a..b@example.com','a@-bad.com'])assert.equal((await call({action:'request',email,turnstile:'fixture'})).status,400);
});
await check('Code request stores only a protected hash and a ten-minute challenge',async()=>{
 reset();const c=await request();const row=db.prepare('SELECT * FROM intake_challenges WHERE id=?').get(c.id);
 assert.equal(row.code_hash.length,64);assert.notEqual(row.code_hash,c.code);assert.ok(row.expires>Math.floor(Date.now()/1000)+590);
 assert.equal(sent.at(-1).raw.includes('To: '+c.email),true);assert.ok(!sent.at(-1).text.includes('RECOMMENDED STARTING ENGAGEMENT'));
 assert.equal((await call({action:'request',email:c.email,turnstile:'fixture'})).status,429);
});
await check('Missing send confirmation, invalid contact/catalog values and malformed answers are blocked',async()=>{
 reset();const c=await request(),s=submission(c);
 for(const variant of [{...s,confirmSend:false},{...s,contact:{...s.contact,role:'Unknown role'}},{...s,contact:{...s.contact,country:'Imaginary Land'}},{...s,contact:{...s.contact,unexpected:'field'}},{...s,assessments:{security:{...s.assessments.security,markets:['eu','eu']}}},{...s,assessments:{security:{...s.assessments.security,size:'invented'}}},{...s,assessments:{security:{...s.assessments.security,frameworks:'iso'}}},{...s,assessments:{}}])assert.equal((await call(variant)).status,400);
 assert.equal(sent.filter(x=>x.raw.includes('To: owner@example.com')).length,0);
});
await check('Wrong code, changed email and five attempts prevent submission',async()=>{
 reset();const c=await request(),s=submission(c),wrong=c.code==='000000'?'111111':'000000';
 assert.equal((await call({...s,contact:{...s.contact,email:'other@example.com'}})).status,400);
 for(let i=0;i<4;i++)assert.equal((await call({...s,code:wrong})).status,400);
 assert.equal((await call(s)).status,400);
});
await check('Expired code cannot send',async()=>{
 reset();const c=await request();db.prepare('UPDATE intake_challenges SET expires=0 WHERE id=?').run(c.id);
 assert.equal((await call(submission(c))).status,400);
});
await check('Successful submission recalculates the recommendation and rejects replay',async()=>{
 reset();const c=await request(),r=await call(submission(c));assert.equal(r.status,200);
 assert.match(sent.at(-1).text,/VLK INFOSEC CONSULTING/);
 assert.match(sent.at(-1).text,/Certification & Compliance Readiness/);
 assert.match(sent.at(-1).text,/Email ownership: Verified for this submission/);
 assert.doesNotMatch(sent.at(-1).text,/PRIVATE DRAFT/);
 assert.equal((await call(submission(c))).status,400);
 assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('X-Frame-Options'),'DENY');
});
await check('Concurrent submissions can claim a challenge only once',async()=>{
 reset();const c=await request(),before=sent.length;
 const results=await Promise.all([call(submission(c)),call(submission(c))]);
 assert.equal(results.filter(x=>x.status===200).length,1);assert.equal(sent.length,before+1);
});
await check('Hourly code/IP limits and replacement of the previous code are enforced',async()=>{
 reset();const first=await request();
 db.prepare('UPDATE intake_code_requests SET last_request=last_request-61').run();const second=await request();
 assert.equal((await call(submission(first))).status,400);
 db.prepare('UPDATE intake_code_requests SET last_request=last_request-61').run();await request();
 assert.equal((await call({action:'request',email:contact.email,turnstile:'fixture'})).status,429);
 reset();for(let i=0;i<30;i++)assert.equal((await call({action:'unknown'})).status,400);
 assert.equal((await call({action:'unknown'})).status,429);
});
await check('Provider failure removes the code and prevents uncertain-delivery retries',async()=>{
 reset();failMail=true;assert.equal((await call({action:'request',email:contact.email,turnstile:'fixture'})).status,503);
 assert.equal(db.prepare('SELECT count(*) AS n FROM intake_challenges').get().n,0);
 reset();const c=await request();failMail=true;assert.equal((await call(submission(c))).status,503);
 assert.equal((await call(submission(c))).status,400);
});
await check('SQL/HTML payloads remain inert plain text; forged IDs are rejected',async()=>{
 reset();const c=await request(),s=submission(c);
 assert.equal((await call({...s,id:"' OR 1=1--"})).status,400);
 const name="Robert'); DROP TABLE intake_challenges;-- <img src=x onerror=alert(1)>";
 assert.equal((await call({...s,contact:{...s.contact,name,message:'<script>alert(1)</script>'}})).status,200);
 assert.ok(sent.at(-1).text.includes(name));assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name='intake_challenges'").get());
});
await check('Both completed forms are revalidated and combined into one server-generated email',async()=>{
 reset();const c=await request(),s=submission(c);
 const ai={...E.freshAnswers(),aiGoal:'governance',size:'small',sector:'saas',markets:['eu'],infrastructure:'cloud',aiUse:'both',aiTypes:['rag','agents'],aiSource:['custom'],aiHosting:'own',aiData:['confidential'],aiGovernance:'partial',aiAutonomy:'approval',deadline:'month'};
 assert.equal((await call({...s,verified:true})).status,400);
 assert.equal((await call({...s,assessments:JSON.parse('{"toString":'+JSON.stringify(ai)+'}')})).status,400);
 assert.equal((await call({...s,assessments:{...s.assessments,ai}})).status,200);
 const text=sent.at(-1).text;assert.match(text,/SECURITY SERVICE FINDER/);assert.match(text,/AI SECURITY & GOVERNANCE INTAKE/);assert.match(text,/AI Governance Foundations/);assert.equal((text.match(/CONTACT DETAILS/g)||[]).length,1);
});
console.log(checks+' server-security checks passed with mocked Google/Turnstile providers. No email sent.');
