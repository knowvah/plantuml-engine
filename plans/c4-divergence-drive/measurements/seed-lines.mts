// The port's UmlSource seed lines for one .puml, one per line, through the survey's include store.
// Compare with the jar's `-preproc` output to find where the seed first departs.
// Usage: npx jiti plans/c4-divergence-drive/measurements/seed-lines.mts <in.puml> <out.txt>
import { readFileSync, writeFileSync } from 'node:fs';

import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';

const [inPath, outPath] = process.argv.slice(2);
if (inPath === undefined || outPath === undefined) throw new Error('usage: seed-lines.mts <in.puml> <out.txt>');
const blocks = buildBlockUmls(readFileSync(inPath, 'utf8'), { includeStore: fixtureIncludeStore() } as never);
const block = blocks[0];
if (block === undefined || !block.ok) throw new Error(`no block: ${JSON.stringify(block)}`);
writeFileSync(outPath, `${block.seedSource.join('\n')}\n`);
console.log(`lines ${block.seedSource.length}`);
