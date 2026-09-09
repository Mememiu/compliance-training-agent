import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';
import {stories} from '../src/data/integrity-stories.mjs';

const KEY='training-room-integrity-game-v1';
const CHANNEL='training-room/integrity-v1';
function session(store=new Map<string,string>(), blocked={read:false,write:false}) {
  const html=readFileSync(new URL('../public/microcourses/integrity/index.html',import.meta.url),'utf8')
    .replace('<script src="./bridge.js"></script>',()=>`<script>${readFileSync(new URL('../public/microcourses/integrity/bridge.js',import.meta.url),'utf8')}</script>`);
  const errors:Error[]=[],messages:any[]=[];
  const parent={postMessage:(message:any,origin:string)=>messages.push({message:JSON.parse(JSON.stringify(message)),origin})};
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',(e:Error)=>errors.push(e));
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test/microcourses/integrity/index.html',virtualConsole,beforeParse(w){
    Object.defineProperty(w,'parent',{value:parent});
    Object.defineProperty(w,'localStorage',{value:{getItem:(k:string)=>{if(blocked.read)throw Error('read');return store.get(k)??null;},setItem:(k:string,v:string)=>{if(blocked.write)throw Error('quota');store.set(k,v);},removeItem:(k:string)=>{if(blocked.write)throw Error('quota');store.delete(k);}}});
    w.confirm=()=>true;
  }});
  const d=dom.window.document;
  const click=(action:string,value?:string|number)=>{
    const el=d.querySelector(`[data-action="${action}"]${value===undefined?'':`[data-value="${value}"]`}`) as HTMLButtonElement;
    assert(el,`Missing ${action}:${value}`);el.click();
  };
  const spoof=(action:string,value?:string)=>{const el=d.createElement('button');el.dataset.action=action;if(value)el.dataset.value=value;d.body.append(el);el.click();el.remove();};
  const init=(source:any=parent,origin='https://example.test',token='mount-token')=>dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source,origin,data:{channel:CHANNEL,type:'init',token}}));
  const snapshots=()=>messages.filter(m=>m.message.type==='state').map(m=>m.message.snapshot);
  const decide=(n:number)=>{for(let i=0;i<stories[n].lines.length;i++)click('next-line');click('records');for(let i=0;i<4;i++)click('check-record',i);click('decide');};
  const finish=(n:number,choice='direct')=>{decide(n);click('choose',choice);click('reflect');click('complete');};
  const close=()=>{assert.deepEqual(errors,[]);dom.window.close();};
  return{store,blocked,messages,dom,d,click,spoof,init,snapshots,decide,finish,close};
}

test('integrity adapter authenticates init and only completes after original reflection confirmation',()=>{
  const h=session();h.init({},'https://example.test');h.init(undefined,'https://evil.test');assert.equal(h.snapshots().length,0);
  h.init();assert.deepEqual(h.snapshots().at(-1),{completedStories:[],acceptedResponses:{}});
  h.spoof('complete');h.spoof('reflect');h.spoof('choose','direct');assert.deepEqual(h.snapshots().at(-1).completedStories,[]);
  h.decide(0);h.click('choose','dismiss');h.spoof('reflect');h.spoof('complete');assert.deepEqual(h.snapshots().at(-1).completedStories,[]);
  h.click('retry');h.click('choose','direct');assert.deepEqual(h.snapshots().at(-1).completedStories,[]);
  h.click('reflect');assert.deepEqual(h.snapshots().at(-1).completedStories,[]);
  h.click('complete');assert.deepEqual(h.snapshots().at(-1),{completedStories:['fees'],acceptedResponses:{fees:'direct'}});
  assert(h.messages.every(m=>m.origin==='https://example.test'));h.close();
});

test('integrity preserves records, resume prompt, sequential completions and earned response during replay',()=>{
  const h=session();h.init();h.finish(0,'support');h.click('next-case');h.click('next-line');h.close();
  const r=session(h.store);r.init();assert.equal(r.d.getElementById('resume-prompt')!.hidden,false);r.click('resume-course');
  for(let i=1;i<stories[1].lines.length;i++)r.click('next-line');r.click('records');r.click('check-record',0);r.click('check-record',1);r.close();
  const s=session(r.store);s.init();s.click('resume-course');assert.equal(s.d.querySelectorAll('[data-action="check-record"][aria-pressed="true"]').length,2);
  s.click('check-record',2);s.click('check-record',3);s.click('decide');s.click('choose','direct');s.click('reflect');s.click('complete');s.click('next-case');s.finish(2,'support');
  assert.deepEqual(s.snapshots().at(-1),{completedStories:['fees','conflict','gifts'],acceptedResponses:{fees:'support',conflict:'direct',gifts:'support'}});
  s.click('replay');s.decide(2);s.click('choose','dismiss');assert.equal(s.snapshots().at(-1).acceptedResponses.gifts,'support');s.close();
});

test('integrity write failure cannot complete or unlock, and successful retry and init resynchronize',()=>{
  const h=session();h.init();h.decide(0);h.click('choose','direct');h.click('reflect');h.blocked.write=true;h.click('complete');
  assert.deepEqual(h.snapshots().at(-1).completedStories,[]);assert(h.d.querySelector('[data-action="complete"]'));
  assert(h.d.getElementById('save-status')!.textContent!.includes('未能保存'));
  assert(h.messages.some(m=>m.message.type==='error'&&m.message.token==='mount-token'));
  h.blocked.write=false;h.click('complete');assert.deepEqual(h.snapshots().at(-1).completedStories,['fees']);
  const before=h.snapshots().length;h.init();assert.equal(h.snapshots().length,before+1);h.close();
});

test('integrity unreadable saves survive initial render and cannot be credited until explicit reset',()=>{
  for(const saved of ['{bad',JSON.stringify({version:1,index:2,summary:true,progress:[],acceptedResponses:{}})]){
    const store=new Map([[KEY,saved],['duoting-integrity-v1-progress','untouched-preview']]);
    const h=session(store);h.init();assert.equal(store.get(KEY),saved);assert.equal(h.snapshots().length,0);h.finish(0);assert.equal(store.get(KEY),saved);assert.equal(h.snapshots().length,0);
    h.click('restart-course');assert.deepEqual(h.snapshots().at(-1),{completedStories:[],acceptedResponses:{}});assert.equal(store.get('duoting-integrity-v1-progress'),'untouched-preview');h.close();
  }
});

test('integrity read failure cannot overwrite existing earned data even when writes become available',()=>{
  const first=session();first.finish(0);first.close();const saved=first.store.get(KEY);
  const h=session(first.store,{read:true,write:false});h.init();h.blocked.read=false;h.finish(0);assert.equal(first.store.get(KEY),saved);assert.equal(h.snapshots().length,0);h.close();
});

test('integrity reset is confirmed and transactional; saved completion and preview data survive failed reset',()=>{
  const h=session(new Map([['duoting-integrity-v1-progress','separate-preview']]));h.init();h.finish(0);const saved=h.store.get(KEY);
  h.dom.window.confirm=()=>false;h.click('restart-course');assert.equal(h.store.get(KEY),saved);
  h.dom.window.confirm=()=>true;h.blocked.write=true;h.click('restart-course');assert.equal(h.store.get(KEY),saved);
  assert(h.d.querySelector('[data-action="next-case"]'));assert.deepEqual(h.snapshots().at(-1).completedStories,['fees']);
  h.blocked.write=false;h.click('restart-course');assert.deepEqual(h.snapshots().at(-1).completedStories,[]);
  assert.equal(h.store.get('duoting-integrity-v1-progress'),'separate-preview');h.close();
});

test('integrity published state comes only from durable earned completion, never a forged render state',()=>{
  const h=session();h.init();const bridge=(h.dom.window as any).IntegrityTrainingBridge;
  const saved=JSON.parse(h.store.get(KEY)!);saved.progress[0].done=true;
  assert.equal(bridge.save({index:0,summary:false,progress:saved.progress}),true);
  assert.deepEqual(h.snapshots().at(-1).completedStories,[]);
  const p=saved.progress[0];p.phase='reflect';p.line=stories[0].lines.length-1;p.checked=[0,1,2];p.choice='direct';
  assert.equal(bridge.complete({index:0,summary:false,progress:saved.progress}),false);
  p.checked=[0,1,2,2];assert.equal(bridge.complete({index:0,summary:false,progress:saved.progress}),false);
  p.checked=[0,1,2,3];p.line=0;assert.equal(bridge.complete({index:0,summary:false,progress:saved.progress}),false);
  h.close();
});

test('integrity import is SHA pinned and only changes storage hooks and integrated status wording',async()=>{
  const {adaptIntegrityMicrocourse,SOURCE_SHA256}=await import('../scripts/import-integrity-microcourse.mjs');
  const source=readFileSync(new URL('../public/microcourses/integrity-preview/index.html',import.meta.url),'utf8');
  const integrated=readFileSync(new URL('../public/microcourses/integrity/index.html',import.meta.url),'utf8');
  assert.equal(SOURCE_SHA256,'b9da38167a9e5b3ad1a5e746428ad4e5a2023968de86e315b2fe59cbd028157e');
  assert.equal(adaptIntegrityMicrocourse(source),integrated);assert.throws(()=>adaptIntegrityMicrocourse(source+' '),/Unreviewed/);
  assert.equal(integrated.match(/<style>([\s\S]*?)<\/style>/)![1],source.match(/<style>([\s\S]*?)<\/style>/)![1]);
  assert.equal(integrated.match(/window.INTEGRITY=([\s\S]*?)<\/script>/)![1],source.match(/window.INTEGRITY=([\s\S]*?)<\/script>/)![1]);
  assert(integrated.includes("classList.add('arrive')"));assert(!integrated.includes('本页是独立互动预览'));
});
