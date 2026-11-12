/**
 * Offline SVG-conformance RATCHET for the flow engine (flp D7), a copy of
 * `bpm.golden.ratchet.test.ts`: committed goldens, `DeterministicMeasurer`
 * so both sides measure text in the same system, and a fixture ratchets in
 * once and never regresses. The row lives in the `unknown` survey bucket, so
 * a pin carries `type: 'unknown'` and lives at `unknown/<slug>/`. Flow has no
 * svek stage, so there is no DOT parity.
 *
 * The one cached `@startflow` row, `bemixo-79-xulu250`, draws 9 boxes, so its
 * jar oracle follows Java identity-hash order (flp D4) and it is not
 * zero-diff: it is held by `flow.multiset.ratchet.test.ts` and pins here only
 * if the survey ever calls it conformant (ruling #174). Until then the
 * equality tier is the authored one-box fixtures and error pairs
 * (`flow.diff-baseline.ratchet.test.ts`), and the tamper check runs on one.
 *
 * Pinning is by `plans/flow-engine-port/measurements/pin-flow.mts`;
 * `oracle/goldens/svg-flow/README.md`'s "Add rule" names it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg } from './compare.js';
import { readAuthoredFlowFixture, renderFixtureFlow } from './render-fixture-flow.js';

interface RatchetFixture {
  slug: string;
  type: string;
  addedAt: string;
  source: string;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDENS_ROOT = join(HERE, '../../../oracle/goldens/svg-flow');
/** The `@startflow` rows at flp's start (`plans/flow-engine-port/measurements/planning-rows.json`). */
const FLOW_ROWS: readonly string[] = ['bemixo-79-xulu250'];
/** A one-box authored fixture, zero-diff against the jar (flp journal row 13). */
const TAMPER_FIXTURE = 'cov-single';

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;
const survey = JSON.parse(readFileSync(join(HERE, 'parity-unknown.json'), 'utf8')) as {
  readonly fixtures: readonly { readonly slug: string; readonly verdict: string }[];
};

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.type, f.slug, 'golden.svg'), 'utf8');
}

function renderPinned(f: RatchetFixture): string {
  return renderFixtureFlow(readFileSync(join(GOLDENS_ROOT, f.type, f.slug, 'in.puml'), 'utf8'));
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

describe('svg-flow conformance ratchet (AC1)', () => {
  it('pins exactly the flow rows the committed unknown survey calls conformant, from that bucket only', () => {
    const conformant = new Set(survey.fixtures.filter((r) => r.verdict === 'conformant').map((r) => r.slug));
    expect(manifest.fixtures.filter((f) => f.type !== 'unknown')).toEqual([]);
    expect(manifest.fixtures.map((f) => f.slug).sort()).toEqual(FLOW_ROWS.filter((s) => conformant.has(s)));
  });

  for (const f of manifest.fixtures) {
    it(`${f.type}/${f.slug}: stays zero-diff against the pinned golden`, () => {
      const { pass, diffs } = compareSvg(renderPinned(f), readGolden(f), 'deterministic');
      expect(
        pass,
        `${f.type}/${f.slug}: conformance regression — first diff: ${firstDiffPath(diffs)} — ${JSON.stringify(diffs[0])}`,
      ).toBe(true);
      expect(diffs).toEqual([]);
    });
  }
});

describe('svg-flow conformance ratchet — tamper detection (AC2)', () => {
  it('a mutated golden (in-memory only) produces a failure naming slug + diff path', () => {
    const { markup, golden } = readAuthoredFlowFixture(TAMPER_FIXTURE);
    const ours = renderFixtureFlow(markup);

    expect(compareSvg(ours, golden!, 'deterministic').pass, `${TAMPER_FIXTURE}: expected zero-diff baseline`).toBe(
      true,
    );

    const tampered = golden!.replace('>START</text>', '>STRAT</text>');
    expect(tampered).not.toBe(golden);

    const { pass, diffs } = compareSvg(ours, tampered, 'deterministic');
    expect(pass).toBe(false);
    expect(diffs.length).toBeGreaterThan(0);

    const message = `${TAMPER_FIXTURE}: conformance regression — first diff: ${firstDiffPath(diffs)}`;
    expect(message).toContain(TAMPER_FIXTURE);
    expect(message).toContain(diffs[0]!.path);
  });
});
