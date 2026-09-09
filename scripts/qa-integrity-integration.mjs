// Isolated browser profiles only: never changes the user's stored learning records.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/skyris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.QA_URL || 'http://127.0.0.1:4173/compliance-training-agent/';
const output=process.env.QA_OUTPUT || '/tmp/training-room-integrity-qa';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const progress=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('compliance_training_progress')||'{}')['anti-corruption']);
const frameOf=async p=>{await p.locator('iframe').waitFor();const f=p.frameLocator('iframe');await f.locator('#workspace').waitFor({state:'attached'});await p.getByText('正在载入微课并恢复学习进度…').waitFor({state:'hidden'});return f;};
const count=(p,n)=>p.waitForFunction(n=>JSON.parse(localStorage.getItem('compliance_training_progress'))['anti-corruption'].integrity_learning.microcourse?.completedStories.length===n,n);
const action=(f,name)=>f.locator(`[data-action="${name}"]:visible`).first();
const resume=async p=>{await p.reload();const f=await frameOf(p);await action(f,'resume-course').click();return f;};
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},hasTouch:width===390});
  const p=await context.newPage();p.setDefaultTimeout(15000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  try {
   await p.goto(`${base}#/course/anti-corruption/quiz`);await p.waitForURL('**/lesson/ac-1');
   await p.goto(`${base}#/course/anti-corruption/lesson/ac-3`);await p.waitForURL('**/lesson/ac-1');
   for(const expected of [17,33]) {await p.getByRole('button',{name:'已读完，下一课',exact:true}).click();assert.equal((await progress(p)).progress,expected);}
   await p.reload();await p.getByRole('button',{name:'文字已学完，进入互动微课',exact:true}).click();
   let f=await frameOf(p);await count(p,0);assert.equal((await progress(p)).progress,50);
   assert.equal(await f.locator('[data-action="open-case"][data-value="1"]').isDisabled(),true);
   await p.screenshot({path:`${output}/${width}-entry.png`,fullPage:true});
   for(const [i,[id,lines]] of [['fees',9],['conflict',10],['gifts',10]].entries()) {
    for(let line=0;line<lines;line++) {
     await action(f,'next-line').click();
     if(i===0 && line===1) {f=await resume(p);assert.match(await f.locator('.line-count').innerText(),/2\s*\/\s*9/);}
    }
    await action(f,'records').click();assert.equal(await action(f,'decide').isDisabled(),true);
    for(let n=0;n<4;n++) {
     await f.locator(`[data-action="check-record"][data-value="${n}"]`).click();
     if(i===0&&n===1) {f=await resume(p);assert.equal(await f.locator('[data-action="check-record"][aria-pressed="true"]').count(),2);}
    }
    await action(f,'decide').click();await f.locator('[data-action="choose"][data-value="dismiss"]').click();
    await count(p,i);assert.equal((await progress(p)).passed,false);
    await action(f,'retry').click();await f.locator(`[data-action="choose"][data-value="${i===1?'direct':'support'}"]`).click();
    await count(p,i);await action(f,'reflect').click();await count(p,i);
    if(i===0) {
     f=await resume(p);await action(f,'complete').waitFor();await count(p,0);
     await f.locator('body').evaluate(()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='training-room-integrity-game-v1')throw Error('QA quota');return window.__set.call(this,k,v);};});
     await action(f,'complete').click();await p.getByRole('alert').waitFor();await count(p,0);
     assert.equal(await f.locator('[data-action="open-case"][data-value="1"]').isDisabled(),true);
     await f.locator('body').evaluate(()=>{Storage.prototype.setItem=window.__set;});
    }
    await action(f,'complete').click();await count(p,i+1);await p.getByRole('alert').waitFor({state:'hidden'});
    assert.equal((await progress(p)).passed,i===2);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.equal(await f.locator('html').evaluate(el=>el.scrollWidth>innerWidth),false);
    await p.screenshot({path:`${output}/${width}-${id}.png`,fullPage:true});
    console.log(`${width}: ${id} dialogue, records, wrong/accepted, reflection, durable completion passed`);
    if(i<2) await action(f,'next-case').click();
   }
   await p.getByText('文字与互动微课均已完成，进度已保存。可继续重温。').waitFor();
   await action(f,'summary').click();await f.locator('#completion').waitFor();f=await resume(p);
   assert.equal((await progress(p)).passed,true);await action(f,'review-course').click();await action(f,'replay').click();
   assert.equal((await progress(p)).passed,true);
   // Reset only the child's practice, never other courses or an earned host completion.
   await p.evaluate(()=>localStorage.setItem('qa-other-course','preserve'));
   p.once('dialog',d=>d.accept());await action(f,'restart-course').click();await count(p,0);
   assert.equal((await progress(p)).passed,true);assert.equal(await p.evaluate(()=>localStorage.getItem('qa-other-course')),'preserve');
   await p.getByRole('button',{name:'课程目录',exact:true}).click();await p.getByText('已通过',{exact:true}).waitFor();
   await p.getByRole('button',{name:'返回首页',exact:true}).click();await p.locator('.training-dashboard').waitFor();
   assert.deepEqual(errors,[]);console.log(`${width}: refresh, resume, replay/reset, directory, dashboard and overflow passed`);
  } catch(e) {await p.screenshot({path:`${output}/${width}-failure.png`,fullPage:true});console.error(p.url(),await p.locator('body').innerText());console.error(await p.frameLocator('iframe').locator('body').innerText().catch(()=>''));throw e;}
  finally {await context.close();}
 }
 const context=await browser.newContext();const p=await context.newPage();await p.goto(base);
 await p.evaluate(()=>{localStorage.setItem('compliance_training_progress_data_security_merged','1');localStorage.setItem('compliance_training_progress',JSON.stringify({'anti-corruption':{id:'legacy',user_id:'default',course_id:'anti-corruption',status:'completed',progress:100,passed:true,score:80,lesson_id:'ac-3',started_at:null,completed_at:'2026-09-01T00:00:00Z'}}));});
 await p.goto(`${base}#/course/anti-corruption`);await p.getByText(/历史成绩 80 分/).waitFor();
 await p.getByRole('button',{name:'进入互动微课',exact:true}).click();await frameOf(p);await count(p,0);
 assert.equal((await progress(p)).passed,false);assert.equal((await progress(p)).integrity_learning.legacy.score,80);
 await p.evaluate(()=>localStorage.setItem('training-room-integrity-game-v1','{broken'));await p.reload();await p.getByRole('alert').waitFor();
 assert.equal(await p.evaluate(()=>localStorage.getItem('training-room-integrity-game-v1')),'{broken');assert.equal((await progress(p)).passed,false);
 await p.evaluate(()=>localStorage.removeItem('training-room-integrity-game-v1'));await p.getByRole('button',{name:'重新载入并同步',exact:true}).click();await frameOf(p);await count(p,0);await p.getByRole('alert').waitFor({state:'hidden'});
 await p.evaluate(()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compliance_training_progress')throw Error('QA host quota');return window.__set.call(this,k,v);};});
 await p.getByRole('button',{name:'课程目录',exact:true}).click();await p.getByRole('button',{name:'进入互动微课',exact:true}).click();await p.getByRole('alert').waitFor();
 await p.evaluate(()=>{Storage.prototype.setItem=window.__set;});await p.getByRole('button',{name:'重新载入并同步',exact:true}).click();await frameOf(p);await p.getByRole('alert').waitFor({state:'hidden'});
 await context.close();console.log('Legacy history, corrupted child preservation and host save recovery passed');
} finally {await browser.close();}
