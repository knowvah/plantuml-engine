/**
 * ddd-T4f: `tests/fixtures/ddd-T4f/style-width-monochrome.puml`, jar values from `scripts/oracle-render.sh`.
 * The merged style's `MinimumWidth` and `MaximumWidth` (`SheetBlock1.java:80`, `EntityImageDescription.java:188-191`),
 * `skinparam monochrome` on a `#colour` (`TitledDiagram.java:295-299`), and `: ""` as a one-space label
 * (`Labels.java:102`, `StripeSimple.java:124-125`).
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { ColorMapper, muteColorMapper } from '../../../src/core/klimt/color/ColorMapper.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const FIXTURE = 'tests/fixtures/ddd-T4f/style-width-monochrome.puml';
const svg = renderSync(readFileSync(FIXTURE, 'utf8'), { measurer: new DeterministicMeasurer() });

describe('style width, monochrome and an empty label', () => {
  it('floors the box at MinimumWidth and wraps at MaximumWidth', () => {
    expect(svg).toContain('<rect x="7" y="7" width="140" height="62" fill="#C7C7C7"');
    expect(svg).toContain('<rect x="7" y="144" width="140" height="34"');
    expect(svg).toContain('textLength="38.237">Social</text>');
    expect(svg).toContain('textLength="78.575">Competency</text>');
  });

  it('measures and draws a quoted empty or blank label as one space', () => {
    expect(svg).toContain('<text x="78" y="110.111" fill="#000" font-size="13">\u00A0</text>');
    expect(svg).toContain('<text x="78" y="219.111" fill="#000" font-size="13">\u00A0</text>');
  });
});

describe('muteColorMapper (TitledDiagram.java:295-313)', () => {
  it('chooses monochrome ahead of reversecolor', () => {
    expect(muteColorMapper({ monochrome: 'true', reverseColor: 'dark' })).toBe(ColorMapper.MONOCHROME);
    expect(muteColorMapper({ monochrome: 'reverse' })).toBe(ColorMapper.MONOCHROME_REVERSE);
  });

  it('chooses the reversecolor arms and falls back to the identity', () => {
    expect(muteColorMapper({ reverseColor: 'DARK' })).toBe(ColorMapper.LIGTHNESS_INVERSE);
    expect(muteColorMapper({ reverseColor: 'nonsense' })).toBe(ColorMapper.IDENTITY);
    expect(muteColorMapper({})).toBe(ColorMapper.IDENTITY);
    expect(muteColorMapper({ reverseColor: 'bgr' })).not.toBe(ColorMapper.IDENTITY);
  });
});
