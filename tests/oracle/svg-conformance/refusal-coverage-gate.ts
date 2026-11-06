/**
 * The measuring half of the refusal gate, shared by its part files. The gate
 * itself is described in `refusal-coverage.test.ts`, which also keeps every
 * check that needs no render.
 *
 * Not a `.test.ts` file, so importing it registers nothing: each
 * `refusal-coverage.part-N.test.ts` calls {@link defineRefusalGatePart} for its
 * own slice of the corpus, which is how vitest can place the slices on
 * different shards.
 */
import { beforeAll, describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadElk, renderSync, type ElkBackend } from '../../../src/index.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fullDescription } from '../../../src/core/version.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { corpusGatePartOf, isJarErrorPage } from './corpus-gate-part.js';

/** Which committed tree a fixture lives in. Decides the golden's filename and
 *  the root the `slug` is relative to — nothing else. */
type Tree = 'dot-cache' | 'goldens';

export interface BaselineFixture {
  readonly tree: Tree;
  /** Top-level directory under the tree root. NOT authoritative — the corpus
   *  populator over-selects, so a directory name builds a path and does
   *  nothing else (routing gate D6). */
  readonly type: string;
  /** Path from `<tree root>/<type>/` to the fixture directory. */
  readonly slug: string;
  /** True iff the fixture's golden is NOT one of the jar's own error pages.
   *  Derived from the golden, and checked against it in both directions. */
  readonly jarRendered: boolean;
  /** True iff OUR render of the same source is a `PSystemError` page. */
  readonly weErrored: boolean;
  /** WHICH engine owns the answer, so a coverage task (T13-T20) can filter to
   *  its own bucket without re-running the corpus. When we errored it is the
   *  `(Assumed diagram type: X)` the error page itself prints
   *  (`ErrorUml.java#getError`); otherwise our root `data-diagram-type`
   *  lower-cased, or `none` when the engine stamps none. INFORMATIONAL: this
   *  gate never asserts on it, because which engine drew is the sibling
   *  routing gate's subject and failing here for a routing move would name the
   *  same defect twice. */
  readonly engine: string;
  /** `known-gap` excuses a fixture from the defect count. Reserved for batches
   *  4-6, each pin carrying the unported `Command` that explains it. Nothing
   *  is pinned `known-gap` at baseline. */
  readonly status: 'ok' | 'known-gap';
  /** Required on a `known-gap` pin: the unported `Command` that explains the
   *  refusal, with its upstream `file:line`. D7's bar for excusing one. */
  readonly reason?: string;
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
}

export interface BaselineManifest {
  readonly fixtures: readonly BaselineFixture[];
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '../../..');
const MANIFEST_PATH = join(REPO, 'oracle/goldens/svg-conformance/refusal-baseline.json');
const CACHE_ROOT = join(REPO, 'test-results/dot-cache');
const GOLDENS_ROOT = join(REPO, 'oracle/goldens');

export const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as BaselineManifest;

/** Read only the head of a GOLDEN: the evidence both classifiers below need is
 *  in the first element, and `sequence/zudize-61-vomi445`'s golden is 8.26 MB.
 *  OUR OWN output is never truncated — see {@link weErroredIn}. */
const HEAD_BYTES = 4096;

/**
 * OUR error banner, as one whole `<text>` element. Built from
 * `fullDescription()` itself, never spelled out, so this gate cannot be
 * silently blinded by a version bump.
 * @see ~/git/plantuml/.../version/Version.java#fullDescription
 */
const OUR_ERROR_BANNER = `>${fullDescription()}</text>`;

/**
 * Deliberately scans the WHOLE document, not a head window. The banner's
 * offset is not fixed: `PSystemError#getGraphicalFormatted` prepends the
 * welcome block only for a short source, measured at byte 4544 for a
 * two-line source and byte 2459 for a 200-line one — a 4 KB window would
 * miss the first and see the second, which is the worst possible failure for
 * a gate whose subject is "did we error at all".
 */
export function weErroredIn(ours: string): boolean {
  return ours.includes(OUR_ERROR_BANNER);
}

/** `ErrorUml#getError`'s suffix, printed only once a parser has committed to a
 *  diagram type. Absent on a crash, which is what `unknown` records.
 *  @see ~/git/plantuml/.../ErrorUml.java#getError */
const ASSUMED_TYPE_RE = /\(Assumed diagram type: ([^)<]+)\)/;
/** `TextBlockExporter.java:292-294`'s root attribute. */
const DIAGRAM_TYPE_RE = /data-diagram-type="([A-Z]+)"/;

export function engineOf(ours: string, errored: boolean): string {
  if (errored) return ASSUMED_TYPE_RE.exec(ours)?.[1] ?? 'unknown';
  return DIAGRAM_TYPE_RE.exec(ours.slice(0, HEAD_BYTES))?.[1]?.toLowerCase() ?? 'none';
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
  return join(f.tree === 'dot-cache' ? CACHE_ROOT : GOLDENS_ROOT, f.type, f.slug);
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
 *  `svg-skin/rose/<slug>/` nest one level deeper. */
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

export interface LiveRefusal {
  readonly jarRendered: boolean;
  readonly weErrored: boolean;
  readonly engine: string;
}

/** Renders ONE fixture the way production does. `DeterministicMeasurer` is
 *  passed for the reason every sibling harness passes it, plus one specific to
 *  a refusal gate: under vitest's jsdom environment the production
 *  `CanvasMeasurer` hits an unimplemented `getContext`, and the resulting
 *  layout failure IS an error page — putting a fabricated refusal inside the
 *  measurement. */
/** One ELK backend per process (cdd8 D2d): `!pragma layout elk` fixtures
 *  make `renderSync` refuse without `options.elk` (cdd8 T1b), which would
 *  read here as a refusal the jar never made. */
let elk: ElkBackend | undefined;

function measure(f: FixtureRef, store: ReturnType<typeof fixtureIncludeStore>): LiveRefusal {
  const markup = readFileSync(join(fixtureDir(f), 'in.puml'), 'utf8');
  const ours = renderSync(
    markup,
    withJarCompatibleStyleInput({
      includeStore: store,
      measurer: new DeterministicMeasurer(),
      elk,
    }),
  );
  const weErrored = weErroredIn(ours);
  return {
    jarRendered: !isJarErrorPage(readHead(goldenPath(f))),
    weErrored,
    engine: engineOf(ours, weErrored),
  };
}

let measured: Map<string, LiveRefusal> | undefined;

/** Memoised measurement of one part. Every assertion in a part reads this map;
 *  the warm-up `it()` at the top of the part pays for it once and carries the
 *  only budget. */
function live(part: number): Map<string, LiveRefusal> {
  if (measured !== undefined) return measured;
  const store = fixtureIncludeStore();
  const fixtures = collectFixtures().filter((f) => corpusGatePartOf(keyOf(f)) === part);
  measured = new Map(fixtures.map((f) => [keyOf(f), measure(f, store)]));
  return measured;
}

// ---------------------------------------------------------------------------
// Pure gate logic -- extracted so every branch is exercisable with fabricated
// inputs, without ever touching refusal-baseline.json on disk.
// ---------------------------------------------------------------------------

interface CheckResult {
  readonly ok: boolean;
  readonly message: string;
}

/** SLI 2's quantity: WE errored and the JAR rendered. A `known-gap` pin
 *  excuses a fixture only once someone has written the unported `Command`
 *  that explains it (D7). */
export function isDefect(now: LiveRefusal, status: BaselineFixture['status']): boolean {
  return now.weErrored && now.jarRendered && status === 'ok';
}

/**
 * A fixture that renders today must keep rendering — unless the jar errors on
 * it too, in which case us erroring is agreement rather than a defect.
 */
export function checkNoNewRefusal(f: BaselineFixture, now: LiveRefusal | undefined): CheckResult {
  const at = `${f.tree} ${f.type}/${f.slug}`;
  if (now === undefined) {
    return {
      ok: false,
      message:
        `${at}: pinned in refusal-baseline.json but ABSENT from the live corpus walk. ` +
        `Both trees are committed, so a missing fixture means a broken or partial ` +
        `checkout — restore the tree rather than pruning the baseline to match it.`,
    };
  }
  if (f.weErrored || !isDefect(now, f.status))
    return { ok: true, message: `${at}: no new refusal (engine ${now.engine}).` };
  return {
    ok: false,
    message:
      `${at}: NEWLY REFUSED by the ${now.engine} engine, on a source the jar RENDERED. It ` +
      `rendered when the baseline was pinned (${f.measuredAt}, ${f.measuredAgainstCommit}). ` +
      `Per D7 this is a DEFECT, not baseline movement: our command table is missing a ` +
      `Command the jar has. Find it in the Java (PSystemCommandFactory.java:169-175 lists ` +
      `how a line is matched) and port it. Do NOT relax the refusal to make this pass — ` +
      `refusing a line the jar accepts is this mission's defining failure mode and it ` +
      `looks exactly like progress (stop condition 3).`,
  };
}

/** Progress classification. `undefined` when nothing about this fixture moved. */
export function progressNote(f: BaselineFixture, now: LiveRefusal): string | undefined {
  const at = `${f.tree} ${f.type}/${f.slug}`;
  if (f.weErrored && !now.weErrored) {
    return (
      `[FIXED] ${at} now RENDERS where it used to error. Its pin is STALE: re-pin ` +
      `weErrored: false in oracle/goldens/svg-conformance/refusal-baseline.json from a ` +
      `fresh measurement. A fall never fails this gate.`
    );
  }
  if (!f.weErrored && now.weErrored && !now.jarRendered) {
    return (
      `[MATCHED] ${at} now errors, and so does the jar — its golden is an upstream error ` +
      `page. Not a defect: the gated quantity is "we error AND the jar rendered".`
    );
  }
  if (f.weErrored && now.weErrored && now.engine !== f.engine) {
    return (
      `[CHANGED] ${at} still errors, but the error is now owned by ${now.engine} rather ` +
      `than ${f.engine}. Not a regression — engine is informational here.`
    );
  }
  return undefined;
}

/**
 * The pin must agree with what the GOLDEN says, in both directions. A jar
 * upgrade that stops crashing is a real change to the oracle; letting it pass
 * silently would leave a fixture permanently excused from the defect count for
 * a reason that has ceased to hold. The converse pin would floor SLI 2 above
 * zero for a reason no command-table work can move.
 */
export function checkJarClassification(f: BaselineFixture, now: LiveRefusal | undefined): CheckResult {
  const at = `${f.tree} ${f.type}/${f.slug}`;
  if (now === undefined) return { ok: true, message: `${at}: absent; owned by the walk gate.` };
  if (f.jarRendered === now.jarRendered) return { ok: true, message: `${at}: classification matches its golden.` };
  return {
    ok: false,
    message:
      `${at}: pinned jarRendered: ${String(f.jarRendered)}, but its golden now says ` +
      `${String(now.jarRendered)} (PSystemError.java:148-155 / ReportLog.java:103-108). The ` +
      `classification comes from the golden, never from the pin — re-measure and re-pin.`,
  };
}

/** The per-engine table, so a failure names the command table that moved
 *  rather than only the fixture. */
export function engineTable(rows: readonly LiveRefusal[]): string {
  const buckets = new Map<string, number>();
  for (const r of rows) buckets.set(r.engine, (buckets.get(r.engine) ?? 0) + 1);
  const lines = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k, n]) => `    ${k}: ${n}`);
  return [`  refusing engine (${rows.length} erroring):`, ...lines].join('\n');
}

export const pinnedRendering = manifest.fixtures.filter((f) => !f.weErrored);
export const pinnedErroring = manifest.fixtures.filter((f) => f.weErrored);
/** Excluded from SLI 2 by construction, and watched by the classification gate
 *  below so the exclusion cannot go stale. */
export const pinnedJarErrors = manifest.fixtures.filter((f) => !f.jarRendered);

/** Transferred from the sibling routing gate's in-situ derivation rather than
 *  re-derived, because the per-fixture work is the same work: render the
 *  fixture, read the golden's head. That note measured **15,492 ms** under a
 *  full `npm test` (v8 coverage on, 12 vitest forks on 12 cores) and applied
 *  the 2.70x fork-contention step from `.agent-notes/ratchet-zudize-timeout.md`
 *  to reach a ~41,800 ms ceiling; 120,000 ms is ~2.9x that, wide because the
 *  contended worker also runs the rest of its shard.
 *
 *  Corroborated here, not assumed: this gate measures **7,304 ms** solo
 *  (jiti, no coverage, 2026-08-24) against the sibling's 6,000 ms under the
 *  same conditions. The ~1.3 s delta is the full-document banner scan
 *  {@link weErroredIn} deliberately does not truncate. Same order, same
 *  ceiling.
 *
 *  Re-derived on the runner with the sibling (2026-10-10; its CORPUS_BUDGET_MS
 *  comment has the derivation, now 330,000 ms). This gate's own in-suite CI
 *  samples sit in the same band: 108,222 ms (run 37856273415), 111,457 ms
 *  (run 38046648955) and 102,491 ms (run 38075923903), 85-93% of the old
 *  120,000 ms. That margin is too thin for a 4-vCPU runner, so the same
 *  budget applies here.
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
export function defineRefusalGatePart(part: number): void {
  const inPart = (f: BaselineFixture): boolean => corpusGatePartOf(keyOf(f)) === part;
  const rendering = pinnedRendering.filter(inPart);
  const erroring = pinnedErroring.filter(inPart);
  const jarErrors = pinnedJarErrors.filter(inPart);
  const fixtures = manifest.fixtures.filter(inPart);

  /** One ELK backend per process (cdd8 D2d): see {@link elk}. */
  beforeAll(async () => {
    elk = await loadElk();
  });

  describe(`refusal coverage, part ${part} — measurement`, () => {
    it(
      'measures this part of the corpus',
      () => {
        expect(live(part).size, 'a part with no fixtures means the partition broke').toBeGreaterThan(0);
      },
      CORPUS_BUDGET_MS,
    );
  });

  // ---------------------------------------------------------------------------
  // AC1 -- no fixture that renders today may error at run time. Aggregate, not
  // per-fixture: only an aggregate can carry the engine table, and 3152 `it()`
  // blocks would cost more in runner overhead than the measurement they wrap.
  // ---------------------------------------------------------------------------

  describe(`refusal coverage, part ${part} — no fixture newly errors`, () => {
    it('every fixture pinned as rendering still renders', () => {
      const seen = live(part);
      const broken = rendering
        .map((f) => ({ f, result: checkNoNewRefusal(f, seen.get(keyOf(f))) }))
        .filter(({ result }) => !result.ok);

      const moved = broken.map(({ f }) => seen.get(keyOf(f))).filter((r): r is LiveRefusal => r !== undefined);
      const detail =
        broken.length === 0
          ? ''
          : `\n${broken.map(({ result }) => `  - ${result.message}`).join('\n')}\n${engineTable(moved)}`;

      expect(
        broken.length,
        `${broken.length} of ${rendering.length} previously-rendering fixtures NEWLY ` +
          `ERROR on sources the jar rendered. Per D7 each is a missing Command, not baseline ` +
          `movement.${detail}`,
      ).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // AC5 -- a pinned refusal that improves must PASS, loudly. Batches 4-6 exist
  // to make these fall, so a fall must never be able to fail.
  // ---------------------------------------------------------------------------

  describe(`refusal coverage, part ${part} — pinned refusals`, () => {
    for (const f of erroring) {
      it(`${f.tree} ${f.type}/${f.slug}: errors under ${f.engine}`, () => {
        const now = live(part).get(keyOf(f));
        expect(now, `${keyOf(f)}: pinned but absent from the live walk`).toBeDefined();
        const note = progressNote(f, now!);
        if (note !== undefined) console.log(note);
        expect(checkNoNewRefusal(f, now).ok).toBe(true);
      });
    }

    it('reports the standing SLI 2 count and its engine table', () => {
      const seen = live(part);
      const defects = fixtures
        .map((f) => ({ f, now: seen.get(keyOf(f)) }))
        .filter((r): r is { f: BaselineFixture; now: LiveRefusal } => r.now !== undefined)
        .filter(({ f, now }) => isDefect(now, f.status));
      console.log(
        `[REFUSAL SLI] part ${part}: ${defects.length} fixture(s) error here on a source the jar RENDERED ` +
          `(target 0, or a mechanism per residual — D7). ${jarErrors.length} further ` +
          `fixtures are excluded because the jar itself produced an error page, so its ` +
          `failure is no evidence about us.\n${engineTable(defects.map((d) => d.now))}\n` +
          defects.map((d) => `    ${keyOf(d.f)}`).join('\n'),
      );
      expect(defects.length).toBeLessThanOrEqual(
        fixtures.filter((f) => f.weErrored && f.jarRendered && f.status === 'ok').length,
      );
    });
  });

  describe(`refusal coverage, part ${part} — jar classification`, () => {
    it('every pin matches what its own golden says about the jar erroring', () => {
      const seen = live(part);
      const wrong = fixtures.map((f) => checkJarClassification(f, seen.get(keyOf(f)))).filter((r) => !r.ok);
      expect(
        wrong.map((r) => r.message),
        `${wrong.length} fixture(s) are pinned inconsistently with their golden's own content.`,
      ).toEqual([]);
    });
  });
}
