/* Shared calculations. Preserve precision until formatting; null means no observation. */
(function(root){
  const periods=['April 2026','May 2026','June 2026','July 2026','August 2026','September 2026'],latest=5;
  const finite=v=>typeof v==='number'&&Number.isFinite(v);
  let policy={green:95,amber:85,objectiveParents:[],kpiTypes:['Leading','Lagging']};
  function configure(next){if(!finite(next.green)||!finite(next.amber)||next.green>100||next.green<=next.amber||next.amber<0)throw Error('Use 0 ≤ Amber < Green ≤ 100 for aggregate boundaries.');policy={green:next.green,amber:next.amber,objectiveParents:next.objectiveParents||policy.objectiveParents,kpiTypes:[...new Set(['Leading','Lagging',...(next.lookups?.kpiTypes||[]),...(next.knownKpiTypes||[])])]};}
  const mean=values=>{const a=values.filter(finite);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
  const validActual=(k,v)=>finite(v)&&v>=0&&(k.unit!=='%'||v<=100)&&(k.unit!=='count'||Number.isInteger(v));
  const at=(k,i=latest)=>({...k,...(k.targetHistory?.[i]||{}),actual:k.history[i]??null,prior:k.history[i-1]??null,priorTarget:k.targetHistory?.[i-1]?.target??k.target,priorAmber:k.targetHistory?.[i-1]?.amber??k.amber,confidence:k.confidences?.[i]||'Not recorded',periodIndex:i});
  function setTarget(k,i,target,amber){
    if(i!==latest)throw Error('Targets for historical periods are read-only.');
    if(!finite(target)||target<=0||!validActual(k,target)||!validActual(k,amber))throw Error('Use a positive target and a valid amber boundary for this unit.');
    if(k.direction==='higher'?amber>=target:amber<=target)throw Error('Amber boundary must be worse than the target.');
    if(!k.targetHistory)k.targetHistory=periods.map(()=>({target:k.target,amber:k.amber}));
    k.targetHistory[i]={target,amber};k.target=target;k.amber=amber;
  }
  function status(k){if(!validActual(k,k.actual))return 'missing';return k.direction==='lower'?(k.actual<=k.target?'green':k.actual<=k.amber?'amber':'red'):(k.actual>=k.target?'green':k.actual>=k.amber?'amber':'red')}
  function score(k){if(status(k)==='missing')return null;if(k.actual===0&&k.direction==='lower')return 100;return Math.max(0,Math.min(100,(k.direction==='lower'?k.target/k.actual:k.actual/k.target)*100))}
  const avg=items=>mean(items.map(score));
  const aggregateStatus=v=>!finite(v)?'missing':v>=policy.green?'green':v>=policy.amber?'amber':'red';
  const published=(items,department='All departments',i=latest)=>items.filter(k=>!k.draft&&(k.createdIndex??0)<=i&&(department==='All departments'||k.dept===department)).map(k=>at(k,i));
  function summary(items){const c={total:items.length,green:0,amber:0,red:0,missing:0};items.forEach(k=>c[status(k)]++);return {...c,measured:c.total-c.missing,attention:c.amber+c.red+c.missing,departments:new Set(items.map(k=>k.dept)).size,goals:new Set(items.map(k=>policy.objectiveParents[k.goal]??k.goal)).size}}
  // Equal KPI weights within an objective, objective weights within a strategic goal, and goal weights overall.
  const overall=items=>mean([...new Set(items.map(k=>policy.objectiveParents[k.goal]??k.goal))].map(parent=>{const children=items.filter(k=>(policy.objectiveParents[k.goal]??k.goal)===parent);return mean([...new Set(children.map(k=>k.goal))].map(g=>avg(children.filter(k=>k.goal===g))))}));
  const trajectory=(items,department,end)=>periods.slice(0,end+1).map((_,i)=>overall(published(items,department,i)));
  function trend(k){if(!finite(k.actual)||!finite(k.prior))return 'unavailable';if(k.actual===k.prior)return 'stable';return(k.direction==='lower'?k.actual<k.prior:k.actual>k.prior)?'improving':'deteriorating'}
  function weights(items){if(!items.length)return {};const base=Math.floor(10000/items.length),rem=10000-base*items.length;return Object.fromEntries(items.map((k,i)=>[k.id,(base+(i<rem?1:0))/100]))}
  function breach(k,parentScore){const s=status(k);if(s==='missing')return {level:'Data gap',route:'KPI owner',risk:false};if(s==='green')return null;const prior=status({...k,actual:k.prior,target:k.priorTarget??k.target,amber:k.priorAmber??k.amber});const critical=s==='red'&&prior==='red'||finite(parentScore)&&parentScore<policy.green;return critical?{level:'Critical',route:'Executive sponsor',risk:true}:s==='red'?{level:'Material',route:'Objective owner',risk:false}:{level:'Minor',route:'KPI owner',risk:false}}
  const recoveryReady=(k,count=2)=>Number.isInteger(count)&&count>=2&&count<=latest+1&&Array.from({length:count},(_,n)=>status(at(k,latest-n))).every(s=>s==='green');
  function forecast(k){if(!finite(k.actual)||!finite(k.prior))return null;let v=Math.max(0,k.actual+k.actual-k.prior);if(k.unit==='%')v=Math.min(100,v);if(k.unit==='count')v=Math.round(v);return v}
  function recordActual(k,i,value,confidence){if(k.draft)throw Error('Approve the definition before recording an actual.');if(i!==latest)throw Error('Historical periods are read-only in this prototype.');if(!validActual(k,value))throw Error('Use a non-negative value, 0–100 for percentages, and whole numbers for counts.');if(!['Validated','Provisional','Estimated'].includes(confidence))throw Error('Select a valid confidence flag.');k.history[i]=value;k.confidences[i]=confidence;k.actual=value;k.prior=k.history[i-1]??null;k.confidence=confidence}
  function validateDefinition(k,goals){if(!['name','owner','source','definition','formula'].every(key=>typeof k[key]==='string'&&k[key].trim()))throw Error('Complete every required definition field.');if(!Number.isInteger(k.goal)||!goals[k.goal])throw Error('Select a valid parent objective.');if(!['higher','lower'].includes(k.direction))throw Error('Select a valid direction.');if(!['%','days','min','count','rate'].includes(k.unit))throw Error('Select a valid unit.');if(!finite(k.target)||k.target<=0||!validActual(k,k.target)||!validActual(k,k.amber)||(k.baseline!=null&&!validActual(k,k.baseline)))throw Error('Target must be positive. Values must respect the unit and its range.');if(k.direction==='higher'?k.amber>=k.target:k.amber<=k.target)throw Error('Amber boundary must be worse than target for the selected direction.');if(k.frequency!=='Monthly')throw Error('This prototype records monthly observations.');if(!policy.kpiTypes.includes(k.type))throw Error('Select a valid KPI type.')}
  function normalise(items){return items.map(k=>{const isNew=k.id.startsWith('KPI-NEW-');const history=Array.from({length:6},(_,i)=>isNew&&(i<latest||k.draft)?null:validActual(k,k.history?.[i])?k.history[i]:null);return {...k,history,createdIndex:k.createdIndex??(isNew?latest:0),baseline:k.baseline??k.history?.[0]??null,type:k.type||'Lagging',frequency:'Monthly',definition:k.definition||`Monthly measure of ${k.name.toLowerCase()}.`,formula:k.formula||'Reported value from the stated source for the reporting month.',confidences:history.map((v,i)=>v===null?'Not recorded':k.confidences?.[i]||(i===latest?k.confidence||'Validated':'Validated')),actual:history[latest],prior:history[latest-1]}})}
  const api={periods,latest,finite,mean,validActual,at,status,score,avg,aggregateStatus,published,summary,overall,trajectory,trend,weights,breach,recoveryReady,forecast,recordActual,setTarget,validateDefinition,normalise,configure};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.Data=api;
})(typeof globalThis!=='undefined'?globalThis:this);
