/** Preserve complete authored units. Crop boxes are in ORIGINAL source pixels.
 * Never mask a body/furniture part. Inspect generated images after changing boxes.
 * These JPGs remain private local inputs; outputs include reproducible provenance.
 */
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const requireRuntime = createRequire('/Users/skyris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const sharp = requireRuntime('sharp');
const base = process.argv[2] || '/Users/skyris/Downloads/ui 网页内素材';
const out = new URL('../public/microcourses/integrity-preview/assets/', import.meta.url);
await mkdir(out, { recursive: true });
const workers = 'isometric-professional-support-workers-set/40243.jpg';
const assets = [
  { id:'fees', source:workers, crop:{left:1380,top:220,width:1630,height:1120}, width:1400 },
  { id:'gifts', source:workers, crop:{left:3090,top:140,width:1300,height:1265}, width:1100 },
  { id:'conflict', source:'business-people-sitting-oval-desk-watching-lcd-screen-presentation-meeting-room-3d-isometric/1912.i109.028_meeting_room_isometric_set-03.jpg', width:1600 },
  { id:'reflection', source:'isometric-concept-esg-anti-corruption-policy-with-man-rejecting-bribe-3d-vector-illustration/2209.i301.024.F.m004.c9.ESG concept isometric background.jpg', width:1200 },
];
for (const asset of assets) {
  const input = await readFile(`${base}/${asset.source}`);
  const sourceMeta = await sharp(input).metadata();
  let image = sharp(input);
  if (asset.crop) image = image.extract(asset.crop);
  const output = await image.resize({width:asset.width,withoutEnlargement:true}).webp({quality:90}).toBuffer();
  const meta = await sharp(output).metadata();
  await writeFile(new URL(`${asset.id}.webp`,out),output);
  const provenance = {...asset,sourcePath:`${base}/${asset.source}`,sourceDimensions:[sourceMeta.width,sourceMeta.height],dimensions:[meta.width,meta.height],sourceSha256:createHash('sha256').update(input).digest('hex'),sha256:createHash('sha256').update(output).digest('hex'),origin:'User-provided stock illustration; permission not independently verified. No claim of newly generated artwork.',processing:asset.crop?'Rectangular crop of complete workstation, preserving source background; resize and WebP encoding.':'Entire source composition; resize and WebP encoding.'};
  await writeFile(new URL(`${asset.id}.webp.provenance.json`,out),JSON.stringify(provenance,null,2));
  // Impeccable metadata convention for WebP: origin sidecar travels with raster.
  await writeFile(new URL(`${asset.id}.webp.json`,out),JSON.stringify({prompt:`Sourced artwork, not AI-generated. ${provenance.sourcePath}. ${provenance.processing} Source SHA-256: ${provenance.sourceSha256}`},null,2));
  console.log(`${asset.id}: ${meta.width}×${meta.height}, ${output.length} bytes`);
}
