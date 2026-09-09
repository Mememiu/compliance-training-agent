import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { TrainingProgress } from '../src/types';
import { normalizeRespectProgress, completeRespectLesson, recordRespectMicrocourse, validateRespectSnapshot, RESPECT_RESPONSES } from '../src/utils/respectProgress';
const ids=['lc-1','lc-2'];
const now='2026-09-09T09:00:00Z';
const empty:TrainingProgress={id:'x',user_id:'default',course_id:'labor-compliance',lesson_id:null,status:'not_started',progress:0,score:null,passed:false,started_at:null,completed_at:null};
const all=()=>({completedStories:Object.keys(RESPECT_RESPONSES),acceptedResponses:Object.fromEntries(Object.entries(RESPECT_RESPONSES).map(([id,choices])=>[id,choices[0]]))});
const read=()=>ids.reduce((p,id)=>completeRespectLesson(p,ids,id,now),empty);
test('two text lessons require explicit confirmation; unknown or skipped ID rejected',()=>{
 assert.throws(()=>completeRespectLesson(empty,ids,'lc-2',now));
 assert.throws(()=>completeRespectLesson(empty,ids,'unknown',now));
 assert.equal(read().progress,50);assert.equal(read().passed,false);
 assert.deepEqual(completeRespectLesson(read(),ids,'lc-1',now),read());
});
test('opening current lesson never credits current text, old pass retained as history',()=>{
 const partial=normalizeRespectProgress({...empty,status:'in_progress',lesson_id:'lc-2',progress:100},ids);
 assert.deepEqual(partial.respect_learning?.completedLessonIds,['lc-1']);
 const legacy=normalizeRespectProgress({...empty,status:'completed',passed:true,progress:100,score:80,completed_at:now},ids);
 assert.equal(legacy.progress,50);assert.equal(legacy.passed,false);assert.equal(legacy.score,null);
 assert.equal(legacy.respect_learning?.legacy?.score,80);assert.equal(legacy.respect_learning?.legacy?.completed_at,now);
});
test('reject completion before reading and reject unknown/repeated/skipped/incorrect stories',()=>{
 assert.throws(()=>recordRespectMicrocourse(empty,ids,all(),now));
 for(const s of [{completed:true}, {completedStories:['joke','joke','joke'],acceptedResponses:{joke:'direct'}}, {completedStories:['support'],acceptedResponses:{support:'listen'}}, {completedStories:['joke'],acceptedResponses:{joke:'dismiss'}}, {completedStories:['fake'],acceptedResponses:{fake:'direct'}}, {completedStories:[],acceptedResponses:{joke:'direct'}}]) assert.equal(validateRespectSnapshot(s),false,JSON.stringify(s));
});
test('three durable accepted responses complete, partial not complete, replay preserves earned module',()=>{
 const partial=recordRespectMicrocourse(read(),ids,{completedStories:['joke'],acceptedResponses:{joke:RESPECT_RESPONSES.joke[0]}},now);
 assert.equal(partial.passed,false);assert.equal(partial.progress,67);
 const done=recordRespectMicrocourse(partial,ids,all(),now);
 assert.equal(done.passed,true);assert.equal(done.progress,100);assert.equal(done.score,null);
 assert.equal(recordRespectMicrocourse(done,ids,{completedStories:[],acceptedResponses:{}},now).passed,true);
 assert.equal(completeRespectLesson(done,ids,'lc-1',now).completed_at,now);
});
test('respect migration and updates never touch another course',()=>{
 const privacy={...empty,course_id:'data-privacy'};
 assert.deepEqual(normalizeRespectProgress(privacy,ids),privacy);
 assert.throws(()=>completeRespectLesson(privacy,ids,'lc-1',now));
});
