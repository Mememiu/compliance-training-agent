/** Fresh lesson-3 template. No reading/copying lesson-1/2 exports or engines.
 * Artwork is embedded so copying index.html alone works offline via file://.
 * Edit src/integrity + data files, then run this script; never edit output by hand.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { stories, cast, legal } from '../src/data/integrity-stories.mjs';
import { scenes } from '../src/data/integrity-scenes.mjs';
const root=new URL('../',import.meta.url);
const output=new URL('public/microcourses/integrity-preview/',root);
await mkdir(output,{recursive:true});
const svg=paths=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
// Lucide-compatible simple interface symbols, no icons masquerading as scene art.
const icons={arrow:svg('<path d="M5 12h14m-6-6 6 6-6 6"/>'),check:svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),square:svg('<rect x="3" y="3" width="18" height="18" rx="4"/>'),lock:svg('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),pause:svg('<path d="M8 5v14M16 5v14"/>'),info:svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.01"/>')};
const assets={},provenance={};
for(const id of ['fees','conflict','gifts','reflection']){
  const buffer=await readFile(new URL(`assets/${id}.webp`,output));
  assets[id]=`data:image/webp;base64,${buffer.toString('base64')}`;
  provenance[id]=JSON.parse(await readFile(new URL(`assets/${id}.webp.provenance.json`,output),'utf8'));
  if(createHash('sha256').update(buffer).digest('hex')!==provenance[id].sha256)throw Error(`Stale provenance: ${id}`);
}
let html=await readFile(new URL('src/integrity/course.html',root),'utf8');
const style=await readFile(new URL('src/integrity/course.css',root),'utf8');
const engine=await readFile(new URL('src/integrity/course.js',root),'utf8');
const assetOrigins=Object.fromEntries(Object.entries(provenance).map(([id,meta])=>[id,{source:meta.source,origin:meta.origin,processing:meta.processing,sha256:meta.sha256}]));
const data=JSON.stringify({stories,cast,legal,scenes,assets,icons,assetOrigins}).replace(/</g,'\\u003c');
for(const [token,value] of Object.entries({INITIAL_ART:assets.fees,INLINE_STYLE:style,ICON_PAUSE:icons.pause,ICON_CHECK:icons.check,INLINE_DATA:`window.INTEGRITY=${data};`,INLINE_ENGINE:engine})) {
  const marker=`/* ${token} */`;
  if(!html.includes(marker))throw Error(`Missing template marker ${token}`);
  html=html.replace(marker,()=>value);
}
if(/\/\* INLINE_/.test(html))throw Error('Unresolved template');
await writeFile(new URL('index.html',output),html,'utf8');
await writeFile(new URL('source.json',output),JSON.stringify({title:'多停一秒 · 廉洁有度',version:'1.0.0',status:'User-approved V1 offline release; not deployed or integrated.',sourceLessons:['ac-1','ac-2','ac-3'],content:'src/data/integrity-stories.mjs',coordinates:'src/data/integrity-scenes.mjs',template:'src/integrity/course.html',htmlSha256:createHash('sha256').update(html).digest('hex'),assets:provenance},null,2),'utf8');
console.log(`Built offline HTML: ${decodeURI(new URL('index.html',output).pathname)} (${Buffer.byteLength(html)} bytes)`);
