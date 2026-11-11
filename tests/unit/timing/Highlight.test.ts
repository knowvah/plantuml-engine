import { describe, expect, it } from 'vitest';

import { ColorType } from '../../../src/core/abel/ColorType.js';
import { Colors } from '../../../src/core/abel/Colors.js';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { Highlight } from '../../../src/diagrams/timing/Highlight.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

const skinParam = timingSkinParam();
const set = HColorSet.instance();

/** `cov-highlight`: ticks 0, 10, 30, 50 at 5 px per unit; the drawing origin is x = 25 (5 + the 20 px left panel). */
function ruler(): TimingRuler {
  const r = new TimingRuler(skinParam);
  for (const t of ['0', '10', '30', '50']) r.addTime(tick(t));
  return r;
}

/** `CommandHighlight.java:111`: no caption is `Display.getWithNewlines(pragma, null)`, the NULL display. */
const caption = (text: string | null): Display => Display.getWithNewlines(skinParam.getPragma(), text);

function gold(): Highlight {
  const colors = Colors.parse('#Gold;line:DimGrey', set, ColorType.BACK);
  return new Highlight(skinParam, tick('5'), tick('15'), caption('Caption'), colors);
}

function bare(): Highlight {
  return new Highlight(skinParam, tick('25'), tick('35'), caption(null), Colors.empty());
}

function elements(draw: (ug: ReturnType<typeof svgGraphic>) => void): string[] {
  const ug = svgGraphic();
  draw(ug.apply(new UTranslate(25, 20)) as ReturnType<typeof svgGraphic>);
  return svgElements(ug.getSvgString());
}

describe('Highlight', () => {
  it('draws the gold band of cov-highlight with no outline', () => {
    expect(elements((ug) => gold().drawHighlightsBack(ug, ruler(), 54))).toEqual([
      '<rect x="50" y="20" width="50" height="54" fill="#FFD700" style="stroke:none;"/>',
    ]);
  });

  it('draws the bare band in the style background (#EEE)', () => {
    expect(elements((ug) => bare().drawHighlightsBack(ug, ruler(), 54))).toEqual([
      '<rect x="150" y="20" width="50" height="54" fill="#EEE" style="stroke:none;"/>',
    ]);
  });

  it('draws the DimGrey dashed edges of cov-highlight at both ends', () => {
    expect(elements((ug) => gold().drawHighlightsLines(ug, ruler(), 54))).toEqual([
      '<line x1="50" y1="20" x2="50" y2="74" style="stroke:#696969;stroke-width:2;stroke-dasharray:4,4;"/>',
      '<line x1="100" y1="20" x2="100" y2="74" style="stroke:#696969;stroke-width:2;stroke-dasharray:4,4;"/>',
    ]);
  });

  it('draws the bare edges in the style line colour (#333)', () => {
    expect(elements((ug) => bare().drawHighlightsLines(ug, ruler(), 54))).toEqual([
      '<line x1="150" y1="20" x2="150" y2="74" style="stroke:#333;stroke-width:2;stroke-dasharray:4,4;"/>',
      '<line x1="200" y1="20" x2="200" y2="74" style="stroke:#333;stroke-width:2;stroke-dasharray:4,4;"/>',
    ]);
  });

  it('draws the caption in the legacy FontParam.TIMING font: 12 px, black, plain (cov-highlight "Caption")', () => {
    const ug = svgGraphic();
    gold()
      .getCaption(skinParam)
      .drawU(ug.apply(new UTranslate(25 + 25 + 3, 20 + 2)));
    expect(svgElements(ug.getSvgString())).toEqual([
      '<text x="53" y="31.333" fill="#000" font-size="12" textLength="41.4">Caption</text>',
    ]);
  });

  it('draws nothing for the bare highlight caption', () => {
    const ug = svgGraphic();
    bare().getCaption(skinParam).drawU(ug);
    expect(svgElements(ug.getSvgString())).toEqual([]);
  });

  it('keeps its ticks and caption', () => {
    const h = gold();
    expect(h.getTickFrom().getTime().toPlainString()).toBe('5');
    expect(h.getTickTo().getTime().toPlainString()).toBe('15');
    expect(h.getCaption().toString()).toBe('[Caption]');
  });
});
