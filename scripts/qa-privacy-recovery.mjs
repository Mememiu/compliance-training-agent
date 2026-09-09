// Destructive fixtures live ONLY in fresh isolated browser contexts.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/skyris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const base=process.env.QA_URL || 'http://127.0.0.1:5173/compliance-training-agent/';
const ids=['dp-1','dp-2','dp-3','is-1','is-2','is-3'];
const empty={id:'default_data-privacy',user_id:'default',course_id:'data-privacy',lesson_id:null,status:'not_started',progress:0,score:null,passed:false,started_at:null,completed_at:null};
async function run(name, action) {
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage(); page.setDefaultTimeout(10000);
 try {await action(page,context); console.log(`${name}: passed`);} finally {await context.close();}
}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('compliance_training_progress') || '{}')['data-privacy']);
try {
 await run('text save failure stays in lesson; retry saves normally',async page=>{
  await page.goto(`${base}#/course/data-privacy/lesson/dp-1`);
  await page.getByRole('button',{name:'已读完，下一课',exact:true}).waitFor();
  await page.evaluate(()=>{window.qaOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='compliance_training_progress')throw new Error('测试：存储暂不可用');return window.qaOriginalSetItem.call(this,key,value);};});
  await page.getByRole('button',{name:'已读完，下一课',exact:true}).click();
  await page.getByRole('alert').waitFor(); assert.match(page.url(),/lesson\/dp-1$/); assert.equal(await saved(page),undefined);
  await page.evaluate(()=>{Storage.prototype.setItem=window.qaOriginalSetItem;});
  await page.getByRole('button',{name:'已读完，下一课',exact:true}).click();await page.waitForURL('**/lesson/dp-2');
  await page.reload(); assert.equal((await saved(page)).privacy_learning.completedLessonIds.length,1);
 });
 await run('legacy completion keeps score as history but unlocks only microcourse',async(page,context)=>{
  await context.addInitScript(p=>{if(!localStorage.getItem('qa-seeded')){localStorage.setItem('compliance_training_progress_data_security_merged','1');localStorage.setItem('compliance_training_progress',JSON.stringify({'data-privacy':p}));localStorage.setItem('qa-seeded','1');}},{...empty,status:'completed',progress:100,passed:true,score:90,completed_at:'2026-09-01T00:00:00Z'});
  await page.goto(`${base}#/course/data-privacy`);
  await page.getByText(/历史成绩 90 分/).waitFor(); assert.equal(await page.getByText('已通过',{exact:true}).count(),0);
  await page.getByRole('button',{name:'进入互动微课',exact:true}).click(); await page.locator('iframe').waitFor();
  await page.getByText('正在载入微课并恢复学习进度…').waitFor({state:'hidden'});
  const p=await saved(page); assert.equal(p.passed,false); assert.equal(p.progress,50);assert.equal(p.privacy_learning.legacy.score,90);
 });
 await run('host storage failure shows error and resync recovers; forged message ignored',async(page,context)=>{
  await context.addInitScript(p=>{if(!localStorage.getItem('qa-seeded')){localStorage.setItem('compliance_training_progress_data_security_merged','1');localStorage.setItem('compliance_training_progress',JSON.stringify({'data-privacy':p}));localStorage.setItem('qa-seeded','1');}},{...empty,status:'in_progress',progress:50,privacy_learning:{version:1,completedLessonIds:ids,microcourseCompletedAt:null}});
  await page.goto(`${base}#/course/data-privacy`);
  await page.evaluate(()=>{window.qaOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='compliance_training_progress')throw new Error('测试：保存失败');return window.qaOriginalSetItem.call(this,key,value);};});
  await page.getByRole('button',{name:'进入互动微课',exact:true}).click();await page.getByRole('alert').waitFor(); assert.equal((await saved(page)).passed,false);
  await page.evaluate(()=>{Storage.prototype.setItem=window.qaOriginalSetItem;window.postMessage({channel:'training-room/privacy-v1',type:'state',token:'fake',snapshot:{completed:true}},location.origin);});
  assert.equal((await saved(page)).passed,false);
  await page.getByRole('button',{name:'重新载入并同步',exact:true}).click();await page.getByRole('alert').waitFor({state:'hidden'});
  await page.getByText('正在载入微课并恢复学习进度…').waitFor({state:'hidden'});assert.equal((await saved(page)).progress,50);
 });
 await run('earned completion survives in-game reset and reloaded course progress',async(page,context)=>{
  await context.addInitScript(p=>{localStorage.setItem('compliance_training_progress_data_security_merged','1');if(!localStorage.getItem('compliance_training_progress')){
   localStorage.setItem('compliance_training_progress',JSON.stringify({'data-privacy':p}));
   localStorage.setItem('training-room-privacy-game-v1',JSON.stringify({version:3,foundHazards:{finance:['salary-screen','expense-documents','tax-drawer']},activeOfficeId:'finance'}));
   localStorage.setItem('training-room-privacy-checkpoints-v1',JSON.stringify(['finance']));
  }},{...empty,status:'completed',progress:100,passed:true,privacy_learning:{version:1,completedLessonIds:ids,microcourseCompletedAt:'2026-09-08T00:00:00Z'}});
  await page.goto(`${base}#/course/data-privacy/microcourse`);await page.locator('iframe').waitFor();const frame=page.frameLocator('iframe');
  await frame.getByRole('button',{name:'进入公司',exact:false}).click();await frame.locator('[data-reset-progress]').click();
  await frame.getByRole('button',{name:'再按一次确认重置',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('training-room-privacy-checkpoints-v1'))),[]);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('training-room-privacy-game-v1')).completedOffices.length),0);
  assert.equal((await saved(page)).passed,true); await page.reload();await page.getByText('本模块已完成',{exact:true}).waitFor();
 });
 await run('other courses keep independent quizzes',async page=>{
  for(const id of ['anti-corruption']) {
   await page.goto(`${base}#/course/${id}`); await page.getByText('课程考核',{exact:true}).waitFor();
   await page.getByRole('button',{name:'开始测验',exact:true}).click();await page.waitForURL(`**/${id}/quiz`);
   await page.getByRole('radio').first().waitFor();assert.equal(await page.locator('iframe').count(),0);
   for(const group of await page.locator('.quiz-question').all()) await group.locator('label').first().click();
   await page.getByRole('button',{name:/提交/}).click();await page.getByText(/恭喜通过！|未通过，请继续努力/).waitFor();
   assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('compliance_training_progress'))[id].status,id),'completed');
  }
 });
 await run('corrupt stored JSON is reported and never overwritten',async(page,context)=>{
  await context.addInitScript(()=>{localStorage.setItem('compliance_training_progress','{broken');});
  await page.goto(`${base}#/course/data-privacy`);await page.getByRole('alert').waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('compliance_training_progress')),'{broken');
 });
} finally {await browser.close();}
