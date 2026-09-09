import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// This is a reproducible import, not a rebuild of the source course. An updated
// finalized export must be reviewed and its hook anchors/hash updated explicitly.
export const SOURCE_SHA256 = '9fca6b632cc93cbc718625bc23521fa66b071fcdaa63a22bfc50a36f72eb8df1';
const defaultSource = '/Users/skyris/Documents/培训/recruiting-dashboard/exports/多停一秒_企业员工隐私合规培训_V2.html';

export function adaptPrivacyMicrocourse(source) {
  const hash = createHash('sha256').update(source).digest('hex');
  if (hash !== SOURCE_SHA256) throw new Error(`Unreviewed microcourse source hash: ${hash}`);
  let html = source;
  const replaceOnce = (anchor, replacement) => {
    if (html.split(anchor).length !== 2) throw new Error(`Import anchor not unique: ${anchor.slice(0, 100)}`);
    html = html.replace(anchor, replacement);
  };
  replaceOnce('<script type="module" crossorigin>', '<script src="./bridge.js"></script>\n    <script type="module" crossorigin>');
  replaceOnce('"privacy-office-game-progress-v3"', '"training-room-privacy-game-v1"');
  replaceOnce('"privacy-course-v2-progress"', '"training-room-privacy-legacy-disabled-v1"');
  // The source counts exploration before the selftest. Keep visible and spoken
  // labels honest; only bridge.prepareCheckpoint may announce a passed selftest.
  replaceOnce('N4={locked:"未解锁","in-progress":"进行中",completed:"已通关"}', 'N4={locked:"未解锁","in-progress":"进行中",completed:"已排查"}');
  replaceOnce('${e}/6 间已通关', '${e}/6 间已排查');
  replaceOnce('A=e==="completed"?"已通关"', 'A=e==="completed"?"已排查"');
  replaceOnce('<p>${l?"新的办公室已经解锁":"整层排查已经完成"}</p>', '<p>本区隐患已找齐，请完成自测</p>');
  replaceOnce('${n.name}，通关</h2>', '${n.name}，隐患已找齐</h2>');
  replaceOnce(
    'X3(`${n.name}已通关。${l?`${l.name}已解锁。`:"六个办公室已全部完成。"}`)',
    'X3(`${n.name}隐患已找齐，请完成本区自测。${l?`${l.name}已解锁。`:"六个办公室的隐患已全部找齐，仍需完成各区自测。"}`)',
  );
  replaceOnce(
    'function l4(){try{return localStorage.setItem(C9,JSON.stringify(P.progress)),P.storageAvailable=!0,!0}catch{return P.storageAvailable=!1,!1}}',
    'function l4(){try{return localStorage.setItem(C9,JSON.stringify(P.progress)),P.storageAvailable=!0,window.PrivacyTrainingBridge.progressChanged(P.progress),!0}catch{return P.storageAvailable=!1,window.PrivacyTrainingBridge.storageError(),!1}}',
  );
  replaceOnce(
    'catch{return P.storageAvailable=!1,R5(null,null)}}function l4()',
    'catch{return P.storageAvailable=!1,window.PrivacyTrainingBridge.storageError(),R5(null,null)}}function l4()',
  );
  replaceOnce('A.dataset.state="correct",s.forEach', 'A.dataset.state="correct",window.PrivacyTrainingBridge.checkpointPassed(t.id),s.forEach');
  replaceOnce('P.progress=R5(null,null),l4(),U3({focusOfficeId:b1[0].id})', 'P.progress=R5(null,null),window.PrivacyTrainingBridge.reset(),l4(),U3({focusOfficeId:b1[0].id})');
  replaceOnce('a0(G),Hi(),Ji(),t?requestAnimationFrame', 'a0(G),Hi(),Ji(),window.PrivacyTrainingBridge.roomRendered(e.id),t?requestAnimationFrame');
  replaceOnce(
    'R2(A,{entry:!0})}),requestAnimationFrame(()=>{var i;',
    'R2(A,{entry:!0})}),window.PrivacyTrainingBridge.prepareCheckpoint(n.id,t),requestAnimationFrame(()=>{var i;',
  );
  replaceOnce('P.progress=ji();Y9();</script>', 'P.progress=ji();window.PrivacyTrainingBridge.connect(P.progress,()=>Zi());Y9();</script>');
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = process.argv[2] || defaultSource;
  const destination = new URL('../public/microcourses/privacy/', import.meta.url);
  const html = adaptPrivacyMicrocourse(await readFile(source, 'utf8'));
  await mkdir(destination, { recursive: true });
  await writeFile(new URL('index.html', destination), html);
  console.log(`Imported finalized privacy microcourse (${Buffer.byteLength(html)} bytes); source SHA-256 ${SOURCE_SHA256}`);
}
