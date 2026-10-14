const assert=require('node:assert/strict');
const E=require('../public/assets/intake/engine.js'),F=require('../public/assets/intake/flows.js'),C=require('../public/assets/intake/catalog.js');
const contact={...E.freshContact(),name:'Example Person',email:'person@example.com',country:'Serbia'};
const sec={...E.example(),aiGoal:''};
const ai={...F.fresh('ai'),size:'small',sector:'saas',markets:['eu'],infrastructure:'cloud',aiUse:'use',aiTypes:['llm'],aiSource:['thirdparty'],aiHosting:'vendor',aiData:['public'],aiGovernance:'defined',aiGoal:'risk',deadline:'quarter'};
let checks=0,securityCases=0,aiCases=0;
function check(name,fn){fn();checks++;console.log('PASS',name);}
check('Both forms reject incomplete input and expose independent fields',()=>{
 for(const mode of ['security','ai'])for(let step=0;step<3;step++)assert.ok(Object.keys(F.validateStep(mode,step,F.fresh(mode))).length);
 assert.deepEqual(F.validateStep('ai',1,ai),{});assert.deepEqual(F.validateStep('ai',2,ai),{});
 for(const mode of ['bad','',null])assert.throws(()=>F.cleanAnswers(mode,{}));
});
check('Every general goal returns the expected primary service across baseline combinations',()=>{
 for(const goal of E.GOALS.map(x=>x.id))for(const maturity of E.OPTIONS.maturity.map(x=>x[0]))for(const leadership of E.OPTIONS.leadership.map(x=>x[0]))for(const technical of E.OPTIONS.technical.map(x=>x[0]))for(const evidence of E.OPTIONS.evidence.map(x=>x[0])){
  const a={...sec,goal,maturity,leadership,technical,evidence},r=F.recommendation('security',a);assert.equal(r.primary,goal==='unsure'?'risk':goal);assert.equal(new Set([r.primary,...r.supporting.map(x=>x.id)]).size,1+r.supporting.length);securityCases++;
 }
 assert.equal(securityCases,567);
});
check('AI footprints, sourcing, hosting, data, governance and priorities produce bounded scoping outputs',()=>{
 for(const aiUse of ['planned','use','build','both'])for(const [aiGoal] of F.OPTIONS.aiGoal)for(const [type] of E.OPTIONS.aiTypes)for(const aiAutonomy of type==='agents'?E.OPTIONS.aiAutonomy.map(x=>x[0]):[''])for(const [source] of E.OPTIONS.aiSource)for(const [aiHosting] of E.OPTIONS.aiHosting)for(const [data] of E.OPTIONS.aiData)for(const [aiGovernance] of E.OPTIONS.aiGovernance){
  const a={...ai,aiUse,aiGoal,aiTypes:[type],aiSource:[source],aiHosting,aiData:[data],aiGovernance,aiAutonomy},r=F.recommendation('ai',a);
  assert.ok(r.service.name);assert.equal(r.phases.length,4);assert.ok(r.service.deliverables.length>=3);assert.ok(r.ai.items.length);if(type==='agents')assert.ok(r.service.deliverables.some(v=>v.includes('human-approval')));aiCases++;
 }
 assert.equal(aiCases,92160);
});
check('No or unknown AI use creates discovery rather than a claimed finding',()=>{
 for(const aiUse of ['none','unsure'])for(const [aiGoal] of F.OPTIONS.aiGoal){const a={...F.fresh('ai'),size:'small',sector:'saas',markets:['eu'],infrastructure:'cloud',aiUse,aiGoal,deadline:'quarter'},r=F.recommendation('ai',a);assert.equal(r.service.name,'AI Discovery & Scoping');assert.match(r.timing,/do not establish/);}
});
check('Conditional fields, enum boundaries and inconsistent combinations are blocked',()=>{
 for(const assessments of [null,[],{}, {unknown:ai}])assert.throws(()=>F.cleanRecords(assessments));
 for(const key of ['constructor','toString','__proto__'])assert.throws(()=>F.cleanRecords(JSON.parse('{"'+key+'":'+JSON.stringify(ai)+'}')));
 for(const patch of [{aiTypes:['agents'],aiAutonomy:''},{aiTypes:['llm','unsure']},{aiData:['public','personal']},{aiSource:['custom','unsure']},{aiGoal:'invented'},{aiTypes:'llm'},{markets:['eu','eu']},{unknown:'value'}])assert.throws(()=>F.cleanAnswers('ai',{...ai,...patch}));
 assert.throws(()=>F.cleanAnswers('security',{...sec,aiUse:'use'}));
 assert.throws(()=>F.cleanAnswers('security',{...sec,goal:'certification',frameworks:[]}));
});
check('Shared contact fields match all country/role options and reject invalid values',()=>{
 assert.deepEqual(E.validateContact(contact),{});
 for(const country of C.countries)assert.deepEqual(E.validateContact({...contact,country}),{});
 for(const [role] of C.roles.flatMap(g=>g.options))assert.deepEqual(E.validateContact({...contact,role}),{});
 assert.equal(E.normalizeContact({...contact,country:' serbia '}).country,'Serbia');
 for(const email of ['bad','name@example','a..b@example.com','a@-bad.com','a@example.com\r\nBcc: victim@example.com'])assert.ok(E.validateContact({...contact,email}).email);
 assert.ok(E.validateContact({...contact,website:'bot'}).website);
});
check('Combined brief contains one contact block, both scopes and explicit unverified draft status',()=>{
 const text=F.draft({security:sec,ai},contact);assert.equal((text.match(/CONTACT DETAILS/g)||[]).length,1);
 for(const v of ['SECURITY SERVICE FINDER','AI SECURITY & GOVERNANCE INTAKE','Email ownership: Not verified','No enquiry has been sent.','person@example.com'])assert.ok(text.includes(v),v);
 const sent=F.draft({security:sec,ai},contact,{verified:true,sent:true});assert.match(sent,/Verified for this submission/);assert.doesNotMatch(sent,/PRIVATE DRAFT/);
});
require('node:fs').writeFileSync(new URL('./intake-validation-results.json','file://'+__filename),JSON.stringify({checks,securityCases,aiCases,aiDiscoveryCases:12,countryOptions:C.countries.length,roleOptions:C.roles.flatMap(g=>g.options).length,coverage:'Declared baseline and AI dimensions; not the full Cartesian questionnaire space',externalEmailsSent:0},null,2));
console.log(JSON.stringify({checks,securityCases,aiCases}));
