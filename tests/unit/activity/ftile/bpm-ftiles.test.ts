/**
 * The three activity Ftiles BPM draws, against the jar's planning probes
 * (`plans/bpm-engine-port/probes/`, rendered 2026-11-11 with
 * `scripts/oracle-render.sh`). Each fragment is the probe's element
 * translated to the origin: the grid puts the start circle at (25, 31) in
 * `bibuka-01`, the box at (75, 25), and the merge diamond at (75, 25) in
 * `cov-merge-only`.
 */
import { describe, expect, it } from 'vitest';
import { Colors } from '../../../../src/core/abel/Colors.js';
import { renderDrawableToFragment } from '../../../../src/core/klimt/document-shell-fragment.js';
import { Display } from '../../../../src/core/klimt/creole/Display.js';
import type { TextBlock } from '../../../../src/core/klimt/shape/TextBlock.js';
import { UTranslate } from '../../../../src/core/klimt/UTranslate.js';
import { UGraphicSvg } from '../../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../../../src/core/klimt/drawing/svg/svg-graphics.js';
import type { StringBounder } from '../../../../src/core/klimt/font/StringBounder.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { ActivityColorParam } from '../../../../src/core/skin/ColorParam.js';
import { SkinParamFresh } from '../../../../src/core/skin/SkinParamFresh.js';
import { getColor } from '../../../../src/core/skin/SkinParamUtils.js';
import { StyleSignatureBasic } from '../../../../src/core/style/StyleSignatureBasic.js';
import { asPaintColor, mergedStyleOf } from '../../../../src/core/svek/image/leaf-image-support.js';
import { OptionKey } from '../../../../src/core/tim/EaterOption.js';
import { BoxStyle } from '../../../../src/diagrams/activity/ftile/BoxStyle.js';
import { Hexagon } from '../../../../src/diagrams/activity/ftile/Hexagon.js';
import { FtileBox } from '../../../../src/diagrams/activity/ftile/vertical/FtileBox.js';
import { FtileCircleStart } from '../../../../src/diagrams/activity/ftile/vertical/FtileCircleStart.js';
import { FtileDiamond } from '../../../../src/diagrams/activity/ftile/vertical/FtileDiamond.js';
import { TextBlockUtils } from '../../../../src/core/klimt/shape/TextBlockUtils.js';

const measurer = new DeterministicMeasurer();

const sb: StringBounder = UGraphicSvg.build(
  0,
  basicSvgOption(),
  '$version$',
  { calculateDimension: (font: { family: string; size: number }, text: string) => measurer.measure(text, font) },
  measurer,
).getStringBounder();

function draw(block: TextBlock, dx = 0, dy = 0): string {
  const shifted: TextBlock = {
    drawU: (ug) => block.drawU(ug.apply(new UTranslate(dx, dy))),
    calculateDimension: (sb) => block.calculateDimension(sb),
  };
  return renderDrawableToFragment(shifted, { uid: 'bpm', width: 0, height: 0, measurer }).body;
}

function box(skin: SkinParamFresh, label: string): FtileBox {
  return FtileBox.create({
    skinParam: skin,
    label: Display.getWithNewlines(skin.getPragma(), label),
    swimlane: undefined,
    boxStyle: BoxStyle.PLAIN,
    stereotype: undefined,
    styleBuilder: undefined,
  });
}

function diamond(skin: SkinParamFresh): FtileDiamond {
  const borderColor = asPaintColor(getColor(skin, undefined, ActivityColorParam.activityBorder));
  const backColor = asPaintColor(getColor(skin, undefined, ActivityColorParam.activityBackground));
  return new FtileDiamond(skin, backColor, borderColor, undefined);
}

describe('FtileCircleStart (bibuka-01 start)', () => {
  const skin = new SkinParamFresh();
  const style = mergedStyleOf(
    StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'circle'),
    skin.getCurrentStyleBuilder(),
  );
  const circle = new FtileCircleStart(skin, undefined, style, Colors.empty());

  it('is a 20x20 tile entered at its top centre', () => {
    const geo = circle.calculateDimension(sb);
    expect([geo.getWidth(), geo.getHeight(), geo.getLeft(), geo.getInY(), geo.getOutY()]).toEqual([20, 20, 10, 0, 20]);
    expect(circle.getMyChildren()).toEqual([]);
  });

  it('draws the jar ellipse at (25,31): cx=35 cy=41 r=10 #F1F1F1/#181818 0.5', () => {
    expect(draw(circle, 25, 31)).toBe(
      '<ellipse cx="35" cy="41" rx="10" ry="10" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;"/>',
    );
  });
});

describe('FtileDiamond (cov-merge-only merge)', () => {
  const skin = new SkinParamFresh();
  const d = diamond(skin);

  it('is 24x24, entered at the top centre', () => {
    const geo = d.calculateDimension(sb);
    expect([geo.getWidth(), geo.getHeight(), geo.getLeft(), geo.getInY(), geo.getOutY()]).toEqual([24, 24, 12, 0, 24]);
  });

  it('draws the jar polygon at (75,25) in the legacy colours', () => {
    expect(draw(d, 75, 25)).toBe(
      '<polygon points="87,25,99,37,87,49,75,37,87,25" fill="#FEFECE" style="stroke:#A80036;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
    );
  });

  it('places labels and keeps the with* identity on undefined', () => {
    const north = TextBlockUtils.empty(5, 7);
    const labelled = d
      .withNorth(north)
      .withSouth(TextBlockUtils.empty(3, 4))
      .withWestAndEast(TextBlockUtils.empty(8, 2), TextBlockUtils.empty(9, 6));
    expect(labelled.calculateDimension(sb).getHeight()).toBe(Hexagon.hexagonHalfSize * 2 + 7);
    expect(labelled.getWestEastLabelHeight(sb)).toBe(6);
    expect(labelled.getEastLabelWidth(sb)).toBe(9);
    expect(labelled.getSouthLabelHeight(sb)).toBe(4);
    expect(d.withWest(undefined)).toBe(d);
    expect(d.withEast(undefined)).toBe(d);
    labelled.swapEastWest();
    expect(labelled.getEastLabelWidth(sb)).toBe(8);
    expect(draw(labelled)).toContain('points="12,7,24,19,12,31,0,19,12,7"');
  });
});

describe('FtileBox (bibuka-01 login, cov-docked-newline, cov-option-debug)', () => {
  it('draws login at (75,25): rect 45.425x32 rx 12.5, text at +10,+19.333', () => {
    const b = box(new SkinParamFresh(), 'login');
    const geo = b.calculateDimension(sb);
    // `20 + Math.fround(25.425)`: the jar prints it to three decimals.
    expect(geo.getWidth()).toBe(20 + Math.fround(25.425));
    expect(geo.getHeight()).toBe(32);
    // `label.toString()` is the list's `[login]` (Display.java:498-503).
    expect(b.toString()).toBe('[login]');
    expect(draw(b, 75, 25)).toBe(
      '<rect x="75" y="25" width="45.425" height="32" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
        '<text x="85" y="44.333" fill="#000" font-size="12" textLength="25.425">login</text>',
    );
  });

  it('draws a two-line label 62.075x44', () => {
    const svg = draw(box(new SkinParamFresh(), 'line one\\nline two'), 75, 25);
    expect(svg).toContain('<rect x="75" y="25" width="62.075" height="44"');
    expect(svg).toContain('<text x="85" y="56.333" fill="#000" font-size="12" textLength="40.725">line two</text>');
  });

  it('draws the 2 px blue debug rectangle first under !option debug true', () => {
    const skin = new SkinParamFresh(undefined, new Map([[OptionKey.DEBUG, 'true']]));
    const svg = draw(box(skin, 'a'), 75, 25);
    expect(
      svg.startsWith(
        '<rect x="75" y="25" width="26.675" height="32" fill="none" style="stroke:#00F;stroke-width:2;"/>',
      ),
    ).toBe(true);
    expect(svg).toContain('<rect x="75" y="25" width="26.675" height="32" fill="#F1F1F1"');
  });

  it('throws where Java dereferences a null BoxStyle', () => {
    const skin = new SkinParamFresh();
    expect(() =>
      FtileBox.create({
        skinParam: skin,
        label: Display.create('x'),
        swimlane: undefined,
        boxStyle: undefined,
        stereotype: undefined,
        styleBuilder: undefined,
      }),
    ).toThrow('NullPointerException');
  });
});
