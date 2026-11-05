/**
 * The svg-chart authored root (cep D7), the authored half of
 * `wbs.diff-baseline.ratchet.test.ts`: `tests/fixtures/chart/` holds original
 * fixtures (`<slug>.puml` + the jar's `<slug>.svg` beside it, flat) tracked by
 * `oracle/goldens/svg-chart/authored-baseline.json`.
 *
 * No `diff-baseline.json`: every cached row is pinned in `ratchet.json`, so it
 * would be an empty population (D7).
 *
 * A nonzero row is a jar error page where we also error: conformant by the
 * 2026-10-10 error-page ruling, which never asks us to match that page. Its score
 * is pinned so a change in what we draw there is still seen, and its `jarError`
 * records the oracle's message.
 *
 * Re-measure: `npx jiti plans/chart-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg, weightedScore } from './compare.js';
import {
  authoredChartIncludeStore,
  listAuthoredChartSlugs,
  readAuthoredChartFixture,
  renderFixtureChart,
} from './render-fixture-chart.js';

interface AuthoredFixture {
  readonly type: string;
  readonly slug: string;
  readonly topic: string;
  readonly status: 'baseline';
  readonly weightedScore: number;
  readonly diffCount: number;
  readonly reason?: string;
  readonly jarError?: { readonly line: number | null; readonly message: string };
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-chart');
const CACHE_DIR = join(HERE, '../../../test-results/dot-cache/chart');
/** The cached chart population at cep's start. */
const CHART_CACHED_SLUG_COUNT = 29;

const authored = JSON.parse(readFileSync(join(GOLDENS_DIR, 'authored-baseline.json'), 'utf8')) as {
  readonly fixtures: readonly AuthoredFixture[];
};
const ratchet = JSON.parse(readFileSync(join(GOLDENS_DIR, 'ratchet.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string }[];
};

function renderAuthored(markup: string): string {
  return renderFixtureChart(markup, new DeterministicMeasurer(), { includeStore: authoredChartIncludeStore() });
}

/** The root `<svg>`'s `data-diagram-type`; absent on both engines' error pages. */
function diagramTypeOf(svg: string): string | undefined {
  const root = /^<svg[^>]*>/.exec(svg)?.[0] ?? '';
  return /\sdata-diagram-type="([^"]*)"/.exec(root)?.[1];
}

describe('svg-chart cached rows', () => {
  it(`every one of the ${CHART_CACHED_SLUG_COUNT} cached rows is pinned in the ratchet`, () => {
    const cached = readdirSync(CACHE_DIR)
      .filter((f) => statSync(join(CACHE_DIR, f)).isDirectory())
      .sort();
    expect(cached).toHaveLength(CHART_CACHED_SLUG_COUNT);
    expect(ratchet.fixtures.map((f) => f.slug).sort()).toEqual(cached);
  });
});

describe('svg-chart authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/chart/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredChartSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredChartFixture(slug).golden === undefined)).toEqual([]);
  });

  it('authored slugs are disjoint from the cached corpus and the ratchet pins', () => {
    const taken = new Set([...readdirSync(CACHE_DIR), ...ratchet.fixtures.map((f) => f.slug)]);
    expect(authored.fixtures.filter((f) => taken.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  it('a nonzero row is exactly a jar error, and names why', () => {
    const nonzero = authored.fixtures.filter((f) => f.weightedScore !== 0);
    expect(nonzero.filter((f) => f.jarError === undefined).map((f) => f.slug)).toEqual([]);
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
      const golden = readAuthoredChartFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-chart authored fixtures — weighted score never rises', () => {
  for (const f of authored.fixtures) {
    it(`authored/${f.slug}: weighted score never rises above its baseline (${String(f.weightedScore)})`, () => {
      const { markup, golden } = readAuthoredChartFixture(f.slug);
      const { diffs } = compareSvg(renderAuthored(markup), golden!, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
        f.weightedScore,
      );
    });
  }
});

describe('svg-chart authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredChartFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderAuthored(markup)), f.slug).toBe(jarType);
    });
  }
});
