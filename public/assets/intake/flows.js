(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.VLK);if(typeof module==='object'&&module.exports)module.exports=api;else root.VLKFlows=api;})(typeof globalThis!=='undefined'?globalThis:this,function(E){
 'use strict';
 const OPTIONS={aiGoal:[['inventory','Understand our AI footprint'],['risk','Review AI security and risks'],['governance','Establish AI governance and rules'],['assurance','Respond to a customer AI questionnaire'],['readiness','Prepare AI governance and compliance evidence'],['unsure','Help us choose a starting point']]};
 const MODES={security:{title:'Security Service Finder',path:'/security-service-finder/',description:'Find a practical starting engagement for your security priorities.'},ai:{title:'AI Security & Governance Intake',path:'/ai-security-intake/',description:'Explore the security, data and governance needs of your AI use.'}};
 const COMMON=['size','sector','markets','infrastructure'];
 const ALL_OPTIONS={...E.OPTIONS,...OPTIONS};
 function fresh(mode){return{...E.freshAnswers(),aiUse:mode==='security'?'none':'',aiGoal:''};}
 function validateStep(mode,step,a){
  if(!Object.hasOwn(MODES,mode))return{mode:'Choose a supported questionnaire.'};
  if(mode==='security')return E.validateStep(step,{...a,aiUse:'none'});
  if(step===0)return E.validateStep(0,a);
  if(step===1){const errors=E.validateStep(2,a);return Object.fromEntries(Object.entries(errors).filter(([k])=>k.startsWith('ai')));}
  if(step===2){const errors={};if(!OPTIONS.aiGoal.some(o=>o[0]===a.aiGoal))errors.aiGoal='Choose your main AI need.';if(!E.OPTIONS.deadline.some(o=>o[0]===a.deadline))errors.deadline='Choose a planning window.';if(!Array.isArray(a.frameworks)||a.frameworks.some(v=>!E.OPTIONS.frameworks.some(o=>o[0]===v)))errors.frameworks='Choose valid targets.';return errors;}
  return{};
 }
 function cleanAnswers(mode,input){
  if(!Object.hasOwn(MODES,mode)||!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid questionnaire.');
  const out=fresh(mode);
  for(const [key,value] of Object.entries(input)){
   if(!Object.hasOwn(out,key))throw Error('Unknown questionnaire field.');
   if(Array.isArray(out[key])){if(!Array.isArray(value)||value.length>(ALL_OPTIONS[key]?.length||0)||new Set(value).size!==value.length||value.some(v=>typeof v!=='string'||!ALL_OPTIONS[key].some(o=>o[0]===v)))throw Error('Invalid questionnaire option.');}
   else if(typeof value!=='string'||(value!==''&&!(key==='goal'?E.GOALS.some(g=>g.id===value):ALL_OPTIONS[key]?.some(o=>o[0]===value))))throw Error('Invalid questionnaire option.');
   out[key]=Array.isArray(value)?[...value]:value;
  }
  if(mode==='security'){
   if(out.aiUse!=='none'||out.aiGoal||Object.entries(E.freshAI()).some(([k,v])=>Array.isArray(v)?out[k].length:out[k]!==''))throw Error('Use the AI questionnaire for AI details.');
  }
  if([0,1,2].some(s=>Object.keys(validateStep(mode,s,out)).length))throw Error('Complete the questionnaire.');
  return out;
 }
 function commonSummary(a){return COMMON.map(k=>[{size:'Number of employees',sector:'Industry',markets:'Markets',infrastructure:'IT environment'}[k],Array.isArray(a[k])?a[k].map(v=>E.label(k,v)).join(', '):E.label(k,a[k])]);}
 function summary(mode,a){if(mode==='security')return E.answerSummary({...a,aiUse:'none'}).filter(([k])=>k!=='AI use');return[...commonSummary(a),...E.aiSummary(a),['AI priority',OPTIONS.aiGoal.find(o=>o[0]===a.aiGoal)?.[1]||'Not provided'],['Timing',E.label('deadline',a.deadline)],['Targets',a.frameworks.length?a.frameworks.map(v=>E.label('frameworks',v)).join(', '):'Identify during discovery']];}
 function recommendation(mode,input){
  const a=cleanAnswers(mode,input);
  if(mode==='security')return E.recommendation(a);
  const ai=E.aiScope(a),discovery=['none','unsure'].includes(a.aiUse);
  const names={inventory:'AI Inventory & Initial Scoping',risk:'AI Security & Risk Review',governance:'AI Governance Foundations',assurance:'AI Customer Assurance',readiness:'AI Governance & Compliance Readiness',unsure:'AI Discovery & Scoping'};
  const title=discovery?'AI Discovery & Scoping':names[a.aiGoal];
  const deliverables=discovery?['Initial AI inventory and use-case questions','Proposed scope and evidence request','Named owners and next-step recommendations']:['AI inventory and data-flow / access map','Prioritized control and evidence backlog','AI governance and responsibility recommendations','Scoped roadmap and management readout'];
  if(!discovery&&a.aiTypes.includes('agents'))deliverables.push('Agent permissions and human-approval matrix');
  if(!discovery&&a.aiGoal==='assurance')deliverables.push('Evidence-backed draft answers for client review');
  const reasons=discovery?[a.aiUse==='none'?'No current or planned AI use was reported. Start by clarifying whether an AI engagement is needed, or use the general Security Service Finder.':'AI use is not yet clear. Identify embedded tools, informal use and responsible owners before setting assessment scope.']:[OPTIONS.aiGoal.find(o=>o[0]===a.aiGoal)[1]+'.',ai.reason,'The reported AI types, sourcing, hosting, data and permissions shape the proposed evidence review.'];
  return{primary:'ai',service:{name:title,description:discovery?'A discovery conversation to clarify AI use and the appropriate next step.':'A scoped review of the AI use cases, suppliers, data paths, permissions and governance you reported.',type:'Proposed engagement · scope and fees agreed after discovery',deliverables},supporting:[],reasons,ai:discovery?{...ai,items:ai.items,deliverables:ai.deliverables}:ai,phases:[{title:'Technical assessment',text:discovery?'Identify tools, use cases and owners; confirm whether further technical review is relevant.':'Review the agreed architecture, data flows, suppliers and permissions; separately authorize any active testing.'},{title:'Governance',text:'Agree ownership, acceptable use, responsibilities and approval boundaries.'},{title:'Risk assessment & treatment',text:'Validate evidence, describe business impacts and assign risk treatment owners.'},{title:'Compliance readiness & assurance',text:'Map the agreed requirements to evidence and prepare a proportionate readiness roadmap.'}],timing:'Your answers guide scoping. They do not establish a security finding, legal classification, certification or compliance result.'};
 }
 function cleanRecords(records){
  if(!records||typeof records!=='object'||Array.isArray(records)||!Object.keys(records).length||Object.keys(records).some(k=>!Object.hasOwn(MODES,k)))throw Error('Choose at least one completed questionnaire.');
  return Object.fromEntries(Object.entries(records).map(([mode,a])=>[mode,cleanAnswers(mode,a)]));
 }
 function draft(records,contact,{verified=false,sent=false}={}){
  const valid=cleanRecords(records);if(Object.keys(E.validateContact(contact)).length)throw Error('Check contact details.');const c=E.normalizeContact(contact);
  const rows=['VLK INFOSEC CONSULTING — ENGAGEMENT BRIEF','Direction · Structure · Assurance','','CONTACT DETAILS',`Name: ${c.name}`,`Email: ${c.email}`,`Organization: ${c.company||'Not provided'}`,`Role: ${c.role||'Not provided'}`,`Country: ${c.country||'Not provided'}`,`Email ownership: ${verified?'Verified for this submission':'Not verified — draft only'}`,''];
  for(const [mode,a] of Object.entries(valid)){
   const r=recommendation(mode,a);rows.push(MODES[mode].title.toUpperCase(),...summary(mode,a).map(([k,v])=>`${k}: ${v}`),'','RECOMMENDED STARTING ENGAGEMENT',r.service.name,r.service.description,'','WHY THIS FITS',...r.reasons.map(v=>'• '+v),'','PROPOSED OUTPUTS',...r.service.deliverables.map(v=>'• '+v));
   if(r.ai?.items?.length)rows.push('','AI SCOPE',...r.ai.items.map(v=>'• '+v));
   if(r.pentest)rows.push('','PRELIMINARY TOOL FIT',...r.pentest.tools.map(t=>t.name+': '+t.fit),'Authorization gate: '+r.pentest.gate,'No scan runs from this questionnaire.');
   if(r.supporting.length)rows.push('','SUPPORTING SERVICES',...r.supporting.map(v=>E.SERVICES[v.id].name+': '+v.reason));
   rows.push('','DELIVERY APPROACH',...r.phases.map((p,i)=>`${i+1}. ${p.title}: ${p.text}`),'',r.timing,'');
  }
  rows.push('ADDITIONAL CONTEXT',c.message||'None provided.','','Scope, timing and fees require discovery. Questionnaire selections are scoping inputs, not findings or determinations of legal applicability. Written authorization is required before active testing.',sent?'Prospect explicitly confirmed sending. Recommendation recalculated by the server.':'PRIVATE DRAFT — prepared in this browser. No enquiry has been sent.');return rows.join('\n');
 }
 return{OPTIONS,ALL_OPTIONS,MODES,COMMON,fresh,validateStep,cleanAnswers,cleanRecords,summary,recommendation,draft};
});
