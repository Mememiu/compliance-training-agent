# Finalized privacy microcourse provenance and adapter

Imported on 2026-09-08 from the user's finalized export, read-only:

`/Users/skyris/Documents/培训/recruiting-dashboard/exports/多停一秒_企业员工隐私合规培训_V2.html`

Source SHA-256: `9fca6b632cc93cbc718625bc23521fa66b071fcdaa63a22bfc50a36f72eb8df1`.

Reproduce with `node scripts/import-privacy-microcourse.mjs [path-to-finalized-export]`.
The importer rejects unreviewed source hashes and missing/duplicate hook anchors.
It preserves the finalized export's inline artwork, CSS, animations and bundled
license notices. The original source project is never modified. This is not a
new license grant for the artwork or bundled dependencies.

The only export adaptations are namespaced local-storage keys, loading the
adjacent `bridge.js`, narrow adapter call sites, and six scoped completion-label
replacements. Topbar, map and route labels report “已排查”; the checkpoint's
initial title and screen-reader announcement say “隐患已找齐” and explicitly
require the selftest. Only the adapter's saved correct-answer state uses “通关”.
The adapter persists
correctly answered selftests separately because the standalone export counted a
room as complete as soon as its third hazard was found. It disables completion
actions until a correct answer is durably saved, and adds a resume-selftest button
inside any explored room whose selftest is still incomplete. Original dialog and
room animation functions are reused unchanged. Escape/back navigation can still
leave a dialog, but cannot pass a selftest; its resume button remains available.

## Parent–iframe protocol

Asset URL: `${BASE_URL}microcourses/privacy/index.html`.

All messages use `channel: 'training-room/privacy-v1'`. The iframe only accepts
same-origin messages from its actual `window.parent`; it never uses a wildcard
target origin. It emits `{channel,type:'ready'}` after connecting to game state.
The parent can send `{channel,type:'init',token}` either on frame load or ready;
both orders are supported. A nonempty token of at most 160 characters is required.

After initialization, the iframe sends:

```js
{channel, type: 'state', token, snapshot: {
  completedOffices: ['finance'],
  foundHazards: {finance: ['salary-screen', 'expense-documents', 'tax-drawer']},
  passedCheckpoints: ['finance']
}}
```

It reports storage failures with `{channel,type:'error',token,message}`. Storage
errors before handshake are retained and sent after initialization. The parent
must validate origin, iframe source, token, channel, room IDs and hazard IDs;
only all six explored offices **and** all six passed selftests complete the
module. No synthetic completion event is emitted on opening the iframe. A state
message on initialization only reports progress actually saved in this embedded
course, never the standalone export's historical storage.

Storage keys: `training-room-privacy-game-v1`,
`training-room-privacy-checkpoints-v1`. The disabled legacy migration key is
`training-room-privacy-legacy-disabled-v1`. In-game confirmed reset clears the
checkpoint record as well as the original exploration record.
