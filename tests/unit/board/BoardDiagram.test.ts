/**
 * `BoardDiagram`: `addLine`, and `getTextBlock` drawn through `UGraphicSvg`
 * over the deterministic measurer the oracles were captured with. Expected
 * values are the jar's, from `test-results/dot-cache/board/<slug>/in.svg`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BoardDiagram.java
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import type { BoardDiagram } from '../../../src/diagrams/board/BoardDiagram.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { BOARD_CACHE, bodyLines, boardOf, cardOrigins, emptyBoardDiagram } from './helpers/board-diagram.js';

/** `TitledDiagram#getDefaultMargins`: `same(10)`. */
const MARGIN_TRANSLATE = new UTranslate(10, 10);

function draw(diagram: BoardDiagram): string {
  const ug = svgGraphic();
  diagram.getTextBlock().drawU(ug.apply(MARGIN_TRANSLATE));
  return ug.getSvgString();
}

function jarSvg(slug: string): string {
  return readFileSync(`${BOARD_CACHE}/${slug}/in.svg`, 'utf8');
}

function texts(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>[^<]*<\/text>/g)].map((m) => m[0]);
}

function lines(svg: string): string[] {
  return [...svg.matchAll(/<line [^>]*\/>/g)].map((m) => m[0]);
}

describe('BoardDiagram#addLine', () => {
  it('starts an activity on an empty plus and adds a release otherwise', () => {
    const diagram = boardOf(['A', '+B', '++C', 'D']);
    expect(diagram.getActivities().map((a) => a.getCells().map((n) => n.toString()))).toEqual([
      ['A(0) [0]', 'B(1) [0]', 'C(2) [0]'],
      ['D(0) [0]'],
    ]);
  });

  it('throws on a release before any activity, as getLastActivity() does (bep D10)', () => {
    const diagram = emptyBoardDiagram();
    expect(() => diagram.addLine('+', 'B')).toThrow('IndexOutOfBoundsException');
  });

  it('describes itself as Board (java:63-65)', () => {
    expect(emptyBoardDiagram().getDescription()).toBe('Board');
  });
});

describe('BoardDiagram#getTextBlock', () => {
  it("draws gasaxu-65-cipo396's cards and labels as the jar does, the root twice", () => {
    const ours = draw(boardOf(bodyLines(`${BOARD_CACHE}/gasaxu-65-cipo396/in.puml`)));
    const jar = jarSvg('gasaxu-65-cipo396');
    expect(cardOrigins(ours)).toEqual(cardOrigins(jar));
    expect(texts(ours)).toEqual(texts(jar));
    expect(ours).toContain(
      '<rect x="10" y="10" width="150" height="70" fill="#C0C0C0" style="stroke:#000;stroke-width:1;" filter="url(#',
    );
    expect(ours).not.toContain('dominant-baseline');
  });

  it('draws the separators on the untranslated graphic, across every activity', () => {
    const ours = draw(boardOf(bodyLines(`${BOARD_CACHE}/gasaxu-65-cipo396/in.puml`)));
    expect(lines(ours)).toEqual(lines(jarSvg('gasaxu-65-cipo396')));
    expect(lines(ours)).toHaveLength(3);
  });

  it("measures its own drawing plus 10, which makes the jar's 1562×373 canvas", () => {
    const diagram = boardOf(bodyLines(`${BOARD_CACHE}/gasaxu-65-cipo396/in.puml`));
    const dim = diagram.getTextBlock().calculateDimension(stringBounder());
    expect([dim.getWidth(), dim.getHeight()]).toEqual([1541, 352]);
    // Canvas = dimension + the 10 + 10 default margins (TextBlockExporter.java:201-202), then
    // SvgGraphics#ensureVisible(minDim) stores `(int) (x + 1)` (SvgGraphics.java:129-143).
    expect([Math.trunc(dim.getWidth() + 20 + 1), Math.trunc(dim.getHeight() + 20 + 1)]).toEqual([1562, 373]);
  });

  it.each(['jifeju-37-zeza533', 'nuropa-85-vili653', 'rebire-77-depi269'])(
    "draws %s's cards, labels and separators as the jar does",
    (slug) => {
      const ours = draw(boardOf(bodyLines(`${BOARD_CACHE}/${slug}/in.puml`)));
      const jar = jarSvg(slug);
      expect(cardOrigins(ours)).toEqual(cardOrigins(jar));
      expect(texts(ours)).toEqual(texts(jar));
      expect(lines(ours)).toEqual(lines(jar));
    },
  );

  it('draws nothing for a board with no activity', () => {
    const diagram = emptyBoardDiagram();
    expect(cardOrigins(draw(diagram))).toEqual([]);
    expect(lines(draw(diagram))).toEqual([]);
  });
});
