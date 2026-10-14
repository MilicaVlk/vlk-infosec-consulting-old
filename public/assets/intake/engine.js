(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VLK=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const C=typeof module==='object'&&module.exports?require('./catalog.js'):globalThis.VLKCatalog;
  const OPTIONS={
    size:[['micro','1–9'],['small','10–49'],['medium','50–249'],['large','250–999'],['enterprise','1,000+'],['unsure','Not sure'],['other','Other']],
    sector:[['saas','Technology / SaaS'],['tech','IT services / technology'],['finance','Financial services / insurance'],['health','Healthcare'],['industry','Manufacturing / industrial'],['logistics','Logistics / transport'],['telecom','Telecommunications'],['professional','Professional services'],['retail','Retail / e-commerce'],['public','Public sector / education'],['other','Other / prefer to discuss']],
    markets:[['serbia','Serbia'],['balkans','Other Balkan markets'],['eu','European Union'],['uk','United Kingdom'],['us','United States'],['other','Other markets']],
    infrastructure:[['cloud','Cloud / SaaS'],['hybrid','Hybrid cloud & on-premises'],['onprem','On-premises'],['unsure','Not sure yet']],
    frameworks:[['iso','ISO/IEC 27001'],['soc','SOC 2'],['nis','NIS2'],['dora','DORA'],['gdpr','GDPR'],['serbian','Serbian Information Security Law'],['unsure','Help me identify the right requirements']],
    leadership:[['none','No assigned security owner'],['it','IT / operations owns security'],['security','Dedicated security leadership']],
    maturity:[['starting','Starting from the basics'],['partial','Some policies and controls'],['established','An established security program']],
    evidence:[['limited','Little or no documented evidence'],['partial','Some evidence, spread across teams'],['organized','Organized evidence and owners']],
    technical:[['unknown','Never assessed / not sure'],['older','Assessed more than 12 months ago'],['recent','Assessed within the last 12 months']],
    deadline:[['urgent','Within 2 weeks'],['month','Within 1 month'],['quarter','Within 3 months'],['explore','Exploring — no fixed deadline']],
    aiUse:[['none','No current or planned AI use'],['planned','Planning / piloting AI'],['use','Using AI tools in the business'],['build','Developing / offering AI solutions'],['both','Both using and developing AI'],['unsure','Not sure — we need an inventory']],
    aiTypes:[['llm','LLMs / chat assistants'],['coding','AI coding assistants'],['media','Image, audio or video generation'],['embedded','AI features in business applications'],['rag','RAG / knowledge-base assistants'],['agents','AI agents / multi-agent workflows'],['ml','Predictive ML / analytics / decision models'],['other','Other AI systems'],['unsure','Not sure of the types']],
    aiSource:[['thirdparty','Ready-made third-party tools'],['custom','Built by us / for us'],['adapted','Adapted vendor or open-source solutions'],['unsure','Not sure']],
    aiHosting:[['vendor','Vendor cloud / hosted APIs'],['own','Our own cloud / on-premises'],['hybrid','A mix of vendor and own hosting'],['unsure','Not sure']],
    aiData:[['public','Public / synthetic data only'],['internal','Internal business information'],['personal','Personal / customer data'],['confidential','Confidential documents, source code or secrets'],['unsure','Data use is not yet clear']],
    aiGovernance:[['defined','Defined owners, rules and approvals'],['partial','Some rules / controls in place'],['none','No specific AI rules or controls'],['unsure','Not sure']],
    aiAutonomy:[['assist','Suggest / read only — no actions'],['approval','Execute actions after human approval'],['autonomous','Execute actions without each being approved'],['unsure','Permissions / autonomy are not clear']]
    ,ptAssets:[['web','Web application'],['api','API / backend'],['mobile','iOS / Android app'],['network','External or internal network'],['cloud','Cloud configuration / workload'],['ai','AI feature, LLM, RAG or agent'],['source','Source code review']]
    ,ptScale:[['single','One application or small scope'],['few','2–3 applications or APIs'],['multi','4–10 applications or APIs'],['large','More than 10 assets / broad estate']]
    ,ptArchitecture:[['monolith','Monolith / traditional application'],['services','Microservices / containers'],['serverless','Serverless / managed services'],['hybrid','Hybrid cloud and on-premises'],['unsure','Not sure yet']]
    ,ptImplementation:[['custom','Custom-built product'],['vendor','Commercial / vendor product'],['opensource','Open-source based / adapted'],['cms','CMS / low-code / no-code'],['mixed','Combination of custom and vendor components'],['unsure','Not sure yet']]
    ,ptStack:[['dotnet','Microsoft .NET / JVM platforms'],['webbackend','Node.js / Python / PHP / Go / Ruby'],['mobile','Native or cross-platform mobile'],['cms','CMS / low-code platform'],['legacy','Legacy / mixed technology'],['unsure','Not sure']]
    ,ptAccess:[['black','Black box — little internal information'],['gray','Gray box — test accounts / limited documentation'],['white','White box — source code and architecture available'],['unsure','Help me choose']]
    ,ptEnvironment:[['staging','Dedicated staging / test environment'],['production','Production only'],['both','Staging and production'],['notready','Environment or test window not ready']]
    ,ptData:[['public','Public / synthetic data'],['internal','Internal business data'],['personal','Personal / customer data'],['sensitive','Financial, health, credentials or other sensitive data'],['unsure','Not sure']]
    ,ptAuthorization:[['owned','We own the assets and can authorize testing'],['thirdparty','Some assets are cloud/vendor/third-party managed; permission needs confirming'],['pending','Written authorization is not in place yet'],['unsure','Not sure who can authorize the scope']]
  };
  const GOALS=[
    {id:'vciso',title:'We need someone to lead security',description:'Senior direction, priorities and management reporting.',icon:'compass'},
    {id:'certification',title:'We have an audit or readiness goal',description:'A framework, customer requirement or compliance deadline.',icon:'award'},
    {id:'risk',title:'We need to understand our risks',description:'Technical exposure, business impact and what to fix first.',icon:'shield'},
    {id:'assurance',title:'A customer needs security evidence',description:'Questionnaires, a tender or a supplier security review.',icon:'file'},
    {id:'program',title:'We need to build a security program',description:'Practical policies, responsibilities and repeatable controls.',icon:'layers'},
    {id:'unsure',title:'Help us identify the right starting point',description:'An initial assessment to clarify priorities.',icon:'search'},
    {id:'pentest',title:'We need a penetration test',description:'Authorized testing of a web app, API, mobile app, infrastructure or AI feature.',icon:'search'}
  ];
  const SERVICES={
    vciso:{name:'Fractional vCISO Advisory',short:'vCISO',type:'Ongoing advisory · agreed monthly capacity',description:'Senior security direction that connects technical teams, business priorities and management decisions.',deliverables:['Security strategy and phased roadmap','Risk updates and treatment oversight','Decision and action log','Agreed management reporting']},
    certification:{name:'Certification & Compliance Readiness',short:'Certification readiness',type:'Phased engagement · scope agreed after discovery',description:'Understand your gaps, build the evidence plan and coordinate the work needed for your selected readiness goal.',deliverables:['Gap and evidence matrix','Governance and responsibility map','Prioritized remediation backlog','Phased readiness roadmap']},
    risk:{name:'Cybersecurity Risk Assessment',short:'Risk assessment',type:'Focused assessment · scope agreed after discovery',description:'Connect technical exposure to business impact and turn findings into clear, owned risk decisions.',deliverables:['Technical findings and threat scenarios','Prioritized risk register with owners','Risk and readiness summary','Treatment roadmap and management readout']},
    assurance:{name:'Customer Assurance',short:'Customer assurance',type:'Focused support · aligned to the customer request',description:'Prepare clear, evidence-backed responses to customer questionnaires, tenders and supplier security reviews.',deliverables:['Draft questionnaire responses','Evidence index and gap list','Response and remediation backlog','Review-ready customer assurance pack']},
    program:{name:'Security Program Setup',short:'Security program setup',type:'Phased foundation · scope agreed after discovery',description:'Establish the roles, policies and practical operating routines that make security manageable.',deliverables:['Core governance and policy baseline','Roles, responsibilities and owner map','Risk and control operating routines','Prioritized implementation roadmap']}
    ,pentest:{name:'Authorized Penetration Test',short:'Penetration test',type:'Time-boxed assessment · exact targets and rules agreed in writing',description:'A human-led security assessment supported by carefully selected tools, with findings validated and prioritized for your team.',deliverables:['Agreed scope, rules of engagement and test plan','Validated technical findings with evidence and impact','Executive summary and prioritized remediation guidance','Optional separately scoped retest']}
  };
  function freshPentest(){return{ptAssets:[],ptScale:'',ptArchitecture:[],ptImplementation:'',ptStack:[],ptAccess:'',ptEnvironment:'',ptData:[],ptAuthorization:''};}
  function freshAI(){return{aiTypes:[],aiSource:[],aiHosting:'',aiData:[],aiGovernance:'',aiAutonomy:''};}
  function freshAnswers(){return{size:'',sector:'',markets:[],infrastructure:'',goal:'',frameworks:[],leadership:'',maturity:'',evidence:'',technical:'',deadline:'',aiUse:'',...freshAI(),...freshPentest()};}
  function hasAIDetails(a){return ['planned','use','build','both'].includes(a.aiUse);}
  function freshContact(){return{name:'',email:'',company:'',role:'',country:'',message:''};}
  function validOption(field,value){return (OPTIONS[field]||[]).some(x=>x[0]===value);}
  function label(field,value){return (OPTIONS[field]||[]).find(x=>x[0]===value)?.[1]||'Not provided';}
  function validateStep(step,a){
    const errors={};
    if(step===0){for(const key of ['size','sector','infrastructure'])if(!validOption(key,a[key]))errors[key]='Choose an option.';if(!Array.isArray(a.markets)||!a.markets.length||a.markets.some(v=>!validOption('markets',v)))errors.markets='Select at least one market.';}
    if(step===1){if(!GOALS.some(g=>g.id===a.goal))errors.goal='Choose the priority closest to your needs.';if(!Array.isArray(a.frameworks)||a.frameworks.some(v=>!validOption('frameworks',v)))errors.frameworks='Choose valid framework options.';else if(a.goal==='certification'&&!a.frameworks.length)errors.frameworks='Select a target, or choose help identifying requirements.';
      if(a.goal==='pentest'){for(const key of ['ptAssets','ptData'])if(!Array.isArray(a[key])||!a[key].length||a[key].some(v=>!validOption(key,v))||(a[key].includes('unsure')&&a[key].length>1))errors[key]='Select at least one option.';for(const key of ['ptArchitecture','ptStack'])if(!Array.isArray(a[key])||a[key].some(v=>!validOption(key,v))||(a[key].includes('unsure')&&a[key].length>1)||(key==='ptArchitecture'&&!a[key].length))errors[key]='Select an option, or choose not sure.';for(const key of ['ptScale','ptAccess','ptEnvironment','ptAuthorization'])if(!validOption(key,a[key]))errors[key]='Choose an option.';if(a.ptImplementation&&!validOption('ptImplementation',a.ptImplementation))errors.ptImplementation='Choose a valid option.';}
    }
    if(step===2){for(const key of ['leadership','maturity','evidence','technical','deadline','aiUse'])if(!validOption(key,a[key]))errors[key]='Choose an option.';
      if(hasAIDetails(a)){for(const key of ['aiTypes','aiSource','aiData'])if(!Array.isArray(a[key])||!a[key].length||a[key].some(v=>!validOption(key,v))||(a[key].includes('unsure')&&a[key].length>1))errors[key]='Select at least one option, or choose not sure.';
        if(a.aiData?.includes('public')&&a.aiData.length>1)errors.aiData='Public data only cannot be combined with other data categories.';
        for(const key of ['aiHosting','aiGovernance'])if(!validOption(key,a[key]))errors[key]='Choose an option.';
        if(a.aiTypes?.includes('agents')&&!validOption('aiAutonomy',a.aiAutonomy))errors.aiAutonomy='Choose the agents’ permission / autonomy level.';
      }
    }
    return errors;
  }
  function validateContact(c){
    const errors={};
    if(!c||typeof c!=='object'||Array.isArray(c))return{name:'Enter your full name.',email:'Enter a valid email address.'};
    for(const key of ['name','company','email','role','country','message','website'])if(c[key]!==undefined&&typeof c[key]!=='string')errors[key]='Enter text only.';
    if(Object.keys(errors).length)return errors;
    const n=normalizeContact(c);
    if(n.name.length<2||n.name.length>120)errors.name='Use 2 to 120 characters for your name.';
    if(n.company&&(n.company.length<2||n.company.length>120))errors.company='Use 2 to 120 characters, or leave this blank.';
    if(!emailOK(n.email)||/[\r\n]/.test(c.email||''))errors.email='Enter a valid email address, for example name@company.com (120 characters maximum).';
    if(n.role&&!C.roles.some(g=>g.options.some(o=>o[0]===n.role)))errors.role='Choose a listed role, or Other.';
    if(n.country&&!C.countries.includes(n.country))errors.country='Choose a listed country, Not sure or Other.';
    if(n.message&&(n.message.length<10||n.message.length>1200))errors.message='Use 10 to 1,200 characters, or leave this blank.';
    for(const key of ['name','company','role','country','message'])if(/[\u0000]/.test(n[key]))errors[key]='Remove unsupported control characters.';
    if(n.website)errors.website='Unable to prepare this form. Clear it and try again.';
    return errors;
  }
  function emailOK(s){
    if(typeof s!=='string'||s.length<5||s.length>120||/[\s\r\n]/.test(s))return false;
    const parts=s.split('@');if(parts.length!==2)return false;
    const [local,domain]=parts;
    return local.length>0&&local.length<=64&&!local.startsWith('.')&&!local.endsWith('.')&&!local.includes('..')&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)&&domain.length<=253&&domain.includes('.')&&domain.split('.').every(x=>x.length>0&&x.length<=63&&/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(x))&&/^(?:[A-Za-z]{2,}|xn--[A-Za-z0-9-]+)$/.test(domain.split('.').at(-1));
  }
  function normalizeContact(c){
    const out=freshContact();
    for(const k of Object.keys(out))out[k]=typeof c?.[k]==='string'?c[k].normalize('NFC').trim():'';
    out.country=C.countries.find(x=>x.toLowerCase()===out.country.toLowerCase())||out.country;
    out.website=typeof c?.website==='string'?c.website.trim():'';
    return out;
  }
  function recommendation(a){
    const missing=[0,1,2].flatMap(s=>Object.keys(validateStep(s,a)));
    if(missing.length)throw new Error('Complete the questionnaire before generating a recommendation.');
    const primary=a.goal==='unsure'?'risk':a.goal;
    if(primary==='pentest')return pentestRecommendation(a);
    const candidates=[];
    function support(id,score,reason){if(id!==primary){const existing=candidates.find(s=>s.id===id);if(existing){existing.score=Math.max(existing.score,score);existing.reason+=' '+reason;}else candidates.push({id,score,reason});}}
    if(a.maturity==='starting')support('program',9,'You are starting from the basics, so ownership, policies and control routines will need a foundation.');
    else if(a.maturity==='partial')support('program',4,'Your existing policies and controls can be brought into one owned security program.');
    if(a.technical==='unknown'||a.technical==='older')support('risk',8,'Your technical exposure needs a current baseline to inform risk and remediation priorities.');
    if(a.leadership==='none')support('vciso',6,'No security owner is assigned; ongoing advisory can help coordinate the roadmap and management decisions.');
    if(a.frameworks.some(f=>f!=='unsure'))support('certification',7,'You identified framework or regulatory targets that need a scoped gap and evidence review.');
    const ai=aiScope(a);
    if(ai.assessmentNeeded)support('risk',10,'Your AI data, application or agent footprint needs to be included in the risk assessment scope.');
    if(hasAIDetails(a)&&a.aiGovernance!=='defined')support('program',8,'AI use needs documented ownership, acceptable-use rules and approval controls.');
    const supporting=candidates.sort((a,b)=>b.score-a.score).slice(0,2);
    const firstReason={vciso:'Your main priority is senior security leadership and ongoing direction.',certification:'Your main priority is an audit, framework or compliance readiness goal.',risk:a.goal==='unsure'?'You need a clear starting point; a scoped risk assessment will establish priorities.':'Your main priority is understanding technical exposure and business risk.',assurance:'Your main priority is responding to a customer, tender or supplier security review.',program:'Your main priority is building a practical security program.'}[primary];
    const reasons=[firstReason];
    if(a.evidence==='limited')reasons.push('You have limited documented evidence, so the engagement starts with a baseline and a realistic evidence plan.');
    else if(a.evidence==='partial')reasons.push('Evidence is spread across teams; the plan includes an evidence index and clear owners.');
    else reasons.push('Your evidence is organized, allowing an initial review to build on the work already in place.');
    if(a.technical==='recent')reasons.push('A recent technical assessment can be reviewed first to focus any further assessment on gaps.');
    else reasons.push('A current technical baseline will help validate assumptions before priorities and controls are agreed.');
    if(ai.items.length)reasons.push(ai.reason);
    const frameworks=a.frameworks.filter(f=>f!=='unsure').map(f=>label('frameworks',f));
    let timing='Discovery will confirm scope, deliverables, effort and fees before an engagement is agreed.';
    if(a.deadline==='urgent')timing='Your deadline is within 2 weeks. Prioritize the immediate request, existing evidence and critical gaps first; agree a realistic scope in discovery.';
    else if(a.deadline==='month')timing='Your deadline is within 1 month. Start with a scope and evidence review, then agree the deliverables that fit that window.';
    else if(a.deadline==='quarter')timing='Your 3-month planning window supports a phased roadmap with owners, dependencies and review milestones.';
    const phases=[
      {title:'Technical assessment',text:a.technical==='recent'?'Review your recent findings, asset scope and technical evidence; agree any additional authorized assessment.':'Confirm critical assets and exposure; agree technical assessment scope and authorization before any active testing.'},
      {title:'Governance',text:'Define accountability, policies and decision rights; assign a business sponsor and control owners.'},
      {title:'Risk assessment & treatment',text:'Translate findings and threat scenarios into business risks, owners and a prioritized treatment roadmap.'},
      {title:'Compliance readiness & assurance',text:primary==='assurance'?'Map customer requirements to evidence, draft responses and track remediation gaps.':frameworks.length?'Map the selected targets to controls and evidence; track gaps, remediation and readiness.':'Identify relevant customer, contractual and regulatory requirements; build a proportionate evidence plan.'}
    ];
    if(hasAIDetails(a)){
      phases[0].text+=' Include AI architecture, data flows, vendors and integrations in the technical scope.';
      phases[1].text+=' Define AI ownership, acceptable use and approval boundaries.';
      phases[2].text+=' Assess AI-specific data and access scenarios and assign treatment owners.';
      phases[3].text+=' Capture relevant AI vendor, policy and control evidence for the agreed targets.';
    }
    return{primary,service:SERVICES[primary],supporting,reasons,frameworks,timing,phases,ai};
  }
  function aiScope(a){
    const ai={title:'No AI use reported',reason:'',items:[],deliverables:[],assessmentNeeded:false};
    if(a.aiUse==='none')return ai;
    if(a.aiUse==='unsure'){ai.title='Clarify your AI footprint';ai.reason='AI use is not yet clear; discovery should identify approved tools, embedded features and informal use.';ai.items=['Inventory AI tools, owners and embedded features, including informal use, before defining further review scope.'];ai.deliverables=['AI inventory and scoping questions'];return ai;}
    const types=a.aiTypes,source=a.aiSource,data=a.aiData;
    const custom=source.includes('custom')||source.includes('adapted')||['build','both'].includes(a.aiUse);
    const sensitive=data.some(v=>['internal','personal','confidential'].includes(v));
    const agent=types.includes('agents'),gen=types.some(v=>['llm','coding','media','rag','agents'].includes(v));
    ai.assessmentNeeded=custom||sensitive||agent||data.includes('unsure');
    ai.title=agent?'AI data & agent controls review':custom?'AI application & data review':'AI vendor & usage review';
    ai.reason=a.aiUse==='planned'?'Planned AI use adds a pre-rollout review of data, suppliers and permissions to the engagement.':'Your AI footprint adds data, supplier and access controls to the proposed engagement.';
    ai.items.push('Inventory '+types.map(t=>label('aiTypes',t)).join(', ').toLowerCase()+'; identify owners, intended uses and hosting boundaries.');
    if(source.includes('thirdparty')||source.includes('adapted')||['vendor','hybrid'].includes(a.aiHosting))ai.items.push('Review provider settings, data retention, training use, access controls and contractual data-processing terms.');
    if(custom)ai.items.push('Review model and component provenance, architecture, API identities, data pipelines and deployment controls.');
    if(sensitive||data.includes('unsure'))ai.items.push('Trace data flows, storage and access boundaries; confirm which internal, personal or confidential information AI may process.');
    if(gen)ai.items.push('Scope prompt-injection, output-validation and data-disclosure scenarios for the identified generative AI components.');
    if(types.includes('rag'))ai.items.push('Review knowledge-source permissions, indexing, retrieval access and tenant isolation.');
    if(types.includes('ml'))ai.items.push('Review training/input provenance, model evaluation, output validation and monitoring for predictive or decision models.');
    if(agent)ai.items.push(a.aiAutonomy==='autonomous'?'Review agent tool permissions, action logs, approval gates for consequential actions and stop / recovery controls.':a.aiAutonomy==='unsure'?'Map agent tools, identities and effective permissions; clarify which actions require human approval.':'Review agent identities, least-privilege tool access, approval enforcement and action logs.');
    ai.items.push(a.aiGovernance==='defined'?'Review existing AI owners, rules, approvals and incident procedures against the reported use.':'Establish AI ownership, acceptable-use rules, approval boundaries and incident handling.');
    ai.deliverables=['AI inventory and data-flow / access map','Prioritized AI control and evidence backlog'];
    if(agent)ai.deliverables.push('Agent permissions and human-approval matrix');
    if(a.aiGovernance!=='defined')ai.deliverables.push('AI governance and acceptable-use baseline');
    return ai;
  }
  function pentestRecommendation(a){
    const assets=a.ptAssets, hasWeb=assets.some(x=>['web','api'].includes(x)), broad=assets.some(x=>['network','cloud'].includes(x))||a.ptScale==='large'||a.ptScale==='multi';
    const needsSpecialist=assets.includes('mobile')||assets.includes('source');
    const aiTarget=assets.includes('ai');
    const tools=[];
    if(hasWeb)tools.push({name:'Pentest Swarm AI',fit:'A candidate for scoped web/API discovery and testing in a dedicated test environment, followed by human validation.'});
    if(broad||aiTarget)tools.push({name:'RedAmon',fit:aiTarget?'A candidate for broader attack-surface mapping and a separately scoped AI Gauntlet review; validate tool coverage and data flows before use.':'A candidate for broader asset discovery and multi-tool assessment across the agreed external, cloud or network scope.'});
    if(!tools.length)tools.push({name:'Specialist-led assessment',fit:'The selected scope needs a specialist workflow; the two tools can only supplement it where their coverage fits.'});
    if(needsSpecialist)tools.push({name:'Specialist manual testing',fit:[assets.includes('mobile')?'Mobile application testing with an appropriate mobile security methodology.':'',assets.includes('source')?'Source-assisted code review and dependency / secret checks.':''].filter(Boolean).join(' ')});
    const gate=a.ptAuthorization==='owned'?'Asset ownership is reported, but written authorization, exact targets and rules of engagement still need to be agreed before any active test.':'Treat this as scoping/readiness only for now. Confirm who can authorize each asset, including cloud providers and third parties; no active testing until written authorization and rules of engagement are in place.';
    const reasons=[`Scope includes ${assets.map(v=>label('ptAssets',v).toLowerCase()).join(', ')} across ${label('ptScale',a.ptScale).toLowerCase()}.`,`The selected ${label('ptAccess',a.ptAccess).toLowerCase()} access level and ${label('ptEnvironment',a.ptEnvironment).toLowerCase()} environment shape the evidence and safe test plan.`,`Data sensitivity is recorded as ${a.ptData.map(v=>label('ptData',v).toLowerCase()).join(', ')}; test data handling and report access should be agreed in advance.`];
    const phases=[
      {title:'Scope & authorization',text:'Confirm asset owners, written permission, in-scope targets, exclusions, test window, rate limits, emergency contact and stop conditions.'},
      {title:'Test preparation',text:'Review architecture and access; prefer staging, create dedicated accounts and synthetic test data, agree evidence handling and retention.'},
      {title:'Controlled assessment',text:tools.map(t=>t.name).join(' + ')+' may assist only within the signed rules of engagement. A security professional validates findings; destructive checks and automated remediation are excluded unless separately approved.'},
      {title:'Report & retest',text:'Deliver an executive summary and technical findings with severity, impact, reproducible evidence and remediation guidance; retest fixes under a separate agreed scope.'}
    ];
    if(a.ptEnvironment==='production')phases[1].text='No staging environment is reported. First agree whether a safe test replica can be prepared; production testing requires explicit non-disruptive rules, rate limits, monitoring and an emergency stop contact.';
    else if(a.ptEnvironment==='notready')phases[1].text='The environment is not ready. Offer a readiness/scoping session and help prepare a test environment before active testing.';
    if(aiTarget)reasons.push('An AI feature is in scope; include its model/provider, connected data, user roles and any agent actions in a separately approved AI test plan.');
    if(needsSpecialist)reasons.push('Mobile and source-code work need specialist manual methods; automated tools alone are not a complete test.');
    const blocked=a.ptAuthorization!=='owned';
    const timing=blocked?'Recommended next step: a scoping and authorization-readiness session. Active testing waits until written permission and asset-specific rules of engagement are confirmed.':'This is a preliminary fit only. Discovery must confirm exact assets, approvals, safe test window, effort and fees before any active testing.';
    return{primary:'pentest',service:SERVICES.pentest,supporting:[],reasons,frameworks:[],timing,phases,ai:{items:[],deliverables:[]},pentest:{assets,tools,gate,blocked,needsSpecialist,aiTarget}};
  }
  function aiSummary(a){const rows=[['AI use',label('aiUse',a.aiUse)]];if(hasAIDetails(a)){
    for(const [key,title] of [['aiTypes','AI types'],['aiSource','AI sourcing'],['aiData','AI data categories']])rows.push([title,a[key].map(v=>label(key,v)).join(', ')]);
    rows.push(['AI hosting',label('aiHosting',a.aiHosting)],['AI governance',label('aiGovernance',a.aiGovernance)]);
    if(a.aiTypes.includes('agents'))rows.push(['Agent permissions / autonomy',label('aiAutonomy',a.aiAutonomy)]);
  }return rows;}
  function answerSummary(a){const base=[
    ['Company size',label('size',a.size)],['Sector',label('sector',a.sector)],['Markets',a.markets.map(v=>label('markets',v)).join(', ')],['Infrastructure',label('infrastructure',a.infrastructure)],['Primary priority',GOALS.find(g=>g.id===a.goal)?.title||'Not provided'],['Targets',a.frameworks.length?a.frameworks.map(v=>label('frameworks',v)).join(', '):'Identify during discovery'],['Security ownership',label('leadership',a.leadership)],['Program maturity',label('maturity',a.maturity)],['Evidence readiness',label('evidence',a.evidence)],['Technical assessment',label('technical',a.technical)],['Deadline',label('deadline',a.deadline)],...aiSummary(a)
  ];if(a.goal==='pentest')base.push(['Test asset types',a.ptAssets.map(v=>label('ptAssets',v)).join(', ')],['Approximate scope size',label('ptScale',a.ptScale)],['Architecture',a.ptArchitecture.map(v=>label('ptArchitecture',v)).join(', ')],['Implementation',label('ptImplementation',a.ptImplementation)],['Technology stack',a.ptStack.length?a.ptStack.map(v=>label('ptStack',v)).join(', '):'Not provided'],['Test access',label('ptAccess',a.ptAccess)],['Test environment',label('ptEnvironment',a.ptEnvironment)],['Data sensitivity',a.ptData.map(v=>label('ptData',v)).join(', ')],['Authorization status',label('ptAuthorization',a.ptAuthorization)]);return base;}
  function draft(a,c,example){
    const r=recommendation(a);
    return['VLK INFOSEC CONSULTING — ENGAGEMENT BRIEF', 'Direction · Structure · Assurance', example?'EXAMPLE QUESTIONNAIRE — review before using':'', '', 'CONTACT DETAILS',`Name: ${c.name.trim()}`,`Business email: ${c.email.trim()}`,`Company: ${c.company.trim()}`,`Role: ${c.role.trim()||'Not provided'}`,`Country: ${c.country.trim()||'Not provided'}`, '', 'ORGANIZATION & PRIORITIES',...answerSummary(a).map(([k,v])=>`${k}: ${v}`),'','RECOMMENDED STARTING ENGAGEMENT',r.service.name,r.service.type,r.service.description,'','WHY THIS FITS',...r.reasons.map(t=>`• ${t}`),'','PROPOSED DELIVERABLES',...r.service.deliverables.map(t=>`• ${t}`),...(r.pentest?['','TOOL FIT (PRELIMINARY)',...r.pentest.tools.map(t=>`${t.name}: ${t.fit}`),'Authorization gate: '+r.pentest.gate,'No scan runs from this questionnaire. Do not include domains, IP addresses or credentials in this brief.']:[]),'','SUPPORTING SERVICES',...(r.supporting.length?r.supporting.map(s=>`${SERVICES[s.id].name}: ${s.reason}`):['No additional service proposed at this stage.']),...(r.ai.items.length?['','AI ENGAGEMENT SCOPE',r.ai.title,...r.ai.items.map(t=>`• ${t}`),'AI-specific outputs:',...r.ai.deliverables.map(t=>`• ${t}`)]:[]),'','DELIVERY APPROACH',...r.phases.map((p,i)=>`${i+1}. ${p.title}: ${p.text}`),'',r.timing,'Scope, timing and fees are confirmed after discovery. Framework selections are intake targets; applicability is confirmed during scoping. Readiness support does not guarantee a certificate or an independent audit opinion.','','ADDITIONAL CONTEXT',c.message.trim()||'None provided.','','NEXT STEP TO DISCUSS','Confirm business sponsor, scope and target; agree NDA / Statement of Work and any testing authorization before work begins.','','PRIVATE DRAFT — prepared in this browser. No enquiry has been sent.'].join('\n');
  }
  function example(){return{...freshAnswers(),size:'small',sector:'saas',markets:['serbia','eu'],infrastructure:'cloud',goal:'certification',frameworks:['iso','soc'],leadership:'it',maturity:'partial',evidence:'partial',technical:'older',deadline:'quarter',aiUse:'none',ptAssets:['web','api'],ptScale:'single',ptArchitecture:['services'],ptAccess:'gray',ptEnvironment:'staging',ptData:['public'],ptAuthorization:'owned'};}
  return{OPTIONS,GOALS,SERVICES,freshAI,freshAnswers,freshContact,hasAIDetails,label,validateStep,validateContact,normalizeContact,emailOK,recommendation,aiScope,aiSummary,answerSummary,draft,example};
});
