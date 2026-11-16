/**
 * Offline SVG-conformance RATCHET for `@startdot` diagrams. Mission D14.
 *
 * Mirrors `state.golden.ratchet.test.ts` in procedure — offline, committed
 * goldens; a fixture ratchets in once and then never regresses. See
 * `oracle/goldens/svg-dot/README.md` for why this type's harness is shorter
 * than its siblings', in full. In brief:
 *
 *  - **AC3 is absent, not omitted.** The sibling suites gate eligibility on a
 *    fixture already being DOT-equal. `@startdot` forwards the user's own DOT
 *    verbatim, so that equality holds by construction and the gate would
 *    assert nothing. `parity-dot.json` exists as a survey output (the
 *    every-engine survey writes it), but no ratchet gate reads it.
 *  - **No `render-fixture-dot.ts`, and no `DeterministicMeasurer`.** The
 *    passthrough consults neither theme nor measurer — graphviz produces the
 *    finished document — so there are no production defaults to hold out of
 *    the comparison, and the ratchet exercises the shipped `renderSync` path.
 *    The text measurement that DOES matter happens inside the engine, pinned
 *    once by `src/core/dot-engine-measurer.ts`.
 *
 * SEEDS FULL, unlike state's S0: all 5 cached fixtures were zero-diff the
 * moment the passthrough landed (baseline 0/5, at ≥6 diffs each).
 *
 * Jar error pages (dogr/T1b, #141): an entry with `jarError` is a row whose
 * oracle is the jar's own error page and where we draw ours. That is
 * conformant by the 2026-10-10 error-page ruling, which never asks us to match
 * the jar's page, so the zero-diff and passthrough blocks skip it. Its
 * `weightedScore` is pinned so a change in what we draw there is still seen
 * (the board/chart/bpm/wbs pattern,
 * `board.diff-baseline.ratchet.test.ts:10-13, 88-131`), and error parity is
 * asserted: the jar drew no graphviz document, and we drew an error page.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
import { compareSvg, weightedScore } from './compare.js';

interface RatchetFixture {
  slug: string;
  addedAt: string;
  source: string;
  /** `stock-error-pages.json`'s `dot/<slug>` record; present only on jar error-page rows. */
  jarError?: { line: number | null; message: string };
  /** Pinned with `jarError`: the score that never rises. */
  weightedScore?: number;
  diffCount?: number;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-dot');

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.slug, 'golden.svg'), 'utf8');
}

function readSource(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.slug, 'in.puml'), 'utf8');
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

/** graphviz's root group id: present in every document graphviz writes. */
const GRAPHVIZ_DOCUMENT_MARK = 'id="graph0"';

const drawn = manifest.fixtures.filter((f) => f.jarError === undefined);
const jarErrors = manifest.fixtures.filter((f) => f.jarError !== undefined);

/** `renderSync`, reporting whether it drew a `PSystemError` page (the survey's
 *  seam, `scripts/lib/survey-error-verdict.ts:16`). */
function renderObserved(markup: string): { svg: string; errorPage: boolean } {
  let errorPage = false;
  setErrorPageObserver(() => {
    errorPage = true;
  });
  try {
    return { svg: renderSync(markup), errorPage };
  } finally {
    setErrorPageObserver(undefined);
  }
}

/** Error parity under the 2026-10-10 rule: the jar drew an error page (no
 *  graphviz document), and so did we. Returns the broken half, or undefined. */
function errorParityBreak(golden: string, ours: { svg: string; errorPage: boolean }): string | undefined {
  if (golden.includes(GRAPHVIZ_DOCUMENT_MARK)) return 'the golden is a graphviz document, not a jar error page';
  if (!ours.errorPage) return 'we did not draw an error page';
  if (ours.svg.includes(GRAPHVIZ_DOCUMENT_MARK)) return 'our page is a graphviz document';
  return undefined;
}

// ---------------------------------------------------------------------------
// AC1 — every locked fixture stays conformant.
// ---------------------------------------------------------------------------

describe('svg-dot conformance ratchet (AC1)', () => {
  for (const f of drawn) {
    it(`dot/${f.slug}: stays zero-diff against the pinned golden`, () => {
      const { pass, diffs } = compareSvg(renderSync(readSource(f)), readGolden(f), 'deterministic');
      expect(
        pass,
        `dot/${f.slug}: conformance regression — first diff: ${firstDiffPath(diffs)}` +
          ` — ${JSON.stringify(diffs[0])}`,
      ).toBe(true);
      expect(diffs).toEqual([]);
    });
  }

  it('pins the whole known @startdot corpus', () => {
    // 5 -> 52 at dogr/T1 (2026-11-14): +47 #109 rows, zero-diff on this path (#141).
    // Derivation: 5 + 47 = 52.
    // 52 -> 60 at dogr/T1b (2026-11-14): +8 #109 jar error-page rows (2026-10-10 rule, #141).
    // Derivation: 52 + 8 = 60.
    expect(manifest.fixtures.length).toBe(60);
  });

  it('only a jar error-page row carries a score, and every one carries both halves', () => {
    expect(drawn.filter((f) => f.weightedScore !== undefined || f.diffCount !== undefined).map((f) => f.slug)).toEqual(
      [],
    );
    expect(
      jarErrors.filter((f) => f.weightedScore === undefined || f.diffCount === undefined).map((f) => f.slug),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Jar error-page rows (2026-10-10 error-page rule): score held, parity asserted.
// ---------------------------------------------------------------------------

describe('svg-dot jar error-page rows', () => {
  it("every jarError has stock-error-pages.json's { line, message } shape and its message in the golden", () => {
    expect(jarErrors.length).toBeGreaterThan(0);
    for (const f of jarErrors) {
      expect(Object.keys(f.jarError!).sort(), f.slug).toEqual(['line', 'message']);
      expect(f.jarError!.line === null || Number.isInteger(f.jarError!.line), f.slug).toBe(true);
      expect(readGolden(f).replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });

  for (const f of jarErrors) {
    it(`dot/${f.slug}: weighted score never rises above its pin (${String(f.weightedScore)})`, () => {
      const { diffs } = compareSvg(renderSync(readSource(f)), readGolden(f), 'deterministic');
      expect(
        weightedScore(diffs),
        `dot/${f.slug}: score rose. Re-pin only from a fresh measurement.`,
      ).toBeLessThanOrEqual(f.weightedScore!);
    });

    it(`dot/${f.slug}: jar errors and we error`, () => {
      expect(errorParityBreak(readGolden(f), renderObserved(readSource(f))), `dot/${f.slug}`).toBeUndefined();
    });
  }

  it('error parity fails when ours draws a diagram for an error row (in-memory edit only)', () => {
    const target = jarErrors[0]!;
    // Drop everything between @startdot and the graphviz header, so the
    // header is the first line PSystemDotFactory sees and we draw the graph.
    const lines = readSource(target).split('\n');
    const header = lines.findIndex((l) => /^\s*(strict\s+)?(di)?graph\b/.test(l));
    expect(header).toBeGreaterThan(1);
    const drawing = [lines[0]!, ...lines.slice(header)].join('\n');
    expect(errorParityBreak(readGolden(target), renderObserved(drawing))).toBe('we did not draw an error page');
    // And the other half: a graphviz golden is never a jar error page.
    const graphvizGolden = readGolden(drawn[0]!);
    expect(errorParityBreak(graphvizGolden, renderObserved(readSource(target)))).toBe(
      'the golden is a graphviz document, not a jar error page',
    );
  });
});

// ---------------------------------------------------------------------------
// AC2 — tamper detection: an in-memory golden mutation must be caught, and
// the failure message must name the slug + first diff path.
// ---------------------------------------------------------------------------

describe('svg-dot conformance ratchet — tamper detection (AC2)', () => {
  it('a mutated golden (in-memory only) produces a failure naming slug + diff path', () => {
    const target = manifest.fixtures[0]!;
    const golden = readGolden(target);
    const ours = renderSync(readSource(target));

    // Confirm the untampered pair really is zero-diff first, so the tampered
    // failure below is attributable to the mutation alone.
    expect(compareSvg(ours, golden, 'deterministic').pass, `dot/${target.slug}: expected zero-diff baseline`).toBe(
      true,
    );

    // Mutate a numeric attribute in-memory — never touches disk. graphviz
    // writes ellipse centres, so shift one well outside tolerance.
    const tampered = golden.replace(/cx="([\d.]+)"/, (_m, cx: string) => `cx="${Number(cx) + 500}"`);
    expect(tampered).not.toBe(golden);

    const { pass, diffs } = compareSvg(ours, tampered, 'deterministic');
    expect(pass).toBe(false);
    expect(diffs.length).toBeGreaterThan(0);

    const message =
      `dot/${target.slug}: conformance regression — first diff: ${firstDiffPath(diffs)}` +
      ` — ${JSON.stringify(diffs[0])}`;
    expect(message).toContain(target.slug);
    expect(message).toContain(diffs[0]!.path);
  });
});

// ---------------------------------------------------------------------------
// The passthrough contract itself: this is what makes the type conformant, so
// assert it directly rather than only through the goldens.
// ---------------------------------------------------------------------------

describe('svg-dot — passthrough is byte-exact', () => {
  for (const f of drawn) {
    it(`dot/${f.slug}: renderSync emits graphviz's document, not this port's markup`, () => {
      const ours = renderSync(readSource(f));
      expect(ours).toContain(GRAPHVIZ_DOCUMENT_MARK);
      // This port's shared shell auto-embeds arrowhead <marker> defs. Their
      // presence would mean the document went through `svgRoot` — the exact
      // regression that made the baseline 0/5.
      expect(ours).not.toContain('<marker');
    });
  }
});
