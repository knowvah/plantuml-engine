/**
 * Offline SVG-conformance RATCHET for the Chen EER engine (ceep T4), a copy of
 * `regex.golden.ratchet.test.ts` on flow's empty-manifest shape: committed
 * goldens, `DeterministicMeasurer` so both sides measure text in the same
 * system, and a fixture ratchets in once and never regresses.
 *
 * The corpus has no `@startchen` row (ceep D6), so `ratchet.json` is empty:
 * the equality tier is the authored root (`cheneer.diff-baseline.ratchet.test.ts`,
 * every row zero-diff or an error pair), and the tamper check runs on one of
 * upstream's own vega fixtures. Chen reaches graphviz, so its DOT is gated too
 * (`tests/oracle/cheneer-dot-parity.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSvg } from './compare.js';
import { readAuthoredCheneerFixture, renderFixtureCheneer } from './render-fixture-cheneer.js';

interface RatchetManifest {
  fixtures: readonly { readonly slug: string }[];
}

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-cheneer');
/** Upstream's `ChenMovieExtended_Test.puml` (ceep D6), zero-diff against the jar (ceep journal row 13). */
const TAMPER_FIXTURE = 'vega-chen-movieextended';

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

describe('svg-cheneer conformance ratchet (AC1)', () => {
  it('pins no corpus row: the corpus has no @startchen source (ceep D6)', () => {
    expect(manifest.fixtures).toEqual([]);
  });
});

describe('svg-cheneer conformance ratchet — tamper detection (AC2)', () => {
  it('a mutated golden (in-memory only) produces a failure naming slug + diff path', () => {
    const { markup, golden } = readAuthoredCheneerFixture(TAMPER_FIXTURE);
    const ours = renderFixtureCheneer(markup);

    expect(compareSvg(ours, golden!, 'deterministic').pass, `${TAMPER_FIXTURE}: expected zero-diff baseline`).toBe(
      true,
    );

    const tampered = golden!.replace('>DIRECTOR</text>', '>DIRECTRO</text>');
    expect(tampered).not.toBe(golden);

    const { pass, diffs } = compareSvg(ours, tampered, 'deterministic');
    expect(pass).toBe(false);
    expect(diffs.length).toBeGreaterThan(0);

    const message = `${TAMPER_FIXTURE}: conformance regression — first diff: ${firstDiffPath(diffs)}`;
    expect(message).toContain(TAMPER_FIXTURE);
    expect(message).toContain(diffs[0]!.path);
  });
});
