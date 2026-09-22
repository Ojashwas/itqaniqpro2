const path = require('node:path');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
function workspace(saved){
  const dom=new JSDOM('<div id="app"></div><div id="overlay"></div><div id="toast"></div>',{url:'http://localhost/#actions',runScripts:'outside-only'});
  const w=dom.window;w.localStorage.setItem('itqan-auth','true');
  if(saved)w.localStorage.setItem('itqan-demo-v1',saved);
  w.eval(fs.readFileSync(path.join(__dirname,'../src/domain/performance.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../src/features/workspace.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8')+'\nwindow.state={saveStrategicGoal,saveChildObjective,strategicGoals,saveLookup,lookupValues,addSource,workspaceSearch,recoveryStart,simpleActionForm,objectiveDetail,recoveryEligible,planDepartment,planGoal,saveConfiguration,saveDepartment,saveObjective,goals,actionReady,reviewSnapshot,attention,get config(){return appConfig},actions,kpis,transitionAction,filteredActions,actionDetail,actionForm,recordMonitoring,effectiveReview,detail,go,submitRequest,decideRequest,approvals,users,visibleKpis,visibleActions,scoped,raw,filtered,updateAccount,approvalDetail,currentUser,canDecide,switchUser(id){currentUserId=id;department=currentUser()?.department||"All departments";close();render()}};');
  return {dom,w,d:w.document,s:w.state};
}
function selectDemoAccount(w,id){
  const d=w.document,u=w.state.users.find(u=>u.id===id);assert.ok(u);
  d.querySelector('[data-login-role="'+u.role+'"]').click();
  if(u.department){d.querySelector('#login-department').value=u.department;d.querySelector('#login-department').dispatchEvent(new w.Event('change'))}
  d.querySelector('#login-profile').value=id;d.querySelector('#login-profile').dispatchEvent(new w.Event('change'));
}
const completePlan=()=>({rootCause:'Capacity gap confirmed by queue report',correction:'Clear backlog and rebalance capacity',prevention:'Review queue weekly',successCriteria:'Meet KPI target for two periods',reviewer:'PMO reviewer',cadence:'Weekly',nextReview:'2099-12-20'});
test('strategy creates separate goals with multiple objectives, preserves references and restores the hierarchy',()=>{
  const {dom,w,d,s}=workspace();const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    s.go('strategy');d.querySelector('#create-strategic-goal').click();d.querySelector('#sg-name').value='Connected government';d.querySelector('#sg-owner').value='Strategy office';submit('#strategic-goal-form');
    assert.equal(d.querySelector('.drawer h2').textContent,'Create objective');const parent=s.strategicGoals.at(-1);assert.equal(d.querySelector('#obj-parent').value,parent.id);
    d.querySelector('#obj-name').value='Simplify services';d.querySelector('#obj-owner').value='Service office';d.querySelector('#obj-department').value='Digital Services';submit('#child-objective-form');const first=s.goals.length-1;
    s.go('strategy');d.querySelector(`[data-add-objective="${parent.id}"]`).click();d.querySelector('#obj-name').value='Connect channels';d.querySelector('#obj-owner').value='Digital office';d.querySelector('#obj-department').value='Digital Services';submit('#child-objective-form');
    assert.equal(s.goals.filter(g=>g.strategicGoalId===parent.id).length,2);assert.equal(s.goals[first].objective,'Simplify services');
    d.querySelector('.drawer [data-register-objective]').click();assert.equal(d.querySelector('#reg-goal').value,String(s.goals.length-1));
    s.saveStrategicGoal(parent.id,{name:'Connected public services',owner:'Strategy office'});assert.equal(s.goals[first].name,'Connected public services');
    s.switchUser('owner-1');s.go('strategy');assert.equal(d.querySelector('#create-strategic-goal'),null);assert.ok(d.querySelector(`[data-objective="${first}"]`));assert.throws(()=>s.saveChildObjective(null,{strategicGoalId:parent.id,objective:'Forbidden',owner:'Owner',department:'Digital Services'}),/Strategy Team/);
    s.switchUser('owner-0');s.go('strategy');assert.equal(d.querySelector(`[data-objective="${first}"]`),null);
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));assert.equal(restored.s.strategicGoals.at(-1).name,'Connected public services');assert.equal(restored.s.goals[first].strategicGoalId,parent.id);restored.dom.window.close();
  }finally{dom.window.close()}
});
test('Plans, Impact and global Create use identical recovery forms and eligibility',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');s.go('actions');d.querySelector('#new-recovery').click();assert.ok(d.querySelector('#recovery-kpi-search'));assert.equal(d.querySelector('[data-create-recovery="KPI-SRV-001"]'),null);assert.equal(d.querySelector('[data-create-recovery="KPI-TRF-001"]'),null);
    d.querySelector('[data-create-recovery="KPI-SRV-002"]').click();const signature=()=>[...d.querySelector('#action-form').querySelectorAll('input,select,textarea')].map(el=>[el.id,el.value,el.required]);const fromBoard=signature();assert.equal(d.querySelector('#action-kpi').options.length,1);
    s.go('impact');d.querySelector('[data-create-recovery="KPI-SRV-002"]').click();assert.deepEqual(signature(),fromBoard);
    s.go('actions');d.querySelector('#create-menu').click();d.querySelector('#create-recovery-choice').click();d.querySelector('[data-create-recovery="KPI-SRV-002"]').click();assert.deepEqual(signature(),fromBoard);
    d.querySelector('#recovery-cause').value='Queue capacity';d.querySelector('#recovery-steps').value='Add processing capacity';d.querySelector('#action-due').value='2099-12-31';d.querySelector('#action-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(d.querySelector('#submit-plan'),null);assert.equal(s.approvals[0].status,'Department review');approveLatest(s);assert.equal(s.actions.at(-1).approvalStatus,'Approved');
  }finally{dom.window.close()}
});
test('creating recovery submits one request, locks pending work and enables approved Manage plan updates',()=>{
  const {dom,w,d,s}=workspace();const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    s.switchUser('owner-1');s.actionForm('KPI-SRV-002');const count=s.actions.length,requests=s.approvals.length;
    assert.match(d.querySelector('#submit-recovery').textContent,/Create & submit/);submit('#action-form');assert.equal(s.actions.length,count);assert.equal(s.approvals.length,requests);assert.match(d.querySelector('#action-form-error').textContent,/root cause/);
    d.querySelector('#recovery-cause').value='Processing backlog';d.querySelector('#recovery-steps').value='Reassign capacity to older cases';d.querySelector('#action-due').value='2099-12-31';submit('#action-form');
    const a=s.actions.at(-1),request=s.approvals[0];assert.equal(s.actions.length,count+1);assert.equal(s.approvals.length,requests+1);assert.equal(request.entityId,a.id);assert.equal(request.type,'Plan approval');assert.equal(request.status,'Department review');assert.equal(a.status,'Open');assert.equal(d.querySelector('#edit-action'),null);assert.equal(d.querySelector('#plan-rootCause').disabled,true);assert.equal(d.querySelector('#action-transition button').disabled,true);assert.match(d.querySelector('[aria-label="Recovery workflow"]').textContent,/Awaiting Department review/);
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));assert.equal(restored.s.approvals[0].entityId,a.id);assert.equal(restored.s.approvals[0].status,'Department review');restored.dom.window.close();
    s.switchUser('lead-1');s.decideRequest(request.id,'Approve','Department agrees');s.switchUser('owner-1');s.actionDetail(a.id);assert.equal(d.querySelector('#action-transition button').disabled,true);assert.match(d.querySelector('[aria-label="Recovery workflow"]').textContent,/Awaiting Strategy review/);
    s.switchUser('strategy-2');s.decideRequest(request.id,'Approve','Strategy agrees');s.switchUser('owner-1');s.actionDetail(a.id);assert.equal(d.querySelector('.drawer h2').textContent,'Manage recovery plan');assert.equal(d.querySelector('#plan-rootCause').disabled,false);assert.equal(d.querySelector('#action-transition button').disabled,false);
    submit('#action-transition');assert.equal(a.status,'In progress');d.querySelector('#action-note').value='Capacity reassigned';submit('#action-note-form');assert.equal(a.notes[0].text,'Capacity reassigned');assert.equal(s.approvals.length,requests+1,'routine updates do not create amendment requests');
    d.querySelector('#plan-prevention').value='Review capacity every week';submit('#corrective-plan-form');assert.equal(s.approvals[0].type,'Plan amendment');assert.equal(s.approvals[0].status,'Department review');assert.equal(a.plan.prevention,'','approved structure is unchanged pending review');
  }finally{dom.window.close()}
});
test('lists of values control new forms without invalidating saved records and source catalogues persist',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('admin-1');s.go('admin');d.querySelector('[data-admin-tab=lists]').click();const form=d.querySelector('[data-lov-form=kpiTypes]');form.querySelector('textarea').value='Leading\nLagging\nOutcome';form.dispatchEvent(new w.Event('submit',{cancelable:true}));
    s.saveLookup('units',['%','days']);assert.throws(()=>s.saveLookup('priorities',['High','Low']),/default/);assert.throws(()=>s.saveLookup('units',['custom']),/system values/);assert.throws(()=>s.saveLookup('kpiTypes',['Outcome','outcome']),/unique/);
    s.addSource({name:'Enterprise service feed',owner:'Integration team',frequency:'Daily'});s.switchUser('owner-1');s.go('kpi');d.querySelector('#new-kpi').click();assert.ok([...d.querySelector('#reg-type').options].some(o=>o.value==='Outcome'));assert.deepEqual([...d.querySelector('#reg-unit').options].map(o=>o.value),['%','days']);assert.ok(d.querySelector('#source-choices').textContent!==undefined);assert.ok([...d.querySelector('#source-choices').options].some(o=>o.value==='Enterprise service feed'));
    for(const [key,value] of Object.entries({name:'Service coverage',owner:'Service owner',source:'Enterprise service feed',sourceKey:'coverage_percent',definition:'Coverage of services',formula:'Covered / total * 100',target:'90',amber:'80',type:'Outcome',unit:'%'}))d.querySelector('#reg-'+key).value=value;
    d.querySelector('#register-form').dispatchEvent(new w.Event('submit',{cancelable:true}));const k=s.kpis.at(-1);assert.equal(k.type,'Outcome');assert.equal(k.sourceKey,'coverage_percent');d.querySelector('#approve').click();
    s.switchUser('admin-1');s.saveLookup('kpiTypes',['Leading','Lagging']);s.switchUser('lead-1');s.decideRequest(s.approvals[0].id,'Approve','Reviewed');s.switchUser('strategy-2');s.decideRequest(s.approvals[0].id,'Approve','Approved');assert.equal(k.draft,false,'retiring a type must preserve pending definitions');
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));assert.equal(restored.s.config.sourceProfiles['Enterprise service feed'].owner,'Integration team');assert.ok(!restored.s.lookupValues('kpiTypes').includes('Outcome'));restored.dom.window.close();
    s.switchUser('owner-1');assert.throws(()=>s.saveLookup('kpiTypes',['Bad']),/Administrator/);
  }finally{dom.window.close()}
});
test('workspace search finds scoped sources, draft KPIs, objectives, plans and approvals and explains the application',()=>{
  const {dom,w,d,s}=workspace();const ask=q=>{d.querySelector('#ask-input').value=q;d.querySelector('#ask-form').dispatchEvent(new w.Event('submit',{cancelable:true}))};
  try{
    s.switchUser('owner-1');s.submitRequest('Target change','KPI',s.raw('KPI-SRV-002'),{period:5,target:1.8,amber:2.2},'Service target improvement');const request=s.approvals[0];d.querySelector('#global-search').value=request.id;d.querySelector('#global-search').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'}));assert.equal(w.location.hash,'#/ai');assert.ok(d.querySelector(`[data-request="${request.id}"]`));d.querySelector(`[data-request="${request.id}"]`).click();assert.match(d.querySelector('.drawer').textContent,/Service target improvement/);
    s.go('ai');ask('Service Management Platform');d.querySelector('[data-search-source]').click();assert.equal(w.location.hash,'#/data');assert.match(d.querySelector('main').textContent,/Source: Service Management Platform/);assert.equal(d.querySelectorAll('.report-grid>section').length,1);
    s.go('ai');ask('How does ITQAN IQ work?');assert.match(d.querySelector('#chat').textContent,/Strategic goals|strategic goals/);assert.match(d.querySelector('#chat').textContent,/Department review/);
    assert.equal(s.workspaceSearch('Road fatalities').length,0);assert.equal(s.workspaceSearch('Traffic Intelligence').length,0);assert.ok(s.workspaceSearch('backlog').some(r=>r.kind==='Recovery plan'));
  }finally{dom.window.close()}
});
test('Impact offers actions for healthy KPIs, recovery only for gaps, and links updates to approvals',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');s.go('impact');d.querySelector('#impact-filter').value='all';d.querySelector('#impact-filter').dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('[data-create-action-plan="KPI-SRV-001"]'));assert.equal(d.querySelector('[data-create-recovery="KPI-SRV-001"]'),null);assert.ok(d.querySelector('[data-create-recovery="KPI-SRV-002"]'));assert.match(d.querySelector('main').textContent,/Latest updates/);
    s.detail('KPI-SRV-002');d.querySelector('#amend-kpi').click();d.querySelector('#amend-formula').value='Source completion duration';d.querySelector('#amend-sourceKey').value='completion_days';d.querySelector('#amend-reason').value='Clarify source mapping';d.querySelector('#kpi-amendment-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.notEqual(s.raw('KPI-SRV-002').sourceKey,'completion_days');approveLatest(s);assert.equal(s.raw('KPI-SRV-002').sourceKey,'completion_days');s.go('data');assert.match(d.querySelector('main').textContent,/completion_days/);
  }finally{dom.window.close()}
});
test('visible role selection filters assigned accounts and enters the correct departmental workspace',()=>{
  const {dom,w,d,s}=workspace();
  try{
    d.querySelector('#sign-out').click();assert.equal(d.querySelector('#demo-access').closest('details'),null);
    assert.equal(d.querySelector('[data-login-role=strategy]').getAttribute('aria-pressed'),'true');assert.equal(d.querySelector('#login-department-field').hidden,true);
    assert.ok([...d.querySelector('#login-profile').options].every(o=>s.users.find(u=>u.id===o.value).role==='strategy'));
    selectDemoAccount(w,'owner-1');assert.equal(d.querySelector('[data-login-role=contributor]').getAttribute('aria-pressed'),'true');assert.equal(d.querySelector('#login-department-field').hidden,false);assert.match(d.querySelector('#login-role-description').textContent,/Register KPIs/);assert.match(d.querySelector('#login-scope').textContent,/Digital Services/);assert.equal(s.currentUser().id,'strategy-1','role preview does not mutate the session');
    d.querySelector('#login-language').click();assert.equal(d.querySelector('#login-profile').value,'owner-1');assert.equal(d.querySelector('#login-department').value,'Digital Services');
    d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(s.currentUser().id,'owner-1');assert.ok(s.visibleKpis().every(k=>k.dept==='Digital Services'));
    d.querySelector('#sign-out').click();selectDemoAccount(w,'lead-2');assert.match(d.querySelector('#login-role-description').textContent,/مراجعة طلبات الإدارة/);assert.equal(w.localStorage.getItem('itqan-language'),'ar');d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(s.currentUser().role,'lead');assert.equal(s.currentUser().department,'Traffic & Licensing');
  }finally{dom.window.close()}
});
test('role preview handles missing accounts and rejects a mismatched account at submission',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.users.find(u=>u.id==='owner-1').active=false;d.querySelector('#sign-out').click();d.querySelector('[data-login-role=contributor]').click();d.querySelector('#login-department').value='Digital Services';d.querySelector('#login-department').dispatchEvent(new w.Event('change'));
    assert.equal(d.querySelector('#enter-demo').disabled,true);assert.match(d.querySelector('#login-scope').textContent,/No active account/);
    const injected=d.createElement('option');injected.value='admin-1';d.querySelector('#login-profile').append(injected);d.querySelector('#login-profile').value='admin-1';d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.localStorage.getItem('itqan-auth'),null);
    d.querySelector('[data-login-role=admin]').click();assert.equal(d.querySelector('#enter-demo').disabled,false);assert.equal(d.querySelector('#login-department-field').hidden,true);assert.match(d.querySelector('#login-role-description').textContent,/No business approval bypass/);
  }finally{dom.window.close()}
});
test('login restores credential fields and UAE PASS without authenticating or storing entered passwords',()=>{
  const {dom,w,d,s}=workspace();
  try{
    d.querySelector('#sign-out').click();assert.ok(d.querySelector('#login-id'));assert.equal(d.querySelector('#login-password').type,'password');assert.equal(d.querySelectorAll('[data-login-role]').length,4);assert.equal(d.querySelector('#demo-access').tagName,'SECTION');
    d.querySelector('#credentials-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.localStorage.getItem('itqan-auth'),null);
    d.querySelector('#login-id').value='preview@example.test';d.querySelector('#login-password').value='test-only-password';d.querySelector('#toggle-password').click();assert.equal(d.querySelector('#login-password').type,'text');assert.equal(d.querySelector('#toggle-password').getAttribute('aria-pressed'),'true');
    d.querySelector('#credentials-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match(d.querySelector('#sign-in-message').textContent,/Organization sign-in is not connected/);assert.equal(d.querySelector('#login-password').value,'');assert.equal(d.querySelector('#login-password').type,'password');assert.equal(w.localStorage.getItem('itqan-auth'),null);
    d.querySelector('#uae-pass-login').click();assert.match(d.querySelector('#sign-in-message').textContent,/UAE PASS sign-in is not connected/);assert.equal(w.localStorage.getItem('itqan-auth'),null);
    d.querySelector('#forgot-password').click();assert.match(d.querySelector('#sign-in-message').textContent,/No password reset is sent/);
    assert.ok(!Object.values(w.localStorage).join('').includes('test-only-password'));assert.ok(!Object.values(w.localStorage).join('').includes('preview@example.test'));
    selectDemoAccount(w,'owner-1');d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(s.currentUser().department,'Digital Services');assert.equal(w.localStorage.getItem('itqan-auth'),'true');
  }finally{dom.window.close()}
});
test('login language, account help and administrator demo access remain available',()=>{
  const {dom,w,d}=workspace();
  try{
    d.querySelector('#sign-out').click();d.querySelector('#login-help').click();assert.match(d.querySelector('#sign-in-message').textContent,/Workspace administrator/);
    d.querySelector('#login-language').click();assert.equal(d.documentElement.dir,'rtl');assert.equal(d.documentElement.lang,'ar');assert.match(d.querySelector('#uae-pass-login').textContent,/الهوية الرقمية/);
    d.querySelector('#toggle-password').click();assert.equal(d.querySelector('#toggle-password').textContent,'إخفاء');
    d.querySelector('#login-language').click();assert.equal(d.documentElement.dir,'ltr');selectDemoAccount(w,'admin-1');d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#/admin');
  }finally{dom.window.close()}
});
test('administrator sign-in opens all configuration sections and other roles cannot save configuration',()=>{
  const {dom,w,d,s}=workspace();
  try{
    assert.throws(()=>s.saveConfiguration('general',{orgName:'Unauthorized'}),/Administrator/);
    s.go('admin');assert.ok(d.querySelector('#choose-admin-account'));d.querySelector('#choose-admin-account').click();
    selectDemoAccount(w,'admin-1');d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.equal(w.location.hash,'#/admin');assert.ok(d.querySelector('#admin-shortcut'));assert.equal(d.querySelector('#period'),null);
    const tabs=[...d.querySelectorAll('[data-admin-tab]')].map(e=>e.dataset.adminTab);assert.equal(tabs.length,10);
    for(const tab of tabs){d.querySelector(`[data-admin-tab="${tab}"]`).click();assert.ok(d.querySelector('.admin-section'));}
    d.querySelector('[data-admin-tab=general]').click();d.querySelector('#config-orgName').value='Connected Organization';d.querySelector('#config-strategyLabel').value='Strategy 2035';d.querySelector('#config-landingPage').value='ai';d.querySelector('#app-config-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.match(d.querySelector('.org').textContent,/Connected Organization/);assert.match(d.querySelector('.page-heading').textContent,/Strategy 2035/);
    d.querySelector('#sign-out').click();selectDemoAccount(w,'strategy-1');d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#/ai');
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));try{assert.equal(restored.s.config.orgName,'Connected Organization');assert.equal(restored.s.config.landingPage,'ai')}finally{restored.dom.window.close()}
  }finally{dom.window.close()}
});
test('performance and recovery policies affect calculations without editing targets or external actuals',()=>{
  const {dom,w,d,s}=workspace();
  try{
    const before=JSON.stringify(s.kpis);s.switchUser('admin-1');s.saveConfiguration('scoring',{green:98,amber:90});
    assert.equal(w.Data.aggregateStatus(96),'amber');assert.equal(w.Data.aggregateStatus(89),'red');assert.equal(JSON.stringify(s.kpis),before);
    assert.throws(()=>s.saveConfiguration('scoring',{green:90,amber:95}),/Amber/);assert.equal(s.config.green,98);
    s.go('dashboard');assert.match(d.querySelector('#app').textContent,/98% is the on-track boundary/);
    const a=s.actions[0],k=s.kpis.find(k=>k.id===a.kpi);k.history[3]=2.5;k.history[4]=2;k.history[5]=1.9;assert.equal(s.actionReady(a),true);
    s.saveConfiguration('recovery',{recoveryPeriods:3});assert.equal(s.actionReady(a),false);assert.equal(s.reviewSnapshot(a).length,3);
    s.actionDetail(a.id);assert.match(d.querySelector('.drawer').textContent,/3 consecutive Green/);
    assert.throws(()=>s.saveConfiguration('recovery',{recoveryPeriods:1}),/Recovery requires/);
  }finally{dom.window.close()}
});
test('configured approval windows, plan defaults and notification preferences reach the workflows',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('admin-1');s.saveConfiguration('approvals',{approvalDays:5});s.saveConfiguration('recovery',{defaultPriority:'High',reviewCadence:'Monthly',planDueDays:21});
    s.saveConfiguration('notifications',{notifyApprovals:false,notifyReviews:false,notifyPerformance:false});assert.equal(s.attention(),0);
    s.switchUser('owner-1');s.actionForm('KPI-SRV-002');assert.equal(d.querySelector('#action-priority').value,'High');
    const due=new Date();due.setDate(due.getDate()+21);assert.equal(d.querySelector('#action-due').value,`${due.getFullYear()}-${String(due.getMonth()+1).padStart(2,'0')}-${String(due.getDate()).padStart(2,'0')}`);
    d.querySelector('#action-title').value='Configured defaults';d.querySelector('#action-effect').value='Improve adoption';d.querySelector('#action-form').dispatchEvent(new w.SubmitEvent('submit',{cancelable:true,submitter:d.querySelector('#save-recovery-draft')}));
    assert.equal(s.actions.at(-1).priority,'High');assert.equal(s.actions.at(-1).plan.cadence,'Monthly');assert.equal(d.querySelector('#plan-cadence').value,'Monthly');
    const k=s.raw('KPI-SRV-001'),r=s.submitRequest('Target change','KPI',k,{period:5,target:93,amber:88},'Target policy check');assert.ok(Math.abs(Date.parse(r.stageDueAt)-Date.now()-5*86400000)<2000);
    const firstDue=r.stageDueAt;s.switchUser('admin-1');s.saveConfiguration('approvals',{approvalDays:7});assert.equal(r.stageDueAt,firstDue,'existing stage retains its deadline');
    s.switchUser('lead-1');s.decideRequest(r.id,'Approve','Checked');assert.ok(Math.abs(Date.parse(r.stageDueAt)-Date.now()-7*86400000)<2000);
    s.approvalDetail(r.id);assert.match(d.querySelector('.drawer').textContent,/Review deadline:/);assert.equal(k.target,92,'policy never bypasses final approval');
    s.go('dashboard');d.querySelector('#notifications').click();assert.equal(d.querySelector('.drawer [data-kpi]'),null);assert.equal(d.querySelector('.drawer [data-request]'),null);
  }finally{dom.window.close()}
});
test('department and objective configuration preserves links, feeds creation and persists safely',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('admin-1');const originalGoal=s.kpis[0].goal;s.saveObjective(0,{name:'<img src=x onerror=alert(1)>',ar:'',objective:'Updated safety objective',owner:'Safety office'});
    assert.equal(s.kpis[0].goal,originalGoal);s.go('dashboard');assert.equal(d.querySelector('.goal-name img'),null);assert.match(d.querySelector('.goal-name').textContent,/<img/);
    s.saveObjective(null,{name:'Sustainable operations',ar:'',objective:'Reduce resource use',owner:'Operations'});s.saveDepartment('Sustainability','Operations');
    assert.throws(()=>s.saveDepartment('sustainability','Other'),/already exists/);
    s.updateAccount(null,{name:'Sustainability colleague',email:'sustainability@demo.local',role:'contributor',department:'Sustainability',active:true});
    s.switchUser(s.users.at(-1).id);s.go('kpi');d.querySelector('#new-kpi').click();assert.equal(d.querySelector('#reg-dept').value,'Sustainability');assert.ok([...d.querySelector('#reg-goal').options].some(o=>o.textContent.endsWith('Reduce resource use')));
    assert.equal(s.visibleKpis().length,0);assert.throws(()=>s.saveObjective(0,{name:'No',ar:'',objective:'No',owner:'No'}),/Administrator/);
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));try{assert.equal(restored.s.goals.length,5);assert.equal(restored.s.goals[0].objective,'Updated safety objective');assert.equal(restored.s.config.departmentOwners.Sustainability,'Operations')}finally{restored.dom.window.close()}
  }finally{dom.window.close()}
});
test('source configuration is reflected in data flows without claiming a live connection',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('admin-1');s.go('admin');d.querySelector('[data-admin-tab=sources]').click();const form=d.querySelector('[data-source-config="0"]');
    form.elements.owner.value='Emergency integration team';form.elements.frequency.value='Daily';form.dispatchEvent(new w.Event('submit',{cancelable:true}));
    s.go('data');assert.match(d.querySelector('#app').textContent,/Emergency integration team/);assert.match(d.querySelector('#app').textContent,/Expected refresh: Daily/);assert.match(d.querySelector('#app').textContent,/Connection: not configured/);
    assert.equal(s.config.sourceProfiles['Emergency Operations System'].owner,'Emergency integration team');
  }finally{dom.window.close()}
});
function approveLatest(s){
  const r=s.approvals.find(r=>['Department review','Strategy review'].includes(r.status));assert.ok(r,'request submitted');
  const original=s.currentUser().id;
  if(r.status==='Department review'){const lead=s.users.find(u=>u.role==='lead'&&u.department===r.department&&u.id!==r.requesterId);s.switchUser(lead.id);s.decideRequest(r.id,'Approve','Department review complete');}
  const strategy=s.users.find(u=>u.role==='strategy'&&u.id!==r.requesterId);s.switchUser(strategy.id);s.decideRequest(r.id,'Approve','Strategy review complete');s.switchUser(original);
  if(r.entity==='KPI')s.detail(r.entityId);else s.actionDetail(r.entityId);
}
test('objective action plans need only delivery details, retain department scope and complete through approvals',()=>{
  const {dom,w,d,s}=workspace();const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    s.switchUser('owner-1');s.simpleActionForm(undefined,undefined,undefined,1);
    assert.equal(d.querySelector('#action-link-type').value,'objective');assert.equal(d.querySelector('#action-department').value,'Digital Services');assert.equal(d.querySelector('#recovery-cause'),null);
    d.querySelector('#action-title').value='Publish the service improvement checklist';d.querySelector('#action-effect').value='Checklist approved and available to service teams';d.querySelector('#action-due').value='2099-12-31';submit('#action-form');
    const a=s.actions.at(-1);assert.equal(a.kpi,null);assert.equal(a.goal,1);assert.equal(a.department,'Digital Services');assert.equal(a.milestones.length,0);assert.equal(d.querySelector('#corrective-plan-form'),null);assert.equal(d.querySelector('#monitor-form'),null);
    s.objectiveDetail(1);assert.match(d.querySelector('.objective-actions').textContent,/Publish the service improvement checklist/);
    s.switchUser('owner-0');assert.ok(!s.visibleActions().some(x=>x.id===a.id));assert.throws(()=>s.submitRequest('Plan approval','Plan',a,a,a.title),/department/);
    s.switchUser('owner-1');s.actionDetail(a.id);d.querySelector('#submit-plan').click();approveLatest(s);assert.equal(a.approvalStatus,'Approved');submit('#action-transition');assert.equal(a.status,'In progress');
    assert.throws(()=>s.transitionAction(a,'Closed',''),/completion evidence/);d.querySelector('#recovery-evidence').value='Published checklist, approved by service owner';submit('#action-transition');assert.equal(a.status,'In progress');approveLatest(s);assert.equal(a.status,'Closed');assert.equal(a.closure.observations.length,0);assert.equal(a.closure.link.goal,1);assert.equal(a.reviews.length,0);
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));try{restored.s.switchUser('owner-1');assert.ok(restored.s.visibleActions().some(x=>x.id===a.id&&x.status==='Closed'))}finally{restored.dom.window.close()}
    s.transitionAction(a,'In progress','Checklist needs an additional section');approveLatest(s);assert.equal(a.status,'In progress');assert.match(a.notes[0].text,/additional section/);
  }finally{dom.window.close()}
});
test('KPI action plans use delivery completion independently of KPI recovery or monitoring',()=>{
  const {dom,w,d,s}=workspace();const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    s.switchUser('owner-1');s.detail('KPI-SRV-001');d.querySelector('[data-create-action-plan="KPI-SRV-001"]').click();
    d.querySelector('#action-title').value='Train service owners';d.querySelector('#action-effect').value='All service owners trained';d.querySelector('#action-due').value='2099-12-31';submit('#action-form');const a=s.actions.at(-1);
    d.querySelector('#submit-plan').click();approveLatest(s);submit('#action-transition');s.raw(a.kpi).history[5]=80;
    assert.equal(s.actionReady(a),false);assert.equal(d.querySelector('#monitor-form'),null);assert.throws(()=>s.recordMonitoring(a,{outcome:'Effective',evidence:'Done',blockers:'',nextReview:'2099-12-20'}),/delivery updates/);s.transitionAction(a,'Closed','Training attendance verified');approveLatest(s);assert.equal(a.status,'Closed');assert.equal(s.raw(a.kpi).history[5],80);
  }finally{dom.window.close()}
});
test('recovery creation is available only on current underperforming KPIs and captures the initiating gap',()=>{
  const {dom,w,d,s}=workspace();const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    s.switchUser('owner-1');s.detail('KPI-SRV-001');assert.equal(d.querySelector('[data-create-recovery]'),null);assert.ok(d.querySelector('[data-create-action-plan]'));
    s.go('actions');s.actionForm('KPI-SRV-001');assert.equal(d.querySelector('#action-form'),null);assert.match(d.querySelector('#toast').textContent,/At risk or Off track/);
    const k=s.raw('KPI-SRV-002'),before=k.history[5];k.history[5]=null;assert.equal(s.recoveryEligible(k),false);s.actionForm(k.id);assert.equal(d.querySelector('#action-form'),null);k.history[5]=before;
    s.detail(k.id);d.querySelector('[data-create-recovery]').click();assert.equal(d.querySelector('#action-kpi').options.length,1);assert.match(d.querySelector('.plan-gap').textContent,/2.8 days/);assert.match(d.querySelector('.plan-gap').textContent,/2 days/);
    d.querySelector('#recovery-cause').value='Backlog above available processing capacity';d.querySelector('#recovery-steps').value='Reallocate capacity and clear the oldest requests';d.querySelector('#action-due').value='2099-12-31';submit('#action-form');
    const a=s.actions.at(-1);assert.equal(a.planType,'Recovery plan');assert.equal(a.trigger.actual,2.8);assert.equal(a.trigger.target,2);assert.equal(a.trigger.status,'red');assert.equal(a.milestones.length,1);assert.equal(a.plan.prevention,'');assert.equal(d.querySelector('#submit-plan'),null);assert.ok(s.approvals.some(r=>r.entityId===a.id));approveLatest(s);assert.equal(a.approvalStatus,'Approved');
    k.history[5]=1.8;assert.equal(a.trigger.actual,2.8,'initiating gap is historical evidence');s.actionDetail(a.id);assert.match(d.querySelector('.plan-gap').textContent,/2.8 days/);
    s.go('impact');d.querySelector('#period').value='0';d.querySelector('#period').dispatchEvent(new w.Event('change'));assert.equal(d.querySelector('[data-create-recovery]'),null,'historical report does not initiate recovery');
  }finally{dom.window.close()}
});
test('plan type filters separate objective actions from recovery and global recovery entry routes to KPI gaps',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');s.simpleActionForm(undefined,undefined,undefined,1);d.querySelector('#action-title').value='Objective task';d.querySelector('#action-effect').value='Deliver objective task';d.querySelector('#action-due').value='2099-12-31';d.querySelector('#action-form').dispatchEvent(new w.Event('submit',{cancelable:true}));s.go('actions');
    d.querySelector('[data-plan-type="Action plan"]').click();assert.equal(d.querySelectorAll('.action-card').length,1);assert.match(d.querySelector('.action-card').textContent,/Objective task/);assert.ok(!d.querySelector('.action-card').textContent.includes('KPI unavailable'));
    d.querySelector('[data-plan-type="Recovery plan"]').click();assert.equal(d.querySelectorAll('.action-card').length,1);assert.match(d.querySelector('.action-card').textContent,/Recovery plan/);
    d.querySelector('#create-menu').click();d.querySelector('#create-recovery-choice').click();assert.ok(d.querySelector('#recovery-kpi-search'));assert.equal(d.querySelector('#action-form'),null);assert.ok(d.querySelector('[data-create-recovery="KPI-SRV-002"]'));
  }finally{dom.window.close()}
});
test('action lifecycle validates recovery, milestones and evidence, persists and reopens',()=>{
  const {dom,w,d,s}=workspace();
  try{
    const a=s.actions[0];a.approvalStatus='Approved';a.status='In progress';
    assert.throws(()=>s.transitionAction(a,'Closed','Evidence'),/two consecutive/);
    assert.equal(a.status,'In progress');
    const k=s.kpis.find(k=>k.id===a.kpi);k.history[4]=2;k.history[5]=1.9;
    a.milestones.push({title:'Review backlog',done:false});
    assert.throws(()=>s.transitionAction(a,'Closed','Evidence'),/milestones/);
    a.milestones[0].done=true;
    a.plan=completePlan();Object.assign(a.milestones[0],{owner:a.owner,due:a.due,evidence:'Validated backlog report'});
    assert.throws(()=>s.transitionAction(a,'Closed','  '),/evidence/);
    assert.throws(()=>s.transitionAction(a,'Closed','Evidence'),/monitoring review/);
    s.recordMonitoring(a,{outcome:'Effective',evidence:'Outcome verified against criteria',blockers:'',nextReview:'2099-12-20'});
    s.actionDetail(a.id);
    d.querySelector('#recovery-evidence').value='Backlog cleared; monthly service report verified.';
    d.querySelector('#action-transition').dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.equal(a.status,'In progress','closure waits for approval');approveLatest(s);
    assert.equal(a.status,'Closed');assert.equal(a.closure.observations.length,2);
    k.history[5]=3;
    assert.equal(a.closure.observations[1].actual,1.9,'closure evidence is a snapshot');
    assert.throws(()=>s.transitionAction(a,'In progress','  '),/reason/);
    s.transitionAction(a,'In progress','Performance regressed');approveLatest(s);
    assert.equal(a.status,'In progress');assert.equal(a.notes[0].text,'Performance regressed');
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));
    try{assert.equal(restored.s.actions[0].status,'In progress');assert.equal(restored.s.actions[0].closure.observations[1].actual,1.9)}finally{restored.dom.window.close()}
  }finally{dom.window.close()}
});
test('action UI supports creation, editing, search, department scope, milestones and notes',()=>{
  const {dom,w,d,s}=workspace();
  const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    d.querySelector('#department').value='Digital Services';d.querySelector('#department').dispatchEvent(new w.Event('change'));
    assert.equal(d.querySelectorAll('.action-card').length,1);
    d.querySelector('#action-search').value='no matches';d.querySelector('#action-search').dispatchEvent(new w.Event('input'));
    assert.equal(d.querySelectorAll('.action-card').length,0);
    d.querySelector('#action-clear').click();assert.equal(d.querySelectorAll('.action-card').length,1);
    s.actionForm('KPI-SRV-002');
    d.querySelector('#action-title').value='<script>unsafe</script>';
    d.querySelector('#action-due').value='2099-12-31';d.querySelector('#action-effect').value='Improve adoption';
    d.querySelector('#action-form').dispatchEvent(new w.SubmitEvent('submit',{cancelable:true,submitter:d.querySelector('#save-recovery-draft')}));
    const a=s.actions.at(-1);assert.equal(a.status,'Open');assert.equal(d.querySelector('.drawer script'),null);
    submit('#action-transition');assert.equal(a.status,'Open','incomplete plans cannot start');
    for(const [key,value] of Object.entries(completePlan()))d.querySelector('#plan-'+key).value=value;
    submit('#corrective-plan-form');
    d.querySelector('#milestone-title').value='Validate results';submit('#milestone-form');
    d.querySelector('#submit-plan').click();assert.equal(a.approvalStatus,'Draft');approveLatest(s);
    submit('#action-transition');assert.equal(a.status,'In progress');
    assert.equal(a.milestones.length,1);d.querySelector('[data-milestone]').click();submit('[data-milestone-form]');assert.equal(a.milestones[0].done,false,'completion requires evidence');
    d.querySelector('[data-milestone-form] textarea').value='Validated source report';submit('[data-milestone-form]');assert.equal(a.milestones[0].done,true);
    d.querySelector('#action-note').value='Owner reviewed results';submit('#action-note-form');assert.equal(a.notes.length,1);
    d.querySelector('#edit-action').click();d.querySelector('#action-title').value='Updated action';submit('#action-form');
    assert.notEqual(a.title,'Updated action');approveLatest(s);assert.equal(a.title,'Updated action');assert.ok(a.history.some(h=>h.event.includes('Plan amendment approved')));
    d.querySelector('#close-modal').click();d.querySelector('#language').click();assert.equal(d.documentElement.dir,'rtl');assert.ok(!d.querySelector('#app').textContent.includes('???'));
  }finally{dom.window.close()}
});
test('objective, KPI and recovery connections navigate both ways and reconcile after creation',()=>{
  const {dom,w,d,s}=workspace();
  try{
    d.querySelector('[data-page="strategy"]').click();
    assert.equal(d.querySelectorAll('.connected-measure').length,8);
    assert.equal(d.querySelectorAll('[data-linked-action]').length,3);
    d.querySelector('[data-objective="1"]').click();
    assert.equal(d.querySelectorAll('.drawer .connected-measure').length,2);
    d.querySelector('.drawer [data-kpi="KPI-SRV-002"]').click();
    assert.ok(d.querySelector('.drawer .connection-path').textContent.includes('Deliver seamless digital services'));
    d.querySelector('.drawer [data-linked-action="1"]').click();
    assert.ok(d.querySelector('.connection-current').textContent.includes('Accelerate service backlog'));
    d.querySelector('.drawer [data-objective="1"]').click();
    d.querySelector('.drawer [data-objective-kpis="1"]').click();
    assert.equal(d.querySelector('#registry-goal').value,'1');
    assert.equal(d.querySelectorAll('tbody tr[data-kpi]').length,2);
    // A nested relationship button must not bubble to the KPI row.
    d.querySelector('[data-kpi-actions="KPI-SRV-002"]').click();
    assert.equal(d.querySelector('.drawer'),null);
    assert.equal(d.querySelectorAll('.action-card').length,1);
    assert.ok(d.querySelector('.connection-scope').textContent.includes('Service completion time'));
    d.querySelector('#clear-action-link').click();assert.equal(d.querySelectorAll('.action-card').length,3);
    s.actionDetail(1);d.querySelector('.drawer [data-objective="1"]').click();
    d.querySelector('.drawer [data-objective-actions="1"]').click();assert.equal(d.querySelectorAll('.action-card').length,1);
    d.querySelector('#clear-action-link').click();
    d.querySelector('[data-page="strategy"]').click();
    d.querySelector('[data-kpi="KPI-SRV-001"]').click();
    assert.ok(d.querySelector('.drawer .linked-recovery'),'healthy KPIs also show their recovery connections');
    assert.equal(d.querySelector('.drawer [data-create-recovery="KPI-SRV-001"]'),null);d.querySelector('.drawer [data-create-action-plan="KPI-SRV-001"]').click();
    assert.equal(d.querySelector('#action-kpi').value,'KPI-SRV-001');
    assert.ok(d.querySelector('#action-form-connection').textContent.includes('Deliver seamless digital services'));
    d.querySelector('#action-title').value='Connected action';d.querySelector('#action-effect').value='Improve adoption';d.querySelector('#action-due').value='2099-12-31';
    d.querySelector('#action-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.equal(s.actions.at(-1).kpi,'KPI-SRV-001');
    d.querySelector('.drawer [data-kpi="KPI-SRV-001"]').click();
    assert.ok(d.querySelector('.drawer .linked-recovery').textContent.includes('Connected action'));
    d.querySelector('.drawer [data-objective="1"]').click();
    assert.ok(d.querySelector('.drawer').textContent.includes('Connected action'));
  }finally{dom.window.close()}
});
test('only targets are editable; externally supplied actuals and past thresholds are preserved',()=>{
  const {dom,w,d,s}=workspace();
  try{
    const k=s.kpis.find(k=>k.id==='KPI-SRV-002'),history=JSON.stringify(k.history),confidence=JSON.stringify(k.confidences);
    d.querySelector('[data-page="data"]').click();
    assert.ok(d.querySelector('#app').textContent.includes('Live integrations not connected'));
    d.querySelector('[data-kpi="KPI-SRV-002"]').click();
    assert.equal(d.querySelector('#actual-form'),null);assert.equal(d.querySelector('#actual'),null);assert.equal(d.querySelector('#confidence'),null);
    d.querySelector('#target-value').value='3';d.querySelector('#target-amber').value='2';
    d.querySelector('#target-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.ok(d.querySelector('#target-error').textContent.includes('worse'));assert.equal(k.target,2);
    d.querySelector('#target-amber').value='3.5';d.querySelector('#target-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.equal(k.target,2,'published target waits for both approvals');approveLatest(s);
    assert.equal(k.target,3);assert.equal(w.Data.at(k,4).target,2);assert.equal(w.Data.status(w.Data.at(k,4)),'red');
    assert.equal(w.Data.status(w.Data.at(k,5)),'green');assert.equal(w.Data.recoveryReady(k),false,'new target must not turn prior red period green');
    assert.equal(JSON.stringify(k.history),history);assert.equal(JSON.stringify(k.confidences),confidence);
    assert.throws(()=>w.Data.setTarget(k,4,3,3.5),/historical/);
    d.querySelector('#close-modal').click();d.querySelector('#period').value='4';d.querySelector('#period').dispatchEvent(new w.Event('change'));
    d.querySelector('[data-kpi="KPI-SRV-002"]').click();assert.equal(d.querySelector('#target-form'),null);
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));
    try{const rk=restored.s.kpis.find(x=>x.id===k.id);assert.equal(restored.w.Data.at(rk,4).target,2);assert.equal(restored.w.Data.at(rk,5).target,3)}finally{restored.dom.window.close()}
    d.querySelector('#close-modal').click();d.querySelector('[data-page="kpi"]').click();d.querySelector('#new-kpi').click();assert.equal(d.querySelector('#reg-baseline'),null);
  }finally{dom.window.close()}
});
test('simple insights guide opens relevant KPIs, targets, sources, objectives and recovery',()=>{
  const {dom,w,d}=workspace();
  const ai=()=>d.querySelector('[data-page="ai"]').click();
  const ask=text=>{d.querySelector('#ask-input').value=text;d.querySelector('#ask-form').dispatchEvent(new w.Event('submit',{cancelable:true}))};
  try{
    ai();assert.ok(d.querySelector('#chat').textContent.includes('Start with these KPIs'));assert.ok(d.querySelectorAll('#chat [data-kpi]').length<=3);
    d.querySelector('#chat [data-kpi="KPI-SRV-002"]').click();assert.ok(d.querySelector('#target-form'));d.querySelector('#close-modal').click();
    d.querySelector('[data-ask="data"]').click();assert.ok(d.querySelector('#chat').textContent.includes('Actuals come from source applications'));
    d.querySelector('#chat [data-assistant-nav="data"]').click();assert.ok(d.querySelector('#app').textContent.includes('Live integrations not connected'));
    ai();ask('KPI-SRV-002');assert.equal(d.querySelectorAll('#chat [data-kpi]').length,1);
    ask('objectives');d.querySelector('#chat [data-objective="1"]').click();assert.ok(d.querySelector('.drawer .connected-measure'));d.querySelector('#close-modal').click();
    d.querySelector('[data-ask="recovery"]').click();d.querySelector('#chat [data-linked-action="1"]').click();assert.ok(d.querySelector('#action-transition'));d.querySelector('#close-modal').click();
    assert.equal(d.querySelector('#period'),null);d.querySelector('[data-ask="targets"]').click();assert.ok(d.querySelector('#chat').textContent.includes('submit for approval'));
    ask('<img src=x onerror=alert(1)>');assert.equal(d.querySelector('#chat img'),null);assert.ok(d.querySelector('#chat').textContent.includes('No matching records'));
    d.querySelector('#department').value='Public Safety';d.querySelector('#department').dispatchEvent(new w.Event('change'));d.querySelector('[data-ask="recovery"]').click();assert.ok(d.querySelector('#chat').textContent.includes('No matching actions'));
    d.querySelector('#language').click();d.querySelector('[data-ask="data"]').click();assert.ok(d.querySelector('#chat').textContent.includes('القيم الفعلية'));
  }finally{dom.window.close()}
});
test('monitoring retains evidence, flags blockers and requires fresh effectiveness before closure',()=>{
  const {dom,w,d,s}=workspace();
  const submit=id=>d.querySelector(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
  try{
    const a=s.actions[0],k=s.kpis.find(k=>k.id===a.kpi);a.approvalStatus='Approved';a.status='In progress';a.plan=completePlan();a.milestones=[{title:'Clear queue',owner:a.owner,due:a.due,done:true,evidence:'Queue report'}];
    s.actionDetail(a.id);d.querySelector('#monitor-outcome').value='Blocked';d.querySelector('#monitor-evidence').value='Capacity still insufficient';d.querySelector('#monitor-next').value='2099-12-20';submit('#monitor-form');assert.equal(a.reviews.length,0);
    d.querySelector('#monitor-blockers').value='Sponsor to approve additional capacity';submit('#monitor-form');assert.equal(a.reviews[0].outcome,'Blocked');assert.ok([...d.querySelectorAll('.monitor-card-status')].some(el=>el.textContent.includes('Blocked')));
    assert.throws(()=>s.recordMonitoring(a,{outcome:'Effective',evidence:'Reviewed',blockers:'',nextReview:'2099-12-20'}),/two Green/);
    k.history[4]=2;k.history[5]=1.9;s.recordMonitoring(a,{outcome:'Effective',evidence:'Backlog cleared and recurrence controls in place',blockers:'',nextReview:'2099-12-20'});
    assert.equal(s.effectiveReview(a),true);k.history[5]=1.8;assert.equal(s.effectiveReview(a),false,'new actuals require a fresh review');assert.throws(()=>s.transitionAction(a,'Closed','Close'),/monitoring review/);
    s.recordMonitoring(a,{outcome:'Effective',evidence:'Refreshed source results verified',blockers:'',nextReview:'2099-12-20'});a.revision++;assert.equal(s.effectiveReview(a),false,'plan revisions invalidate old effectiveness');
    s.recordMonitoring(a,{outcome:'Effective',evidence:'Revised plan verified',blockers:'',nextReview:'2099-12-20'});s.transitionAction(a,'Closed','Outcomes verified');approveLatest(s);assert.equal(a.status,'Closed');
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));try{assert.equal(restored.s.actions[0].reviews.length,4);assert.equal(restored.s.actions[0].plan.rootCause,a.plan.rootCause)}finally{restored.dom.window.close()}
  }finally{dom.window.close()}
});
test('reporting selector appears only on analytical views and historical scope cannot leak into workflows',()=>{
  const {dom,w,d}=workspace();
  try{
    for(const page of ['dashboard','strategy','data','impact','reports']){d.querySelector(`[data-page="${page}"]`).click();assert.ok(d.querySelector('#period'),page)}
    d.querySelector('#period').value='4';d.querySelector('#period').dispatchEvent(new w.Event('change'));
    for(const page of ['actions','ai','kpi','approvals','audit']){d.querySelector(`[data-page="${page}"]`).click();assert.equal(d.querySelector('#period'),null,page)}
    d.querySelector('[data-page="kpi"]').click();d.querySelector('[data-kpi="KPI-SRV-002"]').click();assert.ok(d.querySelector('#target-form'),'target setup uses current period');d.querySelector('#close-modal').click();
    d.querySelector('[data-page="reports"]').click();assert.equal(d.querySelector('#period').value,'4','report selection is retained');
  }finally{dom.window.close()}
});
test('department access covers pages, search, direct records, source data and approval scope',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');assert.equal(s.visibleKpis().length,2);assert.equal(s.scoped(5,'All departments').length,2);assert.equal(s.raw('KPI-SEC-001'),undefined);
    assert.equal(d.querySelector('[data-page="admin"]'),null);
    for(const page of ['dashboard','strategy','kpi','data','ai','impact','actions','reports','audit','approvals']){
      s.go(page);const content=d.querySelector('.content').textContent;
      assert.ok(!content.includes('Emergency response time'),page);assert.ok(!content.includes('Traffic Intelligence System'),page);assert.ok(!content.includes('Expand road safety awareness campaign'),page);
    }
    s.go('kpi');assert.equal(d.querySelector('#department').options.length,1);d.querySelector('#kpi-search').value='Emergency';d.querySelector('#kpi-search').dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('tbody tr[data-kpi]').length,0);
    s.detail('KPI-SEC-001');assert.equal(d.querySelector('.drawer'),null);s.actionDetail(2);assert.equal(d.querySelector('.drawer'),null);
    assert.throws(()=>s.submitRequest('Target change','KPI',s.kpis[0],{period:5,target:7,amber:8},'Forbidden'),/cannot change/);
    s.go('admin');assert.ok(d.querySelector('.content').textContent.includes('Administrator access required'));assert.equal(d.querySelector('[data-account]'),null);
    s.switchUser('strategy-1');assert.equal(s.visibleKpis().length,8);s.go('data');assert.ok(d.querySelector('.content').textContent.includes('Traffic Intelligence System'));
  }finally{dom.window.close()}
});
test('approval stages prevent self-approval and wrong-department decisions and support rejection/resubmission',()=>{
  const {dom,s}=workspace();
  try{
    s.switchUser('owner-1');const k=s.raw('KPI-SRV-002'),r=s.submitRequest('Target change','KPI',k,{period:5,target:3,amber:3.5},k.name);
    assert.equal(k.target,2);assert.throws(()=>s.decideRequest(r.id,'Approve','Self'),/not assigned/);
    s.switchUser('lead-0');assert.equal(s.canDecide(r),false);assert.throws(()=>s.decideRequest(r.id,'Approve','Wrong department'),/not assigned/);
    s.switchUser('strategy-1');assert.throws(()=>s.decideRequest(r.id,'Approve','Skip stage'),/not assigned/);
    s.switchUser('lead-1');assert.throws(()=>s.decideRequest(r.id,'Reject','  '),/note/);s.decideRequest(r.id,'Reject','Provide supporting rationale');assert.equal(k.target,2);
    s.switchUser('owner-1');const revised=s.submitRequest('Target change','KPI',k,{period:5,target:2.5,amber:3},k.name);
    s.switchUser('lead-1');s.decideRequest(revised.id,'Approve','Department accepts');assert.equal(k.target,2);assert.equal(revised.status,'Strategy review');assert.throws(()=>s.decideRequest(revised.id,'Approve','Again'),/not assigned/);
    s.switchUser('strategy-1');s.decideRequest(revised.id,'Approve','Approved');assert.equal(k.target,2.5);assert.equal(revised.decisions.length,2);assert.throws(()=>s.decideRequest(revised.id,'Approve','Replay'),/not assigned/);
    const own=s.submitRequest('Target change','KPI',k,{period:5,target:2,amber:2.4},k.name);s.switchUser('lead-1');s.decideRequest(own.id,'Approve','Reviewed');s.switchUser('strategy-1');assert.throws(()=>s.decideRequest(own.id,'Approve','Own request'),/not assigned/);s.switchUser('strategy-2');s.decideRequest(own.id,'Approve','Independent review');assert.equal(k.target,2);
  }finally{dom.window.close()}
});
test('admin manages scoped accounts without business approval bypass and creation paths retain KPI context',()=>{
  const {dom,w,d,s}=workspace();
  try{
    assert.throws(()=>s.updateAccount(null,{name:'New',email:'new@demo.local',role:'contributor',department:'Digital Services',active:true}),/administrators/);
    s.switchUser('admin-1');s.go('admin');d.querySelector('[data-admin-tab=users]').click();assert.ok(d.querySelector('#add-account'));assert.equal(d.querySelector('#create-menu'),null);
    d.querySelector('#add-account').click();d.querySelector('#account-name').value='Department colleague';d.querySelector('#account-email').value='colleague@demo.local';d.querySelector('#account-department').value='Digital Services';d.querySelector('#account-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    const account=s.users.find(u=>u.email==='colleague@demo.local');assert.equal(account.role,'contributor');assert.equal(account.department,'Digital Services');
    assert.throws(()=>s.updateAccount('admin-1',{name:'Admin',email:'admin@demo.local',role:'contributor',department:'Digital Services',active:true}),/own administrator/);
    s.switchUser(account.id);assert.equal(s.visibleKpis().length,2);s.go('kpi');d.querySelector('#create-menu').click();d.querySelector('#create-action-choice').click();assert.equal(d.querySelector('#action-kpi').options.length,2);d.querySelector('#action-link-type').value='kpi';d.querySelector('#action-link-type').dispatchEvent(new w.Event('change'));
    d.querySelector('#action-title').value='Service improvement';d.querySelector('#action-effect').value='Reduce avoidable steps';d.querySelector('#action-due').value='2099-12-31';d.querySelector('#action-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    const plan=s.actions.at(-1);assert.equal(plan.planType,'Action plan');assert.equal(plan.approvalStatus,'Draft');assert.equal(s.raw(plan.kpi).dept,'Digital Services');assert.ok(d.querySelector('.connection-path').textContent.includes('Deliver seamless digital services'));
    assert.throws(()=>s.transitionAction(plan,'In progress'),/approval/);
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));try{assert.ok(restored.s.users.some(u=>u.email==='colleague@demo.local'));assert.equal(restored.s.actions.at(-1).approvalStatus,'Draft')}finally{restored.dom.window.close()}
  }finally{dom.window.close()}
});
test('KPI creation remains a department-scoped draft until both approvals and supports returned-definition edits',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');s.go('kpi');d.querySelector('#create-menu').click();d.querySelector('#create-kpi-choice').click();
    const fields={name:'New service KPI',owner:'Service owner',source:'Service platform',definition:'Monthly quality rate',formula:'Successful / total',target:'95',amber:'90',goal:'1',dept:'Digital Services',type:'Leading',dir:'higher',unit:'%'};
    for(const [key,value] of Object.entries(fields))d.querySelector('#reg-'+key).value=value;
    d.querySelector('#register-form').dispatchEvent(new w.Event('submit',{cancelable:true}));const k=s.kpis.at(-1);assert.equal(k.draft,true);assert.equal(s.scoped().length,2);
    d.querySelector('#approve').click();let r=s.approvals[0];assert.equal(r.status,'Department review');s.switchUser('lead-1');s.decideRequest(r.id,'Reject','Clarify the definition');s.switchUser('owner-1');s.detail(k.id);d.querySelector('#edit-kpi-draft').click();d.querySelector('#reg-definition').value='Validated quality rate received monthly';d.querySelector('#register-form').dispatchEvent(new w.Event('submit',{cancelable:true}));d.querySelector('#approve').click();approveLatest(s);assert.equal(k.draft,false);assert.equal(s.scoped().length,3);assert.equal(k.actual,null);
  }finally{dom.window.close()}
});
test('demo account sign-in and approval inbox complete the two-stage target workflow through buttons',()=>{
  const {dom,w,d,s}=workspace();
  const login=id=>{d.querySelector('#sign-out').click();selectDemoAccount(w,id);d.querySelector('#login-form').dispatchEvent(new w.Event('submit',{cancelable:true}))};
  try{
    login('owner-1');assert.equal(w.localStorage.getItem('itqan-user'),'owner-1');s.go('kpi');d.querySelector('[data-kpi="KPI-SRV-002"]').click();d.querySelector('#target-value').value='2.5';d.querySelector('#target-amber').value='3';d.querySelector('#target-form').dispatchEvent(new w.Event('submit',{cancelable:true}));const k=s.raw('KPI-SRV-002'),r=s.approvals[0];assert.equal(k.target,2);
    d.querySelector('.drawer [data-request]').click();assert.equal(d.querySelector('#approval-decision'),null);
    login('lead-1');d.querySelector('[data-page="approvals"]').click();d.querySelector(`[data-request="${r.id}"]`).click();d.querySelector('#decision-note').value='Department evidence checked';d.querySelector('#approval-decision button[value="Approve"]').click();assert.equal(r.status,'Strategy review');assert.equal(k.target,2);
    login('strategy-1');d.querySelector('[data-page="approvals"]').click();d.querySelector(`[data-request="${r.id}"]`).click();d.querySelector('#decision-note').value='Aligned with strategy';d.querySelector('#approval-decision button[value="Approve"]').click();assert.equal(r.status,'Approved');assert.equal(k.target,2.5);
  }finally{dom.window.close()}
});
test('department CSV excludes other departments and stale requests can be returned safely',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');let exported='';w.Blob=class{constructor(parts){exported=parts.join('')}};w.URL.createObjectURL=()=> 'blob:demo';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
    s.go('dashboard');d.querySelector('#export').click();assert.ok(exported.includes('Digital Services'));assert.ok(!exported.includes('KPI-SEC-001'));assert.ok(!exported.includes('Traffic Intelligence System'));
    const k=s.raw('KPI-SRV-002'),r=s.submitRequest('Target change','KPI',k,{period:5,target:2.5,amber:3},k.name);k.version=(k.version||0)+1;s.switchUser('lead-1');assert.throws(()=>s.decideRequest(r.id,'Approve','Approve stale'),/changed/);s.decideRequest(r.id,'Reject','Please refresh the submission');assert.equal(r.status,'Rejected');assert.equal(k.target,2);
  }finally{dom.window.close()}
});
test('published KPI amendments remain unchanged until approved and connected-record Back navigation works',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');s.go('strategy');d.querySelector('[data-objective="1"]').click();d.querySelector('.drawer [data-kpi="KPI-SRV-002"]').click();
    d.querySelector('#drawer-back').click();assert.ok(d.querySelector('.drawer .connected-measure'));d.querySelector('.drawer [data-kpi="KPI-SRV-002"]').click();d.querySelector('.drawer [data-linked-action="1"]').click();d.querySelector('#drawer-back').click();assert.ok(d.querySelector('.drawer .drawer-meta'));
    d.querySelector('#amend-kpi').click();d.querySelector('#amend-name').value='Service turnaround time';d.querySelector('#amend-owner').value='Service accountable owner';d.querySelector('#amend-reason').value='Clarify naming and accountability';d.querySelector('#kpi-amendment-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    const k=s.raw('KPI-SRV-002');assert.equal(k.name,'Service completion time');assert.equal(s.approvals[0].type,'KPI amendment');approveLatest(s);assert.equal(k.name,'Service turnaround time');assert.equal(k.definitionVersion,2);assert.equal(k.history[5],2.8);assert.equal(k.target,2);
  }finally{dom.window.close()}
});
test('approval notifications and filters route reviewers to assigned work',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.switchUser('owner-1');const k=s.raw('KPI-SRV-002'),r=s.submitRequest('Target change','KPI',k,{period:5,target:2.5,amber:3},k.name);
    s.switchUser('lead-1');d.querySelector('#notifications').click();assert.ok(d.querySelector(`.drawer [data-request="${r.id}"]`));d.querySelector(`.drawer [data-request="${r.id}"]`).click();assert.ok(d.querySelector('#approval-decision'));d.querySelector('#close-modal').click();
    s.go('approvals');d.querySelector('#approval-filter').value='My review';d.querySelector('#approval-filter').dispatchEvent(new w.Event('change'));assert.equal(d.querySelectorAll('.approval-list article').length,1);
    d.querySelector('#approval-filter').value='Approved';d.querySelector('#approval-filter').dispatchEvent(new w.Event('change'));assert.equal(d.querySelectorAll('.approval-list article').length,0);
  }finally{dom.window.close()}
});
test('overdue effectiveness reviews block closure and invalid account emails are rejected',()=>{
  const {dom,s}=workspace();
  try{
    const a=s.actions[0],k=s.kpis.find(k=>k.id===a.kpi);a.approvalStatus='Approved';a.status='In progress';a.plan=completePlan();a.milestones=[{title:'Review',owner:a.owner,due:a.due,done:true,evidence:'Verified'}];k.history[4]=2;k.history[5]=1.9;
    s.recordMonitoring(a,{outcome:'Effective',evidence:'Criteria verified',blockers:'',nextReview:'2099-12-20'});assert.equal(s.effectiveReview(a),true);a.plan.nextReview='2020-01-01';assert.equal(s.effectiveReview(a),false);assert.throws(()=>s.transitionAction(a,'Closed','Done'),/monitoring review/);
    s.switchUser('admin-1');assert.throws(()=>s.updateAccount(undefined,{name:'User',email:'invalid',role:'contributor',department:'Digital Services',active:true}),/email/);
  }finally{dom.window.close()}
});
