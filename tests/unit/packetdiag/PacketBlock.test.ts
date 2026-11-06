/**
 * `PacketBlock`'s label abbreviation and `PacketIndicator`'s short numbered
 * tick, drawn through `UGraphicSvg` over the deterministic measurer.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketBlock.java:233-253
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketIndicator.java:126-140
 */
import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { PacketBlock } from '../../../src/diagrams/packetdiag/PacketBlock.js';
import { PacketIndicator } from '../../../src/diagrams/packetdiag/PacketIndicator.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { emptyPacketDiagram, packetSkinParam } from './helpers/packet-diagram.js';

const FONT = { family: 'sans-serif', size: 14 };
const BIT_WIDTH = 42;
const BIT_HEIGHT = 32;

function drawnText(block: PacketBlock): string {
  const ug = svgGraphic();
  block.getShapeTextBlock(stringBounder(), BIT_WIDTH, BIT_HEIGHT).drawU(ug);
  return /<text[^>]*>([^<]*)<\/text>/.exec(ug.getSvgString())![1]!;
}

const width = (text: string): number => stringBounder().calculateDimension(FONT, text).getWidth();

describe('PacketBlock#getLabelTextBlockAbbr', () => {
  it('keeps a label narrower than the block', () => {
    expect(drawnText(new PacketBlock(16, 1, 'Source Port', packetSkinParam()))).toBe('Source Port');
  });

  it('cuts a wide label to the longest prefix whose "..." form, plus one more pad, fits', () => {
    const label = 'Acknowledgment Number';
    const abbr = drawnText(new PacketBlock(2, 1, label, packetSkinParam()));
    expect(abbr.endsWith('...')).toBe(true);
    const kept = abbr.slice(0, -3);
    expect(label.startsWith(kept)).toBe(true);
    const reqWidth = 2 * BIT_WIDTH;
    expect(width(abbr) + width('...')).toBeLessThan(reqWidth);
    expect(width(label.slice(0, kept.length + 1) + '...') + width('...')).toBeGreaterThanOrEqual(reqWidth);
  });

  it('ends at the one-char form when nothing fits', () => {
    expect(drawnText(new PacketBlock(0.1, 1, 'Wide', packetSkinParam()))).toBe('W...');
  });

  it('draws nothing for a zero-width block', () => {
    const ug = svgGraphic();
    new PacketBlock(0, 1, 'A', packetSkinParam()).getShapeTextBlock(stringBounder(), BIT_WIDTH, BIT_HEIGHT).drawU(ug);
    expect(ug.getSvgString()).not.toContain('<rect');
  });

  it('pads a tall block evenly above and below the label', () => {
    const block = new PacketBlock(16, 2, 'A', packetSkinParam());
    expect(
      block.getShapeTextBlock(stringBounder(), BIT_WIDTH, BIT_HEIGHT).calculateDimension(stringBounder()).getHeight(),
    ).toBe(64);
    expect(block.getDrawWidth(BIT_WIDTH)).toBe(672);
    expect(block.getDrawHeight(BIT_HEIGHT)).toBe(64);
  });

  it('keeps the dashed opener stroke upstream never draws', () => {
    expect(PacketBlock.openerStroke.getThickness()).toBe(1);
  });
});

describe('PacketIndicator', () => {
  it('draws a short numbered tick with the number dropped by V_LINE_SHORT', () => {
    const diagram = emptyPacketDiagram();
    const indicator = new PacketIndicator(false, true, 2, diagram.getStyle(), diagram.getSkinParam());
    const ug = svgGraphic();
    indicator.drawU(ug.apply(new UTranslate(10, 10)));
    const svg = ug.getSvgString();
    expect(svg).toContain('y="36.889"');
    expect(svg).toContain('<path d="M10,40 L10,56"');
    expect(indicator.calculateDimension(stringBounder()).getHeight()).toBe(30);
  });

  it('measures but does not draw an unnumbered number', () => {
    const diagram = emptyPacketDiagram();
    const indicator = new PacketIndicator(true, false, 3, diagram.getStyle(), diagram.getSkinParam());
    const ug = svgGraphic();
    indicator.drawU(ug);
    expect(ug.getSvgString()).not.toContain('<text');
    expect(ug.getSvgString()).toContain('<path d="M0,14 L0,46"');
  });
});

describe('PacketBlock label creole mode', () => {
  it('draws a cut "**Acknow..." literally under SIMPLE_LINE, as the jar does (cov-label-cut-creole)', () => {
    const ug = svgGraphic();
    new PacketBlock(2, 1, '**Acknowledgment**', packetSkinParam())
      .getShapeTextBlock(stringBounder(), BIT_WIDTH, BIT_HEIGHT)
      .drawU(ug);
    const svg = ug.getSvgString();
    expect(svg.match(/<rect/g)).toHaveLength(1);
    expect(svg).toContain('>**Acknow...</text>');
  });
});
