/**
 * `PSystemKeycheck` (version/PSystemKeycheck.java): `keycheck <sig> <key>` and
 * the one-argument `keycheck <key>` (upstream 3a4d1675141). No key decoding
 * exists here (vkt D3), so both forms check nothing and the licence is NONE.
 *
 * Jar probe (`scripts/oracle-render.sh`, 2026-11-21), both forms: the header,
 * `<u>Provided license information</u>:`, `No valid license found. A named
 * license is bound to the machine it was issued for.` and ` `. This port says
 * what is true instead of line 5 (vkt D5, #182 ruling 1).
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { GraphicStrings } from '../../../src/core/klimt/shape/GraphicStrings.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { stringBounderFor } from '../../../src/core/UgDiagram.js';
import { COMPILE_TIME_STRING, versionString } from '../../../src/core/version.js';
import { License } from '../../../src/diagrams/version/License.js';
import { getTextBlock, PSystemKeycheck } from '../../../src/diagrams/version/PSystemKeycheck.js';

const measurer = new DeterministicMeasurer();
const SOURCE: UmlSource = { lines: ['keycheck abc123 def456'], type: 'sequence' };

/** vkt D5, `keycheck`: the header (java:127-136), the provided-licence title, line 5 and the closing blank. */
const KEYCHECK_LINES = [
  `<b>plantuml-engine version ${versionString()}</b> (${COMPILE_TIME_STRING})`,
  `(${License.getCurrent().toString()} source distribution)`,
  ' ',
  '<u>Provided license information</u>:',
  'No license key was checked: plantuml-engine reads none.',
  ' ',
];

/** The same lines as `<text>` runs: each creole span is its own run, ` ` is a blank line. */
const KEYCHECK_RUNS = [
  `plantuml-engine version ${versionString()}`,
  `(${COMPILE_TIME_STRING})`,
  `(${License.getCurrent().toString()} source distribution)`,
  ' ',
  'Provided license information',
  ':',
  'No license key was checked: plantuml-engine reads none.',
  ' ',
];

function keycheck(sig: string | undefined, key: string): PSystemKeycheck {
  return new PSystemKeycheck(SOURCE, sig, key, new PreprocessingArtifact());
}

function runsOf(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1] ?? '');
}

describe('PSystemKeycheck — getTextBlock (java:99-116)', () => {
  const svg = keycheck('abc123', 'def456').exportDiagram(0, measurer);

  it("draws vkt D5's six lines in order", () => {
    expect(runsOf(svg)).toEqual(KEYCHECK_RUNS);
  });

  it('draws no image: drawFlash (java:138-) is never called', () => {
    expect(svg).not.toContain('<image');
  });

  it('is sized as one black-on-white block of the six lines (java:115)', () => {
    const stringBounder = stringBounderFor(measurer);
    const expected = GraphicStrings.createBlackOnWhite(KEYCHECK_LINES).calculateDimension(stringBounder);
    const actual = keycheck('abc123', 'def456').calculateDimension(stringBounder);
    expect([actual.getWidth(), actual.getHeight()]).toEqual([expected.getWidth(), expected.getHeight()]);
  });

  it('draws the same page for the one-argument form (sig null, java:76-78) and any key', () => {
    for (const [sig, key] of [
      [undefined, 'abc123'],
      [undefined, 'ABC123'],
      ['x', 'y'],
    ] as const)
      expect(keycheck(sig, key).exportDiagram(0, measurer), `${sig} ${key}`).toBe(svg);
  });

  it('getTextBlock is the page block', () => {
    const stringBounder = stringBounderFor(measurer);
    expect(getTextBlock(undefined, 'abc').calculateDimension(stringBounder).getHeight()).toBe(
      keycheck(undefined, 'abc').calculateDimension(stringBounder).getHeight(),
    );
  });
});

describe('PSystemKeycheck — members', () => {
  it('describes itself as (Key) (java:90-92)', () => {
    expect(keycheck(undefined, 'abc').getDescription()).toBe('(Key)');
  });

  it('is its own text block (UgSimpleDiagram)', () => {
    const page = keycheck(undefined, 'abc');
    expect(page.getTextBlock(0, stringBounderFor(measurer))).toBe(page);
  });

  it('renders the same document three times', () => {
    const page = keycheck('abc123', 'def456');
    expect(new Set([0, 1, 2].map(() => page.exportDiagram(0, measurer))).size).toBe(1);
  });
});
