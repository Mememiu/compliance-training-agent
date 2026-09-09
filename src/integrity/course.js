/* Standalone local learning engine. Local progress only; no network or score bridge.
 * One source of truth per case; UI and hotspot actions share guarded commands.
 * Phase order: intro > listen > records > decide > feedback > reflect > done.
 * Only accepted feedback can reach reflection, and only reflection can unlock.
 */
(() => {
  'use strict';
  const { stories, cast, legal, scenes, assets, icons } = window.INTEGRITY;
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fresh = () => stories.map(() => ({phase:'intro',line:-1,checked:[],choice:null,done:false}));
  let progress = fresh();
  let index = 0;
  let summary = false;
  let mountedArt = '';
  // Versioned, course-specific slot. Save learning state only, never artwork,
  // dialogue text, personal details or training-room grades. Not an exam record.
  const STORAGE_KEY = 'duoting-integrity-v1-progress';
  let pending = null;
  let storageAvailable = true;
  let storageNotice = '';
  function validSave(saved) {
    if (!saved || saved.version !== 1 || !Number.isInteger(saved.index) || saved.index < 0 || saved.index >= stories.length || typeof saved.summary !== 'boolean' || !Array.isArray(saved.progress) || saved.progress.length !== stories.length) return false;
    const phases = ['intro','listen','records','decide','feedback','reflect','done'];
    for (let n=0;n<stories.length;n++) {
      const p=saved.progress[n], s=stories[n];
      if (!p || !phases.includes(p.phase) || typeof p.done !== 'boolean' || !Number.isInteger(p.line) || p.line < -1 || p.line >= s.lines.length || !Array.isArray(p.checked) || new Set(p.checked).size !== p.checked.length || p.checked.some(x=>!Number.isInteger(x)||x<0||x>=s.evidence.items.length)) return false;
      if (p.phase==='intro' && (p.line!==-1 || p.checked.length || p.choice!==null)) return false;
      if (p.phase==='listen' && (p.line<0 || p.checked.length || p.choice!==null)) return false;
      if (phases.indexOf(p.phase)>=2 && p.line!==s.lines.length-1) return false;
      if (p.phase==='records' && p.choice!==null) return false;
      if (phases.indexOf(p.phase)>=3 && p.checked.length!==s.evidence.items.length) return false;
      if (p.phase==='decide' && p.choice!==null) return false;
      if (phases.indexOf(p.phase)>=4 && !s.choices.some(([key])=>key===p.choice)) return false;
      if (['reflect','done'].includes(p.phase) && !s.feedback[p.choice]?.accepted) return false;
      if (p.phase==='done' && !p.done) return false;
      // An untouched later case cannot be unlocked by a malformed local save.
      if (n>0 && !saved.progress[n-1].done && (p.done || p.phase!=='intro')) return false;
      if (!p.done && p.phase!=='intro' && n!==saved.index) return false;
    }
    return (saved.index===0 || saved.progress[saved.index-1].done) && (!saved.summary || saved.progress.every(p=>p.done));
  }
  function loadProgress() {
    try {
      const raw=window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      let saved;
      try { saved=JSON.parse(raw); } catch { /* Invalid JSON is handled below. */ }
      if (!validSave(saved)) { storageNotice='原学习记录无法读取，已从头开始。'; return; }
      if (saved.progress.some(p=>p.done || p.phase!=='intro')) pending=saved;
    } catch { storageAvailable=false; }
  }
  function saveProgress() {
    if (!pending && storageAvailable) {
      try { window.localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,index,summary,progress})); }
      catch { storageAvailable=false; }
    }
    $('save-status').textContent=storageAvailable
      ? (storageNotice || '进度保存在当前浏览器；请在同一浏览器、同一文件或地址继续。共用设备可用“重新开始”清除本课进度。')
      : '当前浏览器无法保存进度，本次仍可正常学习；关闭或刷新后可能无法续学。';
  }
  const story = () => stories[index];
  const state = () => progress[index];
  const role = key => cast[story().id].find(person => person[0] === key);
  const currentRole = () => state().phase === 'intro' ? story().lines[0][0] : story().lines[Math.max(0,state().line)]?.[0];
  const nextRole = () => state().phase === 'intro' ? story().lines[0][0] : story().lines[state().line + 1]?.[0];
  const completed = () => progress.filter(p => p.done).length;
  const reveal = element => element.scrollIntoView?.({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  const busy = () => !state().done && state().phase !== 'intro';
  const canOpen = target => Number.isInteger(target) && target >= 0 && target < stories.length && (target === 0 || progress[target - 1].done) && (!busy() || target === index);
  const button = (action,text,kind='primary',disabled=false,extra='') => `<button class="${kind}" data-action="${action}" ${disabled?'disabled':''} ${extra}>${text}</button>`;
  const actions = content => `<div class="actions">${content}</div>`;
  function listen() {
    const p = state();
    if (p.phase === 'intro') { p.phase='listen'; p.line=0; }
    else if (p.phase === 'listen' && p.line < story().lines.length-1) p.line++;
    else return;
    render();
  }
  function act(action, value) {
    if (action==='restart-course') {
      if (!window.confirm('确定重新开始吗？将清除本浏览器保存的本课学习进度，从第一段重新学习。')) return;
      // Remove the old slot first so a failed subsequent write cannot resurrect it.
      try { window.localStorage.removeItem(STORAGE_KEY); storageAvailable=true; } catch { storageAvailable=false; }
      pending=null; progress=fresh(); index=0; summary=false; storageNotice=''; render(true); return;
    }
    if (action==='resume-course' && pending) {
      ({progress,index,summary}=pending); pending=null; render(true); return;
    }
    if (pending) return;
    const p = state(), s = story();
    if (action === 'next-line') return listen();
    if (action === 'open-case') {
      const target=Number(value);
      if (!canOpen(target)) return;
      index=target; summary=false; render(true); return;
    }
    if (action === 'records' && p.phase === 'listen' && p.line === s.lines.length-1) p.phase='records';
    else if (action === 'check-record' && p.phase === 'records') {
      const n=Number(value);
      if (!Number.isInteger(n) || n<0 || n>=s.evidence.items.length) return;
      p.checked=p.checked.includes(n)?p.checked.filter(x=>x!==n):[...p.checked,n];
      render(false, `record-${n}`); return;
    }
    else if (action === 'decide' && p.phase === 'records' && p.checked.length === s.evidence.items.length) p.phase='decide';
    else if (action === 'choose' && p.phase === 'decide' && s.choices.some(([key])=>key===value)) { p.choice=value; p.phase='feedback'; }
    else if (action === 'retry' && p.phase === 'feedback' && !s.feedback[p.choice].accepted) {p.phase='decide';p.choice=null;}
    else if (action === 'reflect' && p.phase === 'feedback' && s.feedback[p.choice].accepted) p.phase='reflect';
    else if (action === 'complete' && p.phase === 'reflect') {p.done=true;p.phase='done';}
    else if (action === 'next-case' && p.done && index<stories.length-1 && canOpen(index+1)) {index++;render(true);return;}
    else if (action === 'summary' && completed() === stories.length) summary=true;
    else if (action === 'review-course' && completed() === stories.length) {index=0;summary=false;}
    else if (action === 'replay' && p.done) {p.phase='intro';p.line=-1;p.checked=[];p.choice=null;}
    else return;
    render();
  }
  function actorAction(key) {
    if (pending) return;
    if (!role(key)) return;
    const p=state();
    // Art never advances past unread dialogue or bypasses the records/decision gates.
    if (p.phase!=='intro' && p.phase!=='listen') return;
    if (key===nextRole()) {listen();reveal($('panel'));return;}
    const next=role(nextRole());
    const text=next ? `下一句由${next[1]}说，点击“${p.phase==='intro'?'开始听对话':'听下一句'}”也可以继续。` : '对话已经听完，请核对业务记录。';
    const hint=$('speaker-hint');
    if (hint) hint.textContent=text;
  }
  function renderArt() {
    const s=story(),p=state(),scene=scenes[s.id];
    const reflection=s.id==='fees' && ((p.phase==='feedback' && s.feedback[p.choice]?.accepted) || p.phase==='reflect' || p.phase==='done');
    const artKey=reflection?'reflection':scene.asset;
    if (mountedArt!==artKey) {
      const img=$('scene-image');
      img.src=assets[artKey];
      img.width=reflection?1200:scene.width;
      img.height=reflection?1200:scene.height;
      img.alt=reflection?'解析插画：员工拒绝桌对面的不当利益。两个人物、桌椅和脚部保留完整。':scene.alt;
      $('art-plane').classList.remove('arrive');
      // Restart only on a scene/art change, never for each dialogue line.
      void $('art-plane').offsetWidth;
      $('art-plane').classList.add('arrive');
      mountedArt=artKey;
    }
    $('scene-surface').className=reflection?'paper':scene.tone;
    $('scene-caption').textContent=reflection?'决定之后：费用名称不能掩盖真实用途。拒贿示意图用于复盘，不是本次业务记录。':scene.caption;
    const interactive=!reflection && ['intro','listen'].includes(p.phase);
    $('hotspots').innerHTML=interactive?scene.hotspots.map(h=>`<button class="hotspot" data-actor="${h.role}" aria-label="${esc(role(h.role)[1])}：查看对话" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%"></button>`).join(''):'';
    $('cast-controls').innerHTML=cast[s.id].map(([key,name,label])=>`<button class="person ${interactive && key===currentRole()?'current':''}" data-actor="${key}" ${interactive?'':'disabled'} aria-label="${esc(name+'，'+label)}">${esc(name)}<small>${esc(label)}</small></button>`).join('');
    $('scene-help').textContent=interactive?'点击人物查看对话；轮到画外人物时，使用姓名按钮或“听下一句”。':'画面保持完整展示。请在学习面板继续核对与复盘。';
  }
  function renderPanel() {
    const p=state(),s=story();
    const hint='<p id="speaker-hint" class="speaker-hint" role="status"></p>';
    if(p.phase==='intro') return `<h2>去看看，他们在谈什么？</h2><p class="intro-copy">${esc(s.opening)}</p><p class="note">${esc(s.warning)}。逐句听完后，再核对记录、作出决定。</p>${actions(button('next-line','开始听对话 '+icons.arrow))}${hint}`;
    if(p.phase==='listen') {
      const [key,text,direction]=s.lines[p.line],person=role(key),last=p.line===s.lines.length-1;
      return `<div class="speaker"><div><strong>${esc(person[1])}</strong><small>${esc(person[2])}</small></div><span class="line-count">${p.line+1} / ${s.lines.length} 句</span></div><blockquote class="dialogue">${esc(text)}</blockquote><p class="direction">${esc(direction)}</p>${actions(button(last?'records':'next-line',last?'核对业务记录 '+icons.arrow:'听下一句 '+icons.arrow))}${hint}`;
    }
    if(p.phase==='records') return `<h2>${esc(s.evidence.title)}</h2><p class="muted">这是从刚才的对话整理出的虚构记录。逐项确认，再进入判断。</p><ul class="record-list">${s.evidence.items.map((item,n)=>`<li><button id="record-${n}" class="record" data-action="check-record" data-value="${n}" aria-pressed="${p.checked.includes(n)}">${p.checked.includes(n)?icons.check:icons.square}<span>${esc(item)}</span></button></li>`).join('')}</ul><p class="note">已核对 ${p.checked.length} / ${s.evidence.items.length} 项</p>${actions(button('decide','记录核对完成，作出决定 '+icons.arrow,'primary',p.checked.length!==s.evidence.items.length))}`;
    if(p.phase==='decide') return `<h2>${esc(s.question)}</h2><p class="muted">${esc(s.choiceIntro)}</p><div class="choice-list">${s.choices.map(([key,text],i)=>button('choose',`<b>${String.fromCharCode(65+i)}</b><span>${esc(text)}</span>`,'choice',false,`data-value="${key}"`)).join('')}</div>${recordsDetails(s)}`;
    if(p.phase==='feedback') {
      const f=s.feedback[p.choice];
      return `<p class="feedback-status ${f.accepted?'':'retry'}">${f.accepted?icons.check:icons.info}${f.accepted?'这个决定有依据':'再想一步'}</p><h2>${esc(f.title)}</h2><p>${esc(f.description)}</p><blockquote class="example">${esc(f.example)}</blockquote><p class="muted">${esc(f.principle)}</p>${actions(button(f.accepted?'reflect':'retry',f.accepted?'整理本段要点 '+icons.arrow:'返回重新判断 '+icons.arrow))}${recordsDetails(s)}`;
    }
    // A completed case remains reviewable, but does not reset the next case.
    return `<p class="feedback-status">${icons.check}${p.phase==='done'?'本段已完成':'把决定带回工作中'}</p><h2>${esc(s.takeawayTitle)}</h2><p class="muted">${esc(s.takeawayIntro)}</p><ul class="principles">${s.points.map(([title,text])=>`<li><strong>${esc(title)}</strong><p>${esc(text)}</p></li>`).join('')}</ul><p class="policy-note">${esc(legal[s.legal].text)}</p>${actions(p.phase==='reflect'?button('complete','完成本段 '+icons.check):(index<stories.length-1?button('next-case','进入下一情境 '+icons.arrow):button('summary','查看学习回顾 '+icons.arrow))+button('replay','重听本段','secondary'))}`;
  }
  function recordsDetails(s){return `<details class="policy-note"><summary>回看已核对的业务记录</summary><ul>${s.evidence.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></details>`;}
  function render(newScene=false, focusId=null) {
    saveProgress();
    $('resume-prompt').hidden=!pending;
    $('case-nav').hidden=!!pending;
    if (pending) {
      const count=pending.progress.filter(p=>p.done).length;
      $('overall-label').textContent=`已完成 ${count} / ${stories.length} 个情境`;
      $('overall-progress').value=count;
      $('resume-detail').textContent=pending.summary?'你已完成全部情境，可以继续查看学习回顾。':`已完成 ${count} / ${stories.length} 个情境。继续后将回到“${stories[pending.index].topic}”上次停下的步骤。`;
      $('workspace').hidden=true; $('completion').hidden=true;
      $('resume-button').focus({preventScroll:true}); return;
    }
    const s=story(),p=state();
    $('overall-label').textContent=`已完成 ${completed()} / ${stories.length} 个情境`;
    $('overall-progress').value=completed();
    $('case-nav').innerHTML=stories.map((item,n)=>{
      const enabled=canOpen(n),label=progress[n].done?(enabled?'已完成 · 可回看':'已完成 · 本段结束后回看'):n===index?'当前情境':enabled?'已解锁':'完成前一段后解锁';
      return `<button class="case-tab" data-action="open-case" data-value="${n}" ${enabled?'':'disabled'} ${n===index && !summary?'aria-current="step"':''}><span class="case-number">0${n+1}</span><span><strong>${esc(item.topic)}</strong><small>${label}</small></span>${progress[n].done?icons.check:enabled?icons.arrow:icons.lock}</button>`;
    }).join('');
    $('workspace').hidden=summary;
    $('completion').hidden=!summary;
    if(summary){
      $('learning-receipt').innerHTML=stories.map((item,n)=>`<article><h2>${n+1}. ${esc(item.topic)}</h2><p>${esc(item.takeawayTitle)}</p>${button('open-case','回看本段','secondary',false,`data-value="${n}"`)}</article>`).join('');
      $('completion').focus({preventScroll:true});reveal($('completion'));return;
    }
    $('case-title').textContent=s.title;
    $('case-meta').textContent=`情境 ${index+1} / 3 · ${s.place} · ${s.duration} · ${s.topic}`;
    const step=p.phase==='intro'||p.phase==='listen'?'listen':p.phase==='records'?'records':p.phase==='decide'||p.phase==='feedback'?'decide':'reflect';
    document.querySelectorAll('[data-step]').forEach(el=>el.getAttribute('data-step')===step?el.setAttribute('aria-current','step'):el.removeAttribute('aria-current'));
    renderArt();
    $('panel').innerHTML=renderPanel();
    $('panel').setAttribute('aria-label',`${s.topic}：${{listen:'听对话',records:'核对记录',decide:'作决定',reflect:'复盘'}[step]}`);
    $('transcript').hidden=p.line<0;
    $('transcript-lines').innerHTML=s.lines.slice(0,p.line+1).map(([key,text])=>`<li><strong>${esc(role(key)[1])}</strong>${esc(text)}</li>`).join('');
    if(focusId) $(focusId)?.focus({preventScroll:true});
    else (newScene?$('workspace'):$('panel')).focus({preventScroll:true});
    if(newScene) reveal($('workspace'));
  }
  document.addEventListener('click', event=>{
    const target=event.target.closest('button');
    if(!target || target.disabled) return;
    if(target.dataset.action) act(target.dataset.action,target.dataset.value);
    else if(target.dataset.actor) actorAction(target.dataset.actor);
  });
  loadProgress();
  render();
})();
