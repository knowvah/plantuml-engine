// Port seed lines against the jar's `-preproc` file, for every <name>.puml with a <name>.preproc beside it.
// Prints each differing hunk's shape. Usage: npx jiti plans/c4-divergence-drive/measurements/seed-probe.mts <dir>
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';

const dir = process.argv[2];
if (dir === undefined) throw new Error('usage: seed-probe.mts <dir>');
const includeStore = fixtureIncludeStore();
let equal = 0;
const files = readdirSync(dir).filter((f) => f.endsWith('.puml'));
for (const f of files) {
  const block = buildBlockUmls(readFileSync(join(dir, f), 'utf8'), { includeStore } as never)[0];
  if (block === undefined || !block.ok) {
    console.log(`${f}: no block`);
    continue;
  }
  const jar = readFileSync(join(dir, f.replace(/\.puml$/, '.preproc')), 'utf8').replace(/\n$/, '').split('\n');
  const ours = block.seedSource;
  if (JSON.stringify(jar) === JSON.stringify(ours)) {
    equal++;
    continue;
  }
  const jarSet = new Set(jar);
  const oursSet = new Set(ours);
  const onlyOurs = ours.filter((l) => !jarSet.has(l));
  const onlyJar = jar.filter((l) => !oursSet.has(l));
  console.log(`${f}: ours ${ours.length} jar ${jar.length}; only ours ${onlyOurs.length}: ${onlyOurs.slice(0, 2).map((s) => s.slice(0, 70)).join(' | ')}; only jar ${onlyJar.length}: ${onlyJar.slice(0, 2).map((s) => s.slice(0, 90)).join(' | ')}`);
}
console.log(`equal ${equal}/${files.length}`);
