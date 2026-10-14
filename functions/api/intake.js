import E from '../../public/assets/intake/engine.js';
import F from '../../public/assets/intake/flows.js';

/* Live intake is disabled unless INTAKE_EMAIL_ENABLED is explicitly set to true. */
const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Strict-Transport-Security':'max-age=31536000','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}});
const configured=e=>e.INTAKE_EMAIL_ENABLED==='true'&&['DB','APP_ORIGIN','TURNSTILE_SITE_KEY','TURNSTILE_SECRET','RATE_SECRET','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','MAIL_FROM','MAIL_TO'].every(k=>e[k]);
const emailOK=E.emailOK;
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
async function limited(env,key,now,max){
 const bucket=await hash(env.RATE_SECRET+':'+key+':'+Math.floor(now/3600));
 const r=await env.DB.prepare('INSERT INTO intake_rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,now+3600).first();
 return r.count>max;
}
async function mail(env,to,subject,text,replyTo){
 if(!emailOK(env.MAIL_FROM)||!emailOK(to)||(replyTo&&!emailOK(replyTo)))throw Error('mail configuration');
 const auth=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'}),signal:AbortSignal.timeout(10000)});
 if(!auth.ok)throw Error('mail unavailable');const token=await auth.json();
 const b64=s=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(''));
 const mime=`From: ${env.MAIL_FROM}\r\nTo: ${to}\r\n${replyTo?'Reply-To: '+replyTo+'\r\n':''}Subject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64(text)}`;
 const result=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},body:JSON.stringify({raw:b64(mime).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}),signal:AbortSignal.timeout(15000)});
 if(!result.ok)throw Error('mail unavailable');
}
export async function onRequest({request,env}){
 try{
  if(!configured(env))return request.method==='GET'?reply({enabled:false}):reply({error:'Online submission is not enabled. You can download your brief or use Start a conversation.'},503);
  if(request.method==='GET')return reply({enabled:true,siteKey:env.TURNSTILE_SITE_KEY});
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(request.headers.get('Origin')!==env.APP_ORIGIN)return reply({error:'Invalid origin'},403);
  if((request.headers.get('Content-Type')||'').split(';')[0].trim().toLowerCase()!=='application/json')return reply({error:'JSON required'},415);
  if(Number(request.headers.get('Content-Length')||0)>16000)return reply({error:'Request too large'},413);
  // Bound the stream, including requests without Content-Length.
  const reader=request.body?.getReader();if(!reader)return reply({error:'Empty request'},400);
  let bytes=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>16000){await reader.cancel();return reply({error:'Request too large'},413);}parts.push(value);}
  let data;try{data=JSON.parse(new TextDecoder().decode(await new Blob(parts).arrayBuffer()));}catch{return reply({error:'Invalid JSON'},400);}
  if(!data||typeof data!=='object'||Array.isArray(data)||data.website||Object.keys(data).some(k=>!['action','email','turnstile','website','id','code','contact','assessments','confirmSend'].includes(k)))return reply({error:'Invalid request'},400);
  const now=Math.floor(Date.now()/1000),ip=request.headers.get('CF-Connecting-IP');
  if(!ip)return reply({error:'Unavailable'},503);
  if(await limited(env,'ip:'+ip,now,30))return reply({error:'Too many requests. Try again later.'},429);
  await env.DB.batch([env.DB.prepare('DELETE FROM intake_challenges WHERE expires < ?').bind(now),env.DB.prepare('DELETE FROM intake_rate_limits WHERE expires < ?').bind(now),env.DB.prepare('DELETE FROM intake_code_requests WHERE expires < ?').bind(now)]);
  if(data.action==='request'){
   const email=typeof data.email==='string'?data.email.trim():'';
   if(!emailOK(email))return reply({error:'Enter a valid email address.'},400);
   if(typeof data.turnstile!=='string'||data.turnstile.length>2048)return reply({error:'Complete the security check.'},400);
   const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:data.turnstile,remoteip:ip}),signal:AbortSignal.timeout(10000)}).then(r=>r.json());
   if(!check.success||check.hostname!==new URL(env.APP_ORIGIN).hostname||check.action!=='client-intake')return reply({error:'Security check expired. Please retry.'},403);
   if(await limited(env,'email:'+email.toLowerCase(),now,3))return reply({error:'Too many code requests. Try again later.'},429);
   const requestKey=await hash(env.RATE_SECRET+':cooldown:'+email.toLowerCase());
   const cooldown=await env.DB.prepare('INSERT INTO intake_code_requests(key,last_request,expires) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET last_request=excluded.last_request,expires=excluded.expires WHERE last_request<=? RETURNING last_request').bind(requestKey,now,now+3600,now-60).first();
   if(!cooldown)return reply({error:'Wait 60 seconds before requesting another code.'},429);
   const id=crypto.randomUUID();let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294000000);const code=String(n%1000000).padStart(6,'0');
   await env.DB.prepare("DELETE FROM intake_challenges WHERE email=? AND state='pending'").bind(email).run();
   await env.DB.prepare('INSERT INTO intake_challenges(id,email,code_hash,expires) VALUES(?,?,?,?)').bind(id,email,await hash(env.RATE_SECRET+':'+id+':'+code),now+600).run();
   try{await mail(env,email,'Verify your VLK InfoSec Consulting enquiry',`Your verification code is ${code}. It expires in 10 minutes.\n\nEnter it on the VLK InfoSec Consulting Client Assessment page to confirm your enquiry. Your questionnaire has not been sent yet. If you did not request this code, ignore this email.\nVLK InfoSec Consulting`);}catch{await env.DB.prepare('DELETE FROM intake_challenges WHERE id=?').bind(id).run();return reply({error:'We could not send the code. Please try again later.'},503);}
   return reply({id});
  }
  if(data.action==='submit'){
   if(typeof data.id!=='string'||!/^[0-9a-f-]{36}$/.test(data.id)||typeof data.code!=='string'||!/^\d{6}$/.test(data.code))return reply({error:'Enter the six-digit code.'},400);
   if(data.confirmSend!==true)return reply({error:'Confirm that you want to send this enquiry.'},400);
   if(!data.contact||typeof data.contact!=='object'||Array.isArray(data.contact)||Object.keys(data.contact).some(k=>!Object.hasOwn(E.freshContact(),k)))return reply({error:'Invalid contact details'},400);
   if(Object.keys(E.validateContact(data.contact)).length)return reply({error:'Check your contact details.'},400);
   const fields=E.normalizeContact(data.contact);
   let assessments;try{assessments=F.cleanRecords(data.assessments);}catch{return reply({error:'Check the questionnaire answers.'},400);}
   const attempted=await env.DB.prepare("UPDATE intake_challenges SET attempts=attempts+1 WHERE id=? AND state='pending' AND expires>? AND attempts<5 RETURNING *").bind(data.id,now).first();
   if(!attempted||attempted.email!==fields.email||attempted.code_hash!==await hash(env.RATE_SECRET+':'+data.id+':'+data.code))return reply({error:'Invalid or expired code. Check it or request a new code.'},400);
   const claim=await env.DB.prepare("UPDATE intake_challenges SET state='sending' WHERE id=? AND state='pending' RETURNING id").bind(data.id).first();
   if(!claim)return reply({error:'This code has already been used.'},409);
   try{await mail(env,env.MAIL_TO,'Verified website enquiry',F.draft(assessments,fields,{verified:true,sent:true}),fields.email);}catch{
    return reply({error:'Delivery could not be confirmed. Please contact VLK InfoSec Consulting on LinkedIn rather than resending immediately.'},503);
   }finally{await env.DB.prepare('DELETE FROM intake_challenges WHERE id=?').bind(data.id).run();}
   return reply({ok:true});
  }
  return reply({error:'Unknown action'},400);
 }catch{return reply({error:'Unable to process this request. Please try again later.'},503);}
}
