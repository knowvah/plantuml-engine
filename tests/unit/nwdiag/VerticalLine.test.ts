/**
 * `nwdiag/VerticalLine`: the packet indicator's tick (`<path>`, no fill) and
 * the skip arc nwdiag uses.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/VerticalLine.java
 */
import { describe, expect, it } from 'vitest';
import type { StringBounder as DriverStringBounder } from '../../../src/core/klimt/drawing/svg/driver-text-svg.js';
import { basicSvgOption } from '../../../src/core/klimt/drawing/svg/svg-graphics.js';
import { UGraphicSvg } from '../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import { VerticalLine } from '../../../src/diagrams/nwdiag/VerticalLine.js';

const stubStringBounder: DriverStringBounder = {
  calculateDimension(font, text) {
    return { width: text.length * font.size * 0.5 };
  },
};

function paths(line: VerticalLine): string[] {
  const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', stubStringBounder);
  line.drawU(ug);
  return [...ug.getSvgString().matchAll(/<path [^>]*\/>/g)].map((m) => m[0]);
}

describe('VerticalLine', () => {
  it('draws one unfilled path from y1 to y2 with no skip (packet-tcp-header tick)', () => {
    const drawn = paths(new VerticalLine(24, 56, new Set()));
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toContain('d="M0,24 L0,56"');
    expect(drawn[0]).toContain('fill="none"');
  });

  it('orders y1 and y2', () => {
    expect(paths(new VerticalLine(56, 24, new Set()))[0]).toContain('d="M0,24 L0,56"');
  });

  // A skip inside the line arcs and `continue`s past `ug.draw` (java:74-77), and
  // `drawn` is already true, so the last skip's path is never drawn: upstream draws nothing.
  it('draws nothing when the only skip lies inside the line', () => {
    expect(paths(new VerticalLine(24, 56, new Set([40])))).toEqual([]);
  });

  it('draws the arc path once a later skip closes it', () => {
    const drawn = paths(new VerticalLine(24, 56, new Set([40, 56])));
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toMatch(/d="M0,24 L0,37 A4,4 0 0 1 0,49 L0,56 ?"/);
  });

  it('ends the path at a skip equal to y2 and draws nothing after', () => {
    const drawn = paths(new VerticalLine(24, 56, new Set([56])));
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toContain('d="M0,24 L0,56"');
  });

  it('ends at y2 for a skip past it, then stops', () => {
    const drawn = paths(new VerticalLine(24, 56, new Set([70])));
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toContain('d="M0,24 L0,56"');
  });

  it('ignores a skip above y1', () => {
    const drawn = paths(new VerticalLine(24, 56, new Set([10])));
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toContain('d="M0,24 L0,56"');
  });
});
