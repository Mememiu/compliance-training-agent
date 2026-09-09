import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const BRIDGE_PATH = new URL('../public/microcourses/privacy/bridge.js', import.meta.url);
const CHANNEL = 'training-room/privacy-v1';
const CHECKPOINT_KEY = 'training-room-privacy-checkpoints-v1';

function setup(saved: string[] = [], failStorage = false) {
  const messages: any[] = [];
  const listeners: Record<string, (event: any) => void> = {};
  const storage = new Map<string, string>([[CHECKPOINT_KEY, JSON.stringify(saved)]]);
  const actions = [{ disabled: false }, { disabled: false }];
  const heading = { textContent: '' };
  const summary = { textContent: '' };
  let resume: any;
  let reopened = 0;
  const mission = {
    append(button: any) { resume = button; },
  };
  const dialog = {
    querySelector(selector: string) {
      if (selector === '#completion-title') return heading;
      if (selector === '.completion-dialog > p') return summary;
      return null;
    },
    querySelectorAll() { return actions; },
  };
  const document = {
    querySelector(selector: string) {
      if (selector === '.room-mission') return mission;
      if (selector === '[data-resume-checkpoint]') return resume;
      if (selector === '#overlay-root') return dialog;
      return null;
    },
    createElement() {
      return {
        dataset: {}, style: {}, textContent: '', className: '', type: '',
        remove() { resume = undefined; },
        addEventListener(_: string, callback: () => void) { this.click = callback; },
        click() {},
      };
    },
  };
  const parent = { postMessage(message: unknown, origin: string) { messages.push({ message, origin }); } };
  const window: any = {
    parent, location: { origin: 'https://training.example' },
    addEventListener(type: string, callback: (event: any) => void) { listeners[type] = callback; },
  };
  runInNewContext(readFileSync(BRIDGE_PATH, 'utf8'), {
    window, document,
    localStorage: {
      getItem(key: string) { if (failStorage) throw new Error('blocked'); return storage.get(key) ?? null; },
      setItem(key: string, value: string) { if (failStorage) throw new Error('blocked'); storage.set(key, value); },
    },
  });
  const bridge = window.PrivacyTrainingBridge;
  const progress = { completedOffices: ['finance'], foundHazards: { finance: ['salary-screen', 'expense-documents', 'tax-drawer'] } };
  bridge.connect(progress, () => { reopened += 1; });
  const init = (overrides: any = {}) => listeners.message({
    source: parent, origin: window.location.origin,
    data: { channel: CHANNEL, type: 'init', token: 'session-token' }, ...overrides,
  });
  const snapshots = () => messages.filter(({ message }) => message.type === 'state').map(({ message }) => JSON.parse(JSON.stringify(message.snapshot)));
  return { bridge, init, messages, snapshots, storage, progress, actions, heading, dialog, resume: () => resume, reopened: () => reopened };
}

test('bridge authenticates parent, origin and channel before publishing progress', () => {
  const harness = setup();
  assert.deepEqual(harness.messages.map(item => item.message.type), ['ready']);
  harness.init({ source: {} });
  harness.init({ origin: 'https://untrusted.example' });
  harness.init({ data: { channel: 'wrong', type: 'init', token: 'session-token' } });
  assert.equal(harness.snapshots().length, 0);
  harness.init();
  assert.deepEqual(harness.snapshots()[0], { ...harness.progress, passedCheckpoints: [] });
  assert.ok(harness.messages.every(item => item.origin === 'https://training.example'));
});

test('hazard discovery alone does not pass selftest; successful answers survive refresh', () => {
  const harness = setup();
  harness.init();
  harness.bridge.prepareCheckpoint('finance', harness.dialog);
  assert.ok(harness.actions.every(action => action.disabled));
  harness.bridge.checkpointPassed('finance');
  assert.deepEqual(harness.snapshots().at(-1).passedCheckpoints, ['finance']);
  assert.ok(harness.actions.every(action => !action.disabled));
  const refreshed = setup(JSON.parse(harness.storage.get(CHECKPOINT_KEY)!));
  refreshed.init();
  assert.deepEqual(refreshed.snapshots().at(-1).passedCheckpoints, ['finance']);
  refreshed.bridge.roomRendered('finance');
  assert.equal(refreshed.resume(), undefined);
});

test('unfinished selftest can be reopened after room hazards were already persisted', () => {
  const harness = setup();
  harness.bridge.roomRendered('finance');
  assert.match(harness.resume().textContent, /自测/);
  harness.resume().click();
  assert.equal(harness.reopened(), 1);
  harness.bridge.checkpointPassed('finance');
  assert.equal(harness.resume(), undefined);
});

test('reset clears checkpoint state and never imports checkpoints for unexplored rooms', () => {
  const harness = setup(['finance', 'research', 'unknown']);
  harness.init();
  assert.deepEqual(harness.snapshots().at(-1).passedCheckpoints, ['finance']);
  harness.bridge.reset();
  harness.bridge.progressChanged({ completedOffices: [], foundHazards: {} });
  assert.deepEqual(harness.snapshots().at(-1).passedCheckpoints, []);
  assert.deepEqual(JSON.parse(harness.storage.get(CHECKPOINT_KEY)!), []);
  harness.bridge.checkpointPassed('research');
  assert.deepEqual(harness.snapshots().at(-1).passedCheckpoints, []);
});

test('storage failure is reported and cannot create a durable passed checkpoint', () => {
  const harness = setup([], true);
  harness.init();
  harness.bridge.checkpointPassed('finance');
  assert.ok(harness.messages.some(item => item.message.type === 'error' && item.message.token === 'session-token'));
  assert.deepEqual(harness.snapshots().at(-1).passedCheckpoints, []);
});

test('unsaved game runtime mutations do not leak into the authenticated snapshot', () => {
  const harness = setup();
  harness.progress.completedOffices.push('research');
  harness.bridge.storageError();
  harness.init();
  harness.bridge.checkpointPassed('research');
  assert.deepEqual(harness.snapshots().at(-1).completedOffices, ['finance']);
  assert.deepEqual(harness.snapshots().at(-1).passedCheckpoints, []);
});

test('imported asset isolates storage and keeps the finalized animation bundle', () => {
  const html = readFileSync(new URL('../public/microcourses/privacy/index.html', import.meta.url), 'utf8');
  assert.match(html, /src="\.\/bridge\.js"/);
  assert.doesNotMatch(html, /"privacy-office-game-progress-v3"|"privacy-course-v2-progress"/);
  assert.match(html, /"training-room-privacy-game-v1"/);
  assert.match(html, /PrivacyTrainingBridge\.checkpointPassed\(t\.id\)/);
  assert.match(html, /PrivacyTrainingBridge\.roomRendered\(e\.id\)/);
  assert.match(html, /duration:\.5,ease:"back\.out\(1\.3\)"/);
  assert.match(html, /data:image\/webp;base64/);
});

test('exploration-only labels never announce selftest or whole-module completion', () => {
  const html = readFileSync(new URL('../public/microcourses/privacy/index.html', import.meta.url), 'utf8');
  assert.match(html, /\$\{e\}\/6 间已排查/);
  assert.match(html, /completed:"已排查"/);
  assert.match(html, /A=e==="completed"\?"已排查"/);
  assert.match(html, /隐患已找齐，请完成本区自测/);
  assert.doesNotMatch(html, /间已通关|"已通关"|六个办公室已全部完成|整层排查已经完成|\$\{n\.name\}已通关/);
});
