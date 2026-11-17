/**
 * eea measurer (issue #150). Renders the issue's fixture (`tests/fixtures/c4dd-T1b/emoji-mixed-edge.puml`), every
 * `.puml` under `measurements/probes/` and, from T1a on, `tests/fixtures/emoji-edge-artwork/`, through `renderSync` +
 * `DeterministicMeasurer` WITH the emoji asset store the survey wires (`scripts/svg-parity-survey.ts`). Compares with
 * the jar SVG via `compareSvg(ours, jar, 'deterministic')` and prints one line per probe: name, diff count, then the
 * first 3 diffs as `path ours→jar`. Ends with `rows N zero Z open O error E`.
 *
 *   npx tsx plans/emoji-edge-artwork/measurements/measure-eea.mts [out.json] [extra.puml...]
 *
 * An extra `.puml` needs its jar `.svg` beside it, or at `oracle/<name>.svg` beside it. Run from the repo root.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { buildEmojiAssetsStore } from '../../../tests/helpers/emoji-assets-store.js';

const ISSUE = 'tests/fixtures/c4dd-T1b/emoji-mixed-edge.puml';
const PROBES = 'plans/emoji-edge-artwork/measurements/probes';
const FIXTURES = 'tests/fixtures/emoji-edge-artwork';
const SHOWN = 3;

interface Row {
  name: string;
  n?: number;
  first?: string[];
  error?: string;
}

const assetStore = buildEmojiAssetsStore();
const render = (puml: string): string => renderSync(puml, { measurer: new DeterministicMeasurer(), assetStore });
const pumls = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.puml'))
        .sort()
        .map((f) => join(dir, f))
    : [];
function jarFor(f: string): string {
  const name = basename(f, '.puml');
  if (f.startsWith(PROBES)) return join(PROBES, 'jar', `${name}.svg`);
  const beside = f.replace(/\.puml$/, '.svg');
  return existsSync(beside) ? beside : join(dirname(f), 'oracle', `${name}.svg`);
}

const [out, ...extra] = process.argv.slice(2);
const rows: Row[] = [];
for (const f of [ISSUE, ...pumls(PROBES), ...pumls(FIXTURES), ...extra]) {
  const name = f === ISSUE ? 'issue-150' : basename(f, '.puml');
  try {
    const jar = readFileSync(jarFor(f), 'utf8');
    const { diffs } = compareSvg(render(readFileSync(f, 'utf8')), jar, 'deterministic');
    const first = diffs.slice(0, SHOWN).map((d) => `${d.path} ${String(d.actual)}→${String(d.expected)}`);
    rows.push({ name, n: diffs.length, first });
  } catch (e) {
    rows.push({ name, error: e instanceof Error ? e.message : String(e) });
  }
}
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.name}\tERROR\t${r.error}`);
  else console.log(`${r.name}\t${r.n}\t${r.first?.join(' | ') ?? ''}`);
}
const zero = rows.filter((r) => r.n === 0).length;
const errors = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - errors} error ${errors}`);
if (out !== undefined) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
