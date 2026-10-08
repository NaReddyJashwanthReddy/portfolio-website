import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import ts from 'typescript';

const moduleFrom = async name => {
  const source = await readFile(new URL(`../src/components/ui/${name}.ts`, import.meta.url), 'utf8');
  const code = ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
};
const { clipFrame, GuardianTextures } = await moduleFrom('guardian-animation');
const { roamBounds, roamingMemory, rememberedDestination } = await moduleFrom('guardian-routes');
for (const profile of ['desktop', 'mobile']) {
  const base = new URL(`../public/assets/skygarden/guardian/v2/${profile}/`, import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('manifest.json', base), 'utf8'));
  for (const [name, clip] of Object.entries(manifest.animations)) {
    assert.equal(clip.pages.length, Math.ceil(clip.frames / manifest.pageFrames), `${profile}/${name}: no missing frames`);
    assert.equal(clipFrame(clip, -1), 0);
    assert.equal(clipFrame(clip, 1000), clip.loop ? Math.floor(1000 * clip.fps) % clip.frames : clip.frames - 1);
    assert(clip.width * manifest.columns <= 2048);
    assert(clip.height * Math.ceil(Math.min(clip.frames, manifest.pageFrames) / manifest.columns) <= 2048);
    for (const file of clip.pages) assert((await stat(new URL(file, base))).size > 0);
  }
  assert.equal(manifest.animations.left.frames, 480);
  assert.equal(manifest.animations.left.fps, 60);
  assert.equal(manifest.animations.fire.loop, false);
  assert.equal(manifest.hoverSeconds, 5);
}

for (const [width, height, size] of [[1440,900,576], [390,844,257], [320,640,211]]) {
  const bounds = roamBounds(width, height, size), memory = roamingMemory();
  let from = { x: width / 2, y: height / 2 }, seed = 23456;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const directions = new Set();
  for (let i = 0; i < 300; i++) {
    const recent = [...memory.recent];
    const stop = rememberedDestination(from, bounds, memory, random);
    assert(!recent.includes(memory.recent.at(-1)), 'Avoid all six recent destinations');
    assert(stop.point.x >= bounds.left && stop.point.x <= bounds.right);
    assert(stop.point.y >= bounds.top && stop.point.y <= bounds.bottom);
    directions.add(stop.kind); from = stop.point;
  }
  assert(memory.visits.every(count => count > 0), 'Explore every region on desktop and phone');
  assert.equal(directions.size, 3);
}

// Coalesced decoding, bounded retention, missing-page recovery and disposal.
let decoded = 0;
globalThis.Image = class {
  async decode() { decoded++; if (this.src.includes('missing')) throw new Error('Missing test page'); }
};
const spec = { frames: 24, fps: 60, width: 4, height: 4, left: 0, top: 0, loop: true, pages: Array.from({ length: 12 }, (_, i) => `page-${i}`) };
let notifications = 0;
const cache = new GuardianTextures({ pageFrames: 2, columns: 2, animations: { idle: spec } }, '/', () => notifications++);
await Promise.all([cache.load('page-0'), cache.load('page-0')]); assert.equal(decoded, 1); assert.equal(notifications, 1, 'Wake a paused renderer when its new pose arrives');
for (let i = 1; i < 12; i++) await cache.load(`page-${i}`);
assert.equal(cache.count, 8, 'Keep GPU memory bounded');
assert.equal(cache.sample('idle', 11 / 60).frame, 11);
assert.equal(cache.sample('idle', 0), null, 'A missing page must let the renderer hold its current pose');
await assert.rejects(cache.load('missing'));
const beforeRetry = decoded;
await assert.rejects(cache.load('missing')); assert.equal(decoded, beforeRetry, 'Back off failed requests');
cache.dispose(); const disposedNotifications = notifications; await cache.load('other'); assert.equal(cache.count, 0, 'Do not retain textures after unmount'); assert.equal(notifications, disposedNotifications);
console.log('PASS: complete registered assets, full-screen roaming, frame timing, bounded cache and loading recovery');
