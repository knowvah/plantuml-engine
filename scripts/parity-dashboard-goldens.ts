/**
 * `docs/parity-report.md` dashboard — `oracle/goldens/**` loaders (ratchet
 * pins, diff-baseline, routing, refusal). Split from
 * `parity-dashboard-inputs.ts` purely to keep each file under the 500-line
 * complexity cap; both feed `parity-dashboard.ts#loadInputs` (D2: every
 * loader here reads a committed artifact, never renders or invokes the jar).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** A bucket maps to the LIST of golden families whose pins it shows (D1,
 *  plans/parity-dashboard-repair). `component`/`usecase` share
 *  `svg-description`; `unknown` reads the utility factories' own family (ufp
 *  D9) plus the 145 `type: unknown` rows pinned under `svg-description`.
 *  Types absent from this map have no ratchet family at all (D8: `no ratchet
 *  yet`). Every `svg-*` directory must appear here, in
 *  `DIFF_BASELINE_FAMILY` or in `NON_BUCKET_FAMILIES`, or
 *  `unmappedGoldenFamilies` names it (D2). */
export const RATCHET_FAMILY: Readonly<Record<string, readonly string[]>> = {
  component: ['svg-description'],
  usecase: ['svg-description'],
  class: ['svg-class'],
  object: ['svg-object'],
  state: ['svg-state'],
  sequence: ['svg-sequence'],
  json: ['svg-json'],
  yaml: ['svg-yaml'],
  hcl: ['svg-hcl'],
  dot: ['svg-dot'],
  activity: ['svg-activity'],
  mindmap: ['svg-mindmap'],
  salt: ['svg-salt'],
  wbs: ['svg-wbs'],
  gantt: ['svg-gantt'],
  files: ['svg-files'],
  chart: ['svg-chart'],
  unknown: ['svg-utility', 'svg-description'],
  // c4dd D6: two engines own these rows; a c4 pin under `svg-class` carries `tree: 'c4'`.
  c4: ['svg-description', 'svg-class'],
};

/** Subset of `RATCHET_FAMILY` whose families also carry a `diff-baseline.json`
 *  (`svg-files` has none). A listed family whose file is absent is skipped. */
export const DIFF_BASELINE_FAMILY: Readonly<Record<string, readonly string[]>> = {
  component: ['svg-description'],
  usecase: ['svg-description'],
  activity: ['svg-activity'],
  sequence: ['svg-sequence'],
  mindmap: ['svg-mindmap'],
  salt: ['svg-salt'],
  wbs: ['svg-wbs'],
  gantt: ['svg-gantt'],
  unknown: ['svg-utility', 'svg-description'],
};

/** `oracle/goldens/svg-*` families that are NOT one bucket's pins, each with
 *  the reason it is exempt from the maps above (D2: an explicit allowlist,
 *  so a family that starts life with only an authored baseline is caught). */
export const NON_BUCKET_FAMILIES: Readonly<Record<string, string>> = {
  'svg-conformance': 'cross-bucket routing, refusal, layout-parity and splines baselines (own columns)',
  'svg-skin': 'skin ratchet (rose) exercised across types, not a manifest bucket',
  'svg-lengthadjust': 'authored textLength/lengthAdjust baseline, not a manifest bucket',
};

interface RatchetFixture {
  type?: string;
  addedAt?: string;
  tree?: string;
}

/** The one bucket that holds pins inside another's type-less family (`svg-class/c4/`). */
const C4_BUCKET = 'c4';

export interface RatchetSummary {
  count: number;
  addedAt: string | undefined;
}

/** Pure: pins for `type` within one family's fixtures. A family with no
 *  per-entry `type` field (every single-type family) uses every fixture but
 *  its `tree: 'c4'` ones, which are the c4 bucket's; `svg-description` (the
 *  only shared family) filters by it. */
export function ratchetPinsOf(fixtures: readonly RatchetFixture[], type: string): RatchetSummary {
  const shared = fixtures.some((f) => f.type !== undefined);
  const filtered = shared
    ? fixtures.filter((f) => f.type === type)
    : fixtures.filter((f) => (f.tree === C4_BUCKET) === (type === C4_BUCKET));
  const dates = filtered.map((f) => f.addedAt).filter((d): d is string => d !== undefined);
  return { count: filtered.length, addedAt: dates.length > 0 ? dates.sort().at(-1) : undefined };
}

/** Newest of two ISO dates (either may be absent). */
function newestDate(a: string | undefined, b: string | undefined): string | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return a > b ? a : b;
}

/** Reads `<goldens>/<family>/<file>` once per family (memoised in `cache`). */
function readFamilyFixtures<T>(cache: Map<string, T[]>, goldensDir: string, family: string, file: string): T[] {
  let fixtures = cache.get(family);
  if (fixtures === undefined) {
    const parsed = JSON.parse(readFileSync(join(goldensDir, family, file), 'utf-8')) as { fixtures: T[] };
    fixtures = parsed.fixtures;
    cache.set(family, fixtures);
  }
  return fixtures;
}

/** Per bucket: pins summed over its families, date the newest (D1). */
export function loadRatchetByType(goldensDir: string): Record<string, RatchetSummary> {
  const out: Record<string, RatchetSummary> = {};
  const familiesRead = new Map<string, RatchetFixture[]>();
  for (const [type, families] of Object.entries(RATCHET_FAMILY)) {
    let total: RatchetSummary = { count: 0, addedAt: undefined };
    for (const family of families) {
      const s = ratchetPinsOf(readFamilyFixtures(familiesRead, goldensDir, family, 'ratchet.json'), type);
      total = { count: total.count + s.count, addedAt: newestDate(total.addedAt, s.addedAt) };
    }
    out[type] = total;
  }
  return out;
}

interface DiffBaselineFixture {
  type?: string;
  status: string;
  weightedScore?: number;
  diffCount?: number | 'error' | null;
  measuredAt?: string;
}

export interface DiffBaselineSummary {
  count: number;
  sum: number;
  measuredAt: string | undefined;
}

/** Pure: baseline-status count and weighted-score sum for `type` within one
 *  family's fixtures. Falls back to `diffCount` when a family (e.g.
 *  svg-description) predates `weightedScore` (D5, plans/sequence-root-chrome). */
export function diffBaselineStatsOf(fixtures: readonly DiffBaselineFixture[], type: string): DiffBaselineSummary {
  const forType = fixtures.filter((f) => f.type === type);
  const baseline = forType.filter((f) => f.status === 'baseline');
  const sum = baseline.reduce(
    (acc, f) => acc + (f.weightedScore ?? (typeof f.diffCount === 'number' ? f.diffCount : 0)),
    0,
  );
  const dates = forType.map((f) => f.measuredAt).filter((d): d is string => d !== undefined);
  return { count: baseline.length, sum, measuredAt: dates.length > 0 ? dates.sort().at(-1) : undefined };
}

/** Per bucket: baseline count and score summed over its families that have a
 *  `diff-baseline.json`, date the newest (D1). A bucket none of whose
 *  families has the file is omitted, so its cell stays `no diff-baseline yet`. */
export function loadDiffBaselineByType(goldensDir: string): Record<string, DiffBaselineSummary> {
  const out: Record<string, DiffBaselineSummary> = {};
  const familiesRead = new Map<string, DiffBaselineFixture[]>();
  for (const [type, families] of Object.entries(DIFF_BASELINE_FAMILY)) {
    let total: DiffBaselineSummary | undefined;
    for (const family of families) {
      if (!existsSync(join(goldensDir, family, 'diff-baseline.json'))) continue;
      const s = diffBaselineStatsOf(readFamilyFixtures(familiesRead, goldensDir, family, 'diff-baseline.json'), type);
      total =
        total === undefined
          ? s
          : {
              count: total.count + s.count,
              sum: total.sum + s.sum,
              measuredAt: newestDate(total.measuredAt, s.measuredAt),
            };
    }
    if (total !== undefined) out[type] = total;
  }
  return out;
}

/** D2 guard: every `svg-*` directory under `goldensDir` that is in neither
 *  map nor `NON_BUCKET_FAMILIES`, plus every family holding a `ratchet.json`
 *  absent from `RATCHET_FAMILY` or a `diff-baseline.json` absent from
 *  `DIFF_BASELINE_FAMILY` (allowlisted families exempt). Sorted; `[]` means
 *  the dashboard shows every golden family that exists. */
export function unmappedGoldenFamilies(goldensDir: string): string[] {
  const ratchetMapped = new Set(Object.values(RATCHET_FAMILY).flat());
  const diffMapped = new Set(Object.values(DIFF_BASELINE_FAMILY).flat());
  const out: string[] = [];
  for (const name of readdirSync(goldensDir).sort()) {
    const dir = join(goldensDir, name);
    if (!name.startsWith('svg-') || name in NON_BUCKET_FAMILIES || !statSync(dir).isDirectory()) continue;
    const inNoMap = !ratchetMapped.has(name) && !diffMapped.has(name);
    const ratchetUnmapped = !ratchetMapped.has(name) && existsSync(join(dir, 'ratchet.json'));
    const diffUnmapped = !diffMapped.has(name) && existsSync(join(dir, 'diff-baseline.json'));
    if (inNoMap || ratchetUnmapped || diffUnmapped) out.push(name);
  }
  return out;
}

interface BaselineFixture {
  tree: string;
  type: string;
  status: string;
  measuredAt?: string;
}

export interface GroupSummary {
  counts: Record<string, number>;
  total: number;
  measuredAt: string | undefined;
}

/** Pure: per-type status tally over ONLY the `dot-cache` tree entries — the
 *  same 11-type population the Oracle column measures (D6, routing-baseline
 *  and refusal-baseline also carry a `goldens` tree with unrelated types). */
export function groupBaselineByType(fixtures: readonly BaselineFixture[]): Record<string, GroupSummary> {
  const out: Record<string, GroupSummary> = {};
  for (const f of fixtures) {
    if (f.tree !== 'dot-cache') continue;
    const g = (out[f.type] ??= { counts: {}, total: 0, measuredAt: undefined });
    g.counts[f.status] = (g.counts[f.status] ?? 0) + 1;
    g.total++;
    if (f.measuredAt !== undefined && (g.measuredAt === undefined || f.measuredAt > g.measuredAt))
      g.measuredAt = f.measuredAt;
  }
  return out;
}

function loadBaselineFile(path: string): Record<string, GroupSummary> {
  const parsed = JSON.parse(readFileSync(path, 'utf-8')) as { fixtures: BaselineFixture[] };
  return groupBaselineByType(parsed.fixtures);
}

export function loadRoutingByType(svgConformanceDir: string): Record<string, GroupSummary> {
  return loadBaselineFile(join(svgConformanceDir, 'routing-baseline.json'));
}

export function loadRefusalByType(svgConformanceDir: string): Record<string, GroupSummary> {
  return loadBaselineFile(join(svgConformanceDir, 'refusal-baseline.json'));
}
