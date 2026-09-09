import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {JSDOM,VirtualConsole} from 'jsdom';
import {stories,cast,legal} from '../src/data/integrity-stories.mjs';
import {scenes} from '../src/data/integrity-scenes.mjs';

const path=new URL('../public/microcourses/integrity-preview/index.html',import.meta.url);
const html=await readFile(path,'utf8');
const storageKey='duoting-integrity-v1-progress';
function session(store?:Map<string,string>, failWrite=false){
  const errors:Error[]=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',(e:Error)=>errors.push(e));
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'file:///offline-course.html',virtualConsole,beforeParse(window){
    if(store)Object.defineProperty(window,'localStorage',{value:{
      getItem:(key:string)=>store.get(key)??null,
      setItem:(key:string,value:string)=>{if(failWrite)throw Error('quota');store.set(key,value);},
      removeItem:(key:string)=>store.delete(key),
    }});
    window.confirm=()=>false;
  }});
  const d=dom.window.document;
  const query=(s:string)=>d.querySelector(s) as HTMLButtonElement;
  const click=(action:string,value?:string|number)=>{
    const el=query(`[data-action="${action}"]${value===undefined?'':`[data-value="${value}"]`}`);
    assert(el,`Missing ${action}:${value}`);el.click();
  };
  const spoof=(action:string,value?:string|number)=>{
    const el=d.createElement('button');el.dataset.action=action;
    if(value!==undefined)el.dataset.value=String(value);
    d.body.append(el);el.click();el.remove();
  };
  const toDecision=(n:number)=>{
    for(let line=0;line<stories[n].lines.length;line++)click('next-line');
    click('records');
    assert(query('[data-action="decide"]').disabled);
    for(let record=0;record<4;record++)click('check-record',record);
    click('decide');
  };
  const finish=()=>{click('reflect');click('complete');};
  const close=()=>{assert.deepEqual(errors,[]);dom.window.close();};
  return{dom,d,query,click,spoof,toDecision,finish,close};
}

test('three source lessons have complete roles, evidence and distinct assets',()=>{
  assert.deepEqual(stories.map(s=>s.lessonId),['ac-1','ac-2','ac-3']);
  assert.deepEqual(stories.map(s=>s.id),['fees','conflict','gifts']);
  for(const s of stories){
    assert(s.lines.length>=9);assert.equal(s.choices.length,3);
    const keys=new Set(cast[s.id].map(p=>p[0]));
    for(const line of s.lines){assert(keys.has(line[0]));assert(line[1]&&line[2]);}
    assert(keys.has(s.responder));assert(legal[s.legal]);
    assert.equal(s.evidence.items.length,4);
    assert.equal(s.choices.filter(([key])=>s.feedback[key].accepted).length,2);
    for(const h of scenes[s.id].hotspots){
      assert(keys.has(h.role));assert(h.x>=0&&h.y>=0);
      assert(h.w>0&&h.h>0&&h.x+h.w<=100&&h.y+h.h<=100);
    }
  }
  assert(stories[2].opening.includes('电话另一端'));
});

test('UTF-8 offline document, fresh template, valid scripts and verified art provenance',async()=>{
  assert.match(html,/<meta charset="utf-8">/);
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,2);scripts.forEach(s=>new vm.Script(s[1]));
  assert(!/\/\* INLINE_|__ASSET_|postMessage\(|fetch\(/.test(html));
  assert(!/<(?:script|img|link)\b[^>]*(?:src|href)="https?:/i.test(html));
  for(const stale of ['尊重有界','林悦','isUnlocked','loose-sketch'])assert(!html.includes(stale));
  assert(html.includes('integrity-source-art-20260909'));
  const css=await readFile(new URL('../src/integrity/course.css',import.meta.url),'utf8');
  assert(css.includes('object-fit:contain'));
  assert(!/object-fit\s*:\s*cover|overflow\s*:\s*hidden|clip-path\s*:/.test(css));
  for(const id of ['fees','gifts','conflict','reflection']){
    const dir=new URL('../public/microcourses/integrity-preview/assets/',import.meta.url);
    const meta=JSON.parse(await readFile(new URL(`${id}.webp.provenance.json`,dir),'utf8'));
    const file=await readFile(new URL(`${id}.webp`,dir));
    assert.equal(createHash('sha256').update(file).digest('hex'),meta.sha256);
    if(id!=='reflection')assert.deepEqual(meta.dimensions,[scenes[id].width,scenes[id].height]);
    if(meta.crop){assert(meta.crop.left+meta.crop.width<=meta.sourceDimensions[0]);assert(meta.crop.top+meta.crop.height<=meta.sourceDimensions[1]);}
  }
});

test('no navigation, hotspot or forged action can skip unread dialogue and records',()=>{
  const s=session();
  assert(s.query('[data-action="open-case"][data-value="1"]').disabled);
  const title=s.d.getElementById('case-title')!.textContent;
  for(const action of ['records','decide','reflect','complete','next-case','summary'])s.spoof(action);
  s.spoof('open-case',2);s.spoof('choose','direct');
  assert.equal(s.d.getElementById('case-title')!.textContent,title);
  assert(s.query('[data-action="next-line"]'));
  s.query('[data-actor="speaker"]').click();
  assert(!s.d.querySelector('.line-count'));
  s.query('[data-actor="colleague"]').click();
  assert.equal(s.d.querySelector('.line-count')!.textContent,'1 / 9 句');
  s.query('[data-actor="speaker"]').click();
  assert.equal(s.d.querySelector('.line-count')!.textContent,'2 / 9 句');
  for(let i=2;i<9;i++)s.click('next-line');
  assert(!s.d.querySelector('[data-action="choose"]'));
  s.click('records');s.spoof('decide');
  assert(!s.d.querySelector('[data-action="choose"]'));
  s.click('check-record',0);s.click('check-record',0); // toggle works
  for(let i=0;i<3;i++)s.click('check-record',i);
  s.spoof('decide');assert(s.query('[data-action="decide"]').disabled);
  s.click('check-record',3);s.click('decide');
  assert.equal(s.d.querySelectorAll('[data-action="choose"]').length,3);
  assert.equal(s.d.querySelectorAll('#transcript-lines li').length,9);
  s.close();
});

for(let n=0;n<3;n++)for(const key of ['dismiss','direct','support'])test(`case ${n+1}: ${key} has guarded feedback and completion`,()=>{
  const s=session();
  for(let previous=0;previous<n;previous++){s.toDecision(previous);s.click('choose','direct');s.finish();s.click('next-case');}
  s.toDecision(n);
  if(n>0){assert(s.query('[data-action="open-case"][data-value="0"]').disabled);assert(s.query('[data-action="open-case"][data-value="0"]').textContent!.includes('本段结束后回看'));s.spoof('open-case',0);assert.equal(s.d.getElementById('case-title')!.textContent,stories[n].title);}
  if(n===0)assert(!s.d.getElementById('scene-image')!.getAttribute('alt')!.includes('拒绝'));
  s.click('choose',key);
  assert(s.d.getElementById('panel')!.textContent!.includes(stories[n].feedback[key].title));
  s.spoof('complete');assert.equal(Number(s.d.querySelector('progress')!.value),n);
  if(key==='dismiss'){
    s.spoof('reflect');s.spoof('next-case');
    assert(s.query('[data-action="retry"]'));
    if(n===0)assert(!s.d.getElementById('scene-image')!.getAttribute('alt')!.includes('拒绝'));
    s.click('retry');s.click('choose','direct');
  }
  if(n===0)assert(s.d.getElementById('scene-image')!.getAttribute('alt')!.includes('拒绝'));
  s.click('reflect');assert.equal(Number(s.d.querySelector('progress')!.value),n);
  s.click('complete');assert.equal(Number(s.d.querySelector('progress')!.value),n+1);
  s.spoof('complete');assert.equal(Number(s.d.querySelector('progress')!.value),n+1);
  if(n<2)assert(!s.query(`[data-action="open-case"][data-value="${n+1}"]`).disabled);
  else {s.click('summary');assert(!s.d.getElementById('completion')!.hidden);assert.equal(s.d.querySelectorAll('#learning-receipt article').length,3);s.click('review-course');assert.equal(s.d.getElementById('case-title')!.textContent,stories[0].title);s.click('replay');assert(s.query('[data-action="next-line"]'));assert.equal(Number(s.d.querySelector('progress')!.value),3);}
  s.close();
});

test('blocked local storage degrades to session-only learning without crashing',()=>{
  const s=session();s.toDecision(0);s.click('choose','direct');s.finish();
  assert(s.d.getElementById('save-status')!.textContent!.includes('无法保存'));
  const fresh=session();assert.equal(fresh.d.querySelector('progress')!.value,0);fresh.close();s.close();
});

test('every phase, record selection, feedback, completion and replay survives reopening',()=>{
  const store=new Map<string,string>();
  const s=session(store);
  const checkReload=()=>{
    const before=store.get(storageKey);
    const r=session(new Map(store));
    assert(!r.d.getElementById('resume-prompt')!.hidden);
    assert(r.d.getElementById('workspace')!.hidden);
    r.spoof('complete');r.spoof('next-line');r.spoof('open-case',2);
    assert(r.d.getElementById('workspace')!.hidden);
    r.click('resume-course');
    assert.equal(r.d.getElementById('panel')!.textContent,s.d.getElementById('panel')!.textContent);
    assert.equal(r.d.querySelector('progress')!.value,s.d.querySelector('progress')!.value);
    assert.equal(store.get(storageKey),before);
    r.close();
  };
  for(let n=0;n<3;n++){
    for(let l=0;l<stories[n].lines.length;l++){s.click('next-line');checkReload();}
    s.click('records');checkReload();
    for(let r=0;r<4;r++){s.click('check-record',r);checkReload();}
    s.click('decide');checkReload();s.click('choose','dismiss');checkReload();
    s.click('retry');checkReload();s.click('choose','direct');checkReload();
    s.click('reflect');checkReload();s.click('complete');checkReload();
    if(n<2){s.click('next-case');checkReload();}
  }
  s.click('summary');
  const r=session(new Map(store));r.click('resume-course');
  assert(!r.d.getElementById('completion')!.hidden);r.close();
  s.click('review-course');s.click('replay');checkReload();
  assert.equal(s.d.querySelector('progress')!.value,3);s.close();
});

test('restart requires confirmation, removes only this course and persists reset',()=>{
  const store=new Map([['other-course','untouched']]);
  const s=session(store);s.click('next-line');s.close();
  const r=session(store),before=store.get(storageKey);
  r.click('restart-course');assert.equal(store.get(storageKey),before);
  assert(!r.d.getElementById('resume-prompt')!.hidden);
  r.dom.window.confirm=()=>true;r.click('restart-course');
  assert(r.d.getElementById('resume-prompt')!.hidden);
  assert.equal(r.d.querySelector('progress')!.value,0);
  assert.equal(store.get('other-course'),'untouched');r.close();
  const fresh=session(store);assert(fresh.d.getElementById('resume-prompt')!.hidden);
  fresh.click('next-line');assert.equal(fresh.d.querySelector('.line-count')!.textContent,'1 / 9 句');fresh.close();
});

test('corrupt, incompatible and inconsistent saves safely restart with an explanation',()=>{
  const store=new Map<string,string>(), s=session(store);s.click('next-line');s.close();
  const valid=JSON.parse(store.get(storageKey)!);
  const invalid=['{','null',JSON.stringify({...valid,version:999}),JSON.stringify({...valid,index:2}),JSON.stringify({...valid,summary:true})];
  for(const mutate of [
    (p:any)=>p.line=99,(p:any)=>p.phase='done',(p:any)=>p.checked=[0,0],
    (p:any)=>{p.phase='reflect';p.line=8;p.checked=[0,1,2,3];p.choice='dismiss';},
  ]){const v=structuredClone(valid);mutate(v.progress[0]);invalid.push(JSON.stringify(v));}
  for(const raw of invalid){
    const r=session(new Map([[storageKey,raw]]));
    assert(r.d.getElementById('resume-prompt')!.hidden);
    assert(r.d.getElementById('save-status')!.textContent!.includes('无法读取'));
    assert(r.query('[data-action="open-case"][data-value="1"]').disabled);r.click('next-line');r.close();
  }
});

test('write failure preserves learning and existing save until confirmed restart',()=>{
  const store=new Map<string,string>(),s=session(store);s.click('next-line');s.close();
  const r=session(store,true);r.click('resume-course');r.click('next-line');
  assert.equal(r.d.querySelector('.line-count')!.textContent,'2 / 9 句');
  assert(r.d.getElementById('save-status')!.textContent!.includes('无法保存'));
  r.dom.window.confirm=()=>true;r.click('restart-course');
  assert(!store.has(storageKey));r.click('next-line');r.close();
});
