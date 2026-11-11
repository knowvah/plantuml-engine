/**
 * Offline SVG-conformance RATCHET for the timing engine (tep D12), a copy of the regex engine's golden ratchet:
 * committed goldens, `DeterministicMeasurer` so both sides measure text in the same system, and a fixture ratchets
 * in once and never regresses. Timing rows sit in two survey buckets (`timing`, and `unknown` for rows the survey
 * could not classify), so a pin records its `bucket`; slugs are unique across both. A pin is
 * `{ slug, bucket, addedAt, source }` at `svg-timing/<slug>/`. Timing has no svek stage, so there is no DOT parity.
 *
 * A row that reads the clock (`use date format`) renders with its recorded capture clock (D4).
 *
 * Pinning is by `plans/timing-engine-port/measurements/pin-timing.mts`;
 * `oracle/goldens/svg-timing/README.md`'s "Add rule" names it.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg } from './compare.js';
import { renderFixtureTiming, timingClockFor } from './render-fixture-timing.js';

interface RatchetFixture {
  slug: string;
  bucket: string;
  addedAt: string;
  source: string;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

/** Rows pinned at this task's start: every corpus row the jar draws and we match (the rest are error pairs). */
const PINNED_ROWS = 152;
const BUCKETS = ['timing', 'unknown'];

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-timing');

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(GOLDENS_ROOT, f.slug, 'golden.svg'), 'utf8');
}

function renderPinned(f: RatchetFixture): string {
  return renderFixtureTiming(
    readFileSync(join(GOLDENS_ROOT, f.slug, 'in.puml'), 'utf8'),
    undefined,
    timingClockFor(f.slug),
  );
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

describe('svg-timing conformance ratchet (AC1)', () => {
  it(`pins ${String(PINNED_ROWS)} rows the jar draws`, () => {
    expect(manifest.fixtures).toHaveLength(PINNED_ROWS);
    expect(new Set(manifest.fixtures.map((f) => f.slug)).size).toBe(PINNED_ROWS);
    expect(manifest.fixtures.filter((f) => !BUCKETS.includes(f.bucket)).map((f) => f.slug)).toEqual([]);
  });

  for (const f of manifest.fixtures) {
    it(`${f.bucket}/${f.slug}: stays zero-diff against the pinned golden`, () => {
      const { pass, diffs } = compareSvg(renderPinned(f), readGolden(f), 'deterministic');
      expect(
        pass,
        `timing/${f.slug}: conformance regression — first diff: ${firstDiffPath(diffs)} — ${JSON.stringify(diffs[0])}`,
      ).toBe(true);
      expect(diffs).toEqual([]);
    });
  }
});

describe('svg-timing conformance ratchet — tamper detection (AC2)', () => {
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
