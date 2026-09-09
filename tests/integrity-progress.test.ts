import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { TrainingProgress } from '../src/types';
import { normalizeIntegrityProgress, completeIntegrityLesson, recordIntegrityMicrocourse, validateIntegritySnapshot, INTEGRITY_RESPONSES } from '../src/utils/integrityProgress';
const ids=['ac-1','ac-2','ac-3'];
const now='2026-09-09T09:00:00Z';
const empty:TrainingProgress={id:'x',user_id:'default',course_id:'anti-corruption',lesson_id:null,status:'not_started',progress:0,score:null,passed:false,started_at:null,completed_at:null};
const all=()=>({completedStories:Object.keys(INTEGRITY_RESPONSES),acceptedResponses:Object.fromEntries(Object.entries(INTEGRITY_RESPONSES).map(([id,choices])=>[id,choices[0]]))});
const read=()=>ids.reduce((p,id)=>completeIntegrityLesson(p,ids,id,now),empty);
test('integrity texts require explicit ordered confirmation',()=>{
 assert.throws(()=>completeIntegrityLesson(empty,ids,'ac-2',now));
 assert.throws(()=>completeIntegrityLesson(empty,ids,'unknown',now));
 assert.equal(completeIntegrityLesson(empty,ids,'ac-1',now).progress,17);
 assert.equal(read().progress,50);assert.equal(read().passed,false);
 assert.deepEqual(completeIntegrityLesson(read(),ids,'ac-1',now),read());
});
test('integrity legacy pass retained only as history and current open text not credited',()=>{
 const partial=normalizeIntegrityProgress({...empty,status:'in_progress',lesson_id:'ac-2',progress:100},ids);
 assert.deepEqual(partial.integrity_learning?.completedLessonIds,['ac-1']);
 const legacy=normalizeIntegrityProgress({...empty,status:'completed',passed:true,progress:100,score:80,completed_at:now},ids);
 assert.equal(legacy.progress,50);assert.equal(legacy.passed,false);assert.equal(legacy.score,null);
 assert.equal(legacy.integrity_learning?.legacy?.score,80);assert.equal(legacy.integrity_learning?.legacy?.completed_at,now);
});
test('integrity rejects unread completion, wrong, foreign, repeated and out-of-order snapshots',()=>{
 assert.throws(()=>recordIntegrityMicrocourse(empty,ids,all(),now));
 for(const s of [{completed:true},{completedStories:['fees','fees'],acceptedResponses:{fees:'direct'}},{completedStories:['gifts'],acceptedResponses:{gifts:'support'}},{completedStories:['fees'],acceptedResponses:{fees:'dismiss'}},{completedStories:['joke'],acceptedResponses:{joke:'direct'}},{completedStories:[],acceptedResponses:{fees:'direct'}}]) assert.equal(validateIntegritySnapshot(s),false,JSON.stringify(s));
});
test('integrity requires all three durable accepted responses and preserves earned completion on review',()=>{
 const partial=recordIntegrityMicrocourse(read(),ids,{completedStories:['fees'],acceptedResponses:{fees:'support'}},now);
 assert.equal(partial.passed,false);assert.equal(partial.progress,67);
 const done=recordIntegrityMicrocourse(partial,ids,all(),now);
 assert.equal(done.passed,true);assert.equal(done.progress,100);assert.equal(done.score,null);
 assert.equal(recordIntegrityMicrocourse(done,ids,{completedStories:[],acceptedResponses:{}},now).passed,true);
 assert.equal(completeIntegrityLesson(done,ids,'ac-1',now).completed_at,now);
});
test('integrity state remains isolated and malformed saved prefixes are normalized',()=>{
 for(const course_id of ['data-privacy','labor-compliance']) {
  const other={...empty,course_id}; assert.deepEqual(normalizeIntegrityProgress(other,ids),other);
  assert.throws(()=>completeIntegrityLesson(other,ids,'ac-1',now));
  assert.throws(()=>recordIntegrityMicrocourse(other,ids,all(),now));
 }
 const malformed={...empty,integrity_learning:{version:1 as const,completedLessonIds:['ac-1','ac-3'],microcourse:{completedStories:['gifts'],acceptedResponses:{gifts:'direct'}},microcourseCompletedAt:'invalid'}};
 const normalized=normalizeIntegrityProgress(malformed,ids);
 assert.deepEqual(normalized.integrity_learning?.completedLessonIds,['ac-1']);assert.equal(normalized.integrity_learning?.microcourse,undefined);assert.equal(normalized.passed,false);
});
