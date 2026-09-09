// Real UI actions in isolated contexts; never touches the user's normal profile.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const { chromium }=require(process.env.PLAYWRIGHT_MODULE || '/Users/skyris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.QA_URL || 'http://127.0.0.1:4173/compliance-training-agent/';
const output=process.env.QA_OUTPUT || '/tmp/training-room-respect-qa';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const progress=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('compliance_training_progress')||'{}')['labor-compliance']);
const frameOf=async page=>{await page.locator('iframe').waitFor();const f=page.frameLocator('iframe');await f.locator('#office-view').waitFor({state:'attached'});await page.getByText('正在载入微课并恢复学习进度…').waitFor({state:'hidden'});return f;};
const waitCount=(page,n)=>page.waitForFunction(n=>JSON.parse(localStorage.getItem('compliance_training_progress'))['labor-compliance'].respect_learning.microcourse?.completedStories.length===n,n);
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},hasTouch:width===390});
  const page=await context.newPage();page.setDefaultTimeout(12000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try {
   await page.goto(`${base}#/course/labor-compliance/quiz`);await page.waitForURL('**/lesson/lc-1');
   await page.goto(`${base}#/course/labor-compliance/lesson/lc-2`);await page.waitForURL('**/lesson/lc-1');
   await page.getByRole('button',{name:'已读完，下一课',exact:true}).click();
   assert.equal((await progress(page)).progress,25);
   await page.reload();await page.getByRole('button',{name:'文字已学完，进入互动微课',exact:true}).click();
   let f=await frameOf(page);await waitCount(page,0);assert.equal((await progress(page)).progress,50);
   assert.equal(await f.locator('.story-row[data-story="opportunity"]').isDisabled(),true);
   await page.screenshot({path:`${output}/${width}-entry.png`,fullPage:true});
   console.log(`${width}: text confirmations, guards, entry and locks passed`);
   for(const [i,[id,lines]] of [['joke',6],['opportunity',8],['support',9]].entries()) {
    if(i===0) await f.locator(`.story-row[data-story="${id}"]`).click();
    for(let line=0;line<lines;line++) {
     await f.locator('#next').click();
     if(i===0 && line===1) { await page.reload();f=await frameOf(page);assert.equal(await f.locator('#line-count').innerText(),'2 / 6 句'); }
    }
    await f.locator('#next').click();await f.locator('#choice-panel').waitFor();
    await f.locator('[data-choice="dismiss"]').click();assert.equal((await progress(page)).passed,false);
    await f.locator('#feedback-primary').click();await f.locator('#choice-panel').waitFor();
    await f.locator('[data-choice="support"]').click();await waitCount(page,i);
    if(i===0) {
     await page.reload();f=await frameOf(page);await f.locator('#feedback-panel').waitFor();await waitCount(page,0);
     // Fail child persistence: confirmation must stay retryable and not unlock.
     await f.locator('body').evaluate(()=>{window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='training-room-respect-game-v1')throw new Error('QA quota');return window.__originalSet.call(this,k,v);};});
     await f.locator('#feedback-primary').click();await page.getByRole('alert').waitFor();await waitCount(page,0);
     await f.locator('body').evaluate(()=>{Storage.prototype.setItem=window.__originalSet;});
    }
    await f.locator('#feedback-primary').click();await waitCount(page,i+1);await f.locator('#takeaway-panel').waitFor();
    assert.equal((await progress(page)).passed,i===2);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.equal(await f.locator('html').evaluate(el=>el.scrollWidth>innerWidth),false);
    await page.screenshot({path:`${output}/${width}-${id}.png`,fullPage:true});
    console.log(`${width}: ${id} wrong/accepted/confirmed completion and overflow passed`);
    if(i<2) await f.locator('#next-story').click();
   }
   await page.getByText('文字与互动微课均已完成，进度已保存。可继续重温。').waitFor();
   await page.reload();f=await frameOf(page);assert.equal((await progress(page)).passed,true);
   await f.locator('#replay').click();assert.equal((await progress(page)).passed,true);
   await page.getByRole('button',{name:'课程目录',exact:true}).click();await page.getByText('已通过',{exact:true}).waitFor();
   assert.equal(await page.getByRole('button',{name:'重新测验',exact:true}).count(),0);
   await page.getByRole('button',{name:'返回首页',exact:true}).click();await page.locator('.training-dashboard').waitFor();
   assert.deepEqual(errors,[]);console.log(`${width}: completion survives refresh/replay, directory and dashboard passed`);
  } catch(e) {
   await page.screenshot({path:`${output}/${width}-failure.png`,fullPage:true});
   console.error('Page',page.url(),await page.locator('body').innerText());
   console.error('Frame',await page.frameLocator('iframe').locator('body').innerText().catch(()=>''));throw e;
  } finally {await context.close();}
 }
 // Legacy scores stay history; a saved quiz cannot bypass the new microcourse.
 const context=await browser.newContext();const page=await context.newPage();await page.goto(base);
 await page.evaluate(()=>{localStorage.setItem('compliance_training_progress_data_security_merged','1');localStorage.setItem('compliance_training_progress',JSON.stringify({'labor-compliance':{id:'legacy',user_id:'default',course_id:'labor-compliance',status:'completed',progress:100,passed:true,score:80,lesson_id:'lc-2',started_at:null,completed_at:'2026-09-01T00:00:00Z'}}));});
 await page.goto(`${base}#/course/labor-compliance`);await page.getByText(/历史成绩 80 分/).waitFor();
 await page.getByRole('button',{name:'进入互动微课',exact:true}).click();await frameOf(page);await waitCount(page,0);
 assert.equal((await progress(page)).passed,false);assert.equal((await progress(page)).respect_learning.legacy.score,80);
 // Malformed child record is not erased by the initial render; restoring it and
 // reloading allows sync without losing the host's text/legacy record.
 await page.evaluate(()=>localStorage.setItem('training-room-respect-game-v1','{broken'));
 await page.reload();await page.getByRole('alert').waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('training-room-respect-game-v1')),'{broken');
 assert.equal((await progress(page)).passed,false);
 await page.evaluate(()=>localStorage.removeItem('training-room-respect-game-v1'));
 await page.getByRole('button',{name:'重新载入并同步',exact:true}).click();await frameOf(page);await waitCount(page,0);
 await page.getByRole('alert').waitFor({state:'hidden'});
 // Host persistence may fail even when child persistence works. Resync retries
 // only saved child progress and does not require repeating the scenario.
 await page.evaluate(()=>{window.__hostSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compliance_training_progress')throw new Error('QA host quota');return window.__hostSet.call(this,k,v);};});
 await page.getByRole('button',{name:'课程目录',exact:true}).click();
 await page.getByRole('button',{name:'进入互动微课',exact:true}).click();
 await page.getByRole('alert').waitFor();
 await page.evaluate(()=>{Storage.prototype.setItem=window.__hostSet;});
 await page.getByRole('button',{name:'重新载入并同步',exact:true}).click();await frameOf(page);
 await page.getByRole('alert').waitFor({state:'hidden'});
 await context.close();console.log('Legacy migration passed');
} finally {await browser.close();}
