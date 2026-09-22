const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');

function workspace(){
  const dom=new JSDOM('<div id="app"></div><div id="overlay"></div><div id="toast"></div>',{url:'http://localhost/#/dashboard',runScripts:'outside-only'});
  const w=dom.window;w.localStorage.setItem('itqan-auth','true');w.localStorage.setItem('itqan-language','ar');
  w.eval(['src/domain/performance.js','src/features/workspace.js','src/app.js'].map(file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8')).join('\n')+`
    window.localeTest={go,register,detail,actionDetail,localizeUI,localizeText,ask,workspaceSearch,recoveryCount,appConfig,kpis,actions,adminSections,
      admin(tab){currentUserId='admin-1';adminTab=tab;go('admin')},
      user(id){currentUserId=id;department=currentUser().department||'All departments'},
      model(){return JSON.stringify({kpis,actions,users,goals,approvals})}};`);
  return {dom,w,d:w.document,s:w.localeTest};
}

test('Arabic navigation, reporting labels and filters preserve canonical option values',()=>{
  const {dom,d,s}=workspace();
  try{
    for(const page of ['dashboard','strategy','kpi','data','ai','impact','actions','reports','approvals','audit']){
      s.go(page);assert.equal(d.documentElement.lang,'ar');assert.equal(d.documentElement.dir,'rtl');
      if(page!=='ai')assert.match(d.querySelector('h1').textContent,/[\u0600-\u06ff]/);
    }
    s.go('dashboard');const periods=[...d.querySelector('#period').options];assert.equal(periods[5].value,'5');assert.match(periods[5].textContent,/سبتمبر/);
    const dept=[...d.querySelector('#department').options].find(o=>o.value==='Digital Services');assert.equal(dept.textContent,'الخدمات الرقمية');
    s.go('kpi');const filter=[...d.querySelectorAll('select option')].find(o=>o.value==='Off track');assert.ok(filter);assert.equal(filter.textContent,'خارج المسار');
    const select=filter.parentElement;select.value='Off track';select.dispatchEvent(new dom.window.Event('change'));assert.ok(d.querySelector('#kpi-results [data-kpi="KPI-SRV-002"]'));
  }finally{dom.window.close()}
});

test('Arabic admin sections, source names and dynamic guidance are fully translated',async()=>{
  const {dom,w,d,s}=workspace();
  try{
    for(const [tab] of s.adminSections){s.admin(tab);assert.match(d.querySelector('.admin-section h2').textContent,/[\u0600-\u06ff]/)}
    s.admin('sources');assert.match(d.querySelector('.admin-section').textContent,/الأنظمة المصدرية/);assert.doesNotMatch(d.querySelector('.admin-section').textContent,/Create source systems|Expected refresh|Save source configuration/);
    const cadence=d.querySelector('[name="frequency"]');assert.equal(cadence.options[0].value,'Daily');assert.equal(cadence.options[0].textContent,'يومياً');
    s.admin('scoring');assert.doesNotMatch(d.querySelector('.admin-section').textContent,/These boundaries|Aggregate Green/);
    const message=d.querySelector('#config-error');message.textContent='Select a valid department.';await new Promise(resolve=>w.setTimeout(resolve,0));assert.equal(message.textContent,'اختر إدارة صالحة.');
    s.appConfig.recoveryPeriods=3;assert.equal(s.recoveryCount(),'٣');
    assert.match(s.localizeText('2026-09-14'),/سبتمبر/);
    assert.doesNotMatch(s.localizeText('2026-09-14'),/[0-9]/);
  }finally{dom.window.close()}
});

test('Arabic Ask IQ searches translated records and supports Arabic approval and help requests',()=>{
  const {dom,d,s}=workspace();
  try{
    s.go('ai');s.ask('موافقات');assert.match(d.querySelector('#chat').textContent,/الموافقات/);assert.doesNotMatch(d.querySelector('#chat').textContent,/Department review precedes/);
    s.ask('مساعدة');assert.match(d.querySelector('#chat').textContent,/كيف ترتبط/);
    const results=s.workspaceSearch('تعزيز سلامة المجتمع');assert.ok(results.some(r=>r.kind==='Objective'&&r.value===0));
    s.ask('KPI-SRV-002');assert.equal(d.querySelector('#chat [data-kpi]').getAttribute('data-kpi'),'KPI-SRV-002');
  }finally{dom.window.close()}
});

test('language switching preserves records and Arabic forms preserve numeric values and source IDs',()=>{
  const {dom,w,d,s}=workspace();
  try{
    const before=s.model();s.detail('KPI-SRV-002');assert.equal(d.querySelector('#target-value').value,'2');assert.match(d.querySelector('.drawer').textContent,/منصة إدارة الخدمات/);assert.ok(d.querySelector('[data-kpi="KPI-SRV-002"]'));
    d.querySelector('#close-modal').click();d.querySelector('#language').click();assert.equal(d.documentElement.dir,'ltr');assert.equal(w.localStorage.getItem('itqan-language'),'en');
    assert.equal(s.model(),before);assert.ok([...d.querySelector('#department').options].some(o=>o.textContent==='Digital Services'));
    d.querySelector('#language').click();assert.equal(w.localStorage.getItem('itqan-language'),'ar');assert.equal(s.model(),before);
    s.user('owner-0');s.register();assert.equal(d.querySelector('#reg-unit').options[1].value,'days');assert.equal(d.querySelector('#reg-unit').options[1].textContent,'أيام');assert.equal(d.querySelector('#reg-dir').value,'higher');
  }finally{dom.window.close()}
});
