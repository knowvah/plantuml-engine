/**
 * Offline SVG-conformance RATCHET for the legacy activity engine (laep D7):
 * committed goldens, `DeterministicMeasurer` so both sides measure text in the
 * same system, and a fixture ratchets in once and never regresses. The rows
 * come from three survey buckets, so a pin carries `type` (`activity`,
 * `unknown`, `network`) and lives at `<type>/<slug>/`, as svg-description's do.
 * DOT parity is the separate `tests/oracle/activity-legacy-dot-parity.test.ts`.
 *
 * Pinning is by `plans/legacy-activity-engine-port/measurements/pin-legacy.mts`;
 * `oracle/goldens/svg-activity-legacy/README.md`'s "Add rule" names it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg } from './compare.js';
import { renderFixtureActivityLegacy } from './render-fixture-activity-legacy.js';

interface RatchetFixture {
  slug: string;
  type: string;
  addedAt: string;
  source: string;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-activity-legacy');

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.type, f.slug, 'golden.svg'), 'utf8');
}

function renderPinned(f: RatchetFixture): string {
  return renderFixtureActivityLegacy(readFileSync(join(GOLDENS_ROOT, f.type, f.slug, 'in.puml'), 'utf8'));
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

describe('svg-activity-legacy conformance ratchet (AC1)', () => {
  it('pins rows from each of the three buckets', () => {
    expect([...new Set(manifest.fixtures.map((f) => f.type))].sort()).toEqual(['activity', 'network', 'unknown']);
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

describe('svg-activity-legacy conformance ratchet — tamper detection (AC2)', () => {
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
