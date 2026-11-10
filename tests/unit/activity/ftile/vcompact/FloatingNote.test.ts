import { describe, expect, it } from 'vitest';
import { Direction } from '../../../../../src/core/abel/Direction.js';
import { Display } from '../../../../../src/core/klimt/creole/Display.js';
import { UGraphicSvg } from '../../../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../../../../src/core/klimt/drawing/svg/svg-graphics.js';
import type { StringBounder as DriverStringBounder } from '../../../../../src/core/klimt/drawing/svg/driver-text-svg.js';
import { XPoint2D } from '../../../../../src/core/klimt/geom/XPoint2D.js';
import { UTranslate } from '../../../../../src/core/klimt/UTranslate.js';
import { MeasurerStringBounder } from '../../../../../src/core/measurer-bounder.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';
import { Pragma } from '../../../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../../../src/core/style/mindmap-style-builder.js';
import { FloatingNote } from '../../../../../src/diagrams/activity/ftile/vcompact/FloatingNote.js';
import { SkinParam } from '../../../../../src/diagrams/ebnf/ebnf-skin-param.js';

const measurer = new DeterministicMeasurer();
const BOUNDER = new MeasurerStringBounder(measurer);
const driverBounder: DriverStringBounder = {
  calculateDimension: (font, text) => ({ width: measurer.measure(text, font).width }),
};

function skinParam(): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map<string, string>(),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

// Oracle: plans/ebnf-engine-port/probes/cov-comment-standalone.puml rendered by scripts/oracle-render.sh, the
// first note (drawn at x=10, y=15):
//   <path d="M10,15 L10,38 L157.425,38 L157.425,25 L147.425,15 L10,15" style="stroke:#181818;stroke-width:0.5;"
//   fill="#FEFFDD"/> ... <text x="16" y="30.111" ... textLength="126.425">a single-line comment</text>
// and the second, two lines: <path d="M10,58 L10,94 L96.813,94 ..."> (height 36 = 23 + one 13 px line).
const ORACLE_PATH = 'M10,15 L10,38 L157.425,38 L157.425,25 L147.425,15 L10,15';
const ORACLE_CORNER = 'M147.425,15 L147.425,25 L157.425,25 L147.425,15';

describe('FloatingNote (FloatingNote.java:63-128)', () => {
  it('a single-line note measures the oracle note box', () => {
    const note = FloatingNote.create(Display.create(['a single-line comment']), skinParam(), 'ebnf');
    const dim = note.calculateDimension(BOUNDER);
    expect(dim.getWidth()).toBeCloseTo(147.425, 3);
    expect(dim.getHeight()).toBe(23);
    expect(note.getStartingX(BOUNDER, 0)).toBe(-6);
    expect(note.getEndingX(BOUNDER, 0)).toBeCloseTo(147.425 - 6, 3);
  });

  it('draws the oracle path, corner and text', () => {
    const note = FloatingNote.create(Display.create(['a single-line comment']), skinParam(), 'ebnf');
    const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', driverBounder, measurer);
    note.drawU(ug.apply(new UTranslate(10, 15)));
    const svg = ug.getSvgString();
    expect(svg).toContain(`<path d="${ORACLE_PATH}" style="stroke:#181818;stroke-width:0.5;" fill="#FEFFDD"/>`);
    expect(svg).toContain(`<path d="${ORACLE_CORNER}" style="stroke:#181818;stroke-width:0.5;" fill="#FEFFDD"/>`);
    expect(svg).toContain('x="16" y="30.111"');
    expect(svg).toContain('textLength="126.425">a single-line comment</text>');
  });

  it('a two-line note is one 13 px line taller (second oracle note)', () => {
    const note = FloatingNote.create(Display.create(['first line', 'second line']), skinParam(), 'ebnf');
    const dim = note.calculateDimension(BOUNDER);
    // 96.813 - 10 in the SVG, which prints three decimals.
    expect(Math.round(dim.getWidth() * 1000) / 1000).toBe(86.813);
    expect(dim.getHeight()).toBe(36);
  });

  it('createOpale links the note to a point (withLink)', () => {
    const plain = FloatingNote.create(Display.create(['x']), skinParam(), 'ebnf');
    const linked = FloatingNote.createOpale(Display.create(['x']), skinParam(), 'ebnf');
    linked.setOpale(Direction.LEFT, new XPoint2D(-20, 5), new XPoint2D(0, 5));
    expect(linked.calculateDimension(BOUNDER).getWidth()).toBe(plain.calculateDimension(BOUNDER).getWidth());
    const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', driverBounder, measurer);
    linked.drawU(ug);
    // The left notch (Opale#getPolygonLeft) opens at the link's y on the left edge.
    expect(ug.getSvgString()).toContain('M0,0 L0,1 L0,5 L0,9 L0,23');
  });
});
