/**
 * `GraphicsPath` (eggs/GraphicsPath.java:66-88), written as SVG (ipe D2): a
 * fixed 50×50 white page, the motif drawn in black at (20, 20), once.
 */
import { describe, expect, it } from 'vitest';

import { ColorMapper } from '../../../src/core/klimt/color/ColorMapper.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { GraphicsPath } from '../../../src/diagrams/eggs/GraphicsPath.js';

const measurer = new DeterministicMeasurer();

describe('GraphicsPath#writeImage', () => {
  it('draws the motif from (20, 20) on a fixed 50×50 page', () => {
    const svg = new GraphicsPath(ColorMapper.IDENTITY, 'B').writeImage(measurer);
    expect(svg).toContain('width="50px" height="50px" viewBox="0 0 50 50"');
    expect(svg).toContain('style="width:50px;height:50px;background:#FFFFFF;"');
    // `B` is code 1: (1 % 7 - 3, 1 / 7 - 3) = (-2, -3).
    expect(svg).toContain('<path d="M20,20 C20,20 18,17 18,17" style="stroke:#000;stroke-width:1;" fill="none"/>');
  });

  it('builds the motif at export, so an invalid character throws there', () => {
    const graphics = new GraphicsPath(ColorMapper.IDENTITY, '1');
    expect(() => graphics.writeImage(measurer)).toThrow('IllegalArgumentException');
  });
});
