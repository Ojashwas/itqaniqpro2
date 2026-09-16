const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',style:{},value:'',focus(){},querySelectorAll(){return[]}});return elements.get(s)};
const storage=new Map();const context=vm.createContext({document:{querySelector:element,querySelectorAll:()=>[],documentElement:{},addEventListener(){}},location:{hash:''},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout(){},Date,console});
storage.set('itqan-auth','true');
vm.runInContext(fs.readFileSync('data.js','utf8'),context);
vm.runInContext(fs.readFileSync('app.js','utf8'),context);
vm.runInContext(`
for(const item of nav){page=item[0];render();if(!document.querySelector('#app').innerHTML.includes('<main'))throw Error('Page failed: '+page)}
if(status(kpis[0])!=='green'||status(kpis[3])!=='red')throw Error('Direction scoring incorrect');
if(severity(kpis[3]).indexOf('Critical')!==0)throw Error('Persistence escalation incorrect');
query='service';filter='All statuses';if(filtered().length!==2)throw Error('Search incorrect');
query='';filter='Off track';if(filtered().length!==1)throw Error('Status filtering incorrect');
detail('KPI-SRV-002');document.querySelector('#actual').value='2';document.querySelector('#confidence').value='Validated';document.querySelector('#actual-form').onsubmit({preventDefault(){}});
if(status(kpis[3])!=='green'||kpis[3].history.at(-1)!==2)throw Error('Actual update failed');
if(audit.length!==3)throw Error('Audit not written');
ar=true;render();if(document.documentElement.dir!=='rtl')throw Error('RTL failed');
`,context);
console.log('PASS: all 10 views, directional scoring, critical escalation, search, status filter, actual update, audit and RTL.');
