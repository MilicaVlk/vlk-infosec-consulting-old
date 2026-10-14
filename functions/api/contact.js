const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}});
const configured=e=>['DB','APP_ORIGIN','TURNSTILE_SITE_KEY','TURNSTILE_SECRET','RATE_SECRET','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','MAIL_FROM','MAIL_TO'].every(k=>e[k]);
const emailOK=s=>typeof s==='string'&&s.length<=120&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(s)&&!/[\r\n]/.test(s);
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
async function limited(env,key,now,max){
 const bucket=await hash(env.RATE_SECRET+':'+key+':'+Math.floor(now/3600));
 const r=await env.DB.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,now+3600).first();
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
  if(!configured(env))return reply({error:'Contact delivery is not configured yet. Please use LinkedIn.'},503);
  if(request.method==='GET')return reply({siteKey:env.TURNSTILE_SITE_KEY});
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(request.headers.get('Origin')!==env.APP_ORIGIN)return reply({error:'Invalid origin'},403);
  if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return reply({error:'JSON required'},415);
  if(Number(request.headers.get('Content-Length')||0)>16000)return reply({error:'Request too large'},413);
  // Bound the stream, including requests without Content-Length.
  const reader=request.body?.getReader();if(!reader)return reply({error:'Empty request'},400);
  let bytes=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>16000){await reader.cancel();return reply({error:'Request too large'},413);}parts.push(value);}
  const data=JSON.parse(new TextDecoder().decode(await new Blob(parts).arrayBuffer()));
  if(!data||typeof data!=='object'||data.website)return reply({error:'Invalid request'},400);
  const now=Math.floor(Date.now()/1000),ip=request.headers.get('CF-Connecting-IP');
  if(!ip)return reply({error:'Unavailable'},503);
  if(await limited(env,'ip:'+ip,now,30))return reply({error:'Too many requests. Try again later.'},429);
  await env.DB.batch([env.DB.prepare('DELETE FROM challenges WHERE expires < ?').bind(now),env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now)]);
  if(data.action==='request'){
   const email=typeof data.email==='string'?data.email.trim():'';
   if(!emailOK(email))return reply({error:'Enter a valid email address.'},400);
   if(typeof data.turnstile!=='string'||data.turnstile.length>2048)return reply({error:'Complete the security check.'},400);
   const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:data.turnstile,remoteip:ip}),signal:AbortSignal.timeout(10000)}).then(r=>r.json());
   if(!check.success||check.hostname!==new URL(env.APP_ORIGIN).hostname||check.action!=='enquiry')return reply({error:'Security check expired. Please retry.'},403);
   if(await limited(env,'email:'+email.toLowerCase(),now,3))return reply({error:'Too many code requests. Try again later.'},429);
   const id=crypto.randomUUID();let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294000000);const code=String(n%1000000).padStart(6,'0');
   await env.DB.prepare('INSERT INTO challenges(id,email,code_hash,expires) VALUES(?,?,?,?)').bind(id,email,await hash(env.RATE_SECRET+':'+id+':'+code),now+600).run();
   try{await mail(env,email,'Verify your VLK InfoSec Consulting enquiry',`Your verification code is ${code}. It expires in 10 minutes.\n\nEnter it on the VLK InfoSec Consulting website to send your enquiry. If you did not request this code, ignore this email.\nVLK InfoSec Consulting`);}catch{await env.DB.prepare('DELETE FROM challenges WHERE id=?').bind(id).run();return reply({error:'We could not send the code. Please try again later.'},503);}
   return reply({id});
  }
  if(data.action==='submit'){
   if(typeof data.id!=='string'||!/^[0-9a-f-]{36}$/.test(data.id)||typeof data.code!=='string'||!/^\d{6}$/.test(data.code))return reply({error:'Enter the six-digit code.'},400);
   const allowed={name:120,company:120,email:120,role:100,context:1200,service:80,goal:160,deadline:100,employees:50,sector:100,country:80,footprint:150,infrastructure:150,systems:50,team:120,evidence:150,scope:160};
   if(!data.fields||Array.isArray(data.fields)||typeof data.fields!=='object')return reply({error:'Invalid enquiry'},400);
   const fields={};for(const [k,v]of Object.entries(data.fields)){if(!Object.prototype.hasOwnProperty.call(allowed,k)||typeof v!=='string'||v.length>allowed[k]||/[\u0000]/.test(v))return reply({error:'Invalid enquiry field'},400);fields[k]=v.trim();}
   if(!fields.name||!fields.service||!emailOK(fields.email))return reply({error:'Complete the required fields.'},400);
   const attempted=await env.DB.prepare("UPDATE challenges SET attempts=attempts+1 WHERE id=? AND state='pending' AND expires>? AND attempts<5 RETURNING *").bind(data.id,now).first();
   if(!attempted||attempted.email!==fields.email||attempted.code_hash!==await hash(env.RATE_SECRET+':'+data.id+':'+data.code))return reply({error:'Invalid or expired code. Check it or request a new code.'},400);
   const claim=await env.DB.prepare("UPDATE challenges SET state='sending' WHERE id=? AND state='pending' RETURNING id").bind(data.id).first();
   if(!claim)return reply({error:'This code has already been used.'},409);
   try{await mail(env,env.MAIL_TO,'Verified website enquiry',Object.entries(fields).map(([k,v])=>`${k}: ${v}`).join('\n')+'\n\nEmail ownership verified for this submission.',fields.email);}catch{
    return reply({error:'Delivery could not be confirmed. Please contact VLK InfoSec Consulting on LinkedIn rather than resending immediately.'},503);
   }finally{await env.DB.prepare('DELETE FROM challenges WHERE id=?').bind(data.id).run();}
   return reply({ok:true});
  }
  return reply({error:'Unknown action'},400);
 }catch{return reply({error:'Unable to process this request. Please try again later.'},503);}
}
