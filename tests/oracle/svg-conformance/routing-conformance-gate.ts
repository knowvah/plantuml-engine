/**
 * The measuring half of the routing gate, shared by its part files. The gate
 * itself is described in `routing-conformance.test.ts`, which also keeps every
 * check that needs no render.
 *
 * Not a `.test.ts` file, so importing it registers nothing: each
 * `routing-conformance.part-N.test.ts` calls {@link defineRoutingGatePart} for
 * its own slice of the corpus, which is how vitest can place the slices on
 * different shards.
 */
import { beforeAll, describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadElk, renderSync, type ElkBackend } from '../../../src/index.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { corpusGatePartOf, isJarErrorPage } from './corpus-gate-part.js';

/** Which committed tree a fixture lives in. Decides the golden's filename and
 *  the root the `slug` is relative to — nothing else. */
type Tree = 'dot-cache' | 'goldens';

export interface BaselineFixture {
  readonly tree: Tree;
  /** Top-level directory under the tree root. NOT authoritative (D6). */
  readonly type: string;
  /** Path from `<tree root>/<type>/` to the fixture directory. Usually one
   *  segment; `oracle/goldens/svg-description/` nests one level deeper. */
  readonly slug: string;
  /** The jar's own answer, read from this fixture's golden. */
  readonly jarType: string;
  /** Ours as pinned. Informational for an `agree` entry (it equals
   *  `jarType`); for a `known-misroute` entry it records WHICH wrong engine
   *  claimed the source, which is what the bucket table is built from. */
  readonly ourType: string;
  /** True iff this fixture's golden is one of PlantUML's OWN error pages, so
   *  `jarType` records "the jar never exported a diagram" rather than "the jar
   *  chose that engine". Present only on `jar-error` entries (D4). */
  readonly jarErrored?: boolean;
  readonly status: 'agree' | 'known-misroute' | 'jar-error';
  /** Required on a `known-misroute` pin: WHY this source lands where it does,
   *  naming the unported upstream mechanism with its `File.java:line`. Added
   *  2026-08-25 for the same reason the refusal gate demands one — an
   *  unexplained pin is exactly the dumping ground D7 warns about, and this
   *  gate is the mission's primary stop condition, so it needs the stronger
   *  bar, not the weaker one. */
  readonly reason?: string;
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
}

export interface BaselineManifest {
  readonly fixtures: readonly BaselineFixture[];
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '../../..');
const MANIFEST_PATH = join(REPO, 'oracle/goldens/svg-conformance/routing-baseline.json');
const CACHE_ROOT = join(REPO, 'test-results/dot-cache');
const GOLDENS_ROOT = join(REPO, 'oracle/goldens');

export const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as BaselineManifest;

/** `TextBlockExporter.java:292-294`'s root attribute. */
const DIAGRAM_TYPE_ATTR_RE = /data-diagram-type="([A-Z]+)"/;
/** Read only the head of a golden. The attribute is on the ROOT element, and
 *  `sequence/zudize-61-vomi445`'s golden is 8.26 MB — reading whole documents
 *  to find a byte-300 attribute would dominate this gate's runtime. */
const HEAD_BYTES = 4096;
/** The value recorded when a document carries no such attribute at all. Real
 *  on both sides (see the header), never a sentinel for "unmeasured". */
const NO_DIAGRAM_TYPE = 'NONE';

export function diagramTypeOf(head: string): string {
  return DIAGRAM_TYPE_ATTR_RE.exec(head)?.[1] ?? NO_DIAGRAM_TYPE;
}

function readHead(path: string): string {
  const fd = openSync(path, 'r');
  try {
    const buf = Buffer.alloc(HEAD_BYTES);
    return buf.subarray(0, readSync(fd, buf, 0, HEAD_BYTES, 0)).toString('utf8');
  } finally {
    closeSync(fd);
  }
}

type FixtureRef = Pick<BaselineFixture, 'tree' | 'type' | 'slug'>;

function fixtureDir(f: FixtureRef): string {
  return f.tree === 'dot-cache' ? join(CACHE_ROOT, f.type, f.slug) : join(GOLDENS_ROOT, f.type, f.slug);
}

function goldenPath(f: FixtureRef): string {
  return join(fixtureDir(f), f.tree === 'dot-cache' ? 'in.svg' : 'golden.svg');
}

/** Stable identity across the two trees. */
export function keyOf(f: FixtureRef): string {
  return `${f.tree}:${f.type}/${f.slug}`;
}

function hasCachedFixture(f: FixtureRef): boolean {
  return existsSync(join(fixtureDir(f), 'in.puml')) && existsSync(goldenPath(f));
}

// ---------------------------------------------------------------------------
// Enumeration -- from DISK, not from the manifest, so a fixture added to
// either tree without a baseline entry is detectable (it is a FAIL below).
// ---------------------------------------------------------------------------

/** Depth-first: a directory holding both `in.puml` and the tree's golden IS a
 *  fixture; anything else is descended into. Both trees are mostly flat but
 *  `oracle/goldens/svg-description/{component,usecase}/<slug>/` and
 *  `svg-skin/rose/<slug>/` nest one level deeper — 52 fixtures that a
 *  single-level `readdir` silently drops. */
function walk(typeRoot: string, dir: string, tree: Tree, type: string, out: FixtureRef[]): void {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const child = join(dir, e.name);
    const ref: FixtureRef = { tree, type, slug: relative(typeRoot, child) };
    if (hasCachedFixture(ref)) out.push(ref);
    else walk(typeRoot, child, tree, type, out);
  }
}

function collectTree(root: string, tree: Tree, keep: (name: string) => boolean): FixtureRef[] {
  const out: FixtureRef[] = [];
  for (const e of readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!e.isDirectory() || !keep(e.name)) continue;
    walk(join(root, e.name), join(root, e.name), tree, e.name, out);
  }
  return out;
}

export function collectFixtures(): FixtureRef[] {
  return [
    ...collectTree(CACHE_ROOT, 'dot-cache', () => true),
    ...collectTree(GOLDENS_ROOT, 'goldens', (n) => n.startsWith('svg-')),
  ];
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

export interface LiveRouting {
  readonly jarType: string;
  readonly ourType: string;
  /** Derived from the golden's own content by `isJarErrorPage`, never from
   *  the manifest. The pin is checked AGAINST this, not the other way. */
  readonly jarErrored: boolean;
}

/** The pair the routing comparison itself needs. Split out because only the
 *  jar-error classification reads `jarErrored`, and keeping the other three
 *  helpers on the narrower type lets them be exercised with the two values
 *  they actually use. */
type RoutingPair = Pick<LiveRouting, 'jarType' | 'ourType'>;

/** Routes ONE fixture the way production does: `renderSync` over the raw
 *  source, then read the root attribute off our own document. Deliberately
 *  NOT `registry.resolve()` — that would test the dispatcher in isolation and
 *  miss the engines whose `RenderFragment` carries no `diagramType` at all,
 *  which is exactly half of the `-> NONE` bucket.
 *
 *  `DeterministicMeasurer` is passed for the reason every sibling harness
 *  passes it, plus one specific to this file: under vitest's jsdom
 *  environment the production `CanvasMeasurer` default hits
 *  `HTMLCanvasElement.prototype.getContext` (unimplemented without the
 *  `canvas` package), putting a layout failure -- hence an `errorSvg`, hence
 *  a routing answer of `NONE` -- inside the measurement. Routing is
 *  measurer-independent, and that is measured, not assumed: the corpus
 *  scores 79 with an identical bucket table under either measurer. */
/** One ELK backend per process (cdd8 D2d): `!pragma layout elk` fixtures
 *  make `renderSync` refuse without `options.elk` (cdd8 T1b), which would
 *  read here as a refusal the jar never made. */
let elk: ElkBackend | undefined;

function measure(f: FixtureRef, store: ReturnType<typeof fixtureIncludeStore>): LiveRouting {
  const markup = readFileSync(join(fixtureDir(f), 'in.puml'), 'utf8');
  const ours = renderSync(
    markup,
    withJarCompatibleStyleInput({
      includeStore: store,
      measurer: new DeterministicMeasurer(),
      elk,
    }),
  ).slice(0, HEAD_BYTES);
  const golden = readHead(goldenPath(f));
  return {
    jarType: diagramTypeOf(golden),
    ourType: diagramTypeOf(ours),
    jarErrored: isJarErrorPage(golden),
  };
}

let measured: Map<string, LiveRouting> | undefined;

/** Memoised measurement of one part. Every assertion in a part reads this map;
 *  the warm-up `it()` at the top of the part pays for it once and carries the
 *  only budget. */
function live(part: number): Map<string, LiveRouting> {
  if (measured !== undefined) return measured;
  const store = fixtureIncludeStore();
  const fixtures = collectFixtures().filter((f) => corpusGatePartOf(keyOf(f)) === part);
  measured = new Map(fixtures.map((f) => [keyOf(f), measure(f, store)]));
  return measured;
}

// ---------------------------------------------------------------------------
// Pure gate logic -- extracted so the FAIL branch is exercisable (AC3) with
// fabricated inputs, without ever touching routing-baseline.json on disk.
// ---------------------------------------------------------------------------

interface CheckResult {
  readonly ok: boolean;
  readonly message: string;
}

/** A fixture pinned `agree` must still agree. Nothing else can fail this gate:
 *  a pinned misroute is already counted, and no movement of one can raise the
 *  count. */
export function checkNoNewMisroute(f: BaselineFixture, now: RoutingPair | undefined): CheckResult {
  const at = `${f.tree} ${f.type}/${f.slug}`;
  if (now === undefined) {
    return {
      ok: false,
      message:
        `${at}: pinned in routing-baseline.json but ABSENT from the live corpus walk. ` +
        `Both trees are committed, so a missing fixture means a broken or partial ` +
        `checkout — restore the tree rather than pruning the baseline to match it.`,
    };
  }
  if (now.ourType === now.jarType) return { ok: true, message: `${at}: agrees (${now.jarType}).` };
  return {
    ok: false,
    message:
      `${at}: NEWLY MISROUTES. The jar routes this source to ${now.jarType}; we route it ` +
      `to ${now.ourType}. It agreed when the baseline was pinned (${f.measuredAt}, ` +
      `${f.measuredAgainstCommit}), so a registration-order or heuristic change took a ` +
      `fixture that was CORRECT. This gate ratchets DOWN ONLY and has no bypass: find the ` +
      `mechanism in the Java before touching this file. Never widen a pattern to make a ` +
      `bucket close — widening is how the over-claim class arose in the first place.`,
  };
}

/** Progress classification for an already-pinned misroute. `undefined` when it
 *  is still wrong in exactly the way it was pinned. */
export function progressNote(f: BaselineFixture, now: RoutingPair): string | undefined {
  const at = `${f.tree} ${f.type}/${f.slug}`;
  if (now.ourType === now.jarType) {
    return (
      `[FIXED] ${at} now routes to ${now.jarType}, matching the jar. Its ` +
      `known-misroute pin is STALE: re-pin this entry to status "agree" in ` +
      `oracle/goldens/svg-conformance/routing-baseline.json from a fresh measurement. ` +
      `A fall never fails this gate.`
    );
  }
  if (now.ourType !== f.ourType) {
    return (
      `[CHANGED] ${at} still misroutes, but to a different engine: pinned ${f.ourType}, ` +
      `now ${now.ourType} (jar says ${now.jarType}). Not a regression — the gated quantity ` +
      `is the SET of misrouting fixtures, not which wrong engine each reached.`
    );
  }
  return undefined;
}

/**
 * The pin must agree with what the GOLDEN says, in both directions.
 *
 *   - pinned `jar-error`, golden is no longer an error page -> FAIL. A jar
 *     upgrade that stops crashing is a real change to the oracle; letting it
 *     pass silently would leave a fixture permanently excused from the
 *     misroute count for a reason that has ceased to hold.
 *   - pinned `agree` or `known-misroute`, golden IS an error page -> FAIL.
 *     A jar crash is not a routing answer, and pinning one as a misroute
 *     floors this mission's SLI above zero for a reason no repair can move
 *     (D4).
 *
 * Absence from the live walk is not this check's business -- the corpus
 * completeness gate above already fails on it, and failing twice for one
 * cause names the same fixture in two places.
 */
export function checkJarErrorClassification(f: BaselineFixture, now: LiveRouting | undefined): CheckResult {
  const at = `${f.tree} ${f.type}/${f.slug}`;
  if (now === undefined) return { ok: true, message: `${at}: absent; owned by the walk gate.` };
  const pinned = f.status === 'jar-error';
  if (pinned && !now.jarErrored)
    return {
      ok: false,
      message:
        `${at}: pinned "jar-error", but its golden is NO LONGER an upstream error page. ` +
        `The jar now routes this source to ${now.jarType} and we route it to ${now.ourType}. ` +
        `Re-measure and re-pin it as "agree" or "known-misroute" — a fixture excused from ` +
        `the misroute count must keep earning the excuse.`,
    };
  if (!pinned && now.jarErrored)
    return {
      ok: false,
      message:
        `${at}: pinned "${f.status}", but its golden IS an upstream error page ` +
        `(PSystemError.java:148-155 / ReportLog.java:103-108). The jar never exported a ` +
        `diagram for it, so its jarType of "${now.jarType}" is not a routing answer. Pin it ` +
        `"jar-error" with jarErrored: true — the classification comes from the golden, ` +
        `never from the pin (D4).`,
    };
  return { ok: true, message: `${at}: classification matches its golden.` };
}

/** The jar->ours bucket table (AC5), so a failure names the mechanism class
 *  that moved rather than only the fixture. */
export function bucketTable(rows: readonly RoutingPair[]): string {
  const buckets = new Map<string, number>();
  for (const r of rows) {
    const k = `${r.jarType} -> ${r.ourType}`;
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const lines = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k, n]) => `    ${k}: ${n}`);
  return [`  jar -> ours (${rows.length} disagreeing):`, ...lines].join('\n');
}

export const pinnedAgree = manifest.fixtures.filter((f) => f.status === 'agree');
export const pinnedMisroutes = manifest.fixtures.filter((f) => f.status === 'known-misroute');
/** Excluded from the misroute count by D4, and watched by the classification
 *  gate below so the exclusion cannot go stale. */
export const pinnedJarErrors = manifest.fixtures.filter((f) => f.status === 'jar-error');

/** Derived from measurement, never fitted to whatever made the test go green.
 *
 * BASE, measured in situ: **15,492 ms** under a full `npm test` -- v8
 * coverage on, 12 vitest forks on 12 cores, the rest of the 633-file suite
 * competing (`--reporter=verbose`, 2026-08-23). Alone it measures 11.25 s
 * with coverage and 6.0 s without, so most of the cost is instrumentation
 * and contention rather than the 3,158 renders.
 *
 * CEILING: `.agent-notes/ratchet-zudize-timeout.md` measured how a CPU-bound
 * conformance test degrades with fork count -- 1,374 ms at 12 copies, 3,711 ms
 * at 22, a **2.70x** step, well above the 1.83x CPU share alone predicts. Two
 * concurrent `npm test` runs put exactly 22 forks on 12 cores, and that
 * condition is what previously turned a green ratchet red. Applying it here:
 * 15,492 ms x 2.70 = **~41,800 ms**.
 *
 * RE-DERIVED ON THE RUNNER (2026-10-10). The numbers above are a 12-core dev
 * box at 3,158 renders; the manifest now holds 6,625 and CI runs vitest on a
 * 4-vCPU `ubuntu-latest` (3 workers, the `.agent-notes/catalog-ci-budget.md`
 * profile). In-suite on CI this test measured 108,816 ms (run 37856273415)
 * and 109,175 ms (run 38075923903), and was aborted at 121,557 ms by the old
 * 120,000 ms budget (run 38046648955) -- so that sample is a LOWER bound,
 * and the old budget was grazed on every run rather than broken once.
 * Ceiling: 121,557 ms x the same 2.70x contention step = **~328,200 ms**;
 * the budget is that, rounded up to the next 10 s. A hang now surfaces at
 * 5.5 min; the shard job's 15-minute cap is the outer backstop.
 *
 * No PER-FIXTURE budget is needed or wanted. Unlike the sequence ratchet,
 * nothing here reads a whole golden: `readHead` takes the first 4 KB, so the
 * 8.26 MB `sequence/zudize-61-vomi445` golden that forced that budget costs
 * this gate the same as any other fixture.
 *
 * RE-DERIVED AGAIN (2026-10-28, PR #95 run 40730527655). gantt-engine-port
 * turned 265 gantt rows from error pages into real renders and added 251
 * gantt golden clones (8,432 -> 8,684 rows), so this gate's CI cost tripled:
 * 336,125 ms here (timed out at 330,000) and <= 315 s on the last green main
 * run (40528746274, same ubuntu-26.04 image, shard-4 wall clock); the sibling
 * measured 277,236 ms. Not a slow runner: zudize-61 took 24 s against its
 * 22-41 s samples. The dev box measures 92-131 s across gep b0 .. gdd final
 * (12 cores vs the runner's 4 vCPU). Budget raised to 10 minutes (user
 * ruling 2026-10-28); the shard job's 15-minute cap is the outer backstop.
 *
 * SPLIT (2026-11-05, PR #153 run 42059932548). This budget now applies to one
 * of CORPUS_GATE_PARTS parts, not the whole corpus. The whole-corpus test took
 * 424 s (refusal) and 276 s (routing) of it, and vitest shards by file, so no
 * shard could finish faster than that. Left at 10 minutes by the 2026-10-28
 * ruling. */
const CORPUS_BUDGET_MS = 600_000;

/** Registers the render-dependent checks for one part of the corpus. Call once,
 *  at the top level of that part's test file. A fixture belongs to exactly one
 *  part, so the parts together make the same per-fixture checks the single file
 *  made. */
export function defineRoutingGatePart(part: number): void {
  const inPart = (f: BaselineFixture): boolean => corpusGatePartOf(keyOf(f)) === part;
  const agree = pinnedAgree.filter(inPart);
  const misroutes = pinnedMisroutes.filter(inPart);
  const jarErrors = pinnedJarErrors.filter(inPart);

  /** One ELK backend per process (cdd8 D2d): see {@link elk}. */
  beforeAll(async () => {
    elk = await loadElk();
  });

  describe(`routing conformance, part ${part} — measurement`, () => {
    it(
      'measures this part of the corpus',
      () => {
        expect(live(part).size, 'a part with no fixtures means the partition broke').toBeGreaterThan(0);
      },
      CORPUS_BUDGET_MS,
    );
  });

  // ---------------------------------------------------------------------------
  // AC1 + AC3 -- no fixture that agrees today may disagree at run time.
  // Aggregate, not per-fixture: only an aggregate can carry AC5's bucket table,
  // and 3079 `it()` blocks would cost more in runner overhead than the whole
  // measurement they wrap.
  // ---------------------------------------------------------------------------

  describe(`routing conformance, part ${part} — no fixture newly misroutes`, () => {
    it('every fixture pinned "agree" still routes where the jar routes it', () => {
      const seen = live(part);
      const broken = agree
        .map((f) => ({ f, result: checkNoNewMisroute(f, seen.get(keyOf(f))) }))
        .filter(({ result }) => !result.ok);

      const moved = broken.map(({ f }) => seen.get(keyOf(f))).filter((r): r is LiveRouting => r !== undefined);
      const detail =
        broken.length === 0
          ? ''
          : `\n${broken.map(({ result }) => `  - ${result.message}`).join('\n')}\n${bucketTable(moved)}`;

      expect(
        broken.length,
        `${broken.length} of ${agree.length} previously-correct fixtures NEWLY ` +
          `MISROUTE. This is the mission's primary stop condition.${detail}`,
      ).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // AC4 -- a pinned misroute that improves must PASS, loudly. This is the whole
  // point of the mission, so it must never be able to fail.
  // ---------------------------------------------------------------------------

  describe(`routing conformance, part ${part} — pinned misroutes`, () => {
    for (const f of misroutes) {
      it(`${f.tree} ${f.type}/${f.slug}: jar says ${f.jarType}, pinned as ${f.ourType}`, () => {
        const now = live(part).get(keyOf(f));
        expect(now, `${keyOf(f)}: pinned but absent from the live walk`).toBeDefined();
        const note = progressNote(f, now!);
        if (note !== undefined) console.log(note);
        expect(now!.jarType).toBe(f.jarType);
      });
    }

    it('reports the standing misroute count and its bucket table', () => {
      const seen = live(part);
      const still = misroutes
        .map((f) => seen.get(keyOf(f)))
        .filter((r): r is LiveRouting => r !== undefined && r.ourType !== r.jarType);
      console.log(
        `[ROUTING SLI] part ${part}: ${still.length} of ${misroutes.length} pinned misroutes remain ` +
          `(target 0, ratcheting down only). ${jarErrors.length} further fixtures are ` +
          `pinned "jar-error" and are DELIBERATELY EXCLUDED from that count: the jar itself ` +
          `produced an error page for them, so it never chose an engine and there is no ` +
          `routing defect to repair (D4).\n${bucketTable(still)}`,
      );
      expect(still.length).toBeLessThanOrEqual(misroutes.length);
    });
  });

  describe(`routing conformance, part ${part} — jar-error classification`, () => {
    it('every pin matches what its own golden says about the jar erroring', () => {
      const seen = live(part);
      const wrong = manifest.fixtures
        .filter(inPart)
        .map((f) => checkJarErrorClassification(f, seen.get(keyOf(f))))
        .filter((r) => !r.ok);
      expect(
        wrong.map((r) => r.message),
        `${wrong.length} fixture(s) are pinned inconsistently with their golden's own content.`,
      ).toEqual([]);
    });
  });
}
