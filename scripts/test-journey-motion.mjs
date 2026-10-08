import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/components/ui/journey-motion.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { journeyMotion, advanceJourney } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
let state = advanceJourney(journeyMotion(), .4, 1 / 60);
assert.equal(state.phase, 'summon');
for (let i = 0; i < 119; i++) { state = advanceJourney(state, .4, 1 / 60); assert.equal(state.progress, 0); }
for (let i = 0; i < 1500 && state.phase !== 'idle'; i++) {
  const previous = state;
  state = advanceJourney(state, .4, 1 / 60);
  if (state.progress !== previous.progress) assert.equal(previous.phase, 'travel', 'Only travel advances the scene');
}
assert.equal(state.phase, 'idle'); assert.equal(state.progress, .4); assert.equal(state.direction, 1);
state = advanceJourney(state, .1, 1 / 60);
assert.equal(state.phase, 'summon'); assert.equal(state.direction, -1);
state = advanceJourney(state, .1, 0);
assert.equal(state.elapsed, 0, 'Loading or hidden frames do not advance formation');
state = advanceJourney(state, .1, 2);
assert.equal(state.phase, 'travel'); assert.equal(state.progress, .4);
state = advanceJourney(state, .8, .05);
assert.equal(state.direction, 1, 'Reversing the request during travel turns the dragon');
assert.ok(state.progress > .4 && state.progress < .41, 'Continuous input does not teleport the scene');
state = advanceJourney(state, .8, .05, false);
assert.equal(state.phase, 'idle'); assert.equal(state.progress, .8, 'Reduced motion provides an instant accessible chapter seek');
assert.equal(advanceJourney(journeyMotion(), -2, 0, false).progress, 0);
assert.equal(advanceJourney(journeyMotion(), 2, 0, false).progress, 1);
console.log('Journey choreography passed: scene held during cloud formation/dissolve, movement only during travel, direction changes, buffering, reduced motion and endpoints.');
