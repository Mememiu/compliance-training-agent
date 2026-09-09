import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMicrocourse, acceptMicrocourseMessage, microcourseResumePath } from '../src/utils/courseMicrocourses';
test('course registry isolates channels and supports only integrated courses', () => {
 const privacy=getMicrocourse('data-privacy')!, respect=getMicrocourse('labor-compliance')!;
 assert.equal(getMicrocourse('anti-corruption'), undefined);
 assert.equal(getMicrocourse('constructor'), undefined);
 assert.notEqual(privacy.channel,respect.channel);
 const frame={} as Window, token='nonce', origin='https://example.org';
 const event=(data:unknown,source=frame,o=origin)=>({data,source,origin:o}) as MessageEvent;
 const payload={channel:respect.channel,type:'state',token,snapshot:{completedStories:['joke'],acceptedResponses:{joke:'support'}}};
 assert.equal(acceptMicrocourseMessage(event(payload),frame,origin,token,respect)?.type,'state');
 for(const e of [event(payload,{} as Window),event(payload,frame,'https://other.org'),event({...payload,token:'old'}),event({...payload,channel:privacy.channel}),event({...payload,snapshot:{completed:true}})]) assert.equal(acceptMicrocourseMessage(e,frame,origin,token,respect),null);
 assert.equal(microcourseResumePath('labor-compliance',undefined,['lc-1','lc-2']),'/course/labor-compliance/lesson/lc-1');
});
