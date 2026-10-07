import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/data/work-catalog.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { workCategories, routeHash, parseRoute } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
assert.equal(workCategories.length, 7);
assert.equal(workCategories.flatMap(category => category.projects).length, 17);
const ids = new Set();
for (const category of workCategories) {
  assert.ok(category.projects.length >= 2 && category.projects.length <= 3);
  for (const project of category.projects) {
    assert.ok(!ids.has(project.id), 'A project must not appear twice'); ids.add(project.id);
    const route = { page: 'work', category: category.id, project: project.id };
    assert.deepEqual(parseRoute(routeHash(route)), route, 'Direct project links must round-trip');
    if (project.source) assert.ok(project.source.startsWith('https://github.com/NaReddyJashwanthReddy/'));
  }
}
assert.deepEqual(parseRoute('#work/nonexistent/project'), { page: 'work' });
assert.deepEqual(parseRoute('#work/computer-vision/missing'), { page: 'work', category: 'computer-vision', project: undefined });
assert.deepEqual(parseRoute('#work/computer-vision/style-transfer'), { page: 'work', category: 'generative-images', project: 'style-transfer' }, 'Previously shared style-transfer links must still open the project');
assert.deepEqual(parseRoute('#unexpected'), { page: 'home' });
assert.ok(!/0\.98|98%|>99%|BLEU 0\.8/.test(source), 'Unverified metric claims must stay out of public copy');
const medical = workCategories.flatMap(category => category.projects).find(project => project.id === 'medical-language');
assert.ok(medical.story.includes('Qwen3'), 'Use the base model confirmed by the user');
assert.ok(!/masked|\bMLM\b/i.test(JSON.stringify(medical)), 'The Qwen3 workflow must not be described as encoder MLM');
assert.ok(workCategories.find(category => category.id === 'nlp').projects.find(project => project.id === 'bert-sentiment').tech.includes('Masked language modeling'));
assert.equal(workCategories.flatMap(category => category.projects).find(project => project.id === 'agentforge').status, 'In development');
console.log('Work catalogue checks passed: 7 collections, 17 unique entries, all direct project links, invalid-link fallbacks and model/metric claim boundaries.');
