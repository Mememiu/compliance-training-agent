import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Re-import the reviewed final export. Never rebuild or mutate the source
// project: a new export must have its hash and hook anchors explicitly reviewed.
export const SOURCE_SHA256 = '3bde6eef970e1c91cc253b18fa5aed76062e3f84e3465b2232f3dddb42369f74';
const defaultSource = '/Users/skyris/Documents/培训/recruiting-dashboard/exports/多停一秒_尊重有界_V1.html';

export function adaptRespectMicrocourse(source) {
  const hash = createHash('sha256').update(source).digest('hex');
  if (hash !== SOURCE_SHA256) throw new Error(`Unreviewed microcourse source hash: ${hash}`);
  let html = source;
  const replaceOnce = (anchor, replacement) => {
    if (html.split(anchor).length !== 2) throw new Error(`Import anchor not unique: ${anchor.slice(0, 100)}`);
    html = html.replace(anchor, replacement);
  };
  replaceOnce('<script>', '<script src="./bridge.js"></script>\n<script>');
  replaceOnce(
    '/* In-memory per-story state. Refresh resets this preview; no storage or telemetry.',
    '/* Embedded per-story state. This adapter saves progress locally; no telemetry.',
  );
  replaceOnce(
    "const progress=Object.fromEntries(STORIES.map(s=>[s.id,fresh()]));\nlet active=STORIES[0].id,view='office',returnFocus=null;",
    "const restored=window.RespectTrainingBridge.restore();\nconst progress=restored.progress;\nlet active=restored.active,view=restored.view,returnFocus=null;",
  );
  replaceOnce('function render(){', 'function render(){\n window.RespectTrainingBridge.save({active,view,progress});');
  replaceOnce(
    'if(story().feedback[state().choice].accepted){state().completed=true;takeaway();}',
    'if(story().feedback[state().choice].accepted){if(!window.RespectTrainingBridge.complete({active,view,progress}))return;state().completed=true;takeaway();}',
  );
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = process.argv[2] || defaultSource;
  const destination = new URL('../public/microcourses/respect/', import.meta.url);
  const html = adaptRespectMicrocourse(await readFile(source, 'utf8'));
  await mkdir(destination, { recursive: true });
  await writeFile(new URL('index.html', destination), html);
  console.log(`Imported finalized respect microcourse (${Buffer.byteLength(html)} bytes); source SHA-256 ${SOURCE_SHA256}`);
}
