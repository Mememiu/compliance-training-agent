import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Reviewed user-authored final preview, not regenerated from mutable sources.
export const SOURCE_SHA256='b9da38167a9e5b3ad1a5e746428ad4e5a2023968de86e315b2fe59cbd028157e';
export function adaptIntegrityMicrocourse(source) {
  const hash=createHash('sha256').update(source).digest('hex');
  if(hash!==SOURCE_SHA256)throw Error(`Unreviewed microcourse source hash: ${hash}`);
  let html=source;
  const once=(anchor,replacement)=>{
    if(html.split(anchor).length!==2)throw Error(`Import anchor not unique: ${anchor.slice(0,100)}`);
    html=html.replace(anchor,replacement);
  };
  once('<script>/* Standalone local learning engine.', '<script src="./bridge.js"></script>\n<script>/* Integrated local learning engine.');
  once('Local progress only; no network or score bridge.', 'Local progress with authenticated training-room completion bridge.');
  once("  const STORAGE_KEY = 'duoting-integrity-v1-progress';\n  let pending = null;\n  let storageAvailable = true;\n  let storageNotice = '';", '  let pending = null;');
  const start=html.indexOf('  function loadProgress() {');
  const end=html.indexOf('  const story = () => stories[index];');
  if(start<0 || end<=start)throw Error('Missing storage function anchors');
  once(html.slice(start,end),`  function loadProgress() {
    const saved=window.IntegrityTrainingBridge.restore(validSave);
    if (saved && saved.progress.some(p=>p.done || p.phase!=='intro')) pending=saved;
  }
  function saveProgress() {
    if (!pending) window.IntegrityTrainingBridge.save({index,summary,progress});
    $('save-status').textContent=window.IntegrityTrainingBridge.notice();
  }
`);
  once("      // Remove the old slot first so a failed subsequent write cannot resurrect it.\n      try { window.localStorage.removeItem(STORAGE_KEY); storageAvailable=true; } catch { storageAvailable=false; }\n      pending=null; progress=fresh(); index=0; summary=false; storageNotice=''; render(true); return;", "      if (!window.IntegrityTrainingBridge.reset()) { $('save-status').textContent=window.IntegrityTrainingBridge.notice(); return; }\n      pending=null; progress=fresh(); index=0; summary=false; render(true); return;");
  once("else if (action === 'complete' && p.phase === 'reflect') {p.done=true;p.phase='done';}", "else if (action === 'complete' && p.phase === 'reflect') {\n      if (!window.IntegrityTrainingBridge.complete({index,summary,progress})) { $('save-status').textContent=window.IntegrityTrainingBridge.notice(); return; }\n      p.done=true;p.phase='done';\n    }");
  once('本页是独立互动预览，不写入培训室成绩，也不替代原课时与正式测验。','本互动微课已接入培训室。完成三段情境后同步本模块完成状态；请以培训室显示的保存结果为准。学习记录保存在当前浏览器中。');
  return html;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const source=process.argv[2] || new URL('../public/microcourses/integrity-preview/index.html',import.meta.url);
  const destination=new URL('../public/microcourses/integrity/',import.meta.url);
  const html=adaptIntegrityMicrocourse(await readFile(source,'utf8'));
  await mkdir(destination,{recursive:true});await writeFile(new URL('index.html',destination),html);
  console.log(`Imported finalized integrity microcourse (${Buffer.byteLength(html)} bytes); source SHA-256 ${SOURCE_SHA256}`);
}
