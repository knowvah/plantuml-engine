/**
 * Offline SVG-conformance RATCHET for the EBNF engine (eep D9), a copy of
 * `nwdiag.golden.ratchet.test.ts` on board's flat layout: committed goldens,
 * `DeterministicMeasurer` so both sides measure text in the same system, and a
 * fixture ratchets in once and never regresses. EBNF has its own survey bucket,
 * so a pin is `{ slug, addedAt, source }` at `svg-ebnf/<slug>/`. EBNF has no
 * svek stage, so there is no DOT parity.
 *
 * Pinning is by `plans/ebnf-engine-port/measurements/pin-ebnf.mts`;
 * `oracle/goldens/svg-ebnf/README.md`'s "Add rule" names it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg } from './compare.js';
import { renderFixtureEbnf } from './render-fixture-ebnf.js';

interface RatchetFixture {
  slug: string;
  addedAt: string;
  source: string;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-ebnf');

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.slug, 'golden.svg'), 'utf8');
}

function renderPinned(f: RatchetFixture): string {
  return renderFixtureEbnf(readFileSync(join(GOLDENS_ROOT, f.slug, 'in.puml'), 'utf8'));
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

describe('svg-ebnf conformance ratchet (AC1)', () => {
  it('pins the 43 rows the jar draws', () => {
    expect(manifest.fixtures).toHaveLength(43);
    expect(new Set(manifest.fixtures.map((f) => f.slug)).size).toBe(43);
  });

  for (const f of manifest.fixtures) {
    it(`ebnf/${f.slug}: stays zero-diff against the pinned golden`, () => {
      const { pass, diffs } = compareSvg(renderPinned(f), readGolden(f), 'deterministic');
      expect(
        pass,
        `ebnf/${f.slug}: conformance regression — first diff: ${firstDiffPath(diffs)} — ${JSON.stringify(diffs[0])}`,
      ).toBe(true);
      expect(diffs).toEqual([]);
    });
  }
});

describe('svg-ebnf conformance ratchet — tamper detection (AC2)', () => {
  it('a mutated golden (in-memory only) produces a failure naming slug + diff path', () => {
    const f = manifest.fixtures[0]!;
    const golden = readGolden(f);
    const ours = renderPinned(f);

    expect(compareSvg(ours, golden, 'deterministic').pass, `${f.slug}: expected zero-diff baseline`).toBe(true);

    const tampered = golden.replace(
      /(\s(?:x|width))="([\d.]+)"/,
      (_m, a: string, n: string) => `${a}="${Number(n) + 500}"`,
    );
    expect(tampered).not.toBe(golden);

    const { pass, diffs } = compareSvg(ours, tampered, 'deterministic');
    expect(pass).toBe(false);
    expect(diffs.length).toBeGreaterThan(0);

    const message = `${f.slug}: conformance regression — first diff: ${firstDiffPath(diffs)}`;
    expect(message).toContain(f.slug);
    expect(message).toContain(diffs[0]!.path);
  });
});
