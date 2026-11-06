/**
 * `CardBox`: the fixed 150×70 card, black on `HColors.LIGHT_GRAY`, with a
 * shadow and its label at `(3, 3)`, whatever the skin param says (bep D6).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/CardBox.java
 */
import { describe, expect, it } from 'vitest';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import { SkinParam } from '../../../src/diagrams/board/board-skin-param.js';
import { CardBox } from '../../../src/diagrams/board/CardBox.js';
import { PostIt } from '../../../src/diagrams/board/PostIt.js';
import { BNode } from '../../../src/diagrams/board/BNode.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { boardSkinParam } from './helpers/board-diagram.js';

function drawCard(card: { drawU: (ug: ReturnType<typeof svgGraphic>) => void }): string {
  const ug = svgGraphic();
  card.drawU(ug);
  return ug.getSvgString();
}

describe('CardBox', () => {
  it('is 150×70 whatever its label', () => {
    const dim = new CardBox(Display.create('a very long label indeed'), boardSkinParam()).calculateDimension(
      stringBounder(),
    );
    expect([dim.getWidth(), dim.getHeight()]).toEqual([150, 70]);
  });

  it("draws the jar's card: #C0C0C0, black 1px stroke, shadow filter, label at (3, 3) baseline 13.889", () => {
    const svg = drawCard(new CardBox(Display.create('World'), boardSkinParam()));
    expect(svg).toMatch(
      /<rect x="0" y="0" width="150" height="70" fill="#C0C0C0" style="stroke:#000;stroke-width:1;" filter="url\(#[a-z0-9]+\)"\/>/,
    );
    expect(svg).toContain('<text x="3" y="13.889" fill="#000" font-size="14" textLength="36.575">World</text>');
    expect(svg).toContain('<feOffset result="blurOut3" in="blurOut2" dx="4" dy="4"/>');
  });

  it('ignores monochrome and every other skinparam (bep D6; cov-mono-true)', () => {
    const skinParam = new SkinParam({
      style: createMindmapSkinParam({}),
      skinparam: new Map([
        ['monochrome', 'true'],
        ['backgroundColor', 'red'],
      ]),
      sprites: createSpriteRegistry(),
      pragma: Pragma.createEmpty(),
    });
    const svg = drawCard(new CardBox(Display.create('X'), skinParam));
    expect(svg).toContain('fill="#C0C0C0"');
  });
});

describe('PostIt', () => {
  it('is the 170×90 grid pitch, and its card is a CardBox of the node name', () => {
    expect([PostIt.getWidth(), PostIt.getHeight()]).toEqual([170, 90]);
    const svg = drawCard(new PostIt(boardSkinParam(), new BNode(1, 'Paris')).getCard());
    expect(svg).toContain('textLength="31.938">Paris</text>');
  });
});
