/* Storage and authenticated host adapter. Original engine retains all visuals,
 * dialogue and action gates. Only the original reflection confirmation earns credit. */
(() => {
  'use strict';
  const CHANNEL = 'training-room/integrity-v1';
  const KEY = 'training-room-integrity-game-v1';
  const stories = window.INTEGRITY.stories;
  const origin = window.location.origin;
  const clone = value => JSON.parse(JSON.stringify(value));
  const empty = () => ({ version: 1, index: 0, summary: false,
    progress: stories.map(() => ({phase:'intro',line:-1,checked:[],choice:null,done:false})), acceptedResponses: {} });
  let durable = empty(), token = null, initialized = false, restorationFailed = false, error = null, validate;
  const post = message => {
    if (window.parent !== window) window.parent.postMessage({channel:CHANNEL,...message},origin);
  };
  function publish() {
    if (!token || !initialized || restorationFailed) return;
    post({type:'state',token,snapshot:{
      completedStories: stories.filter((s,n)=>durable.progress[n].done).map(s=>s.id),
      acceptedResponses: {...durable.acceptedResponses},
    }});
  }
  function fail(message='微课进度未能保存，请检查浏览器存储权限后重试；本段尚未记为完成。') {
    error=message;
    if (token) post({type:'error',token,message});
    return false;
  }
  function validRecord(saved) {
    if (!validate(saved) || !saved.acceptedResponses || typeof saved.acceptedResponses!=='object' || Array.isArray(saved.acceptedResponses)) return false;
    const ids=stories.map(s=>s.id);
    if (Object.keys(saved.acceptedResponses).some(id=>!ids.includes(id))) return false;
    return stories.every((s,n)=>saved.progress[n].done
      ? ['direct','support'].includes(saved.acceptedResponses[s.id])
      : !Object.hasOwn(saved.acceptedResponses,s.id));
  }
  function persist(next, reset=false) {
    if (!initialized || (restorationFailed && !reset)) return false;
    if (!validRecord(next)) return fail('微课学习状态无法保存，请刷新重试；原学习记录已保留。');
    try {
      localStorage.setItem(KEY,JSON.stringify(next));
      durable=clone(next); restorationFailed=false; error=null; publish(); return true;
    } catch { return fail(); }
  }
  function fromRuntime(runtime) {
    const next=clone({version:1,...runtime,acceptedResponses:durable.acceptedResponses});
    next.progress.forEach((p,n)=>{p.done=durable.progress[n].done;});
    return next;
  }
  window.IntegrityTrainingBridge=Object.freeze({
    restore(validator) {
      validate=validator;
      let result=null;
      try {
        const raw=localStorage.getItem(KEY);
        if (raw!==null) {
          const saved=JSON.parse(raw);
          if (!validRecord(saved)) throw Error('invalid saved progress');
          durable=clone(saved); result=clone(saved);
        }
        restorationFailed=false; error=null;
      } catch {
        restorationFailed=true;
        fail('微课原有进度未能恢复，已保留原记录。请检查浏览器存储权限后刷新重试，或确认“重新开始”。');
      }
      initialized=true; post({type:'ready'}); publish();
      return result;
    },
    save(runtime) { return persist(fromRuntime(runtime)); },
    complete(runtime) {
      if (!initialized || restorationFailed || !Number.isInteger(runtime?.index)) return false;
      const n=runtime.index,s=stories[n],p=runtime.progress?.[n];
      if (!s || !p || runtime.summary || p.phase!=='reflect' || p.line!==s.lines.length-1 ||
          !Array.isArray(p.checked) || p.checked.length!==s.evidence.items.length ||
          new Set(p.checked).size!==s.evidence.items.length || p.checked.some(x=>!Number.isInteger(x)||x<0||x>=s.evidence.items.length) ||
          !['direct','support'].includes(p.choice) || !s.feedback[p.choice]?.accepted ||
          !durable.progress.slice(0,n).every(previous=>previous.done)) return false;
      const next=fromRuntime(runtime);
      next.acceptedResponses[s.id]=durable.acceptedResponses[s.id] || p.choice;
      next.progress[n].done=true;next.progress[n].phase='done';
      return persist(next);
    },
    reset() { return persist(empty(),true); },
    notice() { return error || '进度保存在当前浏览器；完成三段互动后同步培训室模块状态。共用设备可用“重新开始”清除本微课进度，已获得的模块完成记录仍会保留。'; },
  });
  window.addEventListener('message',event=>{
    if(event.source!==window.parent || event.origin!==origin) return;
    const data=event.data;
    if(!data || data.channel!==CHANNEL || data.type!=='init' || typeof data.token!=='string' || !data.token || data.token.length>160) return;
    token=data.token;publish();
    if(error)post({type:'error',token,message:error});
  });
})();
