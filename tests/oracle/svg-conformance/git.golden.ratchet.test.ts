/**
 * Offline SVG-conformance RATCHET for the git engine (gip D8), a copy of
 * `bpm.golden.ratchet.test.ts` with a second tier. Committed goldens,
 * `DeterministicMeasurer` so both sides measure text in the same system. The
 * rows live in the `unknown` survey bucket, so a pin carries `type: 'unknown'`
 * and lives at `unknown/<slug>/`. git is a Smetana path (no svek stage), so
 * there is no DOT parity.
 *
 * Two tiers (gip D8):
 *   - `conformant`: zero `compareSvg` diffs, as in svg-bpm;
 *   - `structural`: the survey's own `structural-match` verdict
 *     (`scripts/svg-parity-survey.ts#diffVerdict`: same elements and strings,
 *     numeric deltas only) with a per-row `maxDelta` ceiling that may only
 *     fall. The residue is the Smetana delta `DIVERGENCES.md` names (git row
 *     table). A structural row that turns conformant fails here with a message
 *     to promote it; a row never moves back.
 *
 * Pinning is by `plans/git-engine-port/measurements/pin-git.mts`;
 * `oracle/goldens/svg-git/README.md`'s "Add rule" names it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffVerdict } from '../../../scripts/svg-parity-survey.js';
import { compareSvg } from './compare.js';
import { renderFixtureGit } from './render-fixture-git.js';

interface RatchetFixture {
  slug: string;
  type: string;
  addedAt: string;
  source: string;
  tier: 'conformant' | 'structural';
  /** The `structural` tier's ceiling: the survey's `maxDelta`, which may only fall. */
  maxDelta?: number;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-git');
const STRUCTURAL_MATCH = 'structural-match';
const CONFORMANT = 'conformant';
/** A box moved this far is far past any pinned ceiling (largest 3.881, mebafo). */
const TAMPER_SHIFT = 500;

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;
const conformant = manifest.fixtures.filter((f) => f.tier === 'conformant');
const structural = manifest.fixtures.filter((f) => f.tier === 'structural');

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.type, f.slug, 'golden.svg'), 'utf8');
}

function renderPinned(f: RatchetFixture): string {
  return renderFixtureGit(readFileSync(join(GOLDENS_ROOT, f.type, f.slug, 'in.puml'), 'utf8'));
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

/** Whether `ours` still holds `f`'s structural pin: a `structural-match` verdict at or under the ceiling. */
function structuralHolds(ours: string, golden: string, f: RatchetFixture): { ok: boolean; why: string } {
  const v = diffVerdict(ours, golden);
  if (v.verdict === CONFORMANT) return { ok: false, why: 'now conformant: promote it to the conformant tier' };
  if (v.verdict !== STRUCTURAL_MATCH) return { ok: false, why: `verdict ${v.verdict}, first diff ${v.firstDiff}` };
  if ((v.maxDelta ?? 0) > f.maxDelta!) return { ok: false, why: `maxDelta ${v.maxDelta} rose above ${f.maxDelta}` };
  return { ok: true, why: '' };
}

describe('svg-git ratchet manifest', () => {
  it('pins rows from the unknown bucket only, each structural pin with a ceiling', () => {
    expect([...new Set(manifest.fixtures.map((f) => f.type))]).toEqual(['unknown']);
    expect(manifest.fixtures.length).toBe(conformant.length + structural.length);
    expect(structural.filter((f) => typeof f.maxDelta !== 'number').map((f) => f.slug)).toEqual([]);
  });
});

describe.skipIf(conformant.length === 0)('svg-git conformant tier', () => {
  for (const f of conformant) {
    it(`${f.type}/${f.slug}: stays zero-diff against the pinned golden`, () => {
      const { pass, diffs } = compareSvg(renderPinned(f), readGolden(f), 'deterministic');
      expect(pass, `${f.type}/${f.slug}: first diff ${firstDiffPath(diffs)} — ${JSON.stringify(diffs[0])}`).toBe(true);
    });
  }
});

describe('svg-git structural tier (gip D8)', () => {
  for (const f of structural) {
    it(`${f.type}/${f.slug}: stays structural-match with maxDelta <= ${String(f.maxDelta)}`, () => {
      const { ok, why } = structuralHolds(renderPinned(f), readGolden(f), f);
      expect(ok, `${f.type}/${f.slug}: ${why}`).toBe(true);
    });
  }
});

describe('svg-git ratchet — tamper detection', () => {
  const f = structural[0]!;

  it('a broken name <text> (in-memory only) fails the structural tier', () => {
    const golden = readGolden(f);
    const ours = renderPinned(f);
    expect(structuralHolds(ours, golden, f).ok).toBe(true);
    const tampered = golden.replace(/(font-family="monospace">)([^<]+)</, '$1$2x<');
    expect(tampered).not.toBe(golden);
    const result = structuralHolds(ours, tampered, f);
    expect(result.ok).toBe(false);
    expect(result.why).toContain('verdict diverged');
  });

  it('a moved box (in-memory only) fails the ceiling, and a zero-diff pin', () => {
    const golden = readGolden(f);
    const ours = renderPinned(f);
    const moved = golden.replace(
      /(<rect x=")([\d.]+)/,
      (_m, a: string, n: string) => `${a}${Number(n) + TAMPER_SHIFT}`,
    );
    expect(moved).not.toBe(golden);
    expect(structuralHolds(ours, moved, f).why).toContain('rose above');
    expect(compareSvg(golden, moved, 'deterministic').pass).toBe(false);
  });
});
