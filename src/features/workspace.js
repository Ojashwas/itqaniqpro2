/* Connected workspace features. Loaded before app.js; functions use its shared state. */
let arabicPattern;
function localizeText(value){
  if(!ar||typeof value!=='string'||!value||/^[\w.+-]+@[\w.-]+$/.test(value.trim()))return value;
  if(!arabicPattern)arabicPattern=new RegExp('(?<![A-Za-z0-9_@-])('+Object.keys(arabicUI).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z0-9_@-])','g');
  return value.replace(arabicPattern,match=>arabicUI[match]).replace(/(?<![A-Za-z0-9_-])(\d{4}-\d{2}-\d{2})(?![A-Za-z0-9_-])/g,date=>{
    if(!validDate(date))return date;
    return new Date(date+'T00:00:00').toLocaleDateString('ar-AE-u-nu-arab',{year:'numeric',month:'long',day:'numeric'});
  });
}
function localizeUI(root=document.body){
  if(!ar||!root||typeof document.createTreeWalker!=='function')return;
  // Option text doubles as its value when value is absent. Freeze the canonical value
  // before translating labels so filters and form submissions retain their domain keys.
  root.querySelectorAll('option').forEach(option=>{if(!option.hasAttribute('value'))option.setAttribute('value',option.value)});
  const walker=document.createTreeWalker(root,4),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    if(node.parentElement?.closest('script,style,textarea,input,[contenteditable],.brand,.login-brand,.login-mobile-brand,[translate="no"]'))return;
    const translated=localizeText(node.nodeValue);if(translated!==node.nodeValue)node.nodeValue=translated;
  });
  root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
    for(const attr of ['placeholder','title','aria-label'])if(el.hasAttribute(attr)){const old=el.getAttribute(attr),next=localizeText(old);if(old!==next)el.setAttribute(attr,next)}
  });
}
function watchUILanguage(){
  if(typeof window.MutationObserver!=='function'||!document.body)return;
  const observer=new window.MutationObserver(()=>localizeUI());
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
/* Fill only deterministic metadata; never replace measurements, approvals or user edits. */
function completeWorkspaceMetadata(){
  goals.forEach((g,i)=>{
    const parent=strategicGoals.find(p=>p.id===g.strategicGoalId);
    if(parent)Object.assign(g,{name:parent.name,ar:parent.ar,icon:parent.icon});
    const linkedDepartments=[...new Set(kpis.filter(k=>k.goal===i).map(k=>k.dept))];
    if(!g.department&&linkedDepartments.length===1)g.department=linkedDepartments[0];
  });
  initialKpis.forEach(seed=>{
    if(!appConfig.departmentOwners[seed.dept])appConfig.departmentOwners[seed.dept]=goals[seed.goal]?.owner||seed.owner;
    if(!appConfig.sourceProfiles[seed.source])appConfig.sourceProfiles[seed.source]={owner:seed.dept+' data team',frequency:'Monthly'};
    const k=kpis.find(k=>k.id===seed.id);
    if(k&&k.source===seed.source&&k.sourceKey===undefined)k.sourceKey=k.id;
  });
  actions.forEach(a=>{
    const seed=seedActions.find(s=>s.id===a.id&&s.kpi===a.kpi);
    const k=seed&&initialKpis.find(k=>k.id===seed.kpi);
    if(k&&!a.trigger&&!a.createdAt&&!isActionPlan(a)){
      const v=Data.at(k,Data.latest);
      a.trigger={period:Data.periods[Data.latest],actual:v.actual,target:v.target,amber:v.amber,unit:v.unit,status:Data.status(v),source:v.source};
    }
  });
}
function formatAuditTime(value){
  // Legacy display strings remain intact; new events store sortable ISO timestamps.
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(value)||Number.isNaN(Date.parse(value)))return value||'—';
  return new Date(value).toLocaleString(ar?'ar-AE':'en-GB');
}
function workspaceIntegrity(){
  const issues=[],add=(entity,id,message)=>issues.push({entity,id:String(id),message});
  const duplicates=(list,entity)=>{const seen=new Set();list.forEach(r=>{const id=String(r.id);if(r.id==null||seen.has(id))add(entity,id,'Missing or duplicate ID');seen.add(id)})};
  duplicates(strategicGoals,'Strategic goal');duplicates(kpis,'KPI');duplicates(actions,'Plan');duplicates(users,'Account');duplicates(approvals,'Approval');
  goals.forEach((g,i)=>{
    const parent=strategicGoals.find(p=>p.id===g.strategicGoalId);
    if(!parent)add('Objective',i,'Strategic goal is missing');
    else if(g.name!==parent.name||g.ar!==parent.ar)add('Objective',i,'Strategic goal label is out of sync');
    if(!allDepartments.includes(g.department))add('Objective',i,'Responsible department is missing or unknown');
  });
  kpis.forEach(k=>{
    if(!allDepartments.includes(k.dept))add('KPI',k.id,'Department is unknown');
    try{Data.validateDefinition(k,goals)}catch(e){add('KPI',k.id,e.message)}
    if(!appConfig.sourceProfiles[k.source]?.owner)add('KPI',k.id,'Source ownership needs configuration');
    if(k.history.length!==Data.periods.length||k.confidences.length!==Data.periods.length)add('KPI',k.id,'Reporting periods and confidence flags do not align');
    k.history.forEach((actual,i)=>{
      if(actual!==null&&!Data.validActual(k,actual))add('KPI',k.id,'Invalid actual in '+Data.periods[i]);
      if(actual===null?k.confidences[i]!=='Not recorded':!['Validated','Provisional','Estimated'].includes(k.confidences[i]))add('KPI',k.id,'Confidence does not match the observation in '+Data.periods[i]);
      if((k.draft||i<(k.createdIndex??0))&&actual!==null)add('KPI',k.id,'Observation predates publication');
      const v=Data.at(k,i);
      if(!Data.finite(v.target)||v.target<=0||!Data.validActual(v,v.target)||!Data.validActual(v,v.amber)||(v.direction==='higher'?v.amber>=v.target:v.amber<=v.target))add('KPI',k.id,'Invalid target boundaries in '+Data.periods[i]);
    });
    if(k.targetHistory&&k.targetHistory.length!==Data.periods.length)add('KPI',k.id,'Target history does not cover every reporting period');
    const latest=Data.at(k);if(latest.target!==k.target||latest.amber!==k.amber)add('KPI',k.id,'Current target differs from the latest target history');
  });
  actions.forEach(a=>{
    if(!['Action plan','Recovery plan'].includes(a.planType))add('Plan',a.id,'Unknown plan type');
    if(!goals[planGoal(a)]||!allDepartments.includes(planDepartment(a))||(a.kpi&&!kpis.some(k=>k.id===a.kpi)))add('Plan',a.id,'Objective, KPI or department link is missing');
    if(!isActionPlan(a)&&!a.kpi)add('Plan',a.id,'Recovery requires a linked KPI');
    if(!validDate(a.due))add('Plan',a.id,'Deadline is invalid');
    if(!['Open','In progress','Closed'].includes(a.status))add('Plan',a.id,'Unknown execution status');
    if(a.status!=='Open'&&a.approvalStatus!=='Approved')add('Plan',a.id,'Execution started without an approved plan');
    if(a.approvalStatus==='Approved'&&planGaps(a).length)add('Plan',a.id,'Approved plan is incomplete: '+planGaps(a).join(', '));
    a.milestones.forEach(m=>{if(!validDate(m.due)||m.due>a.due||!m.owner?.trim()||(m.done&&!m.evidence?.trim()))add('Plan',a.id,'Milestone needs a valid owner, deadline or completion evidence')});
    if(a.status==='Closed'&&(!a.closure||!a.evidence?.trim()))add('Plan',a.id,'Closure evidence is missing');
  });
  const pending=new Set();
  approvals.forEach(r=>{
    const record=requestEntity(r),key=r.entity+':'+r.entityId;
    if(!['KPI','Plan'].includes(r.entity)||!record)add('Approval',r.id,'Linked record is missing');
    if(!users.some(u=>u.id===r.requesterId))add('Approval',r.id,'Requesting account is missing');
    if(['Department review','Strategy review'].includes(r.status)){
      if(pending.has(key))add('Approval',r.id,'Multiple pending requests for one record');pending.add(key);
      if(record&&r.department!==(r.entity==='KPI'?record.dept:planDepartment(record)))add('Approval',r.id,'Department no longer matches the linked record');
      if(record&&entityVersion(record)!==r.baseVersion)add('Approval',r.id,'Record changed; return this request for resubmission');
    }
  });
  users.filter(u=>u.active).forEach(u=>{if(!roleNames[u.role]||(['lead','contributor'].includes(u.role)&&!allDepartments.includes(u.department)))add('Account',u.id,'Role or department is invalid')});
  return issues;
}
function integrityPanel(){
  const issues=workspaceIntegrity();
  return `<section class="detail-section"><h3>Workspace data consistency</h3><p>${strategicGoals.length} strategic goals · ${goals.length} objectives · ${kpis.length} KPIs · ${actions.length} plans · ${approvals.length} approval requests</p><p><span class="pill ${issues.length?'amber':'green'}">${issues.length?issues.length+' items to review':'Object links and reporting data reconcile'}</span></p>${issues.length?`<div class="table-wrap"><table><thead><tr><th>Object</th><th>Reference</th><th>Review needed</th></tr></thead><tbody>${issues.map(i=>`<tr><td>${escapeHtml(i.entity)}</td><td>${escapeHtml(i.id)}</td><td>${escapeHtml(i.message)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Parent links, departments, period data, plan states and approval references checked. Draft plans may still need completion before submission.</p>'}</section>`;
}
function canManageStrategy(){return ['strategy','admin'].includes(currentUser()?.role)}
function objectiveInScope(i){
  const g=goals[i];if(!g)return false;
  const dept=globalAccess()?department:currentUser()?.department;
  return dept==='All departments'||g.department===dept||visibleKpis().some(k=>k.goal===i&&k.dept===dept)||visibleActions().some(a=>planGoal(a)===i&&planDepartment(a)===dept);
}
function objectiveIndexes(id){return goals.map((g,i)=>({g,i})).filter(({g,i})=>g.strategicGoalId===id&&objectiveInScope(i)).map(({i})=>i)}
function strategicScore(id){return Data.mean(objectiveIndexes(id).map(i=>health(i)))}
function strategyDirectory(){return strategicGoals.filter(g=>globalAccess()&&department==='All departments'||objectiveIndexes(g.id).length)}
function saveStrategicGoal(id,values){
  if(!canManageStrategy())throw Error('Strategy Team or Administrator access required.');
  const name=values.name.trim(),owner=values.owner.trim();if(!name||!owner)throw Error('Enter the strategic goal and accountable owner.');
  if(strategicGoals.some(g=>g.id!==id&&g.name.toLowerCase()===name.toLowerCase()))throw Error('This strategic goal already exists.');
  const existing=strategicGoals.find(g=>g.id===id);if(id&&!existing)throw Error('Strategic goal unavailable.');
  const record={id:id||'SG-'+Date.now()+'-'+strategicGoals.length,name,owner,ar:values.ar?.trim()||'',description:values.description?.trim()||'',icon:existing?.icon||'◇'};
  if(existing)Object.assign(existing,record);else strategicGoals.push(record);
  goals.filter(g=>g.strategicGoalId===record.id).forEach(g=>Object.assign(g,{name:record.name,ar:record.ar,icon:record.icon}));
  persist('Strategic goal '+(existing?'updated: ':'created: ')+name);return record;
}
function saveChildObjective(index,values){
  if(!canManageStrategy())throw Error('Strategy Team or Administrator access required.');
  const parent=strategicGoals.find(g=>g.id===values.strategicGoalId),objective=values.objective.trim(),owner=values.owner.trim();
  if(!parent||!objective||!owner||!allDepartments.includes(values.department))throw Error('Choose a strategic goal, objective, owner and responsible department.');
  if(index!==null&&!goals[index])throw Error('Objective unavailable.');
  if(goals.some((g,i)=>i!==index&&g.strategicGoalId===parent.id&&g.objective.toLowerCase()===objective.toLowerCase()))throw Error('This objective already exists under this strategic goal.');
  const payload={name:parent.name,ar:parent.ar,icon:parent.icon,strategicGoalId:parent.id,objective,owner,department:values.department};
  if(index===null){index=goals.length;goals.push(payload)}else Object.assign(goals[index],payload);
  Data.configure({...appConfig,objectiveParents:goals.map(g=>g.strategicGoalId)});
  persist('Objective '+(values.existing?'updated: ':'saved: ')+objective,values.department);return index;
}
function strategicGoalForm(id){
  if(!canManageStrategy())return toast('Strategy Team or Administrator access required.');
  const g=strategicGoals.find(g=>g.id===id)||{};setDrawerRoute('strategic-goal-form:'+(id||'new'),()=>strategicGoalForm(id));
  drawer(id?'Edit strategic goal':'Create strategic goal',`<p class="plan-purpose">Create the strategic goal first, then add one or more objectives beneath it. Each objective can have KPIs and action plans.</p><form id="strategic-goal-form" class="detail-section">${[['name','Strategic goal'],['ar','Arabic goal name (optional)'],['owner','Accountable owner'],['description','Description (optional)']].map(([key,label])=>`<label for="sg-${key}">${label}</label><input id="sg-${key}" maxlength="240" ${['name','owner'].includes(key)?'required':''} value="${escapeHtml(g[key]||'')}">`).join('')}<p id="strategy-form-error" role="alert"></p><button class="primary">${id?'Save strategic goal':'Create goal & add objective'}</button></form>`);
  $('#strategic-goal-form').onsubmit=e=>{e.preventDefault();try{const g=saveStrategicGoal(id,Object.fromEntries(['name','ar','owner','description'].map(k=>[k,$('#sg-'+k).value])));render();if(id)strategicGoalDetail(g.id);else childObjectiveForm(g.id)}catch(err){$('#strategy-form-error').textContent=err.message}};
}
function childObjectiveForm(parentId,index=null){
  if(!canManageStrategy())return toast('Strategy Team or Administrator access required.');
  const g=goals[index]||{};setDrawerRoute('child-objective:'+(index??parentId),()=>childObjectiveForm(parentId,index));
  drawer(index===null?'Create objective':'Edit objective',`<form id="child-objective-form" class="detail-section"><label for="obj-parent">Strategic goal</label><select id="obj-parent">${strategicGoals.map(p=>`<option value="${p.id}"${p.id===(g.strategicGoalId||parentId)?' selected':''}>${escapeHtml(p.name)}</option>`).join('')}</select><label for="obj-name">Objective</label><input id="obj-name" required maxlength="160" value="${escapeHtml(g.objective||'')}"><label for="obj-owner">Accountable owner</label><input id="obj-owner" required maxlength="100" value="${escapeHtml(g.owner||'')}"><label for="obj-department">Responsible department</label><select id="obj-department">${allDepartments.map(d=>`<option${d===(g.department||kpis.find(k=>k.goal===index)?.dept||department)?' selected':''}>${escapeHtml(d)}</option>`).join('')}</select><p class="muted">KPIs register against this objective. Existing KPI and action links remain intact when the objective is edited.</p><p id="objective-form-error" role="alert"></p><button class="primary">Save objective</button></form>`);
  $('#child-objective-form').onsubmit=e=>{e.preventDefault();try{const i=saveChildObjective(index,{strategicGoalId:$('#obj-parent').value,objective:$('#obj-name').value,owner:$('#obj-owner').value,department:$('#obj-department').value,existing:index!==null});department='All departments';render();objectiveDetail(i)}catch(err){$('#objective-form-error').textContent=err.message}};
}
function strategicGoalDetail(id){
  const g=strategyDirectory().find(g=>g.id===id);if(!g)return toast('Strategic goal unavailable.');
  setDrawerRoute('strategic-goal:'+id,()=>strategicGoalDetail(id));
  drawer('Strategic goal',`<section class="detail-section"><h3>${escapeHtml(name(g))}</h3><p>${escapeHtml(g.description||'')}</p><p>Accountable owner: ${escapeHtml(g.owner)}</p>${goalPill(strategicScore(id))}${canManageStrategy()?`<div class="connection-buttons"><button data-edit-strategic-goal="${id}">Edit strategic goal</button><button class="primary" data-add-objective="${id}">Create objective</button></div>`:''}</section>${objectiveIndexes(id).map(i=>`<section class="detail-section"><button class="objective-title" data-objective="${i}">${escapeHtml(goals[i].objective)} →</button><p>${escapeHtml(goals[i].owner)} · ${goalItems(i).length} KPIs · ${pct(health(i))}</p></section>`).join('')||'<p class="empty">No objectives yet. Create the first objective under this goal.</p>'}`);
}
function strategyWorkspace(){
  return `<section class="panel connection-intro"><div class="eyebrow">STRATEGY & OBJECTIVES</div><h2>Give every KPI a clear purpose.</h2><p>Strategic goal → Objectives → KPIs. Add simple actions to an objective or KPI; start recovery when a KPI misses its target.</p>${canManageStrategy()?'<button class="primary" id="create-strategic-goal">＋ Create strategic goal</button>':'<p class="muted">The Strategy Team maintains goals and objectives. Your department registers its KPIs against them.</p>'}</section><div class="strategy-grid">${strategyDirectory().map(g=>{
    const indexes=objectiveIndexes(g.id),sc=strategicScore(g.id);
    return `<section class="panel strategy-card"><div class="eyebrow">STRATEGIC GOAL</div><button class="objective-title" data-strategic-goal="${g.id}">${escapeHtml(name(g))} ↗</button><p class="owner">${escapeHtml(g.owner)}</p><div class="goal-score"><strong>${pct(sc)}</strong>${goalPill(sc)}</div><p class="muted">${plural(indexes.length,'objective')} · Equal objective weights</p>${canManageStrategy()?`<div class="connection-buttons"><button data-add-objective="${g.id}">＋ Create objective</button><button data-edit-strategic-goal="${g.id}">Edit goal</button></div>`:''}${indexes.map(i=>`<div class="objective"><span class="eyebrow">OBJECTIVE</span><button class="objective-title" data-objective="${i}">${escapeHtml(goals[i].objective)} ↗</button><p>${escapeHtml(goals[i].owner)} · ${pct(health(i))} achievement</p>${canWrite()?`<button data-register-objective="${i}">＋ Register KPI</button>`:''}${canManageStrategy()?` <button data-edit-child-objective="${i}">Edit objective</button>`:''}${objectiveActionLinks(i)}${objectiveMeasures(i)}</div>`).join('')||'<p class="empty">Create an objective to begin linking KPIs and actions.</p>'}</section>`;
  }).join('')||'<section class="panel pad">No strategic goals in this department scope.</section>'}</div>`;
}
function strategicPerformanceRows(){return strategyDirectory().map(g=>{const ids=objectiveIndexes(g.id),sc=strategicScore(g.id),state=Data.aggregateStatus(sc),count=ids.reduce((n,i)=>n+goalItems(i).length,0);return `<div class="goal-row" data-strategic-goal="${g.id}" tabindex="0" role="button"><div class="goal-icon">${escapeHtml(g.icon)}</div><div><div class="goal-name">${escapeHtml(name(g))}</div><div class="goal-meta">${ids.length} objectives · ${count} KPIs</div><div class="bar"><span class="${state}" style="width:${width(sc)}%"></span></div></div><div class="goal-value">${pct(sc)}<small class="${state}">${t(...statusText[state])}</small></div></div>`}).join('')}
function bindWorkspace(){
  if($('#create-strategic-goal'))$('#create-strategic-goal').onclick=()=>strategicGoalForm();
  document.querySelectorAll('[data-strategic-goal]').forEach(el=>{el.onclick=()=>strategicGoalDetail(el.dataset.strategicGoal);if(el.tagName!=='BUTTON')el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}}});
  document.querySelectorAll('[data-edit-strategic-goal]').forEach(el=>el.onclick=()=>strategicGoalForm(el.dataset.editStrategicGoal));
  document.querySelectorAll('[data-add-objective]').forEach(el=>el.onclick=()=>childObjectiveForm(el.dataset.addObjective));
  document.querySelectorAll('[data-edit-child-objective]').forEach(el=>el.onclick=()=>childObjectiveForm(goals[Number(el.dataset.editChildObjective)].strategicGoalId,Number(el.dataset.editChildObjective)));
  document.querySelectorAll('[data-register-objective]').forEach(el=>el.onclick=()=>{register();if($('#reg-goal'))$('#reg-goal').value=el.dataset.registerObjective});
  if($('#new-recovery'))$('#new-recovery').onclick=()=>recoveryStart();
  if($('#workspace-search-form'))$('#workspace-search-form').onsubmit=e=>{e.preventDefault();ask($('#workspace-search').value)};
}

/* Every entry point resolves its KPI then invokes the same actionForm recovery workflow. */
function recoveryStart(id){
  if(!canWrite())return toast('Your role is read only.');
  const refresh=periodIndex!==Data.latest||reportingPeriodIndex!==Data.latest;
  periodIndex=reportingPeriodIndex=Data.latest;
  if(refresh)render();
  if(id)return actionForm(id);
  setDrawerRoute('recovery-kpi',()=>recoveryStart());
  const choices=visibleKpis().filter(k=>recoveryEligible(k)&&(department==='All departments'||k.dept===department)&&(!linkedActionKpi||k.id===linkedActionKpi)&&(linkedActionGoal===''||String(k.goal)===linkedActionGoal));
  drawer('Create recovery plan',`<p class="plan-purpose">Choose a current Amber or Red KPI. The same recovery form, required details and approval cycle apply from every screen.</p><label class="field" for="recovery-kpi-search"><span>Find KPI</span><input id="recovery-kpi-search" type="search" placeholder="KPI name, ID or owner"></label><div id="recovery-kpi-options">${choices.map(k=>{const v=Data.at(k,Data.latest),open=linkedActions(k.id).filter(a=>!isActionPlan(a)&&a.status!=='Closed');return `<section class="recovery-choice" data-recovery-search="${escapeHtml([k.id,k.name,k.owner].join(' ').toLowerCase())}">${recoveryGap(k)}<p>${escapeHtml(k.dept)} · ${escapeHtml(k.owner)}</p>${open.map(a=>`<button data-linked-action="${a.id}">Open existing recovery: ${escapeHtml(a.title)}</button>`).join('')}<button class="primary" data-create-recovery="${k.id}">Create recovery plan</button></section>`}).join('')||'<p class="empty">No current Amber or Red KPI in this scope. Recovery needs an actual that is not meeting its target. Review the department or linked-record filter.</p>'}</div><p id="recovery-search-empty" hidden>No KPI matches your search.</p>`);
  $('#recovery-kpi-search').oninput=e=>{let count=0;document.querySelectorAll('[data-recovery-search]').forEach(el=>{el.hidden=!el.dataset.recoverySearch.includes(e.target.value.toLowerCase().trim());if(!el.hidden)count++});$('#recovery-search-empty').hidden=count>0||!choices.length};
}
function recoveryWorkflowSummary(a){
  const request=pendingRequest('Plan',a.id);
  const text=request?`Awaiting ${request.status}. You can follow the decision using View approval. Updates and execution are locked while this request is being reviewed.`:a.approvalStatus!=='Approved'?'This is a draft or returned plan. Complete the initial recovery details and submit it for Department and Strategy approval.':a.status==='Closed'?'This recovery is closed. Its approved evidence remains available. Reopening follows the approval cycle.':'The recovery plan is approved. Use Manage plan to start recovery, record progress, complete milestones with evidence and monitor results. Changes to approved scope, ownership, dates or corrective details require amendment approval.';
  return `<section class="plan-purpose" aria-label="Recovery workflow"><strong>Create & submit → Department review → Strategy review → Manage plan</strong><p>${escapeHtml(text)}</p></section>`;
}

function defaultLookups(){return {kpiTypes:['Leading','Lagging'],units:['%','days','min','count','rate'],priorities:['High','Medium','Low'],reviewCadences:['Weekly','Fortnightly','Monthly'],sourceFrequencies:['Daily','Weekly','Monthly']}}
function lookupValues(key,current){const values=appConfig.lookups?.[key]||defaultLookups()[key]||[];return [...new Set([...values,...(current?[current]:[])])]}
function lookupOptions(key,current){return lookupValues(key,current).map(v=>`<option value="${escapeHtml(v)}"${v===current?' selected':''}>${escapeHtml(v)}</option>`).join('')}
function validateLookup(key,value,existing){if(value!==existing&&!lookupValues(key).includes(value))throw Error('Select an active '+key+' value from Administration.');}
function saveLookup(key,values){
  requireAdmin();const defaults=defaultLookups();if(!defaults[key])throw Error('Unknown list.');
  values=values.map(v=>v.trim());if(!values.length||values.some(v=>!v||v.length>60)||new Set(values.map(v=>v.toLowerCase())).size!==values.length)throw Error('Keep at least one unique, non-empty value; maximum 60 characters per value.');
  if(key!=='kpiTypes'&&values.some(v=>!defaults[key].includes(v)))throw Error('This list uses supported system values.');
  if(key==='priorities'&&!values.includes(appConfig.defaultPriority)||key==='reviewCadences'&&!values.includes(appConfig.reviewCadence))throw Error('Change the plan default before disabling that value.');
  if(key==='kpiTypes')appConfig.knownKpiTypes=[...new Set([...(appConfig.knownKpiTypes||defaultLookups().kpiTypes),...lookupValues(key),...values])];
  appConfig.lookups={...appConfig.lookups,[key]:values};Data.configure(appConfig);persist('List of values updated: '+key);
}
function listsPanel(){
  return `<p class="muted">Manage values offered in new registrations and plans. Existing records and pending approvals retain their saved values. Defaults cannot be disabled while in use as a default.</p><div class="lov-grid">${Object.entries({kpiTypes:'KPI types',units:'KPI units',priorities:'Plan priorities',reviewCadences:'Recovery review frequency',sourceFrequencies:'Source refresh frequency'}).map(([key,label])=>`<form class="panel pad" data-lov-form="${key}"><h3>${label}</h3>${key==='kpiTypes'?`<label for="lov-${key}">One value per line</label><textarea id="lov-${key}" required rows="5">${escapeHtml(lookupValues(key).join('\n'))}</textarea>`:defaultLookups()[key].map(v=>`<label class="config-toggle"><input type="checkbox" name="value" value="${v}" ${lookupValues(key).includes(v)?'checked':''}>${escapeHtml(v)}</label>`).join('')}<p class="lov-error" role="alert"></p><button>Save list</button></form>`).join('')}</div><section class="detail-section"><h3>Related configuration</h3><div class="connection-buttons">${[['departments','Departments'],['strategy','Strategic goals & objectives'],['sources','Source systems'],['users','Users & roles'],['approvals','Approval stages'],['recovery','Plan defaults']].map(([id,label])=>`<button data-admin-tab="${id}">${label}</button>`).join('')}</div><p class="muted">Execution states (Open, In progress, Closed), approval stages, plan types, measurement direction, monthly reporting and security roles are governed system values. Their rules are shown in the corresponding configuration sections.</p></section>`;
}
function sourceDirectory(){return [...new Set([...kpis.map(k=>k.source),...Object.keys(appConfig.sourceProfiles)])]}
function addSource(values){
  requireAdmin();const name=values.name.trim(),owner=values.owner.trim();if(!name||!owner||!lookupValues('sourceFrequencies').includes(values.frequency))throw Error('Enter a source name, owner and supported refresh frequency.');
  if(sourceDirectory().some(s=>s.toLowerCase()===name.toLowerCase()))throw Error('This source already exists.');
  appConfig.sourceProfiles[name]={owner,frequency:values.frequency};persist('Source system added: '+name);
}
function sourceCreateForm(){return `<form id="add-source-form" class="admin-config-form"><h3>Add source system</h3><div class="admin-field-grid"><label class="field"><span>Source application</span><input name="sourceName" required maxlength="140"></label><label class="field"><span>Owner / team</span><input name="owner" required maxlength="100"></label><label class="field"><span>Expected refresh</span><select name="frequency">${lookupOptions('sourceFrequencies')}</select></label></div><p id="add-source-error" role="alert"></p><button class="primary">Add source system</button></form>`}
function bindCatalogues(){
  if(currentUser()?.role!=='admin')return;
  document.querySelectorAll('[data-lov-form]').forEach(form=>form.onsubmit=e=>{e.preventDefault();try{const key=form.dataset.lovForm;saveLookup(key,key==='kpiTypes'?form.querySelector('textarea').value.split('\n').filter(v=>v.trim()):[...form.querySelectorAll('input:checked')].map(el=>el.value));render();toast('List saved. New forms use these values.')}catch(err){form.querySelector('.lov-error').textContent=err.message}});
  if($('#add-source-form'))$('#add-source-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;try{addSource({name:form.elements.sourceName.value,owner:form.elements.owner.value,frequency:form.elements.frequency.value});render()}catch(err){$('#add-source-error').textContent=err.message}};
}

function workspaceSearch(question){
  const term=question.trim().toLowerCase(),matches=text=>String(text).toLowerCase().includes(term)||localizeText(String(text)).toLowerCase().includes(term),results=[];
  const add=(kind,title,description,attr,value)=>results.push({kind,title,description,attr,value});
  visibleKpis().filter(k=>department==='All departments'||k.dept===department).filter(k=>matches([k.id,k.name,k.ar,k.owner,k.definition,k.source].join(' '))).forEach(k=>add('KPI',k.name,k.id+' · '+(k.draft?'Draft':statusText[status(Data.at(k))][0]),'data-kpi',k.id));
  goals.forEach((g,i)=>{if(objectiveInScope(i)&&matches(g.objective+' '+g.owner))add('Objective',g.objective,g.name,'data-objective',i)});
  strategyDirectory().filter(g=>matches(g.name+' '+g.ar+' '+g.owner)).forEach(g=>add('Strategic goal',g.name,g.owner,'data-strategic-goal',g.id));
  assistantActions().filter(a=>matches([a.id,a.title,a.owner,a.effect,a.planType].join(' '))).forEach(a=>add(a.planType,a.title,a.status+' · '+a.owner,'data-linked-action',a.id));
  visibleApprovals().filter(r=>(department==='All departments'||r.department===department)&&matches([r.id,r.type,r.summary,r.requester,r.status].join(' '))).forEach(r=>add('Approval',r.summary,r.id+' · '+r.status,'data-request',r.id));
  const sources=globalAccess()&&department==='All departments'?sourceDirectory():[...new Set(visibleKpis().filter(k=>department==='All departments'||k.dept===department).map(k=>k.source))];
  sources.filter(matches).forEach(s=>add('Source system',s,'Source → KPI mapping and read-only actuals','data-search-source',s));
  visibleAudit().filter(e=>(department==='All departments'||e.department===department)&&matches(e.event+' '+e.actor)).slice(0,5).forEach(e=>add('Audit update',e.event,e.actor+' · '+e.time,'data-assistant-nav','audit'));
  const guides={strategy:'Create strategic goals and objectives; connect KPIs and action plans.',kpi:'Register a KPI or propose updates. Department and Strategy approval apply.',data:'Review incoming source data, KPI mappings and actual numbers.',ai:'Search the workspace and get help navigating ITQAN IQ.',impact:'Review KPI performance gaps, impact, escalation and related updates.',actions:'Create action or recovery plans; monitor Open, In progress and Closed cards.',approvals:'Review assigned requests and track the approval cycle.',admin:'Configure lists of values, sources, departments, roles and policies.',reports:'Compare results, export CSV and print reports.',audit:'Review recorded changes and decisions.',dashboard:'See overall achievement and priorities.'};
  nav.filter(([id,en,ar])=>(id!=='admin'||currentUser()?.role==='admin')&&matches(en+' '+ar+' '+guides[id])).forEach(([id,label])=>add('Application help',label,guides[id],'data-assistant-nav',id));
  return results;
}
function searchResults(question){
  const results=workspaceSearch(question);return `<h2>${results.length?'Workspace search results':'No matching records'}</h2><p>${results.length} matches in your authorized department scope. Select a result to open it.</p>${results.slice(0,40).map(r=>`<div class="assistant-result"><div><small>${escapeHtml(r.kind)}</small><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.description)}</small></div><button ${r.attr}="${escapeHtml(r.value)}">Open →</button></div>`).join('')}${results.length>40?'<p>Showing the first 40 matches. Refine your search to narrow the results.</p>':''}`;
}
function applicationHelp(){return `<h2>How ITQAN IQ connects</h2><ol class="workflow-guide"><li><strong>Strategy & objectives</strong> — Create strategic goals, then their objectives.</li><li><strong>KPI registry</strong> — Register measures and propose definition or target changes for approval.</li><li><strong>Data flows</strong> — Source applications supply KPI actuals; this app owns targets.</li><li><strong>Impact & escalation</strong> — Review gaps and impact. Create actions for KPIs, or recovery for Amber/Red KPIs.</li><li><strong>Plans & recovery</strong> — Use the same creation forms and monitor Open, In progress and Closed plans.</li><li><strong>Approvals</strong> — Department review precedes Strategy review for KPI and plan changes.</li><li><strong>Administration</strong> — Administrators maintain lists, sources, roles and policies.</li></ol><p>Search by a goal, objective, KPI, plan, source, approval ID or feature name. Results respect your access.</p>`}

function impactUpdates(k){
  const plans=linkedActions(k.id),updates=plans.flatMap(a=>[...a.notes.map(n=>({text:n.text,time:n.time,title:a.title,id:a.id})),...a.reviews.map(r=>({text:r.outcome+': '+r.evidence,time:r.time,title:a.title,id:a.id}))]).sort((a,b)=>String(b.time).localeCompare(String(a.time))).slice(0,3);
  const requests=visibleApprovals().filter(r=>r.entity==='KPI'&&r.entityId===k.id||r.entity==='Plan'&&plans.some(a=>a.id===r.entityId)).slice(0,3);
  return `<details class="impact-updates"><summary>Latest updates & approval status (${updates.length+requests.length})</summary>${updates.map(u=>`<article><button data-linked-action="${u.id}">${escapeHtml(u.title)}</button><p>${escapeHtml(u.text)}</p><small>${escapeHtml(u.time)}</small></article>`).join('')}${requests.map(r=>`<p><button data-request="${r.id}">${escapeHtml(r.type)} · ${escapeHtml(r.status)}</button></p>`).join('')||(!updates.length?'<p class="muted">No delivery updates or approval requests yet.</p>':'')}<p class="muted">Escalation is an advisory routing recommendation. No external notification has been sent.</p></details>`;
}

/* Presentation catalogue: persisted record keys and editable values remain unchanged. */
const arabicUI={
  "View approval": "عرض الموافقة",
  "Approval request": "طلب موافقة",
  "The proposed change takes effect only after both approvals.": "يسري التغيير المقترح بعد الموافقتين فقط.",
  "Current / previous record": "السجل الحالي / السابق",
  "Submitted for approval": "المقدم للموافقة",
  "Decision history": "سجل القرارات",
  "Decision note": "ملاحظة القرار",
  "Approve": "اعتماد",
  "Return for changes": "إعادة للتعديل",
  "Only the assigned approver can decide. Requesters cannot approve their own requests.": "يمكن للموافق المختص اتخاذ القرار. لا يمكن لمقدم الطلب اعتماد طلبه.",
  "Revise and resubmit": "تعديل وإعادة إرسال",
  "Back to approvals": "العودة للموافقات",
  "One approval path": "مسار موافقة واحد",
  "KPI publication, target changes, plan approval, amendments, closure and reopening follow this path. Progress notes and monitoring are recorded within an approved plan.": "نشر المؤشرات وتغيير المستهدفات واعتماد الخطط وتعديلها وإغلاقها وإعادة فتحها تتبع هذا المسار. تُسجل المتابعة ضمن خطة معتمدة.",
  "Show requests": "عرض الطلبات",
  "requests": "طلبات",
  "Review request": "مراجعة الطلب",
  "No approval requests in your scope.": "لا توجد طلبات موافقة ضمن نطاقك.",
  "Create": "إنشاء",
  "Register a KPI or create a plan. Actions support an objective or KPI. Recovery starts from a KPI below target.": "اختر ما تريد إنشاءه. ترتبط كل خطة بمؤشر وهدفه.",
  "Register KPI": "تسجيل مؤشر أداء",
  "Save configuration": "حفظ الإعدادات",
  "Administrator access required": "يتطلب صلاحية مسؤول",
  "Sign out, choose Workspace administrator on the demo account screen, then open Administration.": "سجل الخروج واختر مسؤول مساحة العمل ثم افتح الإدارة.",
  "Choose a demo account": "اختيار حساب تجريبي",
  "APPLICATION CONTROL CENTRE": "مركز التحكم بالتطبيق",
  "Configure the whole workspace.": "إعداد مساحة العمل بالكامل.",
  "Manage your organization, framework, people, policies and data-source settings in one place.": "أدر المنظمة والإطار والمستخدمين والسياسات وإعدادات المصادر في مكان واحد.",
  "Administration sections": "أقسام الإدارة",
  "Application configuration saved": "تم حفظ إعدادات التطبيق",
  "No observations recorded for this range.": "لا توجد قراءات مسجلة لهذه الفترة.",
  "Target": "المستهدف",
  "Sign in": "تسجيل الدخول",
  "United Arab Emirates": "الإمارات العربية المتحدة",
  "WORKSPACE": "مساحة العمل",
  "GOVERNANCE": "الحوكمة",
  "Clarity. Confidence. Impact.": "وضوح. ثقة. أثر.",
  "Turn performance intelligence into meaningful action.": "حوّل ذكاء الأداء إلى إجراءات مؤثرة.",
  "Open Ask IQ": "افتح Ask IQ",
  "Workspace": "مساحة العمل",
  "Search ITQAN IQ…": "البحث في المؤشرات…",
  "Search KPIs": "البحث في المؤشرات",
  "Administration": "الإدارة",
  "Notifications": "التنبيهات",
  "Sign out": "تسجيل الخروج",
  "Inspired by the UAE. Driven by excellence.": "مستوحى من الإمارات. مدفوع بالتميز.",
  "Interactive prototype · Synthetic data": "نموذج تفاعلي · بيانات اصطناعية",
  "Strategy Team": "فريق الاستراتيجية",
  "All departments": "جميع الإدارات",
  "Oversee strategic performance and give final business approval.": "الإشراف على الأداء الاستراتيجي ومنح الموافقة النهائية.",
  "Department Contributor": "مساهم الإدارة",
  "Your department": "إدارتك",
  "Register KPIs, set targets and deliver action and recovery plans.": "تسجيل المؤشرات وتحديد المستهدفات وتنفيذ خطط العمل والتعافي.",
  "Department Approver": "معتمد الإدارة",
  "Review department submissions and monitor corrective delivery.": "مراجعة طلبات الإدارة ومتابعة تنفيذ الإجراءات التصحيحية.",
  "Administrator": "مسؤول النظام",
  "Application configuration": "إعدادات التطبيق",
  "Manage settings, accounts and access. No business approval bypass.": "إدارة الإعدادات والحسابات والصلاحيات دون تجاوز الموافقات.",
  "Choose your workspace": "اختر مساحة عملك",
  "CONNECTED PERFORMANCE": "أداء مترابط",
  "United Arab Emirates flag": "علم دولة الإمارات العربية المتحدة",
  "Intelligence in<br><span>Performance.</span>": "ذكاء في<br><span>الأداء.</span>",
  "Connect your strategy, targets and actions. Choose your role to enter your workspace.": "اربط استراتيجيتك ومستهدفاتك وإجراءاتك. اختر دورك للدخول إلى مساحة عملك.",
  "Choose your role": "اختر دورك",
  "DEMO ACCESS": "وصول تجريبي",
  "Department": "الإدارة",
  "Assigned demo account": "الحساب التجريبي المعين",
  "Enter selected workspace": "دخول مساحة العمل المختارة",
  "Demo access needs no password. Live access will use the role assigned to your verified account.": "الوصول التجريبي لا يحتاج إلى كلمة مرور. يعتمد الوصول الفعلي على الدور المعين لحسابك الموثق.",
  "ORGANIZATION SIGN-IN": "تسجيل الدخول المؤسسي",
  "Connection pending": "بانتظار الربط",
  "YOUR PERFORMANCE WORKSPACE": "مساحة عمل الأداء",
  "Welcome back.": "مرحباً بعودتك.",
  "Sign in to your ITQAN IQ workspace.": "سجّل الدخول إلى مساحة عملك في إتقان.",
  "Sign in with UAE PASS": "تسجيل الدخول بالهوية الرقمية",
  "or use your organization account": "أو استخدم حساب مؤسستك",
  "Live sign-in is not connected yet. Choose your role in Demo access to explore the workspace.": "تسجيل الدخول الفعلي غير متصل بعد. اختر دورك في الوصول التجريبي لاستكشاف مساحة العمل.",
  "Login ID": "معرّف الدخول",
  "Enter your login ID or email": "أدخل معرّف الدخول أو البريد الإلكتروني",
  "Password": "كلمة المرور",
  "Forgot password?": "نسيت كلمة المرور؟",
  "Enter your password": "أدخل كلمة المرور",
  "Show": "إظهار",
  "Need workspace access?": "تحتاج إلى صلاحية الدخول؟",
  "Account help": "مساعدة الحساب",
  "Clarity in every decision.": "وضوح في كل قرار.",
  "Hide": "إخفاء",
  "Organization sign-in is not connected in this preview. Choose your role in Demo access to explore with an assigned account.": "تسجيل الدخول المؤسسي غير متصل في هذه المعاينة. اختر دورك في الوصول التجريبي للاستكشاف بحساب معين.",
  "UAE PASS sign-in is not connected in this preview. Choose your role in Demo access to enter the workspace.": "تسجيل الدخول بالهوية الرقمية غير متصل في هذه المعاينة. اختر دورك في الوصول التجريبي للدخول إلى مساحة العمل.",
  "Password recovery is managed by your organization. Contact your workspace administrator. No password reset is sent from this preview.": "تدير مؤسستك استعادة كلمة المرور. تواصل مع مسؤول مساحة العمل. لا ترسل هذه المعاينة طلبات إعادة تعيين.",
  "Your workspace administrator assigns your account, role and department. To preview Administration, choose the Administrator role and the Workspace administrator account.": "يحدد مسؤول مساحة العمل حسابك ودورك وإدارتك. لمعاينة الإدارة، اختر دور مسؤول النظام وحساب مسؤول مساحة العمل.",
  "No active account for this selection. An administrator must assign an account before this workspace can be entered.": "لا يوجد حساب نشط لهذا الاختيار. يجب أن يعين المسؤول حساباً قبل الدخول إلى مساحة العمل.",
  "No active account": "لا يوجد حساب نشط",
  "Reporting period": "فترة التقرير",
  "Your workspace, one question away.": "مساحة عملك، على بُعد سؤال.",
  "Export report": "تصدير التقرير",
  "Create action plan": "إنشاء خطة عمل",
  "Your strategic priorities, performance signals, and next best actions — connected.": "أولوياتك الاستراتيجية ومؤشرات الأداء والإجراءات التالية، مترابطة.",
  "Connected objectives. Accountable owners. Measurable progress.": "أهداف مترابطة. مسؤوليات واضحة. تقدم قابل للقياس.",
  "Strategic goals": "الأهداف الاستراتيجية",
  "Published KPIs": "المؤشرات المنشورة",
  "KPIs on track": "مؤشرات على المسار",
  "No measured KPIs in scope": "لا توجد مؤشرات مقاسة",
  "Attention required": "تتطلب الاهتمام",
  "off track": "خارج المسار",
  "at risk": "معرض للخطر",
  "no data": "بدون بيانات",
  "YOUR STRATEGIC PULSE": "نبضك الاستراتيجي",
  "Progress with purpose.": "تقدم هادف.",
  "Explore strategic alignment": "استكشف الترابط الاستراتيجي",
  "OVERALL ACHIEVEMENT": "الإنجاز العام",
  "first reported period": "أول فترة مسجلة",
  "Strategic goal performance": "أداء الأهداف الاستراتيجية",
  "Strategy map": "خريطة الاستراتيجية",
  "Performance trajectory": "مسار الأداء",
  "Equal-weight goal achievement by reporting month": "الإنجاز المرجح بالتساوي لكل شهر",
  "Achievement": "الإنجاز",
  "Computed from recorded observations": "محسوب من القراءات المسجلة",
  "since": "منذ",
  "Where your attention matters": "حيث يصنع اهتمامك الفرق",
  "Priority measures to keep your strategy moving": "مؤشرات الأولوية للحفاظ على تقدم استراتيجيتك",
  "View all KPIs": "كل المؤشرات",
  "Strategic connections": "الروابط الاستراتيجية",
  "Strategic goal": "هدف استراتيجي",
  "Objective": "هدف تشغيلي",
  "KPI": "مؤشر أداء",
  "Linked plans": "الخطط المرتبطة",
  "active": "نشطة",
  "Due": "الاستحقاق",
  "No plan linked to this KPI yet.": "لا توجد خطة مرتبطة بهذا المؤشر بعد.",
  "Action plan": "خطة عمل",
  "Create recovery plan": "إنشاء خطة تعافٍ",
  "View in action board": "عرض في لوحة الإجراءات",
  "objective weight": "وزن الهدف",
  "No published KPIs in this scope.": "لا توجد مؤشرات منشورة ضمن هذا النطاق.",
  "STRATEGIC GOAL": "الهدف الاستراتيجي",
  "Accountable owner": "المسؤول عن التنفيذ",
  "Achievement is calculated from the linked KPIs. Actions support recovery; closing an action does not change KPI results.": "يُحسب الإنجاز من المؤشرات المرتبطة. تدعم الإجراءات التعافي؛ إغلاق إجراء لا يغير نتائج المؤشرات.",
  "KPIs": "مؤشرات أداء",
  "active actions": "إجراءات نشطة",
  "KPIs needing a recovery plan": "مؤشرات تحتاج خطة تعافٍ",
  "View KPI registry": "عرض سجل المؤشرات",
  "View plans": "عرض الخطط",
  "Objective → Actions and KPIs → Recovery": "الهدف ← الإجراءات والمؤشرات ← التعافي",
  "Filter by objective": "تصفية حسب الهدف",
  "All objectives": "كل الأهداف",
  "Search by KPI name, ID or owner": "البحث بالاسم أو الرمز أو المسؤول",
  "Filter KPIs": "تصفية المؤشرات",
  "Filter by status": "تصفية حسب الحالة",
  "INCOMING DATA": "البيانات الواردة",
  "Source application → KPI actual → Performance & recovery": "التطبيق المصدري ← القيمة الفعلية ← الأداء والتعافي",
  "Actuals and confidence flags are supplied by the source applications. Set targets in the KPI registry; review incoming results here. Actuals cannot be entered or changed in this application.": "تُورد التطبيقات المصدرية القيم الفعلية ومؤشرات الثقة. حدد المستهدفات في سجل المؤشرات وراجع النتائج الواردة هنا. لا يمكن إدخال القيم الفعلية أو تعديلها في هذا التطبيق.",
  "Demo data · Live integrations not connected": "بيانات تجريبية · التكاملات الحية غير متصلة",
  "SOURCE APPLICATION": "التطبيق المصدري",
  "mapped KPIs": "مؤشرات مرتبطة",
  "Connection: not configured. Displayed values are synthetic examples, not a live sync.": "الاتصال غير مُعد. القيم المعروضة أمثلة اصطناعية وليست مزامنة حية.",
  "External actual": "القيمة الفعلية الخارجية",
  "Incoming actuals · Read only": "القيم الفعلية الواردة · للقراءة فقط",
  "What needs attention?": "ما الذي يحتاج انتباهاً؟",
  "Review approvals": "مراجعة الموافقات",
  "Help me set targets": "ساعدني في إعداد المستهدفات",
  "What would you like to know?": "ما الذي تود معرفته؟",
  "Find a record, understand performance, or take your next step.": "اعثر على سجل، وافهم الأداء، وحدد خطوتك التالية.",
  "Ask IQ or search your workspace": "اسأل IQ أو ابحث في مساحة العمل",
  "Ask a question or search your workspace…": "اطرح سؤالاً أو ابحث في مساحة العمل…",
  "Ask IQ": "Ask IQ",
  "Workspace snapshot": "لمحة عن مساحة العمل",
  "Need attention": "تحتاج انتباهاً",
  "Active plans": "الإجراءات النشطة",
  "Overdue": "متأخرة",
  "YOUR PRIORITIES": "أولوياتك",
  "Start over": "البدء من جديد",
  "Explore more": "استكشف المزيد",
  "How ITQAN IQ works": "كيف يعمل ITQAN IQ",
  "Where actuals come from": "مصادر القيم الفعلية",
  "Explore objectives": "استكشف الأهداف",
  "Manage plans": "إدارة الخطط",
  "Demo workspace guide · Searches available records and provides workflow guidance. Live AI is not connected.": "دليل مساحة العمل التجريبي · يبحث في السجلات المتاحة ويوفر إرشادات العمل. الذكاء الاصطناعي المباشر غير متصل.",
  "Open target setup": "فتح إعداد المستهدفات",
  "Review KPI": "مراجعة المؤشر",
  "Set targets in KPI details": "أعد المستهدفات في تفاصيل المؤشر",
  "Choose a KPI below. Edit Target and Amber boundary, then submit for approval. Published targets change after Department and Strategy review. Actuals stay read only.": "اختر مؤشراً وعدّل المستهدف وحد التحذير ثم أرسله للموافقة. القيم الفعلية للقراءة فقط.",
  "Historical targets are read only. Switch to the current period to edit targets.": "المستهدفات التاريخية للقراءة فقط. انتقل للفترة الحالية لتعديل المستهدفات.",
  "Use current period": "استخدام الفترة الحالية",
  "Open KPI registry": "فتح سجل المؤشرات",
  "Actuals come from source applications": "القيم الفعلية تأتي من التطبيقات المصدرية",
  "Set targets here; external data flows supply actuals and confidence. Data flows shows each KPI’s source. Live integrations are not connected in this demo.": "حدد المستهدفات هنا؛ توفر التدفقات الخارجية القيم الفعلية والثقة. تعرض تدفقات البيانات مصدر كل مؤشر. التكاملات الحية غير متصلة في هذا النموذج.",
  "Open data flows": "فتح تدفقات البيانات",
  "Follow your objective to its KPIs and recovery": "تتبع هدفك إلى مؤشراته وإجراءات التعافي",
  "Choose an objective to see its connected measures and actions.": "اختر هدفاً لعرض مؤشراته وإجراءاته المرتبطة.",
  "Follow up on overdue actions": "تابع الإجراءات المتأخرة",
  "Move recovery forward": "ادفع التعافي إلى الأمام",
  "No matching actions in this department scope.": "لا توجد إجراءات مطابقة ضمن نطاق الإدارة.",
  "Open action": "فتح الإجراء",
  "Open recovery board": "فتح لوحة التعافي",
  "No KPIs in this scope": "لا توجد مؤشرات ضمن هذا النطاق",
  "Start with these KPIs": "ابدأ بهذه المؤشرات",
  "Your KPIs are on track": "مؤشراتك على المسار الصحيح",
  "Choose another department or reporting period.": "اختر إدارة أو فترة تقرير أخرى.",
  "View all performance issues": "عرض جميع مشكلات الأداء",
  "Performance exposure": "الانكشاف على الأداء",
  "Review KPI gaps, updates, strategic impact and escalation. Create a KPI action or start recovery for Amber/Red results.": "الاختراقات المحسوبة وأثرها الاستراتيجي · التعافي بمسؤولية بشرية",
  "No observation was recorded for this period, so the measure cannot contribute to goal achievement.": "لم تُسجل قراءة لهذه الفترة.",
  "against a target of": "مقابل مستهدف",
  "Parent goal achievement": "إنجاز الهدف الأم",
  "Escalation owner": "مسؤول التصعيد",
  "Review impact & recovery": "مراجعة الأثر والتعافي",
  "No breaches in this scope for the selected period.": "لا توجد اختراقات ضمن هذا النطاق.",
  "Recovery verified": "التعافي متحقق",
  "Closed": "مغلقة",
  "Linked to": "مرتبط بـ",
  "Show all connections": "عرض كل الروابط",
  "reviews due": "مراجعات مستحقة",
  "blocked plans": "خطط متعطلة",
  "plans to complete": "خطط تحتاج استكمالاً",
  "Action plans & recovery": "خطط العمل والتعافي",
  "Action plans deliver a task for an objective or KPI. Recovery plans restore a KPI below target through corrective steps and performance reviews.": "الإجراءات الحالية · تعكس شارات المؤشرات الفترة المحددة. يتطلب الإغلاق نتائج خضراء في أغسطس وسبتمبر ٢٠٢٦ وإنجاز المراحل وتوثيق التعافي.",
  "Search plans": "البحث في الإجراءات",
  "Title, KPI or owner…": "العنوان أو المؤشر أو المسؤول",
  "Status": "الحالة",
  "All plans": "جميع الخطط",
  "Review due": "حان موعد المراجعة",
  "Blocked": "متعطلة",
  "Owner": "المسؤول",
  "All owners": "كل المسؤولين",
  "Priority": "الأولوية",
  "All priorities": "كل الأولويات",
  "Clear filters": "مسح عوامل التصفية",
  "plans shown": "إجراءات معروضة",
  "Supports objective": "يدعم الهدف",
  "Next review": "المراجعة التالية",
  "milestones complete": "مراحل مكتملة",
  "Complete the task and submit delivery evidence.": "أكمل المهمة وقدم دليل التنفيذ.",
  "Manage plan": "إدارة الخطة",
  "No matching plans": "لا توجد إجراءات مطابقة",
  "Plan incomplete": "خطة غير مكتملة",
  "Monitoring scheduled": "المراقبة مجدولة",
  "Root cause and supporting evidence": "السبب الجذري والأدلة",
  "Corrective steps": "الإجراءات التصحيحية",
  "Prevent recurrence (optional)": "منع التكرار (اختياري)",
  "Measurable success criteria": "معايير النجاح القابلة للقياس",
  "Corrective plan": "الخطة التصحيحية",
  "Link the cause to specific steps and a measurable outcome. Actual KPI values come from the source application.": "اربط السبب بخطوات محددة ونتيجة قابلة للقياس. تأتي القيم الفعلية من التطبيق المصدري.",
  "Review owner": "مسؤول المراجعة",
  "Review frequency": "دورية المراجعة",
  "Next review date": "تاريخ المراجعة التالية",
  "Save corrective plan": "حفظ الخطة التصحيحية",
  "Delivery milestones": "مراحل التنفيذ",
  "Complete": "مكتملة",
  "Pending": "قيد المراجعة",
  "Due date": "تاريخ الاستحقاق",
  "Completion evidence": "أدلة الإنجاز",
  "Completed": "مكتمل",
  "Save milestone": "حفظ المرحلة",
  "Add at least one owned, dated milestone before starting.": "أضف مرحلة واحدة على الأقل بمسؤول وتاريخ قبل البدء.",
  "New milestone": "مرحلة جديدة",
  "Add milestone": "إضافة مرحلة",
  "Monitoring & effectiveness": "المتابعة والفعالية",
  "Assessment": "التقييم",
  "Monitoring — not yet effective": "قيد المتابعة — لم تثبت الفعالية",
  "Blocked — intervention needed": "متعطلة — تحتاج تدخلاً",
  "Effective — outcome verified": "فعالة — تم التحقق من النتيجة",
  "Findings and evidence against success criteria": "النتائج والأدلة مقابل معايير النجاح",
  "Blockers / escalation needed": "العوائق / التصعيد المطلوب",
  "Record monitoring review": "تسجيل مراجعة المتابعة",
  "Complete and start the plan to record reviews.": "أكمل الخطة وابدأها لتسجيل المراجعات.",
  "Blockers": "العوائق",
  "No monitoring reviews recorded.": "لم تسجل مراجعات متابعة.",
  "Complete and start the corrective plan first.": "أكمل الخطة التصحيحية وابدأها أولاً.",
  "Add evidence and a future next review date.": "أضف الأدلة وتاريخ مراجعة تالياً في المستقبل.",
  "Describe the blocker and required intervention.": "صف العائق والتدخل المطلوب.",
  "Complete the corrective plan and assign dated milestones before starting.": "أكمل الخطة وحدد مسؤولاً وتاريخاً للمراحل قبل البدء.",
  "Complete all milestones before closure.": "أكمل جميع المراحل قبل الإغلاق.",
  "Add recovery evidence before closure.": "أضف دليل التعافي قبل الإغلاق.",
  "Record an effective monitoring review for the current plan and KPI results before closure.": "سجل مراجعة فعالية للخطة الحالية ونتائج المؤشر قبل الإغلاق.",
  "Enter a reason to reopen this action.": "أدخل سبب إعادة فتح الإجراء.",
  "Manage recovery plan": "إدارة خطة التعافي",
  "Edit details": "تعديل التفاصيل",
  "Linked KPI monitoring": "متابعة المؤشر المرتبط",
  "Recovery verification": "التحقق من التعافي",
  "Linked KPI unavailable": "المؤشر المرتبط غير متاح",
  "Verify delivery against the plan’s success criteria. KPI results remain visible as context.": "تحقق من التنفيذ مقابل معايير نجاح الخطة. تظهر نتائج المؤشر كسياق.",
  "Progress & evidence": "التقدم والأدلة",
  "Progress note": "ملاحظة التقدم",
  "Add update": "إضافة تحديث",
  "No progress updates yet.": "لا توجد تحديثات بعد.",
  "Last closure record": "سجل الإغلاق الأخير",
  "Verification & closure": "التحقق والإغلاق",
  "Closure requires an approved plan, evidenced milestones and an effective outcome review. Department and Strategy approve closure.": "يتطلب الإغلاق خطة معتمدة ومراحل موثقة ومراجعة فعالية وموافقتي الإدارة والاستراتيجية.",
  "Reason to reopen": "سبب إعادة الفتح",
  "Recovery evidence / outcome": "دليل التعافي / النتيجة",
  "Start recovery": "بدء التعافي",
  "Reopen action": "إعادة فتح خطة العمل",
  "Verify recovery & close": "تحقق من التعافي وأغلق",
  "Action history": "سجل الإجراء",
  "Existing action · no recorded changes yet.": "إجراء قائم · لم تسجل تغييرات بعد.",
  "Complete every plan field.": "أكمل جميع حقول الخطة.",
  "Add a title, owner and date no later than the plan deadline.": "أضف عنواناً ومسؤولاً وتاريخاً لا يتجاوز موعد الخطة.",
  "Set owner and date within the deadline; completion requires evidence.": "حدد المسؤول والتاريخ ضمن الموعد؛ يتطلب الإنجاز دليلاً.",
  "Action updated": "تم تحديث الإجراء",
  "Activity history": "سجل النشاط",
  "Local demonstration log · Not a tamper-evident production audit": "سجل تجريبي محلي",
  "Event": "الحدث",
  "Actor": "المنفذ",
  "Timestamp": "الوقت",
  "KPI / accountable owner": "المؤشر / المسؤول",
  "Objective / recovery": "الهدف / التعافي",
  "Actual / target": "الفعلي / المستهدف",
  "Source application": "التطبيق المصدري",
  "Trend": "الاتجاه",
  "linked plans": "خطط مرتبطة",
  "Draft": "مسودة",
  "No matching KPIs": "لا توجد مؤشرات مطابقة",
  "PRIORITY BREACH": "اختراق ذو أولوية",
  "EARLY SIGNAL": "إشارة مبكرة",
  "achievement": "إنجاز",
  "route to": "التوجيه إلى",
  "Explore the impact": "استكشف الأثر",
  "DATA GAP": "فجوة بيانات",
  "have no recorded value for": "بدون قيمة مسجلة لـ",
  "so they are excluded from achievement and counted under attention required.": "لذا استُبعدت من الإنجاز.",
  "Review data flows": "مراجعة تدفقات البيانات",
  "POSITIVE MOMENTUM": "زخم إيجابي",
  "Explore the practices behind it.": "استكشف الممارسات وراءه.",
  "Ask ITQAN for more": "اسأل إتقان للمزيد",
  "NO SIGNALS": "لا إشارات",
  "Nothing to flag in this scope": "لا شيء يستدعي التنبيه",
  "No published KPIs match the selected period and department.": "لا توجد مؤشرات منشورة ضمن الفترة والإدارة المحددة.",
  "Open the registry": "افتح السجل",
  "A little intelligence. A lot of clarity.": "ذكاء أكثر. وضوح أكبر.",
  "Advisory · Computed from local synthetic data · Human decisions": "إرشادي · محسوب من بيانات محلية · القرار للإنسان",
  "Back": "رجوع",
  "PERFORMANCE WORKSPACE": "مساحة الأداء",
  "Close dialog": "إغلاق",
  "DEFINITION VERSION": "إصدار التعريف",
  "Monthly": "شهرياً",
  "Draft · Awaiting approval": "مسودة · بانتظار الاعتماد",
  "Propose definition changes": "اقتراح تعديل التعريف",
  "Target setup": "إعداد المستهدفات",
  "Propose this period’s target and amber boundary. Department and Strategy approval are required before published targets change. External actuals stay read only.": "اقترح مستهدف هذه الفترة وحد التحذير. يلزم اعتماد الإدارة والفريق الاستراتيجي قبل تعديل المستهدفات المنشورة. القيم الفعلية للقراءة فقط.",
  "Amber boundary": "حد التحذير",
  "Submit targets for approval": "إرسال المستهدفات للموافقة",
  "A request is awaiting approval. Published values remain unchanged.": "هناك طلب ينتظر الموافقة. القيم المنشورة دون تغيير.",
  "Your role has read-only access to KPI targets.": "دورك يسمح بعرض المستهدفات فقط.",
  "Historical targets are read only. Select the current reporting period to set targets.": "المستهدفات التاريخية للقراءة فقط. اختر فترة التقرير الحالية لإعداد المستهدفات.",
  "Actual": "القيمة الفعلية",
  "unweighted draft": "مسودة",
  "Trend & target": "الاتجاه والمستهدف",
  "Trend versus": "الاتجاه مقابل",
  "n/a": "غير متاح",
  "prior": "السابق",
  "Source": "المصدر",
  "Confidence": "الثقة",
  "Direction": "الاتجاه المفضل",
  "Baseline": "خط الأساس",
  "Formula": "المعادلة",
  "capped at 100%": "بحد أقصى ١٠٠٪",
  "Actuals · Supplied externally": "القيم الفعلية · تُورد خارجياً",
  "Read only. Actuals arrive through the source application data flow. This prototype displays synthetic data; no live connection is configured.": "للقراءة فقط. تصل القيم الفعلية عبر تدفق بيانات التطبيق المصدري. يعرض هذا النموذج بيانات اصطناعية؛ لم يُعد اتصال حي.",
  "View data flows": "عرض تدفقات البيانات",
  "Publish the KPI definition and targets. Actuals will remain empty until supplied by its source application.": "انشر تعريف المؤشر ومستهدفاته. ستبقى القيم الفعلية فارغة حتى يوردها التطبيق المصدري.",
  "Submit KPI for approval": "إرسال المؤشر للموافقة",
  "Edit definition": "تعديل التعريف",
  "Objective action plans": "خطط عمل الهدف",
  "Add a task directly to this objective. No KPI is required.": "أضف مهمة لهذا الهدف مباشرة دون الحاجة إلى مؤشر.",
  "Publish a KPI before creating an action.": "انشر مؤشراً قبل إنشاء إجراء.",
  "Linked KPI": "المؤشر المرتبط",
  "Recovery plan title": "عنوان خطة التعافي",
  "Expected effect": "الأثر المتوقع",
  "Save changes": "حفظ التغييرات",
  "Create & submit for approval": "إنشاء وإرسال للموافقة",
  "Save draft": "حفظ المسودة",
  "Complete all fields and choose a valid KPI and due date.": "أكمل الحقول واختر مؤشراً وتاريخ استحقاق صالحين.",
  "Recovery plan submitted for Department and Strategy approval.": "تم إرسال خطة التعافي لموافقة الإدارة والاستراتيجية.",
  "Recovery plan saved": "تم حفظ خطة التعافي",
  "Linked objective": "الهدف المرتبط",
  "Type": "النوع",
  "Unit": "الوحدة",
  "Set the KPI definition, source application and targets here. Monthly actuals and baseline values come from the source application data flow. New definitions stay in Draft until Department and Strategy approval; no actuals are entered here.": "حدد تعريف المؤشر وتطبيقه المصدري ومستهدفاته هنا. تأتي القيم الفعلية وخط الأساس من تدفق البيانات الخارجي.",
  "Save draft for approval": "حفظ المسودة",
  "This KPI is not available for amendment.": "هذا المؤشر غير متاح للتعديل.",
  "Propose KPI changes": "اقتراح تعديلات المؤشر",
  "Changes require Department and Strategy approval. Existing actuals, source, unit and measurement direction remain attached to this KPI.": "تتطلب التعديلات موافقة الإدارة والفريق الاستراتيجي. تبقى القيم الفعلية والمصدر والوحدة واتجاه القياس مرتبطة بالمؤشر.",
  "KPI name": "اسم مؤشر الأداء",
  "Definition": "التعريف",
  "Reason for change": "سبب التغيير",
  "Submit changes for approval": "إرسال التعديلات للموافقة",
  "Department achievement": "إنجاز الإدارات",
  "Equal-weight KPI achievement within each department. Departments with no observation are shown as no data.": "إنجاز متساوي الأوزان داخل كل إدارة.",
  "on track": "على المسار",
  "equal goal weights": "أوزان أهداف متساوية",
  "RESULTS": "النتائج",
  "Review cadence preference saved locally": "تم حفظ التفضيل",
  "Notification centre": "مركز التنبيهات",
  "Demonstration notifications computed from your local workspace for": "تنبيهات محسوبة محلياً لـ",
  "Open approval": "فتح الموافقة",
  "Open monitoring": "فتح المتابعة",
  "No observation recorded for this period.": "لا توجد قراءة لهذه الفترة.",
  "against": "مقابل",
  "Assigned to": "مسند إلى",
  "Submitted by": "مقدم من",
  "Approval publishes it to the scorecards.": "الاعتماد ينشره في بطاقات الأداء.",
  "Review definition": "مراجعة التعريف",
  "No notifications match your workspace scope and configured categories.": "كل المؤشرات على المسار.",
  "INTELLIGENCE IN PERFORMANCE": "ذكاء في إدارة الأداء",
  "UNITED ARAB EMIRATES": "الإمارات العربية المتحدة",
  "CONFIDENTIAL CLIENT": "الجهة المعنية",
  "CLIENT PERFORMANCE": "أداء الجهة",
  "STRATEGY 2026–2031": "استراتيجية ٢٠٢٦–٢٠٣١",
  "Public Safety": "السلامة العامة",
  "Digital Services": "الخدمات الرقمية",
  "Traffic & Licensing": "المرور والترخيص",
  "Institutional Development": "التطوير المؤسسي",
  "Strategy reviewer 2": "مراجع الاستراتيجية الثاني",
  "Strategy reviewer": "مراجع الاستراتيجية",
  "Workspace administrator": "مسؤول مساحة العمل",
  "Enhance community safety": "تعزيز سلامة المجتمع",
  "Deliver seamless digital services": "تقديم خدمات رقمية سلسة",
  "Reduce road incident impact": "الحد من آثار الحوادث المرورية",
  "Strengthen organisational capability": "تعزيز القدرات المؤسسية",
  "A safer, more secure society": "مجتمع أكثر أمناً وأماناً",
  "World-class public services": "خدمات عامة رائدة عالمياً",
  "Safer roads, protected lives": "طرق أكثر أماناً وحماية للأرواح",
  "Future-ready institutional excellence": "تميز مؤسسي مستعد للمستقبل",
  "Brig. Saeed Al Mansoori": "العميد سعيد المنصوري",
  "Maj. Ahmed Al Zaabi": "الرائد أحمد الزعابي",
  "Capt. Fatima Al Mazrouei": "النقيب فاطمة المزروعي",
  "Col. Maryam Al Nuaimi": "العقيد مريم النعيمي",
  "Maj. Omar Al Ketbi": "الرائد عمر الكتبي",
  "Col. Khalid Al Shamsi": "العقيد خالد الشامسي",
  "Capt. Hamad Al Ameri": "النقيب حمد العامري",
  "Dr. Aisha Al Marzooqi": "الدكتورة عائشة المرزوقي",
  "Lt. Noor Al Hammadi": "الملازم نور الحمادي",
  "Emergency Operations System": "نظام عمليات الطوارئ",
  "Community Safety Survey": "استبيان السلامة المجتمعية",
  "Client Service Analytics": "تحليلات خدمة المتعاملين",
  "Service Management Platform": "منصة إدارة الخدمات",
  "Traffic Intelligence System": "نظام المعلومات المرورية",
  "Learning & Development System": "نظام التعلم والتطوير",
  "Data Governance Catalogue": "دليل حوكمة البيانات",
  "Accelerate service backlog clearance": "تسريع إنجاز الخدمات المتراكمة",
  "Expand road safety awareness campaign": "توسيع حملة التوعية بالسلامة المرورية",
  "Complete specialist readiness programme": "استكمال برنامج الجاهزية التخصصية",
  "Reduce completion time to 2 days": "تقليص مدة إنجاز الخدمة إلى يومين",
  "Reduce fatalities to 3 or fewer per 100k": "خفض الوفيات إلى ٣ أو أقل لكل ١٠٠ ألف نسمة",
  "Achieve 90% workforce readiness": "تحقيق جاهزية القوى العاملة بنسبة ٩٠٪",
  "STRATEGY & OBJECTIVES": "الاستراتيجية والأهداف التشغيلية",
  "Give every KPI a clear purpose.": "اربط كل مؤشر أداء بهدف واضح.",
  "Strategic goal → Objectives → KPIs. Add simple actions to an objective or KPI; start recovery when a KPI misses its target.": "هدف استراتيجي ← أهداف تشغيلية ← مؤشرات أداء. أضف خطة عمل لهدف أو مؤشر، وابدأ خطة تعافٍ عند عدم تحقيق المستهدف.",
  "OBJECTIVE": "الهدف التشغيلي",
  "Create strategic goal": "إنشاء هدف استراتيجي",
  "Create objective": "إنشاء هدف تشغيلي",
  "Edit goal": "تعديل الهدف الاستراتيجي",
  "Edit objective": "تعديل الهدف التشغيلي",
  "Equal objective weights": "أوزان متساوية للأهداف التشغيلية",
  "All statuses": "جميع الحالات",
  "On track": "على المسار الصحيح",
  "At risk": "معرض للخطر",
  "Off track": "خارج المسار",
  "No data": "لا توجد بيانات",
  "Source owner": "مسؤول المصدر",
  "Expected refresh": "دورية التحديث المتوقعة",
  "Weekly": "أسبوعياً",
  "Fortnightly": "كل أسبوعين",
  "Daily": "يومياً",
  "Show KPIs": "عرض مؤشرات الأداء",
  "Needs attention": "يتطلب المتابعة",
  "All KPIs": "جميع مؤشرات الأداء",
  "Minor": "طفيف",
  "Material": "جوهري",
  "Critical": "حرج",
  "KPI owner": "مسؤول المؤشر",
  "Objective owner": "مسؤول الهدف التشغيلي",
  "Executive sponsor": "الراعي التنفيذي",
  "Latest updates & approval status": "آخر المستجدات وحالة الموافقات",
  "No delivery updates or approval requests yet.": "لا توجد مستجدات تنفيذ أو طلبات موافقة حتى الآن.",
  "Escalation is an advisory routing recommendation. No external notification has been sent.": "التصعيد توصية استرشادية بجهة المتابعة. لم يُرسل أي إشعار خارجي.",
  "Action: deliver a task. Recovery: restore an Amber or Red KPI. Both use the same forms and approvals from every screen.": "خطة العمل لتنفيذ مهمة، وخطة التعافي لتحسين مؤشر معرض للخطر أو خارج المسار. تُستخدم النماذج ومسارات الموافقة نفسها في جميع الشاشات.",
  "Action plans": "خطط العمل",
  "Recovery plans": "خطط التعافي",
  "Review KPI gaps": "مراجعة فجوات مؤشرات الأداء",
  "Recovery plan": "خطة تعافٍ",
  "Open": "مفتوحة",
  "In progress": "قيد التنفيذ",
  "Executive performance pack": "تقرير الأداء التنفيذي",
  "Goal achievement, KPI status, owners and recovery priorities for the selected reporting period.": "إنجاز الأهداف وحالات المؤشرات والمسؤولون وأولويات التعافي لفترة التقرير المحددة.",
  "Preview / save PDF": "معاينة / حفظ بصيغة PDF",
  "KPI registry export": "تصدير سجل مؤشرات الأداء",
  "Published KPIs in scope with actuals, targets, achievement, status, confidence and source attribution.": "المؤشرات المنشورة ضمن النطاق مع القيم الفعلية والمستهدفات والإنجاز والحالة ودرجة الثقة والمصدر.",
  "Download CSV": "تنزيل بصيغة CSV",
  "Department comparison": "مقارنة الإدارات",
  "Compare equal-weight KPI achievement across departments for the selected period.": "مقارنة إنجاز المؤشرات بأوزان متساوية بين الإدارات للفترة المحددة.",
  "View comparison": "عرض المقارنة",
  "Department review": "مراجعة الإدارة",
  "Strategy review": "مراجعة فريق الاستراتيجية",
  "Approved": "معتمد",
  "Rejected": "مرفوض",
  "My review": "طلبات بانتظار مراجعتي",
  "My submissions": "طلباتي المقدمة",
  "All": "الكل",
  "August actuals validated": "التحقق من القيم الفعلية لشهر أغسطس",
  "Data Steward": "مسؤول جودة البيانات",
  "Service completion breach recommends executive sponsor review (simulation)": "فجوة إنجاز الخدمة تستدعي مراجعة الراعي التنفيذي (محاكاة)",
  "Scoring engine (simulated)": "محرك احتساب الأداء (محاكاة)",
  "RECOVERY TRIGGER": "سبب بدء التعافي",
  "CURRENT KPI GAP": "فجوة المؤشر الحالية",
  "LATEST KPI RESULT": "أحدث نتيجة للمؤشر",
  "Read-only source actual": "قيمة فعلية من المصدر للقراءة فقط",
  "Create & submit": "إنشاء وإرسال",
  "This is a draft or returned plan. Complete the initial recovery details and submit it for Department and Strategy approval.": "هذه خطة مسودة أو معادة للتعديل. أكمل تفاصيل التعافي وأرسلها لموافقة الإدارة وفريق الاستراتيجية.",
  "Complete the plan and milestones, then submit. Execution begins after Department and Strategy approval.": "أكمل الخطة ومراحل التنفيذ ثم أرسلها. يبدأ التنفيذ بعد موافقة الإدارة وفريق الاستراتيجية.",
  "Submit plan for approval": "إرسال الخطة للموافقة",
  "Choose objective": "اختيار الهدف التشغيلي",
  "Define KPI & targets": "تعريف المؤشر ومستهدفاته",
  "Submit for approval": "إرسال للموافقة",
  "Measurement formula": "معادلة القياس",
  "Source metric / field key (optional)": "مفتاح المؤشر أو الحقل في المصدر (اختياري)",
  "Leading": "استباقي",
  "Lagging": "لاحق",
  "Higher is better": "القيمة الأعلى أفضل",
  "Lower is better": "القيمة الأقل أفضل",
  "A simple task supporting an objective or KPI. Define the outcome, owner and deadline. KPI underperformance is not required.": "مهمة تدعم هدفاً تشغيلياً أو مؤشر أداء. حدد النتيجة والمسؤول والموعد النهائي. لا يُشترط تراجع أداء المؤشر.",
  "Link this action to": "ربط خطة العمل بـ",
  "Responsible department": "الإدارة المسؤولة",
  "What needs to be done?": "ما المهمة المطلوب تنفيذها؟",
  "High": "مرتفعة",
  "Medium": "متوسطة",
  "Low": "منخفضة",
  "Expected outcome / completion criteria": "النتيجة المتوقعة / معايير الإنجاز",
  "Delivery notes (optional)": "ملاحظات التنفيذ (اختياري)",
  "Department and Strategy approve the plan and its completion. Root-cause analysis, recovery reviews and Green KPI periods are not required.": "تعتمد الإدارة وفريق الاستراتيجية الخطة وإغلاقها. لا يُشترط تحليل السبب الجذري أو مراجعات التعافي أو فترات أداء على المسار الصحيح.",
  "Save action draft": "حفظ مسودة خطة العمل",
  "Create the strategic goal first, then add one or more objectives beneath it. Each objective can have KPIs and action plans.": "أنشئ الهدف الاستراتيجي أولاً، ثم أضف إليه هدفاً تشغيلياً أو أكثر. يمكن ربط مؤشرات أداء وخطط عمل بكل هدف تشغيلي.",
  "Arabic goal name (optional)": "اسم الهدف بالعربية (اختياري)",
  "Description (optional)": "الوصف (اختياري)",
  "Create goal & add objective": "إنشاء الهدف الاستراتيجي وإضافة هدف تشغيلي",
  "KPIs register against this objective. Existing KPI and action links remain intact when the objective is edited.": "تُسجل مؤشرات الأداء ضمن هذا الهدف التشغيلي. تبقى روابط المؤشرات وخطط العمل محفوظة عند تعديله.",
  "Save objective": "حفظ الهدف التشغيلي",
  "Changes are saved locally and recorded in Audit trail": "تُحفظ التغييرات محلياً وتُوثق في سجل التدقيق",
  "Departments": "الإدارات",
  "Objectives": "الأهداف التشغيلية",
  "Active accounts": "الحسابات النشطة",
  "Pending approvals": "الموافقات المعلقة",
  "Organization labels update throughout the app. Language and landing-page defaults apply at the next sign-in. Administrators always land here.": "تُحدّث بيانات الجهة في جميع الشاشات. تُطبق اللغة والصفحة الافتراضيتان عند تسجيل الدخول التالي. يبدأ مسؤولو النظام دائماً من هذه الصفحة.",
  "Organization name": "اسم الجهة",
  "Strategy / framework label": "اسم الاستراتيجية / الإطار",
  "Default language": "اللغة الافتراضية",
  "Default workspace after sign-in": "الصفحة الافتراضية بعد تسجيل الدخول",
  "Executive overview": "نظرة تنفيذية",
  "Strategy & objectives": "الاستراتيجية والأهداف التشغيلية",
  "KPI registry": "سجل مؤشرات الأداء",
  "Workspace data consistency": "اتساق بيانات مساحة العمل",
  "Object links and reporting data reconcile": "روابط السجلات وبيانات التقارير متسقة",
  "Parent links, departments, period data, plan states and approval references checked. Draft plans may still need completion before submission.": "تم فحص روابط الأهداف والإدارات وبيانات الفترات وحالات الخطط ومراجع الموافقات. قد تحتاج المسودات إلى استكمال قبل إرسالها.",
  "Manage values offered in new registrations and plans. Existing records and pending approvals retain their saved values. Defaults cannot be disabled while in use as a default.": "إدارة القيم المتاحة للتسجيلات والخطط الجديدة. تحتفظ السجلات والطلبات المعلقة بقيمها المحفوظة. لا يمكن تعطيل قيمة مستخدمة كإعداد افتراضي.",
  "KPI types": "أنواع مؤشرات الأداء",
  "One value per line": "قيمة واحدة في كل سطر",
  "Save list": "حفظ القائمة",
  "KPI units": "وحدات قياس المؤشرات",
  "Plan priorities": "أولويات الخطط",
  "Recovery review frequency": "دورية مراجعة التعافي",
  "Source refresh frequency": "دورية تحديث المصدر",
  "Related configuration": "الإعدادات ذات الصلة",
  "Strategic goals & objectives": "الأهداف الاستراتيجية والتشغيلية",
  "Source systems": "الأنظمة المصدرية",
  "Users & roles": "المستخدمون والأدوار",
  "Approval stages": "مراحل الموافقة",
  "Plan defaults": "الإعدادات الافتراضية للخطط",
  "Departments define the access boundary for contributors and department approvers. Add a department, then assign its accounts under Users & roles.": "تحدد الإدارات نطاق وصول المساهمين والمعتمدين. أضف إدارة ثم عيّن حساباتها ضمن المستخدمين والأدوار.",
  "Approver assigned": "تم تعيين معتمد",
  "Approver needed": "يلزم تعيين معتمد",
  "Add department": "إضافة إدارة",
  "Department name": "اسم الإدارة",
  "Accounts & role assignments": "الحسابات وتعيين الأدوار",
  "Add account": "إضافة حساب",
  "Account": "الحساب",
  "Role": "الدور",
  "Data access": "نطاق الوصول",
  "Manage": "إدارة",
  "Active": "نشط",
  "Inactive": "غير نشط",
  "Edit": "تعديل",
  "Role permissions": "صلاحيات الأدوار",
  "Visibility": "نطاق الاطلاع",
  "Business actions": "إجراءات العمل",
  "Assigned department": "الإدارة المعينة",
  "Register and submit KPIs; create and submit plans; record approved-plan progress": "تسجيل المؤشرات وإرسالها، وإنشاء الخطط وإرسالها، وتوثيق تقدم الخطط المعتمدة",
  "Department review; cannot approve own requests": "مراجعة طلبات الإدارة دون اعتماد الطلبات الذاتية",
  "Cross-department analysis and final business approval": "التحليل عبر الإدارات والموافقة النهائية على إجراءات العمل",
  "Manage accounts and access; no business approval bypass": "إدارة الحسابات والوصول دون تجاوز موافقات العمل",
  "Workflow policy": "سياسة سير العمل",
  "Review window per approval stage (days)": "مدة المراجعة لكل مرحلة موافقة (أيام)",
  "Approval coverage": "تغطية أدوار الموافقة",
  "Apply approved change": "تطبيق التغيير المعتمد",
  "Aggregate Green boundary (%)": "حد الأداء المجمع على المسار الصحيح (٪)",
  "Aggregate Amber boundary (%)": "حد التحذير للأداء المجمع (٪)",
  "Consecutive Green periods for recovery closure": "فترات متتالية على المسار الصحيح لإغلاق التعافي",
  "Default recovery review frequency": "دورية مراجعة التعافي الافتراضية",
  "Default plan priority": "الأولوية الافتراضية للخطة",
  "Default plan deadline from creation (days)": "المهلة الافتراضية للخطة من تاريخ الإنشاء (أيام)",
  "Approval decisions and returned submissions": "قرارات الموافقة والطلبات المعادة",
  "Monitoring reviews due": "مراجعات المتابعة المستحقة",
  "KPI breaches and unpublished definitions": "فجوات المؤشرات والتعريفات غير المنشورة",
  "Add source system": "إضافة نظام مصدري",
  "Owner / team": "المسؤول / الفريق",
  "Not connected": "غير متصل",
  "Source owner / team": "مسؤول المصدر / الفريق",
  "Save source configuration": "حفظ إعدادات المصدر",
  "Review deadline": "الموعد النهائي للمراجعة",
  "Reject": "رفض",
  "Review needed": "المراجعة المطلوبة",
  "Reference": "المرجع",
  "Object": "نوع السجل",
  "No approval requests in this scope.": "لا توجد طلبات موافقة ضمن هذا النطاق.",
  "Approvals": "الموافقات",
  "Open Approvals": "فتح الموافقات",
  "Workspace search results": "نتائج البحث في مساحة العمل",
  "No matching records": "لا توجد سجلات مطابقة",
  "How ITQAN IQ connects": "كيف ترتبط عناصر ITQAN IQ",
  "Root cause": "السبب الجذري",
  "Source metric / field key": "مفتاح المؤشر أو الحقل في المصدر",
  "Submit proposed changes": "إرسال التعديلات المقترحة",
  "Save account": "حفظ الحساب",
  "Email": "البريد الإلكتروني",
  "Full name": "الاسم الكامل",
  "Start delivery": "بدء التنفيذ",
  "Complete action": "إكمال خطة العمل",
  "Edit action plan": "تعديل خطة العمل",
  "Expected outcome": "النتيجة المتوقعة",
  "Progress updates": "مستجدات التنفيذ",
  "No updates yet.": "لا توجد مستجدات حتى الآن.",
  "Submit action plan for approval": "إرسال خطة العمل للموافقة",
  "Awaiting start": "بانتظار بدء التنفيذ",
  "Delivery overdue": "تأخر التنفيذ",
  "Delivery in progress": "التنفيذ جارٍ",
  "Applied": "تم التطبيق",
  "Validated": "تم التحقق",
  "Provisional": "أولي",
  "Estimated": "تقديري",
  "Not recorded": "غير مسجل",
  "Unknown": "غير معروف",
  "Not configured": "غير مُعدّ",
  "Apr": "أبريل",
  "May": "مايو",
  "Jun": "يونيو",
  "Jul": "يوليو",
  "Aug": "أغسطس",
  "Sep": "سبتمبر",
  "April": "أبريل",
  "June": "يونيو",
  "July": "يوليو",
  "August": "أغسطس",
  "September": "سبتمبر",
  "per 100k": "لكل ١٠٠ ألف نسمة",
  "min": "دقيقة",
  "days": "أيام",
  "count": "عدد",
  "rate": "معدل",
  "pts": "نقطة",
  "objectives": "أهداف تشغيلية",
  "objective": "هدف تشغيلي",
  "strategic goals": "أهداف استراتيجية",
  "plans": "خطط",
  "approval requests": "طلبات موافقة",
  "active accounts": "حسابات نشطة",
  "department approvers": "معتمدون للإدارة",
  "issues": "حالات تتطلب المتابعة",
  "entries": "سجلات",
  "data team": "فريق البيانات",
  "contributor": "مساهم",
  "approver": "معتمد",
  "Execution states (Open, In progress, Closed), approval stages, plan types, measurement direction, monthly reporting and security roles are governed system values. Their rules are shown in the corresponding configuration sections.": "حالات التنفيذ (مفتوحة، قيد التنفيذ، مغلقة) ومراحل الموافقة وأنواع الخطط واتجاه القياس والتقارير الشهرية والأدوار الأمنية قيم يضبطها النظام. توضح أقسام الإعدادات ذات الصلة قواعد استخدامها.",
  "Department review → Strategy review. Rejected requests return to the author for revision and resubmission. No change is applied while awaiting approval.": "مراجعة الإدارة ← مراجعة فريق الاستراتيجية. تُعاد الطلبات المرفوضة إلى مقدمها للتعديل وإعادة الإرسال. لا يُطبق أي تغيير أثناء انتظار الموافقة.",
  "Actuals remain read-only and belong to external source applications. Role assignments and approval history are stored in this browser for demonstration.": "تبقى القيم الفعلية للقراءة فقط وتأتي من التطبيقات المصدرية الخارجية. تُحفظ تعيينات الأدوار وسجلات الموافقة في هذا المتصفح لأغراض العرض التجريبي.",
  "These boundaries control goal/overall status and parent-goal escalation across reports. Changing them reclassifies aggregate labels, including historical views. KPI-specific targets and external actuals do not change. KPI weights remain equal within each objective; goal weights remain equal overall.": "تحدد هذه الحدود حالة الأهداف والأداء العام وتوصيات التصعيد في التقارير. يؤدي تعديلها إلى إعادة تصنيف الأداء المجمع، بما في ذلك الفترات السابقة، دون تغيير مستهدفات المؤشرات أو القيم الفعلية. تتساوى أوزان المؤشرات داخل كل هدف تشغيلي، والأهداف التشغيلية داخل كل هدف استراتيجي، والأهداف الاستراتيجية في الإجمالي.",
  "Two stages are required for KPI publication/amendments, target changes and plan approval/amendments/closure/reopening.": "تلزم مرحلتا موافقة لنشر المؤشرات وتعديلها، وتغيير المستهدفات، واعتماد الخطط وتعديلها وإغلاقها وإعادة فتحها.",
  "Requesters cannot approve their own requests. Decision notes are required.": "لا يجوز لمقدمي الطلبات اعتماد طلباتهم بأنفسهم. يلزم توثيق ملاحظة مع كل قرار.",
  "Department approvers are restricted to their department. Administrators cannot bypass business approval.": "يقتصر نطاق معتمدي الإدارة على إدارتهم. لا يستطيع مسؤولو النظام تجاوز موافقات العمل.",
  "Applied to new submissions and newly started approval stages. Existing stage deadlines are retained.": "يُطبق على الطلبات الجديدة ومراحل الموافقة التي تبدأ لاحقاً. تبقى المواعيد الحالية محفوظة.",
  "active Strategy reviewers. A second eligible reviewer is needed when an approver submits their own request.": "مراجعون نشطون من فريق الاستراتيجية. يلزم مراجع آخر مخول عندما يقدم أحد المعتمدين طلباً خاصاً به.",
  "The recovery rule applies to current recovery verification and may require a new effectiveness review. Closure snapshots remain unchanged. Cadence, priority and deadline are defaults for new plans only. Recovery requires milestone evidence and effectiveness review. Action plans require delivery evidence. Both follow approval.": "تُطبق قاعدة التعافي على التحقق الحالي وقد تستلزم مراجعة فعالية جديدة. تبقى سجلات الإغلاق السابقة محفوظة. تُستخدم الدورية والأولوية والمهلة كإعدادات افتراضية للخطط الجديدة فقط. يتطلب التعافي أدلة المراحل ومراجعة الفعالية، وتتطلب خطط العمل أدلة التنفيذ، ويخضع كلاهما للموافقة.",
  "Controls the in-app notification centre and its unread indicator for every role, within that role’s access scope. Tasks remain available in their workspaces. Email and external delivery are not connected.": "تتحكم هذه الإعدادات في مركز التنبيهات ومؤشر التنبيهات غير المقروءة لكل دور ضمن صلاحياته. تبقى المهام متاحة في صفحاتها. البريد الإلكتروني والإرسال الخارجي غير متصلين.",
  "Create source systems and configure ownership and expected refresh cadence. These are catalogue settings; they do not establish a live connection or allow manual actual entry.": "أضف الأنظمة المصدرية وحدد المسؤولية ودورية التحديث المتوقعة. هذه إعدادات للدليل ولا تنشئ اتصالاً مباشراً أو تسمح بإدخال القيم الفعلية يدوياً.",
  "lower-is-better": "القيمة الأقل أفضل",
  "higher-is-better": "القيمة الأعلى أفضل",
  "target / actual": "المستهدف / القيمة الفعلية",
  "actual / target": "القيمة الفعلية / المستهدف",
  "Monthly measure of service completion time.": "قياس شهري لمدة إنجاز الخدمة.",
  "Monthly measure of emergency response time.": "قياس شهري لزمن الاستجابة للطوارئ.",
  "Monthly measure of community sense of safety.": "قياس شهري لشعور المجتمع بالأمان.",
  "Monthly measure of digital service adoption.": "قياس شهري لتبني الخدمات الرقمية.",
  "Monthly measure of road fatalities per 100k population.": "قياس شهري لوفيات الطرق لكل ١٠٠ ألف نسمة.",
  "Monthly measure of traffic incident clearance.": "قياس شهري لمدة إزالة الحوادث المرورية.",
  "Monthly measure of workforce readiness index.": "قياس شهري لجاهزية القوى العاملة.",
  "Monthly measure of data quality compliance.": "قياس شهري للامتثال لجودة البيانات.",
  "Reported value from the stated source for the reporting month.": "القيمة المسجلة من المصدر المحدد لشهر التقرير.",
  "Department review precedes Strategy review. Open a request to see submitted changes, decisions and the next approval stage.": "تسبق مراجعة الإدارة مراجعة فريق الاستراتيجية. افتح الطلب للاطلاع على التغييرات والقرارات ومرحلة الموافقة التالية.",
  "matches in your authorized department scope. Select a result to open it.": "نتائج ضمن نطاق الإدارات المصرح لك بالوصول إليها. اختر نتيجة لفتحها.",
  "Showing the first 40 matches. Refine your search to narrow the results.": "تُعرض أول ٤٠ نتيجة. عدّل البحث لتحديد النتائج بدقة أكبر.",
  "Source → KPI mapping and read-only actuals": "المصدر ← ربط المؤشرات والقيم الفعلية للقراءة فقط",
  "Application help": "دليل الاستخدام",
  "Search by a goal, objective, KPI, plan, source, approval ID or feature name. Results respect your access.": "ابحث بالهدف الاستراتيجي أو التشغيلي أو المؤشر أو الخطة أو المصدر أو رقم طلب الموافقة أو اسم الميزة. تُعرض النتائج وفق صلاحياتك.",
  "Create strategic goals, then their objectives.": "أنشئ أهدافاً استراتيجية، ثم أضف أهدافها التشغيلية.",
  "Register measures and propose definition or target changes for approval.": "سجل المؤشرات واقترح تعديلات التعريفات أو المستهدفات للموافقة.",
  "Source applications supply KPI actuals; this app owns targets.": "توفر التطبيقات المصدرية القيم الفعلية، وتُدار المستهدفات في هذا التطبيق.",
  "Review KPI performance gaps, impact, escalation and related updates.": "راجع فجوات المؤشرات وأثرها والتصعيد والمستجدات المرتبطة بها.",
  "Review gaps and impact. Create actions for KPIs, or recovery for Amber/Red KPIs.": "راجع الفجوات وأثرها، وأنشئ خطط عمل للمؤشرات أو خطط تعافٍ للمؤشرات المعرضة للخطر أو الخارجة عن المسار.",
  "Use the same creation forms and monitor Open, In progress and Closed plans.": "استخدم نماذج الإنشاء الموحدة وتابع الخطط المفتوحة وقيد التنفيذ والمغلقة.",
  "Department review precedes Strategy review for KPI and plan changes.": "تسبق مراجعة الإدارة مراجعة فريق الاستراتيجية لتعديلات المؤشرات والخطط.",
  "Administrators maintain lists, sources, roles and policies.": "يدير مسؤولو النظام القوائم والمصادر والأدوار والسياسات.",
  "Review assigned requests and track the approval cycle.": "راجع الطلبات المسندة إليك وتابع دورة الموافقة.",
  "Submit this task for Department and Strategy approval before starting.": "أرسل هذه المهمة لموافقة الإدارة وفريق الاستراتيجية قبل بدء التنفيذ.",
  "Complete the task and provide delivery evidence. KPI recovery and a separate effectiveness review are not required.": "أكمل المهمة وقدم أدلة التنفيذ. لا يُشترط تعافي المؤشر أو إجراء مراجعة فعالية منفصلة.",
  "Optional delivery checklist": "قائمة تحقق اختيارية للتنفيذ",
  "Delivery notes": "ملاحظات التنفيذ",
  "No published KPI available. Link to an objective instead.": "لا يوجد مؤشر منشور متاح. يمكنك ربط الخطة بهدف تشغيلي.",
  "Not set for this earlier request": "غير محدد لهذا الطلب السابق",
  "Review changes and record your decision": "راجع التغييرات وسجل قرارك",
  "An administrator must assign another department approver. You cannot approve your own request.": "يجب أن يعيّن مسؤول النظام معتمداً آخر للإدارة. لا يمكنك اعتماد طلبك بنفسك.",
  "Add a decision note.": "أضف ملاحظة توضح القرار.",
  "This request is not assigned to your approval role, or you submitted it yourself.": "هذا الطلب غير مسند إلى دورك في الموافقة، أو أنك مقدم الطلب.",
  "The record department has changed. Reject this request and submit a fresh version.": "تغيرت إدارة السجل. ارفض الطلب وأرسل نسخة جديدة إلى مسار الموافقة الصحيح.",
  "This record has changed. Reject this request and submit a fresh version.": "تغير السجل. ارفض الطلب وأرسل نسخة محدثة.",
  "A request is already awaiting approval for this record.": "يوجد طلب لهذا السجل بانتظار الموافقة بالفعل.",
  "Your role cannot change this department’s records.": "لا يسمح دورك بتعديل سجلات هذه الإدارة.",
  "Your role cannot change this department’s plans.": "لا يسمح دورك بتعديل خطط هذه الإدارة.",
  "Administrator access required.": "يلزم الوصول بصلاحية مسؤول النظام.",
  "Select a valid department.": "اختر إدارة صالحة.",
  "Plan approval is required before execution.": "يلزم اعتماد الخطة قبل بدء التنفيذ.",
  "Complete every required definition field.": "أكمل جميع حقول التعريف المطلوبة.",
  "Select a valid parent objective.": "اختر هدفاً تشغيلياً صالحاً.",
  "Select a valid direction.": "اختر اتجاهاً صالحاً للقياس.",
  "Select a valid unit.": "اختر وحدة قياس صالحة.",
  "Select a valid KPI type.": "اختر نوعاً صالحاً لمؤشر الأداء.",
  "Amber boundary must be worse than the target.": "يجب أن يكون حد التحذير أسوأ من المستهدف وفق اتجاه القياس.",
  "Amber boundary must be worse than target for the selected direction.": "يجب أن يكون حد التحذير أسوأ من المستهدف وفق اتجاه القياس المحدد.",
  "Use a positive target and a valid amber boundary for this unit.": "أدخل مستهدفاً موجباً وحد تحذير صالحاً لهذه الوحدة.",
  "Target must be positive. Values must respect the unit and its range.": "يجب أن يكون المستهدف موجباً وأن تتوافق القيم مع وحدة القياس ونطاقها.",
  "Targets for historical periods are read-only.": "مستهدفات الفترات السابقة للقراءة فقط.",
  "Complete the task, owner, valid deadline and expected outcome.": "أكمل المهمة والمسؤول والموعد الصحيح والنتيجة المتوقعة.",
  "Complete the plan and assign milestone owners and dates.": "أكمل الخطة وحدد مسؤولي المراحل ومواعيدها.",
  "Add completion evidence against the expected outcome.": "أضف أدلة الإنجاز مقارنة بالنتيجة المتوقعة.",
  "Select a published KPI or link directly to an objective.": "اختر مؤشراً منشوراً أو اربط الخطة مباشرة بهدف تشغيلي.",
  "Explain the proposed change.": "وضح سبب التغيير المقترح.",
  "This department already exists.": "هذه الإدارة موجودة بالفعل.",
  "This source already exists.": "هذا المصدر موجود بالفعل.",
  "Enter a department name and accountable owner.": "أدخل اسم الإدارة والمسؤول عنها.",
  "Enter the source owner and refresh cadence.": "أدخل مسؤول المصدر ودورية التحديث.",
  "Enter a source name, owner and supported refresh frequency.": "أدخل اسم المصدر والمسؤول ودورية تحديث مدعومة.",
  "Strategy Team or Administrator access required.": "يلزم الوصول بدور فريق الاستراتيجية أو مسؤول النظام.",
  "Enter the strategic goal and accountable owner.": "أدخل الهدف الاستراتيجي والمسؤول عنه.",
  "Choose a strategic goal, objective, owner and responsible department.": "حدد الهدف الاستراتيجي والهدف التشغيلي والمسؤول والإدارة المسؤولة.",
  "This strategic goal already exists.": "هذا الهدف الاستراتيجي موجود بالفعل.",
  "This objective already exists under this strategic goal.": "هذا الهدف التشغيلي موجود بالفعل ضمن الهدف الاستراتيجي المحدد.",
  "Unknown objective.": "الهدف التشغيلي غير معروف.",
  "Strategic goal unavailable.": "الهدف الاستراتيجي غير متاح.",
  "Objective unavailable.": "الهدف التشغيلي غير متاح.",
  "Plan unavailable.": "الخطة غير متاحة.",
  "Plan unavailable for your department.": "الخطة غير متاحة لإدارتك.",
  "Your role is read only.": "صلاحيات دورك تقتصر على القراءة.",
  "Record changed; return this request for resubmission": "تغير السجل؛ أعد الطلب لإرساله مجدداً",
  "Missing or duplicate ID": "معرف مفقود أو مكرر",
  "Strategic goal is missing": "الهدف الاستراتيجي المرتبط مفقود",
  "Strategic goal label is out of sync": "اسم الهدف الاستراتيجي غير متسق",
  "Responsible department is missing or unknown": "الإدارة المسؤولة مفقودة أو غير معروفة",
  "Department is unknown": "الإدارة غير معروفة",
  "Source ownership needs configuration": "يلزم تحديد مسؤول المصدر",
  "Current target differs from the latest target history": "المستهدف الحالي يختلف عن آخر مستهدف مسجل",
  "Recovery requires a linked KPI": "تتطلب خطة التعافي مؤشراً مرتبطاً",
  "Deadline is invalid": "الموعد النهائي غير صالح",
  "Unknown execution status": "حالة التنفيذ غير معروفة",
  "Execution started without an approved plan": "بدأ التنفيذ دون اعتماد الخطة",
  "Linked record is missing": "السجل المرتبط مفقود",
  "Requesting account is missing": "حساب مقدم الطلب مفقود",
  "Multiple pending requests for one record": "توجد عدة طلبات معلقة للسجل نفسه",
  "Department no longer matches the linked record": "لم تعد الإدارة متطابقة مع السجل المرتبط",
  "Role or department is invalid": "الدور أو الإدارة غير صالحين",
  "items to review": "عناصر تحتاج إلى مراجعة"
};
