/* ITQAN IQ prototype interface.
   Presentation only: every count, score, trend, threshold, weight and forecast shown
   here is produced by the shared calculation engine in domain/performance.js, so the numbers on
   screen always reconcile with the underlying observations. */
const icons={dashboard:'▦',strategy:'◇',kpi:'▤',data:'▥',ai:'✧',impact:'◎',actions:'☑',reports:'▧',admin:'⚙',approvals:'✓',audit:'◷'};
const nav=[['dashboard','Executive overview','نظرة تنفيذية'],['strategy','Strategy & objectives','الاستراتيجية والأهداف'],['kpi','KPI registry','سجل المؤشرات'],['data','Data flows','تدفقات البيانات'],['ai','Ask IQ','Ask IQ'],['impact','Impact & escalation','الأثر والتصعيد'],['actions','Plans & recovery','الخطط والتعافي'],['reports','Reports & analytics','التقارير والتحليلات'],['approvals','Approvals','الموافقات'],['admin','Administration','الإدارة'],['audit','Audit trail','سجل التدقيق']];
const goals=[{name:'A safer, more secure society',ar:'مجتمع أكثر أمناً وأماناً',icon:'◇',objective:'Enhance community safety',owner:'Brig. Saeed Al Mansoori'},{name:'World-class public services',ar:'خدمات عامة رائدة عالمياً',icon:'⌘',objective:'Deliver seamless digital services',owner:'Col. Maryam Al Nuaimi'},{name:'Safer roads, protected lives',ar:'طرق أكثر أماناً وحماية للأرواح',icon:'⤨',objective:'Reduce road incident impact',owner:'Col. Khalid Al Shamsi'},{name:'Future-ready institutional excellence',ar:'تميز مؤسسي مستعد للمستقبل',icon:'▱',objective:'Strengthen organisational capability',owner:'Dr. Aisha Al Marzooqi'}];
/* Actual and prior are always derived from history, never stored twice. */
const initialKpis=[
{id:'KPI-SEC-001',name:'Emergency response time',ar:'زمن الاستجابة للطوارئ',goal:0,dept:'Public Safety',target:6,amber:7,unit:'min',direction:'lower',type:'Lagging',owner:'Maj. Ahmed Al Zaabi',source:'Emergency Operations System',history:[6.3,6.1,5.9,5.8,5.5,5.2]},
{id:'KPI-SEC-002',name:'Community sense of safety',ar:'الشعور بالأمان في المجتمع',goal:0,dept:'Public Safety',target:97,amber:93,unit:'%',direction:'higher',type:'Lagging',owner:'Capt. Fatima Al Mazrouei',source:'Community Safety Survey',history:[94,94.6,95.1,95.8,96,96.4]},
{id:'KPI-SRV-001',name:'Digital service adoption',ar:'تبني الخدمات الرقمية',goal:1,dept:'Digital Services',target:92,amber:87,unit:'%',direction:'higher',type:'Leading',owner:'Col. Maryam Al Nuaimi',source:'Client Service Analytics',history:[86,88,90,92.8,93.5,94.2]},
{id:'KPI-SRV-002',name:'Service completion time',ar:'زمن إنجاز الخدمة',goal:1,dept:'Digital Services',target:2,amber:2.4,unit:'days',direction:'lower',type:'Lagging',owner:'Maj. Omar Al Ketbi',source:'Service Management Platform',history:[2.1,2.2,2.3,2.6,2.7,2.8]},
{id:'KPI-TRF-001',name:'Road fatalities per 100k population',ar:'وفيات الطرق لكل مئة ألف نسمة',goal:2,dept:'Traffic & Licensing',target:3,amber:3.5,unit:'rate',direction:'lower',type:'Lagging',owner:'Col. Khalid Al Shamsi',source:'Traffic Intelligence System',history:[4.1,3.9,3.7,3.4,3.3,3.1]},
{id:'KPI-TRF-002',name:'Traffic incident clearance',ar:'زمن إزالة الحوادث المرورية',goal:2,dept:'Traffic & Licensing',target:20,amber:23,unit:'min',direction:'lower',type:'Leading',owner:'Capt. Hamad Al Ameri',source:'Traffic Intelligence System',history:[24,22,21,19,19,18]},
{id:'KPI-INS-001',name:'Workforce readiness index',ar:'مؤشر جاهزية القوى العاملة',goal:3,dept:'Institutional Development',target:90,amber:83,unit:'%',direction:'higher',type:'Leading',owner:'Dr. Aisha Al Marzooqi',source:'Learning & Development System',history:[79,81,83,86,88,89]},
{id:'KPI-INS-002',name:'Data quality compliance',ar:'الامتثال لجودة البيانات',goal:3,dept:'Institutional Development',target:98,amber:94,unit:'%',direction:'higher',type:'Lagging',owner:'Lt. Noor Al Hammadi',source:'Data Governance Catalogue',history:[94,95,96,98,98.2,98.5]}];
const seedActions=[{id:1,title:'Accelerate service backlog clearance',kpi:'KPI-SRV-002',owner:'Maj. Omar Al Ketbi',due:'2026-09-14',effect:'Reduce completion time to 2 days',status:'Open'},{id:2,title:'Expand road safety awareness campaign',kpi:'KPI-TRF-001',owner:'Col. Khalid Al Shamsi',due:'2026-09-21',effect:'Reduce fatalities to 3 or fewer per 100k',status:'Open'},{id:3,title:'Complete specialist readiness programme',kpi:'KPI-INS-001',owner:'Dr. Aisha Al Marzooqi',due:'2026-09-25',effect:'Achieve 90% workforce readiness',status:'Open'}];
const seedAudit=[{event:'August actuals validated',actor:'Data Steward',time:'2026-09-07T05:42:00.000Z'},{event:'Service completion breach recommends executive sponsor review (simulation)',actor:'Scoring engine (simulated)',department:'Digital Services',time:'2026-09-07T05:40:00.000Z'}];

const STORE='itqan-demo-v1';
/* Stored workspaces are stamped with the seed generation they were created from, so a
   payload saved by a differently branded build is discarded rather than restored into
   the ITQAN IQ shell with foreign goals, KPIs and departments. */
const SEED='itqan-iq';
let saved=null;try{const restored=JSON.parse(localStorage.getItem(STORE));if(restored&&restored.seed===SEED)saved=restored}catch{}
const defaultConfig={orgName:'CONFIDENTIAL CLIENT',strategyLabel:'CLIENT PERFORMANCE · STRATEGY 2026–2031',defaultLanguage:'en',landingPage:'dashboard',green:95,amber:85,approvalDays:3,recoveryPeriods:2,reviewCadence:'Weekly',defaultPriority:'Medium',planDueDays:14,notifyApprovals:true,notifyReviews:true,notifyPerformance:true};
let appConfig={...defaultConfig,...saved?.appConfig,departmentOwners:{...saved?.appConfig?.departmentOwners},sourceProfiles:{...saved?.appConfig?.sourceProfiles}};
appConfig.lookups={...defaultLookups(),...saved?.appConfig?.lookups};
Data.configure(appConfig);
if(Array.isArray(saved?.goals)&&saved.goals.length>=goals.length)goals.splice(0,goals.length,...saved.goals);
let strategicGoals=Array.isArray(saved?.strategicGoals)?saved.strategicGoals:goals.map((g,i)=>({id:'SG-'+(i+1),name:g.name,ar:g.ar,owner:g.owner,icon:g.icon,description:''}));
goals.forEach((g,i)=>{g.strategicGoalId=g.strategicGoalId||strategicGoals[i]?.id});
Data.configure({...appConfig,objectiveParents:goals.map(g=>g.strategicGoalId)});
let kpis=Data.normalise(saved&&Array.isArray(saved.kpis)?saved.kpis:initialKpis);
let actions=saved&&Array.isArray(saved.actions)?saved.actions:seedActions.map(a=>({...a}));
actions=actions.map(a=>({priority:'Medium',milestones:[],notes:[],history:[],evidence:'',plan:{},reviews:[],revision:0,...a,planType:a.planType||'Recovery plan',approvalStatus:a.approvalStatus||'Draft',status:a.approvalStatus?a.status:'Open'}));
let actionQuery='',actionFilter='All',actionOwner='All',actionPriority='All';
let audit=saved&&Array.isArray(saved.audit)?saved.audit:seedAudit.map(a=>({...a}));
let page='dashboard',ar=(localStorage.getItem('itqan-language')||appConfig.defaultLanguage)==='ar',periodIndex=Data.latest,reportingPeriodIndex=Data.latest,department='All departments',filter='All statuses',query='';
/* Hash routing keeps each view addressable, so a view can be bookmarked or shared, browser
   Back and Forward move between views, and a refresh returns to where you were. */
const pages=nav.map(n=>n[0]);
const pageFromHash=()=>{const id=typeof location==='undefined'?'':String(location.hash||'').replace(/^#\/?/,'');return pages.includes(id)?id:null};
page=pageFromHash()||page;
/* Demo sign-in gate. The prototype has no identity backend; only assigned demo accounts establish a local
   session. Credential and UAE PASS forms explain their unconfigured connection. */
const AUTH='itqan-auth';
let authenticated=localStorage.getItem(AUTH)==='true';

/* ---------- shared helpers ---------- */
const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=(en,arabic)=>ar?arabic:en;
const name=k=>ar?k.ar||k.name:k.name;
const finite=Data.finite;
const status=k=>Data.status(k);
const score=k=>Data.score(k);
const avg=list=>Data.avg(list);
const overall=list=>Data.overall(list);
const period=()=>localizeText(Data.periods[periodIndex]);
const shortMonth=i=>localizeText(Data.periods[i].slice(0,3));
const isCurrent=()=>periodIndex===Data.latest;
/* Every view reads its rows from the same scoped, period-resolved projection. */
const scoped=(i=periodIndex,dept=department)=>Data.published(visibleKpis(),globalAccess()?dept:currentUser()?.department,i);
const goalItems=(goal,i=periodIndex)=>scoped(i).filter(k=>k.goal===goal);
const health=goal=>avg(goalItems(goal));
const departments=()=>globalAccess()?[...allDepartments].sort():[currentUser()?.department].filter(Boolean);
const raw=id=>visibleKpis().find(k=>k.id===id);
const displayNumber=v=>new Intl.NumberFormat(ar?'ar-AE-u-nu-arab':'en-GB',{maximumFractionDigits:2,useGrouping:false}).format(v);
const pct=v=>finite(v)?`${displayNumber(Math.round(v))}${ar?'٪':'%'}`:'—';
const width=v=>finite(v)?Math.round(Math.max(0,Math.min(100,v))*10)/10:0;
const trimNum=v=>finite(v)?String(Number(v.toFixed(2))):'—';
const unitSuffix={'%':'%',days:' days',min:' min',count:'',rate:' per 100k'};
const fmt=(v,unit)=>finite(v)?`${ar?displayNumber(v):trimNum(v)}${ar?(unit==='%'?'٪':unit==='count'?'':` ${localizeText(unitSuffix[unit]?.trim()||unit)}`):(unitSuffix[unit]===undefined?` ${unit}`:unitSuffix[unit])}`:'—';
const value=k=>fmt(k.actual,k.unit);
const targetText=k=>fmt(k.target,k.unit);
const statusText={green:['On track','على المسار'],amber:['At risk','معرض للخطر'],red:['Off track','خارج المسار'],missing:['No data','لا توجد بيانات']};
const statusFilters={'On track':'green','At risk':'amber','Off track':'red','No data':'missing'};
const pill=s=>`<span class="pill ${s}">${t(...statusText[s])}</span>`;
const goalPill=v=>pill(Data.aggregateStatus(v));
const trendText={improving:['Improving','تحسن'],deteriorating:['Deteriorating','تراجع'],stable:['Unchanged','مستقر'],unavailable:['No comparison','لا توجد مقارنة']};
const trendMark={improving:'↗',deteriorating:'↘',stable:'→',unavailable:'·'};
const plural=(n,word)=>{
  if(ar){
    const forms={entry:['سجل','سجلان','سجلات','سجلاً'],issue:['حالة','حالتان','حالات','حالة'],department:['إدارة','إدارتان','إدارات','إدارة'],objective:['هدف تشغيلي','هدفان تشغيليان','أهداف تشغيلية','هدفاً تشغيلياً'],KPI:['مؤشر أداء','مؤشرا أداء','مؤشرات أداء','مؤشر أداء'],action:['إجراء','إجراءان','إجراءات','إجراءً'],measure:['مؤشر','مؤشران','مؤشرات','مؤشراً']};
    const f=forms[word];if(f)return n===1?f[0]:n===2?f[1]:`${displayNumber(n)} ${n>=3&&n<=10?f[2]:f[3]}`;
  }
  if(n===1)return `${n} ${word}`;
  return `${n} ${/[^aeiou]y$/.test(word)?`${word.slice(0,-1)}ies`:/(?:s|sh|ch|x|z)$/.test(word)?`${word}es`:`${word}s`}`;
};
const delta=(now,then)=>finite(now)&&finite(then)?now-then:null;
const deltaText=d=>!finite(d)?'—':`${d>0?'↗ +':d<0?'↘ ':'→ '}${Math.abs(Math.round(d*10)/10)}`;

function persist(event,eventDepartment){
  if(event)audit.unshift({event,actor:currentUser()?.name||'Demo user',actorId:currentUser()?.id,department:eventDepartment||(globalAccess()?(department==='All departments'?null:department):currentUser()?.department),time:new Date().toISOString()});
  localStorage.setItem(STORE,JSON.stringify({seed:SEED,kpis,actions,audit,users,approvals,appConfig,goals,strategicGoals,orgDepartments:allDepartments}));
}
function toast(msg){$('#toast').textContent=localizeText(msg);$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3500)}

/* Roles and workflow are simulated locally. Production requires server enforcement. */
const roleNames={contributor:'Department Contributor',lead:'Department Approver',strategy:'Strategy Team',admin:'Administrator'};
const allDepartments=[...new Set([...initialKpis.map(k=>k.dept),...(saved?.orgDepartments||[]),...kpis.map(k=>k.dept)])];
let users=saved?.users||[{id:'strategy-1',name:'Strategy reviewer',email:'strategy@demo.local',role:'strategy',department:'',active:true},{id:'strategy-2',name:'Strategy reviewer 2',email:'strategy2@demo.local',role:'strategy',department:'',active:true},{id:'admin-1',name:'Workspace administrator',email:'admin@demo.local',role:'admin',department:'',active:true},...allDepartments.flatMap((department,i)=>[{id:`owner-${i}`,name:`${department} contributor`,email:`owner${i+1}@demo.local`,role:'contributor',department,active:true},{id:`lead-${i}`,name:`${department} approver`,email:`lead${i+1}@demo.local`,role:'lead',department,active:true}])];
let currentUserId=localStorage.getItem('itqan-user')||'strategy-1';
const currentUser=()=>users.find(u=>u.id===currentUserId&&u.active);
const globalAccess=()=>['strategy','admin'].includes(currentUser()?.role);
const canReadKpi=k=>!!k&&!!currentUser()&&(globalAccess()||k.dept===currentUser().department);
const visibleKpis=()=>kpis.filter(canReadKpi);
const isActionPlan=a=>a?.planType==='Action plan';
const planGoal=a=>a?.kpi?kpis.find(k=>k.id===a.kpi)?.goal:a?.goal;
const planDepartment=a=>a?.kpi?kpis.find(k=>k.id===a.kpi)?.dept:a?.department;
const canReadPlan=a=>!!a&&!!goals[planGoal(a)]&&allDepartments.includes(planDepartment(a))&&!!currentUser()&&(globalAccess()||planDepartment(a)===currentUser().department);
const visibleActions=()=>actions.filter(canReadPlan);
const assertPlanWrite=a=>{if(!canWrite()||!canReadPlan(a))throw Error('Your role cannot change this department’s plans.');};
const recoveryEligible=k=>!!k&&!k.draft&&['amber','red'].includes(Data.status(Data.at(k,Data.latest)));
const recoveryTrigger=k=>{const v=Data.at(k,Data.latest);return {period:Data.periods[Data.latest],actual:v.actual,target:v.target,amber:v.amber,unit:v.unit,status:status(v),source:v.source};};
const canWrite=()=>!!currentUser()&&currentUser().role!=='admin';
const assertWrite=k=>{if(!canWrite()||!canReadKpi(k))throw Error('Your role cannot change this department’s records.');};
const visibleAudit=()=>audit.filter(e=>globalAccess()||e.department===currentUser()?.department||e.actorId===currentUser()?.id);
let approvals=saved?.approvals||[];
let approvalFilter='All';
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const visibleApprovals=()=>approvals.filter(r=>globalAccess()||r.department===currentUser()?.department);
const pendingRequest=(entity,id)=>approvals.find(r=>r.entity===entity&&String(r.entityId)===String(id)&&['Department review','Strategy review'].includes(r.status));
const requestEntity=r=>r.entity==='KPI'?kpis.find(k=>k.id===r.entityId):actions.find(a=>a.id===r.entityId);
const entityVersion=e=>e?.version||0;
const canDecide=r=>!!currentUser()&&r.requesterId!==currentUser().id&&(r.status==='Department review'?currentUser().role==='lead'&&currentUser().department===r.department:r.status==='Strategy review'&&currentUser().role==='strategy');
function submitRequest(type,entity,record,proposed,summary){
  const k=entity==='KPI'?record:{dept:planDepartment(record)};if(entity==='KPI')assertWrite(k);else assertPlanWrite(record);
  if(pendingRequest(entity,record.id))throw Error('A request is already awaiting approval for this record.');
  const request={id:`REQ-${Date.now()}-${approvals.length+1}`,type,entity,entityId:record.id,department:k.dept,summary,proposed:JSON.parse(JSON.stringify(proposed)),before:JSON.parse(JSON.stringify(record)),baseVersion:entityVersion(record),requesterId:currentUser().id,requester:currentUser().name,status:'Department review',submittedAt:new Date().toISOString(),stageDueAt:new Date(Date.now()+appConfig.approvalDays*86400000).toISOString(),decisions:[]};
  approvals.unshift(request);persist(`${type} submitted: ${summary}`,k.dept);return request;
}
function decideRequest(id,decision,comment){
  const r=approvals.find(r=>r.id===id);if(!r||!canDecide(r))throw Error('This request is not assigned to your approval role, or you submitted it yourself.');
  if(!['Approve','Reject'].includes(decision)||!comment.trim())throw Error('Add a decision note.');
  const record=requestEntity(r);if(decision==='Approve'&&record&&r.department!==(r.entity==='KPI'?record.dept:planDepartment(record)))throw Error('The record department has changed. Reject this request and submit a fresh version.');if(decision==='Approve'&&(!record||entityVersion(record)!==r.baseVersion))throw Error('This record has changed. Reject this request and submit a fresh version.');
  if(decision==='Approve'&&r.status==='Strategy review'){
    if(r.type==='KPI publication'){Data.validateDefinition(record,goals);record.draft=false;record.createdIndex=Data.latest;}
    else if(r.type==='KPI amendment'){const proposed={...record,...r.proposed};Data.validateDefinition(proposed,goals);Object.assign(record,r.proposed);record.definitionVersion=(record.definitionVersion||1)+1;}
    else if(r.type==='Target change')Data.setTarget(record,r.proposed.period,r.proposed.target,r.proposed.amber);
    else if(r.type==='Plan approval'||r.type==='Plan amendment'){
      const candidate={...record,...r.proposed};if(planGaps(candidate).length||candidate.milestones.some(m=>!m.owner?.trim()||!validDate(m.due)||m.due>candidate.due))throw Error('The corrective plan and milestone assignments must be complete.');
      Object.assign(record,JSON.parse(JSON.stringify(r.proposed)),{approvalStatus:'Approved'});
    }else if(r.type==='Plan closure'||r.type==='Plan reopening'){
      applyingApproval=true;try{applyTransition(record,r.type==='Plan closure'?'Closed':'In progress',r.proposed.evidence)}finally{applyingApproval=false}
    }else throw Error('Unknown request type.');
    record.version=entityVersion(record)+1;if(r.entity==='Plan')record.history.unshift({event:r.type+' approved',time:new Date().toISOString(),actor:currentUser().name});r.status='Approved';
  }else r.status=decision==='Reject'?'Rejected':'Strategy review';
  if(r.status==='Strategy review'&&decision==='Approve')r.stageDueAt=new Date(Date.now()+appConfig.approvalDays*86400000).toISOString();
  r.decisions.push({decision,note:comment.trim(),actor:currentUser().name,actorId:currentUser().id,time:new Date().toISOString()});
  persist(`${r.id}: ${decision}; ${r.status}; ${comment.trim()}`,r.department);
}
function requestStatus(entity,id){
  const r=visibleApprovals().find(r=>r.entity===entity&&String(r.entityId)===String(id));
  return r?`<div class="approval-status"><span class="pill ${r.status==='Approved'?'green':r.status==='Rejected'?'red':'amber'}">${escapeHtml(r.status)}</span><button type="button" data-request="${r.id}">${t('View approval','عرض الموافقة')} →</button></div>`:'';
}
function reviewFields(value){
  if(value===null||value===undefined)return '—';
  if(typeof value!=='object')return escapeHtml(value);
  if(Array.isArray(value))return value.length?`<ol>${value.map(v=>`<li>${reviewFields(v)}</li>`).join('')}</ol>`:'—';
  const labels={rootCause:'Root cause',correction:'Corrective steps',prevention:'Prevention',successCriteria:'Success criteria',reviewer:'Review owner',nextReview:'Next review',due:'Due date',target:'Target',amber:'Amber boundary',effect:'Expected outcome',planType:'Plan type',title:'Title',owner:'Owner',plan:'Plan details',milestones:'Milestones',evidence:'Evidence',period:'Reporting period',priority:'Priority'};
  return `<dl class="approval-fields">${Object.entries(value).filter(([key])=>!['history','confidences','notes','closure','targetHistory','prior','version','revision','createdIndex','periodIndex','requesterId'].includes(key)).map(([key,v])=>`<dt>${escapeHtml(labels[key]||key.replace(/([A-Z])/g,' $1'))}</dt><dd>${key==='period'&&typeof v==='number'?escapeHtml(Data.periods[v]||v):reviewFields(v)}</dd>`).join('')}</dl>`;
}
function approvalDetail(id){
  const r=visibleApprovals().find(r=>r.id===id);if(!r)return toast('Request unavailable for this role.');
  setDrawerRoute('request:'+id,()=>approvalDetail(id));
  drawer(t('Approval request','طلب موافقة'),`<p class="eyebrow">${escapeHtml(r.id)} · ${escapeHtml(r.type)}</p><h3>${escapeHtml(r.summary)}</h3><p>${escapeHtml(r.department)} · ${escapeHtml(r.requester)}</p><div class="approval-route"><span>1. Department review</span><span>→</span><span>2. Strategy review</span><span>→</span><span>Applied</span></div><span class="pill amber">${escapeHtml(r.status)}</span><p class="muted">Review deadline: ${r.stageDueAt?escapeHtml(new Date(r.stageDueAt).toLocaleDateString(ar?'ar-AE':'en-GB')):'Not set for this earlier request'}${['Department review','Strategy review'].includes(r.status)&&r.stageDueAt&&Date.parse(r.stageDueAt)<Date.now()?' · Overdue':''}</p>${r.status==='Department review'&&!users.some(u=>u.active&&u.role==='lead'&&u.department===r.department&&u.id!==r.requesterId)?'<p class="approval-warning">An administrator must assign another department approver. You cannot approve your own request.</p>':''}<p class="muted">${t('The proposed change takes effect only after both approvals.','يسري التغيير المقترح بعد الموافقتين فقط.')}</p><details><summary>${t('Current / previous record','السجل الحالي / السابق')}</summary>${reviewFields(r.before)}</details><h3>${t('Submitted for approval','المقدم للموافقة')}</h3>${reviewFields(r.proposed)}<h3>${t('Decision history','سجل القرارات')}</h3>${r.decisions.map(d=>`<div class="action-history"><strong>${escapeHtml(d.actor)} · ${escapeHtml(d.decision)}</strong><p>${escapeHtml(d.note)}</p><small>${escapeHtml(d.time)}</small></div>`).join('')||'<p>No decisions yet.</p>'}${canDecide(r)?`<form id="approval-decision"><label for="decision-note">${t('Decision note','ملاحظة القرار')}</label><textarea id="decision-note" required maxlength="2000"></textarea><p id="decision-error" role="alert"></p><div class="connection-buttons"><button type="submit" value="Approve" class="primary">${t('Approve','موافقة')}</button><button type="submit" value="Reject">${t('Return for changes','إعادة للتعديل')}</button></div></form>`:`<p class="muted">${t('Only the assigned approver can decide. Requesters cannot approve their own requests.','يمكن للموافق المختص اتخاذ القرار. لا يمكن لمقدم الطلب اعتماد طلبه.')}</p>`}${r.status==='Rejected'&&r.requesterId===currentUser()?.id&&canWrite()?`<button id="revise-request" class="primary">${t('Revise and resubmit','تعديل وإعادة إرسال')}</button>`:''}<button id="approval-back">${t('Back to approvals','العودة للموافقات')}</button>`);
  if(canDecide(r))$('#approval-decision').onsubmit=e=>{e.preventDefault();try{decideRequest(r.id,e.submitter?.value||'Approve',$('#decision-note').value);render();approvalDetail(r.id)}catch(err){$('#decision-error').textContent=err.message}};
  if($('#revise-request'))$('#revise-request').onclick=()=>{if(r.type==='Target change'){detail(r.entityId);if($('#target-value')){$('#target-value').value=r.proposed.target;$('#target-amber').value=r.proposed.amber}}else if(r.type==='KPI publication')register(r.entityId);else if(r.type==='KPI amendment')kpiAmendment(r.entityId,r.proposed);else{actionDetail(r.entityId,r.type==='Plan amendment'?r.proposed:undefined);if(r.proposed.evidence&&$('#recovery-evidence'))$('#recovery-evidence').value=r.proposed.evidence}};
  $('#approval-back').onclick=()=>{close();go('approvals')};
}
function approvalsView(){
  const list=visibleApprovals().filter(r=>approvalFilter==='All'||(approvalFilter==='My review'?canDecide(r):approvalFilter==='My submissions'?r.requesterId===currentUser()?.id:approvalFilter==='Pending'?['Department review','Strategy review'].includes(r.status):r.status===approvalFilter));
  return `<section class="panel connection-intro"><h2>${t('One approval path','مسار موافقة واحد')}</h2><p>Draft → Department review → Strategy review → Approved</p><p class="muted">${t('KPI publication, target changes, plan approval, amendments, closure and reopening follow this path. Progress notes and monitoring are recorded within an approved plan.','نشر المؤشرات وتغيير المستهدفات واعتماد الخطط وتعديلها وإغلاقها وإعادة فتحها تتبع هذا المسار. تُسجل المتابعة ضمن خطة معتمدة.')}</p></section><div class="filterbar"><label for="approval-filter">${t('Show requests','عرض الطلبات')}</label><select id="approval-filter">${['All','My review','My submissions','Pending','Approved','Rejected'].map(v=>`<option${v===approvalFilter?' selected':''}>${v}</option>`).join('')}</select><span role="status">${list.length} ${t('requests','طلبات')}</span></div><div class="approval-list">${list.map(r=>`<article class="panel pad"><div class="connection-section-title"><span class="pill ${r.status==='Approved'?'green':r.status==='Rejected'?'red':'amber'}">${escapeHtml(r.status)}</span>${canDecide(r)?'<strong>Your decision needed</strong>':''}</div><h3>${escapeHtml(r.summary)}</h3><p>${escapeHtml(r.type)} · ${escapeHtml(r.department)}</p><small>${escapeHtml(r.requester)} · ${escapeHtml(new Date(r.submittedAt).toLocaleString())}</small>${['Department review','Strategy review'].includes(r.status)&&r.stageDueAt?`<small>Review by ${escapeHtml(new Date(r.stageDueAt).toLocaleDateString(ar?'ar-AE':'en-GB'))}${Date.parse(r.stageDueAt)<Date.now()?' · Overdue':''}</small>`:''}<button data-request="${r.id}">${t('Review request','مراجعة الطلب')} →</button></article>`).join('')||`<p class="empty">${t('No approval requests in your scope.','لا توجد طلبات موافقة ضمن نطاقك.')}</p>`}</div>`;
}
function bindGovernance(){if($('#approval-filter'))$('#approval-filter').onchange=e=>{approvalFilter=e.target.value;render()};document.querySelectorAll('[data-request]').forEach(el=>el.onclick=()=>approvalDetail(el.dataset.request));if($('#create-menu'))$('#create-menu').onclick=createMenu;}
function createMenu(){
  if(!canWrite())return;
  setDrawerRoute('create',createMenu);
  drawer(t('Create','إنشاء'),`<p>${t('Register a KPI or create a plan. Actions support an objective or KPI. Recovery starts from a KPI below target.','اختر ما تريد إنشاءه. ترتبط كل خطة بمؤشر وهدفه.')}</p><div class="creation-choices"><button id="create-kpi-choice"><strong>${t('Register KPI','تسجيل مؤشر')}</strong><small>Objective → Definition & targets → Submit for approval</small></button><button id="create-action-choice"><strong>Create action plan</strong><small>Objective or KPI → Task, owner & deadline → Approval → Delivery</small></button><button id="create-recovery-choice"><strong>Create recovery plan</strong><small>Choose an Amber or Red KPI, then build its recovery plan.</small></button></div>`);
  $('#create-kpi-choice').onclick=register;$('#create-action-choice').onclick=()=>actionForm(undefined,undefined,'Action plan');$('#create-recovery-choice').onclick=()=>{linkedActionKpi=linkedActionGoal='';recoveryStart()};
}
function updateAccount(id,values){
  if(currentUser()?.role!=='admin')throw Error('Only administrators can manage accounts.');
  if(!values.name.trim()||!/^\S+@[^\s@]+\.[^\s@]+$/.test(values.email)||!Object.hasOwn(roleNames,values.role))throw Error('Complete name, email and role.');
  if(['lead','contributor'].includes(values.role)&&!allDepartments.includes(values.department))throw Error('Select a department.');
  if(users.some(u=>u.id!==id&&u.email.toLowerCase()===values.email.toLowerCase()))throw Error('This email already exists.');
  if(id===currentUserId&&(values.role!=='admin'||!values.active))throw Error('You cannot remove your own administrator access.');
  const account=users.find(u=>u.id===id),payload={...values,department:['lead','contributor'].includes(values.role)?values.department:''};
  if(account)Object.assign(account,payload);else users.push({id:'user-'+Date.now(),...payload});persist('Account role assignment updated: '+values.email);
}
function accountForm(id){
  if(currentUser()?.role!=='admin')return;const account=users.find(u=>u.id===id)||{name:'',email:'',role:'contributor',department:allDepartments[0],active:true};
  drawer('Account & role assignment',`<form class="detail-section" id="account-form"><label for="account-name">Name</label><input id="account-name" required value="${escapeHtml(account.name)}"><label for="account-email">Email</label><input id="account-email" type="email" required value="${escapeHtml(account.email)}"><label for="account-role">Role</label><select id="account-role">${Object.entries(roleNames).map(([key,label])=>`<option value="${key}"${account.role===key?' selected':''}>${label}</option>`).join('')}</select><label for="account-department">Department (department roles only)</label><select id="account-department">${allDepartments.map(v=>`<option${account.department===v?' selected':''}>${escapeHtml(v)}</option>`).join('')}</select><label class="milestone-row"><input type="checkbox" id="account-active" ${account.active?'checked':''}>Active account</label><p id="account-error" role="alert"></p><button class="primary">Save account</button></form>`);
  $('#account-form').onsubmit=e=>{e.preventDefault();try{updateAccount(id,{name:$('#account-name').value.trim(),email:$('#account-email').value.trim(),role:$('#account-role').value,department:$('#account-department').value,active:$('#account-active').checked});close();render()}catch(err){$('#account-error').textContent=err.message}};
}
function adminUsersPanel(){return `<section class="panel"><div class="panel-head"><h2>Accounts & role assignments</h2><button class="primary" id="add-account">＋ Add account</button></div><div class="table-wrap"><table><thead><tr><th>Account</th><th>Role</th><th>Data access</th><th>Status</th><th>Manage</th></tr></thead><tbody>${users.map(u=>`<tr><td>${escapeHtml(u.name)}<small>${escapeHtml(u.email)}</small></td><td>${roleNames[u.role]}</td><td>${escapeHtml(u.department||'All departments')}</td><td>${u.active?'Active':'Inactive'}</td><td><button data-account="${u.id}">Edit</button></td></tr>`).join('')}</tbody></table></div></section><section class="panel pad"><h2>Role permissions</h2><div class="table-wrap"><table><thead><tr><th>Role</th><th>Visibility</th><th>Business actions</th></tr></thead><tbody><tr><td>Department Contributor</td><td>Assigned department</td><td>Register and submit KPIs; create and submit plans; record approved-plan progress</td></tr><tr><td>Department Approver</td><td>Assigned department</td><td>Department review; cannot approve own requests</td></tr><tr><td>Strategy Team</td><td>All departments</td><td>Cross-department analysis and final business approval</td></tr><tr><td>Administrator</td><td>All departments</td><td>Manage accounts and access; no business approval bypass</td></tr></tbody></table></div><h3>Workflow policy</h3><p>Department review → Strategy review. Rejected requests return to the author for revision and resubmission. No change is applied while awaiting approval.</p><p>Actuals remain read-only and belong to external source applications. Role assignments and approval history are stored in this browser for demonstration.</p></section>`;}

let adminTab='general';
const adminSections=[['general','Organization','المنظمة'],['strategy','Strategy & objectives','الاستراتيجية والأهداف'],['lists','Lists of values','القيم المرجعية'],['departments','Departments','الإدارات'],['users','Users & roles','المستخدمون والأدوار'],['scoring','Performance rules','قواعد الأداء'],['approvals','Approval policy','سياسة الموافقات'],['recovery','Plan & recovery defaults','إعدادات الخطط والتعافي'],['notifications','Notifications','الإشعارات'],['sources','Source systems','الأنظمة المصدرية']];
const requireAdmin=()=>{if(currentUser()?.role!=='admin')throw Error('Administrator access required.');};
const dateAfter=days=>{const d=new Date();d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function saveConfiguration(section,values){
  requireAdmin();const allowed={general:['orgName','strategyLabel','defaultLanguage','landingPage'],scoring:['green','amber'],approvals:['approvalDays'],recovery:['recoveryPeriods','reviewCadence','defaultPriority','planDueDays'],notifications:['notifyApprovals','notifyReviews','notifyPerformance']};
  if(!allowed[section]||Object.keys(values).some(key=>!allowed[section].includes(key)))throw Error('Invalid configuration section.');
  const next={...appConfig,...values};
  if(!next.orgName.trim()||!next.strategyLabel.trim()||!['en','ar'].includes(next.defaultLanguage)||!['dashboard','strategy','ai','kpi'].includes(next.landingPage))throw Error('Complete organization details and select valid defaults.');
  if(!Number.isInteger(next.approvalDays)||next.approvalDays<1||next.approvalDays>30)throw Error('Approval review window must be 1–30 days.');
  if(!Number.isInteger(next.recoveryPeriods)||next.recoveryPeriods<2||next.recoveryPeriods>Data.periods.length)throw Error('Recovery requires 2–6 consecutive Green periods.');
  if(!lookupValues('reviewCadences').includes(next.reviewCadence)||!lookupValues('priorities').includes(next.defaultPriority)||!Number.isInteger(next.planDueDays)||next.planDueDays<1||next.planDueDays>365)throw Error('Select valid plan defaults (deadline: 1–365 days).');
  if(['notifyApprovals','notifyReviews','notifyPerformance'].some(key=>typeof next[key]!=='boolean'))throw Error('Invalid notification preference.');
  Data.configure(next);const changed=allowed[section].filter(key=>appConfig[key]!==next[key]).map(key=>`${key}: ${appConfig[key]} → ${next[key]}`);appConfig=next;if(changed.length)persist('Application configuration updated: '+changed.join('; '));
}
function saveDepartment(name,owner){
  requireAdmin();name=name.trim();owner=owner.trim();if(!name||!owner)throw Error('Enter a department name and accountable owner.');
  if(allDepartments.some(d=>d.toLowerCase()===name.toLowerCase()))throw Error('This department already exists.');
  allDepartments.push(name);appConfig.departmentOwners[name]=owner;persist('Department created: '+name);
}
function saveObjective(index,values){
  requireAdmin();
  const existing=goals[index];if(index!==null&&!existing)throw Error('Unknown objective.');
  const parent=saveStrategicGoal(existing?.strategicGoalId,{name:values.name,ar:values.ar,owner:values.owner});
  return saveChildObjective(index,{strategicGoalId:parent.id,objective:values.objective,owner:values.owner,department:existing?.department||kpis.find(k=>k.goal===index)?.dept||allDepartments[0]});
}
function objectiveConfigForm(index=null){return childObjectiveForm(goals[index]?.strategicGoalId||strategicGoals[0]?.id,index)}

function configInput(key,label,type='text',extra=''){
  return `<label class="field"><span>${label}</span><input id="config-${key}" type="${type}" value="${escapeHtml(appConfig[key])}" ${extra} required></label>`;
}
function configSelect(key,label,options){
  return `<label class="field"><span>${label}</span><select id="config-${key}">${options.map(([v,l])=>`<option value="${v}"${appConfig[key]===v?' selected':''}>${l}</option>`).join('')}</select></label>`;
}
function configForm(section,content,note=''){
  return `<form id="app-config-form" data-section="${section}" class="admin-config-form">${note?`<p class="muted">${note}</p>`:''}<div class="admin-field-grid">${content}</div><p id="config-error" role="alert"></p><button class="primary">${t('Save configuration','حفظ الإعدادات')}</button></form>`;
}
function adminContent(){
  if(adminTab==='general')return configForm('general',configInput('orgName','Organization name','text','maxlength="100"')+configInput('strategyLabel','Strategy / framework label','text','maxlength="100"')+configSelect('defaultLanguage','Default language',[['en','English'],['ar','العربية']])+configSelect('landingPage','Default workspace after sign-in',[['dashboard','Executive overview'],['strategy','Strategy & objectives'],['ai','Ask IQ'],['kpi','KPI registry']]),'Organization labels update throughout the app. Language and landing-page defaults apply at the next sign-in. Administrators always land here.');
  if(adminTab==='users')return adminUsersPanel();
  if(adminTab==='strategy')return strategyWorkspace();
  if(adminTab==='lists')return listsPanel();
  if(adminTab==='departments')return `<p class="muted">Departments define the access boundary for contributors and department approvers. Add a department, then assign its accounts under Users & roles.</p>${allDepartments.map(d=>`<div class="admin-directory-row"><div><strong>${escapeHtml(d)}</strong><small>${escapeHtml(appConfig.departmentOwners[d]||'Owner not configured')} · ${kpis.filter(k=>k.dept===d).length} KPIs · ${users.filter(u=>u.active&&u.department===d).length} active accounts</small></div><span class="pill ${users.some(u=>u.active&&u.role==='lead'&&u.department===d)?'green':'amber'}">${users.some(u=>u.active&&u.role==='lead'&&u.department===d)?'Approver assigned':'Approver needed'}</span></div>`).join('')}<form id="department-config-form" class="admin-config-form"><h3>Add department</h3><div class="admin-field-grid"><label class="field"><span>Department name</span><input id="department-name" required maxlength="100"></label><label class="field"><span>Accountable owner</span><input id="department-owner" required maxlength="100"></label></div><p id="department-error" role="alert"></p><button class="primary">Add department</button></form>`;
  if(adminTab==='scoring')return configForm('scoring',configInput('green','Aggregate Green boundary (%)','number','min="1" max="100" step="0.1"')+configInput('amber','Aggregate Amber boundary (%)','number','min="0" max="99.9" step="0.1"'), 'These boundaries control goal/overall status and parent-goal escalation across reports. Changing them reclassifies aggregate labels, including historical views. KPI-specific targets and external actuals do not change. KPI weights remain equal within each objective; goal weights remain equal overall.');
  if(adminTab==='approvals')return `<div class="approval-route"><span>Department review</span><span>→</span><span>Strategy review</span><span>→</span><span>Apply approved change</span></div><div class="admin-policy-list"><p>✓ Two stages are required for KPI publication/amendments, target changes and plan approval/amendments/closure/reopening.</p><p>✓ Requesters cannot approve their own requests. Decision notes are required.</p><p>✓ Department approvers are restricted to their department. Administrators cannot bypass business approval.</p></div>${configForm('approvals',configInput('approvalDays','Review window per approval stage (days)','number','min="1" max="30" step="1"'),'Applied to new submissions and newly started approval stages. Existing stage deadlines are retained.')}<h3>Approval coverage</h3>${allDepartments.map(d=>`<div class="admin-directory-row"><strong>${escapeHtml(d)}</strong><span>${users.filter(u=>u.active&&u.role==='lead'&&u.department===d).length} department approvers</span></div>`).join('')}<p>${users.filter(u=>u.active&&u.role==='strategy').length} active Strategy reviewers. A second eligible reviewer is needed when an approver submits their own request.</p>`;
  if(adminTab==='recovery')return configForm('recovery',configInput('recoveryPeriods','Consecutive Green periods for recovery closure','number',`min="2" max="${Data.periods.length}" step="1"`)+configSelect('reviewCadence','Default recovery review frequency',lookupValues('reviewCadences').map(v=>[v,v]))+configSelect('defaultPriority','Default plan priority',lookupValues('priorities').map(v=>[v,v]))+configInput('planDueDays','Default plan deadline from creation (days)','number','min="1" max="365" step="1"'), 'The recovery rule applies to current recovery verification and may require a new effectiveness review. Closure snapshots remain unchanged. Cadence, priority and deadline are defaults for new plans only. Recovery requires milestone evidence and effectiveness review. Action plans require delivery evidence. Both follow approval.');
  if(adminTab==='notifications')return configForm('notifications',[['notifyApprovals','Approval decisions and returned submissions'],['notifyReviews','Monitoring reviews due'],['notifyPerformance','KPI breaches and unpublished definitions']].map(([key,label])=>`<label class="config-toggle"><input id="config-${key}" type="checkbox" ${appConfig[key]?'checked':''}><span>${label}</span></label>`).join(''),'Controls the in-app notification centre and its unread indicator for every role, within that role’s access scope. Tasks remain available in their workspaces. Email and external delivery are not connected.');
  const sources=sourceDirectory();
  return `<p class="muted">Create source systems and configure ownership and expected refresh cadence. These are catalogue settings; they do not establish a live connection or allow manual actual entry.</p>${sourceCreateForm()}${sources.map((name,i)=>{const profile=appConfig.sourceProfiles[name]||{};return `<form class="source-config-card" data-source-config="${i}"><h3>${escapeHtml(name)}</h3><span class="pill amber">Not connected</span><p class="muted">${kpis.filter(k=>k.source===name).map(k=>escapeHtml(k.id)).join(' · ')}</p><div class="admin-field-grid"><label class="field"><span>Source owner / team</span><input name="owner" required maxlength="100" value="${escapeHtml(profile.owner||'')}"></label><label class="field"><span>Expected refresh</span><select name="frequency">${lookupOptions('sourceFrequencies',profile.frequency)}</select></label></div><p class="source-config-error" role="alert"></p><button>Save source configuration</button></form>`}).join('')}`;
}
function admin(){
  if(currentUser()?.role!=='admin')return `<section class="panel pad"><h2>${t('Administrator access required','يتطلب صلاحية مسؤول')}</h2><p>${t('Sign out, choose Workspace administrator on the demo account screen, then open Administration.','سجل الخروج واختر مسؤول مساحة العمل ثم افتح الإدارة.')}</p><button id="choose-admin-account">${t('Choose a demo account','اختيار حساب تجريبي')}</button></section>`;
  return `<section class="panel connection-intro"><div class="eyebrow">${t('APPLICATION CONTROL CENTRE','مركز التحكم بالتطبيق')}</div><h2>${t('Configure the whole workspace.','إعداد مساحة العمل بالكامل.')}</h2><p>${t('Manage your organization, framework, people, policies and data-source settings in one place.','أدر المنظمة والإطار والمستخدمين والسياسات وإعدادات المصادر في مكان واحد.')}</p><span class="pill neutral">Changes are saved locally and recorded in Audit trail</span></section><div class="admin-summary"><span><strong>${allDepartments.length}</strong> Departments</span><span><strong>${goals.length}</strong> Objectives</span><span><strong>${users.filter(u=>u.active).length}</strong> Active accounts</span><span><strong>${approvals.filter(r=>['Department review','Strategy review'].includes(r.status)).length}</strong> Pending approvals</span></div><nav class="admin-tabs" aria-label="${t('Administration sections','أقسام الإدارة')}">${adminSections.map(([key,en,arabic])=>`<button data-admin-tab="${key}" class="${adminTab===key?'active':''}" ${adminTab===key?'aria-current="page"':''}>${t(en,arabic)}</button>`).join('')}</nav><section class="panel admin-section"><h2>${t(...adminSections.find(s=>s[0]===adminTab).slice(1))}</h2>${adminContent()}</section>${adminTab==='general'?integrityPanel():''}`;
}
function bindAdministration(){
  if($('#choose-admin-account'))$('#choose-admin-account').onclick=()=>{close();authenticated=false;localStorage.removeItem(AUTH);render()};
  if(currentUser()?.role!=='admin')return;
  bindCatalogues();
  document.querySelectorAll('[data-admin-tab]').forEach(el=>el.onclick=()=>{adminTab=el.dataset.adminTab;render()});
  if($('#app-config-form'))$('#app-config-form').onsubmit=e=>{e.preventDefault();try{const values={};e.currentTarget.querySelectorAll('[id^="config-"]').forEach(el=>{if(el.id==='config-error')return;values[el.id.slice(7)]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value.trim()});saveConfiguration(e.currentTarget.dataset.section,values);render();toast(t('Application configuration saved','تم حفظ إعدادات التطبيق'))}catch(err){$('#config-error').textContent=err.message}};
  if($('#department-config-form'))$('#department-config-form').onsubmit=e=>{e.preventDefault();try{saveDepartment($('#department-name').value,$('#department-owner').value);render()}catch(err){$('#department-error').textContent=err.message}};
  if($('#add-objective'))$('#add-objective').onclick=()=>objectiveConfigForm();
  document.querySelectorAll('[data-edit-objective]').forEach(el=>el.onclick=()=>objectiveConfigForm(Number(el.dataset.editObjective)));
  const sources=sourceDirectory();
  document.querySelectorAll('[data-source-config]').forEach(form=>form.onsubmit=e=>{e.preventDefault();try{requireAdmin();const owner=form.elements.owner.value.trim(),frequency=form.elements.frequency.value;if(!owner||!lookupValues('sourceFrequencies',appConfig.sourceProfiles[sources[Number(form.dataset.sourceConfig)]]?.frequency).includes(frequency))throw Error('Enter the source owner and refresh cadence.');const name=sources[Number(form.dataset.sourceConfig)];appConfig.sourceProfiles[name]={owner,frequency};persist('Source configuration updated: '+name);toast('Source configuration saved. Live connection remains unconfigured.')}catch(err){form.querySelector('.source-config-error').textContent=err.message}});
}


/* ---------- chart ---------- */
let chartSeq=0;
function chart({values,labels,target,suffix='',caption=''}){
  const observed=values.filter(finite);
  if(!observed.length)return `<div class="chart"><p class="empty">${t('No observations recorded for this range.','لا توجد قراءات مسجلة لهذه الفترة.')}</p></div>`;
  const marks=finite(target)?[...observed,target]:observed;
  let min=Math.min(...marks),max=Math.max(...marks);
  if(max===min){const step=Math.abs(max)*0.1||1;max+=step;min-=step}
  const pad=(max-min)*0.18,high=max+pad,low=min-pad<0&&min>=0?0:min-pad,span=high-low;
  const W=640,H=214,left=52,right=16,top=14,bottom=34;
  const x=i=>values.length<2?left:left+i*(W-left-right)/(values.length-1);
  const y=v=>top+(high-v)/span*(H-top-bottom);
  const runs=[];let run=[];
  values.forEach((v,i)=>{if(finite(v))run.push([x(i),y(v)]);else if(run.length){runs.push(run);run=[]}});
  if(run.length)runs.push(run);
  const path=r=>r.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const id=`shade-${++chartSeq}`;
  const base=y(low).toFixed(1);
  const axis=[0,1,2,3].map(i=>{
    const v=high-span*i/3,ty=(top+i*(H-top-bottom)/3).toFixed(1);
    return `<line x1="${left}" y1="${ty}" x2="${W-right}" y2="${ty}" stroke="var(--chart-grid)"/><text class="axis" x="${left-10}" y="${Number(ty)+4}" text-anchor="end">${Number(v.toFixed(span<12?1:0))}${suffix}</text>`;
  }).join('');
  const showTarget=finite(target)&&target>=low&&target<=high;
  /* Anchor the target caption on whichever side has the most clearance from the series. */
  const edge=observed.length>1&&Math.abs(observed[observed.length-1]-target)>Math.abs(observed[0]-target)?'end':'start';
  const labelX=edge==='start'?left+8:W-right-8;
  const near=edge==='start'?observed[0]:observed[observed.length-1];
  const labelY=near>target?Math.min(y(target)+17,H-bottom-2):Math.max(y(target)-9,top+11);
  const targetLine=showTarget?`<line x1="${left}" x2="${W-right}" y1="${y(target).toFixed(1)}" y2="${y(target).toFixed(1)}" stroke="var(--chart-gold)" stroke-width="1.5" stroke-dasharray="5 5"/>`:'';
  const targetLabel=showTarget?`<text class="axis target" x="${labelX}" y="${labelY.toFixed(1)}" text-anchor="${edge==='start'?'start':'end'}" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">${t('Target','المستهدف')} ${Number(target)}${suffix}</text>`:'';
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(caption||'Trend chart')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--chart-green)" stop-opacity=".22"/><stop offset="1" stop-color="var(--chart-green)" stop-opacity="0"/></linearGradient></defs>${axis}${targetLine}${runs.filter(r=>r.length>1).map(r=>`<polygon points="${r[0][0].toFixed(1)},${base} ${path(r)} ${r[r.length-1][0].toFixed(1)},${base}" fill="url(#${id})"/>`).join('')}${runs.filter(r=>r.length>1).map(r=>`<polyline points="${path(r)}" fill="none" stroke="var(--chart-green)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}${runs.flat().map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="#fff" stroke="var(--chart-green)" stroke-width="2.5"/>`).join('')}${targetLabel}${labels.map((l,i)=>`<text class="axis" x="${x(i).toFixed(1)}" y="${H-10}" text-anchor="middle">${l}</text>`).join('')}</svg></div>`;
}

/* The sidebar, login card and favicon all render icon.svg, so the mark has one source of
   truth and cannot drift between copies, and no duplicate SVG ids reach the document.
   Decorative: the "ITQAN IQ" wordmark always sits beside it. */
const brandMark=(size,cls='brand-mark')=>`<img class="${cls}" src="icon.svg" width="${size}" height="${size}" alt="" aria-hidden="true">`;

/* ---------- shell ---------- */
/* Single entry point for changing view: keeps the hash, the page state and the render in step. */
function go(next){
  close();
  page=pages.includes(next)?next:'dashboard';
  if(typeof location!=='undefined')location.hash=`#/${page}`;
  render();
}

const usesReportingPeriod=()=>['dashboard','strategy','data','impact','reports'].includes(page);
function render(){
  periodIndex=usesReportingPeriod()?reportingPeriodIndex:Data.latest;
  document.documentElement.lang=ar?'ar':'en';
  document.documentElement.dir=ar?'rtl':'ltr';
  if(!currentUser())authenticated=false;
  if(!globalAccess()&&currentUser())department=currentUser().department;
  if(!authenticated){document.title=`${t('Sign in','تسجيل الدخول')} · ITQAN IQ`;renderLogin();localizeUI();return}
  const view=nav.find(n=>n[0]===page)||nav[0];
  document.title=`${t(view[1],view[2])} · ITQAN IQ`;
  const openActions=visibleActions().filter(a=>a.status!=='Closed').length;
  $('#app').innerHTML=`<aside class="sidebar"><div class="brand">${brandMark(46)}<div><strong>ITQAN <span>IQ</span></strong><small>INTELLIGENCE IN PERFORMANCE</small></div></div><div class="uae-workspace-signature"><span lang="ar" dir="rtl">الإمارات</span><span>UNITED ARAB EMIRATES</span></div><div class="org"><span class="uae-flag" aria-hidden="true"></span><div><strong>${escapeHtml(appConfig.orgName)}</strong><small>${t('United Arab Emirates','الإمارات العربية المتحدة')}</small></div></div><nav>${nav.filter(n=>n[0]!=='admin'||currentUser()?.role==='admin').map(([id,en,a],i)=>`${i===0?`<div class="nav-label">${t('WORKSPACE','مساحة العمل')}</div>`:i===7?`<div class="nav-label">${t('GOVERNANCE','الحوكمة')}</div>`:''}<button class="nav-item ${page===id?'active':''}" data-page="${id}"${page===id?' aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${icons[id]}</span>${t(en,a)}${id==='approvals'&&visibleApprovals().some(canDecide)?`<span class="count">${visibleApprovals().filter(canDecide).length}</span>`:id==='actions'&&openActions?`<span class="count">${openActions}</span>`:id==='ai'?'<span class="count">IQ</span>':''}</button>`).join('')}</nav><div class="side-bottom"><div class="help-card"><strong>✧ ${t('Clarity. Confidence. Impact.','وضوح. ثقة. أثر.')}</strong><p>${t('Turn performance intelligence into meaningful action.','حوّل ذكاء الأداء إلى إجراءات مؤثرة.')}</p><button data-page="ai">${t('Open Ask IQ','افتح Ask IQ')} ↗</button></div><div class="user"><span class="avatar">${escapeHtml(currentUser()?.name.split(' ').map(v=>v[0]).slice(0,2).join('')||'IQ')}</span><div><strong>${escapeHtml(currentUser().name)}</strong><small>${escapeHtml(roleNames[currentUser().role])} · ${escapeHtml(currentUser().department||'All departments')}</small></div></div></div></aside><main class="main"><header class="topbar"><div class="breadcrumb">${t('Workspace','مساحة العمل')} / <b>${t(nav.find(n=>n[0]===page)[1],nav.find(n=>n[0]===page)[2])}</b></div><div class="top-actions"><label class="search-box"><span aria-hidden="true">⌕</span><input class="search" id="global-search" placeholder="${t('Search ITQAN IQ…','البحث في المؤشرات…')}" aria-label="${t('Search KPIs','البحث في المؤشرات')}"></label><span class="demo">${escapeHtml(roleNames[currentUser().role])}</span>${canWrite()?`<button class="primary" id="create-menu">＋ ${t('Create','إنشاء')}</button>`:''}${currentUser()?.role==='admin'?`<button class="ghost" data-page="admin" id="admin-shortcut">⚙ ${t('Administration','الإدارة')}</button>`:''}<button class="ghost" id="language">${ar?'English':'العربية'}</button><button class="icon-button" id="notifications" aria-label="${t('Notifications','التنبيهات')}">♧${attention()?`<span class="dot" aria-hidden="true"></span>`:''}</button><span class="avatar">${escapeHtml(currentUser()?.name.split(' ').map(v=>v[0]).slice(0,2).join('')||'IQ')}</span><button class="icon-button" id="sign-out" title="${t('Sign out','تسجيل الخروج')}" aria-label="${t('Sign out','تسجيل الخروج')}">⇥</button></div></header><div class="content${page==='ai'?' ask-content':''}">${heading()}${body()}<footer class="footer"><span class="uae-footer-identity"><span class="uae-flag" aria-hidden="true"></span> ITQAN IQ · ${t('Inspired by the UAE. Driven by excellence.','مستوحى من الإمارات. مدفوع بالتميز.')}</span><span>${t('Interactive prototype · Synthetic data','نموذج تفاعلي · بيانات اصطناعية')} · ${period()}</span></footer></div></main><button type="button" class="navigator-fab"${page==='ai'?' hidden':''} data-page="ai" aria-label="${t('Open Ask IQ','افتح Ask IQ')}" title="${t('Open Ask IQ','افتح Ask IQ')}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" fill="currentColor"/></svg><span>Ask IQ</span></button>`;
  bind();localizeUI();
}
const attention=()=>(appConfig.notifyPerformance?Data.summary(scoped()).attention+visibleKpis().filter(k=>k.draft).length:0)+(appConfig.notifyApprovals?visibleApprovals().filter(r=>canDecide(r)||(r.status==='Rejected'&&r.requesterId===currentUser()?.id)).length:0)+(appConfig.notifyReviews?visibleActions().filter(reviewDue).length:0);

let loginPreviewRole=null,loginPreviewUserId=null,loginPreviewDepartment=null;
function renderLogin(){
  const roleCopy={
    strategy:[t('Strategy Team','الفريق الاستراتيجي'),t('All departments','كل الإدارات'),t('Oversee strategic performance and give final business approval.','الإشراف على الأداء الاستراتيجي ومنح الموافقة النهائية.')],
    contributor:[t('Department Contributor','مساهم الإدارة'),t('Your department','إدارتك'),t('Register KPIs, set targets and deliver action and recovery plans.','تسجيل المؤشرات وتحديد المستهدفات وتنفيذ خطط العمل والتعافي.')],
    lead:[t('Department Approver','موافق الإدارة'),t('Your department','إدارتك'),t('Review department submissions and monitor corrective delivery.','مراجعة طلبات الإدارة ومتابعة تنفيذ الإجراءات التصحيحية.')],
    admin:[t('Administrator','مسؤول النظام'),t('Application configuration','إعدادات التطبيق'),t('Manage settings, accounts and access. No business approval bypass.','إدارة الإعدادات والحسابات والصلاحيات دون تجاوز الموافقات.')]
  };
  let selectedRole=loginPreviewRole||currentUser()?.role||'strategy';

  $('#app').innerHTML=`<main class="login-page">
    <aside class="login-aside" aria-label="${t('Choose your workspace','اختر مساحة عملك')}">
      <div class="login-aside-top"><div class="login-brand">${brandMark(52)}<div><strong>ITQAN <span>IQ</span></strong><small>${t('CONNECTED PERFORMANCE','أداء مترابط')}</small></div></div><button type="button" class="ghost" id="login-language" lang="${ar?'en':'ar'}">${ar?'English':'العربية'}</button></div>
      <div class="login-story"><div class="login-uae-identity"><span class="uae-flag" role="img" aria-label="${t('United Arab Emirates flag','علم دولة الإمارات العربية المتحدة')}"></span><span>${t('United Arab Emirates','الإمارات العربية المتحدة')}</span></div><h2 class="login-tagline" id="login-tagline">${t('Intelligence in<br><span>Performance.</span>','ذكاء في<br><span>الأداء.</span>')}</h2><p>${t('Clarity. Confidence. Impact.','وضوح. ثقة. أثر.')}</p><p class="login-role-intro">${t('Connect your strategy, targets and actions. Choose your role to enter your workspace.','اربط استراتيجيتك ومستهدفاتك وإجراءاتك. اختر دورك للدخول إلى مساحة عملك.')}</p>
      <section class="login-role-workspace" id="demo-access" aria-labelledby="role-selection-title"><div class="login-role-heading"><h3 id="role-selection-title">${t('Choose your role','اختر دورك')}</h3><span>${t('DEMO ACCESS','وصول تجريبي')}</span></div>
      <div class="login-role-grid" role="group" aria-labelledby="role-selection-title">${['strategy','contributor','lead','admin'].map(role=>`<button type="button" class="login-role-card" data-login-role="${role}" aria-pressed="${selectedRole===role}"><span class="login-role-title">${roleCopy[role][0]}<span class="login-role-check" aria-hidden="true">✓</span></span><small>${roleCopy[role][1]}</small></button>`).join('')}</div>
      <p class="login-role-description" id="login-role-description" aria-live="polite"></p>
      <form id="login-form" class="login-form"><div class="login-role-fields"><label class="field" id="login-department-field" for="login-department"><span>${t('Department','الإدارة')}</span><select id="login-department"></select></label><label class="field" for="login-profile"><span>${t('Assigned demo account','الحساب التجريبي المعين')}</span><select id="login-profile"></select></label></div><p id="login-scope" class="login-scope-summary" aria-live="polite"></p><button class="login-demo-submit" id="enter-demo">${t('Enter selected workspace','دخول مساحة العمل المختارة')} <span aria-hidden="true">→</span></button></form>
      <p class="login-demo-note">${t('Demo access needs no password. Live access will use the role assigned to your verified account.','الوصول التجريبي لا يحتاج إلى كلمة مرور. يعتمد الوصول الفعلي على الدور المعين لحسابك الموثق.')}</p></section>
      </div>
      <div class="login-aside-footer"><span>${escapeHtml(appConfig.orgName)}</span><span>${t('United Arab Emirates','الإمارات العربية المتحدة')}</span></div>
    </aside>
    <section class="login-entry"><div class="login-entry-top"><span class="login-environment">${t('ORGANIZATION SIGN-IN','تسجيل الدخول المؤسسي')}</span><span class="login-connection-status">${t('Connection pending','بانتظار الربط')}</span></div>
      <div class="login-card"><div class="login-mobile-brand">${brandMark(38)}<strong>ITQAN IQ</strong></div>
      <div class="login-copy"><div class="eyebrow">${t('YOUR PERFORMANCE WORKSPACE','مساحة عمل الأداء')}</div><h1>${t('Welcome back.','مرحباً بعودتك.')}</h1><p>${t('Sign in to your ITQAN IQ workspace.','سجّل الدخول إلى مساحة عملك في إتقان.')}</p></div>
      <button type="button" class="login-uae-pass" id="uae-pass-login" aria-describedby="login-preview-note"><img src="/uae-pass.svg" width="26" height="25" alt=""><span>${t('Sign in with UAE PASS','تسجيل الدخول بالهوية الرقمية')}</span></button>
      <div class="login-divider"><span>${t('or use your organization account','أو استخدم حساب مؤسستك')}</span></div>
      <p class="login-preview-note" id="login-preview-note">${t('Live sign-in is not connected yet. Choose your role in Demo access to explore the workspace.','تسجيل الدخول الفعلي غير متصل بعد. اختر دورك في الوصول التجريبي لاستكشاف مساحة العمل.')}</p>
      <form id="credentials-form" class="login-form" aria-describedby="login-preview-note">
        <label class="field" for="login-id"><span>${t('Login ID','معرّف الدخول')}</span><input id="login-id" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="140" placeholder="${t('Enter your login ID or email','أدخل معرّف الدخول أو البريد الإلكتروني')}"></label>
        <div class="field"><div class="login-password-label"><label for="login-password">${t('Password','كلمة المرور')}</label><button type="button" class="login-text-button" id="forgot-password">${t('Forgot password?','نسيت كلمة المرور؟')}</button></div><div class="login-password-wrap"><input id="login-password" name="password" type="password" autocomplete="current-password" required maxlength="256" placeholder="${t('Enter your password','أدخل كلمة المرور')}"><button type="button" id="toggle-password" aria-controls="login-password" aria-pressed="false">${t('Show','إظهار')}</button></div></div>
        <button type="submit" class="primary login-submit">${t('Sign in','تسجيل الدخول')} <span aria-hidden="true">→</span></button>
      </form>
      <p id="sign-in-message" class="login-feedback" role="status" aria-live="polite" tabindex="-1" hidden></p>
      <p class="login-access-help">${t('Need workspace access?','تحتاج إلى صلاحية الدخول؟')} <button type="button" class="login-text-button" id="login-help">${t('Account help','مساعدة الحساب')}</button></p>
      </div><footer class="login-entry-footer">ITQAN IQ <span aria-hidden="true">·</span> ${t('Clarity in every decision.','وضوح في كل قرار.')}</footer>
    </section></main>`;
  const message=text=>{const feedback=$('#sign-in-message');feedback.textContent=text;feedback.hidden=false;feedback.focus()};
  $('#login-language').onclick=()=>{ar=!ar;localStorage.setItem('itqan-language',ar?'ar':'en');close();render()};
  $('#toggle-password').onclick=()=>{const input=$('#login-password'),show=input.type==='password';input.type=show?'text':'password';$('#toggle-password').textContent=show?t('Hide','إخفاء'):t('Show','إظهار');$('#toggle-password').setAttribute('aria-pressed',String(show))};
  $('#credentials-form').onsubmit=e=>{e.preventDefault();if(!$('#credentials-form').checkValidity()){$('#credentials-form').reportValidity();return}$('#login-password').value='';$('#login-password').type='password';$('#toggle-password').textContent=t('Show','إظهار');$('#toggle-password').setAttribute('aria-pressed','false');message(t('Organization sign-in is not connected in this preview. Choose your role in Demo access to explore with an assigned account.','تسجيل الدخول المؤسسي غير متصل في هذه المعاينة. اختر دورك في الوصول التجريبي للاستكشاف بحساب معين.'))};
  $('#uae-pass-login').onclick=()=>message(t('UAE PASS sign-in is not connected in this preview. Choose your role in Demo access to enter the workspace.','تسجيل الدخول بالهوية الرقمية غير متصل في هذه المعاينة. اختر دورك في الوصول التجريبي للدخول إلى مساحة العمل.'));
  $('#forgot-password').onclick=()=>message(t('Password recovery is managed by your organization. Contact your workspace administrator. No password reset is sent from this preview.','تدير مؤسستك استعادة كلمة المرور. تواصل مع مسؤول مساحة العمل. لا ترسل هذه المعاينة طلبات إعادة تعيين.'));
  $('#login-help').onclick=()=>message(t('Your workspace administrator assigns your account, role and department. To preview Administration, choose the Administrator role and the Workspace administrator account.','يحدد مسؤول مساحة العمل حسابك ودورك وإدارتك. لمعاينة الإدارة، اختر دور مسؤول النظام وحساب مسؤول مساحة العمل.'));
  const explain=()=>{const u=users.find(u=>u.id===$('#login-profile').value&&u.active&&u.role===selectedRole);loginPreviewUserId=u?.id||null;$('#enter-demo').disabled=!u;$('#login-scope').textContent=u?`${roleCopy[u.role][0]} · ${u.department||t('All departments','كل الإدارات')}`:t('No active account for this selection. An administrator must assign an account before this workspace can be entered.','لا يوجد حساب نشط لهذا الاختيار. يجب أن يعين المسؤول حساباً قبل الدخول إلى مساحة العمل.');};
  const updateProfiles=()=>{const candidates=users.filter(u=>u.active&&u.role===selectedRole&&(!['lead','contributor'].includes(selectedRole)||u.department===$('#login-department').value));const selected=candidates.find(u=>u.id===loginPreviewUserId)||candidates.find(u=>u.id===currentUserId)||candidates[0];$('#login-profile').innerHTML=candidates.length?candidates.map(u=>`<option value="${escapeHtml(u.id)}"${u.id===selected?.id?' selected':''}>${escapeHtml(u.name)}</option>`).join(''):`<option value="">${t('No active account','لا يوجد حساب نشط')}</option>`;$('#login-profile').disabled=!candidates.length;explain()};
  const selectRole=role=>{selectedRole=role;loginPreviewRole=role;document.querySelectorAll('[data-login-role]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.loginRole===role)));$('#login-role-description').textContent=roleCopy[role][2];const departmental=['lead','contributor'].includes(role);$('#login-department-field').hidden=!departmental;$('#login-department').disabled=!departmental;const choices=allDepartments;const prior=users.find(u=>u.id===loginPreviewUserId&&u.role===role&&u.active)||currentUser();const chosen=choices.includes(loginPreviewDepartment)?loginPreviewDepartment:choices.includes(prior?.department)?prior.department:choices[0];$('#login-department').innerHTML=choices.map(d=>`<option value="${escapeHtml(d)}"${d===chosen?' selected':''}>${escapeHtml(d)}</option>`).join('');updateProfiles()};
  document.querySelectorAll('[data-login-role]').forEach(button=>button.onclick=()=>selectRole(button.dataset.loginRole));
  $('#login-department').onchange=()=>{loginPreviewDepartment=$('#login-department').value;updateProfiles()};$('#login-profile').onchange=explain;selectRole(selectedRole);
  $('#login-form').onsubmit=e=>{e.preventDefault();const u=users.find(u=>u.id===$('#login-profile').value&&u.active&&u.role===selectedRole&&(!['lead','contributor'].includes(selectedRole)||u.department===$('#login-department').value));if(!u)return;loginPreviewRole=loginPreviewUserId=loginPreviewDepartment=null;currentUserId=u.id;localStorage.setItem('itqan-user',u.id);department=u.department||'All departments';query=actionQuery='';registryGoal=linkedActionKpi=linkedActionGoal=dataSourceFilter='';impactFilter='attention';filter='All statuses';actionFilter=actionOwner=actionPriority=approvalFilter=planTypeFilter='All';authenticated=true;localStorage.setItem(AUTH,'true');ar=(localStorage.getItem('itqan-language')||appConfig.defaultLanguage)==='ar';go(u.role==='admin'?'admin':appConfig.landingPage)};
}

function heading(){
  const titles={dashboard:['Performance, in perspective.','الأداء، برؤية شاملة.'],strategy:['One strategy. Shared ambition.','استراتيجية واحدة. طموح مشترك.'],kpi:['Set targets. Measure progress.','حدد المستهدفات. قِس التقدم.'],data:['Actuals from your source applications.','القيم الفعلية من تطبيقاتك المصدرية.'],ai:['Ask IQ','Ask IQ'],impact:['See the impact. Own the response.','افهم الأثر. تولّ الاستجابة.'],actions:['Deliver actions. Track recovery.','خطط للتصحيح. راقب التعافي.'],reports:['The bigger picture, beautifully clear.','الصورة الكاملة، بوضوح.'],approvals:['Review. Decide. Keep work moving.','راجع وقرر وادفع العمل.'],admin:['Administration & configuration.','الإدارة والإعدادات.'],audit:['Every change, accounted for.','كل تغيير، موثّق.']};
  const scopeControls=page==='admin'||page==='audit'||page==='approvals'?'':`${usesReportingPeriod()?`<label class="field"><span>${t('Reporting period','فترة التقرير')}</span><select id="period" aria-label="${t('Reporting period','فترة التقرير')}">${Data.periods.map((p,i)=>`<option value="${i}"${i===periodIndex?' selected':''}>${p}</option>`).join('')}</select></label>`:''}<label class="field"><span>${t('Department','الإدارة')}</span><select id="department" aria-label="${t('Department','الإدارة')}">${(globalAccess()?['All departments',...departments()]:departments()).map(d=>`<option${department===d?' selected':''}>${escapeHtml(d)}</option>`).join('')}</select></label>`;
  if(page==='ai')return `<div class="page-heading ask-page-heading"><div><h1>Ask IQ</h1><p class="sub">${t('Your workspace, one question away.','مساحة عملك، على بُعد سؤال.')}</p></div><div class="controls">${scopeControls}</div></div>`;
  const pageControls=page==='dashboard'?`<button id="export">↧ ${t('Export report','تصدير التقرير')}</button>`:page==='kpi'&&canWrite()?`<button class="primary" id="new-kpi">＋ ${t('Register KPI','تسجيل مؤشر')}</button>`:page==='actions'&&canWrite()?`<button class="primary" id="new-action">＋ ${t('Create action plan','إنشاء خطة عمل')}</button>`:'';
  return `<div class="page-heading"><div><div class="eyebrow">${escapeHtml(appConfig.strategyLabel)}</div><h1>${t(...titles[page])}</h1><p class="sub">${page==='dashboard'?t('Your strategic priorities, performance signals, and next best actions — connected.','أولوياتك الاستراتيجية ومؤشرات الأداء والإجراءات التالية، مترابطة.'):t('Connected objectives. Accountable owners. Measurable progress.','أهداف مترابطة. مسؤوليات واضحة. تقدم قابل للقياس.')}</p></div><div class="controls">${scopeControls}${pageControls}</div></div>${scopeNote()}`;
}
function scopeNote(){
  if(page==='admin'||page==='audit'||page==='approvals')return '';
  const bits=[];
  if(!isCurrent())bits.push(t(`Viewing ${period()} — a closed period. Observations are read-only.`,`عرض ${period()} — فترة مغلقة للقراءة فقط.`));
  if(department!=='All departments')bits.push(t(`Scoped to ${department}.`,`محدد ضمن ${department}.`));
  return bits.length?`<p class="scope-note">◷ ${bits.join(' ')}</p>`:'';
}

/* ---------- views ---------- */
function body(){
  if(page==='dashboard')return dashboard();
  if(page==='strategy')return strategy();
  if(page==='kpi')return registry();
  if(page==='data')return dataHub();
  if(page==='ai')return aiView();
  if(page==='impact')return impact();
  if(page==='actions')return actionBoard();
  if(page==='reports')return reports();
  if(page==='admin')return admin();
  if(page==='approvals')return approvalsView();
  return auditView();
}

function dashboard(){
  const items=scoped(),s=Data.summary(items);
  const path=Data.trajectory(visibleKpis(),department,periodIndex);
  const now=path[periodIndex],first=path.findIndex(finite);
  const change=first>=0&&first!==periodIndex?delta(now,path[first]):null;
  const onTrackShare=s.measured?Math.round(s.green/s.measured*100):null;
  const metrics=[
    [t('Strategic goals','الأهداف الاستراتيجية'),s.goals,'◇',t(`${strategicGoals.length} in the 2026–2031 framework`,`${goals.length} في إطار ٢٠٢٦–٢٠٣١`),''],
    [t('Published KPIs','المؤشرات المنشورة'),s.total,'▤',t(`Across ${plural(s.departments,'department')}`,`عبر ${s.departments} إدارات`),''],
    [t('KPIs on track','مؤشرات على المسار'),s.green,'↗',finite(onTrackShare)?t(`${onTrackShare}% of ${plural(s.measured,'measured KPI')}`,`${onTrackShare}% من المؤشرات المقاسة`):t('No measured KPIs in scope','لا توجد مؤشرات مقاسة'),`/ ${s.total}`],
    [t('Attention required','تتطلب الاهتمام'),s.attention,'◎',[`${s.red} ${t('off track','خارج المسار')}`,`${s.amber} ${t('at risk','معرض للخطر')}`,...(s.missing?[`${s.missing} ${t('no data','بدون بيانات')}`]:[])].join(' · '),'']
  ];
  const risky=items.filter(k=>status(k)!=='green');
  return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${t('YOUR STRATEGIC PULSE','نبضك الاستراتيجي')} · ${period().toUpperCase()}</div><h2>${t('Progress with purpose.','تقدم هادف.')}</h2><p>${t(`${s.green} of ${plural(s.total,'published KPI')} ${s.green===1?'is':'are'} on track. ${s.attention?`Stay focused on the ${plural(s.attention,'measure')} that ${s.attention===1?'needs':'need'} attention to keep our shared ambitions within reach.`:'Every published measure is meeting its target this period.'}`,`${s.green} من ${s.total} مؤشرات على المسار الصحيح. ${s.attention?`ركز على ${s.attention} مؤشرات تتطلب الاهتمام.`:'كل المؤشرات ضمن المستهدف.'}`)}</p><button class="text-link" data-page="strategy">${t('Explore strategic alignment','استكشف الترابط الاستراتيجي')} →</button></div><div class="hero-score"><div class="ring" style="background:conic-gradient(var(--gold-light) 0 ${width(now)}%,var(--ring-track) ${width(now)}%)"><div class="ring-inner"><strong>${finite(now)?Math.round(now):'—'}${finite(now)?'<span>%</span>':''}</strong><small>${t('OVERALL ACHIEVEMENT','الإنجاز العام')}</small></div></div><div class="hero-delta"><span class="delta">${deltaText(change)}${finite(change)?' pts':''}</span><p>${first>=0&&first!==periodIndex?t(`since ${Data.periods[first]}`,`منذ ${Data.periods[first]}`):t('first reported period','أول فترة مسجلة')}</p></div></div></section>
  <div class="metrics">${metrics.map(([label,num,ic,foot,of],i)=>`<div class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon${i===3&&s.attention?' warn':''}" aria-hidden="true">${ic}</span></div><strong>${String(num).padStart(2,'0')}${of?`<small>${of}</small>`:''}</strong><div class="metric-foot">${foot}</div></div>`).join('')}</div>
  <div class="split"><section class="panel"><div class="panel-head"><div><h2>${t('Strategic goal performance','أداء الأهداف الاستراتيجية')}</h2><p>${t(`Equal objective weights · ${appConfig.green}% is the on-track boundary`,`أوزان متساوية · ${appConfig.green}٪ حد المسار الصحيح`)}</p></div><button class="ghost" data-page="strategy">${t('Strategy map','خريطة الاستراتيجية')} ↗</button></div>${strategicPerformanceRows()}</section>
  <section class="panel trend-panel"><div class="panel-head"><div><h2>${t('Performance trajectory','مسار الأداء')}</h2><p>${t('Equal-weight goal achievement by reporting month','الإنجاز المرجح بالتساوي لكل شهر')}</p></div><span class="eyebrow">2026</span></div><div class="legend"><span><i></i>${t('Achievement','الإنجاز')}</span><span><i class="gold"></i>${t(`${appConfig.green}% ambition`,`طموح ${appConfig.green}٪`)}</span></div>${chart({values:path,labels:path.map((_,i)=>shortMonth(i)),target:appConfig.green,suffix:'%',caption:'Overall achievement by month'})}<div class="chart-note"><span>${t('Computed from recorded observations','محسوب من القراءات المسجلة')}</span><b>${deltaText(change)}${finite(change)?` pts ${t('since','منذ')} ${shortMonth(Math.max(first,0))}`:''}</b></div></section></div>
  <div class="bottom-split"><section class="panel"><div class="panel-head"><div><h2>${t('Where your attention matters','حيث يصنع اهتمامك الفرق')}</h2><p>${t('Priority measures to keep your strategy moving','مؤشرات الأولوية للحفاظ على تقدم استراتيجيتك')}</p></div><button class="ghost" data-page="kpi">${t('View all KPIs','كل المؤشرات')} →</button></div>${table(risky)}</section>${insights()}</div>`;
}

let linkedActionKpi='',linkedActionGoal='',registryGoal='';
const linkedActions=id=>visibleActions().filter(a=>a.kpi===id);
function connectionPath(k,action){
  if(!k||!goals[k.goal])return '';
  const g=goals[k.goal];
  return `<nav class="connection-path" aria-label="${t('Strategic connections','الروابط الاستراتيجية')}"><button type="button" data-strategic-goal="${g.strategicGoalId}"><small>${t('Strategic goal','الهدف الاستراتيجي')}</small>${escapeHtml(name(g))}</button><span aria-hidden="true">→</span><button type="button" data-objective="${k.goal}"><small>${t('Objective','الهدف التشغيلي')}</small>${escapeHtml(g.objective)}</button><span aria-hidden="true">→</span><button type="button" data-kpi="${escapeHtml(k.id)}"><small>${t('KPI','المؤشر')}</small>${escapeHtml(name(k))}</button>${action?`<span aria-hidden="true">→</span><span class="connection-current"><small>${escapeHtml(action.planType||'Recovery plan')}</small>${escapeHtml(action.title)}</span>`:''}</nav>`;
}
function recoveryLinks(k,compact=false){
  const list=linkedActions(k.id),active=list.filter(a=>a.status!=='Closed').length;
  return `<div class="linked-recovery"><div class="connection-section-title"><strong>${t('Linked plans','الخطط المرتبطة')} <span class="lane-count">${list.length}</span></strong><small>${active} ${t('active','نشطة')}</small></div>${list.map(a=>`<button type="button" class="recovery-link" data-linked-action="${escapeHtml(a.id)}"><span><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.planType)}</small>${compact?'':`<small>${escapeHtml(a.owner)} · ${t('Due','الاستحقاق')} ${escapeHtml(a.due)}</small>`}</span><span class="pill ${a.status==='Closed'?'green':overdue(a)?'red':'neutral'}">${actionLabel(a.status)}</span><span aria-hidden="true">↗</span></button>`).join('')||`<p class="muted">${t('No plan linked to this KPI yet.','لا توجد خطة مرتبطة بهذا المؤشر بعد.')}</p>`}${!k.draft&&canWrite()?`<div class="connection-buttons"><button type="button" data-create-action-plan="${escapeHtml(k.id)}">＋ ${t('Action plan','خطة عمل')}</button>${isCurrent()&&recoveryEligible(raw(k.id))?`<button type="button" data-create-recovery="${escapeHtml(k.id)}">＋ ${t('Create recovery plan','إنشاء خطة تعافٍ')}</button>`:''}${list.length?`<button type="button" data-kpi-actions="${escapeHtml(k.id)}">${t('View in action board','عرض في لوحة الإجراءات')} →</button>`:''}</div>`:''}</div>`;
}
function objectiveMeasures(i){
  const list=goalItems(i),weights=Data.weights(list);
  return list.map(k=>`<article class="connected-measure"><button class="objective-kpi" data-kpi="${escapeHtml(k.id)}"><span class="objective-kpi-top"><span><small>${escapeHtml(k.id)}</small><strong>${escapeHtml(name(k))}</strong></span>${pill(status(k))}</span><small>${value(k)} / ${targetText(k)} · ${trimNum(weights[k.id])}% ${t('objective weight','وزن الهدف')}</small></button>${recoveryLinks(k,true)}</article>`).join('')||`<p class="empty">${t('No published KPIs in this scope.','لا توجد مؤشرات منشورة ضمن هذا النطاق.')}</p>`;
}
function objectiveDetail(i){
  i=Number(i);const g=goals[i];if(!g||!objectiveInScope(i))return;
  const list=goalItems(i),ids=new Set(list.map(k=>k.id)),linked=visibleActions().filter(a=>planGoal(a)===i&&(department==='All departments'||planDepartment(a)===department)),score=avg(list);
  setDrawerRoute('objective:'+i,()=>objectiveDetail(i));
  drawer(g.objective,`<div class="objective-context"><div class="eyebrow">${t('STRATEGIC GOAL','الهدف الاستراتيجي')}</div><button class="objective-title" data-strategic-goal="${g.strategicGoalId}">${escapeHtml(name(g))}</button><p>${t('Accountable owner','المسؤول')}: ${escapeHtml(g.owner)}</p><div class="goal-score"><strong>${pct(score)}</strong>${goalPill(score)}</div><p class="muted">${period()} · ${escapeHtml(department)} · ${t('Achievement is calculated from the linked KPIs. Actions support recovery; closing an action does not change KPI results.','يُحسب الإنجاز من المؤشرات المرتبطة. تدعم الإجراءات التعافي؛ إغلاق إجراء لا يغير نتائج المؤشرات.')}</p></div><div class="connection-summary"><span>${list.length} ${t('KPIs','مؤشرات')}</span><span>${linked.filter(a=>a.status!=='Closed').length} ${t('active actions','إجراءات نشطة')}</span><span>${list.filter(k=>recoveryEligible(raw(k.id))&&!linkedActions(k.id).some(a=>!isActionPlan(a)&&a.status!=='Closed')).length} ${t('KPIs needing a recovery plan','مؤشرات تحتاج خطة تعافٍ')}</span></div>${canWrite()?`<button data-register-objective="${i}">Register KPI</button>`:''}${canManageStrategy()?` <button data-edit-child-objective="${i}">Edit objective</button>`:''}<div class="connection-buttons"><button data-objective-kpis="${i}">${t('View KPI registry','عرض سجل المؤشرات')} →</button><button data-objective-actions="${i}">${t('View plans','عرض الخطط')} →</button></div><h3 class="connection-heading">${t('Objective → Actions and KPIs → Recovery','الهدف ← الإجراءات والمؤشرات ← التعافي')}</h3>${objectiveActionLinks(i)}${objectiveMeasures(i)}`);
}
function strategy(){return strategyWorkspace()}

function bindConnections(){
  bindWorkspace();
  document.querySelectorAll('[data-objective-action]').forEach(el=>el.onclick=()=>simpleActionForm(undefined,undefined,undefined,Number(el.dataset.objectiveAction)));

  document.querySelectorAll('[data-objective]').forEach(el=>el.onclick=e=>{e.stopPropagation();objectiveDetail(el.dataset.objective)});
  document.querySelectorAll('[data-linked-action]').forEach(el=>el.onclick=e=>{e.stopPropagation();actionDetail(el.dataset.linkedAction)});
  document.querySelectorAll('[data-create-action-plan]').forEach(el=>el.onclick=e=>{e.stopPropagation();actionForm(el.dataset.createActionPlan,undefined,'Action plan')});
  document.querySelectorAll('[data-create-recovery]').forEach(el=>el.onclick=e=>{e.stopPropagation();recoveryStart(el.dataset.createRecovery)});
  document.querySelectorAll('[data-kpi-actions]').forEach(el=>el.onclick=e=>{e.stopPropagation();linkedActionKpi=el.dataset.kpiActions;linkedActionGoal='';actionQuery='';actionFilter=actionOwner=actionPriority=planTypeFilter='All';close();go('actions')});
  document.querySelectorAll('[data-objective-actions]').forEach(el=>el.onclick=()=>{linkedActionGoal=el.dataset.objectiveActions;linkedActionKpi='';actionQuery='';actionFilter=actionOwner=actionPriority=planTypeFilter='All';close();go('actions')});
  document.querySelectorAll('[data-objective-kpis]').forEach(el=>el.onclick=()=>{registryGoal=el.dataset.objectiveKpis;query='';filter='All statuses';close();go('kpi')});
}

function registry(){
  return `<div class="filterbar"><select id="registry-goal" aria-label="${t('Filter by objective','تصفية حسب الهدف')}"><option value="">${t('All objectives','كل الأهداف')}</option>${goals.map((g,i)=>`<option value="${i}"${registryGoal===String(i)?' selected':''}>${escapeHtml(g.name)} / ${escapeHtml(g.objective)}</option>`).join('')}</select><input id="kpi-search" value="${escapeHtml(query)}" placeholder="${t('Search by KPI name, ID or owner','البحث بالاسم أو الرمز أو المسؤول')}" aria-label="${t('Filter KPIs','تصفية المؤشرات')}"><select id="status-filter" aria-label="${t('Filter by status','تصفية حسب الحالة')}">${['All statuses',...Object.keys(statusFilters),'Draft'].map(s=>`<option${filter===s?' selected':''}>${s}</option>`).join('')}</select></div><div class="panel kpi-list" id="kpi-results">${table(filtered())}</div>`;
}

let dataSourceFilter='';
function dataHub(){
  const items=scoped().filter(k=>!dataSourceFilter||k.source===dataSourceFilter),available=globalAccess()&&department==='All departments'?sourceDirectory():[...new Set(visibleKpis().filter(k=>k.dept===department).map(k=>k.source))],sources=available.filter(source=>!dataSourceFilter||source===dataSourceFilter);
  return `<section class="panel connection-intro"><div class="eyebrow">${t('INCOMING DATA','البيانات الواردة')}</div><h2>${t('Source application → KPI actual → Performance & recovery','التطبيق المصدري ← القيمة الفعلية ← الأداء والتعافي')}</h2><p>${t('Actuals and confidence flags are supplied by the source applications. Set targets in the KPI registry; review incoming results here. Actuals cannot be entered or changed in this application.','تُورد التطبيقات المصدرية القيم الفعلية ومؤشرات الثقة. حدد المستهدفات في سجل المؤشرات وراجع النتائج الواردة هنا. لا يمكن إدخال القيم الفعلية أو تعديلها في هذا التطبيق.')}</p><span class="pill amber">${t('Demo data · Live integrations not connected','بيانات تجريبية · التكاملات الحية غير متصلة')}</span></section>${dataSourceFilter?`<p class="scope-note">Source: ${escapeHtml(dataSourceFilter)} <button id="clear-source-filter">Show all sources</button></p>`:''}<div class="report-grid">${sources.map(source=>{const rows=items.filter(k=>k.source===source);return `<section class="panel pad"><div class="eyebrow">${t('SOURCE APPLICATION','التطبيق المصدري')}</div><h3>${escapeHtml(source)}</h3><p class="muted">Source owner: ${escapeHtml(appConfig.sourceProfiles[source]?.owner||'Not configured')} · Expected refresh: ${escapeHtml(appConfig.sourceProfiles[source]?.frequency||'Not configured')}</p><p>${rows.length} ${t('mapped KPIs','مؤشرات مرتبطة')} · ${period()}</p><p class="muted">${t('Connection: not configured. Displayed values are synthetic examples, not a live sync.','الاتصال غير مُعد. القيم المعروضة أمثلة اصطناعية وليست مزامنة حية.')}</p>${rows.map(k=>`<button class="objective-kpi" data-kpi="${escapeHtml(k.id)}"><strong>${escapeHtml(name(k))}</strong><small>${escapeHtml(k.id)} ← ${escapeHtml(k.sourceKey||k.id)} · ${t('External actual','القيمة الفعلية الخارجية')}: ${value(k)} · ${escapeHtml(k.confidence)}</small></button>`).join('')}</section>`}).join('')}</div><div class="panel"><div class="panel-head"><h2>${t('Incoming actuals · Read only','القيم الفعلية الواردة · للقراءة فقط')}</h2><span class="pill neutral">${period()}</span></div>${table(items,true)}</div>`;
}

function assistantActions(){return visibleActions().filter(a=>department==='All departments'||planDepartment(a)===department)}
function aiView(){
  const items=scoped(),attention=items.filter(k=>status(k)!=='green').length,active=assistantActions().filter(a=>a.status!=='Closed');
  const prompts=[['attention',t('What needs attention?','ما الذي يحتاج انتباهاً؟')],['approvals',t('Review approvals','مراجعة الموافقات')],['targets',t('Help me set targets','ساعدني في إعداد المستهدفات')]];
  return `<div class="ask-workspace">
    <section class="assistant-home ask-home" aria-labelledby="ask-heading">
      <div class="ask-mark" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3 14.5 9.5 21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" stroke="currentColor" stroke-width="1.5"/></svg></div>
      <h2 id="ask-heading">${t('What would you like to know?','ما الذي تود معرفته؟')}</h2>
      <p class="ask-intro">${t('Find a record, understand performance, or take your next step.','اعثر على سجل، وافهم الأداء، وحدد خطوتك التالية.')}</p>
      <form id="ask-form" class="ask-composer" role="search"><label class="sr-only" for="ask-input">${t('Ask IQ or search your workspace','اسأل IQ أو ابحث في مساحة العمل')}</label><input id="ask-input" required maxlength="240" autocomplete="off" placeholder="${t('Ask a question or search your workspace…','اطرح سؤالاً أو ابحث في مساحة العمل…')}" aria-describedby="ask-scope"><button type="submit" class="primary">${t('Ask IQ','Ask IQ')} <span aria-hidden="true">↗</span></button></form>
      <div class="assistant-prompts">${prompts.map(([id,label])=>`<button type="button" data-ask="${id}">${label}</button>`).join('')}</div>
      <p class="ask-scope" id="ask-scope">${escapeHtml(department==='All departments'?t('All departments','كل الإدارات'):department)} <span aria-hidden="true">·</span> ${period()}</p>
    </section>
    <div class="ask-pulse" aria-label="${t('Workspace snapshot','لمحة عن مساحة العمل')}">
      <button data-ask="attention"><strong>${attention}</strong><span>${t('Need attention','تحتاج انتباهاً')}</span><span aria-hidden="true">↗</span></button>
      <button data-ask="recovery"><strong>${active.length}</strong><span>${t('Active plans','خطط نشطة')}</span><span aria-hidden="true">↗</span></button>
      <button data-ask="overdue"><strong>${active.filter(overdue).length}</strong><span>${t('Overdue','متأخرة')}</span><span aria-hidden="true">↗</span></button>
    </div>
    <div class="ask-result-heading"><span class="eyebrow" id="ask-result-label">${t('YOUR PRIORITIES','أولوياتك')}</span><button type="button" class="ghost" id="ask-reset" hidden>${t('Start over','البدء من جديد')} <span aria-hidden="true">↺</span></button></div>
    <section class="panel assistant-answer" id="chat" aria-live="polite" aria-atomic="true" aria-labelledby="ask-result-label">${assistantAnswer('attention')}</section>
    <details class="ask-explore"><summary>${t('Explore more','استكشف المزيد')} <span aria-hidden="true">+</span></summary><div class="ask-tools">
      <button data-ask="help">${t('How ITQAN IQ works','كيف يعمل ITQAN IQ')} <span aria-hidden="true">↗</span></button>
      <button data-ask="data">${t('Where actuals come from','مصادر القيم الفعلية')} <span aria-hidden="true">↗</span></button>
      <button data-assistant-nav="strategy">${t('Explore objectives','استكشف الأهداف')} <span aria-hidden="true">↗</span></button>
      <button data-assistant-nav="actions">${t('Manage plans','إدارة الخطط')} <span aria-hidden="true">↗</span></button>
    </div></details>
    <p class="ask-disclosure">${t('Demo workspace guide · Searches available records and provides workflow guidance. Live AI is not connected.','دليل مساحة العمل التجريبي · يبحث في السجلات المتاحة ويوفر إرشادات العمل. الذكاء الاصطناعي المباشر غير متصل.')}</p>
  </div>`;
}

function assistantKpiRows(list,targets=false){
  return list.map(k=>`<div class="assistant-result"><div><strong>${escapeHtml(name(k))}</strong><small>${escapeHtml(k.id)} · ${value(k)} / ${targetText(k)}</small></div>${pill(status(k))}<button data-kpi="${escapeHtml(k.id)}">${targets?t('Open target setup','فتح إعداد المستهدفات'):t('Review KPI','مراجعة المؤشر')} →</button></div>`).join('');
}
function assistantAnswer(intent,question=''){
  const items=scoped();let title='',copy='',html='';
  if(intent==='help')return applicationHelp();
  if(intent==='approvals')return `<h2>Approvals</h2><p>Department review precedes Strategy review. Open a request to see submitted changes, decisions and the next approval stage.</p>${visibleApprovals().filter(r=>department==='All departments'||r.department===department).slice(0,12).map(r=>`<div class="assistant-result"><div><strong>${escapeHtml(r.summary)}</strong><small>${escapeHtml(r.id)} ? ${escapeHtml(r.status)}</small></div><button data-request="${r.id}">Review request</button></div>`).join('')||'<p>No approval requests in this scope.</p>'}<button data-assistant-nav="approvals">Open Approvals</button>`;
  if(intent==='targets'){
    title=t('Set targets in KPI details','أعد المستهدفات في تفاصيل المؤشر');copy=isCurrent()?t('Choose a KPI below. Edit Target and Amber boundary, then submit for approval. Published targets change after Department and Strategy review. Actuals stay read only.','اختر مؤشراً وعدّل المستهدف وحد التحذير ثم أرسله للموافقة. القيم الفعلية للقراءة فقط.'):t('Historical targets are read only. Switch to the current period to edit targets.','المستهدفات التاريخية للقراءة فقط. انتقل للفترة الحالية لتعديل المستهدفات.');
    html=(isCurrent()?'':`<button data-assistant-nav="current-targets">${t('Use current period','استخدام الفترة الحالية')} →</button>`)+assistantKpiRows(items,true)+`<button data-assistant-nav="targets">${t('Open KPI registry','فتح سجل المؤشرات')} →</button>`;
  }else if(intent==='data'){
    title=t('Actuals come from source applications','القيم الفعلية تأتي من التطبيقات المصدرية');copy=t('Set targets here; external data flows supply actuals and confidence. Data flows shows each KPI’s source. Live integrations are not connected in this demo.','حدد المستهدفات هنا؛ توفر التدفقات الخارجية القيم الفعلية والثقة. تعرض تدفقات البيانات مصدر كل مؤشر. التكاملات الحية غير متصلة في هذا النموذج.');html=`<button data-assistant-nav="data">${t('Open data flows','فتح تدفقات البيانات')} →</button>`;
  }else if(intent==='strategy'){
    title=t('Follow your objective to its KPIs and recovery','تتبع هدفك إلى مؤشراته وإجراءات التعافي');copy=t('Choose an objective to see its connected measures and actions.','اختر هدفاً لعرض مؤشراته وإجراءاته المرتبطة.');html=goals.map((g,i)=>goalItems(i).length?`<button class="assistant-objective" data-objective="${i}">${escapeHtml(g.objective)} →</button>`:'').join('');
  }else if(intent==='recovery'||intent==='overdue'){
    const list=assistantActions().filter(a=>intent==='overdue'?overdue(a):a.status!=='Closed');title=intent==='overdue'?t('Follow up on overdue actions','تابع الإجراءات المتأخرة'):t('Move recovery forward','ادفع التعافي إلى الأمام');copy=list.length?t(`${list.length} current actions in this department scope. Open an action to review progress and next steps.`,`${list.length} إجراءات حالية ضمن نطاق الإدارة. افتح إجراءً لمراجعة التقدم والخطوات التالية.`):t('No matching actions in this department scope.','لا توجد إجراءات مطابقة ضمن نطاق الإدارة.');html=list.slice(0,3).map(a=>`<div class="assistant-result"><div><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.owner)} · ${t('Due','الاستحقاق')} ${escapeHtml(a.due)}</small></div><button data-linked-action="${escapeHtml(a.id)}">${t('Open action','فتح الإجراء')} →</button></div>`).join('')+`<button data-assistant-nav="${intent==='overdue'?'overdue':'actions'}">${t('Open recovery board','فتح لوحة التعافي')} →</button>`;
  }else if(intent==='attention'){
    const order={red:0,missing:1,amber:2,green:3},list=items.filter(k=>status(k)!=='green').sort((a,b)=>order[status(a)]-order[status(b)]);
    title=!items.length?t('No KPIs in this scope','لا توجد مؤشرات ضمن هذا النطاق'):list.length?t('Start with these KPIs','ابدأ بهذه المؤشرات'):t('Your KPIs are on track','مؤشراتك على المسار الصحيح');copy=!items.length?t('Choose another department or reporting period.','اختر إدارة أو فترة تقرير أخرى.'):list.length?t(`${list.length} KPIs need attention in ${period()}. Open one to review its target, objective and recovery actions.`,`${list.length} مؤشرات تحتاج انتباهاً في ${period()}. افتح مؤشراً لمراجعة مستهدفه وهدفه وإجراءات تعافيه.`):t(`All ${items.length} KPIs meet their targets in ${period()}.`, `كل المؤشرات وعددها ${items.length} تحقق مستهدفاتها في ${period()}.`);html=assistantKpiRows(list.slice(0,3))+`<button data-assistant-nav="impact">${t('View all performance issues','عرض جميع مشكلات الأداء')} →</button>`;
  }else{return searchResults(question)}
  return `${question?`<p class="assistant-query">${escapeHtml(question)}</p>`:''}<h2>${title}</h2><p>${copy}</p>${html}`;
}
function bindAssistant(){
  if($('#ask-reset'))$('#ask-reset').onclick=()=>{
    $('#ask-input').value='';
    $('#chat').innerHTML=assistantAnswer('attention');
    $('#ask-result-label').textContent=t('YOUR PRIORITIES','أولوياتك');
    $('#ask-reset').hidden=true;
    document.querySelectorAll('[data-ask]').forEach(el=>el.removeAttribute('aria-pressed'));
    bindAssistant();$('#ask-input').focus();
  };
  document.querySelectorAll('[data-ask]').forEach(el=>el.onclick=()=>ask('',el.dataset.ask));
  document.querySelectorAll('[data-assistant-nav]').forEach(el=>el.onclick=()=>{
    const dest=el.dataset.assistantNav;
    if(dest==='current-targets'){periodIndex=Data.latest;render();ask('','targets');return}
    if(dest==='targets'){registryGoal='';query='';filter='All statuses';go('kpi');return}
    if(dest==='actions'||dest==='overdue'){linkedActionKpi=linkedActionGoal='';actionQuery='';actionOwner=actionPriority='All';actionFilter=dest==='overdue'?'Overdue':'All';go('actions');return}
    go(dest);
  });
  document.querySelectorAll('[data-search-source]').forEach(el=>el.onclick=()=>{dataSourceFilter=el.dataset.searchSource;go('data')});
  bindKpis();bindConnections();bindGovernance();
}

let impactFilter='attention';
function impact(){
  const items=scoped(),breached=items.filter(k=>status(k)!=='green');
  const critical=breached.filter(k=>{const b=Data.breach(k,health(k.goal));return b&&b.risk});
  return `<div class="panel"><div class="panel-head"><div><h2>${t('Performance exposure','الانكشاف على الأداء')}</h2><p>${t('Review KPI gaps, updates, strategic impact and escalation. Create a KPI action or start recovery for Amber/Red results.','الاختراقات المحسوبة وأثرها الاستراتيجي · التعافي بمسؤولية بشرية')}</p></div><label class="field"><span>Show KPIs</span><select id="impact-filter"><option value="attention"${impactFilter==='attention'?' selected':''}>Needs attention</option><option value="all"${impactFilter==='all'?' selected':''}>All KPIs</option></select></label><span class="pill ${breached.length?'amber':'green'}">${plural(breached.length,'issue')}</span></div>${table(impactFilter==='all'?items:breached)}</div>${(impactFilter==='all'?items:breached).map(k=>{
    const b=Data.breach(k,health(k.goal))||{level:'On track',route:'No escalation needed'};
    return `<div class="detail-section"><span class="pill ${status(k)}">${b.level} · ${b.route}</span><h3>${escapeHtml(name(k))} → ${escapeHtml(goals[k.goal].objective)} → ${escapeHtml(name(goals[k.goal]))}</h3><p>${status(k)==='missing'?t('No observation was recorded for this period, so the measure cannot contribute to goal achievement.','لم تُسجل قراءة لهذه الفترة.'):`${t('Achievement','الإنجاز')} ${pct(score(k))} · ${value(k)} ${t('against a target of','مقابل مستهدف')} ${targetText(k)} · ${t(...trendText[Data.trend(k)])}.`}</p><p>${t('Parent goal achievement','إنجاز الهدف الأم')}: ${pct(health(k.goal))}. ${t('Escalation owner','مسؤول التصعيد')}: ${escapeHtml(b.route==='KPI owner'?k.owner:b.route==='Objective owner'?goals[k.goal].owner:b.route)}.</p>${recoveryLinks(k)}${impactUpdates(k)}<button data-kpi="${k.id}">${t('Review impact & recovery','مراجعة الأثر والتعافي')} →</button></div>`}).join('')||`<div class="detail-section"><p class="empty">${t('No breaches in this scope for the selected period.','لا توجد اختراقات ضمن هذا النطاق.')}</p></div>`}${critical.length?`<p class="scope-note">◷ ${t(`${plural(critical.length,'measure')} met the critical rule: a repeated Off track result, or a parent goal below ${appConfig.green}% achievement.`,'مؤشرات بلغت مستوى التصعيد الحرج.')}</p>`:''}`;
}

const actionLabels={Open:['Open','مفتوح'],'In progress':['In progress','قيد التنفيذ'],Closed:['Closed','مغلق'],High:['High','عالية'],Medium:['Medium','متوسطة'],Low:['Low','منخفضة']};
const actionLabel=v=>actionLabels[v]?t(...actionLabels[v]):v;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const overdue=a=>a.status!=='Closed'&&a.due<today();
const recoveryPeriodIndexes=()=>Array.from({length:appConfig.recoveryPeriods},(_,i)=>Data.latest-appConfig.recoveryPeriods+1+i);
const recoveryCount=()=>ar?displayNumber(appConfig.recoveryPeriods):appConfig.recoveryPeriods===2?'two':String(appConfig.recoveryPeriods);
const actionReady=a=>{if(isActionPlan(a))return false;const k=raw(a.kpi);return !!k&&!k.draft&&Data.recoveryReady(k,appConfig.recoveryPeriods)};
function actionScope(){return visibleActions().filter(a=>(department==='All departments'||planDepartment(a)===department)&&(!linkedActionKpi||a.kpi===linkedActionKpi)&&(linkedActionGoal===''||String(planGoal(a))===linkedActionGoal))}
let planTypeFilter='All';
function filteredActions(){
  return actionScope().filter(a=>planTypeFilter==='All'||a.planType===planTypeFilter).filter(a=>`${a.title} ${a.owner} ${a.kpi} ${raw(a.kpi)?.name||''} ${a.effect}`.toLowerCase().includes(actionQuery.toLowerCase().trim()))
    .filter(a=>actionOwner==='All'||a.owner===actionOwner).filter(a=>actionPriority==='All'||a.priority===actionPriority)
    .filter(a=>actionFilter==='All'||(actionFilter==='Review due'?reviewDue(a):actionFilter==='Blocked'?!isActionPlan(a)&&a.reviews?.[0]?.outcome==='Blocked'&&a.status!=='Closed':actionFilter==='Overdue'?overdue(a):actionFilter==='Ready'?a.status==='In progress'&&actionReady(a):a.status===actionFilter))
    .sort((a,b)=>Number(overdue(b))-Number(overdue(a))||a.due.localeCompare(b.due));
}
function actionBoard(){
  const list=actionScope();
  const metrics=[[t('Active plans','الإجراءات النشطة'),list.filter(a=>a.status!=='Closed').length],[t('Overdue','متأخرة'),list.filter(overdue).length],[t('Recovery verified','التعافي متحقق'),list.filter(a=>a.status==='In progress'&&actionReady(a)).length],[t('Closed','مغلق'),list.filter(a=>a.status==='Closed').length]];
  return `${linkedActionKpi||linkedActionGoal!==''?`<div class="connection-scope"><span>${t('Linked to','مرتبط بـ')}: <strong>${escapeHtml(linkedActionKpi?(raw(linkedActionKpi)?.name||linkedActionKpi):goals[Number(linkedActionGoal)].objective)}</strong></span><button id="clear-action-link">${t('Show all connections','عرض كل الروابط')}</button></div>`:''}<div class="metrics">${metrics.map(([label,n])=>`<div class="metric"><div class="metric-top">${label}</div><strong>${String(n).padStart(2,'0')}</strong></div>`).join('')}</div>
  <div class="monitoring-strip"><span>${list.filter(reviewDue).length} ${t('reviews due','مراجعات مستحقة')}</span><span>${list.filter(a=>!isActionPlan(a)&&a.status!=='Closed'&&a.reviews?.[0]?.outcome==='Blocked').length} ${t('blocked plans','خطط متعطلة')}</span><span>${list.filter(a=>a.status!=='Closed'&&planGaps(a).length).length} ${t('plans to complete','خطط تحتاج استكمالاً')}</span></div><div class="panel action-intro"><div><h2>${t('Action plans & recovery','خطط العمل والتعافي')}</h2><p class="muted">${t('Action plans deliver a task for an objective or KPI. Recovery plans restore a KPI below target through corrective steps and performance reviews.','تنفذ خطط العمل مهام مرتبطة بهدف تشغيلي أو مؤشر. وتعالج خطط التعافي فجوات الأداء من خلال إجراءات تصحيحية ومراجعات دورية.')}</p></div></div>
  ${canWrite()?'<div class="plan-entry-options"><button class="primary" id="new-recovery">＋ Create recovery plan</button><p>Action: deliver a task. Recovery: restore an Amber or Red KPI. Both use the same forms and approvals from every screen.</p></div>':''}<div class="plan-type-tabs" aria-label="Plan type">${['All','Action plan','Recovery plan'].map(type=>`<button data-plan-type="${type}" aria-pressed="${planTypeFilter===type}">${type==='All'?'All plans':type==='Action plan'?'Action plans':'Recovery plans'}</button>`).join('')}<button id="review-kpi-gaps">Review KPI gaps →</button></div><div class="action-filters"><label class="field"><span>${t('Search plans','البحث في الإجراءات')}</span><input id="action-search" value="${escapeHtml(actionQuery)}" placeholder="${t('Title, KPI or owner…','العنوان أو المؤشر أو المسؤول')}"></label>
  <label class="field"><span>${t('Status','الحالة')}</span><select id="action-filter">${[['All',t('All plans','كل الإجراءات')],...['Open','In progress','Closed'].map(v=>[v,actionLabel(v)]),['Review due',t('Review due','حان موعد المراجعة')],['Blocked',t('Blocked','متعطلة')],['Overdue',t('Overdue','متأخرة')],['Ready',t('Recovery verified','التعافي متحقق')]].map(([v,l])=>`<option value="${v}"${v===actionFilter?' selected':''}>${l}</option>`).join('')}</select></label>
  <label class="field"><span>${t('Owner','المسؤول')}</span><select id="action-owner-filter"><option value="All">${t('All owners','كل المسؤولين')}</option>${[...new Set(visibleActions().map(a=>a.owner))].sort().map(o=>`<option${o===actionOwner?' selected':''}>${escapeHtml(o)}</option>`).join('')}</select></label>
  <label class="field"><span>${t('Priority','الأولوية')}</span><select id="action-priority-filter"><option value="All">${t('All priorities','كل الأولويات')}</option>${['High','Medium','Low'].map(v=>`<option value="${v}"${v===actionPriority?' selected':''}>${actionLabel(v)}</option>`).join('')}</select></label><button id="action-clear">${t('Clear filters','مسح عوامل التصفية')}</button></div><div id="action-results">${actionLanes()}</div>`;
}
function actionLanes(){
  const list=filteredActions();
  return `<p class="muted" role="status">${list.length} ${t('plans shown','إجراءات معروضة')}</p><div class="kanban">${['Open','In progress','Closed'].map(lane=>`<section class="lane"><h2>${actionLabel(lane)} <span class="lane-count">${list.filter(a=>a.status===lane).length}</span></h2>${list.filter(a=>a.status===lane).map(a=>{
    const k=raw(a.kpi),view=k?Data.at(k,periodIndex):null,done=a.milestones.filter(m=>m.done).length;
    return `<article class="action-card"><div class="action-badges"><span class="pill neutral">${escapeHtml(a.planType)} · ${escapeHtml(pendingRequest('Plan',a.id)?.status||a.approvalStatus)}</span><span class="pill ${a.priority==='High'?'red':'neutral'}">${actionLabel(a.priority)}</span>${overdue(a)?`<span class="pill red">${t('Overdue','متأخرة')}</span>`:''}</div><h3>${escapeHtml(a.title)}</h3><button class="action-objective" data-objective="${planGoal(a)}"><small>${t('Supports objective','يدعم الهدف')}</small>${escapeHtml(goals[planGoal(a)].objective)}</button><p>${escapeHtml(a.effect)}</p>${k?`<button class="action-kpi" data-kpi="${escapeHtml(a.kpi)}">${escapeHtml(a.kpi)} · ${t(...statusText[status(view)])}</button>`:`<span class="pill neutral">Objective action · ${escapeHtml(planDepartment(a))}</span>`}<p class="monitor-card-status">${monitorLabel(a)}</p>${isActionPlan(a)?'':`<p class="muted">${t('Next review','المراجعة التالية')}: ${escapeHtml(a.plan?.nextReview||'—')}</p>`}<p class="muted">${escapeHtml(a.owner)}<br>${t('Due','الاستحقاق')} ${escapeHtml(a.due)}</p>${a.milestones.length?`<label class="milestone-progress">${done}/${a.milestones.length} ${t('milestones complete','مراحل مكتملة')}<progress value="${done}" max="${a.milestones.length}"></progress></label>`:''}${lane==='In progress'?`<p class="recovery-hint">${a.planType==='Action plan'?t('Complete the task and submit delivery evidence.','أكمل المهمة وقدم دليل التنفيذ.'):actionReady(a)?t(`✓ ${recoveryCount()} Green periods verified`,`تم التحقق من ${recoveryCount()} فترات على المسار الصحيح`):t(`Awaiting ${recoveryCount()} Green periods`,`بانتظار ${recoveryCount()} فترات على المسار الصحيح`)}</p>`:''}<button data-action="${escapeHtml(a.id)}">${t('Manage plan','إدارة الإجراء')} →</button></article>`;
  }).join('')||`<p class="empty">${t('No matching plans','لا توجد إجراءات مطابقة')}</p>`}</section>`).join('')}</div>`;
}
let applyingApproval=false;
function recordAction(a,event){
  const stored=actions.find(x=>x.id===a.id);if(!applyingApproval)assertPlanWrite(a);
  if(!applyingApproval&&pendingRequest('Plan',a.id))throw Error('This plan is awaiting approval.');
  const structure=v=>JSON.stringify({title:v.title,owner:v.owner,due:v.due,effect:v.effect,priority:v.priority,plan:{...v.plan,nextReview:undefined},milestones:v.milestones.map(m=>({title:m.title,owner:m.owner,due:m.due}))});
  if(stored&&stored!==a&&!applyingApproval&&stored.approvalStatus==='Approved'&&structure(stored)!==structure(a)){
    submitRequest('Plan amendment','Plan',stored,a,a.title);return;
  }
  a.history.unshift({event,time:new Date().toISOString(),actor:currentUser()?.name});a.version=entityVersion(stored||a)+1;
  if(stored&&stored!==a)Object.assign(stored,a);
  persist(`${a.title}: ${event}`,planDepartment(a));
}

function planGaps(a){
  if(isActionPlan(a))return ['title','owner','effect'].filter(key=>!a[key]?.trim()).concat(validDate(a.due)?[]:['due date']);
  const p=a.plan||{};
  return ['title','owner','effect'].filter(key=>!a[key]?.trim()).concat(validDate(a.due)?[]:['due date']).concat(!kpis.some(k=>k.id===a.kpi&&!k.draft)?['published KPI']:[]).concat(['rootCause','correction','successCriteria','reviewer','cadence','nextReview'].filter(key=>!p[key]?.trim()).concat(!validDate(p.nextReview)||!['Weekly','Fortnightly','Monthly'].includes(p.cadence)?['review schedule']:[]).concat(!a.milestones.length?['milestones']:[]));
}
const nextReviewDate=a=>{const d=new Date();if(a.plan?.cadence==='Monthly'){const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+1);const lastDay=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,lastDay))}else d.setDate(d.getDate()+(a.plan?.cadence==='Fortnightly'?14:7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const reviewDue=a=>!isActionPlan(a)&&a.status!=='Closed'&&!!a.plan?.nextReview&&a.plan.nextReview<=today();
const reviewSnapshot=a=>{const k=raw(a.kpi);return k?recoveryPeriodIndexes().map(i=>{const v=Data.at(k,i);return {period:Data.periods[i],actual:v.actual,target:v.target,amber:v.amber,status:status(v),unit:v.unit}}):[]};
const effectiveReview=a=>{const r=a.reviews?.[0];return !!r&&!reviewDue(a)&&r.outcome==='Effective'&&r.revision===a.revision&&JSON.stringify(r.observations)===JSON.stringify(reviewSnapshot(a))};
const monitorLabel=a=>isActionPlan(a)?(a.status==='Closed'?'Completed':overdue(a)?'Delivery overdue':a.status==='In progress'?'Delivery in progress':'Awaiting start'):a.status==='Closed'?t('Closed','مغلقة'):a.reviews?.[0]?.outcome==='Blocked'?t('Blocked','متعطلة'):reviewDue(a)?t('Review due','حان موعد المراجعة'):planGaps(a).length?t('Plan incomplete','خطة غير مكتملة'):t('Monitoring scheduled','المراقبة مجدولة');
function planPanel(a,locked){
  const p=a.plan||{},fields=[['rootCause',t('Root cause and supporting evidence','السبب الجذري والأدلة')],['correction',t('Corrective steps','الخطوات التصحيحية')],['prevention',t('Prevent recurrence (optional)','منع التكرار (اختياري)')],['successCriteria',t('Measurable success criteria','معايير النجاح القابلة للقياس')]];
  return `<section class="detail-section"><h3>1. ${t('Corrective plan','الخطة التصحيحية')}</h3><p class="muted">${t('Link the cause to specific steps and a measurable outcome. Actual KPI values come from the source application.','اربط السبب بخطوات محددة ونتيجة قابلة للقياس. تأتي القيم الفعلية من التطبيق المصدري.')}</p><form id="corrective-plan-form">${fields.map(([key,label])=>`<label for="plan-${key}">${label}</label><textarea id="plan-${key}" ${key==='prevention'?'':'required'} maxlength="2000" ${locked?'disabled':''}>${escapeHtml(p[key]||'')}</textarea>`).join('')}<label for="plan-reviewer">${t('Review owner','مسؤول المراجعة')}</label><input id="plan-reviewer" required maxlength="100" value="${escapeHtml(p.reviewer||'')}" ${locked?'disabled':''}><label for="plan-cadence">${t('Review frequency','دورية المراجعة')}</label><select id="plan-cadence" ${locked?'disabled':''}>${lookupOptions('reviewCadences',p.cadence||appConfig.reviewCadence)}</select><label for="plan-nextReview">${t('Next review date','تاريخ المراجعة التالية')}</label><input id="plan-nextReview" type="date" required value="${escapeHtml(p.nextReview||'')}" ${locked?'disabled':''}><p id="plan-error" role="alert"></p>${locked?'':`<button>${t('Save corrective plan','حفظ الخطة التصحيحية')}</button>`}</form></section>`;
}
function milestonesPanel(a,locked,optional=false){
  return `<section class="detail-section"><h3>2. ${t('Delivery milestones','مراحل التنفيذ')}</h3>${a.milestones.map((m,i)=>`<form class="milestone-edit" data-milestone-form="${i}"><strong>${escapeHtml(m.title)}</strong><span class="pill ${m.done?'green':m.due&&m.due<today()?'red':'neutral'}">${m.done?t('Complete','مكتملة'):t('Pending','قيد الانتظار')}</span><label>${t('Owner','المسؤول')}<input name="owner" required maxlength="100" value="${escapeHtml(m.owner||'')}" ${locked?'disabled':''}></label><label>${t('Due date','تاريخ الاستحقاق')}<input name="due" type="date" required max="${escapeHtml(a.due)}" value="${escapeHtml(m.due||'')}" ${locked?'disabled':''}></label><label>${t('Completion evidence','دليل الإنجاز')}<textarea name="evidence" maxlength="2000" ${locked?'disabled':''}>${escapeHtml(m.evidence||'')}</textarea></label><label class="milestone-row"><input type="checkbox" name="done" data-milestone="${i}" ${m.done?'checked':''} ${locked?'disabled':''}>${t('Completed','مكتملة')}</label><p class="milestone-error" role="alert"></p>${locked?'':`<button>${t('Save milestone','حفظ المرحلة')}</button>`}</form>`).join('')||`<p class="muted">${t('Add at least one owned, dated milestone before starting.','أضف مرحلة واحدة على الأقل بمسؤول وتاريخ قبل البدء.')}</p>`}${locked?'':`<form id="milestone-form"><label for="milestone-title">${t('New milestone','مرحلة جديدة')}</label><input id="milestone-title" required maxlength="160"><label for="milestone-owner">${t('Owner','المسؤول')}</label><input id="milestone-owner" required maxlength="100" value="${escapeHtml(a.owner)}"><label for="milestone-due">${t('Due date','تاريخ الاستحقاق')}</label><input id="milestone-due" type="date" required max="${escapeHtml(a.due)}" value="${escapeHtml(a.due)}"><p id="milestone-error" role="alert"></p><button>${t('Add milestone','إضافة مرحلة')}</button></form>`}</section>`;
}
function monitoringPanel(a,locked){
  return `<section class="detail-section"><h3>3. ${t('Monitoring & effectiveness','المتابعة والفعالية')}</h3><span class="pill ${reviewDue(a)?'amber':'neutral'}">${monitorLabel(a)}</span><p>${t('Review owner','مسؤول المراجعة')}: ${escapeHtml(a.plan?.reviewer||'—')} · ${escapeHtml(a.plan?.cadence||'—')}<br>${t('Next review','المراجعة التالية')}: ${escapeHtml(a.plan?.nextReview||'—')}</p>${!locked&&a.status==='In progress'?`<form id="monitor-form"><label for="monitor-outcome">${t('Assessment','التقييم')}</label><select id="monitor-outcome"><option value="Monitoring">${t('Monitoring — not yet effective','قيد المتابعة — لم تثبت الفعالية')}</option><option value="Blocked">${t('Blocked — intervention needed','متعطلة — تحتاج تدخلاً')}</option><option value="Effective">${t('Effective — outcome verified','فعالة — تم التحقق من النتيجة')}</option></select><label for="monitor-evidence">${t('Findings and evidence against success criteria','النتائج والأدلة مقابل معايير النجاح')}</label><textarea id="monitor-evidence" required maxlength="2000"></textarea><label for="monitor-blockers">${t('Blockers / escalation needed','العوائق / التصعيد المطلوب')}</label><textarea id="monitor-blockers" maxlength="1000"></textarea><label for="monitor-next">${t('Next review date','تاريخ المراجعة التالية')}</label><input id="monitor-next" type="date" required min="${today()}" value="${nextReviewDate(a)}"><p id="monitor-error" role="alert"></p><button>${t('Record monitoring review','تسجيل مراجعة المتابعة')}</button></form>`:!locked?`<p class="muted">${t('Complete and start the plan to record reviews.','أكمل الخطة وابدأها لتسجيل المراجعات.')}</p>`:''}${(a.reviews||[]).map(r=>`<article class="action-history"><strong>${escapeHtml(r.outcome)} · ${escapeHtml(r.reviewer)}</strong><small>${escapeHtml(new Date(r.time).toLocaleString())}</small><p>${escapeHtml(r.evidence)}</p>${r.blockers?`<p>${t('Blockers','العوائق')}: ${escapeHtml(r.blockers)}</p>`:''}<small>${t('Next review','المراجعة التالية')}: ${escapeHtml(r.nextReview)}</small>${r.observations.map(o=>`<p>${escapeHtml(o.period)}: ${fmt(o.actual,o.unit)} / ${fmt(o.target,o.unit)} · ${escapeHtml(o.status)}</p>`).join('')}</article>`).join('')||`<p class="muted">${t('No monitoring reviews recorded.','لم تسجل مراجعات متابعة.')}</p>`}</section>`;
}
function recordMonitoring(a,{outcome,evidence,blockers,nextReview}){
  assertPlanWrite(a);if(isActionPlan(a))throw Error('Action plans use delivery updates, not recovery monitoring.');if(a.approvalStatus!=='Approved'||pendingRequest('Plan',a.id))throw Error('Only approved plans can be monitored.');
  if(a.status!=='In progress'||planGaps(a).length)throw Error(t('Complete and start the corrective plan first.','أكمل الخطة التصحيحية وابدأها أولاً.'));
  if(!['Monitoring','Blocked','Effective'].includes(outcome)||!evidence.trim()||!validDate(nextReview)||nextReview<=today())throw Error(t('Add evidence and a future next review date.','أضف الأدلة وتاريخ مراجعة تالياً في المستقبل.'));
  if(outcome==='Blocked'&&!blockers.trim())throw Error(t('Describe the blocker and required intervention.','صف العائق والتدخل المطلوب.'));
  if(outcome==='Effective'&&((a.planType!=='Action plan'&&!actionReady(a))||a.milestones.some(m=>!m.done||!m.evidence?.trim()||!m.owner?.trim()||!m.due||m.due>a.due)))throw Error(t(`Effectiveness needs completed milestones and ${recoveryCount()} Green KPI results.`,`تتطلب الفعالية مراحل مكتملة ونتائج على المسار الصحيح خلال ${recoveryCount()} فترات.`));
  a.reviews.unshift({outcome,evidence:evidence.trim(),blockers:blockers.trim(),nextReview,reviewer:currentUser().name,reviewOwner:a.plan.reviewer,time:new Date().toISOString(),revision:a.revision,observations:reviewSnapshot(a)});a.plan.nextReview=nextReview;
  recordAction(a,'Monitoring review: '+outcome+'; '+evidence.trim());
}
function transitionAction(a,next,evidence=''){
  const record=visibleActions().find(x=>x.id===a.id);assertPlanWrite(record);
  if(record.approvalStatus!=='Approved'||pendingRequest('Plan',record.id))throw Error('Plan approval is required before execution.');
  if(next==='In progress'&&record.status==='Open')return applyTransition(record,next,evidence);
  const candidate=JSON.parse(JSON.stringify(record));applyingApproval=true;
  try{validateTransition(candidate,next,evidence)}finally{applyingApproval=false}
  return submitRequest(next==='Closed'?'Plan closure':'Plan reopening','Plan',record,{evidence,monitoring:isActionPlan(record)?null:record.reviews[0]||null,observations:isActionPlan(record)?[]:reviewSnapshot(record)},record.title);
}
function validateTransition(a,next,evidence=''){
  if(isActionPlan(a))return validateSimpleActionTransition(a,next,evidence);

  if(next==='In progress'&&a.status==='Open'){if(planGaps(a).length||a.milestones.some(m=>!m.owner?.trim()||!validDate(m.due)||m.due>a.due))throw Error(t('Complete the corrective plan and assign dated milestones before starting.','أكمل الخطة وحدد مسؤولاً وتاريخاً للمراحل قبل البدء.'));a.status=next;a.startedAt=new Date().toISOString()}
  else if(next==='Closed'&&a.status==='In progress'){
    if(a.planType!=='Action plan'&&!actionReady(a))throw Error(t(`Closure requires ${recoveryCount()} consecutive Green periods for a published KPI.`,`يتطلب الإغلاق ${recoveryCount()} فترات متتالية على المسار الصحيح لمؤشر منشور.`));
    if(a.milestones.some(m=>!m.done||!m.evidence?.trim()||!m.owner?.trim()||!m.due||m.due>a.due))throw Error(t('Complete all milestones before closure.','أكمل جميع المراحل قبل الإغلاق.'));
    if(!evidence.trim())throw Error(t('Add recovery evidence before closure.','أضف دليل التعافي قبل الإغلاق.'));
    if(planGaps(a).length||!effectiveReview(a))throw Error(t('Record an effective monitoring review for the current plan and KPI results before closure.','سجل مراجعة فعالية للخطة الحالية ونتائج المؤشر قبل الإغلاق.'));
    a.status=next;a.evidence=evidence.trim();a.closedAt=new Date().toISOString();
    const k=raw(a.kpi);a.closure={time:a.closedAt,evidence:a.evidence,monitoring:JSON.parse(JSON.stringify(a.reviews[0])),plan:JSON.parse(JSON.stringify(a.plan)),milestones:JSON.parse(JSON.stringify(a.milestones)),target:k.target,unit:k.unit,direction:k.direction,observations:recoveryPeriodIndexes().map(i=>({period:Data.periods[i],actual:k.history[i],target:Data.at(k,i).target,amber:Data.at(k,i).amber,status:Data.status(Data.at(k,i))}))};
  }else if(next==='In progress'&&a.status==='Closed'){
    if(!evidence.trim())throw Error(t('Enter a reason to reopen this action.','أدخل سبب إعادة فتح الإجراء.'));
    a.status=next;a.closedAt=null;a.revision++;a.notes.unshift({text:evidence.trim(),time:new Date().toISOString()});
  }else throw Error('Invalid action transition.');
}
function applyTransition(a,next,evidence=''){validateTransition(a,next,evidence);recordAction(a,`${next}${evidence.trim()?': '+evidence.trim():''}`);}
function actionDetail(id,workingCopy){
  const stored=visibleActions().find(x=>String(x.id)===String(id));if(!stored)return toast('Plan unavailable for your department.');
  if(isActionPlan(stored))return simpleActionDetail(stored,workingCopy);
  const a=JSON.parse(JSON.stringify(workingCopy?{...workingCopy,approvalStatus:stored.approvalStatus,version:stored.version}:stored));
  setDrawerRoute('plan:'+id,()=>actionDetail(id));
  const k=raw(a.kpi),locked=a.status==='Closed'||!!pendingRequest('Plan',a.id)||!canWrite();
  drawer(t('Manage recovery plan','إدارة خطة التعافي'),`${connectionPath(k,a)}${recoveryGap(k,a.trigger)}${requestStatus('Plan',a.id)}${recoveryWorkflowSummary(a)}<p class="eyebrow">${escapeHtml(a.planType)} · ${escapeHtml(pendingRequest('Plan',a.id)?.status||a.approvalStatus)}</p><div class="detail-section"><span class="pill ${a.status==='Closed'?'green':'neutral'}">${actionLabel(a.status)}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.effect)}</p><p>${escapeHtml(a.owner)} · ${escapeHtml(a.due)} · ${actionLabel(a.priority)}</p><button data-kpi="${escapeHtml(a.kpi)}">${escapeHtml(k?name(k):a.kpi)} →</button>${!locked?` <button id="edit-action">${t('Edit details','تعديل التفاصيل')}</button>`:''}</div>
  <div class="detail-section"><h3>${a.planType==='Action plan'?t('Linked KPI monitoring','متابعة المؤشر المرتبط'):t('Recovery verification','التحقق من التعافي')}</h3>${k?recoveryPeriodIndexes().map(i=>{const v=Data.at(k,i);return `<div class="recovery-period"><span>${Data.periods[i]}</span><strong>${value(v)}</strong>${pill(status(v))}</div>`}).join(''):`<p>${t('Linked KPI unavailable','المؤشر المرتبط غير متاح')}</p>`}<p class="muted">${a.planType==='Action plan'?t('Verify delivery against the plan’s success criteria. KPI results remain visible as context.','تحقق من التنفيذ مقابل معايير نجاح الخطة. تظهر نتائج المؤشر كسياق.'):t(`${recoveryCount()} consecutive Green results are required to close.`,`يتطلب الإغلاق ${recoveryCount()} فترات متتالية على المسار الصحيح.`)}</p></div>
  ${planPanel(a,locked)}${milestonesPanel(a,locked)}${monitoringPanel(a,locked)}
  <div class="detail-section"><h3>${t('Progress & evidence','التقدم والأدلة')}</h3>${!locked?`<form id="action-note-form"><label for="action-note">${t('Progress note','ملاحظة التقدم')}</label><textarea id="action-note" required maxlength="2000"></textarea><button>${t('Add update','إضافة تحديث')}</button></form>`:''}${a.notes.map(n=>`<div class="action-history"><small>${escapeHtml(new Date(n.time).toLocaleString(ar?'ar-AE':'en-GB'))}</small><p>${escapeHtml(n.text)}</p></div>`).join('')||`<p class="muted">${t('No progress updates yet.','لا توجد تحديثات بعد.')}</p>`}</div>
  ${a.closure?`<div class="detail-section"><h3>${t('Last closure record','سجل الإغلاق الأخير')}</h3><p>${escapeHtml(a.closure.evidence)}</p><small>${escapeHtml(a.closure.time)}</small>${a.closure.observations.map(o=>`<p>${escapeHtml(o.period)} · ${fmt(o.actual,a.closure.unit)} · ${t(...statusText[o.status])}</p>`).join('')}</div>`:''}
  ${a.approvalStatus!=='Approved'&&!pendingRequest('Plan',a.id)&&canWrite()?`<div class="detail-section"><p>Complete the plan and milestones, then submit. Execution begins after Department and Strategy approval.</p><button class="primary" id="submit-plan">Submit plan for approval</button><p id="submit-plan-error" role="alert"></p></div>`:''}<form id="action-transition" class="detail-section"><h3>4. ${t('Verification & closure','التحقق والإغلاق')}</h3><p class="muted">${a.planType==='Action plan'?t('Closure requires an approved plan, evidenced milestones and an effective outcome review. Department and Strategy approve closure.','يتطلب الإغلاق خطة معتمدة ومراحل موثقة ومراجعة فعالية وموافقتي الإدارة والاستراتيجية.'):t(`Closure requires a complete plan, evidenced milestones, ${recoveryCount()} Green KPI periods and a current effective monitoring review.`,`يتطلب الإغلاق خطة مكتملة ومراحل موثقة و${recoveryCount()} فترات على المسار الصحيح ومراجعة فعالية حديثة.`)}</p>${a.status!=='Open'?`<label for="recovery-evidence">${locked?t('Reason to reopen','سبب إعادة الفتح'):t('Recovery evidence / outcome','دليل التعافي / النتيجة')}</label><textarea id="recovery-evidence" required maxlength="2000">${locked?'':escapeHtml(a.evidence)}</textarea>`:''}<p id="action-error" role="alert"></p><button class="primary" ${pendingRequest('Plan',a.id)||a.approvalStatus!=='Approved'||!canWrite()?'disabled':''}>${a.status==='Open'?t('Start recovery','بدء التعافي'):locked?t('Reopen action','إعادة فتح الإجراء'):t('Verify recovery & close','تحقق من التعافي وأغلق')}</button></form>
  <div class="detail-section"><h3>${t('Action history','سجل الإجراء')}</h3>${a.history.map(h=>`<div class="action-history"><small>${escapeHtml(new Date(h.time).toLocaleString(ar?'ar-AE':'en-GB'))}</small><p>${escapeHtml(h.event)}</p></div>`).join('')||`<p class="muted">${t('Existing action · no recorded changes yet.','إجراء قائم · لم تسجل تغييرات بعد.')}</p>`}</div>`);
  if(!locked){
    $('#edit-action').onclick=()=>actionForm(a.kpi,a.id,a.planType,a);
    $('#corrective-plan-form').onsubmit=e=>{e.preventDefault();const p=Object.fromEntries(['rootCause','correction','prevention','successCriteria','reviewer','cadence','nextReview'].map(key=>[key,$('#plan-'+key).value.trim()]));if(Object.entries(p).some(([key,v])=>key!=='prevention'&&!v)){ $('#plan-error').textContent=t('Complete every plan field.','أكمل جميع حقول الخطة.');return}try{validateLookup('reviewCadences',p.cadence,a.plan?.cadence)}catch(err){$('#plan-error').textContent=err.message;return}a.plan=p;a.revision++;recordAction(a,'Corrective plan updated');render();actionDetail(a.id)};
    $('#milestone-form').onsubmit=e=>{e.preventDefault();const title=$('#milestone-title').value.trim(),owner=$('#milestone-owner').value.trim(),due=$('#milestone-due').value;if(!title||!owner||!validDate(due)||due>a.due){$('#milestone-error').textContent=t('Add a title, owner and date no later than the plan deadline.','أضف عنواناً ومسؤولاً وتاريخاً لا يتجاوز موعد الخطة.');return}a.milestones.push({title,owner,due,done:false,evidence:''});a.revision++;recordAction(a,'Milestone added: '+title);render();actionDetail(a.id)};
    document.querySelectorAll('[data-milestone-form]').forEach(form=>form.onsubmit=e=>{e.preventDefault();const m=a.milestones[Number(form.dataset.milestoneForm)],owner=form.elements.owner.value.trim(),due=form.elements.due.value,evidence=form.elements.evidence.value.trim(),done=form.elements.done.checked;if(!owner||!validDate(due)||due>a.due||(done&&!evidence)){form.querySelector('.milestone-error').textContent=t('Set owner and date within the deadline; completion requires evidence.','حدد المسؤول والتاريخ ضمن الموعد؛ يتطلب الإنجاز دليلاً.');return}Object.assign(m,{owner,due,evidence,done});a.revision++;recordAction(a,`${done?'Completed':'Updated'} milestone: ${m.title}`);render();actionDetail(a.id)});
    if($('#monitor-form'))$('#monitor-form').onsubmit=e=>{e.preventDefault();try{recordMonitoring(a,{outcome:$('#monitor-outcome').value,evidence:$('#monitor-evidence').value,blockers:$('#monitor-blockers').value,nextReview:$('#monitor-next').value});render();actionDetail(a.id)}catch(err){$('#monitor-error').textContent=err.message}};
    $('#action-note-form').onsubmit=e=>{e.preventDefault();const text=$('#action-note').value.trim();if(!text)return;a.notes.unshift({text,time:new Date().toISOString()});recordAction(a,'Progress update: '+text);render();actionDetail(a.id)};
  }
  if($('#submit-plan'))$('#submit-plan').onclick=()=>{try{if(planGaps(a).length||a.milestones.some(m=>!m.owner?.trim()||!validDate(m.due)||m.due>a.due))throw Error('Complete the plan and assign milestone owners and dates.');submitRequest('Plan approval','Plan',stored,a,a.title);render();actionDetail(a.id)}catch(err){$('#submit-plan-error').textContent=err.message}};
  $('#action-transition').onsubmit=e=>{e.preventDefault();try{transitionAction(a,locked||a.status==='Open'?'In progress':'Closed',a.status==='Open'?'':$('#recovery-evidence').value);render();actionDetail(a.id);toast(t('Action updated','تم تحديث الإجراء'))}catch(err){$('#action-error').textContent=err.message}};
}
function bindActionCards(){document.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>actionDetail(el.dataset.action));bindKpis();bindConnections()}

function reports(){
  const cards=[['Executive performance pack','Goal achievement, KPI status, owners and recovery priorities for the selected reporting period.','print','Preview / save PDF'],['KPI registry export','Published KPIs in scope with actuals, targets, achievement, status, confidence and source attribution.','csv','Download CSV'],['Department comparison','Compare equal-weight KPI achievement across departments for the selected period.','comparison','View comparison']];
  return `<div class="report-grid">${cards.map(([title,desc,id,label])=>`<div class="panel report-card"><span class="report-icon" aria-hidden="true">▧</span><h2>${title}</h2><p>${desc}</p><button data-report="${id}">${label} ↗</button></div>`).join('')}</div><div id="report-output"></div>`;
}


function auditView(){
  return `<div class="panel"><div class="panel-head"><div><h2>${t('Activity history','سجل النشاط')}</h2><p>${t('Local demonstration log · Not a tamper-evident production audit','سجل تجريبي محلي')}</p></div><span class="pill neutral">${plural(visibleAudit().length,'entry')}</span></div><div class="table-wrap"><table><thead><tr><th>${t('Event','الحدث')}</th><th>${t('Actor','المنفذ')}</th><th>${t('Timestamp','الوقت')}</th></tr></thead><tbody>${visibleAudit().map(a=>`<tr><td>${escapeHtml(a.event)}</td><td>${escapeHtml(a.actor)}</td><td>${escapeHtml(formatAuditTime(a.time))}</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- shared fragments ---------- */
function table(list,entry=false){
  return `<div class="table-wrap"><table><thead><tr><th>${t('KPI / accountable owner','المؤشر / المسؤول')}</th><th>${t('Objective / recovery','الهدف / التعافي')}</th><th>${t('Actual / target','الفعلي / المستهدف')}</th><th>${t('Achievement','الإنجاز')}</th><th>${t('Status','الحالة')}</th><th>${entry?t('Source application','التطبيق المصدري'):t('Trend','الاتجاه')}</th></tr></thead><tbody>${list.map(k=>{
    const tr=k.draft?'unavailable':Data.trend(k);
    return `<tr class="clickable" data-kpi="${k.id}" tabindex="0"><td><strong>${escapeHtml(name(k))}</strong><small>${escapeHtml(k.owner)} · ${escapeHtml(k.dept)}</small></td><td><button class="table-connection" data-objective="${k.goal}">${escapeHtml(goals[k.goal].objective)}</button><button class="table-connection" data-kpi-actions="${escapeHtml(k.id)}">${linkedActions(k.id).length} ${t('linked plans','خطط مرتبطة')} ↗</button></td><td><strong>${k.draft?'—':value(k)}</strong><small>${t('Target','المستهدف')} ${targetText(k)}</small></td><td><strong>${k.draft?'—':pct(score(k))}</strong></td><td>${k.draft?`<span class="pill amber">${t('Draft','مسودة')}</span>`:pill(status(k))}</td><td>${entry?`<span class="muted">${escapeHtml(k.source)}</span>`:`<span class="trend ${tr}"><span aria-hidden="true">${trendMark[tr]}</span> ${t(...trendText[tr])}</span>`}</td></tr>`}).join('')||`<tr><td colspan="6" class="empty">${t('No matching KPIs','لا توجد مؤشرات مطابقة')}</td></tr>`}</tbody></table></div>`;
}

function insights(){
  const items=scoped(),cards=[];
  const ratio=k=>k.direction==='lower'?k.target/k.actual:k.actual/k.target;
  const measured=items.filter(k=>finite(k.actual));
  const risky=measured.filter(k=>status(k)!=='green').sort((a,b)=>ratio(a)-ratio(b));
  const gaps=items.filter(k=>status(k)==='missing');
  const best=measured.filter(k=>status(k)==='green').sort((a,b)=>ratio(b)-ratio(a))[0];
  if(risky[0]){
    const k=risky[0],b=Data.breach(k,health(k.goal));
    cards.push([status(k)==='red'?'◎':'◷',status(k)==='red'?t('PRIORITY BREACH','اختراق ذو أولوية'):t('EARLY SIGNAL','إشارة مبكرة'),status(k)==='red'?'warn':'',t(`${name(k)} needs a closer look`,`${name(k)} يستحق نظرة أدق`),`${value(k)} ${t('against a target of','مقابل مستهدف')} ${targetText(k)} (${pct(score(k))} ${t('achievement','إنجاز')}, ${t(...trendText[Data.trend(k)]).toLowerCase()}). ${b?`${b.level} · ${t('route to','التوجيه إلى')} ${b.route}.`:''}`,`data-kpi="${k.id}"`,t('Explore the impact','استكشف الأثر')]);
  }
  if(gaps.length)cards.push(['▥',t('DATA GAP','فجوة بيانات'),'warn',t(`${plural(gaps.length,'measure')} without an observation`,`${gaps.length} مؤشرات بدون قراءة`),`${gaps.map(k=>name(k)).join(', ')} ${t('have no recorded value for','بدون قيمة مسجلة لـ')} ${period()}, ${t('so they are excluded from achievement and counted under attention required.','لذا استُبعدت من الإنجاز.')}`,`data-page="data"`,t('Review data flows','مراجعة تدفقات البيانات')]);
  if(best&&cards.length<3)cards.push(['↗',t('POSITIVE MOMENTUM','زخم إيجابي'),'good',t(`${name(best)} is setting the pace`,`${name(best)} يتقدم`),`${value(best)} ${t('against a target of','مقابل مستهدف')} ${targetText(best)} (${pct(score(best))} ${t('achievement','إنجاز')}, ${t(...trendText[Data.trend(best)]).toLowerCase()}). ${t('Explore the practices behind it.','استكشف الممارسات وراءه.')}`,`data-page="ai"`,t('Ask ITQAN for more','اسأل إتقان للمزيد')]);
  if(!cards.length)cards.push(['✧',t('NO SIGNALS','لا إشارات'),'',t('Nothing to flag in this scope','لا شيء يستدعي التنبيه'),t('No published KPIs match the selected period and department.','لا توجد مؤشرات منشورة ضمن الفترة والإدارة المحددة.'),'data-page="kpi"',t('Open the registry','افتح السجل')]);
  return `<aside class="panel insights"><div class="panel-head"><h2>✧ ${t('A little intelligence. A lot of clarity.','ذكاء أكثر. وضوح أكبر.')}</h2><span class="eyebrow">ITQAN IQ</span></div>${cards.map(([ic,tag,tone,title,text,attr,cta])=>`<div class="insight"><div class="tag ${tone}">${ic} ${tag}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p><button ${attr}>${cta} →</button></div>`).join('')}<div class="insight-foot">${t('Advisory · Computed from local synthetic data · Human decisions','إرشادي · محسوب من بيانات محلية · القرار للإنسان')}</div></aside>`;
}

function filtered(){
  const term=query.trim().toLowerCase();
  return visibleKpis()
    .filter(k=>department==='All departments'||k.dept===department)
    .filter(k=>k.draft||(k.createdIndex??0)<=periodIndex)
    .map(k=>k.draft?{...k,actual:null,prior:null}:Data.at(k,periodIndex))
    .filter(k=>registryGoal===''||String(k.goal)===registryGoal)
    .filter(k=>`${k.name} ${k.ar||''} ${k.id} ${k.owner}`.toLowerCase().includes(term))
    .filter(k=>filter==='All statuses'||(filter==='Draft'?!!k.draft:!k.draft&&statusFilters[filter]===status(k)));
}

function severity(k){const b=Data.breach(k,health(k.goal));return b?`${b.level} · ${b.route}`:null}

/* ---------- drawers ---------- */
let drawerRoutes=[],drawerReturning=false,drawerOpener=null;
function setDrawerRoute(key,open){
  if(drawerReturning)return;
  if(!drawerRoutes.length)drawerOpener=document.activeElement;
  if(drawerRoutes.at(-1)?.key===key)drawerRoutes[drawerRoutes.length-1]={key,open};else drawerRoutes.push({key,open});
}
function drawer(title,html){
  $('#overlay').innerHTML=`<div class="modal-backdrop"><section class="drawer" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="drawer-head"><div>${drawerRoutes.length>1?`<button class="ghost" id="drawer-back">← ${t('Back','رجوع')}</button>`:''}<div class="eyebrow">ITQAN IQ · ${t('PERFORMANCE WORKSPACE','مساحة الأداء')}</div><h2>${escapeHtml(title)}</h2></div><button id="close-modal" aria-label="${t('Close dialog','إغلاق')}">✕</button></div>${html}</section></div>`;
  $('#close-modal').onclick=close;
  if(drawerRoutes.length>1)$('#drawer-back').onclick=()=>{drawerRoutes.pop();drawerReturning=true;try{drawerRoutes.at(-1).open()}finally{drawerReturning=false}};
  $('.modal-backdrop').onclick=e=>{if(e.target===e.currentTarget)close()};
  $('#close-modal').focus();
  bindKpis();
  bindConnections();bindGovernance();localizeUI();
}
function close(){$('#overlay').innerHTML='';drawerRoutes=[];if(drawerOpener?.isConnected)drawerOpener.focus();drawerOpener=null}

function detail(id){
  const source=raw(id);if(!source)return;setDrawerRoute('kpi:'+id,()=>detail(id));
  const k=source.draft?{...source,actual:null,prior:null}:Data.at(source,periodIndex);
  const siblings=goalItems(k.goal),weight=Data.weights(siblings)[k.id];
  const breachInfo=source.draft?null:Data.breach(k,health(k.goal));
  drawer(name(k),`<div class="drawer-meta"><span class="eyebrow">${k.id} · ${t('DEFINITION VERSION','إصدار التعريف')} ${source.definitionVersion||1} · ${k.type||'Lagging'} · ${t('Monthly','شهري')}</span>${source.draft?`<span class="pill amber">${t('Draft · Awaiting approval','مسودة · بانتظار الاعتماد')}</span>`:pill(status(k))}</div>
  ${connectionPath(k)}${requestStatus('KPI',k.id)}${!source.draft&&canWrite()&&!pendingRequest('KPI',id)?`<button id="amend-kpi">${t('Propose definition changes','اقتراح تعديل التعريف')}</button>`:''}
  ${isCurrent()&&canWrite()&&!pendingRequest('KPI',id)?`<form class="detail-section" id="target-form"><h3>${t('Target setup','إعداد المستهدفات')} · ${period()}</h3><p class="muted">${t('Propose this period’s target and amber boundary. Department and Strategy approval are required before published targets change. External actuals stay read only.','اقترح مستهدف هذه الفترة وحد التحذير. يلزم اعتماد الإدارة والفريق الاستراتيجي قبل تعديل المستهدفات المنشورة. القيم الفعلية للقراءة فقط.')}</p><label for="target-value">${t('Target','المستهدف')} (${escapeHtml(k.unit)})</label><input id="target-value" type="number" step="${k.unit==='count'?'1':'any'}" min="0" ${k.unit==='%'?'max="100"':''} value="${k.target}" required><label for="target-amber">${t('Amber boundary','حد التحذير')}</label><input id="target-amber" type="number" step="${k.unit==='count'?'1':'any'}" min="0" ${k.unit==='%'?'max="100"':''} value="${k.amber}" required><p id="target-error" role="alert"></p><button class="primary">${t('Submit targets for approval','إرسال المستهدفات للموافقة')}</button></form>`:`<p class="scope-note">${pendingRequest('KPI',id)?t('A request is awaiting approval. Published values remain unchanged.','هناك طلب ينتظر الموافقة. القيم المنشورة دون تغيير.'):!canWrite()?t('Your role has read-only access to KPI targets.','دورك يسمح بعرض المستهدفات فقط.'):t('Historical targets are read only. Select the current reporting period to set targets.','المستهدفات التاريخية للقراءة فقط. اختر فترة التقرير الحالية لإعداد المستهدفات.')}</p>`}
  <div class="detail-grid"><div class="detail-cell"><small>${t('Actual','الفعلي')} · ${period()}</small><strong>${source.draft?'—':value(k)}</strong></div><div class="detail-cell"><small>${t('Target','المستهدف')}</small><strong>${targetText(k)}</strong></div><div class="detail-cell"><small>${t('Accountable owner','المسؤول')}</small><strong class="small">${escapeHtml(k.owner)}</strong></div><div class="detail-cell"><small>${t('Achievement','الإنجاز')} · ${finite(weight)?`${trimNum(weight)}% ${t('objective weight','وزن الهدف')}`:t('unweighted draft','مسودة')}</small><strong>${source.draft?'—':pct(score(k))}</strong></div></div>
  <div class="detail-section"><h3>${t('Trend & target','الاتجاه والمستهدف')}</h3>${chart({values:source.history.slice(0,periodIndex+1),labels:source.history.slice(0,periodIndex+1).map((_,i)=>shortMonth(i)),target:k.target,suffix:k.unit==='%'?'%':'',caption:`${k.name} observations`})}<p>${t('Trend versus','الاتجاه مقابل')} ${periodIndex>0?Data.periods[periodIndex-1]:t('n/a','غير متاح')}: <b>${t(...trendText[source.draft?'unavailable':Data.trend(k)])}</b>${finite(k.prior)?` (${t('prior','السابق')} ${fmt(k.prior,k.unit)})`:''}</p><p class="muted">${t('Source','المصدر')}: ${escapeHtml(k.source)} · ${t('Confidence','الثقة')}: ${escapeHtml(k.confidence||'Not recorded')}<br>${t('Direction','الاتجاه المفضل')}: ${k.direction}-is-better · ${t('Amber boundary','حد التحذير')}: ${fmt(k.amber,k.unit)} · ${t('Baseline','خط الأساس')}: ${fmt(source.history.find(finite),k.unit)}<br>${t('Formula','المعادلة')}: ${k.direction==='lower'?'target / actual':'actual / target'} × 100, ${t('capped at 100%','بحد أقصى ١٠٠٪')}.</p>${k.definition?`<p class="muted">${escapeHtml(k.definition)}</p>`:''}</div>
  <div class="detail-section">${breachInfo?`<span class="pill ${status(k)}">${breachInfo.level} · ${breachInfo.route}</span><p>${t('Supports objective','يدعم الهدف')}: <button data-objective="${k.goal}">${escapeHtml(goals[k.goal].objective)}</button> · ${pct(health(k.goal))}</p>`:''}${recoveryLinks(k)}</div>
  <section class="detail-section external-actual"><h3>${t('Actuals · Supplied externally','القيم الفعلية · تُورد خارجياً')}</h3><p>${t('Source application','التطبيق المصدري')}: <strong>${escapeHtml(k.source)}</strong></p><p>${t('Actual','الفعلي')}: <strong>${value(k)}</strong> · ${t('Confidence','الثقة')}: ${escapeHtml(k.confidence||'Not recorded')}</p><p class="muted">${t('Read only. Actuals arrive through the source application data flow. This prototype displays synthetic data; no live connection is configured.','للقراءة فقط. تصل القيم الفعلية عبر تدفق بيانات التطبيق المصدري. يعرض هذا النموذج بيانات اصطناعية؛ لم يُعد اتصال حي.')}</p><button id="view-data-flow">${t('View data flows','عرض تدفقات البيانات')} →</button></section>

  ${source.draft&&canWrite()&&!pendingRequest('KPI',id)?`<div class="detail-section"><p class="muted">${t('Publish the KPI definition and targets. Actuals will remain empty until supplied by its source application.','انشر تعريف المؤشر ومستهدفاته. ستبقى القيم الفعلية فارغة حتى يوردها التطبيق المصدري.')}</p><button class="primary" id="approve">${t('Submit KPI for approval','إرسال المؤشر للموافقة')}</button> <button id="edit-kpi-draft">${t('Edit definition','تعديل التعريف')}</button></div>`:''}`);
  if($('#amend-kpi'))$('#amend-kpi').onclick=()=>kpiAmendment(id);
  $('#view-data-flow').onclick=()=>{dataSourceFilter=k.source;close();go('data')};
  if(isCurrent()&&canWrite()&&!pendingRequest('KPI',id)&&$('#target-form'))$('#target-form').onsubmit=e=>{
    e.preventDefault();try{
      assertWrite(source);if(!$('#target-value').value.trim()||!$('#target-amber').value.trim())throw Error('Enter target and amber boundary.');
      const target=Number($('#target-value').value),amber=Number($('#target-amber').value);Data.setTarget(JSON.parse(JSON.stringify(source)),Data.latest,target,amber);
      if(source.draft){Data.setTarget(source,Data.latest,target,amber);source.version=entityVersion(source)+1;persist(id+': draft targets updated',source.dept)}
      else submitRequest('Target change','KPI',source,{period:Data.latest,target,amber},source.name);
      render();detail(id);toast('Saved for review. Published targets change only after approval.');
    }catch(err){$('#target-error').textContent=err.message}
  };
  if(source.draft&&canWrite()&&!pendingRequest('KPI',id)&&$('#edit-kpi-draft'))$('#edit-kpi-draft').onclick=()=>register(id);
  if(source.draft&&canWrite()&&!pendingRequest('KPI',id)&&$('#approve'))$('#approve').onclick=()=>{try{Data.validateDefinition(source,goals);submitRequest('KPI publication','KPI',source,source,source.name);render();detail(id)}catch(err){toast(err.message)}};

}

function recoveryGap(k,trigger){
  if(!k)return '';const observed=trigger||recoveryTrigger(k);
  return `<section class="plan-gap"><span class="eyebrow">${trigger?'RECOVERY TRIGGER':recoveryEligible(k)?'CURRENT KPI GAP':'LATEST KPI RESULT'} · ${escapeHtml(observed.period)}</span><h3>${escapeHtml(name(k))}</h3><div><span>Actual <strong>${fmt(observed.actual,observed.unit)}</strong></span><span>Target <strong>${fmt(observed.target,observed.unit)}</strong></span>${pill(observed.status)}</div><small>${escapeHtml(observed.source||k.source)} · Read-only source actual</small></section>`;
}
function objectiveActionLinks(i){
  const list=visibleActions().filter(a=>isActionPlan(a)&&!a.kpi&&planGoal(a)===i&&(department==='All departments'||planDepartment(a)===department));
  return `<section class="objective-actions"><div class="connection-section-title"><strong>${t('Objective action plans','خطط عمل الهدف')}</strong>${canWrite()?`<button data-objective-action="${i}">＋ ${t('Create action plan','إنشاء خطة عمل')}</button>`:''}</div>${list.map(a=>`<button class="recovery-link" data-linked-action="${a.id}"><span><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(planDepartment(a))} · ${escapeHtml(a.owner)}</small></span><span class="pill neutral">${escapeHtml(a.status)}</span></button>`).join('')||`<p class="muted">${t('Add a task directly to this objective. No KPI is required.','أضف مهمة لهذا الهدف مباشرة دون الحاجة إلى مؤشر.')}</p>`}</section>`;
}
function simpleActionForm(id,editId,workingCopy,objectiveId){
  if(!canWrite())return toast('Your role is read only.');
  const original=visibleActions().find(a=>a.id===editId);if(editId&&!original)return toast('Plan unavailable.');
  if(original&&pendingRequest('Plan',original.id))return approvalDetail(pendingRequest('Plan',original.id).id);
  if(original?.status==='Closed')return actionDetail(original.id);
  const existing=original?JSON.parse(JSON.stringify(workingCopy||original)):null;
  const candidates=visibleKpis().filter(k=>!k.draft),linked=id?raw(id):null;
  const mode=existing?(existing.kpi?'kpi':'objective'):linked?'kpi':'objective';
  const selectedGoal=existing?planGoal(existing):Number.isInteger(objectiveId)?objectiveId:linked?.goal??0;
  const selectedDepartment=existing?planDepartment(existing):department!=='All departments'?department:currentUser()?.department||allDepartments[0];
  setDrawerRoute('simple-action:'+(editId||id||objectiveId||'new'),()=>simpleActionForm(id,editId,workingCopy,objectiveId));
  const field=(key,label,type='text',value='')=>`<label for="action-${key}">${label}</label><input id="action-${key}" type="${type}" required maxlength="${key==='owner'?80:120}" value="${escapeHtml(existing?.[key]||value)}">`;
  drawer(existing?'Edit action plan':'Create action plan',`<p class="plan-purpose">A simple task supporting an objective or KPI. Define the outcome, owner and deadline. KPI underperformance is not required.</p><form id="action-form" class="detail-section"><label for="action-link-type">Link this action to</label><select id="action-link-type" ${existing?'disabled':''}><option value="objective"${mode==='objective'?' selected':''}>Objective</option><option value="kpi"${mode==='kpi'?' selected':''}>KPI</option></select><div id="action-kpi-fields"><label for="action-kpi">KPI</label><select id="action-kpi" ${existing?'disabled':''}>${candidates.map(k=>`<option value="${escapeHtml(k.id)}"${(existing?.kpi||id)===k.id?' selected':''}>${escapeHtml(name(k))}</option>`).join('')}</select></div><div id="action-objective-fields"><label for="action-goal">Objective</label><select id="action-goal" ${existing?'disabled':''}>${goals.map((g,i)=>`<option value="${i}"${selectedGoal===i?' selected':''}>${escapeHtml(g.name)} / ${escapeHtml(g.objective)}</option>`).join('')}</select><label for="action-department">Responsible department</label><select id="action-department" ${existing||!globalAccess()?'disabled':''}>${departments().map(d=>`<option${d===selectedDepartment?' selected':''}>${escapeHtml(d)}</option>`).join('')}</select></div><div id="action-form-connection"></div>${field('title','What needs to be done?')}${field('owner','Accountable owner','text',linked?.owner||currentUser()?.name||'')}${field('due','Due date','date',dateAfter(appConfig.planDueDays))}<label for="action-priority">Priority</label><select id="action-priority">${lookupOptions('priorities',existing?.priority||appConfig.defaultPriority)}</select><label for="action-effect">Expected outcome / completion criteria</label><textarea id="action-effect" required maxlength="240">${escapeHtml(existing?.effect||'')}</textarea><label for="action-steps">Delivery notes (optional)</label><textarea id="action-steps" maxlength="2000">${escapeHtml(existing?.plan?.steps||'')}</textarea><p class="muted">Department and Strategy approve the plan and its completion. Root-cause analysis, recovery reviews and Green KPI periods are not required.</p><p id="action-form-error" role="alert"></p><button class="primary">${existing?'Save changes':'Save action draft'}</button></form>`);
  const updateLink=()=>{const isKpi=$('#action-link-type').value==='kpi';$('#action-kpi-fields').hidden=!isKpi;$('#action-objective-fields').hidden=isKpi;const k=raw($('#action-kpi').value);$('#action-form-connection').innerHTML=isKpi?(k?connectionPath(k):'<p>No published KPI available. Link to an objective instead.</p>'):`<p class="muted">${escapeHtml(goals[Number($('#action-goal').value)]?.objective||'')} · ${escapeHtml($('#action-department').value)}</p>`;bindConnections()};
  $('#action-link-type').onchange=updateLink;$('#action-kpi').onchange=()=>{if(!existing)$('#action-owner').value=raw($('#action-kpi').value)?.owner||'';updateLink()};$('#action-goal').onchange=updateLink;$('#action-department').onchange=updateLink;updateLink();
  if(!existing)$('#action-due').min=today();
  $('#action-form').onsubmit=e=>{e.preventDefault();try{
    const isKpi=existing?!!existing.kpi:$('#action-link-type').value==='kpi',k=isKpi?raw(existing?.kpi||$('#action-kpi').value):null;
    if(isKpi&&(!k||k.draft))throw Error('Select a published KPI or link directly to an objective.');
    const draft={...(existing||{}),planType:'Action plan',kpi:isKpi?k.id:null,goal:existing?planGoal(existing):isKpi?k.goal:Number($('#action-goal').value),department:existing?planDepartment(existing):isKpi?k.dept:$('#action-department').value,title:$('#action-title').value.trim(),owner:$('#action-owner').value.trim(),due:$('#action-due').value,priority:$('#action-priority').value,effect:$('#action-effect').value.trim(),plan:{...(existing?.plan||{}),steps:$('#action-steps').value.trim()},milestones:existing?.milestones||[],notes:existing?.notes||[],history:existing?.history||[],reviews:existing?.reviews||[],revision:(existing?.revision||0)+1};
    assertPlanWrite(draft);validateLookup('priorities',draft.priority,existing?.priority);if(planGaps(draft).length||(!existing&&draft.due<today())||!['High','Medium','Low'].includes(draft.priority))throw Error('Complete the task, owner, valid deadline and expected outcome.');
    if(!existing){Object.assign(draft,{id:Math.max(Date.now(),...actions.map(a=>Number(a.id)+1)),status:'Open',approvalStatus:'Draft',createdAt:new Date().toISOString(),evidence:''});actions.push(draft)}
    recordAction(draft,existing?'Action plan updated':'Action plan created');department=planDepartment(draft);if(!existing){linkedActionKpi=linkedActionGoal=actionQuery='';actionFilter=actionOwner=actionPriority='All'}planTypeFilter='Action plan';close();go('actions');actionDetail(draft.id);
  }catch(err){$('#action-form-error').textContent=err.message}};
}
function validateSimpleActionTransition(a,next,evidence){
  if(planGaps(a).length)throw Error('Complete the action, owner, deadline and expected outcome.');
  if(next==='In progress'&&a.status==='Open'){a.status=next;a.startedAt=new Date().toISOString();return}
  if(next==='Closed'&&a.status==='In progress'){
    if(!evidence.trim())throw Error('Add completion evidence against the expected outcome.');
    if(a.milestones.some(m=>!m.done||!m.evidence?.trim()))throw Error('Complete the optional checklist items with evidence before closure.');
    a.status='Closed';a.evidence=evidence.trim();a.closedAt=new Date().toISOString();a.closure={time:a.closedAt,evidence:a.evidence,outcome:a.effect,plan:JSON.parse(JSON.stringify(a.plan)),milestones:JSON.parse(JSON.stringify(a.milestones)),link:{kpi:a.kpi,goal:planGoal(a),department:planDepartment(a)},observations:[]};return;
  }
  if(next==='In progress'&&a.status==='Closed'){if(!evidence.trim())throw Error('Enter a reason to reopen this action.');a.status=next;a.closedAt=null;a.revision++;a.notes.unshift({text:evidence.trim(),time:new Date().toISOString()});return}
  throw Error('Invalid action transition.');
}
function simpleActionDetail(stored,workingCopy){
  const a=JSON.parse(JSON.stringify(workingCopy||stored)),k=raw(a.kpi),goal=planGoal(a),locked=a.status==='Closed'||!!pendingRequest('Plan',a.id)||!canWrite();
  setDrawerRoute('action:'+a.id,()=>actionDetail(a.id));
  drawer('Action plan',`${k?connectionPath(k,a):`<nav class="connection-path"><button data-objective="${goal}">${escapeHtml(goals[goal].objective)}</button><span>→</span><span class="connection-current">${escapeHtml(a.title)}</span></nav>`}${requestStatus('Plan',a.id)}<section class="detail-section"><span class="pill neutral">Action plan · ${escapeHtml(a.status)}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.owner)} · ${escapeHtml(planDepartment(a))} · Due ${escapeHtml(a.due)}</p><h4>Expected outcome</h4><p>${escapeHtml(a.effect)}</p>${a.plan?.steps?`<h4>Delivery notes</h4><p>${escapeHtml(a.plan.steps)}</p>`:''}<p class="muted">Complete the task and provide delivery evidence. KPI recovery and a separate effectiveness review are not required.</p>${!locked?'<button id="edit-action">Edit action plan</button>':''}</section><details class="detail-section"><summary>Optional delivery checklist (${a.milestones.filter(m=>m.done).length}/${a.milestones.length})</summary>${milestonesPanel(a,locked,true)}</details><section class="detail-section"><h3>Progress updates</h3>${!locked?'<form id="action-note-form"><label for="action-note">Progress note</label><textarea id="action-note" required maxlength="2000"></textarea><button>Add update</button></form>':''}${a.notes.map(n=>`<p>${escapeHtml(n.text)}<small> · ${escapeHtml(n.time)}</small></p>`).join('')||'<p class="muted">No updates yet.</p>'}</section>${a.approvalStatus!=='Approved'&&!pendingRequest('Plan',a.id)&&canWrite()?'<section class="detail-section"><p>Submit this task for Department and Strategy approval before starting.</p><button class="primary" id="submit-plan">Submit action plan for approval</button><p id="submit-plan-error" role="alert"></p></section>':''}<form id="action-transition" class="detail-section"><h3>${a.status==='Closed'?'Reopen action':a.status==='Open'?'Start delivery':'Complete action'}</h3>${a.status!=='Open'?`<label for="recovery-evidence">${a.status==='Closed'?'Reason to reopen':'Completion evidence against the expected outcome'}</label><textarea id="recovery-evidence" required maxlength="2000">${a.status==='Closed'?'':escapeHtml(a.evidence||'')}</textarea>`:''}<p id="action-error" role="alert"></p><button class="primary" ${pendingRequest('Plan',a.id)||a.approvalStatus!=='Approved'||!canWrite()?'disabled':''}>${a.status==='Open'?'Start action':a.status==='Closed'?'Request reopening':'Submit completion for approval'}</button></form>${a.closure?`<section class="detail-section"><h3>Last completion record</h3><p>${escapeHtml(a.closure.evidence)}</p><small>${escapeHtml(a.closure.time)}</small></section>`:''}<section class="detail-section"><h3>Action history</h3>${a.history.map(h=>`<p>${escapeHtml(h.event)}<small> · ${escapeHtml(h.time)}</small></p>`).join('')}</section>`);
  if(!locked){
    $('#edit-action').onclick=()=>simpleActionForm(a.kpi,a.id,a);
    $('#action-note-form').onsubmit=e=>{e.preventDefault();const text=$('#action-note').value.trim();if(!text)return;a.notes.unshift({text,time:new Date().toISOString()});recordAction(a,'Progress update: '+text);render();actionDetail(a.id)};
    $('#milestone-form').onsubmit=e=>{e.preventDefault();const title=$('#milestone-title').value.trim(),owner=$('#milestone-owner').value.trim(),due=$('#milestone-due').value;if(!title||!owner||!validDate(due)||due>a.due){$('#milestone-error').textContent='Add title, owner and a valid date within the action deadline.';return}a.milestones.push({title,owner,due,done:false,evidence:''});a.revision++;recordAction(a,'Checklist item added: '+title);render();actionDetail(a.id)};
    document.querySelectorAll('[data-milestone-form]').forEach(form=>form.onsubmit=e=>{e.preventDefault();const m=a.milestones[Number(form.dataset.milestoneForm)],owner=form.elements.owner.value.trim(),due=form.elements.due.value,evidence=form.elements.evidence.value.trim(),done=form.elements.done.checked;if(!owner||!validDate(due)||due>a.due||(done&&!evidence)){form.querySelector('.milestone-error').textContent='Set owner, valid date and completion evidence.';return}Object.assign(m,{owner,due,evidence,done});a.revision++;recordAction(a,'Checklist updated: '+m.title);render();actionDetail(a.id)});
  }
  if($('#submit-plan'))$('#submit-plan').onclick=()=>{try{if(planGaps(a).length)throw Error('Complete the action details.');submitRequest('Plan approval','Plan',stored,a,a.title);render();actionDetail(a.id)}catch(err){$('#submit-plan-error').textContent=err.message}};
  $('#action-transition').onsubmit=e=>{e.preventDefault();try{transitionAction(a,a.status==='In progress'?'Closed':'In progress',a.status==='Open'?'':$('#recovery-evidence').value);render();actionDetail(a.id)}catch(err){$('#action-error').textContent=err.message}};
}

function actionForm(id,editId,planType='Recovery plan',workingCopy){
  if(planType==='Action plan'||isActionPlan(actions.find(a=>a.id===editId)))return simpleActionForm(id,editId,workingCopy);

  if(!canWrite())return toast('Your role is read only.');
  const original=visibleActions().find(a=>a.id===editId);if(editId&&!original)return toast('Plan unavailable.');if(original&&pendingRequest('Plan',original.id))return approvalDetail(pendingRequest('Plan',original.id).id);
  const existing=original?JSON.parse(JSON.stringify(workingCopy||original)):null;
  if(existing?.status==='Closed')return actionDetail(existing.id);
  if(!original&&(!id||!recoveryEligible(raw(id))))return toast('Create recovery from an At risk or Off track KPI with a current actual.');
  const options=visibleKpis().filter(k=>!k.draft&&(original?k.id===original.kpi:k.id===id&&recoveryEligible(k)));
  if(!options.length)return toast(t('Publish a KPI before creating an action.','انشر مؤشراً قبل إنشاء إجراء.'));
  setDrawerRoute('plan-form:'+(editId||id||'new')+planType,()=>actionForm(id,editId,planType));
  const field=(key,label,type='text',limit=120)=>`<label for="action-${key}">${label}</label><input id="action-${key}" type="${type}" required maxlength="${limit}" value="${escapeHtml(existing?.[key]||(key==='due'?dateAfter(appConfig.planDueDays):''))}">`;
  drawer(existing?'Edit '+existing.planType:'Create recovery plan',`<div class="approval-route"><span>1. Review KPI gap</span><span>→</span><span>2. Build plan</span><span>→</span><span>3. Submit for approval</span></div><form class="detail-section" id="action-form"><label for="action-kpi">${t('Linked KPI','المؤشر المرتبط')}</label><div id="action-form-connection"></div><select id="action-kpi" ${existing?'disabled':''}>${options.map(k=>`<option value="${escapeHtml(k.id)}"${id===k.id?' selected':''}>${escapeHtml(name(k))}</option>`).join('')}</select>${!existing?`<p class="muted">Enter the initial cause and corrective steps, then create and submit the plan for Department and Strategy approval. After approval, use Manage plan for delivery updates, evidence and monitoring. Save a draft only if you are not ready to submit.</p>`:''}${field('title',t('Recovery plan title','عنوان خطة التعافي'))}${field('owner',t('Accountable owner','المسؤول'),'text',80)}${field('due',t('Due date','تاريخ الاستحقاق'),'date')}<label for="action-priority">${t('Priority','الأولوية')}</label><select id="action-priority">${lookupOptions('priorities',existing?.priority||appConfig.defaultPriority)}</select><label for="action-effect">${t('Expected effect','الأثر المتوقع')}</label><textarea id="action-effect" required maxlength="240">${escapeHtml(existing?.effect||'')}</textarea>${!existing?`<label for="recovery-cause">Root cause</label><textarea id="recovery-cause" required maxlength="2000"></textarea><label for="recovery-steps">Corrective steps</label><textarea id="recovery-steps" required maxlength="2000"></textarea><label for="recovery-review">Next review</label><input id="recovery-review" type="date" required value="${nextReviewDate({plan:{cadence:appConfig.reviewCadence}})}">`:''}<p id="action-form-error" role="alert"></p><button class="primary" id="submit-recovery" type="submit" value="submit">${existing?t('Save changes','حفظ التغييرات'):t('Create & submit for approval','إنشاء وإرسال للموافقة')}</button>${!existing?` <button id="save-recovery-draft" type="submit" value="draft" formnovalidate>${t('Save draft','حفظ المسودة')}</button>`:''}</form>`);
  const showActionConnection=()=>{const k=raw($('#action-kpi').value);$('#action-form-connection').innerHTML=connectionPath(k)+recoveryGap(k,original?.trigger);bindKpis();bindConnections()};showActionConnection();
  if(!existing){$('#action-title').value='Recover '+name(raw(id));$('#action-effect').value='Restore the approved target: '+targetText(raw(id));$('#action-owner').value=raw($('#action-kpi').value)?.owner||'';$('#action-due').min=today();$('#action-kpi').onchange=()=>{$('#action-owner').value=raw($('#action-kpi').value)?.owner||'';showActionConnection()}}
  $('#action-form').onsubmit=e=>{
    e.preventDefault();const submitNew=!existing&&e.submitter?.value!=='draft';
    const title=$('#action-title').value.trim(),owner=$('#action-owner').value.trim(),effect=$('#action-effect').value.trim(),due=$('#action-due').value,priority=$('#action-priority').value,kpi=existing?.kpi||$('#action-kpi').value;
    if(!title||!owner||!effect||!validDate(due)||!raw(kpi)||raw(kpi).draft||!['High','Medium','Low'].includes(priority)||(!existing&&due<today())){$('#action-form-error').textContent=t('Complete all fields and choose a valid KPI and due date.','أكمل الحقول واختر مؤشراً وتاريخ استحقاق صالحين.');return}
    try{validateLookup('priorities',priority,existing?.priority);assertWrite(raw(kpi));if(!existing&&!recoveryEligible(raw(kpi)))throw Error('Recovery can only start from a KPI whose actual is not meeting its target.')}catch(err){$('#action-form-error').textContent=err.message;return}
    const changes={title,owner,effect,due,priority,kpi};
    let a=existing;
    if(a){const changed=Object.keys(changes).filter(key=>a[key]!==changes[key]).map(key=>`${key}: ${a[key]} · ${changes[key]}`);Object.assign(a,changes);if(changed.length)a.revision++;if(changed.length)recordAction(a,'Details updated: '+changed.join('; '))}
    else{a={...changes,trigger:recoveryTrigger(raw(kpi)),id:Math.max(Date.now(),...actions.map(x=>Number(x.id)+1)),status:'Open',planType,approvalStatus:'Draft',createdAt:new Date().toISOString(),milestones:[],notes:[],history:[],evidence:'',plan:{cadence:appConfig.reviewCadence},reviews:[],revision:0};const correction=$('#recovery-steps').value.trim();a.plan={rootCause:$('#recovery-cause').value.trim(),correction,prevention:'',successCriteria:`Meet the approved KPI target for ${appConfig.recoveryPeriods} consecutive periods`,reviewer:owner,cadence:appConfig.reviewCadence,nextReview:$('#recovery-review').value};if(correction)a.milestones.push({title:correction.slice(0,160),owner,due,done:false,evidence:''});if(submitNew&&planGaps(a).length){$('#action-form-error').textContent='Add the root cause, corrective steps and a valid next review date before submitting, or choose Save draft.';return}actions.push(a);recordAction(a,'Recovery plan created from KPI gap');if(submitNew)submitRequest('Plan approval','Plan',a,a,a.title)}
    department=planDepartment(a);if(!existing){linkedActionKpi=linkedActionGoal=actionQuery='';actionFilter=actionOwner=actionPriority='All'}planTypeFilter='Recovery plan';close();go('actions');actionDetail(a.id);toast(submitNew?t('Recovery plan submitted for Department and Strategy approval.','تم إرسال خطة التعافي لموافقة الإدارة والاستراتيجية.'):t('Recovery plan saved','تم حفظ خطة التعافي'));
  };
}

function register(editId){
  if(!canWrite())return toast('Your role is read only.');
  const editing=typeof editId==='string'?raw(editId):null;if(typeof editId==='string'&&(!editing||!editing.draft||pendingRequest('KPI',editId)))return toast('This definition cannot be edited while published or pending approval.');
  setDrawerRoute('kpi-form:'+(editing?.id||'new'),()=>register(editing?.id));
  const text=[['name','KPI name'],['owner','Accountable owner'],['source','Source application'],['definition','Definition'],['formula','Measurement formula']];
  const numbers=[['target','Target'],['amber','Amber boundary']];
  drawer(t('Register KPI','تسجيل مؤشر'),`<div class="approval-route"><span>1. Choose objective</span><span>→</span><span>2. Define KPI & targets</span><span>→</span><span>3. Submit for approval</span></div><form class="detail-section" id="register-form">${text.map(([f,label])=>`<label for="reg-${f}">${label}</label><input id="reg-${f}" required maxlength="140" ${f==='source'?'list="source-choices"':''}>`).join('')}<datalist id="source-choices">${sourceDirectory().map(v=>`<option value="${escapeHtml(v)}">`).join('')}</datalist><label for="reg-sourceKey">Source metric / field key (optional)</label><input id="reg-sourceKey" maxlength="140" value="${escapeHtml(editing?.sourceKey||'')}"><label for="reg-goal">${t('Linked objective','الهدف المرتبط')}</label><select id="reg-goal">${goals.map((g,i)=>`<option value="${i}">${escapeHtml(g.name)} / ${escapeHtml(g.objective)}</option>`).join('')}</select><label for="reg-dept">${t('Department','الإدارة')}</label><select id="reg-dept">${departments().map(d=>`<option>${escapeHtml(d)}</option>`).join('')}</select><label for="reg-type">${t('Type','النوع')}</label><select id="reg-type">${lookupOptions('kpiTypes',editing?.type)}</select><label for="reg-dir">${t('Direction','الاتجاه المفضل')}</label><select id="reg-dir"><option value="higher">Higher is better</option><option value="lower">Lower is better</option></select><label for="reg-unit">${t('Unit','الوحدة')}</label><select id="reg-unit">${lookupOptions('units',editing?.unit)}</select>${numbers.map(([f,label])=>`<label for="reg-${f}">${label}</label><input id="reg-${f}" type="number" step="0.01" required>`).join('')}<p class="muted">${t('Set the KPI definition, source application and targets here. Monthly actuals and baseline values come from the source application data flow. New definitions stay in Draft until Department and Strategy approval; no actuals are entered here.','حدد تعريف المؤشر وتطبيقه المصدري ومستهدفاته هنا. تأتي القيم الفعلية وخط الأساس من تدفق البيانات الخارجي.')}</p><button class="primary">${t('Save draft for approval','حفظ المسودة')}</button></form>`);
  if(editing){for(const f of ['name','owner','source','definition','formula','target','amber','goal','dept','type','unit'])$('#reg-'+f).value=editing[f];$('#reg-dir').value=editing.direction;}
  $('#register-form').onsubmit=e=>{
    e.preventDefault();
    const read=f=>$('#reg-'+f).value;
    const goal=Number(read('goal'));
    const draft={
      id:editing?.id||nextKpiId(),name:read('name').trim(),owner:read('owner').trim(),source:read('source').trim(),
      definition:read('definition').trim(),formula:read('formula').trim(),sourceKey:read('sourceKey').trim(),goal,dept:read('dept'),
      type:read('type'),direction:read('dir'),unit:read('unit'),frequency:'Monthly',
      target:Number(read('target')),amber:Number(read('amber')),baseline:editing?.baseline??null,
      history:Array(6).fill(null),confidences:Array(6).fill('Not recorded'),
      actual:null,prior:null,createdIndex:Data.latest,draft:true
    };
    draft.source=sourceDirectory().find(source=>source.toLowerCase()===draft.source.toLowerCase())||draft.source;
    try{assertWrite(draft);if(!allDepartments.includes(draft.dept))throw Error('Select a valid department.');validateLookup('kpiTypes',draft.type,editing?.type);validateLookup('units',draft.unit,editing?.unit);Data.validateDefinition(draft,goals)}catch(err){return toast(err.message)}
    if(editing){draft.version=entityVersion(editing)+1;Object.assign(editing,draft)}else kpis.push(draft);
    persist('KPI definition draft created: '+draft.name);
    close();go('kpi');detail(draft.id);toast('Draft saved. Submit this KPI for Department and Strategy approval.');
  };
}
function kpiAmendment(id,proposal){
  const k=raw(id);if(!k||k.draft||!canWrite()||pendingRequest('KPI',id))return toast(t('This KPI is not available for amendment.','هذا المؤشر غير متاح للتعديل.'));
  setDrawerRoute('kpi-amendment:'+id,()=>kpiAmendment(id));const values={...k,...proposal};
  drawer(t('Propose KPI changes','اقتراح تعديلات المؤشر'),`${connectionPath(k)}<p class="muted">${t('Changes require Department and Strategy approval. Existing actuals, source, unit and measurement direction remain attached to this KPI.','تتطلب التعديلات موافقة الإدارة والفريق الاستراتيجي. تبقى القيم الفعلية والمصدر والوحدة واتجاه القياس مرتبطة بالمؤشر.')}</p><form class="detail-section" id="kpi-amendment-form">${[['name',t('KPI name','اسم المؤشر')],['owner',t('Accountable owner','المسؤول')],['definition',t('Definition','التعريف')],['formula','Measurement formula'],['sourceKey','Source metric / field key']].map(([key,label])=>`<label for="amend-${key}">${label}</label><input id="amend-${key}" ${key==='sourceKey'?'':'required'} maxlength="500" value="${escapeHtml(values[key]||'')}">`).join('')}<label for="amend-goal">${t('Linked objective','الهدف المرتبط')}</label><select id="amend-goal">${goals.map((g,i)=>`<option value="${i}"${i===values.goal?' selected':''}>${escapeHtml(g.name)} / ${escapeHtml(g.objective)}</option>`).join('')}</select><label for="amend-reason">${t('Reason for change','سبب التعديل')}</label><textarea id="amend-reason" required maxlength="2000"></textarea><p id="amend-error" role="alert"></p><button class="primary">${t('Submit changes for approval','إرسال التعديلات للموافقة')}</button></form>`);
  $('#kpi-amendment-form').onsubmit=e=>{e.preventDefault();try{const proposed={name:$('#amend-name').value.trim(),owner:$('#amend-owner').value.trim(),definition:$('#amend-definition').value.trim(),formula:$('#amend-formula').value.trim(),sourceKey:$('#amend-sourceKey').value.trim(),goal:Number($('#amend-goal').value)};const reason=$('#amend-reason').value.trim();if(!reason)throw Error('Explain the proposed change.');Data.validateDefinition({...k,...proposed},goals);submitRequest('KPI amendment','KPI',k,proposed,`${k.name}: ${reason}`);render();detail(id)}catch(err){$('#amend-error').textContent=err.message}};
}
function nextKpiId(){let n=kpis.length+1,id;do{id=`KPI-NEW-${String(n++).padStart(3,'0')}`}while(kpis.some(k=>k.id===id));return id}

/* ---------- export & copilot ---------- */
function csv(){
  const items=scoped();
  const rows=[['Reporting period','ID','KPI','Department','Goal','Owner','Actual','Target','Unit','Achievement %','Status','Trend','Confidence','Source'],
    ...items.map(k=>[period(),k.id,k.name,k.dept,goals[k.goal].name,k.owner,finite(k.actual)?k.actual:'',k.target,k.unit,finite(score(k))?Math.round(score(k)):'',statusText[status(k)][0],trendText[Data.trend(k)][0],k.confidence||'Not recorded',k.source])];
  const data=rows.map(r=>r.map(v=>'"'+String(v).replace(/^[=+@-]/,"'").replaceAll('"','""')+'"').join(',')).join('\r\n');
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob(['\ufeff'+data],{type:'text/csv;charset=utf-8'}));
  link.download=`ITQAN-IQ-synthetic-scorecard-${period().replace(' ','-')}.csv`;
  link.click();URL.revokeObjectURL(link.href);
  toast(t(`Exported ${plural(items.length,'KPI')} for ${period()}.`,'تم التصدير.'));
}

function comparison(){
  const rows=departments().map(d=>{const list=scoped(periodIndex,d);return {dept:d,sc:avg(list),count:list.length,summary:Data.summary(list)}});
  return `<div class="detail-section"><h3>${t('Department achievement','إنجاز الإدارات')} · ${period()}</h3><p class="muted">${t('Equal-weight KPI achievement within each department. Departments with no observation are shown as no data.','إنجاز متساوي الأوزان داخل كل إدارة.')}</p>${rows.map(r=>`<div class="compare-row"><div class="compare-top"><span>${escapeHtml(r.dept)} <small>${plural(r.count,'KPI')} · ${r.summary.green} ${t('on track','على المسار')}</small></span><b>${pct(r.sc)}</b></div><div class="bar"><span class="${Data.aggregateStatus(r.sc)}" style="width:${width(r.sc)}%"></span></div></div>`).join('')}<div class="compare-row"><div class="compare-top"><span><b>${t('All departments','كل الإدارات')}</b> <small>${t('equal goal weights','أوزان أهداف متساوية')}</small></span><b>${pct(overall(scoped(periodIndex,'All departments')))}</b></div></div></div>`;
}

function ask(question,intent){
  const q=question.trim();if(!q&&!intent)return;
  if(!intent){
    // Exact entity names take precedence over broad navigation keywords.
    const exact=workspaceSearch(q).some(r=>r.kind!=='Application help');
    intent=exact?'search':/how.*(app|itqan|work)|help|navigate|explain.*(app|itqan)|مساعدة|كيف.*(يعمل|التطبيق)|شرح/i.test(q)?'help':/approval|approve|موافق|اعتماد|طلبات/i.test(q)?'approvals':/actual|source|data flow|integration|بيانات|فعلية|مصدر/i.test(q)?'data':/target|threshold|مستهدف|حد التحذير/i.test(q)?'targets':/overdue|late action|متأخر/i.test(q)?'overdue':/recovery|action|تعافي|تعاف|إجراء/i.test(q)?'recovery':/objective|strategy|goal|هدف|أهداف|استراتيجي/i.test(q)?'strategy':/risk|attention|performance|track|priority|خطر|أداء|انتباه/i.test(q)?'attention':'search';
  }
  $('#chat').innerHTML=assistantAnswer(intent,q);
  if($('#ask-result-label'))$('#ask-result-label').textContent=t('RESULTS','النتائج');
  if($('#ask-reset'))$('#ask-reset').hidden=false;
  document.querySelectorAll('[data-ask]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.ask===intent)));
  bindAssistant();localizeUI();
}

/* ---------- events ---------- */
/* On narrow screens the sidebar becomes a horizontal strip, so the selected view is scrolled
   back into view; otherwise choosing a later item leaves it off-screen with no active marker. */
function keepActiveNavVisible(){
  const active=$('.nav-item.active'),strip=active&&active.parentElement;
  if(!strip||typeof strip.scrollWidth!=='number'||strip.scrollWidth<=strip.clientWidth)return;
  strip.scrollLeft=Math.max(0,active.offsetLeft-(strip.clientWidth-active.offsetWidth)/2);
}

function bindKpis(){document.querySelectorAll('[data-kpi]').forEach(el=>{el.onclick=()=>detail(el.dataset.kpi);el.onkeydown=e=>{if(e.target===el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();detail(el.dataset.kpi)}}})}

function bind(){
  document.querySelectorAll('[data-plan-type]').forEach(el=>el.onclick=()=>{planTypeFilter=el.dataset.planType;render()});

  document.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>go(el.dataset.page));
  keepActiveNavVisible();
  if($('#sign-out'))$('#sign-out').onclick=()=>{close();authenticated=false;localStorage.removeItem(AUTH);go('dashboard')};
  bindKpis();
  document.querySelectorAll('[data-goal]').forEach(el=>{el.onclick=()=>objectiveDetail(el.dataset.goal);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}}});
  $('#language').onclick=()=>{ar=!ar;localStorage.setItem('itqan-language',ar?'ar':'en');close();render()};
  $('#global-search').onkeydown=e=>{if(e.key==='Enter'&&e.target.value.trim()){const term=e.target.value;go('ai');ask(term)}};
  $('#notifications').onclick=notifications;
  if($('#impact-filter'))$('#impact-filter').onchange=e=>{impactFilter=e.target.value;render()};
  if($('#period'))$('#period').onchange=e=>{reportingPeriodIndex=Number(e.target.value);render()};
  if($('#department'))$('#department').onchange=e=>{department=e.target.value;render()};
  if($('#export'))$('#export').onclick=csv;
  if($('#clear-source-filter'))$('#clear-source-filter').onclick=()=>{dataSourceFilter='';render()};
  if($('#new-kpi'))$('#new-kpi').onclick=register;
  if($('#review-kpi-gaps'))$('#review-kpi-gaps').onclick=()=>{reportingPeriodIndex=Data.latest;go('impact')};
  if($('#new-action'))$('#new-action').onclick=()=>actionForm(undefined,undefined,'Action plan');
  if($('#clear-action-link'))$('#clear-action-link').onclick=()=>{linkedActionKpi=linkedActionGoal='';render()};
  if($('#registry-goal'))$('#registry-goal').onchange=e=>{registryGoal=e.target.value;render()};
  if($('#kpi-search'))$('#kpi-search').oninput=e=>{query=e.target.value;$('#kpi-results').innerHTML=table(filtered());bindKpis();bindConnections()};
  if($('#status-filter'))$('#status-filter').onchange=e=>{filter=e.target.value;render()};
  bindActionCards();
  if($('#action-search'))$('#action-search').oninput=e=>{actionQuery=e.target.value;$('#action-results').innerHTML=actionLanes();bindActionCards()};
  if($('#action-filter'))$('#action-filter').onchange=e=>{actionFilter=e.target.value;render()};
  if($('#action-owner-filter'))$('#action-owner-filter').onchange=e=>{actionOwner=e.target.value;render()};
  if($('#action-priority-filter'))$('#action-priority-filter').onchange=e=>{actionPriority=e.target.value;render()};
  if($('#action-clear'))$('#action-clear').onclick=()=>{actionQuery='';actionFilter=actionOwner=actionPriority='All';render()};
  if($('#ask-form'))$('#ask-form').onsubmit=e=>{e.preventDefault();ask($('#ask-input').value)};
  bindAssistant();bindGovernance();bindAdministration();
  if($('#add-account'))$('#add-account').onclick=()=>accountForm();
  document.querySelectorAll('[data-account]').forEach(el=>el.onclick=()=>accountForm(el.dataset.account));
  document.querySelectorAll('[data-report]').forEach(el=>el.onclick=()=>{
    if(el.dataset.report==='csv')csv();
    else if(el.dataset.report==='print'){go('dashboard');window.print()}
    else $('#report-output').innerHTML=comparison();
  });
  if(currentUser()?.role==='admin'&&$('#settings'))$('#settings').onsubmit=e=>{e.preventDefault();localStorage.setItem('itqan-cadence',$('#cadence').value);persist('Review cadence preference updated');toast(t('Review cadence preference saved locally','تم حفظ التفضيل'))};
  if($('#cadence'))$('#cadence').value=localStorage.getItem('itqan-cadence')||'Monthly';
  if(currentUser()?.role==='admin'&&$('#reset'))$('#reset').onclick=()=>{localStorage.removeItem(STORE);location.reload()};
}

function notifications(){
  setDrawerRoute('notifications',notifications);
  const breaches=appConfig.notifyPerformance?scoped().filter(k=>status(k)!=='green'):[];
  const drafts=appConfig.notifyPerformance?visibleKpis().filter(k=>k.draft):[];
  const work=appConfig.notifyApprovals?visibleApprovals().filter(r=>canDecide(r)||(r.status==='Rejected'&&r.requesterId===currentUser()?.id)):[];const reviews=appConfig.notifyReviews?visibleActions().filter(reviewDue):[];
  drawer(t('Notification centre','مركز التنبيهات'),`<p class="muted">${t('Demonstration notifications computed from your local workspace for','تنبيهات محسوبة محلياً لـ')} ${period()}.</p>${work.map(r=>`<div class="detail-section"><span class="pill amber">${escapeHtml(r.status)}</span><h3>${escapeHtml(r.summary)}</h3><button data-request="${r.id}">${t('Open approval','فتح الموافقة')} →</button></div>`).join('')}${reviews.map(a=>`<div class="detail-section"><span class="pill amber">${t('Review due','حان موعد المراجعة')}</span><h3>${escapeHtml(a.title)}</h3><button data-linked-action="${a.id}">${t('Open monitoring','فتح المتابعة')} →</button></div>`).join('')}${breaches.map(k=>`<div class="detail-section"><span class="pill ${status(k)}">${severity(k)}</span><h3>${escapeHtml(name(k))}</h3><p>${status(k)==='missing'?t('No observation recorded for this period.','لا توجد قراءة لهذه الفترة.'):`${value(k)} ${t('against','مقابل')} ${targetText(k)} · ${pct(score(k))} ${t('achievement','إنجاز')}`}. ${t('Assigned to','مسند إلى')} ${escapeHtml(k.owner)}.</p><button data-kpi="${k.id}">${t('Review KPI','مراجعة المؤشر')} →</button></div>`).join('')}${drafts.map(k=>`<div class="detail-section"><span class="pill amber">${t('Draft · Awaiting approval','مسودة · بانتظار الاعتماد')}</span><h3>${escapeHtml(name(k))}</h3><p>${t('Submitted by','مقدم من')} ${escapeHtml(k.owner)}. ${t('Approval publishes it to the scorecards.','الاعتماد ينشره في بطاقات الأداء.')}</p><button data-kpi="${k.id}">${t('Review definition','مراجعة التعريف')} →</button></div>`).join('')}${breaches.length||drafts.length||work.length||reviews.length?'':`<p class="empty">${t('No notifications match your workspace scope and configured categories.','لا توجد تنبيهات ضمن نطاقك وفئات الإشعارات المحددة.')}</p>`}`);
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape')close();
  if(e.key==='Tab'&&$('.drawer')){
    const focus=[...$('.drawer').querySelectorAll('button,input,select,textarea,[tabindex="0"]')];
    if(!focus.length)return;
    if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus[focus.length-1].focus()}
    else if(!e.shiftKey&&document.activeElement===focus[focus.length-1]){e.preventDefault();focus[0].focus()}
  }
});

/* Back and Forward move between views rather than leaving the application. go() already
   rendered for in-app navigation, so only an externally changed hash needs a render here. */
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('hashchange',()=>{
  const next=pageFromHash();
  if(next&&next!==page){page=next;render()}
  else if(!next)go(page);
});
if(typeof location!=='undefined'&&!pageFromHash())location.hash=`#/${page}`;
completeWorkspaceMetadata();
watchUILanguage();
render();
