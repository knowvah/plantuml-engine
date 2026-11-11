/**
 * `npx jiti plans/creole-math-factories-port/measurements/repin-factories-baseline.mts [--write] [--accept-rises a,b]`
 *
 * Regenerates `oracle/goldens/svg-factories/diff-baseline.json` for every
 * `FACTORIES_SLUGS` row NOT pinned in `ratchet.json` (the golden ratchet owns
 * pinned rows; the shape test requires the two sets to be disjoint and to
 * cover the 41 slugs exactly). Reuses the gate's own measurement --
 * `measureFactoriesSlug` (`render-fixture-factories.ts`: `renderFixtureFactories`
 * + `DeterministicMeasurer` + `compareSvg`/`weightedScore`) -- never a
 * re-derivation. Copy of `plans/utility-factories-port/measurements/repin-utility-baseline.mts`.
 *
 * Rows: a render that throws, renders the dispatcher's ERROR_SENTINEL or this
 * port's error banner is `status: "error"` with the reason; anything else is
 * `status: "baseline"` with the fresh `weightedScore`/`diffCount`. Every
 * weightedScore RISE against the committed manifest is printed and refused
 * unless `--accept-rises` names the slug. Without `--write` nothing is written.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FACTORIES_CACHE_TYPE, FACTORIES_SLUGS, measureFactoriesSlug } from '../../../tests/oracle/svg-conformance/render-fixture-factories.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '../../..');
const GOLDENS = join(REPO, 'oracle/goldens/svg-factories');
const MANIFEST = join(GOLDENS, 'diff-baseline.json');
const RATCHET = join(GOLDENS, 'ratchet.json');
const CACHE = join(REPO, 'test-results/dot-cache');

interface Row {
  readonly type: string;
  readonly slug: string;
  readonly status: 'baseline' | 'error';
  readonly weightedScore: number | null;
  readonly diffCount: number | null;
  readonly reason?: string;
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
}

type Measured = Omit<Row, 'measuredAt' | 'measuredAgainstCommit'>;

function measure(slug: string): Measured {
  const m = measureFactoriesSlug(CACHE, slug);
  if (m.errored) {
    return { type: FACTORIES_CACHE_TYPE, slug, status: 'error', weightedScore: null, diffCount: null, reason: m.reason };
  }
  return { type: FACTORIES_CACHE_TYPE, slug, status: 'baseline', weightedScore: m.weightedScore, diffCount: m.diffCount };
}

function main(): void {
  const argv = process.argv.slice(2);
  const write = argv.includes('--write');
  const ar = argv.indexOf('--accept-rises');
  const accepted = new Set(ar >= 0 ? (argv[ar + 1] ?? '').split(',').filter(Boolean) : []);
  const pinned = new Set((JSON.parse(readFileSync(RATCHET, 'utf8')) as { fixtures: { slug: string }[] }).fixtures.map((f) => f.slug));
  let old: { $comment?: string; fixtures: Row[] } = { fixtures: [] };
  try {
    old = JSON.parse(readFileSync(MANIFEST, 'utf8')) as typeof old;
  } catch {
    console.log('no committed diff-baseline.json yet (first seed)');
  }
  const oldBySlug = new Map(old.fixtures.map((f) => [f.slug, f]));
  const slugs = FACTORIES_SLUGS.filter((s) => !pinned.has(s));
  const measuredAt = new Date().toISOString().slice(0, 10);
  const measuredAgainstCommit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim();
  const rows: Row[] = [];
  const rises: string[] = [];
  for (const slug of slugs) {
    const m = measure(slug);
    const prev = oldBySlug.get(slug);
    const prevScore = prev?.weightedScore ?? null;
    const tag = prevScore === null ? `(was ${prev?.status ?? 'absent'})` : `(was ${prevScore})`;
    if (prevScore !== null && m.weightedScore !== null && m.weightedScore > prevScore && !accepted.has(slug)) rises.push(slug);
    console.log(`${slug.padEnd(20)} ${m.status.padEnd(8)} ws=${String(m.weightedScore).padEnd(5)} dc=${String(m.diffCount).padEnd(4)} ${tag}`);
    rows.push({ ...m, measuredAt, measuredAgainstCommit });
  }
  console.log(`\n${rows.length} unpinned row(s); ${pinned.size} pinned in ratchet.json; ${rows.filter((r) => r.status === 'error').length} error row(s)`);
  if (rises.length > 0) {
    console.error(`REFUSED: weightedScore ROSE for ${rises.join(', ')} -- pass --accept-rises with a journal row`);
    process.exitCode = 1;
    return;
  }
  if (!write) {
    console.log('dry run -- pass --write to update diff-baseline.json');
    return;
  }
  const out = old.$comment === undefined ? { fixtures: rows } : { $comment: old.$comment, fixtures: rows };
  writeFileSync(MANIFEST, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`wrote ${MANIFEST}`);
}

main();
