/**
 * sne measurer (issue #168). Renders the two held rows (`tests/fixtures/timing/cov-embedded-state`,
 * `tests/fixtures/wire/cov-embedded-state-note`), every planning probe under `measurements/probes/` (jar oracle in
 * `probes/jar/<name>.svg`), every pinned row under `tests/fixtures/state-note-embed/` (jar `.svg` beside it), and any
 * extra `.puml` paths given, through `renderSync` + `DeterministicMeasurer` (the survey's path), then compares with
 * `compareSvg(ours, jar, 'deterministic')`.
 *
 *   npx tsx plans/state-note-embed/measurements/measure-rows.mts [out.json] [extra.puml...]
 *
 * Prints `rows N zero Z open O error E`, then one line per row: diffs, weighted score, `<image>` ours/jar, canvas
 * ours/jar, first diff path. `compareSvg` stops at a `childCount` mismatch: read the `<image>` counts, not only the
 * diffs. Run from the repo root.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';

const PROBES = 'plans/state-note-embed/measurements/probes';
const FIXTURES = 'tests/fixtures/state-note-embed';
const HELD = ['tests/fixtures/timing/cov-embedded-state.puml', 'tests/fixtures/wire/cov-embedded-state-note.puml'];
const [outPath = '/tmp/sne-rows.json', ...extra] = process.argv.slice(2);

const pumlsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.puml'))
        .sort()
        .map((f) => join(dir, f))
    : [];
const files = [...HELD, ...pumlsIn(PROBES), ...pumlsIn(FIXTURES), ...extra];

const jarFor = (f: string): string =>
  dirname(f) === PROBES ? join(PROBES, 'jar', `${basename(f, '.puml')}.svg`) : f.replace(/\.puml$/, '.svg');
const images = (svg: string): number => (svg.match(/<image\b/g) ?? []).length;
const canvas = (svg: string): string => /viewBox="0 0 (\d+) (\d+)"/.exec(svg)?.slice(1).join('x') ?? '?';

interface Row {
  readonly row: string;
  readonly diffs: number;
  readonly weighted: number;
  readonly images: string;
  readonly canvas: string;
  readonly first: string;
  readonly error?: string;
}

const rows: Row[] = files.map((f) => {
  const row = f.replace(/^tests\/fixtures\//, '').replace(/^plans\/state-note-embed\/measurements\//, '');
  try {
    const jar = readFileSync(jarFor(f), 'utf8');
    const ours = renderSync(readFileSync(f, 'utf8'), { measurer: new DeterministicMeasurer() });
    const { diffs } = compareSvg(ours, jar, 'deterministic');
    return {
      row,
      diffs: diffs.length,
      weighted: weightedScore(diffs),
      images: `${String(images(ours))}/${String(images(jar))}`,
      canvas: `${canvas(ours)} / ${canvas(jar)}`,
      first: diffs[0]?.path ?? '',
    };
  } catch (e) {
    return { row, diffs: -1, weighted: -1, images: '?', canvas: '?', first: '', error: String(e) };
  }
});

const zero = rows.filter((r) => r.diffs === 0).length;
const errors = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${String(rows.length)} zero ${String(zero)} open ${String(rows.length - zero - errors)} error ${String(errors)}`);
for (const r of rows) {
  console.log(`${r.row}\t${String(r.diffs)}\tw${String(r.weighted)}\timg ${r.images}\t${r.canvas}\t${r.first}${r.error ?? ''}`);
}
writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`);
