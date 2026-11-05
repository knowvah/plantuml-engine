/**
 * `Fashion` and `Style#getSymbolContext`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/Fashion.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/Style.java:270-286
 */
import { describe, expect, it } from 'vitest';
import { Colors } from '../../../../src/core/abel/Colors.js';
import { ColorType } from '../../../../src/core/abel/ColorType.js';
import { HColorSet } from '../../../../src/core/klimt/color/HColorSet.js';
import { Fashion } from '../../../../src/core/klimt/Fashion.js';
import { UStroke } from '../../../../src/core/klimt/UStroke.js';
import { URectangle } from '../../../../src/core/klimt/shape/URectangle.js';
import { svgGraphic } from '../../mindmap/helpers/mindmap-skin.js';
import { emptyPacketDiagram } from '../../packetdiag/helpers/packet-diagram.js';

const set = HColorSet.instance();

describe('Fashion', () => {
  it('defaults to a simple stroke, no shadow and square corners', () => {
    const fashion = new Fashion(undefined, undefined);
    expect(fashion.getStroke().getThickness()).toBe(1);
    expect([fashion.getDeltaShadow(), fashion.getRoundCorner(), fashion.getDiagonalCorner()]).toEqual([0, 0, 0]);
    expect(fashion.isShadowing()).toBe(false);
  });

  it('copies on every with*', () => {
    const red = set.getColor('red');
    const blue = set.getColor('blue');
    const fashion = new Fashion(undefined, undefined)
      .withBackColor(red)
      .withForeColor(blue)
      .withShadow(2)
      .withStroke(UStroke.withThickness(3))
      .withCorner(4, 5);
    expect([fashion.getBackColor(), fashion.getForeColor()]).toEqual([red, blue]);
    expect(fashion.isShadowing()).toBe(true);
    expect([fashion.getStroke().getThickness(), fashion.getRoundCorner(), fashion.getDiagonalCorner()]).toEqual([
      3, 4, 5,
    ]);
    expect(fashion.withDeltaShadow(0).isShadowing()).toBe(false);
  });

  it('paints none for a missing colour', () => {
    const ug = new Fashion(undefined, undefined).apply(svgGraphic());
    ug.draw(URectangle.build(10, 10));
    expect((ug as ReturnType<typeof svgGraphic>).getSvgString()).toMatch(/<rect [^>]*fill="none"/);
  });

  it('throws on a colour the driver cannot paint', () => {
    expect(() => new Fashion({} as never, undefined).applyColors(svgGraphic())).toThrow('ClassCastException');
  });
});

describe('Style#getSymbolContext', () => {
  it("reads the packet rectangle's back, line, stroke and corners", () => {
    const style = emptyPacketDiagram().getStyle();
    const fashion = style.getSymbolContext(set);
    expect(fashion.getStroke().getThickness()).toBe(0.5);
    expect(fashion.getRoundCorner()).toBe(0);
  });

  it('lets a Colors entry win over the style', () => {
    const red = set.getColor('red');
    const colors = Colors.empty().add(ColorType.BACK, red).add(ColorType.LINE, red);
    const fashion = emptyPacketDiagram().getStyle().getSymbolContext(set, colors);
    expect([fashion.getBackColor(), fashion.getForeColor()]).toEqual([red, red]);
  });
});
