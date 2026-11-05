/**
 * `AbstractUGraphic#draw` adds each shape's points to a `MinMaxMutable`, whose
 * `addPoint` throws on NaN: that is what makes a NaN coordinate a jar crash.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/AbstractUGraphic.java:125-232
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/geom/MinMaxMutable.java:80-85
 */
import { describe, expect, it } from 'vitest';
import { UEllipse } from '../../../../src/core/klimt/shape/UEllipse.js';
import { UEmpty } from '../../../../src/core/klimt/shape/UEmpty.js';
import { ULine } from '../../../../src/core/klimt/shape/ULine.js';
import { UPolygon } from '../../../../src/core/klimt/shape/UPolygon.js';
import { URectangle } from '../../../../src/core/klimt/shape/URectangle.js';
import { UTranslate } from '../../../../src/core/klimt/UTranslate.js';
import { svgGraphic } from '../../mindmap/helpers/mindmap-skin.js';

const THROWS = 'IllegalArgumentException';

describe('UGraphicSvg#draw, NaN points', () => {
  it('throws on a NaN translate', () => {
    expect(() => svgGraphic().apply(UTranslate.dx(Number.NaN)).draw(ULine.hline(1))).toThrow(THROWS);
    expect(() => svgGraphic().apply(UTranslate.dy(Number.NaN)).draw(ULine.hline(1))).toThrow(THROWS);
  });

  it('throws on a NaN line end and rectangle or ellipse size; a polygon throws when built', () => {
    expect(() => svgGraphic().draw(new ULine(Number.NaN, 1))).toThrow(THROWS);
    expect(() => svgGraphic().draw(URectangle.build(Number.NaN, 1))).toThrow(THROWS);
    expect(() => svgGraphic().draw(UEllipse.build(1, Number.NaN))).toThrow(THROWS);
    expect(() => new UPolygon().addPoint(0, Number.NaN)).toThrow('NaN');
  });

  it('an empty polygon and a UEmpty add nothing, even at a NaN translate', () => {
    const ug = svgGraphic();
    const at = ug.apply(UTranslate.dx(Number.NaN));
    at.draw(new UPolygon());
    at.draw(new UEmpty(1, 1));
    expect(ug.getSvgString()).not.toContain('NaN');
  });

  it('draws finite shapes', () => {
    const ug = svgGraphic();
    ug.draw(ULine.hline(5));
    expect(ug.getSvgString()).toContain('<line x1="0" y1="0" x2="5" y2="0"');
  });
});
