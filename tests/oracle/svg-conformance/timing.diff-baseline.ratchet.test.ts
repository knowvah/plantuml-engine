/**
 * The svg-timing authored root (tep D12), a copy of the regex engine's diff-baseline ratchet (itself
 * `nwdiag.diff-baseline.ratchet.test.ts`'s): `tests/fixtures/timing/`
 * holds original fixtures (`<slug>.puml` + the jar's `<slug>.svg` beside it,
 * flat) tracked by `oracle/goldens/svg-timing/authored-baseline.json`.
 *
 * `diff-baseline.json` holds the cached rows the jar draws as an error page
 * (`stock-error-pages.json`: six `timing/` rows), where we error too: they can
 * never be zero-diff, so they are pinned by score (D7). Every other cached row is
 * in `ratchet.json`.
 * Re-measure them with `build-diff-baseline.mts <commit> [--write]`.
 *
 * A nonzero row is a jar error page where we also error (conformant by the
 * 2026-10-10 error-page ruling, its `jarError` recording the oracle's message),
 * or a row the jar draws whose `reason` names its D8 end. Its score is pinned
 * so a change is still seen.
 *
 * Re-measure: `npx jiti plans/timing-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg, weightedScore } from './compare.js';
import {
  listAuthoredTimingSlugs,
  readAuthoredTimingFixture,
  renderFixtureTiming,
  timingClockFor,
} from './render-fixture-timing.js';

interface AuthoredFixture {
  readonly type: string;
  readonly slug: string;
  readonly status: 'baseline';
  readonly weightedScore: number;
  readonly diffCount: number;
  readonly reason?: string;
  readonly jarError?: { readonly line: number | null; readonly message: string };
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-timing');
const CACHE_DIR = join(HERE, '../../../test-results/dot-cache');
/** The rows that reach the timing engine (`measurements/planning-rows.json`): 145 in `timing`, 13 drawn in `unknown`. */
const TIMING_ROW_COUNT = 158;
/** Authored rows the jar draws and we do not match: a timing `{{ }}` inside a state note (tep journal row 14). */
const OPEN_ROWS: readonly string[] = ['cov-embedded-state'];

const authored = JSON.parse(readFileSync(join(GOLDENS_DIR, 'authored-baseline.json'), 'utf8')) as {
  readonly fixtures: readonly AuthoredFixture[];
};
const ratchet = JSON.parse(readFileSync(join(GOLDENS_DIR, 'ratchet.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string }[];
};
/** The cached rows the jar draws as an error page, pinned by score (D7). */
const cachedErrors = JSON.parse(readFileSync(join(GOLDENS_DIR, 'diff-baseline.json'), 'utf8')) as {
  readonly fixtures: readonly AuthoredFixture[];
};

/** The root `<svg>`'s `data-diagram-type`; absent on both engines' error pages. */
function diagramTypeOf(svg: string): string | undefined {
  const root = /^<svg[^>]*>/.exec(svg)?.[0] ?? '';
  return /\sdata-diagram-type="([^"]*)"/.exec(root)?.[1];
}

/** Every slug of the cached buckets the timing rows come from. */
function cachedSlugs(): Set<string> {
  const out = new Set<string>();
  for (const bucket of ['timing', 'unknown']) {
    const dir = join(CACHE_DIR, bucket);
    for (const f of readdirSync(dir)) if (statSync(join(dir, f)).isDirectory()) out.add(f);
  }
  return out;
}

describe('svg-timing cached rows', () => {
  it(`every one of the ${TIMING_ROW_COUNT} timing rows is pinned in the ratchet or the diff baseline, each in its cache`, () => {
    const all = [...ratchet.fixtures, ...cachedErrors.fixtures];
    expect(all).toHaveLength(TIMING_ROW_COUNT);
    expect(new Set(all.map((f) => f.slug)).size).toBe(TIMING_ROW_COUNT);
    const cached = cachedSlugs();
    expect(all.filter((f) => !cached.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  for (const f of cachedErrors.fixtures) {
    it(`${f.type}/${f.slug}: the jar errors and we error, score never above ${String(f.weightedScore)}`, () => {
      const dir = join(CACHE_DIR, f.type, f.slug);
      const golden = readFileSync(join(dir, 'in.svg'), 'utf8');
      const ours = renderFixtureTiming(readFileSync(join(dir, 'in.puml'), 'utf8'), undefined, timingClockFor(f.slug));
      expect(f.jarError, f.slug).toBeDefined();
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
      expect([diagramTypeOf(golden), diagramTypeOf(ours)], f.slug).toEqual([undefined, undefined]);
      const { diffs } = compareSvg(ours, golden, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose`).toBeLessThanOrEqual(f.weightedScore);
    });
  }
});

describe('svg-timing authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/timing/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredTimingSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredTimingFixture(slug).golden === undefined)).toEqual([]);
  });

  it('authored slugs are disjoint from the cached corpus and the ratchet pins', () => {
    const taken = new Set([...cachedSlugs(), ...ratchet.fixtures.map((f) => f.slug)]);
    expect(authored.fixtures.filter((f) => taken.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  it('the rows the jar draws and we do not match are exactly the named open rows', () => {
    const open = authored.fixtures.filter((f) => f.weightedScore !== 0 && f.jarError === undefined);
    expect(open.map((f) => f.slug).sort()).toEqual(OPEN_ROWS);
  });

  it('a nonzero row names why, and the only zero-diff jar-error row is the empty-source Welcome page', () => {
    const nonzero = authored.fixtures.filter((f) => f.weightedScore !== 0);
    expect(nonzero.filter((f) => f.reason === undefined).map((f) => f.slug)).toEqual([]);
    // `cov-empty` has no diagram: both engines print the same "Welcome to PlantUML!" page, so it is a jar error
    // page we match exactly (an error pair at score 0).
    expect(authored.fixtures.filter((f) => f.diffCount === 0 && f.jarError !== undefined).map((f) => f.slug)).toEqual([
      'cov-empty',
    ]);
  });

  it("every jarError row has stock-error-pages.json's { line, message } shape and its message in the oracle", () => {
    const rows = authored.fixtures.filter((f) => f.jarError !== undefined);
    expect(rows.length).toBeGreaterThan(0);
    for (const f of rows) {
      expect(Object.keys(f.jarError!).sort(), f.slug).toEqual(['line', 'message']);
      expect(f.jarError!.line === null || Number.isInteger(f.jarError!.line), f.slug).toBe(true);
      const golden = readAuthoredTimingFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-timing authored fixtures — weighted score never rises', () => {
  for (const f of authored.fixtures) {
    it(`authored/${f.slug}: weighted score never rises above its baseline (${String(f.weightedScore)})`, () => {
      const { markup, golden } = readAuthoredTimingFixture(f.slug);
      const { diffs } = compareSvg(
        renderFixtureTiming(markup, undefined, timingClockFor(f.slug)),
        golden!,
        'deterministic',
      );
      expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
        f.weightedScore,
      );
    });
  }
});

describe('svg-timing authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures.filter((row) => !OPEN_ROWS.includes(row.slug))) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredTimingFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderFixtureTiming(markup, undefined, timingClockFor(f.slug))), f.slug).toBe(jarType);
    });
  }
});
