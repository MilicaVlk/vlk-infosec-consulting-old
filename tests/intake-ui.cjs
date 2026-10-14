const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'../public');
const E=require(root+'/assets/intake/engine.js'),F=require(root+'/assets/intake/flows.js');
function setup(mode='security',{enabled=false,failedSend=false}={}){
 const {window,document}=parseHTML(fs.readFileSync(root+F.MODES[mode].path+'index.html','utf8'));
 const effects={calls:[],scripts:0,download:null,blob:null,copied:null,confirm:true,path:F.MODES[mode].path};
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.getAttribute('value')||'';},set(v){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.getAttribute('value')===v);}});
 Object.defineProperty(window.HTMLInputElement.prototype,'checked',{configurable:true,get(){return this.hasAttribute('checked');},set(v){this.toggleAttribute('checked',Boolean(v));}});
 window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLInputElement.prototype.select=function(){};window.confirm=()=>effects.confirm;
 window.VLK=E;window.VLKFlows=F;window.VLKCatalog=require(root+'/assets/intake/catalog.js');
 window.history={pushState(_s,_t,url){effects.path=url;}};
 window.turnstile={render(selector,options){assert.ok(document.querySelector(selector));Promise.resolve().then(()=>options.callback('fixture-token'));return 1;},remove(){}};
 const location={protocol:'https:',hostname:'vlk-infosec.com',pathname:F.MODES[mode].path};
 const fetch=async(url,options)=>{
  assert.equal(url,'/api/intake');const data=options.body?JSON.parse(options.body):null;effects.calls.push({method:options.method,data});
  if(!data)return Response.json({enabled,siteKey:enabled?'fixture':''});
  if(data.action==='request')return Response.json({id:'00000000-0000-4000-8000-000000000001'});
  if(data.action==='submit')return failedSend?Response.json({error:'Delivery could not be confirmed. Please contact VLK.'},{status:503}):Response.json({ok:true});
  throw Error('Unexpected API action');
 };
 document.addEventListener('click',e=>{if(e.target.hasAttribute('download'))effects.download=e.target.getAttribute('download');});
 const ctx=vm.createContext({window,document,location,fetch,Response,URL:{createObjectURL(blob){effects.blob=blob;return'blob:fixture';},revokeObjectURL(){}},Blob,navigator:{clipboard:{async writeText(text){effects.copied=text;}}},setTimeout,clearTimeout});
 vm.runInContext(fs.readFileSync(root+'/assets/intake/mail.js','utf8'),ctx);vm.runInContext(fs.readFileSync(root+'/assets/intake/app.js','utf8'),ctx);
 const q=s=>document.querySelector(s),click=s=>{const e=q(s);assert.ok(e,'Missing '+s);e.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));};
 const submit=()=>q('#intake-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 function answer(key,value){
  if(Array.isArray(value)){const values=[...document.querySelectorAll(`[data-answer="${key}"]`)].map(e=>e.value);for(const v of values){const e=q(`[data-answer="${key}"][value="${v}"]`);if(value.includes(v)!==e.checked){e.checked=value.includes(v);e.dispatchEvent(new window.Event('change',{bubbles:true}));}}return;}
  const e=q(`[data-answer="${key}"]${key==='goal'?`[value="${value}"]`:''}`);assert.ok(e,key);if(key==='goal')e.checked=true;else e.value=value;e.dispatchEvent(new window.Event('change',{bubbles:true}));
 }
 const contact=(key,value)=>{const e=q(`[data-contact="${key}"]`);assert.ok(e,key+' at '+q('#intake-step-title')?.textContent+'; '+q('#intake-content')?.textContent.slice(0,300));e.value=value;e.dispatchEvent(new window.Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));};
 function common(){for(const key of F.COMMON)answer(key,E.example()[key]);submit();}
 function security(goal='certification'){
  common();answer('goal',goal);answer('frameworks',goal==='certification'?['iso']:[]);
  if(goal==='pentest')for(const key of ['ptAssets','ptScale','ptArchitecture','ptAccess','ptEnvironment','ptData','ptAuthorization'])answer(key,E.example()[key]);submit();
  for(const key of ['leadership','maturity','evidence','technical','deadline'])answer(key,E.example()[key]);submit();
 }
 function ai({shared=false,aiUse='both'}={}){
  if(shared)submit();else common();answer('aiUse',aiUse);
  if(['planned','use','build','both'].includes(aiUse)){answer('aiTypes',['llm','rag','agents']);answer('aiSource',['thirdparty','custom']);answer('aiHosting','hybrid');answer('aiGovernance','partial');answer('aiData',['personal','confidential']);answer('aiAutonomy','autonomous');}
  submit();answer('aiGoal','risk');answer('deadline','quarter');submit();
 }
 async function flush(){for(let i=0;i<6;i++)await new Promise(setImmediate);}
 return{q,document,window,effects,click,submit,answer,contact,common,security,ai,flush};
}
let checks=0;async function check(name,fn){await fn();checks++;console.log('PASS',name);}
(async()=>{
await check('Initial pages issue no API/provider requests and block incomplete navigation',()=>{
 for(const mode of ['security','ai']){const ui=setup(mode);assert.equal(ui.effects.calls.length,0);ui.submit();assert.equal(ui.document.querySelectorAll('.intake-error').length,4);assert.equal(ui.q('[data-step="3"]').disabled,true);}
});
await check('Every general service route, including pentest, completes through the controller',()=>{
 for(const goal of E.GOALS.map(x=>x.id)){const ui=setup();ui.security(goal);assert.equal(ui.q('.intake-recommendation h3').textContent,E.SERVICES[goal==='unsure'?'risk':goal].name);if(goal==='pentest')assert.match(ui.q('#intake-content').textContent,/No scan runs/);assert.equal(ui.q('[data-answer="aiUse"]'),null);}
});
await check('AI questions are conditional, agent permissions required, and stale AI values clear',()=>{
 const ui=setup('ai');ui.common();assert.equal(ui.q('#aiHosting'),null);ui.answer('aiUse','use');ui.answer('aiTypes',['agents']);ui.submit();assert.ok(ui.q('#aiAutonomy-error'));ui.answer('aiUse','none');assert.equal(ui.q('#aiHosting'),null);ui.submit();ui.answer('aiGoal','risk');ui.answer('deadline','quarter');ui.submit();assert.equal(ui.q('.intake-recommendation h3').textContent,'AI Discovery & Scoping');assert.doesNotMatch(ui.q('#intake-content').textContent,/Agent permissions and human-approval matrix/);
});
await check('Both forms combine into one brief while retaining contact and organization details',()=>{
 const ui=setup();ui.security();ui.click('[data-action="next"]');ui.contact('name','Example Person');ui.contact('email','person@example.com');ui.contact('country',' serbia ');ui.contact('role','Founder / Co-founder');ui.submit();
 assert.match(ui.q('#intake-brief').textContent,/SECURITY SERVICE FINDER/);ui.click('[data-mode="ai"]');assert.equal(ui.q('#size').value,'small');ui.ai({shared:true});assert.match(ui.q('#intake-content').textContent,/also included in the same brief/);ui.click('[data-action="next"]');assert.equal(ui.q('#contact-name').value,'Example Person');assert.equal(ui.q('#contact-email').value,'person@example.com');ui.submit();
 const text=ui.q('#intake-brief').textContent;for(const t of ['SECURITY SERVICE FINDER','AI SECURITY & GOVERNANCE INTAKE','Country: Serbia','Email ownership: Not verified'])assert.ok(text.includes(t));assert.equal((text.match(/CONTACT DETAILS/g)||[]).length,1);assert.equal(ui.effects.calls.length,0);
});
await check('Changed shared context invalidates stale completed scopes',()=>{
 const ui=setup();ui.security();ui.click('[data-mode="ai"]');ui.answer('size','medium');ui.submit();ui.answer('aiUse','none');ui.submit();ui.answer('aiGoal','inventory');ui.answer('deadline','quarter');ui.submit();ui.click('[data-action="next"]');ui.contact('name','Example Person');ui.contact('email','person@example.com');ui.submit();assert.doesNotMatch(ui.q('#intake-brief').textContent,/SECURITY SERVICE FINDER/);
});
await check('Optional organization, listed role/country, email validation and honeypot behave correctly',()=>{
 const ui=setup('ai');ui.ai();ui.click('[data-action="next"]');ui.submit();assert.equal(ui.document.querySelectorAll('.intake-error').length,2);ui.contact('name','Example Person');ui.contact('email','bad');ui.contact('country','Invented Country');ui.submit();assert.ok(ui.q('#email-error'));assert.ok(ui.q('#country-error'));ui.contact('email','person@example.com');ui.contact('country','Serbia');ui.contact('website','bot');ui.submit();assert.ok(ui.q('#website-error'));ui.contact('website','');ui.submit();assert.ok(ui.q('#intake-brief'));
});
await check('Untrusted text stays inert; copy/download preserve the brief without sending',async()=>{
 const ui=setup();ui.security('risk');ui.click('[data-action="next"]');ui.contact('name','<img src=x onerror=alert(1)>');ui.contact('email','person@example.com');ui.contact('message','<script>alert(1)</script>');ui.submit();assert.match(ui.q('#intake-brief').textContent,/<script>/);assert.equal(ui.q('#intake-brief script'),null);ui.click('[data-action="copy"]');await ui.flush();assert.match(ui.effects.copied,/Not verified/);ui.click('[data-action="download"]');assert.equal(ui.effects.download,'VLK-Engagement-Brief.txt');assert.match(await ui.effects.blob.text(),/No enquiry has been sent/);assert.equal(ui.effects.calls.length,0);
});
await check('Disabled email integration fails closed before requesting a code or loading Turnstile',async()=>{
 const ui=setup();ui.security();ui.click('[data-action="next"]');ui.contact('name','Example Person');ui.contact('email','person@example.com');ui.submit();ui.click('[data-action="request-code"]');await ui.flush();assert.equal(ui.effects.calls.length,1);assert.equal(ui.effects.calls[0].method,'GET');assert.match(ui.q('#intake-mail-status').textContent,/not enabled/);assert.equal(ui.q('#intake-code'),null);assert.equal(ui.q('script[src^="https://challenges"]'),null);
});
await check('Prepared live client requests only an email code before explicit questionnaire sending',async()=>{
 const ui=setup('ai',{enabled:true});ui.ai();ui.click('[data-action="next"]');ui.contact('name','Example Person');ui.contact('email','person@example.com');ui.submit();ui.click('[data-action="request-code"]');await ui.flush();
 const request=ui.effects.calls.find(c=>c.data?.action==='request');assert.equal(request.data.email,'person@example.com');assert.equal(request.data.assessments,undefined);assert.equal(request.data.contact,undefined);assert.ok(ui.q('#intake-code'));
 ui.q('#intake-code').value='123456';ui.q('#intake-code').dispatchEvent(new ui.window.Event('input',{bubbles:true}));ui.click('[data-action="send"]');await ui.flush();const sent=ui.effects.calls.find(c=>c.data?.action==='submit');assert.equal(sent.data.confirmSend,true);assert.ok(sent.data.assessments.ai);assert.match(ui.q('.intake-success').textContent,/Enquiry sent/);assert.equal(ui.q('#intake-brief'),null);
});
await check('Failed live delivery shows no success and prevents blind reuse of a challenge',async()=>{
 const ui=setup('ai',{enabled:true,failedSend:true});ui.ai();ui.click('[data-action="next"]');ui.contact('name','Example Person');ui.contact('email','person@example.com');ui.submit();ui.click('[data-action="request-code"]');await ui.flush();ui.q('#intake-code').value='123456';ui.q('#intake-code').dispatchEvent(new ui.window.Event('input',{bubbles:true}));ui.click('[data-action="send"]');await ui.flush();assert.match(ui.q('#intake-mail-status').textContent,/could not be confirmed/);assert.doesNotMatch(ui.q('.intake-success').textContent,/Enquiry sent/);assert.equal(ui.q('#intake-code'),null);
});
await check('Reset cancellation preserves answers; confirmation clears both flows and contact details',()=>{
 const ui=setup();ui.security();ui.click('[data-action="next"]');ui.contact('name','Example Person');ui.effects.confirm=false;ui.click('[data-action="reset"]');assert.equal(ui.q('#contact-name').value,'Example Person');ui.effects.confirm=true;ui.click('[data-action="reset"]');assert.equal(ui.q('#size').value,'');assert.equal(ui.q('[data-step="3"]').disabled,true);ui.security();ui.click('[data-action="next"]');assert.equal(ui.q('#contact-name').value,'');
});
console.log(checks+' DOM/live-client interaction checks passed. Providers are mocked; no email was sent. These checks do not render browser viewports.');
})().catch(e=>{console.error(e);process.exitCode=1;});
