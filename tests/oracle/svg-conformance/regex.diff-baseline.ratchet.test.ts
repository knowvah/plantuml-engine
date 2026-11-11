/**
 * The svg-regex authored root (rep D6, D7), a copy of the EBNF engine's diff-baseline ratchet (itself
 * `nwdiag.diff-baseline.ratchet.test.ts`'s): `tests/fixtures/regex/`
 * holds original fixtures (`<slug>.puml` + the jar's `<slug>.svg` beside it,
 * flat) tracked by `oracle/goldens/svg-regex/authored-baseline.json`.
 *
 * `diff-baseline.json` holds the cached rows the jar draws as an error page
 * (`stock-error-pages.json`, `bakuza-41-bulo451`, `tajefa-31-pefi801`), where we error too: they can
 * never be zero-diff, so they are pinned by score (D7). Every other cached row is
 * in `ratchet.json`.
 * Re-measure them with `build-diff-baseline.mts <commit> [--write]`.
 *
 * A nonzero row is a jar error page where we also error (conformant by the
 * 2026-10-10 error-page ruling, its `jarError` recording the oracle's message),
 * or a row the jar draws whose `reason` names its D8 end. Its score is pinned
 * so a change is still seen.
 *
 * Re-measure: `npx jiti plans/regex-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg, weightedScore } from './compare.js';
import { listAuthoredRegexSlugs, readAuthoredRegexFixture, renderFixtureRegex } from './render-fixture-regex.js';

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
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-regex');
const CACHE_DIR = join(HERE, '../../../test-results/dot-cache');
/** The `@startregex` rows at rep's start (`measurements/planning-rows.json`), all in the `regex` bucket. */
const REGEX_ROW_COUNT = 46;
/** Authored rows the jar draws and we do not match: none (rep journal 15, 16). */
const OPEN_ROWS: readonly string[] = [];

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

/** Every slug of the cached bucket the regex rows come from. */
function cachedSlugs(): Set<string> {
  const out = new Set<string>();
  for (const bucket of ['regex']) {
    const dir = join(CACHE_DIR, bucket);
    for (const f of readdirSync(dir)) if (statSync(join(dir, f)).isDirectory()) out.add(f);
  }
  return out;
}

describe('svg-regex cached rows', () => {
  it(`every one of the ${REGEX_ROW_COUNT} regex rows is pinned in the ratchet or the diff baseline, each in its cache`, () => {
    const all = [...ratchet.fixtures, ...cachedErrors.fixtures];
    expect(all).toHaveLength(REGEX_ROW_COUNT);
    expect(new Set(all.map((f) => f.slug)).size).toBe(REGEX_ROW_COUNT);
    const cached = cachedSlugs();
    expect(all.filter((f) => !cached.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  for (const f of cachedErrors.fixtures) {
    it(`${f.type}/${f.slug}: the jar errors and we error, score never above ${String(f.weightedScore)}`, () => {
      const dir = join(CACHE_DIR, f.type, f.slug);
      const golden = readFileSync(join(dir, 'in.svg'), 'utf8');
      const ours = renderFixtureRegex(readFileSync(join(dir, 'in.puml'), 'utf8'));
      expect(f.jarError, f.slug).toBeDefined();
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
      expect([diagramTypeOf(golden), diagramTypeOf(ours)], f.slug).toEqual([undefined, undefined]);
      const { diffs } = compareSvg(ours, golden, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose`).toBeLessThanOrEqual(f.weightedScore);
    });
  }
});

describe('svg-regex authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/regex/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredRegexSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredRegexFixture(slug).golden === undefined)).toEqual([]);
  });

  it('authored slugs are disjoint from the cached corpus and the ratchet pins', () => {
    const taken = new Set([...cachedSlugs(), ...ratchet.fixtures.map((f) => f.slug)]);
    expect(authored.fixtures.filter((f) => taken.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  it('the rows the jar draws and we do not match are exactly the named open rows', () => {
    const open = authored.fixtures.filter((f) => f.weightedScore !== 0 && f.jarError === undefined);
    expect(open.map((f) => f.slug).sort()).toEqual(OPEN_ROWS);
  });

  it('a nonzero row names why, and a zero row is no jar error', () => {
    const nonzero = authored.fixtures.filter((f) => f.weightedScore !== 0);
    expect(nonzero.filter((f) => f.reason === undefined).map((f) => f.slug)).toEqual([]);
    expect(authored.fixtures.filter((f) => f.diffCount === 0 && f.jarError !== undefined).map((f) => f.slug)).toEqual(
      [],
    );
  });

  it("every jarError row has stock-error-pages.json's { line, message } shape and its message in the oracle", () => {
    const rows = authored.fixtures.filter((f) => f.jarError !== undefined);
    expect(rows.length).toBeGreaterThan(0);
    for (const f of rows) {
      expect(Object.keys(f.jarError!).sort(), f.slug).toEqual(['line', 'message']);
      expect(f.jarError!.line === null || Number.isInteger(f.jarError!.line), f.slug).toBe(true);
      const golden = readAuthoredRegexFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-regex authored fixtures — weighted score never rises', () => {
  for (const f of authored.fixtures) {
    it(`authored/${f.slug}: weighted score never rises above its baseline (${String(f.weightedScore)})`, () => {
      const { markup, golden } = readAuthoredRegexFixture(f.slug);
      const { diffs } = compareSvg(renderFixtureRegex(markup), golden!, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
        f.weightedScore,
      );
    });
  }
});

describe('svg-regex authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures.filter((row) => !OPEN_ROWS.includes(row.slug))) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredRegexFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderFixtureRegex(markup)), f.slug).toBe(jarType);
    });
  }
});
