/**
 * auc planning measurer.
 *
 *   npx tsx plans/activity-unknown-colour/measurements/measure.mts [dir] [out.json]
 *
 * Renders every `.puml` in `dir` (default `plans/activity-unknown-colour/measurements/probes`) through `renderSync` +
 * `DeterministicMeasurer`, compares it with `<dir>/jar/<name>.svg` (or `<dir>/<name>.svg` when there is no `jar/`
 * folder, as in `tests/fixtures/unresolved-colour/`), and reports per row:
 *   - `jar`: the jar's error message (`No such color`, `Syntax Error?`) or `draws`;
 *   - `ours`: `ERROR` when our error-page observer fired, else `draws`;
 *   - `diffs`: `compareSvg(ours, jar, 'deterministic')`;
 *   - `invalid`: `invalidColours(ours)`;
 *   - `neutral`: whether ours paints `UNKNOWN_COLOR_NEUTRAL` (`#D3D3D3`, `HColorSet.ts`).
 * Prints `rows N zero Z jarError E neutral K invalid I oursError O`. Run from the repo root, alone.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { invalidColours } from '../../../tests/helpers/svg-colour-validity.js';

const DIR = process.argv[2] ?? 'plans/activity-unknown-colour/measurements/probes';
const OUT = process.argv[3];
const JAR_DIR = existsSync(join(DIR, 'jar')) ? join(DIR, 'jar') : DIR;
const JAR_MESSAGE = /No such color|Syntax Error\?/;

interface Row {
  name: string;
  jar: string;
  ours: 'ERROR' | 'draws';
  diffs: number;
  invalid: string[];
  neutral: boolean;
}

let errored = false;
setErrorPageObserver(() => {
  errored = true;
});

const rows: Row[] = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.puml')).sort()) {
  const name = basename(file, '.puml');
  const jarSvg = readFileSync(join(JAR_DIR, `${name}.svg`), 'utf8');
  errored = false;
  const ours = renderSync(readFileSync(join(DIR, file), 'utf8'), { measurer: new DeterministicMeasurer() });
  rows.push({
    name,
    jar: JAR_MESSAGE.exec(jarSvg)?.[0] ?? 'draws',
    ours: errored ? 'ERROR' : 'draws',
    diffs: compareSvg(ours, jarSvg, 'deterministic').diffs.length,
    invalid: invalidColours(ours),
    neutral: ours.includes(UNKNOWN_COLOR_NEUTRAL),
  });
}
setErrorPageObserver(undefined);

for (const r of rows) {
  const inv = r.invalid.length === 0 ? '' : ` invalid ${r.invalid.join(',')}`;
  console.log(`${r.name.padEnd(22)} jar ${r.jar.padEnd(14)} ours ${r.ours} diffs ${r.diffs} neutral ${r.neutral}${inv}`);
}
const count = (p: (r: Row) => boolean): number => rows.filter(p).length;
console.log(
  `rows ${rows.length} zero ${count((r) => r.diffs === 0)} jarError ${count((r) => r.jar !== 'draws')} ` +
    `neutral ${count((r) => r.neutral)} invalid ${count((r) => r.invalid.length > 0)} ` +
    `oursError ${count((r) => r.ours === 'ERROR')}`,
);
if (OUT !== undefined) writeFileSync(OUT, JSON.stringify(rows, null, 2));
