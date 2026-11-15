/**
 * `npx jiti plans/dot-oracle-gap-rows/tools/pin-goldens.mts [--jar-error] <source-tag> <close-label> <slug...>`
 *
 * Pins zero-diff `@startdot` fixtures into the svg-dot ratchet (dogr D2,
 * adapted from `plans/class-oracle-gap-rows/tools/pin-goldens.mts`). The tool
 * does not check zero-diff itself: `dot.golden.ratchet.test.ts` does, on the
 * same `renderSync` call the mission measurer uses. Per slug:
 *
 * 1. copies `test-results/dot-cache/dot/<slug>/{in.svg,in.puml}` to
 *    `oracle/goldens/svg-dot/<slug>/{golden.svg,in.puml}` and re-reads both
 *    to prove byte equality;
 * 2. APPENDS `{ slug, addedAt, source }` to `ratchet.json`, never re-sorted
 *    (the ratchet tamper test reads `fixtures[0]`);
 * 3. clones the slug's `dot-cache`/`dot` twin row in `routing-baseline.json`
 *    and `refusal-baseline.json` as `tree: goldens, type: svg-dot` with fresh
 *    `measuredAt` / `measuredAgainstCommit`, and extends each file's
 *    `$comment`.
 *
 * `--jar-error` (dogr-T1b, D3) pins jar error-page rows, conformant by the
 * 2026-10-10 error-page ruling. The entry also carries `jarError` (copied
 * from `oracle/goldens/stock-error-pages.json` `dot/<slug>`) and the
 * `weightedScore` / `diffCount` measured on the ratchet path, the score the
 * ratchet holds. The routing twin must be `jar-error` with `jarErrored: true`
 * and the refusal twin `ok` with `weErrored: true`; both are cloned as they
 * are. A golden that is a graphviz document (`id="graph0"`) is refused.
 *
 * Everything is validated before anything is written: an already-pinned
 * slug, a missing cache file, or a twin row that is absent or unhealthy
 * aborts the whole run with no file touched.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// dogr-T1: copied from cogr (plans/class-oracle-gap-rows/tools) and adapted
// to svg-dot: one cache tree (`dot`), no `unknown/` subdirectory, no CLASS
// routing assertion (`@startdot` rows route NONE / NONE).
const MISSION = 'dot-oracle-gap-rows';
const GOLDEN_DIR = 'oracle/goldens/svg-dot';
const RATCHET = `${GOLDEN_DIR}/ratchet.json`;
const CACHE_DIR = 'test-results/dot-cache/dot';
const CACHE_TYPE = 'dot';
const GOLDEN_TYPE = 'svg-dot';
const STOCK_ERRORS = 'oracle/goldens/stock-error-pages.json';
/** graphviz's root group id: present in every document graphviz writes. */
const GRAPHVIZ_DOCUMENT_MARK = 'id="graph0"';
/** Per baseline: the healthy twin, on the plain path and on the jar-error path
 *  (`routing-baseline.json`'s `jar-error`/`jarErrored`, `refusal-baseline.json`'s
 *  `ok`/`weErrored` rows for the 8 error pages). */
const BASELINES = [
  {
    file: 'oracle/goldens/svg-conformance/routing-baseline.json',
    okStatus: 'agree',
    jarErrorStatus: 'jar-error',
    jarErrorFlag: 'jarErrored',
  },
  {
    file: 'oracle/goldens/svg-conformance/refusal-baseline.json',
    okStatus: 'ok',
    jarErrorStatus: 'ok',
    jarErrorFlag: 'weErrored',
  },
] as const;

type Row = Record<string, unknown> & { tree: string; type: string; slug: string; status: string };
interface Baseline { $comment: string; fixtures: Row[] }
interface JarError { line: number | null; message: string }
interface Score { weightedScore: number; diffCount: number }
type RatchetRow = { slug: string; addedAt: string; source: string } & Partial<{ jarError: JarError } & Score>;
interface Ratchet { fixtures: RatchetRow[] }

export interface PinOptions {
  root: string;
  sourceTag: string;
  closeLabel: string;
  slugs: string[];
  date: string;
  commit: string;
  /** Present: pin jar error-page rows (D3); `measure` scores a slug on the ratchet path. */
  jarError?: { measure: (slug: string) => Score };
}

const readJson = <T,>(root: string, rel: string): T =>
  JSON.parse(readFileSync(join(root, rel), 'utf8')) as T;
const writeJson = (root: string, rel: string, data: unknown): void =>
  writeFileSync(join(root, rel), `${JSON.stringify(data, null, 2)}\n`);

/** Finds the one `dot-cache`/`dot` twin row for `slug`; throws unless it is
 *  healthy and no goldens row exists yet. */
export function findTwin(b: Baseline, slug: string, okStatus: string, file: string): Row {
  if (b.fixtures.some((r) => r.tree === 'goldens' && r.type === GOLDEN_TYPE && r.slug === slug)) {
    throw new Error(`${file}: ${slug} already has a goldens row`);
  }
  const twins = b.fixtures.filter((r) => r.tree === 'dot-cache' && r.type === CACHE_TYPE && r.slug === slug);
  if (twins.length !== 1) throw new Error(`${file}: ${slug} has ${twins.length} dot-cache twins`);
  const twin = twins[0]!;
  if (twin.status !== okStatus) throw new Error(`${file}: ${slug} twin status ${twin.status}`);
  return twin;
}

/** `findTwin` on the plain path; on the jar-error path, the twin must carry
 *  D3's status and flag (`jarErrored` / `weErrored` true). */
function healthyTwin(b: Baseline, slug: string, spec: (typeof BASELINES)[number], jarError: boolean): Row {
  if (!jarError) return findTwin(b, slug, spec.okStatus, spec.file);
  const twin = findTwin(b, slug, spec.jarErrorStatus, spec.file);
  if (twin[spec.jarErrorFlag] !== true) throw new Error(`${spec.file}: ${slug} twin ${spec.jarErrorFlag} is not true`);
  return twin;
}

function validate(o: PinOptions, ratchet: Ratchet): void {
  if (o.slugs.length === 0) throw new Error('no slugs given');
  if (new Set(o.slugs).size !== o.slugs.length) throw new Error('duplicate slug in arguments');
  const pinned = new Set(ratchet.fixtures.map((f) => f.slug));
  for (const slug of o.slugs) {
    if (pinned.has(slug)) throw new Error(`${slug} is already in the ratchet`);
    for (const f of ['in.svg', 'in.puml']) {
      if (!existsSync(join(o.root, CACHE_DIR, slug, f))) throw new Error(`${slug}: missing ${f}`);
    }
  }
}

/** D3's preconditions for one error-page slug; returns its stock record. */
function jarErrorRecord(root: string, slug: string, stock: Record<string, JarError>): JarError {
  if (readFileSync(join(root, CACHE_DIR, slug, 'in.svg'), 'utf8').includes(GRAPHVIZ_DOCUMENT_MARK)) {
    throw new Error(`${slug}: the golden is a graphviz document, not a jar error page`);
  }
  const record = stock[`${CACHE_TYPE}/${slug}`];
  if (record === undefined) throw new Error(`${slug}: ${STOCK_ERRORS} has no ${CACHE_TYPE}/${slug} record`);
  return { line: record.line, message: record.message };
}

/** The ratchet entries for `o.slugs`, measured before anything is written. */
function ratchetRows(o: PinOptions): RatchetRow[] {
  const base = (slug: string): RatchetRow => ({ slug, addedAt: o.date, source: o.sourceTag });
  if (o.jarError === undefined) return o.slugs.map(base);
  const stock = readJson<{ errors: Record<string, JarError> }>(o.root, STOCK_ERRORS).errors;
  return o.slugs.map((slug) => {
    const jarError = jarErrorRecord(o.root, slug, stock);
    const { weightedScore, diffCount } = o.jarError!.measure(slug);
    if (diffCount === 0) throw new Error(`${slug}: zero-diff; pin it without --jar-error`);
    return { ...base(slug), jarError, weightedScore, diffCount };
  });
}

function copyVerified(root: string, slug: string): void {
  const dst = join(root, GOLDEN_DIR, slug);
  mkdirSync(dst, { recursive: true });
  for (const [from, to] of [['in.svg', 'golden.svg'], ['in.puml', 'in.puml']] as const) {
    const src = join(root, CACHE_DIR, slug, from);
    copyFileSync(src, join(dst, to));
    if (!readFileSync(src).equals(readFileSync(join(dst, to)))) {
      throw new Error(`${slug}: ${to} is not byte-identical to ${from}`);
    }
  }
}

/** Pins `o.slugs`; returns the number pinned. */
export function pinGoldens(o: PinOptions): number {
  const ratchet = readJson<Ratchet>(o.root, RATCHET);
  validate(o, ratchet);
  const baselines = BASELINES.map((spec) => ({ spec, data: readJson<Baseline>(o.root, spec.file) }));
  const rows = ratchetRows(o);
  const clones = baselines.map(({ spec, data }) =>
    o.slugs.map((slug) => ({
      ...healthyTwin(data, slug, spec, o.jarError !== undefined),
      tree: 'goldens',
      type: GOLDEN_TYPE,
      slug,
      measuredAt: o.date,
      measuredAgainstCommit: o.commit,
    })),
  );
  for (const slug of o.slugs) copyVerified(o.root, slug);
  ratchet.fixtures.push(...rows);
  writeJson(o.root, RATCHET, ratchet);
  const note = ` Re-pinned ${o.date} at ${o.commit} by ${MISSION} / ${o.closeLabel}, ADDITIVE ONLY (${o.slugs.length} "${GOLDEN_TYPE}" golden rows appended, clones of their byte-identical dot-cache twins).`;
  baselines.forEach(({ spec, data }, i) => {
    data.fixtures.push(...clones[i]!);
    data.$comment += note;
    writeJson(o.root, spec.file, data);
  });
  return o.slugs.length;
}

/* v8 ignore start -- CLI entry point; exercised via the acceptance run. */
/** The ratchet path (`dot.golden.ratchet.test.ts`): `renderSync`, then
 *  `compareSvg(ours, cache, 'deterministic')` and its `weightedScore`. Imported
 *  lazily so the unit tests never load the renderer. */
async function ratchetPathScorer(root: string): Promise<(slug: string) => Score> {
  const { renderSync } = await import('../../../src/index.js');
  const { compareSvg, weightedScore } = await import('../../../tests/oracle/svg-conformance/compare.js');
  return (slug) => {
    const read = (f: string): string => readFileSync(join(root, CACHE_DIR, slug, f), 'utf8');
    const { diffs } = compareSvg(renderSync(read('in.puml')), read('in.svg'), 'deterministic');
    return { weightedScore: weightedScore(diffs), diffCount: diffs.length };
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const jarErrorFlag = argv[0] === '--jar-error';
  if (jarErrorFlag) argv.shift();
  const [sourceTag, closeLabel, ...slugs] = argv;
  if (!sourceTag || !closeLabel) {
    console.error('usage: pin-goldens.mts [--jar-error] <source-tag> <close-label> <slug...>');
    process.exit(2);
  }
  const jarError = jarErrorFlag ? { measure: await ratchetPathScorer(process.cwd()) } : undefined;
  const commit = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8' }).trim();
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const n = pinGoldens({ root: process.cwd(), sourceTag, closeLabel, slugs, date, commit, ...(jarError ? { jarError } : {}) });
  console.log(`pinned ${n} fixture(s) as ${sourceTag} at ${commit}${jarErrorFlag ? ' (jar error pages)' : ''}`);
}
/* v8 ignore stop */
