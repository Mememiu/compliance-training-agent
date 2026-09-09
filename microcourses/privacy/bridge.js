/* Training-room adapter for the finalized standalone privacy microcourse.
 * Game artwork, audio, scene transitions and checkpoint answer handling remain
 * in index.html. Only explicitly reviewed hooks call this adapter. */
(() => {
  'use strict';
  const CHANNEL = 'training-room/privacy-v1';
  const CHECKPOINT_KEY = 'training-room-privacy-checkpoints-v1';
  const OFFICES = ['finance', 'research', 'hr', 'reception', 'legal', 'executive'];
  const origin = window.location.origin;
  let token = null;
  let progress = { completedOffices: [], foundHazards: {} };
  let passedCheckpoints = [];
  let reopenCheckpoint = null;
  let pendingError = null;
  let initialized = false;

  function post(message) {
    if (window.parent !== window) {
      window.parent.postMessage({ channel: CHANNEL, ...message }, origin);
    }
  }

  function storageError() {
    pendingError = '微课进度未能保存，请检查浏览器存储权限后重试。';
    if (token) post({ type: 'error', token, message: pendingError });
  }

  function snapshot() {
    return {
      completedOffices: [...progress.completedOffices],
      foundHazards: Object.fromEntries(Object.entries(progress.foundHazards).map(([office, ids]) => [office, [...ids]])),
      passedCheckpoints: [...passedCheckpoints],
    };
  }

  function publish() {
    if (token && initialized) post({ type: 'state', token, snapshot: snapshot() });
  }

  function copyProgress(value) {
    // The game's runtime is mutable. Publish only snapshots handed over after
    // a successful save, never later mutations whose storage write failed.
    return {
      completedOffices: [...value.completedOffices],
      foundHazards: Object.fromEntries(Object.entries(value.foundHazards).map(([id, hazards]) => [id, [...hazards]])),
    };
  }

  function saveCheckpoints(next) {
    try {
      localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(next));
      passedCheckpoints = next;
      pendingError = null;
      return true;
    } catch {
      storageError();
      return false;
    }
  }

  function prepareCheckpoint(officeId, root) {
    const passed = passedCheckpoints.includes(officeId);
    root.querySelectorAll('[data-completion-floor], [data-next-office]').forEach(button => {
      button.disabled = !passed;
    });
    const title = root.querySelector('#completion-title');
    const summary = root.querySelector('.completion-dialog > p');
    const index = OFFICES.indexOf(officeId);
    if (title && index >= 0) title.textContent = `${String.fromCharCode(65 + index)} 区 · ${passed ? '通关' : '自测'}`;
    if (summary) summary.textContent = passed ? '本区隐患排查与自测已完成' : '隐患已找齐，答对本区自测后继续';
  }

  window.PrivacyTrainingBridge = Object.freeze({
    connect(initialProgress, showCheckpoint) {
      progress = copyProgress(initialProgress);
      reopenCheckpoint = showCheckpoint;
      try {
        const saved = JSON.parse(localStorage.getItem(CHECKPOINT_KEY) || '[]');
        passedCheckpoints = Array.isArray(saved)
          ? OFFICES.filter(id => saved.includes(id) && progress.completedOffices.includes(id))
          : [];
      } catch {
        storageError();
      }
      initialized = true;
      post({ type: 'ready' });
      publish();
      if (token && pendingError) post({ type: 'error', token, message: pendingError });
    },
    progressChanged(nextProgress) {
      progress = copyProgress(nextProgress);
      passedCheckpoints = passedCheckpoints.filter(id => progress.completedOffices.includes(id));
      publish();
    },
    checkpointPassed(officeId) {
      if (!OFFICES.includes(officeId) || !progress.completedOffices.includes(officeId)) return;
      if (!passedCheckpoints.includes(officeId) && !saveCheckpoints([...passedCheckpoints, officeId])) return;
      document.querySelector('[data-resume-checkpoint]')?.remove();
      const root = document.querySelector('#overlay-root');
      if (root) prepareCheckpoint(officeId, root);
      publish();
    },
    prepareCheckpoint,
    roomRendered(officeId) {
      if (!progress.completedOffices.includes(officeId) || passedCheckpoints.includes(officeId)) return;
      const mission = document.querySelector('.room-mission');
      if (!mission || document.querySelector('[data-resume-checkpoint]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'primary-command';
      button.dataset.resumeCheckpoint = officeId;
      button.style.marginTop = '16px';
      button.style.width = '100%';
      button.textContent = '隐患已找齐 · 继续完成本区自测';
      button.addEventListener('click', () => reopenCheckpoint?.());
      mission.append(button);
    },
    reset() {
      // Clear the in-memory record even if browser storage has become blocked.
      // On the next load, connect also removes passes absent from game progress.
      passedCheckpoints = [];
      saveCheckpoints([]);
    },
    storageError,
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
