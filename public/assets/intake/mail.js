(function(root){
 'use strict';
 root.VLKIntakeMail=function(){
  let id='',email='',busy=false,done=false,widget=null,scriptPromise=null;
  async function api(body){
   const response=await fetch('/api/intake',{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},credentials:'same-origin',cache:'no-store',...(body?{body:JSON.stringify(body)}:{})});
   let data;try{data=await response.json();}catch{throw Error('Online submission is unavailable. You can download your brief or contact VLK.');}
   if(!response.ok){const e=Error(data.error||'Unable to complete the request.');e.status=response.status;throw e;}return data;
  }
  async function securityToken(){
   if(location.protocol!=='https:')throw Error('Email confirmation requires the approved HTTPS website. You can still save your draft.');
   const config=await api();if(!config.enabled||!config.siteKey)throw Error('Online submission is not enabled. You can download your brief or use Start a conversation.');
   if(!window.turnstile){
    if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.onload=resolve;s.onerror=()=>{scriptPromise=null;reject(Error('The security check could not load. Please try again.'));};document.head.append(s);});
    await scriptPromise;
   }
   return new Promise((resolve,reject)=>{
    let settled=false;const timer=setTimeout(()=>finish(Error('Security check timed out. Please retry.')),120000);
    function finish(error,token){if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(token);}
    widget=window.turnstile.render('#intake-security-check',{sitekey:config.siteKey,action:'client-intake',callback:token=>finish(null,token),'error-callback':()=>finish(Error('Security check failed. Please retry.')),'expired-callback':()=>finish(Error('Security check expired. Please retry.'))});
   });
  }
  function removeWidget(){if(widget!==null){window.turnstile?.remove(widget);widget=null;}}
  return{
   pending:()=>Boolean(id),complete:()=>done,
   reset(){if(busy)return;id='';email='';removeWidget();},
   async request(address,website=''){
    if(busy||done)throw Error('An operation is already in progress or complete.');busy=true;id='';email='';
    try{const token=await securityToken();const result=await api({action:'request',email:address,website,turnstile:token});if(typeof result.id!=='string'||!/^[0-9a-f-]{36}$/.test(result.id))throw Error('Unable to start email confirmation. Please try again later.');id=result.id;email=address;return{pending:true};}
    finally{removeWidget();busy=false;}
   },
   async send({code,contact,assessments,confirmed=false,website=''}){
    if(busy||done)throw Error('An operation is already in progress or complete.');if(!id||contact.email!==email)throw Error('Request a new code for this email address.');if(!confirmed)throw Error('Confirm that you want to send your enquiry.');busy=true;
    try{await api({action:'submit',id,code,contact,assessments,confirmSend:true,website});done=true;id='';return{sent:true};}
    catch(e){if(!e.status||e.status>=500||e.status===409){id='';if(!e.status)throw Error('Delivery could not be confirmed. Please contact VLK rather than resending immediately.');}throw e;}
    finally{busy=false;}
   }
  };
 };
})(window);
