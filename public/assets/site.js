const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
if(toggle){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
document.querySelectorAll('.nav-links a').forEach(link=>{if(new URL(link.href,window.location.href).pathname===window.location.pathname)link.setAttribute('aria-current','page');});

const enquiry=document.querySelector('#contact-form');
if(enquiry){
 const steps=[...enquiry.querySelectorAll('.enquiry-step')], back=document.querySelector('#enquiry-back'), next=document.querySelector('#enquiry-next'), send=document.querySelector('#enquiry-submit'), status=document.querySelector('#step-status'),service=document.querySelector('#service'),question=document.querySelector('#service-question'),feedback=document.querySelector('#enquiry-feedback');
 let current=0;const savedScopes={};const generalTopics=['general','partnership','speaking','existing','other'];const general=()=>generalTopics.includes(service.value);const activeSteps=()=>general()?[0,2]:[0,1,2];
 const questions={quickscan:['Assessment scope',['Not sure yet','Other','Whole organization at a high level','One business unit or location','One service or platform']],customer:['Customer request',['Not sure yet','Other','One security questionnaire','Tender / procurement evidence','Several customer requests']],governance:['Primary framework or regulation',['Not sure yet','Other','ISO/IEC 27001','NIS2','DORA','Serbian Information Security Law','NIST CSF','Multiple / other requirements']],fractional:['Security leadership priority',['Not sure yet','Other','Set direction and responsibilities','Coordinate an existing security program','Support management and technical teams','Prepare a longer-term roadmap']]};
 function updateScope(){question.replaceChildren();for(const id of ['goal','deadline']){const el=document.getElementById(id);el.disabled=general();el.closest('.field').hidden=general();}steps[1].disabled=general();document.getElementById('context').required=general();const config=questions[service.value];if(!config)return;const div=document.createElement('div');div.className='field';const label=document.createElement('label');label.htmlFor='scope';label.textContent=config[0];const el=document.createElement('select');el.id='scope';el.name='scope';config[1].forEach(v=>el.add(new Option(v,v)));if(savedScopes[service.value])el.value=savedScopes[service.value];el.addEventListener('change',()=>{savedScopes[service.value]=el.value;});div.append(label,el);question.append(div);}
 const selected=new URLSearchParams(location.search).get('service');if(Object.prototype.hasOwnProperty.call(questions,selected))service.value=selected;updateScope();service.addEventListener('change',()=>{updateScope();show();});
 const labels={service:'Enquiry topic',goal:'Desired outcome',scope:'Service scope',deadline:'Timing',employees:'Employees',sector:'Industry',country:'Country',footprint:'Organization footprint',infrastructure:'IT environment',systems:'Key systems',team:'Available team',evidence:'Documentation',name:'Name',company:'Organization',email:'Email address',role:'Role',context:'Additional context'};
 const limits={name:120,company:120,email:120,role:100,country:80,context:1200};
 function answers(){return Object.entries(window.VLKFields.normalize(Object.fromEntries(new FormData(enquiry)))).map(([k,v])=>[labels[k]||k,k==='service'?service.options[service.selectedIndex].text:String(v).trim()||'Not provided']);}
 function review(){const dl=document.querySelector('#answer-review');dl.replaceChildren();answers().filter(([k])=>!['Name','Organization','Email address','Role','Additional context','website','cf-turnstile-response'].includes(k)).forEach(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);});}
 function show(focus=false){steps.forEach((el,i)=>el.hidden=i!==current);back.hidden=current===0;next.hidden=current===2;send.hidden=current!==2;const active=activeSteps();status.textContent=`Step ${active.indexOf(current)+1} of ${active.length} · ${['Your need','Your organization','Your details'][current]}`;if(current===2)review();if(focus){status.tabIndex=-1;status.focus();}}
 function valid(){
  if(!window.VLKFields.validateStep(steps[current]))return false;
  feedback.textContent='';
  for(const field of steps[current].querySelectorAll('input,select,textarea')){
   if(field.disabled)continue;
   const value=field.value.trim();
   const limit=limits[field.name];
   field.value=value;
   field.setCustomValidity('');
   if(limit&&value.length>limit){field.setCustomValidity(`Please use no more than ${limit} characters.`);field.reportValidity();return false;}
   if(field.required&&value.length===0){field.setCustomValidity('Please complete this field.');field.reportValidity();return false;}
   if(field.minLength>0&&value.length>0&&value.length<field.minLength){field.setCustomValidity(`Please use at least ${field.minLength} characters.`);field.reportValidity();return false;}
   if(!field.checkValidity()){field.reportValidity();return false;}
  }
  return true;
 }
 next.addEventListener('click',()=>{if(valid()){current=activeSteps()[activeSteps().indexOf(current)+1];show(true);}});back.addEventListener('click',()=>{current=activeSteps()[activeSteps().indexOf(current)-1];show(true);});
 enquiry.addEventListener('submit',async e=>{e.preventDefault();if(current<2){if(valid()){current=activeSteps()[activeSteps().indexOf(current)+1];show(true);}return;}if(!valid())return;send.disabled=true;try{await window.VLKVerification.submit(window.VLKFields.normalize(Object.fromEntries(new FormData(enquiry))));}finally{if(!document.querySelector('#verification-status')?.textContent.includes('COMPLETE')&&!document.querySelector('#verification-status')?.textContent.includes('enquiry was sent'))send.disabled=false;}});

 show();
}
