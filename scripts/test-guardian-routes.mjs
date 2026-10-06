import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/components/ui/guardian-routes.ts', import.meta.url), 'utf8');
const code = ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext });
const { roamBounds, destination, flightKind, flightPoint } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for (const [width, height, size] of [[1280,720,512], [390,860,339], [320,860,278], [768,640,400]]) {
  const bounds = roamBounds(width, height, size);
  assert(bounds.right > bounds.left && bounds.bottom > bounds.top);
  assert(bounds.left < width / 2 && bounds.right > width / 2, 'Both sides of the page must be reachable');
  assert(bounds.bottom > height * .72, 'Lower clouds must be reachable');
  assert(bounds.bottom - bounds.top > height * .25, 'Vertical roaming must cover a substantial part of the page');
  let from = { x: bounds.left + (bounds.right - bounds.left) * .2, y: bounds.top + (bounds.bottom - bounds.top) * .2 };
  let seed = 0x6a09e667;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  let recent = [];
  const stops = [], kinds = [], quadrants = [0,0,0,0];
  for (let trip = 0; trip < 120; trip++) {
    const kind = flightKind(random);
    kinds.push(kind);
    const to = destination(from, bounds, kind, random, recent);
    if (kind === 'vertical') assert.equal(to.x, from.x);
    if (kind === 'horizontal') assert.equal(to.y, from.y);
    assert(Math.hypot(to.x - from.x, to.y - from.y) > 8, 'Trips must visibly move');
    const bend = (random() * 2 - 1) * 130;
    for (let i = 0; i <= 100; i++) {
      const point = flightPoint(from, to, i / 100, bounds, bend);
      assert(point.x >= bounds.left - 1e-8 && point.x <= bounds.right + 1e-8);
      assert(point.y >= bounds.top - 1e-8 && point.y <= bounds.bottom + 1e-8);
    }
    assert.deepEqual(flightPoint(from, to, 0, bounds, bend), from);
    const end = flightPoint(from, to, 1, bounds, bend);
    assert(Math.abs(end.x - to.x) < 1e-8 && Math.abs(end.y - to.y) < 1e-8);
    recent = [...recent, from].slice(-6);
    stops.push(to);
    quadrants[(to.x > (bounds.left + bounds.right) / 2 ? 1 : 0) + (to.y > (bounds.top + bounds.bottom) / 2 ? 2 : 0)]++;
    from = to;
  }
  assert.equal(new Set(kinds).size, 3, 'All travel directions must occur');
  assert(kinds.some((kind, i) => i && kind === kinds[i-1]), 'Routes must not alternate in a fixed sequence');
  assert(quadrants.every(count => count >= 10), 'Roaming must explore all four regions');
  for (const [axis, min, max] of [['x',bounds.left,bounds.right], ['y',bounds.top,bounds.bottom]]) {
    const values = stops.map(point => point[axis]);
    assert(Math.max(...values) - Math.min(...values) > (max - min) * .8, 'Trips must explore the full available span');
    assert(values.filter(value => value > min + (max-min)*.2 && value < max - (max-min)*.2).length > 25, 'Interior destinations must occur, not just edge-to-edge loops');
  }
}
console.log('Guardian roaming checks passed: 480 varied trips explore both sides, lower clouds and interior regions; 48,480 curved path samples stay within desktop/tablet/mobile bounds.');
