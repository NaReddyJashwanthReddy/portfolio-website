import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/components/ui/journey-path.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { journeyGeometry } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
for (const width of [320, 390, 759, 760, 1024, 1280, 1920]) {
  for (let index = 0; index < 7; index++) {
    const geometry = journeyGeometry(index / 6, width, 7);
    assert.equal(geometry.chapter, index);
    assert.ok(Math.abs(geometry.offset + index * geometry.step - geometry.anchor) < .001, 'Chapter and guardian align at every chapter stop');
    assert.equal(geometry.guardianAnchor, geometry.anchor, 'Dragon follows the chapter stem without a half-step lead');
    assert.ok(geometry.anchor >= 100 && geometry.anchor <= width - 100, 'Guardian stays inside the viewport');
  }
  for (let tick = 0; tick <= 100; tick++) {
    const geometry = journeyGeometry(tick / 100, width, 7);
    assert.ok(geometry.chapter >= 0 && geometry.chapter < 7);
    assert.ok(geometry.offset - width <= 0 && geometry.offset + geometry.trackWidth + width >= width, 'Bridge spans both viewport edges through the full crossing');
    assert.ok(geometry.guardianAnchor >= 100 && geometry.guardianAnchor <= width - 100, 'Guardian body remains on screen');
  }
}
// The mobile contract includes every original field, including selection timing.
for (const width of [320, 390, 759]) {
  for (let tick = -1; tick <= 101; tick++) {
    const progress = tick / 100;
    const p = Math.max(0, Math.min(1, progress));
    const step = width * 1.04, anchor = width * .5, distance = step * 6;
    const expected = { step, anchor, guardianAnchor: anchor, offset: anchor - distance * p,
      trackWidth: distance + width, chapter: Math.round(p * 6) };
    for (const direction of [1, -1]) {
      assert.deepEqual(journeyGeometry(progress, width, 7, { direction, chapter: 4, guardianWidth: 210 }), expected,
        'Mobile position, scrolling and chapter selection remain unchanged');
    }
  }
}
for (const width of [760, 1024, 1280, 1920]) {
  const start = journeyGeometry(0, width, 7);
  assert.ok(start.guardianAnchor < width * .3, 'Desktop starts beside the first chapter on the left');
  assert.equal(start.offset, start.guardianAnchor, 'First chapter and dragon start at the same point');
  const size = Math.max(170, Math.min(190, width * .15));
  const reach = size * .4 / start.step;
  for (let index = 1; index < 7; index++) {
    const touch = (index - reach) / 6;
    const contact = { direction: 1, chapter: index - 1, guardianWidth: size };
    assert.equal(journeyGeometry(touch - 1e-7, width, 7, contact).chapter, index - 1, 'Do not select before touching');
    const geometry = journeyGeometry(touch, width, 7, contact);
    assert.equal(geometry.chapter, index, 'Select on first forward contact');
    assert.ok(Math.abs(geometry.offset + index * geometry.step - geometry.guardianAnchor - size * .4) < .001,
      'Activation coincides with the dragon front touching the chapter stem');
  }
  for (let index = 0; index < 6; index++) {
    const touch = (index + reach) / 6;
    const contact = { direction: -1, chapter: index + 1, guardianWidth: size };
    assert.equal(journeyGeometry(touch + 1e-7, width, 7, contact).chapter, index + 1);
    assert.equal(journeyGeometry(touch, width, 7, contact).chapter, index, 'Select on first backward contact');
  }
  assert.equal(journeyGeometry(2.4 / 6, width, 7, { direction: -1, chapter: 2 }).chapter, 2,
    'Reversing mid-gap does not select an untouched chapter');
  assert.equal(journeyGeometry(2.6 / 6, width, 7, { direction: 1, chapter: 3 }).chapter, 3,
    'Changing back to forward scrolling preserves the touched chapter');
}
assert.equal(journeyGeometry(-1, 390, 7).chapter, 0);
assert.equal(journeyGeometry(2, 390, 7).chapter, 6);
console.log('Journey path passed: desktop starts at chapter one, activates on contact in both directions, preserves reversal state; 618 mobile snapshots exactly match the original behavior; alignment and bridge bounds pass.');
