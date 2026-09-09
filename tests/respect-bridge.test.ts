import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const BRIDGE = new URL('../public/microcourses/respect/bridge.js', import.meta.url);
const CHANNEL = 'training-room/respect-v1';
const KEY = 'training-room-respect-game-v1';
const clone = (value: any) => JSON.parse(JSON.stringify(value));

function setup(saved?: string, initiallyBlocked = false) {
  const messages: any[] = [];
  const listeners: Record<string, (event: any) => void> = {};
  const storage = new Map<string, string>(saved ? [[KEY, saved]] : []);
  let blocked = initiallyBlocked;
  const parent = { postMessage(message: any, origin: string) { messages.push({ message: clone(message), origin }); } };
  const window: any = {
    parent, location: { origin: 'https://training.example' },
    addEventListener(type: string, handler: any) { listeners[type] = handler; },
  };
  runInNewContext(readFileSync(BRIDGE, 'utf8'), {
    window,
    localStorage: {
      getItem(key: string) { if (blocked) throw Error('blocked'); return storage.get(key) ?? null; },
      setItem(key: string, value: string) { if (blocked) throw Error('blocked'); storage.set(key, value); },
    },
  });
  const bridge = window.RespectTrainingBridge;
  const runtime = bridge.restore();
  const init = (overrides: any = {}) => listeners.message({
    source: parent, origin: window.location.origin,
    data: { channel: CHANNEL, type: 'init', token: 'mount-token' }, ...overrides,
  });
  const snapshots = () => messages.filter(item => item.message.type === 'state').map(item => item.message.snapshot);
  const prepare = (id = 'joke', choice = 'direct') => {
    runtime.active = id; runtime.view = 'story';
    Object.assign(runtime.progress[id], { phase: 'feedback', line: ({ joke: 5, opportunity: 7, support: 8 } as any)[id], choice });
    bridge.save(runtime);
  };
  return { bridge, runtime, init, storage, messages, snapshots, prepare, block(value: boolean) { blocked = value; } };
}

test('respect bridge authenticates parent/origin/channel/token before publishing', () => {
  const h = setup();
  assert.deepEqual(h.messages.map(item => item.message.type), ['ready']);
  h.init({ source: {} }); h.init({ origin: 'https://wrong.example' });
  h.init({ data: { channel: 'wrong', type: 'init', token: 'mount-token' } });
  h.init({ data: { channel: CHANNEL, type: 'init', token: '' } });
  assert.equal(h.snapshots().length, 0);
  h.init();
  assert.deepEqual(h.snapshots().at(-1), { completedStories: [], acceptedResponses: {} });
  assert.ok(h.messages.every(item => item.origin === 'https://training.example'));
});

test('accepted feedback alone does not complete; confirmation durably completes in order', () => {
  const h = setup(); h.init(); h.prepare();
  assert.deepEqual(h.snapshots().at(-1).completedStories, []);
  assert.equal(h.bridge.complete(h.runtime), true);
  h.runtime.progress.joke.completed = true;
  assert.deepEqual(h.snapshots().at(-1), { completedStories: ['joke'], acceptedResponses: { joke: 'direct' } });
  h.prepare('support');
  assert.equal(h.bridge.complete(h.runtime), false);
  h.prepare('opportunity', 'dismiss');
  assert.equal(h.bridge.complete(h.runtime), false);
  h.prepare('opportunity', 'support');
  assert.equal(h.bridge.complete(h.runtime), true);
  h.runtime.progress.opportunity.completed = true;
  h.prepare('support');
  assert.equal(h.bridge.complete(h.runtime), true);
  assert.deepEqual(h.snapshots().at(-1).completedStories, ['joke', 'opportunity', 'support']);
});

test('refresh restores current view, phase, dialogue line, choice and completed stories', () => {
  const h = setup(); h.prepare(); h.bridge.complete(h.runtime);
  h.runtime.progress.joke.completed = true; h.prepare('opportunity', 'support');
  const refreshed = setup(h.storage.get(KEY)); refreshed.init();
  assert.equal(refreshed.runtime.active, 'opportunity');
  assert.equal(refreshed.runtime.view, 'story');
  assert.deepEqual(clone(refreshed.runtime.progress.opportunity), { phase: 'feedback', line: 7, choice: 'support', completed: false });
  assert.deepEqual(refreshed.snapshots().at(-1), { completedStories: ['joke'], acceptedResponses: { joke: 'direct' } });
});

test('replaying a completed story preserves its earned acceptance and unlock', () => {
  const h = setup(); h.init(); h.prepare(); h.bridge.complete(h.runtime);
  h.runtime.progress.joke = { phase: 'listening', line: -1, choice: null, completed: true };
  h.bridge.save(h.runtime);
  const refreshed = setup(h.storage.get(KEY)); refreshed.init();
  assert.equal(refreshed.runtime.progress.joke.completed, true);
  assert.equal(refreshed.runtime.progress.joke.line, -1);
  assert.deepEqual(refreshed.snapshots().at(-1).acceptedResponses, { joke: 'direct' });
});

test('storage failure cannot publish unsaved runtime completion and remains retryable', () => {
  const h = setup(); h.init(); h.prepare(); h.block(true);
  assert.equal(h.bridge.complete(h.runtime), false);
  h.runtime.progress.joke.completed = true;
  assert.equal(h.bridge.save(h.runtime), false);
  assert.deepEqual(h.snapshots().at(-1).completedStories, []);
  assert.ok(h.messages.some(item => item.message.type === 'error' && item.message.token === 'mount-token'));
  const refreshed = setup(h.storage.get(KEY)); refreshed.init();
  assert.deepEqual(refreshed.snapshots().at(-1).completedStories, []);
  h.block(false); h.runtime.progress.joke.completed = false;
  assert.equal(h.bridge.complete(h.runtime), true);
  assert.deepEqual(h.snapshots().at(-1).completedStories, ['joke']);
});

test('startup storage errors are sent after init; malformed saved progress cannot unlock stories', () => {
  const h = setup(undefined, true); h.init();
  assert.ok(h.messages.some(item => item.message.type === 'error' && item.message.token === 'mount-token'));
  const malformed = setup(JSON.stringify({ version: 1, active: 'support', view: 'story', progress: { support: { completed: true } }, acceptedResponses: { support: 'dismiss', unknown: 'direct' } }));
  malformed.init();
  assert.deepEqual(malformed.snapshots().at(-1), { completedStories: [], acceptedResponses: {} });
  assert.equal(malformed.runtime.active, 'joke');
  assert.equal(malformed.runtime.progress.support.completed, false);
});

test('failed restoration latches through initial render and init without overwriting or publishing empty progress', () => {
  for (const saved of ['{invalid-json', 'null', '[]', JSON.stringify({ version: 2 }), JSON.stringify({ version: 1, progress: [], acceptedResponses: {} })]) {
    const h = setup(saved);
    // This is the actual engine order: restore -> initial render/save -> init.
    assert.equal(h.bridge.save(h.runtime), false);
    h.prepare();
    assert.equal(h.bridge.complete(h.runtime), false);
    h.init();
    assert.equal(h.storage.get(KEY), saved);
    assert.equal(h.snapshots().length, 0);
    assert.ok(h.messages.some(item => item.message.type === 'error' && item.message.token === 'mount-token'));
  }
});

test('read failure remains protected after storage becomes writable until an explicit successful restore', () => {
  const original = setup(); original.prepare(); original.bridge.complete(original.runtime);
  const saved = original.storage.get(KEY)!;
  const h = setup(saved, true);
  h.block(false);
  assert.equal(h.bridge.save(h.runtime), false);
  h.prepare();
  assert.equal(h.bridge.complete(h.runtime), false);
  h.init();
  assert.equal(h.storage.get(KEY), saved);
  assert.equal(h.snapshots().length, 0);
  assert.ok(h.messages.some(item => item.message.type === 'error' && item.message.token === 'mount-token'));
  const restored = h.bridge.restore();
  assert.equal(restored.progress.joke.completed, true);
  assert.deepEqual(h.snapshots().at(-1), { completedStories: ['joke'], acceptedResponses: { joke: 'direct' } });
  assert.equal(h.bridge.save(restored), true);
  const beforeReinit = h.messages.length;
  h.init();
  assert.ok(h.messages.slice(beforeReinit).every(item => item.message.type !== 'error'));
});

test('unconfirmed completion mutations are ignored and incomplete dialogue cannot pass', () => {
  const h = setup(); h.init(); h.runtime.progress.joke.completed = true;
  h.bridge.save(h.runtime);
  assert.deepEqual(h.snapshots().at(-1).completedStories, []);
  h.prepare(); h.runtime.progress.joke.line = 0;
  assert.equal(h.bridge.complete(h.runtime), false);
});

test('vendored respect course uses reviewed hooks, keeps original animation, and rejects unreviewed exports', async () => {
  const { adaptRespectMicrocourse, SOURCE_SHA256 } = await import('../scripts/import-respect-microcourse.mjs');
  const html = readFileSync(new URL('../public/microcourses/respect/index.html', import.meta.url), 'utf8');
  assert.equal(SOURCE_SHA256.length, 64);
  assert.throws(() => adaptRespectMicrocourse('<html>different course</html>'), /Unreviewed/);
  assert.match(html, /src="\.\/bridge\.js"/);
  assert.match(html, /RespectTrainingBridge\.restore\(\)/);
  assert.match(html, /RespectTrainingBridge\.complete\(\{active,view,progress\}\)/);
  assert.match(html, /RespectTrainingBridge\.save\(\{active,view,progress\}\)/);
  assert.match(html, /classList\.add\('transition-in'\)/);
});
