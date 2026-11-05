/**
 * `PacketDiagram`: `build()`'s grid, scale and bit width, and `getTextBlock`
 * drawn through `UGraphicSvg` over the deterministic measurer the oracles
 * were captured with. Expected values are the jar's, from
 * `test-results/dot-cache/packet/<slug>/in.svg`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketDiagram.java
 */
import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import type { PacketDiagram } from '../../../src/diagrams/packetdiag/PacketDiagram.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { emptyPacketDiagram, packetOf, TCP_HEADER } from './helpers/packet-diagram.js';

/** `TitledDiagram#getDefaultMargins`: `same(10)`. */
const MARGIN_TRANSLATE = new UTranslate(10, 10);

function widths(diagram: PacketDiagram): number[][] {
  return diagram.getPacketGrid().map((row) => row.map((block) => block.getWidth()));
}

function labels(diagram: PacketDiagram): string[][] {
  return diagram.getPacketGrid().map((row) => row.map((block) => block.getLabel()));
}

function draw(diagram: PacketDiagram): string {
  diagram.checkFinalError();
  const ug = svgGraphic();
  diagram.getTextBlock().drawU(ug.apply(MARGIN_TRANSLATE));
  return ug.getSvgString();
}

function rects(svg: string): string[] {
  return [...svg.matchAll(/<rect x="([^"]*)" y="([^"]*)" width="([^"]*)" height="([^"]*)"/g)].map(
    (m) => `${m[1]},${m[2]},${m[3]},${m[4]}`,
  );
}

describe('PacketDiagram#build', () => {
  it('lays packet-tcp-header into 8 rows, the 32-bit fields over two rows each', () => {
    const diagram = packetOf(TCP_HEADER);
    expect(diagram.checkFinalError()).toBeUndefined();
    expect(widths(diagram)).toEqual([[16], [16], [16], [16], [16], [16], [4, 6, 1, 1, 1, 1, 1, 1], [16]]);
    expect(diagram.getBitWidth()).toBe(42);
  });

  it('draws the remainder of a spanning field colWidth wide (packet-spanning-field)', () => {
    const diagram = packetOf([
      [0, 7, 'Header'],
      [8, 39, 'Payload (spans rows)'],
      [40, 47, 'Checksum'],
    ]);
    diagram.checkFinalError();
    // `toPacketBlock(remainRowWidth, true, false)` takes `min(colWidth, width)` = 16, not the 8 left (java:433, 525-527).
    expect(widths(diagram)).toEqual([[8, 8], [16], [16, 8]]);
    const grid = diagram.getPacketGrid();
    expect([grid[0]![1]!.isLeftOpen(), grid[0]![1]!.isRightOpen()]).toEqual([false, true]);
    expect([grid[1]![0]!.isLeftOpen(), grid[1]![0]!.isRightOpen()]).toEqual([true, true]);
    expect([grid[2]![0]!.isLeftOpen(), grid[2]![0]!.isRightOpen()]).toEqual([true, false]);
  });

  it('re-closes the last full row when a split leaves no remainder', () => {
    const diagram = packetOf([
      [0, 7, 'A'],
      [8, 31, 'B'],
    ]);
    diagram.checkFinalError();
    expect(widths(diagram)).toEqual([[8, 8], [16]]);
    const last = diagram.getPacketGrid()[1]![0]!;
    expect([last.isLeftOpen(), last.isRightOpen()]).toEqual([true, false]);
  });

  it('reverses each row under scale_direction = rtl (packet-rtl)', () => {
    const diagram = packetOf(
      [
        [0, 7, 'Source Port'],
        [8, 15, 'Destination Port'],
        [16, 31, 'Length'],
      ],
      (d) => d.setScaleDirection('RTL'),
    );
    diagram.checkFinalError();
    expect(labels(diagram)).toEqual([['Destination Port', 'Source Port'], ['Length']]);
  });

  it('caps colWidth at the first row and counts the scale from it (packet-colwidth-8)', () => {
    const diagram = packetOf(
      [
        [0, 3, 'Type'],
        [4, 7, 'Code'],
        [8, 15, 'Checksum'],
      ],
      (d) => d.setColWidth(8),
    );
    diagram.checkFinalError();
    expect(widths(diagram)).toEqual([[4, 4], [8]]);
    expect(diagram.getColWidth()).toBe(8);
    expect(diagram.getFullIndicatorInterval()).toBe(2);
  });

  it('caps colWidth at a short first row', () => {
    const diagram = packetOf([[0, 4, 'A']]);
    diagram.checkFinalError();
    expect(diagram.getColWidth()).toBe(5);
    expect(diagram.getFullIndicatorInterval()).toBe(1);
  });

  it('ignores colwidth and scale_interval of 0, and clamps the interval to colWidth', () => {
    const diagram = emptyPacketDiagram();
    diagram.setColWidth(0);
    diagram.updateScaleInterval(0);
    expect(diagram.getColWidth()).toBe(16);
    expect(diagram.isUseDefaultScaleInterval()).toBe(true);
    diagram.updateScaleInterval(40);
    expect(diagram.isUseDefaultScaleInterval()).toBe(false);
    diagram.addPacketItemRange(0, 15, 1, 'A', 0);
    // Interval 16 numbers only bits 0 and 16.
    expect(draw(diagram).match(/<text[^>]*>(\d+)<\/text>/g)?.length).toBe(2);
  });

  it('gives every block the row maximum under same_height', () => {
    const diagram = emptyPacketDiagram();
    diagram.setSameHeight(true);
    diagram.addPacketItemRange(0, 7, 2, 'A', 0);
    diagram.addPacketItemRange(8, 15, 1, 'B', 0);
    diagram.checkFinalError();
    expect(diagram.getPacketGrid()[0]!.map((b) => b.getHeight())).toEqual([2, 2]);
  });

  it('keeps the rotation on the item and never hands it to a block (R12.01-rotate_270)', () => {
    const diagram = emptyPacketDiagram();
    diagram.addPacketItemRange(1, 1, 1, 'A', 270);
    diagram.checkFinalError();
    expect(draw(diagram)).not.toContain('rotate');
  });

  it('answers the last end bit, or undefined when empty', () => {
    const diagram = emptyPacketDiagram();
    expect(diagram.getLastPacketEnd()).toBeUndefined();
    diagram.addPacketItemRange(0, 3, 1, 'A', 0);
    expect(diagram.getLastPacketEnd()).toBe(3);
  });

  it('crashes on a zero-width first row, as Java int % 0 does (R11.01-len_0)', () => {
    const diagram = emptyPacketDiagram();
    diagram.addPacketItemRange(0, -1, 1, 'A', 0);
    expect(() => diagram.checkFinalError()).toThrow('ArithmeticException: / by zero');
  });

  it('crashes in IntStream.limit on a negative colWidth, as the jar does (cov-attr-len-negative)', () => {
    const diagram = emptyPacketDiagram();
    // `* A [len=-2]`: end = start + len - 1 = -3, so width -2 and colWidth -2.
    diagram.addPacketItemRange(0, -3, 1, 'A', 0);
    expect(() => diagram.checkFinalError()).toThrow('IllegalArgumentException: -1');
  });

  it('describes itself as upstream does', () => {
    expect(emptyPacketDiagram().getDescription()).toBe('Packet Diagram');
  });
});

describe('PacketDiagram#getTextBlock', () => {
  it('draws packet-tcp-header as the jar does', () => {
    const svg = draw(packetOf(TCP_HEADER));
    expect(svg).toContain('<text x="6.106" y="20.889" fill="#000" font-size="14">0</text>');
    expect(svg).toContain('<path d="M10,24 L10,56" style="stroke:#181818;stroke-width:0.5;" fill="none"/>');
    expect(svg).toContain('<path d="M52,40 L52,56" style="stroke:#181818;stroke-width:0.5;" fill="none"/>');
    expect(svg).toContain('<text x="674.213" y="20.889" fill="#000" font-size="14" textLength="15.575">16</text>');
    expect(svg).toContain(
      '<rect x="10" y="56" width="672" height="34" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;"/>' +
        '<text x="309.075" y="76.889" fill="#000" font-size="14" textLength="73.85">Source Port</text>',
    );
    expect(rects(svg)).toHaveLength(15);
    expect(rects(svg).at(-1)).toBe('10,294,672,34');
  });

  it('sizes packet-tcp-header to the jar canvas less the margins', () => {
    const diagram = packetOf(TCP_HEADER);
    diagram.checkFinalError();
    const dim = diagram.getTextBlock().calculateDimension(stringBounder());
    // 735 x 339 in.svg: 17 indicators x 42 = 714, plus 10 + 10 + 1; 46 + 8 x 34 = 318, plus 10 + 10 + 1.
    expect([dim.getWidth(), dim.getHeight()]).toEqual([714, 318]);
  });

  it("adds each row's LAST block height (packet-tall-field)", () => {
    const diagram = emptyPacketDiagram();
    diagram.addPacketItemRange(0, 7, 2, 'A', 0);
    diagram.addPacketItemRange(8, 15, 1, 'B', 0);
    diagram.addPacketItemRange(16, 23, 2, 'C', 0);
    diagram.addPacketItemRange(24, 31, 1, 'D', 0);
    const svg = draw(diagram);
    expect(rects(svg)).toEqual(['10,56,336,64', '346,56,336,34', '10,90,336,64', '346,90,336,34']);
    const dim = diagram.getTextBlock().calculateDimension(stringBounder());
    expect(dim.getHeight()).toBe(46 + 34 + 34);
  });

  it('counts the scale down under rtl (packet-rtl)', () => {
    const diagram = packetOf([[0, 15, 'A']], (d) => d.setScaleDirection('rtl'));
    const numbers = [...draw(diagram).matchAll(/<text[^>]*>(\d+)<\/text>/g)].map((m) => m[1]);
    expect(numbers).toEqual(['16', '8', '0']);
  });
});
