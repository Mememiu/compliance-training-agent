import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrivacyProgress, completePrivacyLesson, recordPrivacyMicrocourse, PRIVACY_OFFICES, privacyResumePath } from '../src/utils/privacyProgress';
import type { TrainingProgress } from '../src/types';

const lessons = ['a', 'b', 'c', 'd', 'e', 'f'];
const empty: TrainingProgress = { id: 'x', user_id: 'default', course_id: 'data-privacy', lesson_id: null, status: 'not_started', progress: 0, score: null, passed: false, started_at: null, completed_at: null };
const now = '2026-09-08T10:00:00Z';
const snapshot = () => ({ completedOffices: Object.keys(PRIVACY_OFFICES), foundHazards: structuredClone(PRIVACY_OFFICES), passedCheckpoints: Object.keys(PRIVACY_OFFICES) });
const readAll = () => lessons.reduce((p, id) => completePrivacyLesson(p, lessons, id, now), empty);

test('opening/legacy partial only credits earlier text, never current lesson', () => {
 const p = normalizePrivacyProgress({ ...empty, lesson_id: 'b', progress: 33, status: 'in_progress' }, lessons);
 assert.deepEqual(p.privacy_learning?.completedLessonIds, ['a']);
 assert.equal(privacyResumePath(p, lessons), '/course/data-privacy/lesson/b');
});
test('explicit reading is sequential, idempotent and only half the module', () => {
 assert.throws(() => completePrivacyLesson(empty, lessons, 'b', now));
 assert.throws(() => completePrivacyLesson(empty, lessons, 'unknown', now));
 const p = readAll();
 assert.equal(p.progress, 50); assert.equal(p.passed, false);
 assert.deepEqual(completePrivacyLesson(p, lessons, 'a', now), p);
 assert.equal(privacyResumePath(p, lessons), '/course/data-privacy/microcourse');
});
test('legacy completion is retained as history but requires new microcourse', () => {
 const p = normalizePrivacyProgress({ ...empty, status: 'completed', progress: 100, score: 90, passed: true, completed_at: now }, lessons);
 assert.equal(p.status, 'in_progress'); assert.equal(p.progress, 50);
 assert.equal(p.privacy_learning?.legacy?.score, 90); assert.equal(p.score, null);
 assert.equal(p.privacy_learning?.legacy?.completed_at, now);
});
test('must read first, explore every known hazard and pass each checkpoint', () => {
 assert.throws(() => recordPrivacyMicrocourse(empty, lessons, snapshot(), now));
 const s = snapshot(); s.passedCheckpoints.pop();
 assert.equal(recordPrivacyMicrocourse(readAll(), lessons, s, now).passed, false);
 const invalid = snapshot(); invalid.foundHazards.finance = ['fake', 'fake', 'fake'];
 assert.throws(() => recordPrivacyMicrocourse(readAll(), lessons, invalid, now));
 const duplicate = snapshot(); duplicate.passedCheckpoints = Array(6).fill('finance');
 assert.throws(() => recordPrivacyMicrocourse(readAll(), lessons, duplicate, now));
 assert.throws(() => recordPrivacyMicrocourse(readAll(), lessons, { completed: true }, now));
});
test('verified completion persists across review/reset without inventing a score', () => {
 const p = recordPrivacyMicrocourse(readAll(), lessons, snapshot(), now);
 assert.equal(p.progress, 100); assert.equal(p.passed, true); assert.equal(p.score, null);
 assert.equal(p.completed_at, now);
 const reviewed = recordPrivacyMicrocourse(p, lessons, {completedOffices: [], foundHazards: {}, passedCheckpoints: []}, now);
 assert.equal(reviewed.passed, true); assert.equal(reviewed.completed_at, now);
 assert.equal(completePrivacyLesson(reviewed, lessons, 'a', now).passed, true);
});
test('normalization cannot accept skipped text IDs or an unearned completed status', () => {
 const p = normalizePrivacyProgress({...empty, status:'completed', passed:true, progress:100, privacy_learning:{version:1, completedLessonIds:['b','fake'], microcourseCompletedAt:null}}, lessons);
 assert.equal(p.passed,false); assert.equal(p.progress,0);
});
test('other course records are unchanged', () => {
 const p = {...empty, course_id:'workplace-conduct', progress:100, passed:true};
 assert.deepEqual(normalizePrivacyProgress(p, lessons),p);
});
