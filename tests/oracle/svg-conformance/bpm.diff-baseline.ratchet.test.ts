/**
 * The svg-bpm authored root (bpe D6, D7), a copy of
 * `nwdiag.diff-baseline.ratchet.test.ts`: `tests/fixtures/bpm/` holds original
 * fixtures (`<slug>.puml` + the jar's `<slug>.svg` beside it, flat) tracked by
 * `oracle/goldens/svg-bpm/authored-baseline.json`.
 *
 * All 7 cached `@startbpm` rows are drawn by the jar and zero-diff, so every
 * one is in `ratchet.json` and there is no `diff-baseline.json` (bpe D7: it is
 * written only if a row stays nonzero).
 *
 * A nonzero row is a jar error page where we also error (conformant by the
 * 2026-10-10 error-page ruling, its `jarError` recording the oracle's message),
 * or a row the jar draws whose `reason` names its D6 end. Its score is pinned
 * so a change is still seen.
 *
 * Re-measure: `npx jiti plans/bpm-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg, weightedScore } from './compare.js';
import { listAuthoredBpmSlugs, readAuthoredBpmFixture, renderFixtureBpm } from './render-fixture-bpm.js';

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
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-bpm');
const CACHE_DIR = join(HERE, '../../../test-results/dot-cache');
/** The `@startbpm` rows at bpe's start (`measurements/planning-rows.json`), all in `unknown`. */
const BPM_ROW_COUNT = 7;
/** Authored rows the jar draws and we do not match: none (bpe journal rows 11-12). */
const OPEN_ROWS: readonly string[] = [];

const authored = JSON.parse(readFileSync(join(GOLDENS_DIR, 'authored-baseline.json'), 'utf8')) as {
  readonly fixtures: readonly AuthoredFixture[];
};
const ratchet = JSON.parse(readFileSync(join(GOLDENS_DIR, 'ratchet.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string; readonly type: string }[];
};

/** The root `<svg>`'s `data-diagram-type`; absent on both engines' error pages. */
function diagramTypeOf(svg: string): string | undefined {
  const root = /^<svg[^>]*>/.exec(svg)?.[0] ?? '';
  return /\sdata-diagram-type="([^"]*)"/.exec(root)?.[1];
}

/** Every slug of the cached bucket the bpm rows come from. */
function cachedSlugs(): Set<string> {
  const out = new Set<string>();
  for (const bucket of ['unknown']) {
    const dir = join(CACHE_DIR, bucket);
    for (const f of readdirSync(dir)) if (statSync(join(dir, f)).isDirectory()) out.add(f);
  }
  return out;
}

describe('svg-bpm cached rows', () => {
  it(`every one of the ${BPM_ROW_COUNT} bpm rows is pinned in the ratchet, each in its cache`, () => {
    expect(ratchet.fixtures).toHaveLength(BPM_ROW_COUNT);
    expect(new Set(ratchet.fixtures.map((f) => f.slug)).size).toBe(BPM_ROW_COUNT);
    const cached = cachedSlugs();
    expect(ratchet.fixtures.filter((f) => !cached.has(f.slug)).map((f) => `${f.type}/${f.slug}`)).toEqual([]);
  });
});

describe('svg-bpm authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/bpm/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredBpmSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredBpmFixture(slug).golden === undefined)).toEqual([]);
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
      const golden = readAuthoredBpmFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-bpm authored fixtures — weighted score never rises', () => {
  for (const f of authored.fixtures) {
    it(`authored/${f.slug}: weighted score never rises above its baseline (${String(f.weightedScore)})`, () => {
      const { markup, golden } = readAuthoredBpmFixture(f.slug);
      const { diffs } = compareSvg(renderFixtureBpm(markup), golden!, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
        f.weightedScore,
      );
    });
  }
});

describe('svg-bpm authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures.filter((row) => !OPEN_ROWS.includes(row.slug))) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredBpmFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderFixtureBpm(markup)), f.slug).toBe(jarType);
    });
  }
});
