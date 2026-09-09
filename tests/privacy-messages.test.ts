import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acceptPrivacyMessage } from '../src/utils/privacyMessages';
test('messages require exact frame, same origin, channel and per-mount token', () => {
  const frame = {} as Window;
  const data = { channel: 'training-room/privacy-v1', type: 'state', token: 'nonce', snapshot: { completedOffices: [], foundHazards: {}, passedCheckpoints: [] } };
  const event = { source: frame, origin: 'http://localhost:5173', data } as MessageEvent;
  const accept = (e: MessageEvent) => acceptPrivacyMessage(e, frame, 'http://localhost:5173', 'nonce');
  assert.equal(accept(event)?.type, 'state');
  assert.equal(accept({...event, origin:'https://evil.example'} as MessageEvent), null);
  assert.equal(accept({...event, source:{} as Window} as MessageEvent), null);
  assert.equal(accept({...event, data:{...data, token:'old'}} as MessageEvent), null);
  assert.equal(accept({...event, data:{...data, channel:'wrong'}} as MessageEvent), null);
  assert.equal(accept({...event, data:{...data, snapshot:{completed:true}}} as MessageEvent), null);
  assert.equal(accept({...event, data:{channel:data.channel,type:'ready'}} as MessageEvent)?.type,'ready');
});
