/* Connected workspace features. Loaded before app.js; functions use its shared state. */
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
  const term=question.trim().toLowerCase(),matches=text=>String(text).toLowerCase().includes(term),results=[];
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
