const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');

function workspace(saved){
  const dom=new JSDOM('<div id="app"></div><div id="overlay"></div><div id="toast"></div>',{url:'http://localhost/#/dashboard',runScripts:'outside-only'});
  dom.window.localStorage.setItem('itqan-auth','true');
  if(saved)dom.window.localStorage.setItem('itqan-demo-v1',saved);
  dom.window.eval(['src/domain/performance.js','src/features/workspace.js','src/app.js'].map(file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8')).join('\n')+`
    window.check={workspaceIntegrity,completeWorkspaceMetadata,goals,strategicGoals,kpis,actions,approvals,users,appConfig,planGaps,persist,go,addSource,saveChildObjective,submitRequest,decideRequest,
      setUser(id){currentUserId=id;department=currentUser().department||'All departments'},
      setSource(source){dataSourceFilter=source;go('data')},
      totals(){return {summary:Data.summary(scoped()),achievement:overall(scoped())}}};`);
  return {dom,w:dom.window,d:dom.window.document,s:dom.window.check};
}

test('seed links and period totals reconcile and metadata completion preserves saved work',()=>{
  const {dom,w,s}=workspace();
  try{
    assert.equal(s.workspaceIntegrity().length,0);
    assert.equal(s.totals().summary.total,8);
    assert.equal(s.totals().summary.green,4);
    assert.equal(s.totals().summary.amber,3);
    assert.equal(s.totals().summary.red,1);
    assert.ok(Math.abs(s.totals().achievement-95.80913714560207)<1e-10);
    assert.ok(s.goals.every(g=>g.department&&s.strategicGoals.some(p=>p.id===g.strategicGoalId)));
    assert.ok(s.actions.every(a=>a.trigger&&['amber','red'].includes(a.trigger.status)&&a.status==='Open'&&a.approvalStatus==='Draft'));
    s.actions[0].title='Preserve my edited recovery';
    s.actions[0].notes.push({text:'Saved delivery note',time:'2026-09-18T08:00:00.000Z'});
    s.appConfig.sourceProfiles[s.kpis[0].source].owner='My source owner';
    w.Data.setTarget(s.kpis[3],w.Data.latest,3,3.5);
    const before=JSON.stringify({actions:s.actions,kpis:s.kpis});
    s.persist();
    const restored=workspace(w.localStorage.getItem('itqan-demo-v1'));
    try{
      assert.equal(JSON.stringify({actions:restored.s.actions,kpis:restored.s.kpis}),before);
      assert.equal(restored.s.appConfig.sourceProfiles[s.kpis[0].source].owner,'My source owner');
      assert.equal(restored.s.workspaceIntegrity().length,0);
      assert.equal(restored.s.actions[0].trigger.target,2,'original recovery trigger remains immutable');
    }finally{restored.dom.window.close()}
  }finally{dom.window.close()}
});

test('catalogued sources without published KPIs open from search and remain access scoped',()=>{
  const {dom,d,s}=workspace();
  try{
    s.setUser('admin-1');s.addSource({name:'New source',owner:'Integration team',frequency:'Monthly'});
    s.setSource('New source');assert.match(d.querySelector('.report-grid').textContent,/New source/);
    assert.match(d.querySelector('.report-grid').textContent,/0 mapped KPIs/);
    s.setUser('owner-0');s.setSource('New source');assert.doesNotMatch(d.querySelector('.report-grid').textContent,/Integration team/);
  }finally{dom.window.close()}
});

test('integrity review exposes orphaned objects, inconsistent observations and invalid execution',()=>{
  const {dom,s}=workspace();
  try{
    s.goals[0].strategicGoalId='missing';
    s.kpis[1].confidences[0]='Not recorded';
    s.kpis[2].targetHistory=Array.from({length:6},()=>({target:90,amber:87}));
    s.actions[0].kpi='missing';s.actions[0].status='In progress';
    s.actions[1].milestones.push({owner:'Owner',due:'2026-02-30',done:true,evidence:''});
    s.approvals.push({id:'orphan',entity:'KPI',entityId:'missing',requesterId:'missing',status:'Department review'});
    const messages=s.workspaceIntegrity().map(i=>i.message).join('\n');
    for(const pattern of [/Strategic goal is missing/,/Confidence does not match/,/Current target differs/,/link is missing/,/without an approved plan/,/Milestone needs/,/Linked record is missing/,/Requesting account is missing/])assert.match(messages,pattern);
  }finally{dom.window.close()}
});

test('recovery validation rejects invalid parent and deadline; approvals reject changed department',()=>{
  const {dom,s}=workspace();
  try{
    const a=s.actions[0];a.due='2026-02-30';assert.ok(s.planGaps(a).includes('due date'));
    a.kpi='missing';assert.ok(s.planGaps(a).includes('published KPI'));
    s.setUser('owner-0');const k=s.kpis[0];const r=s.submitRequest('Target change','KPI',k,{period:5,target:6,amber:7},'Review target');
    k.dept='Digital Services';s.setUser('lead-0');
    assert.throws(()=>s.decideRequest(r.id,'Approve','Reviewed'),/department has changed/);
    s.decideRequest(r.id,'Reject','Return for corrected routing');assert.equal(r.status,'Rejected');
  }finally{dom.window.close()}
});

test('new KPI has no fabricated baseline and source names resolve to the existing catalogue',()=>{
  const {dom,w,d,s}=workspace();
  try{
    s.setUser('owner-0');s.go('kpi');d.querySelector('#new-kpi').click();
    const values={name:'New safety measure',owner:'Owner',source:s.kpis[0].source.toLowerCase(),definition:'Monthly measure',formula:'Source value',target:'90',amber:'80',goal:'0',dept:'Public Safety',unit:'%',type:'Lagging',dir:'higher'};
    for(const [key,value] of Object.entries(values))d.querySelector('#reg-'+key).value=value;
    d.querySelector('#register-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
    const k=s.kpis.at(-1);assert.equal(k.name,'New safety measure');assert.equal(k.baseline,null);assert.equal(k.source,s.kpis[0].source);
    assert.ok(k.history.every(v=>v===null));assert.equal(s.workspaceIntegrity().length,0);
  }finally{dom.window.close()}
});
