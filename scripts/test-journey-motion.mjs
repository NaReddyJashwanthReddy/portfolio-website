import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/components/ui/journey-motion.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { journeyMotion, advanceJourney } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
let state = advanceJourney(journeyMotion(), .4, 1 / 60);
assert.equal(state.phase, 'travel');
assert.equal(state.progress, .4, 'The first scroll frame moves immediately with a complete cloud');
for (let i = 0; i < 120; i++) { state = advanceJourney(state, .4, 1 / 60); assert.equal(state.progress, .4, 'No movement continues after scroll stops'); }
assert.equal(state.phase, 'idle'); assert.equal(state.progress, .4); assert.equal(state.direction, 1);
const cloudClock = state.elapsed;
state = advanceJourney(state, .4, 2);
assert.equal(state.elapsed, cloudClock, 'Idle keeps the same complete cloud frame');
state = advanceJourney(state, .1, 1 / 60);
assert.equal(state.phase, 'travel'); assert.equal(state.direction, -1); assert.equal(state.progress, .1);
state = advanceJourney(state, .7, 0);
assert.equal(state.progress, .7, 'Texture buffering does not delay the scene or build a scroll backlog');
state = advanceJourney(state, .8, .05);
assert.equal(state.direction, 1); assert.equal(state.progress, .8, 'The scene always matches the latest scrollbar position');
for (let i = 0; i < 600; i++) {
  const input = (Math.sin(i * .37) + 1) / 2;
  const before = state.progress;
  state = advanceJourney(state, input, 1 / 60);
  assert.equal(state.progress, input);
  if (before !== input) assert.equal(state.direction, input > before ? 1 : -1);
}
state = advanceJourney(state, .8, .05, false);
assert.equal(state.phase, 'idle'); assert.equal(state.progress, .8, 'Reduced motion provides an instant accessible chapter seek');
assert.equal(advanceJourney(journeyMotion(), -2, 0, false).progress, 0);
assert.equal(advanceJourney(journeyMotion(), 2, 0, false).progress, 1);
console.log('Journey scrolling passed: immediate travel, no backlog or post-scroll movement, cloud frame held at rest, reversal, cold textures, reduced motion and endpoints.');
