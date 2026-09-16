const path = require('node:path');
﻿const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',style:{},value:'',focus(){},querySelectorAll(){return[]}});return elements.get(s)};
const storage=new Map();const context=vm.createContext({document:{querySelector:element,querySelectorAll:()=>[],documentElement:{},addEventListener(){}},location:{hash:''},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout(){},Date,console});
storage.set('itqan-auth','true');
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/domain/performance.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/features/workspace.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),context);
vm.runInContext(`
for(const item of nav){page=item[0];render();if(!document.querySelector('#app').innerHTML.includes('<main'))throw Error('Page failed: '+page)}
if(status(kpis[0])!=='green'||status(kpis[3])!=='red')throw Error('Direction scoring incorrect');
if(severity(kpis[3]).indexOf('Critical')!==0)throw Error('Persistence escalation incorrect');
query='service';filter='All statuses';if(filtered().length!==2)throw Error('Search incorrect');
query='';filter='Off track';if(filtered().length!==1)throw Error('Status filtering incorrect');
detail('KPI-SRV-002');document.querySelector('#target-value').value='3';document.querySelector('#target-amber').value='3.5';document.querySelector('#target-form').onsubmit({preventDefault(){}});
if(kpis[3].target!==2)throw Error('Unapproved target applied');
const request=approvals[0];currentUserId='lead-1';decideRequest(request.id,'Approve','Department reviewed');currentUserId='strategy-2';decideRequest(request.id,'Approve','Strategy reviewed');
if(status(Data.at(kpis[3]))!=='green'||kpis[3].history.at(-1)!==2.8)throw Error('Target update changed an external actual');
if(Data.at(kpis[3],4).target!==2)throw Error('Historical target changed');
if(audit.length!==5)throw Error('Audit not written');
ar=true;render();if(document.documentElement.dir!=='rtl')throw Error('RTL failed');
`,context);
console.log('PASS: all 11 views, scoring, escalation, filters, target setup, read-only actuals, historical targets, audit and RTL.');
