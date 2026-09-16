/* ITQAN IQ prototype interface.
   Presentation only: every count, score, trend, threshold, weight and forecast shown
   here is produced by the shared calculation engine in data.js, so the numbers on
   screen always reconcile with the underlying observations. */
const icons={dashboard:'▦',strategy:'◇',kpi:'▤',data:'▥',ai:'✧',impact:'◎',actions:'☑',reports:'▧',admin:'⚙',audit:'◷'};
const nav=[['dashboard','Executive overview','نظرة تنفيذية'],['strategy','Strategy & objectives','الاستراتيجية والأهداف'],['kpi','KPI registry','سجل المؤشرات'],['data','Data hub','مركز البيانات'],['ai','AI insights','الرؤى الذكية'],['impact','Impact & escalation','الأثر والتصعيد'],['actions','Action & recovery','الإجراءات والتعافي'],['reports','Reports & analytics','التقارير والتحليلات'],['admin','Administration','الإدارة'],['audit','Audit trail','سجل التدقيق']];
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
const seedActions=[{id:1,title:'Accelerate service backlog clearance',kpi:'KPI-SRV-002',owner:'Maj. Omar Al Ketbi',due:'2026-09-14',effect:'Reduce completion time to 2 days',status:'In progress'},{id:2,title:'Expand road safety awareness campaign',kpi:'KPI-TRF-001',owner:'Col. Khalid Al Shamsi',due:'2026-09-21',effect:'Reduce fatalities below 3 per 100k',status:'Open'},{id:3,title:'Complete specialist readiness programme',kpi:'KPI-INS-001',owner:'Dr. Aisha Al Marzooqi',due:'2026-09-25',effect:'Achieve 90% workforce readiness',status:'Open'}];
const seedAudit=[{event:'August actuals validated',actor:'Data Steward',time:'07 Sep 2026, 09:42'},{event:'Service completion breach escalated to executive sponsor',actor:'Scoring engine (simulated)',time:'07 Sep 2026, 09:40'}];

const STORE='itqan-demo-v1';
/* Stored workspaces are stamped with the seed generation they were created from, so a
   payload saved by a differently branded build is discarded rather than restored into
   the ITQAN IQ shell with foreign goals, KPIs and departments. */
const SEED='itqan-iq';
let saved=null;try{const restored=JSON.parse(localStorage.getItem(STORE));if(restored&&restored.seed===SEED)saved=restored}catch{}
let kpis=Data.normalise(saved&&Array.isArray(saved.kpis)?saved.kpis:initialKpis);
let actions=saved&&Array.isArray(saved.actions)?saved.actions:seedActions.map(a=>({...a}));
let audit=saved&&Array.isArray(saved.audit)?saved.audit:seedAudit.map(a=>({...a}));
let page='dashboard',ar=false,periodIndex=Data.latest,department='All departments',filter='All statuses',query='';
/* Demo sign-in gate. The prototype has no backend, so any well-formed credentials are
   accepted; the flag only decides whether the login page or the workspace shell renders. */
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
const period=()=>Data.periods[periodIndex];
const shortMonth=i=>Data.periods[i].slice(0,3);
const isCurrent=()=>periodIndex===Data.latest;
/* Every view reads its rows from the same scoped, period-resolved projection. */
const scoped=(i=periodIndex,dept=department)=>Data.published(kpis,dept,i);
const goalItems=(goal,i=periodIndex)=>scoped(i).filter(k=>k.goal===goal);
const health=goal=>avg(goalItems(goal));
const departments=()=>[...new Set(kpis.map(k=>k.dept))].sort();
const raw=id=>kpis.find(k=>k.id===id);
const rounded=v=>finite(v)?Math.round(v):null;
const pct=v=>finite(v)?`${Math.round(v)}%`:'—';
const width=v=>finite(v)?Math.max(0,Math.min(100,v)):0;
const trimNum=v=>finite(v)?String(Number(v.toFixed(2))):'—';
const unitSuffix={'%':'%',days:' days',min:' min',count:'',rate:' per 100k'};
const fmt=(v,unit)=>finite(v)?`${trimNum(v)}${unitSuffix[unit]===undefined?` ${unit}`:unitSuffix[unit]}`:'—';
const value=k=>fmt(k.actual,k.unit);
const targetText=k=>fmt(k.target,k.unit);
const statusText={green:['On track','على المسار'],amber:['At risk','معرض للخطر'],red:['Off track','خارج المسار'],missing:['No data','لا توجد بيانات']};
const statusFilters={'On track':'green','At risk':'amber','Off track':'red','No data':'missing'};
const pill=s=>`<span class="pill ${s}">${t(...statusText[s])}</span>`;
const goalPill=v=>pill(Data.aggregateStatus(v));
const trendText={improving:['Improving','تحسن'],deteriorating:['Deteriorating','تراجع'],stable:['Unchanged','مستقر'],unavailable:['No comparison','لا توجد مقارنة']};
const trendMark={improving:'↗',deteriorating:'↘',stable:'→',unavailable:'·'};
const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
const delta=(now,then)=>finite(now)&&finite(then)?now-then:null;
const deltaText=d=>!finite(d)?'—':`${d>0?'↗ +':d<0?'↘ ':'→ '}${Math.abs(Math.round(d*10)/10)}`;

function persist(event){
  if(event)audit.unshift({event,actor:'A. Al Mansoori · Demo PMO',time:new Date().toLocaleString('en-GB')});
  localStorage.setItem(STORE,JSON.stringify({seed:SEED,kpis,actions,audit}));
}
function toast(msg){$('#toast').textContent=msg;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3500)}

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
    return `<line x1="${left}" y1="${ty}" x2="${W-right}" y2="${ty}" stroke="#e2e7dd"/><text class="axis" x="${left-10}" y="${Number(ty)+4}" text-anchor="end">${Number(v.toFixed(span<12?1:0))}${suffix}</text>`;
  }).join('');
  const showTarget=finite(target)&&target>=low&&target<=high;
  /* Anchor the target caption on whichever side has the most clearance from the series. */
  const edge=observed.length>1&&Math.abs(observed[observed.length-1]-target)>Math.abs(observed[0]-target)?'end':'start';
  const labelX=edge==='start'?left+8:W-right-8;
  const near=edge==='start'?observed[0]:observed[observed.length-1];
  const labelY=near>target?Math.min(y(target)+17,H-bottom-2):Math.max(y(target)-9,top+11);
  const targetLine=showTarget?`<line x1="${left}" x2="${W-right}" y1="${y(target).toFixed(1)}" y2="${y(target).toFixed(1)}" stroke="#a8894a" stroke-width="1.5" stroke-dasharray="5 5"/>`:'';
  const targetLabel=showTarget?`<text class="axis target" x="${labelX}" y="${labelY.toFixed(1)}" text-anchor="${edge==='start'?'start':'end'}" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">${t('Target','المستهدف')} ${Number(target)}${suffix}</text>`:'';
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(caption||'Trend chart')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5d8a68" stop-opacity=".22"/><stop offset="1" stop-color="#5d8a68" stop-opacity="0"/></linearGradient></defs>${axis}${targetLine}${runs.filter(r=>r.length>1).map(r=>`<polygon points="${r[0][0].toFixed(1)},${base} ${path(r)} ${r[r.length-1][0].toFixed(1)},${base}" fill="url(#${id})"/>`).join('')}${runs.filter(r=>r.length>1).map(r=>`<polyline points="${path(r)}" fill="none" stroke="#3f7357" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}${runs.flat().map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="#fff" stroke="#3f7357" stroke-width="2.5"/>`).join('')}${targetLabel}${labels.map((l,i)=>`<text class="axis" x="${x(i).toFixed(1)}" y="${H-10}" text-anchor="middle">${l}</text>`).join('')}</svg></div>`;
}

const brandMark=(size,cls='brand-mark')=>`<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="ITQAN IQ"><defs><clipPath id="itqan-tile"><rect width="64" height="64" rx="16"/></clipPath></defs><g clip-path="url(#itqan-tile)"><rect width="64" height="64" fill="#00732f"/><rect width="9" height="64" fill="#ce1126"/></g><g fill="#fff"><rect x="15" y="38" width="9" height="11" rx="2.5"/><rect x="28" y="31" width="9" height="18" rx="2.5"/><rect x="41" y="24" width="9" height="25" rx="2.5"/></g><path d="M14 42 44.1 18.2" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M52.5 11.5 46.1 22.7 40.1 15.2 Z" fill="#fff"/></svg>`;

/* ---------- shell ---------- */
function render(){
  document.documentElement.lang=ar?'ar':'en';
  document.documentElement.dir=ar?'rtl':'ltr';
  if(!authenticated)return renderLogin();
  const openActions=actions.filter(a=>a.status!=='Closed').length;
  $('#app').innerHTML=`<aside class="sidebar"><div class="brand">${brandMark(46)}<div><strong>ITQAN <span>IQ</span></strong><small>INTELLIGENCE IN PERFORMANCE</small></div></div><div class="org"><span class="seal">♜</span><div><strong>CONFEDINTIAL CLIENT</strong><small>${t('United Arab Emirates','الإمارات العربية المتحدة')}</small></div></div><nav>${nav.map(([id,en,a],i)=>`${i===0?`<div class="nav-label">${t('WORKSPACE','مساحة العمل')}</div>`:i===7?`<div class="nav-label">${t('GOVERNANCE','الحوكمة')}</div>`:''}<button class="nav-item ${page===id?'active':''}" data-page="${id}"${page===id?' aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${icons[id]}</span>${t(en,a)}${id==='actions'&&openActions?`<span class="count">${openActions}</span>`:id==='ai'?'<span class="count">IQ</span>':''}</button>`).join('')}</nav><div class="side-bottom"><div class="help-card"><strong>✧ ${t('Clarity. Confidence. Impact.','وضوح. ثقة. أثر.')}</strong><p>${t('Turn performance intelligence into meaningful action.','حوّل ذكاء الأداء إلى إجراءات مؤثرة.')}</p><button data-page="ai">${t('Meet your AI copilot','تعرف على مساعدك الذكي')} ↗</button></div><div class="user"><span class="avatar">AM</span><div><strong>A. Al Mansoori</strong><small>${t('Executive office · Demo','المكتب التنفيذي · تجريبي')}</small></div></div></div></aside><main class="main"><header class="topbar"><div class="breadcrumb">${t('Workspace','مساحة العمل')} / <b>${t(nav.find(n=>n[0]===page)[1],nav.find(n=>n[0]===page)[2])}</b></div><div class="top-actions"><label class="search-box"><span aria-hidden="true">⌕</span><input class="search" id="global-search" placeholder="${t('Search KPIs, owners…','البحث في المؤشرات…')}" aria-label="${t('Search KPIs','البحث في المؤشرات')}"></label><span class="demo">${t('SYNTHETIC DATA','بيانات اصطناعية')}</span><button class="ghost" id="language">${ar?'English':'العربية'}</button><button class="icon-button" id="notifications" aria-label="${t('Notifications','التنبيهات')}">♧${attention()?`<span class="dot" aria-hidden="true"></span>`:''}</button><span class="avatar">AM</span><button class="icon-button" id="sign-out" title="${t('Sign out','تسجيل الخروج')}" aria-label="${t('Sign out','تسجيل الخروج')}">⇥</button></div></header><div class="content">${heading()}${body()}<footer class="footer"><span>ITQAN IQ · ${t('A clear line of sight. A greater impact.','رؤية واضحة. أثر أكبر.')}</span><span>${t('Interactive prototype · Synthetic data','نموذج تفاعلي · بيانات اصطناعية')} · ${period()}</span></footer></div></main>`;
  bind();
}
const attention=()=>Data.summary(scoped()).attention;

function renderLogin(){
  $('#app').innerHTML=`<main class="login-page"><section class="login-card" aria-labelledby="login-title"><div class="login-brand">${brandMark(58)}<div><strong>ITQAN <span>IQ</span></strong><small>INTELLIGENCE IN PERFORMANCE</small></div></div><div class="login-copy"><div class="eyebrow">${t('PERFORMANCE INTELLIGENCE PLATFORM','منصة ذكاء الأداء')}</div><h1 id="login-title">${t('Welcome back.','مرحباً بعودتك.')}</h1><p>${t('Sign in to access your performance workspace.','سجّل الدخول للوصول إلى مساحة عمل الأداء.')}</p></div><form id="login-form" class="login-form"><label class="field"><span>${t('Work email','البريد الإلكتروني للعمل')}</span><input id="login-email" type="email" autocomplete="email" placeholder="name@organisation.ae" required></label><label class="field"><span>${t('Password','كلمة المرور')}</span><input id="login-password" type="password" autocomplete="current-password" placeholder="${t('Enter your password','أدخل كلمة المرور')}" required></label><div id="login-error" class="login-error" role="alert" aria-live="polite"></div><button class="primary login-submit" type="submit">${t('Sign in','تسجيل الدخول')} <span aria-hidden="true">→</span></button><button class="login-sso" type="button" id="login-sso">${t('Continue with UAE Pass','المتابعة عبر UAE Pass')}</button></form><p class="login-note">${t('Demo workspace · Use any valid email and password','مساحة عمل تجريبية · استخدم أي بريد إلكتروني وكلمة مرور صالحة')}</p></section><aside class="login-aside"><div class="login-aside-mark">${brandMark(42)}</div><p class="eyebrow">${t('CLARITY · CONFIDENCE · IMPACT','وضوح · ثقة · أثر')}</p><h2>${t('Turn performance intelligence into meaningful action.','حوّل ذكاء الأداء إلى إجراءات مؤثرة.')}</h2><p>${t('A connected view of strategic priorities, performance signals and next-best actions.','رؤية مترابطة للأولويات الاستراتيجية وإشارات الأداء والإجراءات التالية.')}</p><span class="demo">${t('SYNTHETIC DATA','بيانات اصطناعية')}</span></aside></main>`;
  const enter=()=>{authenticated=true;localStorage.setItem(AUTH,'true');render()};
  $('#login-form').onsubmit=e=>{
    e.preventDefault();
    if(!$('#login-email').value.trim()||!$('#login-password').value){
      $('#login-error').textContent=t('Enter your email and password to continue.','أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.');
      return;
    }
    enter();
  };
  $('#login-sso').onclick=enter;
}

function heading(){
  const titles={dashboard:['Performance, in perspective.','الأداء، برؤية شاملة.'],strategy:['One strategy. Shared ambition.','استراتيجية واحدة. طموح مشترك.'],kpi:['Every measure tells a story.','كل مؤشر يروي قصة.'],data:['Trusted data. Confident decisions.','بيانات موثوقة. قرارات واثقة.'],ai:['Intelligence that moves you forward.','ذكاء يدفعك إلى الأمام.'],impact:['See the impact. Own the response.','افهم الأثر. تولّ الاستجابة.'],actions:['From insight to meaningful action.','من الرؤى إلى إجراءات مؤثرة.'],reports:['The bigger picture, beautifully clear.','الصورة الكاملة، بوضوح.'],admin:['A framework built on trust.','إطار مبني على الثقة.'],audit:['Every change, accounted for.','كل تغيير، موثّق.']};
  const scopeControls=page==='admin'||page==='audit'?'':`<label class="field"><span>${t('Reporting period','فترة التقرير')}</span><select id="period" aria-label="${t('Reporting period','فترة التقرير')}">${Data.periods.map((p,i)=>`<option value="${i}"${i===periodIndex?' selected':''}>${p}</option>`).join('')}</select></label><label class="field"><span>${t('Department','الإدارة')}</span><select id="department" aria-label="${t('Department','الإدارة')}">${['All departments',...departments()].map(d=>`<option${department===d?' selected':''}>${d}</option>`).join('')}</select></label>`;
  const pageControls=page==='dashboard'?`<button id="export">↧ ${t('Export report','تصدير التقرير')}</button>`:page==='kpi'?`<button class="primary" id="new-kpi">＋ ${t('Register KPI','تسجيل مؤشر')}</button>`:page==='actions'?`<button class="primary" id="new-action">＋ ${t('Create action','إنشاء إجراء')}</button>`:'';
  return `<div class="page-heading"><div><div class="eyebrow">${t('CLIENT PERFORMANCE · STRATEGY 2026–2031','أداء العميل · استراتيجية ٢٠٢٦–٢٠٣١')}</div><h1>${t(...titles[page])}</h1><p class="sub">${page==='dashboard'?t('Your strategic priorities, performance signals, and next best actions — connected.','أولوياتك الاستراتيجية ومؤشرات الأداء والإجراءات التالية، مترابطة.'):t('Connected objectives. Accountable owners. Measurable progress.','أهداف مترابطة. مسؤوليات واضحة. تقدم قابل للقياس.')}</p></div><div class="controls">${scopeControls}${pageControls}</div></div>${scopeNote()}`;
}
function scopeNote(){
  if(page==='admin'||page==='audit')return '';
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
  return auditView();
}

function dashboard(){
  const items=scoped(),s=Data.summary(items);
  const path=Data.trajectory(kpis,department,periodIndex);
  const now=path[periodIndex],first=path.findIndex(finite);
  const change=first>=0&&first!==periodIndex?delta(now,path[first]):null;
  const onTrackShare=s.measured?Math.round(s.green/s.measured*100):null;
  const metrics=[
    [t('Strategic goals','الأهداف الاستراتيجية'),s.goals,'◇',t(`${goals.length} in the 2026–2031 framework`,`${goals.length} في إطار ٢٠٢٦–٢٠٣١`),''],
    [t('Published KPIs','المؤشرات المنشورة'),s.total,'▤',t(`Across ${plural(s.departments,'department')}`,`عبر ${s.departments} إدارات`),''],
    [t('KPIs on track','مؤشرات على المسار'),s.green,'↗',finite(onTrackShare)?t(`${onTrackShare}% of ${plural(s.measured,'measured KPI')}`,`${onTrackShare}% من المؤشرات المقاسة`):t('No measured KPIs in scope','لا توجد مؤشرات مقاسة'),`/ ${s.total}`],
    [t('Attention required','تتطلب الاهتمام'),s.attention,'◎',[`${s.red} ${t('off track','خارج المسار')}`,`${s.amber} ${t('at risk','معرض للخطر')}`,...(s.missing?[`${s.missing} ${t('no data','بدون بيانات')}`]:[])].join(' · '),'']
  ];
  const risky=items.filter(k=>status(k)!=='green');
  return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${t('YOUR STRATEGIC PULSE','نبضك الاستراتيجي')} · ${period().toUpperCase()}</div><h2>${t('Progress with purpose.','تقدم هادف.')}</h2><p>${t(`${s.green} of ${plural(s.total,'published KPI')} ${s.green===1?'is':'are'} on track. ${s.attention?`Stay focused on the ${plural(s.attention,'measure')} that ${s.attention===1?'needs':'need'} attention to keep our shared ambitions within reach.`:'Every published measure is meeting its target this period.'}`,`${s.green} من ${s.total} مؤشرات على المسار الصحيح. ${s.attention?`ركز على ${s.attention} مؤشرات تتطلب الاهتمام.`:'كل المؤشرات ضمن المستهدف.'}`)}</p><button class="text-link" data-page="strategy">${t('Explore strategic alignment','استكشف الترابط الاستراتيجي')} →</button></div><div class="hero-score"><div class="ring" style="background:conic-gradient(#d6c28c 0 ${width(now)}%,#ffffff1f ${width(now)}%)"><div class="ring-inner"><strong>${finite(now)?Math.round(now):'—'}${finite(now)?'<span>%</span>':''}</strong><small>${t('OVERALL ACHIEVEMENT','الإنجاز العام')}</small></div></div><div class="hero-delta"><span class="delta">${deltaText(change)}${finite(change)?' pts':''}</span><p>${first>=0&&first!==periodIndex?t(`since ${Data.periods[first]}`,`منذ ${Data.periods[first]}`):t('first reported period','أول فترة مسجلة')}</p></div></div></section>
  <div class="metrics">${metrics.map(([label,num,ic,foot,of],i)=>`<div class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon${i===3&&s.attention?' warn':''}" aria-hidden="true">${ic}</span></div><strong>${String(num).padStart(2,'0')}${of?`<small>${of}</small>`:''}</strong><div class="metric-foot">${foot}</div></div>`).join('')}</div>
  <div class="split"><section class="panel"><div class="panel-head"><div><h2>${t('Strategic goal performance','أداء الأهداف الاستراتيجية')}</h2><p>${t('Equal objective weights · 95% is the on-track boundary','أوزان متساوية · ٩٥٪ حد المسار الصحيح')}</p></div><button class="ghost" data-page="strategy">${t('Strategy map','خريطة الاستراتيجية')} ↗</button></div>${goals.map((g,i)=>{
    const list=goalItems(i),sc=avg(list),state=Data.aggregateStatus(sc);
    return `<div class="goal-row" data-goal="${i}" tabindex="0" role="button"><div class="goal-icon" aria-hidden="true">${g.icon}</div><div><div class="goal-name">${name(g)}</div><div class="goal-meta">${t('1 objective','هدف واحد')} · ${t(plural(list.length,'KPI'),`${list.length} مؤشرات`)}</div><div class="bar"><span class="${state}" style="width:${width(sc)}%"></span></div></div><div class="goal-value">${pct(sc)}<small class="${state}">${t(...statusText[state])}</small></div></div>`}).join('')}</section>
  <section class="panel trend-panel"><div class="panel-head"><div><h2>${t('Performance trajectory','مسار الأداء')}</h2><p>${t('Equal-weight goal achievement by reporting month','الإنجاز المرجح بالتساوي لكل شهر')}</p></div><span class="eyebrow">2026</span></div><div class="legend"><span><i></i>${t('Achievement','الإنجاز')}</span><span><i class="gold"></i>${t('95% ambition','طموح ٩٥٪')}</span></div>${chart({values:path,labels:path.map((_,i)=>shortMonth(i)),target:95,suffix:'%',caption:'Overall achievement by month'})}<div class="chart-note"><span>${t('Computed from recorded observations','محسوب من القراءات المسجلة')}</span><b>${deltaText(change)}${finite(change)?` pts ${t('since','منذ')} ${shortMonth(Math.max(first,0))}`:''}</b></div></section></div>
  <div class="bottom-split"><section class="panel"><div class="panel-head"><div><h2>${t('Where your attention matters','حيث يصنع اهتمامك الفرق')}</h2><p>${t('Priority measures to keep your strategy moving','مؤشرات الأولوية للحفاظ على تقدم استراتيجيتك')}</p></div><button class="ghost" data-page="kpi">${t('View all KPIs','كل المؤشرات')} →</button></div>${table(risky)}</section>${insights()}</div>`;
}

function strategy(){
  return `<div class="strategy-grid">${goals.map((g,i)=>{
    const list=goalItems(i),sc=avg(list),state=Data.aggregateStatus(sc),w=Data.weights(list);
    return `<div class="panel strategy-card"><div class="eyebrow">${t('STRATEGIC GOAL','هدف استراتيجي')} 0${i+1} · 2026–2031</div><h2>${g.icon} ${name(g)}</h2><p class="owner">${escapeHtml(g.owner)}</p><div class="goal-score"><strong>${pct(sc)}</strong>${goalPill(sc)}</div><div class="bar"><span class="${state}" style="width:${width(sc)}%"></span></div><div class="objective"><span class="eyebrow">${t('OBJECTIVE · 100% GOAL WEIGHT','الهدف التشغيلي · وزن ١٠٠٪')}</span><h3>${g.objective}</h3>${list.length?list.map(k=>`<button class="objective-kpi" data-kpi="${k.id}"><span class="objective-kpi-top"><span>${escapeHtml(name(k))}</span>${pill(status(k))}</span><small>${trimNum(w[k.id])}% ${t('weight','وزن')} · ${value(k)} / ${targetText(k)}</small></button>`).join(''):`<p class="empty">${t('No published KPIs in this scope.','لا توجد مؤشرات منشورة ضمن هذا النطاق.')}</p>`}</div></div>`}).join('')}</div>`;
}

function registry(){
  return `<div class="filterbar"><input id="kpi-search" value="${escapeHtml(query)}" placeholder="${t('Search by KPI name, ID or owner','البحث بالاسم أو الرمز أو المسؤول')}" aria-label="${t('Filter KPIs','تصفية المؤشرات')}"><select id="status-filter" aria-label="${t('Filter by status','تصفية حسب الحالة')}">${['All statuses',...Object.keys(statusFilters),'Draft'].map(s=>`<option${filter===s?' selected':''}>${s}</option>`).join('')}</select></div><div class="panel kpi-list" id="kpi-results">${table(filtered())}</div>`;
}

function dataHub(){
  const items=scoped();
  return `<div class="panel"><div class="panel-head"><div><h2>${t('Data collection workspace','مساحة جمع البيانات')}</h2><p>${period()} · ${isCurrent()?t('Recording an actual replaces this period’s value and recomputes every dependent score.','تسجيل قيمة يستبدل قيمة الفترة ويعيد حساب النتائج.'):t('Closed period — observations are read-only.','فترة مغلقة — القراءات للقراءة فقط.')}</p></div><span class="pill neutral">${plural(items.length,'KPI')}</span></div>${table(items,true)}</div><div class="detail-section"><h3>${t('Source systems','الأنظمة المصدرية')}</h3><p>${[...new Set(items.map(k=>k.source))].map(escapeHtml).join(' · ')||'—'}</p><p class="muted">${t('Source names are illustrative. Connectors, imports, Entra ID and Microsoft 365 are not connected in this prototype.','أسماء المصادر توضيحية. لا توجد اتصالات فعلية في هذا النموذج.')}</p></div>`;
}

function aiView(){
  return `<div class="split"><div class="panel ask-panel"><div class="eyebrow">✧ ${t('ASK ITQAN · DEMO COPILOT','اسأل إتقان · مساعد تجريبي')}</div><h2>${t('What would you like to understand?','ما الذي تريد فهمه؟')}</h2><p class="sub">${t('Explore your synthetic performance data. Responses are computed from the live local KPI values for the selected period; no AI service is connected.','استكشف بيانات الأداء الاصطناعية. الإجابات محسوبة من القيم المحلية للفترة المحددة.')}</p><form id="ask-form"><input id="ask-input" required placeholder="${t('Which KPIs need my attention?','أي المؤشرات تتطلب اهتمامي؟')}" aria-label="${t('Ask ITQAN','اسأل إتقان')}"><button class="primary">${t('Ask','اسأل')} ✧</button></form><div class="controls wrap"><button data-ask="risk">${t('Which KPIs are at risk?','أي المؤشرات معرضة للخطر؟')}</button><button data-ask="service">${t('Explain service performance','اشرح أداء الخدمات')}</button><button data-ask="forecast">${t('What is the forecast?','ما هو التوقع؟')}</button></div><div id="chat"></div></div>${insights()}</div>`;
}

function impact(){
  const items=scoped(),breached=items.filter(k=>status(k)!=='green');
  const critical=breached.filter(k=>{const b=Data.breach(k,health(k.goal));return b&&b.risk});
  return `<div class="panel"><div class="panel-head"><div><h2>${t('Performance exposure','الانكشاف على الأداء')}</h2><p>${t('Computed breaches and their strategic consequences · Human-owned recovery','الاختراقات المحسوبة وأثرها الاستراتيجي · التعافي بمسؤولية بشرية')}</p></div><span class="pill ${breached.length?'amber':'green'}">${plural(breached.length,'breach')}</span></div>${table(breached)}</div>${breached.map(k=>{
    const b=Data.breach(k,health(k.goal));if(!b)return '';
    const linked=actions.filter(a=>a.kpi===k.id);
    return `<div class="detail-section"><span class="pill ${status(k)}">${b.level} · ${b.route}</span><h3>${escapeHtml(name(k))} → ${goals[k.goal].objective} → ${escapeHtml(name(goals[k.goal]))}</h3><p>${status(k)==='missing'?t('No observation was recorded for this period, so the measure cannot contribute to goal achievement.','لم تُسجل قراءة لهذه الفترة.'):`${t('Achievement','الإنجاز')} ${pct(score(k))} · ${value(k)} ${t('against a target of','مقابل مستهدف')} ${targetText(k)} · ${t(...trendText[Data.trend(k)])}.`}</p><p>${t('Parent goal achievement','إنجاز الهدف الأم')}: ${pct(health(k.goal))}. ${t('Escalation owner','مسؤول التصعيد')}: ${escapeHtml(goals[k.goal].owner)}.</p><p>${t('Linked recovery actions','إجراءات التعافي المرتبطة')}: ${linked.length?linked.map(a=>`${escapeHtml(a.title)} (${a.status})`).join('; '):t('none yet','لا يوجد بعد')}.</p><button data-kpi="${k.id}">${t('Review impact & recovery','مراجعة الأثر والتعافي')} →</button></div>`}).join('')||`<div class="detail-section"><p class="empty">${t('No breaches in this scope for the selected period.','لا توجد اختراقات ضمن هذا النطاق.')}</p></div>`}${critical.length?`<p class="scope-note">◷ ${t(`${plural(critical.length,'measure')} met the critical rule: a repeated Off track result, or a parent goal below 95% achievement.`,'مؤشرات بلغت مستوى التصعيد الحرج.')}</p>`:''}`;
}

function actionBoard(){
  const lanes=['Open','In progress','Closed'];
  return `<div class="kanban">${lanes.map(lane=>{
    const list=actions.filter(a=>a.status===lane);
    return `<section class="lane"><h2>${t(lane,{'Open':'مفتوح','In progress':'قيد التنفيذ','Closed':'مغلق'}[lane])} <span class="lane-count">${list.length}</span></h2>${list.map(a=>{
      const k=raw(a.kpi),view=k?Data.at(k,periodIndex):null;
      const ready=k?Data.recoveryReady(k):false;
      return `<article class="action-card"><span class="pill ${view&&!k.draft?status(view):'neutral'}">${escapeHtml(a.kpi)}${view&&!k.draft?` · ${t(...statusText[status(view)])}`:''}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.effect)}</p><p class="muted">${escapeHtml(a.owner)}<br>${t('Due','الاستحقاق')} ${escapeHtml(a.due)}</p>${lane==='In progress'?`<p class="muted">${ready?t('✓ Two consecutive Green periods recorded — ready to close.','✓ فترتان متتاليتان خضراء — جاهز للإغلاق.'):t('Closure needs two consecutive Green periods.','الإغلاق يتطلب فترتين خضراوين متتاليتين.')}</p>`:''}<button data-action="${a.id}">${lane==='Open'?t('Start action','بدء الإجراء'):lane==='In progress'?t('Verify recovery & close','تحقق وأغلق'):t('View linked KPI','عرض المؤشر')} →</button></article>`}).join('')||`<p class="empty">${t('No actions here','لا توجد إجراءات')}</p>`}</section>`}).join('')}</div>`;
}

function reports(){
  const cards=[['Executive performance pack','Goal achievement, KPI status, owners and recovery priorities for the selected reporting period.','print','Preview / save PDF'],['KPI registry export','Published KPIs in scope with actuals, targets, achievement, status, confidence and source attribution.','csv','Download CSV'],['Department comparison','Compare equal-weight KPI achievement across departments for the selected period.','comparison','View comparison']];
  return `<div class="report-grid">${cards.map(([title,desc,id,label])=>`<div class="panel report-card"><span class="report-icon" aria-hidden="true">▧</span><h2>${title}</h2><p>${desc}</p><button data-report="${id}">${label} ↗</button></div>`).join('')}</div><div id="report-output"></div>`;
}

function admin(){
  return `<div class="split"><form class="panel pad" id="settings"><h2>${t('Framework configuration','إعداد الإطار')}</h2><div class="detail-section"><label for="cadence">${t('Review cadence','دورية المراجعة')}</label><select id="cadence"><option>Monthly</option><option>Quarterly</option></select><label for="recovery-rule">${t('Recovery requirement','متطلب التعافي')}</label><input id="recovery-rule" value="2 consecutive Green periods" disabled><label for="approval-rule">${t('KPI approval','اعتماد المؤشر')}</label><input id="approval-rule" value="Draft → PMO approval → Published" disabled><label for="boundary-rule">${t('Aggregate boundaries','حدود التجميع')}</label><input id="boundary-rule" value="Green ≥ 95% · Amber ≥ 85% · Red below 85%" disabled><button class="primary">${t('Save preferences','حفظ التفضيلات')}</button></div></form><div class="panel pad"><h2>${t('Prototype boundaries','حدود النموذج')}</h2><p class="muted">${t('You are viewing a simulated PMO workspace. Data is stored in this browser. Production SSO, role-based access, sovereign hosting, cryptographic audit and outbound notifications require backend implementation.','أنت تستعرض مساحة عمل محاكاة. البيانات مخزنة في هذا المتصفح.')}</p><p class="muted">${plural(kpis.length,'KPI definition')} · ${plural(kpis.filter(k=>k.draft).length,'draft')} · ${plural(actions.length,'action')} · ${plural(audit.length,'audit entry')}.</p><button id="reset">${t('Reset synthetic data','إعادة تعيين البيانات')}</button></div></div>`;
}

function auditView(){
  return `<div class="panel"><div class="panel-head"><div><h2>${t('Activity history','سجل النشاط')}</h2><p>${t('Local demonstration log · Not a tamper-evident production audit','سجل تجريبي محلي')}</p></div><span class="pill neutral">${plural(audit.length,'entry')}</span></div><div class="table-wrap"><table><thead><tr><th>${t('Event','الحدث')}</th><th>${t('Actor','المنفذ')}</th><th>${t('Timestamp','الوقت')}</th></tr></thead><tbody>${audit.map(a=>`<tr><td>${escapeHtml(a.event)}</td><td>${escapeHtml(a.actor)}</td><td>${escapeHtml(a.time)}</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- shared fragments ---------- */
function table(list,entry=false){
  return `<div class="table-wrap"><table><thead><tr><th>${t('KPI / accountable owner','المؤشر / المسؤول')}</th><th>${t('Actual / target','الفعلي / المستهدف')}</th><th>${t('Achievement','الإنجاز')}</th><th>${t('Status','الحالة')}</th><th>${entry?t('Update','تحديث'):t('Trend','الاتجاه')}</th></tr></thead><tbody>${list.map(k=>{
    const tr=k.draft?'unavailable':Data.trend(k);
    return `<tr class="clickable" data-kpi="${k.id}" tabindex="0"><td><strong>${escapeHtml(name(k))}</strong><small>${escapeHtml(k.owner)} · ${escapeHtml(k.dept)}</small></td><td><strong>${k.draft?'—':value(k)}</strong><small>${t('Target','المستهدف')} ${targetText(k)}</small></td><td><strong>${k.draft?'—':pct(score(k))}</strong></td><td>${k.draft?`<span class="pill amber">${t('Draft','مسودة')}</span>`:pill(status(k))}</td><td>${entry?`<span class="link-cue">${isCurrent()?t('Enter actual','إدخال قيمة'):t('View history','عرض السجل')} →</span>`:`<span class="trend ${tr}"><span aria-hidden="true">${trendMark[tr]}</span> ${t(...trendText[tr])}</span>`}</td></tr>`}).join('')||`<tr><td colspan="5" class="empty">${t('No matching KPIs','لا توجد مؤشرات مطابقة')}</td></tr>`}</tbody></table></div>`;
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
  if(gaps.length)cards.push(['▥',t('DATA GAP','فجوة بيانات'),'warn',t(`${plural(gaps.length,'measure')} without an observation`,`${gaps.length} مؤشرات بدون قراءة`),`${gaps.map(k=>name(k)).join(', ')} ${t('have no recorded value for','بدون قيمة مسجلة لـ')} ${period()}, ${t('so they are excluded from achievement and counted under attention required.','لذا استُبعدت من الإنجاز.')}`,`data-page="data"`,t('Open the data hub','افتح مركز البيانات')]);
  if(best&&cards.length<3)cards.push(['↗',t('POSITIVE MOMENTUM','زخم إيجابي'),'good',t(`${name(best)} is setting the pace`,`${name(best)} يتقدم`),`${value(best)} ${t('against a target of','مقابل مستهدف')} ${targetText(best)} (${pct(score(best))} ${t('achievement','إنجاز')}, ${t(...trendText[Data.trend(best)]).toLowerCase()}). ${t('Explore the practices behind it.','استكشف الممارسات وراءه.')}`,`data-page="ai"`,t('Ask ITQAN for more','اسأل إتقان للمزيد')]);
  if(!cards.length)cards.push(['✧',t('NO SIGNALS','لا إشارات'),'',t('Nothing to flag in this scope','لا شيء يستدعي التنبيه'),t('No published KPIs match the selected period and department.','لا توجد مؤشرات منشورة ضمن الفترة والإدارة المحددة.'),'data-page="kpi"',t('Open the registry','افتح السجل')]);
  return `<aside class="panel insights"><div class="panel-head"><h2>✧ ${t('A little intelligence. A lot of clarity.','ذكاء أكثر. وضوح أكبر.')}</h2><span class="eyebrow">ITQAN IQ</span></div>${cards.map(([ic,tag,tone,title,text,attr,cta])=>`<div class="insight"><div class="tag ${tone}">${ic} ${tag}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p><button ${attr}>${cta} →</button></div>`).join('')}<div class="insight-foot">${t('Advisory · Computed from local synthetic data · Human decisions','إرشادي · محسوب من بيانات محلية · القرار للإنسان')}</div></aside>`;
}

function filtered(){
  const term=query.trim().toLowerCase();
  return kpis
    .filter(k=>department==='All departments'||k.dept===department)
    .filter(k=>k.draft||(k.createdIndex??0)<=periodIndex)
    .map(k=>k.draft?{...k,actual:null,prior:null}:Data.at(k,periodIndex))
    .filter(k=>`${k.name} ${k.ar||''} ${k.id} ${k.owner}`.toLowerCase().includes(term))
    .filter(k=>filter==='All statuses'||(filter==='Draft'?!!k.draft:!k.draft&&statusFilters[filter]===status(k)));
}

function severity(k){const b=Data.breach(k,health(k.goal));return b?`${b.level} · ${b.route}`:null}

/* ---------- drawers ---------- */
function drawer(title,html){
  $('#overlay').innerHTML=`<div class="modal-backdrop"><section class="drawer" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="drawer-head"><div><div class="eyebrow">ITQAN IQ · ${t('PERFORMANCE WORKSPACE','مساحة الأداء')}</div><h2>${escapeHtml(title)}</h2></div><button id="close-modal" aria-label="${t('Close dialog','إغلاق')}">✕</button></div>${html}</section></div>`;
  $('#close-modal').onclick=close;
  $('.modal-backdrop').onclick=e=>{if(e.target===e.currentTarget)close()};
  $('#close-modal').focus();
  bindKpis();
}
function close(){$('#overlay').innerHTML=''}

function detail(id){
  const source=raw(id);if(!source)return;
  const k=source.draft?{...source,actual:null,prior:null}:Data.at(source,periodIndex);
  const siblings=goalItems(k.goal),weight=Data.weights(siblings)[k.id];
  const breachInfo=source.draft?null:Data.breach(k,health(k.goal));
  const editable=!source.draft&&isCurrent();
  drawer(name(k),`<div class="drawer-meta"><span class="eyebrow">${k.id} · ${t('DEFINITION VERSION 1','إصدار التعريف ١')} · ${k.type||'Lagging'} · ${t('Monthly','شهري')}</span>${source.draft?`<span class="pill amber">${t('Draft · Awaiting PMO','مسودة · بانتظار الاعتماد')}</span>`:pill(status(k))}</div>
  <p class="drawer-path">${escapeHtml(name(goals[k.goal]))} → ${goals[k.goal].objective}</p>
  <div class="detail-grid"><div class="detail-cell"><small>${t('Actual','الفعلي')} · ${period()}</small><strong>${source.draft?'—':value(k)}</strong></div><div class="detail-cell"><small>${t('Target','المستهدف')}</small><strong>${targetText(k)}</strong></div><div class="detail-cell"><small>${t('Accountable owner','المسؤول')}</small><strong class="small">${escapeHtml(k.owner)}</strong></div><div class="detail-cell"><small>${t('Achievement','الإنجاز')} · ${finite(weight)?`${trimNum(weight)}% ${t('objective weight','وزن الهدف')}`:t('unweighted draft','مسودة')}</small><strong>${source.draft?'—':pct(score(k))}</strong></div></div>
  <div class="detail-section"><h3>${t('Trend & target','الاتجاه والمستهدف')}</h3>${chart({values:source.history.slice(0,periodIndex+1),labels:source.history.slice(0,periodIndex+1).map((_,i)=>shortMonth(i)),target:k.target,suffix:k.unit==='%'?'%':'',caption:`${k.name} observations`})}<p>${t('Trend versus','الاتجاه مقابل')} ${periodIndex>0?Data.periods[periodIndex-1]:t('n/a','غير متاح')}: <b>${t(...trendText[source.draft?'unavailable':Data.trend(k)])}</b>${finite(k.prior)?` (${t('prior','السابق')} ${fmt(k.prior,k.unit)})`:''}</p><p class="muted">${t('Source','المصدر')}: ${escapeHtml(k.source)} · ${t('Confidence','الثقة')}: ${escapeHtml(k.confidence||'Not recorded')}<br>${t('Direction','الاتجاه المفضل')}: ${k.direction}-is-better · ${t('Amber boundary','حد التحذير')}: ${fmt(k.amber,k.unit)} · ${t('Baseline','خط الأساس')}: ${fmt(k.baseline,k.unit)}<br>${t('Formula','المعادلة')}: ${k.direction==='lower'?'target / actual':'actual / target'} × 100, ${t('capped at 100%','بحد أقصى ١٠٠٪')}.</p>${k.definition?`<p class="muted">${escapeHtml(k.definition)}</p>`:''}</div>
  ${breachInfo?`<div class="detail-section"><span class="pill ${status(k)}">${breachInfo.level} · ${breachInfo.route}</span><p>${t('Impacts','يؤثر على')}: ${goals[k.goal].objective}. ${t('Goal achievement','إنجاز الهدف')}: ${pct(health(k.goal))}. ${t('Escalation owner','مسؤول التصعيد')}: ${escapeHtml(goals[k.goal].owner)}.</p><h3>${t('Recovery actions','إجراءات التعافي')}</h3>${actions.filter(a=>a.kpi===id).map(a=>`<p>☑ ${escapeHtml(a.title)} · ${a.status}<br><span class="muted">${escapeHtml(a.owner)} · ${t('Due','الاستحقاق')} ${escapeHtml(a.due)}</span></p>`).join('')||`<p class="muted">${t('No recovery action yet.','لا يوجد إجراء تعافٍ بعد.')}</p>`}<button id="detail-action">＋ ${t('Create corrective action','إنشاء إجراء تصحيحي')}</button></div>`:''}
  ${source.draft?`<div class="detail-section"><p class="muted">${t('Approval publishes this definition to the scorecards from the current period onward. Historical months stay empty until observations are recorded.','الاعتماد ينشر التعريف اعتباراً من الفترة الحالية.')}</p><button class="primary" id="approve">${t('Approve & publish','اعتماد ونشر')}</button></div>`:editable?`<form class="detail-section" id="actual-form"><h3>${t('Record actual','تسجيل القيمة')} · ${period()}</h3><label for="actual">${period()} ${t('actual','الفعلي')} (${k.unit})</label><input id="actual" type="number" step="${k.unit==='count'?'1':'0.01'}" min="0" ${k.unit==='%'?'max="100"':''} value="${finite(k.actual)?k.actual:''}" required><label for="confidence">${t('Data confidence','ثقة البيانات')}</label><select id="confidence">${['Validated','Provisional','Estimated'].map(c=>`<option${k.confidence===c?' selected':''}>${c}</option>`).join('')}</select><button class="primary">${t('Save actual & recompute','حفظ وإعادة الحساب')}</button></form>`:`<div class="detail-section"><p class="muted">${t(`${period()} is a closed period. Switch the reporting period to ${Data.periods[Data.latest]} to record an actual.`,'فترة مغلقة. غيّر الفترة لتسجيل قيمة.')}</p></div>`}`);
  if(editable&&$('#actual-form'))$('#actual-form').onsubmit=e=>{
    e.preventDefault();
    try{
      Data.recordActual(source,Data.latest,Number($('#actual').value),$('#confidence').value);
    }catch(err){return toast(err.message)}
    persist(`${id}: ${Data.periods[Data.latest]} actual recorded as ${source.actual}; computed ${status(Data.at(source))}`);
    render();detail(id);toast(t('Actual saved. KPI and goal scores recomputed.','تم الحفظ وإعادة حساب النتائج.'));
  };
  if($('#detail-action'))$('#detail-action').onclick=()=>actionForm(id);
  if($('#approve'))$('#approve').onclick=()=>{
    source.draft=false;source.createdIndex=Data.latest;
    persist(`${id}: definition v1 approved and published`);
    close();render();toast(t('KPI approved and published. Record its first actual in the data hub.','تم الاعتماد. سجّل أول قيمة في مركز البيانات.'));
  };
}

function actionForm(id){
  const options=kpis.filter(k=>!k.draft);
  drawer(t('Create corrective action','إنشاء إجراء تصحيحي'),`<form class="detail-section" id="action-form"><label for="action-kpi">${t('Linked KPI','المؤشر المرتبط')}</label><select id="action-kpi">${options.map(k=>`<option value="${k.id}"${id===k.id?' selected':''}>${escapeHtml(k.name)}</option>`).join('')}</select><label for="action-title">${t('Action title','عنوان الإجراء')}</label><input id="action-title" required maxlength="120"><label for="action-owner">${t('Accountable owner','المسؤول')}</label><input id="action-owner" required maxlength="80"><label for="action-due">${t('Due date','تاريخ الاستحقاق')}</label><input id="action-due" type="date" required min="2026-09-07"><label for="action-effect">${t('Expected effect','الأثر المتوقع')}</label><textarea id="action-effect" required maxlength="240"></textarea><button class="primary">${t('Create action','إنشاء الإجراء')}</button></form>`);
  $('#action-form').onsubmit=e=>{
    e.preventDefault();
    const title=$('#action-title').value.trim(),owner=$('#action-owner').value.trim(),effect=$('#action-effect').value.trim(),due=$('#action-due').value;
    if(!title||!owner||!effect||!due)return toast(t('Complete every field before creating the action.','أكمل جميع الحقول.'));
    actions.push({id:Date.now(),title,kpi:$('#action-kpi').value,owner,due,effect,status:'Open'});
    persist('Corrective action created: '+title);
    close();page='actions';render();toast(t('Recovery action created and assigned','تم إنشاء الإجراء'));
  };
}

function register(){
  const text=[['name','KPI name'],['owner','Accountable owner'],['source','Data source'],['definition','Definition'],['formula','Measurement formula']];
  const numbers=[['baseline','Baseline'],['target','Target'],['amber','Amber boundary']];
  drawer(t('Register a KPI','تسجيل مؤشر'),`<form class="detail-section" id="register-form">${text.map(([f,label])=>`<label for="reg-${f}">${label}</label><input id="reg-${f}" required maxlength="140">`).join('')}<label for="reg-goal">${t('Linked objective','الهدف المرتبط')}</label><select id="reg-goal">${goals.map((g,i)=>`<option value="${i}">${g.objective}</option>`).join('')}</select><label for="reg-dept">${t('Department','الإدارة')}</label><select id="reg-dept">${departments().map(d=>`<option>${d}</option>`).join('')}</select><label for="reg-type">${t('Type','النوع')}</label><select id="reg-type"><option>Leading</option><option>Lagging</option></select><label for="reg-dir">${t('Direction','الاتجاه المفضل')}</label><select id="reg-dir"><option value="higher">Higher is better</option><option value="lower">Lower is better</option></select><label for="reg-unit">${t('Unit','الوحدة')}</label><select id="reg-unit">${['%','days','min','count','rate'].map(u=>`<option>${u}</option>`).join('')}</select>${numbers.map(([f,label])=>`<label for="reg-${f}">${label}</label><input id="reg-${f}" type="number" step="0.01" required>`).join('')}<p class="muted">${t('This prototype records monthly observations. Weights are normalised equally within each objective, so registering a KPI re-splits its objective weight instead of increasing the goal weight. New definitions stay in Draft until PMO approval and carry no historical observations.','يسجل هذا النموذج قراءات شهرية. الأوزان متساوية داخل كل هدف.')}</p><button class="primary">${t('Save draft for approval','حفظ المسودة')}</button></form>`);
  $('#register-form').onsubmit=e=>{
    e.preventDefault();
    const read=f=>$('#reg-'+f).value;
    const goal=Number(read('goal'));
    const draft={
      id:nextKpiId(),name:read('name').trim(),owner:read('owner').trim(),source:read('source').trim(),
      definition:read('definition').trim(),formula:read('formula').trim(),goal,dept:read('dept'),
      type:read('type'),direction:read('dir'),unit:read('unit'),frequency:'Monthly',
      target:Number(read('target')),amber:Number(read('amber')),baseline:Number(read('baseline')),
      history:Array(6).fill(null),confidences:Array(6).fill('Not recorded'),
      actual:null,prior:null,createdIndex:Data.latest,draft:true
    };
    try{Data.validateDefinition(draft,goals)}catch(err){return toast(err.message)}
    kpis.push(draft);
    persist('KPI definition draft created: '+draft.name);
    close();render();toast(t('Draft saved. Open the card to review and approve.','تم حفظ المسودة.'));
  };
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

function ask(q){
  const items=scoped(),risky=items.filter(k=>status(k)!=='green');
  let answer;
  if(/forecast|predict|توقع/i.test(q)){
    const lines=items.map(k=>{const f=Data.forecast(k);return finite(f)?`${k.name}: ${fmt(f,k.unit)} [${k.id}]`:`${k.name}: not enough history [${k.id}]`});
    answer=`One-step linear projection from ${period()} to the following month: ${lines.join('; ')}. This simple projection is not a trained model and has no calibrated confidence interval.`;
  }else if(/service|digital|خدم/i.test(q)){
    const list=items.filter(k=>k.goal===1);
    answer=list.length?`${list.map(k=>`${k.name} is ${value(k)} against a target of ${targetText(k)}; achievement ${pct(score(k))}; status ${statusText[status(k)][0]}; ${trendText[Data.trend(k)][0].toLowerCase()} versus the prior month [${k.id}, ${period()}]`).join('. ')}. Goal achievement is ${pct(health(1))}. Review service capacity and backlog evidence with the accountable owner before deciding on corrective action.`:`No published service KPIs are in scope for ${period()}${department==='All departments'?'':` in ${department}`}.`;
  }else if(/risk|attention|performance|track|priority|خطر|أداء/i.test(q)){
    answer=risky.length?`${plural(risky.length,'published KPI')} ${risky.length===1?'needs':'need'} attention in ${period()}${department==='All departments'?'':` (${department})`}. ${risky.map(k=>`${k.name}: ${value(k)} vs ${targetText(k)} target, ${statusText[status(k)][0]}, owner ${k.owner} [${k.id}]`).join('. ')}. Overall achievement is ${pct(overall(items))}. Prioritise Off track measures and review linked recovery actions.`:`All ${plural(items.length,'published KPI')} in scope are on track for ${period()}. Overall achievement is ${pct(overall(items))}.`;
  }else{
    answer='This prototype answers questions about KPI risk, service performance and forecasts. Try “Which KPIs need attention?” to inspect the synthetic data.';
  }
  $('#chat').innerHTML=`<div class="chat-message you">${escapeHtml(q)}</div><div class="chat-message">✧ ${escapeHtml(answer)}<br><small>${t('Advisory','إرشادي')} · ${t('Computed from synthetic','محسوب من بيانات')} ${period()} ${t('data','اصطناعية')} · ${t('Human review required','مراجعة بشرية مطلوبة')}</small></div>`;
}

/* ---------- events ---------- */
function bindKpis(){document.querySelectorAll('[data-kpi]').forEach(el=>{el.onclick=()=>detail(el.dataset.kpi);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();detail(el.dataset.kpi)}}})}

function bind(){
  document.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>{page=el.dataset.page;render()});
  if($('#sign-out'))$('#sign-out').onclick=()=>{authenticated=false;localStorage.removeItem(AUTH);page='dashboard';render()};
  bindKpis();
  document.querySelectorAll('[data-goal]').forEach(el=>{el.onclick=()=>{page='strategy';render()};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}}});
  $('#language').onclick=()=>{ar=!ar;render()};
  $('#global-search').onkeydown=e=>{if(e.key==='Enter'){query=e.target.value;filter='All statuses';page='kpi';render()}};
  $('#notifications').onclick=notifications;
  if($('#period'))$('#period').onchange=e=>{periodIndex=Number(e.target.value);render()};
  if($('#department'))$('#department').onchange=e=>{department=e.target.value;render()};
  if($('#export'))$('#export').onclick=csv;
  if($('#new-kpi'))$('#new-kpi').onclick=register;
  if($('#new-action'))$('#new-action').onclick=()=>actionForm();
  if($('#kpi-search'))$('#kpi-search').oninput=e=>{query=e.target.value;$('#kpi-results').innerHTML=table(filtered());bindKpis()};
  if($('#status-filter'))$('#status-filter').onchange=e=>{filter=e.target.value;render()};
  document.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
    const a=actions.find(x=>String(x.id)===String(el.dataset.action));if(!a)return;
    const k=raw(a.kpi);
    if(a.status==='Closed')return k?detail(k.id):toast(t('The linked KPI is no longer in the registry.','المؤشر المرتبط غير موجود.'));
    if(a.status==='In progress'){
      if(!k||!Data.recoveryReady(k))return toast(t('Closure blocked: recovery requires two consecutive Green periods.','الإغلاق يتطلب فترتين خضراوين متتاليتين.'));
      a.status='Closed';
    }else a.status='In progress';
    persist(`${a.title}: ${a.status}`);render();toast(t('Action status updated','تم تحديث حالة الإجراء'));
  });
  if($('#ask-form'))$('#ask-form').onsubmit=e=>{e.preventDefault();ask($('#ask-input').value)};
  document.querySelectorAll('[data-ask]').forEach(el=>el.onclick=()=>ask(el.textContent));
  document.querySelectorAll('[data-report]').forEach(el=>el.onclick=()=>{
    if(el.dataset.report==='csv')csv();
    else if(el.dataset.report==='print'){page='dashboard';render();window.print()}
    else $('#report-output').innerHTML=comparison();
  });
  if($('#settings'))$('#settings').onsubmit=e=>{e.preventDefault();localStorage.setItem('itqan-cadence',$('#cadence').value);persist('Review cadence preference updated');toast(t('Review cadence preference saved locally','تم حفظ التفضيل'))};
  if($('#cadence'))$('#cadence').value=localStorage.getItem('itqan-cadence')||'Monthly';
  if($('#reset'))$('#reset').onclick=()=>{localStorage.removeItem(STORE);location.reload()};
}

function notifications(){
  const breaches=scoped().filter(k=>status(k)!=='green');
  const drafts=kpis.filter(k=>k.draft);
  drawer(t('Notification centre','مركز التنبيهات'),`<p class="muted">${t('Demonstration notifications computed from your local workspace for','تنبيهات محسوبة محلياً لـ')} ${period()}.</p>${breaches.map(k=>`<div class="detail-section"><span class="pill ${status(k)}">${severity(k)}</span><h3>${escapeHtml(name(k))}</h3><p>${status(k)==='missing'?t('No observation recorded for this period.','لا توجد قراءة لهذه الفترة.'):`${value(k)} ${t('against','مقابل')} ${targetText(k)} · ${pct(score(k))} ${t('achievement','إنجاز')}`}. ${t('Assigned to','مسند إلى')} ${escapeHtml(k.owner)}.</p><button data-kpi="${k.id}">${t('Review KPI','مراجعة المؤشر')} →</button></div>`).join('')}${drafts.map(k=>`<div class="detail-section"><span class="pill amber">${t('Draft · Awaiting PMO','مسودة · بانتظار الاعتماد')}</span><h3>${escapeHtml(name(k))}</h3><p>${t('Submitted by','مقدم من')} ${escapeHtml(k.owner)}. ${t('Approval publishes it to the scorecards.','الاعتماد ينشره في بطاقات الأداء.')}</p><button data-kpi="${k.id}">${t('Review definition','مراجعة التعريف')} →</button></div>`).join('')}${breaches.length||drafts.length?'':`<p class="empty">${t('All published KPIs are on track and no definitions are awaiting approval.','كل المؤشرات على المسار.')}</p>`}`);
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
render();
