/**
 * `PSystemKeygen` (version/PSystemKeygen.java): the `keygen` and `keyimport
 * [key]` page. Every key reaches `getFlashTextBlock` here (vkt D3: no
 * `PLSSignature`), and the MIT edition draws no QR code (`FlashCodeUtilsNone`).
 *
 * Jar probe (`scripts/oracle-render.sh`, 2026-11-21): the header, ` `,
 * `To get your <i>Professional Edition License</i>,`, `please send this qrcode
 * to <b>plantuml@gmail.com</b> :` and a QR image. This port prints vkt D5's
 * lines 4-5 instead (#182 ruling 1, "inspired by, not conformant").
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { stringBounderFor } from '../../../src/core/UgDiagram.js';
import { GraphicStrings } from '../../../src/core/klimt/shape/GraphicStrings.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { COMPILE_TIME_STRING, versionString } from '../../../src/core/version.js';
import { License } from '../../../src/diagrams/version/License.js';
import { getTextBlock, PSystemKeygen } from '../../../src/diagrams/version/PSystemKeygen.js';

const measurer = new DeterministicMeasurer();
const SOURCE: UmlSource = { lines: ['keygen'], type: 'sequence' };

/** vkt D5, `keygen`: the header (java:178-187) and the two lines that replace the QR request. */
const KEYGEN_LINES = [
  `<b>plantuml-engine version ${versionString()}</b> (${COMPILE_TIME_STRING})`,
  `(${License.getCurrent().toString()} source distribution)`,
  ' ',
  'plantuml-engine has no <i>Professional Edition License</i>:',
  `it is <b>${License.getCurrent().toString()}</b> software and needs no license key.`,
];

/** The same lines as `<text>` runs: each creole span is its own run, ` ` is the blank line. */
const KEYGEN_RUNS = [
  `plantuml-engine version ${versionString()}`,
  `(${COMPILE_TIME_STRING})`,
  `(${License.getCurrent().toString()} source distribution)`,
  ' ',
  'plantuml-engine has no',
  'Professional Edition License',
  ':',
  'it is',
  License.getCurrent().toString(),
  'software and needs no license key.',
];

function keygen(key: string): PSystemKeygen {
  return new PSystemKeygen(SOURCE, key, new PreprocessingArtifact());
}

function runsOf(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1] ?? '');
}

describe('PSystemKeygen — getFlashTextBlock (java:113-172)', () => {
  const svg = keygen('').exportDiagram(0, measurer);

  it("draws vkt D5's five lines in order", () => {
    expect(runsOf(svg)).toEqual(KEYGEN_RUNS);
  });

  it('draws no QR code: the MIT edition has no encoder (FlashCodeUtilsNone, java:119-129)', () => {
    expect(svg).not.toContain('<image');
  });

  it('is sized as the header block alone: no flash and no footer (java:155-170)', () => {
    const stringBounder = stringBounderFor(measurer);
    const expected = GraphicStrings.createBlackOnWhite(KEYGEN_LINES).calculateDimension(stringBounder);
    const actual = keygen('').calculateDimension(stringBounder);
    expect([actual.getWidth(), actual.getHeight()]).toEqual([expected.getWidth(), expected.getHeight()]);
  });

  it('draws the same page for any key: retrieveNamed(key) is NONE here (java:84, vkt D3)', () => {
    for (const key of ['abc123', 'ABC123', 'xyz']) expect(keygen(key).exportDiagram(0, measurer), key).toBe(svg);
  });

  it('getTextBlock is the page block', () => {
    const stringBounder = stringBounderFor(measurer);
    const dim = getTextBlock('').calculateDimension(stringBounder);
    expect(dim.getWidth()).toBe(keygen('').calculateDimension(stringBounder).getWidth());
  });
});

describe('PSystemKeygen — members', () => {
  it('describes itself as (Key) (java:174-176)', () => {
    expect(keygen('').getDescription()).toBe('(Key)');
  });

  it('is its own text block (UgSimpleDiagram)', () => {
    const page = keygen('');
    expect(page.getTextBlock(0, stringBounderFor(measurer))).toBe(page);
  });

  it('renders the same document three times', () => {
    const page = keygen('');
    expect(new Set([0, 1, 2].map(() => page.exportDiagram(0, measurer))).size).toBe(1);
  });
});
