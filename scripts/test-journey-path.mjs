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
    assert.ok(geometry.anchor >= width * .3 && geometry.anchor <= width * .7, 'Guardian stays inside the viewport');
  }
  for (let tick = 0; tick <= 100; tick++) {
    const geometry = journeyGeometry(tick / 100, width, 7);
    assert.ok(geometry.chapter >= 0 && geometry.chapter < 7);
    assert.ok(geometry.offset - width <= 0 && geometry.offset + geometry.trackWidth + width >= width, 'Bridge spans both viewport edges through the full crossing');
    assert.ok(geometry.guardianAnchor >= 100 && geometry.guardianAnchor <= width - 100, 'Guardian body remains on screen');
  }
}
assert.equal(journeyGeometry(-1, 390, 7).chapter, 0);
assert.equal(journeyGeometry(2, 390, 7).chapter, 6);
console.log('Journey path passed: all 7 chapter alignments, 707 viewport crossings, endpoint clamps.');
