/**
 * svg-dimension-style (sds) measurer. One line per probe: name, verdict, and the two root open tags when they differ.
 *
 *   npx tsx plans/svg-dimension-style/measurements/measure-sds.mts [out.json]
 *
 * Reads `measurements/probes/*.puml` + `probes/jar/*.svg` and, once T1 has moved them, the same pairs under
 * `tests/fixtures/svg-dimension-style/`. Verdicts:
 *   EXACT  - our root open tag (xmlns stripped) equals the jar's;
 *   DIMS   - equal once our root's style/width/height are removed: the #193 gap and nothing else;
 *   OTHER  - differs in more than those three attributes.
 * Render path: renderSync + DeterministicMeasurer, as the gate (decisions.md D3).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const PROBES = 'plans/svg-dimension-style/measurements/probes';
const FIXTURES = 'tests/fixtures/svg-dimension-style';

interface Pair {
  readonly name: string;
  readonly puml: string;
  readonly jar: string;
}

function pairsIn(dir: string, jarDir: string): Pair[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => {
      const name = f.slice(0, -'.puml'.length);
      return { name, puml: join(dir, f), jar: join(jarDir, `${name}.svg`) };
    })
    .filter((p) => existsSync(p.jar));
}

function rootOf(svg: string): string {
  const m = /<svg[^>]*>/.exec(svg);
  return m === null ? '' : m[0].replace(/ xmlns(:\w+)?="[^"]*"/g, '');
}

function withoutDims(root: string): string {
  return root.replace(/ style="[^"]*"/, '').replace(/ width="[^"]*"/, '').replace(/ height="[^"]*"/, '');
}

const rows = [...pairsIn(PROBES, join(PROBES, 'jar')), ...pairsIn(FIXTURES, FIXTURES)].map((p) => {
  const ours = rootOf(renderSync(readFileSync(p.puml, 'utf8'), { measurer: new DeterministicMeasurer() }));
  const jar = rootOf(readFileSync(p.jar, 'utf8'));
  const verdict = ours === jar ? 'EXACT' : withoutDims(ours) === jar ? 'DIMS' : 'OTHER';
  return { name: p.name, verdict, ours, jar };
});

for (const r of rows) {
  console.log(r.verdict === 'EXACT' ? `${r.name} EXACT` : `${r.name} ${r.verdict}\n  ours ${r.ours}\n  jar  ${r.jar}`);
}
const count = (v: string): number => rows.filter((r) => r.verdict === v).length;
console.log(`rows ${rows.length} exact ${count('EXACT')} dims ${count('DIMS')} other ${count('OTHER')}`);
if (process.argv[2] !== undefined) writeFileSync(process.argv[2], JSON.stringify(rows, null, 2));
