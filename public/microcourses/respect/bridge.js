/* Persistence and authenticated host adapter for the reviewed 尊重有界 V1.
 * The original engine owns every visual, transition and dialogue event. */
(() => {
  'use strict';
  const CHANNEL = 'training-room/respect-v1';
  const STORAGE_KEY = 'training-room-respect-game-v1';
  const STORIES = ['joke', 'opportunity', 'support'];
  const LAST_LINE = { joke: 5, opportunity: 7, support: 8 };
  const ACCEPTED = ['direct', 'support'];
  const origin = window.location.origin;
  const copy = value => JSON.parse(JSON.stringify(value));
  const fresh = () => ({ phase: 'listening', line: -1, choice: null, completed: false });
  const empty = () => ({
    version: 1, active: 'joke', view: 'office',
    progress: Object.fromEntries(STORIES.map(id => [id, fresh()])), acceptedResponses: {},
  });
  let durable = empty();
  let token = null;
  let initialized = false;
  let pendingError = null;
  let restorationFailed = false;

  function post(message) {
    if (window.parent !== window) window.parent.postMessage({ channel: CHANNEL, ...message }, origin);
  }

  function publish() {
    if (!token || !initialized || restorationFailed) return;
    post({ type: 'state', token, snapshot: {
      completedStories: STORIES.filter(id => durable.progress[id].completed),
      acceptedResponses: { ...durable.acceptedResponses },
    } });
  }

  function storageError() {
    pendingError = '微课进度未能保存，请检查浏览器存储权限后重试。';
    if (token) post({ type: 'error', token, message: pendingError });
  }

  function normalize(value, accepted = value?.acceptedResponses) {
    const next = empty();
    if (!value || typeof value !== 'object') return next;
    let unlocked = true;
    for (const id of STORIES) {
      const p = value.progress?.[id];
      if (!unlocked || !p || typeof p !== 'object') { unlocked = false; continue; }
      const completed = ACCEPTED.includes(accepted?.[id]);
      if (completed) next.acceptedResponses[id] = accepted[id];
      const line = Number.isInteger(p.line) && p.line >= -1 && p.line <= LAST_LINE[id] ? p.line : -1;
      const choice = ['dismiss', ...ACCEPTED].includes(p.choice) ? p.choice : null;
      let phase = ['listening', 'choice', 'feedback', 'takeaway'].includes(p.phase) ? p.phase : 'listening';
      if (phase !== 'listening' && line !== LAST_LINE[id]) phase = 'listening';
      if (phase === 'feedback' && !choice) phase = 'choice';
      if (phase === 'takeaway' && !completed) phase = choice ? 'feedback' : 'choice';
      next.progress[id] = { phase, line, choice, completed };
      unlocked = completed;
    }
    const index = STORIES.indexOf(value.active);
    if (index >= 0 && STORIES.slice(0, index).every(id => next.progress[id].completed)) next.active = value.active;
    next.view = value.view === 'story' ? 'story' : 'office';
    return next;
  }

  function persist(next) {
    // Never turn an unreadable record into a new empty course on the engine's
    // first render. Only a successful explicit restore/reload releases this.
    if (!initialized || restorationFailed) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      durable = copy(next);
      pendingError = null;
      publish();
      return true;
    } catch {
      storageError();
      return false;
    }
  }

  window.RespectTrainingBridge = Object.freeze({
    restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const saved = raw === null ? null : JSON.parse(raw);
        const record = value => value && typeof value === 'object' && !Array.isArray(value);
        if (raw !== null && (!record(saved) || saved.version !== 1 ||
            !record(saved.progress) || !record(saved.acceptedResponses))) {
          throw new Error('Unsupported or invalid saved respect-course record');
        }
        durable = raw === null ? empty() : normalize(saved);
        restorationFailed = false;
        pendingError = null;
      } catch {
        restorationFailed = true;
        pendingError = '微课原有进度未能恢复，已保留原记录。请检查浏览器存储权限后刷新重试。';
      }
      initialized = true;
      post({ type: 'ready' });
      publish();
      if (token && pendingError) post({ type: 'error', token, message: pendingError });
      return copy(durable);
    },
    save(runtime) {
      // Render may receive mutable/unsaved state. Only the explicit original
      // feedback confirmation hook below can create an earned completion.
      return persist(normalize(runtime, durable.acceptedResponses));
    },
    complete(runtime) {
      if (!initialized || restorationFailed) return false;
      const id = runtime?.active;
      const index = STORIES.indexOf(id);
      const p = runtime?.progress?.[id];
      if (index < 0 || runtime.view !== 'story' || !p || p.phase !== 'feedback' ||
          p.line !== LAST_LINE[id] || !ACCEPTED.includes(p.choice) ||
          !STORIES.slice(0, index).every(previous => durable.progress[previous].completed)) return false;
      const next = normalize(runtime, { ...durable.acceptedResponses, [id]: p.choice });
      next.progress[id].phase = 'takeaway';
      return persist(next);
    },
  });

  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== origin) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.type !== 'init' ||
        typeof data.token !== 'string' || !data.token || data.token.length > 160) return;
    token = data.token;
    publish();
    if (pendingError) post({ type: 'error', token, message: pendingError });
  });
})();
