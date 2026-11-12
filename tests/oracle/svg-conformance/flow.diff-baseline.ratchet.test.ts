/**
 * The svg-flow authored root (flp D6, D7), a copy of
 * `bpm.diff-baseline.ratchet.test.ts`: `tests/fixtures/flow/` holds original
 * fixtures (`<slug>.puml` + the jar's `<slug>.svg` beside it, flat, plus a
 * `<slug>.vN.svg` per extra jar layout) tracked by
 * `oracle/goldens/svg-flow/authored-baseline.json`.
 *
 * The one cached `@startflow` row is held by the multiset tier
 * (`oracle/goldens/svg-flow/multiset.json`) until #174 rules, so there is no
 * `diff-baseline.json` (flp D7: written only for a row nonzero for a reason
 * other than order).
 *
 * A nonzero authored row is a jar error page where we also error (conformant
 * by the 2026-10-10 error-page ruling, its `jarError` recording the oracle's
 * message), or a multi-box row whose only difference is the jar's
 * identity-hash box order (flp D4), its `reason` naming #174 and its
 * multiset equality held by `flow.multiset.ratchet.test.ts`. Its score is
 * pinned so a change is still seen.
 *
 * Re-measure: `npx jiti plans/flow-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg, weightedScore } from './compare.js';
import {
  countFlowBoxes,
  listAuthoredFlowSlugs,
  readAuthoredFlowFixture,
  renderFixtureFlow,
} from './render-fixture-flow.js';

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
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-flow');
const CACHE_DIR = join(HERE, '../../../test-results/dot-cache');
/** The `@startflow` rows at flp's start (`measurements/planning-rows.json`), all in `unknown`. */
const FLOW_ROW_COUNT = 1;
/** The ruling the order-only multi-box rows wait on (flp D4). */
const D4_ISSUE = '#174';

const authored = JSON.parse(readFileSync(join(GOLDENS_DIR, 'authored-baseline.json'), 'utf8')) as {
  readonly fixtures: readonly AuthoredFixture[];
};
const ratchet = JSON.parse(readFileSync(join(GOLDENS_DIR, 'ratchet.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string; readonly type: string }[];
};
const multiset = JSON.parse(readFileSync(join(GOLDENS_DIR, 'multiset.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string; readonly type: string }[];
};

/** The root `<svg>`'s `data-diagram-type`; absent on both engines' error pages. */
function diagramTypeOf(svg: string): string | undefined {
  const root = /^<svg[^>]*>/.exec(svg)?.[0] ?? '';
  return /\sdata-diagram-type="([^"]*)"/.exec(root)?.[1];
}

/** Every slug of the cached bucket the flow rows come from. */
function cachedSlugs(): Set<string> {
  const out = new Set<string>();
  for (const bucket of ['unknown']) {
    const dir = join(CACHE_DIR, bucket);
    for (const f of readdirSync(dir)) if (statSync(join(dir, f)).isDirectory()) out.add(f);
  }
  return out;
}

describe('svg-flow cached rows', () => {
  it(`every one of the ${FLOW_ROW_COUNT} flow rows is pinned or held by the multiset tier, each in its cache`, () => {
    const held = [...ratchet.fixtures, ...multiset.fixtures];
    expect(held).toHaveLength(FLOW_ROW_COUNT);
    expect(new Set(held.map((f) => f.slug)).size).toBe(FLOW_ROW_COUNT);
    const cached = cachedSlugs();
    expect(held.filter((f) => !cached.has(f.slug)).map((f) => `${f.type}/${f.slug}`)).toEqual([]);
  });
});

describe('svg-flow authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/flow/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredFlowSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredFlowFixture(slug).golden === undefined)).toEqual([]);
  });

  it('authored slugs are disjoint from the cached corpus and the ratchet pins', () => {
    const taken = new Set([
      ...cachedSlugs(),
      ...ratchet.fixtures.map((f) => f.slug),
      ...multiset.fixtures.map((f) => f.slug),
    ]);
    expect(authored.fixtures.filter((f) => taken.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  it('the rows the jar draws and we do not match are multi-box rows waiting on the D4 ruling', () => {
    const open = authored.fixtures.filter((f) => f.weightedScore !== 0 && f.jarError === undefined);
    expect(open.length).toBeGreaterThan(0);
    for (const f of open) {
      expect(countFlowBoxes(readAuthoredFlowFixture(f.slug).markup), f.slug).toBeGreaterThanOrEqual(2);
      expect(f.reason, f.slug).toContain(D4_ISSUE);
    }
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
      const golden = readAuthoredFlowFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-flow authored fixtures — weighted score never rises', () => {
  for (const f of authored.fixtures) {
    it(`authored/${f.slug}: weighted score never rises above its baseline (${String(f.weightedScore)})`, () => {
      const { markup, golden } = readAuthoredFlowFixture(f.slug);
      const { diffs } = compareSvg(renderFixtureFlow(markup), golden!, 'deterministic');
      expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
        f.weightedScore,
      );
    });
  }
});

describe('svg-flow authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredFlowFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderFixtureFlow(markup)), f.slug).toBe(jarType);
    });
  }
});
