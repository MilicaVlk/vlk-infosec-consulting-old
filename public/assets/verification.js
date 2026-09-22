// Local previews demonstrate the flow; hosted sites require the real API.
window.VLKVerification=(()=>{
 const local=location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname);
 let id='',email='',demoCode='',expires=0,widget=null,siteKey='',done=false;
 const form=document.querySelector('#contact-form');if(!form)return;
 const box=document.createElement('div');box.className='verification-panel';box.hidden=true;
 box.innerHTML='<div id="security-check"></div><div id="code-entry" hidden><label for="verification-code">Email verification code</label><input id="verification-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}"><button type="button" id="new-code" class="btn btn-outline">Use another email / request a new code</button></div><p id="verification-status" role="status" aria-live="polite"></p>';
 form.querySelector('.enquiry-actions').before(box);
 const status=box.querySelector('#verification-status'),entry=box.querySelector('#code-entry'),code=box.querySelector('input');
 form.querySelector('#email').addEventListener('input',reset);
 box.querySelector('#new-code').addEventListener('click',()=>{reset();const field=form.querySelector('#email');field.focus();field.select();});
 function reset(){id='';email='';demoCode='';entry.hidden=true;code.value='';status.textContent='';form.querySelector('#enquiry-submit').textContent='Verify email & send enquiry';if(widget!==null)window.turnstile?.reset(widget);}
 async function api(payload){const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to submit.');return d;}
 async function ensureWidget(){if(widget!==null)return; if(!siteKey){const r=await fetch('/api/contact');if(!r.ok)throw Error('Online submission is not configured yet. Please contact VLK InfoSec Consulting on LinkedIn.');siteKey=(await r.json()).siteKey;}
 if(!window.turnstile)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.onload=resolve;s.onerror=()=>reject(Error('Security check could not load.'));document.head.append(s);});widget=window.turnstile.render('#security-check',{sitekey:siteKey,action:'enquiry'});}
 return {async submit(fields){
  if(done)return;box.hidden=false;
  try{
   if(!id){
    if(local){email=fields.email;demoCode='123456';id='local-demo';expires=Date.now()+600000;status.textContent='LOCAL PREVIEW: no email was sent. Enter demo code 123456 to preview the next step.';}
    else{await ensureWidget();const token=window.turnstile.getResponse(widget);if(!token){status.textContent='Complete the security check, then select Verify email & send enquiry again.';return;}const r=await api({action:'request',email:fields.email,turnstile:token,website:fields.website||''});id=r.id;email=fields.email;status.textContent='Check your inbox for a six-digit code. It expires in 10 minutes. Your enquiry has not been sent yet.';}
    entry.hidden=false;form.querySelector('#enquiry-submit').textContent='Confirm code & send enquiry';code.focus();return;
   }
   if(email!==fields.email){reset();throw Error('Email changed. Request a new code.');}
   if(!/^\d{6}$/.test(code.value))throw Error('Enter the six-digit verification code.');
   if(local){if(code.value!==demoCode||Date.now()>expires)throw Error('Incorrect or expired demo code.');status.textContent='LOCAL PREVIEW COMPLETE: verification and submission demonstrated. Nothing was sent or saved.';}
   else{const clean={...fields};delete clean.website;delete clean['cf-turnstile-response'];await api({action:'submit',id,code:code.value,fields:clean,website:fields.website||''});status.textContent='Your email was verified and your enquiry was sent. Thank you.';}
   done=true;entry.hidden=true;form.dataset.submitted='true';
   if(widget!==null){window.turnstile?.remove(widget);widget=null;}
   box.querySelector('#security-check').hidden=true;
   for(const child of form.children){if(child!==box)child.hidden=true;}
   box.classList.add('verification-success');
   const title=document.createElement('h2');title.textContent=local?'Preview complete':'Thank you for getting in touch';title.tabIndex=-1;box.prepend(title);
   if(!local)status.textContent='Your email has been verified and your enquiry has been sent to VLK InfoSec Consulting. We will review your message and respond to the email address you provided.';
   title.focus();
  }catch(e){status.textContent=e.message;if(widget!==null&&!id)window.turnstile?.reset(widget);}
 }};
})();
