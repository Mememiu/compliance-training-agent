import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/skyris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.QA_URL || 'http://127.0.0.1:4173/compliance-training-agent/';
const out='/tmp/training-room-cool-theme';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const color=(p,s,key)=>p.locator(s).first().evaluate((el,key)=>getComputedStyle(el)[key],key);
const ratio=(a,b)=>{const luminance=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},hasTouch:width===390});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base);await p.locator('.training-dashboard').waitFor();
  await p.evaluate(()=>document.fonts.ready);
  // Let the existing entrance animation finish; never disable it for the preview.
  await p.waitForTimeout(1800);
  assert.equal(await color(p,'.app-header','backgroundColor'),'rgb(245, 247, 252)');
  assert.equal(await color(p,'.training-dashboard','backgroundColor'),'rgb(245, 247, 252)');
  assert.equal(await p.locator('.app-topnav__item.is-active').evaluate(el=>getComputedStyle(el,'::after').backgroundColor),'rgb(79, 70, 229)');
  assert.ok(ratio(await color(p,'.training-action--primary','color'),await color(p,'.training-action--primary','backgroundColor'))>=4.5);
  await p.screenshot({path:`${out}/${width}-home.png`,fullPage:true});
  await p.evaluate(()=>{localStorage.setItem('compliance_training_progress_data_security_merged','1');localStorage.setItem('compliance_training_progress',JSON.stringify({'anti-corruption':{id:'qa',user_id:'default',course_id:'anti-corruption',lesson_id:'ac-3',status:'in_progress',progress:50,score:null,passed:false,started_at:null,completed_at:null,integrity_learning:{version:1,completedLessonIds:['ac-1','ac-2','ac-3'],microcourseCompletedAt:null}}}));});
  await p.goto(`${base}#/course/anti-corruption/microcourse`);await p.locator('iframe').waitFor();await p.frameLocator('iframe').locator('#case-title').waitFor();
  const header=await p.locator('.app-header').boundingBox(), nav=await p.locator('.app-topnav').boundingBox();
  if(width>640) {assert.ok(header.height<=72);assert.ok(Math.abs(nav.x+nav.width/2-width/2)<2);}
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await p.frameLocator('iframe').locator('html').evaluate(el=>el.scrollWidth>innerWidth),false);
  await p.screenshot({path:`${out}/${width}-microcourse.png`,fullPage:true});
  await p.getByRole('button',{name:'课程目录',exact:true}).click();await p.screenshot({path:`${out}/${width}-directory.png`,fullPage:true});
  await p.getByRole('button',{name:'AI 学习助手',exact:true}).click();await p.screenshot({path:`${out}/${width}-chat.png`,fullPage:true});
  await p.evaluate(()=>document.documentElement.classList.add('dark'));
  await p.waitForTimeout(400);
  assert.ok(ratio(await color(p,'.app-header','color'),await color(p,'.app-header','backgroundColor'))>=4.5);
  await p.screenshot({path:`${out}/${width}-dark.png`,fullPage:true});
  assert.deepEqual(errors,[]);console.log(`${width}: shared canvas, accent, CTA contrast, compact centered header, overflow and dark text passed`);await context.close();
 }
} finally {await browser.close();}
