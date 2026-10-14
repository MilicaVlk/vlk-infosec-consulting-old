window.VLKFields=(()=>{
 const country=document.getElementById('country');if(!country)return;
 const countries=[...document.querySelectorAll('#country-options option')].map(x=>x.value);
 country.addEventListener('input',()=>country.setCustomValidity(''));
 return {normalize(fields){return fields;},validateStep(step){if(step.contains(country)&&country.value.trim()){
 const match=countries.find(n=>n.toLowerCase()===country.value.trim().toLowerCase());
 country.setCustomValidity(match?'':'Choose a listed country, Not sure or Other.');if(!match){country.reportValidity();return false;}country.value=match;
 }return true;}};
})();
