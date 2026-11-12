/**
 * The svg-cheneer authored root (ceep T4), a copy of `regex.diff-baseline.ratchet.test.ts` (rep D6, D7) without
 * its cached-row section: the corpus has no `@startchen` row (ceep D6), so every row is authored.
 * `tests/fixtures/cheneer/` holds the fixtures (`<slug>.puml` + the jar's `<slug>.svg` beside it, flat), tracked by
 * `oracle/goldens/svg-cheneer/authored-baseline.json`.
 *
 * A nonzero row is a jar error page where we also error (conformant by the 2026-10-10 error-page ruling, its
 * `jarError` recording the oracle's message), or a row the jar draws whose `reason` names its D12 end. Its score is
 * pinned so a change is still seen.
 *
 * The `cov-elk*` rows lay out through ELK, so the backend is loaded once before any render, as the survey does.
 *
 * Re-measure: `npx jiti plans/chen-eer-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
 */
import { beforeAll, describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg, weightedScore } from './compare.js';
import {
  listAuthoredCheneerSlugs,
  prepareElkOnce,
  readAuthoredCheneerFixture,
  renderFixtureCheneer,
} from './render-fixture-cheneer.js';

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
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-cheneer');
/** Authored rows the jar draws and we do not match: none (ceep journal, T3c/T3d). */
const OPEN_ROWS: readonly string[] = [];

const authored = JSON.parse(readFileSync(join(GOLDENS_DIR, 'authored-baseline.json'), 'utf8')) as {
  readonly fixtures: readonly AuthoredFixture[];
};
const ratchet = JSON.parse(readFileSync(join(GOLDENS_DIR, 'ratchet.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string }[];
};

/** The root `<svg>`'s `data-diagram-type`; absent on both engines' error pages. */
function diagramTypeOf(svg: string): string | undefined {
  const root = /^<svg[^>]*>/.exec(svg)?.[0] ?? '';
  return /\sdata-diagram-type="([^"]*)"/.exec(root)?.[1];
}

beforeAll(async () => {
  await prepareElkOnce();
});

describe('svg-cheneer authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/cheneer/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredCheneerSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredCheneerFixture(slug).golden === undefined)).toEqual([]);
  });

  it('authored slugs are disjoint from the ratchet pins (empty: no corpus row)', () => {
    expect(ratchet.fixtures).toEqual([]);
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
      const golden = readAuthoredCheneerFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<').replaceAll(' ', ' '), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-cheneer authored fixtures — weighted score never rises', () => {
  for (const f of authored.fixtures) {
    it(`authored/${f.slug}: weighted score never rises above its baseline (${String(f.weightedScore)})`, () => {
      const { markup, golden } = readAuthoredCheneerFixture(f.slug);
      const { diffs } = compareSvg(renderFixtureCheneer(markup), golden!, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
        f.weightedScore,
      );
    });
  }
});

describe('svg-cheneer authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures.filter((row) => !OPEN_ROWS.includes(row.slug))) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredCheneerFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderFixtureCheneer(markup)), f.slug).toBe(jarType);
    });
  }
});
