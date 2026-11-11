import { describe, expect, it } from 'vitest';

import { Display } from '../../../src/core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { TextBlockUtils } from '../../../src/core/klimt/shape/TextBlockUtils.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { PlayerFrame, TIMING_DIAGRAM_MARGIN_X1 } from '../../../src/diagrams/timing/graphic/PlayerFrame.js';
import { createDisplay, timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { svgElements, timingSkinParam } from './helpers/timing.js';

/** `cov-concise-basic`, `concise "Web User" as WU`: the title at (25, 20) and the line under it. */
const TITLE_ORACLE = [
  '<text x="25" y="30.889" fill="#333" font-size="14" textLength="62.213" font-weight="700">Web User</text>',
  '<line x1="20" y1="35" x2="88.213" y2="35" style="stroke:#333;stroke-width:0.5;"/>',
  '<line x1="88.213" y1="35" x2="98.213" y2="20" style="stroke:#333;stroke-width:0.5;"/>',
];

function frame(title: string, compact: boolean): PlayerFrame {
  const skinParam = timingSkinParam();
  const block = createDisplay(
    Display.getWithNewlines(skinParam.getPragma(), title),
    timingStyle(skinParam),
    skinParam,
    HorizontalAlignment.LEFT,
  );
  return new PlayerFrame(block, skinParam, compact);
}

describe('PlayerFrame', () => {
  it('draws the title and the two-segment line of cov-concise-basic', () => {
    const ug = svgGraphic();
    frame('Web User', false).drawFrameTitle(ug.apply(new UTranslate(25, 20)));
    expect(svgElements(ug.getSvgString())).toEqual(TITLE_ORACLE);
  });

  it('starts the line TimingDiagram.marginX1 (5) left of the title', () => {
    expect(TIMING_DIAGRAM_MARGIN_X1).toBe(5);
  });

  it('draws only the title of a compact player', () => {
    const ug = svgGraphic();
    frame('Web User', true).drawFrameTitle(ug.apply(new UTranslate(25, 20)));
    expect(svgElements(ug.getSvgString())).toEqual([TITLE_ORACLE[0]]);
  });

  it('draws nothing for the empty title block', () => {
    const ug = svgGraphic();
    new PlayerFrame(TextBlockUtils.EMPTY_TEXT_BLOCK, timingSkinParam(), false).drawFrameTitle(ug);
    expect(svgElements(ug.getSvgString())).toEqual([]);
  });

  it('drawTitle draws the title without the line', () => {
    const ug = svgGraphic();
    frame('Web User', false).drawTitle(ug.apply(new UTranslate(25, 20)));
    expect(svgElements(ug.getSvgString())).toEqual([TITLE_ORACLE[0]]);
  });

  it('is one pixel higher than the title, one lower when compact (oracle: the 35 - 20 line is title + 1)', () => {
    expect(frame('Web User', false).getHeight(stringBounder())).toBe(15);
    expect(frame('Web User', true).getHeight(stringBounder())).toBe(13);
    expect(new PlayerFrame(TextBlockUtils.EMPTY_TEXT_BLOCK, timingSkinParam(), false).getHeight(stringBounder())).toBe(
      1,
    );
  });
});
