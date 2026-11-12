/**
 * The svg-flow MULTISET tier (flp D4, D7). The jar draws `@startflow` boxes
 * in `HashMap<Tile, ActivityBox>` identity-hash order, and after a
 * `moveAllToEast` shift it places them in that order too
 * (`FlowDiagram.java:129-140`, `TilesField.java:158-173`), so its SVG changes
 * on every run. The port iterates in insertion order, one order the jar can
 * produce. A row that draws two or more boxes therefore matches the frozen
 * oracle positionally only by chance, and is held here instead: our render
 * must equal the oracle, or one of its recorded `.vN.svg` layouts, as a
 * multiset of tags.
 *
 * This tier is a regression test of our output, NOT a conformance verdict.
 * The survey's verdict stays `compareSvg`'s. Since ruling #174, `compareSvg`
 * itself orders flow box groups canonically (`flow-box-order.ts`), so a row
 * whose layout is stable is conformant there; this tier still holds the
 * fixtures whose LAYOUT varies, which only a recorded `.vN.svg` can match.
 *
 * Inputs: every authored fixture under `tests/fixtures/flow/` whose source
 * draws two or more boxes (`countFlowBoxes`, flp D6) and whose oracle is a
 * FLOW document, plus the cached rows in `oracle/goldens/svg-flow/multiset.json`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  countFlowBoxes,
  listAuthoredFlowSlugs,
  readAuthoredFlowFixture,
  readAuthoredFlowVariants,
  renderFixtureFlow,
} from './render-fixture-flow.js';
import { isMultisetEqual, multisetDiff } from './svg-multiset.js';

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-flow');
const FLOW_ROOT = /^<svg[^>]*\sdata-diagram-type="FLOW"/;
/** Multi-box authored fixtures at flp T3b (journal row 13); a change means the tree moved. */
const MULTI_BOX_FIXTURES = 38;

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'multiset.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string; readonly type: string }[];
};

const multiBox = listAuthoredFlowSlugs().filter((slug) => {
  const { markup, golden } = readAuthoredFlowFixture(slug);
  return countFlowBoxes(markup) >= 2 && FLOW_ROOT.test(golden ?? '');
});

/** The first tags each side lacks, for the failure message. */
function explain(ours: string, oracles: readonly string[]): string {
  const { onlyOurs, onlyTheirs } = multisetDiff(ours, oracles[0]!);
  return `ours+${onlyOurs.length} jar+${onlyTheirs.length}: ${JSON.stringify([onlyOurs[0], onlyTheirs[0]])}`;
}

describe('svg-flow multiset tier — population', () => {
  it(`holds the ${MULTI_BOX_FIXTURES} multi-box authored fixtures and the cached rows of multiset.json`, () => {
    expect(multiBox).toHaveLength(MULTI_BOX_FIXTURES);
    // Empty since ruling #174: bemixo-79-xulu250 is compareSvg-conformant and
    // pinned in ratchet.json. Its golden still feeds the tamper test below.
    expect(manifest.fixtures.map((f) => `${f.type}/${f.slug}`)).toEqual([]);
  });
});

describe('svg-flow multiset tier — authored fixtures', () => {
  for (const slug of multiBox) {
    it(`authored/${slug}: multiset-equal to its oracle or a recorded layout`, () => {
      const ours = renderFixtureFlow(readAuthoredFlowFixture(slug).markup);
      const oracles = readAuthoredFlowVariants(slug);
      expect(
        oracles.some((o) => isMultisetEqual(ours, o)),
        `${slug}: ${explain(ours, oracles)}`,
      ).toBe(true);
    });
  }
});

describe('svg-flow multiset tier — cached rows', () => {
  for (const f of manifest.fixtures) {
    it(`${f.type}/${f.slug}: multiset-equal to its golden`, () => {
      const dir = join(GOLDENS_ROOT, f.type, f.slug);
      const ours = renderFixtureFlow(readFileSync(join(dir, 'in.puml'), 'utf8'));
      const golden = readFileSync(join(dir, 'golden.svg'), 'utf8');
      expect(isMultisetEqual(ours, golden), `${f.slug}: ${explain(ours, [golden])}`).toBe(true);
    });
  }
});

describe('svg-flow multiset tier — tamper detection', () => {
  it('a broken label (in memory only) fails the tier', () => {
    const golden = readFileSync(join(GOLDENS_ROOT, 'unknown/bemixo-79-xulu250/golden.svg'), 'utf8');
    const ours = renderFixtureFlow(readFileSync(join(GOLDENS_ROOT, 'unknown/bemixo-79-xulu250/in.puml'), 'utf8'));
    expect(isMultisetEqual(ours, golden)).toBe(true);
    const tampered = golden.replace('>START</text>', '>STRAT</text>');
    expect(tampered).not.toBe(golden);
    expect(multisetDiff(ours, tampered)).toEqual({ onlyOurs: ['START</text'], onlyTheirs: ['STRAT</text'] });
  });
});
