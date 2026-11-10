import { describe, expect, it } from 'vitest';
import { UStroke } from '../../../src/core/klimt/UStroke.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { fore } from '../../../src/diagrams/ebnf/ebnf-klimt.js';
import { OptionKey } from '../../../src/core/tim/EaterOption.js';
import { Brace } from '../../../src/diagrams/ebnf/Brace.js';
import { CornerCurved } from '../../../src/diagrams/ebnf/CornerCurved.js';
import { ETile } from '../../../src/diagrams/ebnf/ETile.js';
import { ETileEmpty } from '../../../src/diagrams/ebnf/ETileEmpty.js';
import { Symbol } from '../../../src/diagrams/ebnf/Symbol.js';
import { TitleBox } from '../../../src/diagrams/ebnf/TitleBox.js';
import { Zigzag } from '../../../src/diagrams/ebnf/Zigzag.js';
import { body, BOUNDER, box, ebnfSkinParam, ebnfStyle, newGraphic } from './helpers.js';

// Oracle: test-results/dot-cache/ebnf/butiti-18-tava797/in.svg (`digit1 = s, (* note a *) {"0", "1"} (* note b *);`)
//   <rect x="40" y="65" width="17" height="24" fill="#F1F1F1" style="stroke:#181818;stroke-width:1.5;" rx="5" ry="5"/>
//   <text x="45" y="80.889" fill="#000" font-size="14">s</text>
//   <rect x="116" y="99" width="17.787" height="24" fill="none" style="stroke:#181818;stroke-width:0.5;"/>
//   <text x="121" y="114.889" fill="#000" font-size="14">0</text>
//   <text x="10" y="20.889" fill="#000" font-size="14" textLength="33.513" font-weight="700">digit1</text>
describe('ETileBox (ETileBox.java:65-266)', () => {
  it('a terminal "0" is a square box, stroke 0.5, no fill, text inset 5', () => {
    const tile = box('0', Symbol.TERMINAL_STRING1);
    expect(tile.getWidth(BOUNDER)).toBeCloseTo(17.787, 3);
    expect(tile.getH1(BOUNDER)).toBe(12);
    expect(tile.getH2(BOUNDER)).toBe(12);
    const ug = newGraphic();
    tile.drawU(ug.apply(new UTranslate(116, 99)));
    expect(body(ug)).toBe(
      '<rect x="116" y="99" width="17.787" height="24" fill="none" style="stroke:#181818;stroke-width:0.5;"/>' +
        '<text x="121" y="114.889" fill="#000" font-size="14">0</text>',
    );
  });

  it('a non-terminal "s" is rounded 10 (rx 5), filled, stroke 1.5', () => {
    const ug = newGraphic();
    box('s', Symbol.LITERAL).drawU(ug.apply(new UTranslate(40, 65)));
    expect(body(ug)).toBe(
      '<rect x="40" y="65" width="17" height="24" fill="#F1F1F1" style="stroke:#181818;stroke-width:1.5;" rx="5" ry="5"/>' +
        '<text x="45" y="80.889" fill="#000" font-size="14">s</text>',
    );
  });

  it('a special sequence is dashed 5,5', () => {
    const ug = newGraphic();
    box('x', Symbol.SPECIAL_SEQUENCE).drawU(ug);
    expect(body(ug)).toContain('stroke-dasharray:5,5;');
  });

  // Oracle: plans/ebnf-engine-port/probes/cov-inline-comments.puml, the "0" box with `(* lead *)` above and
  // `(* trail *)` below, its tile origin at (40, 34). `readComment` keeps the blanks inside `(* … *)`
  // (EbnfExpression.java:248-264), so each note text is " lead " / " trail ": the two 3.575 px spaces widen the
  // note by 7.15 and shift its text right by 3.575.
  it('notes above and below add their height + 20, centre the box, and link to it (cov-inline-comments)', () => {
    const skinParam = ebnfSkinParam();
    const { style } = ebnfStyle(skinParam);
    const tile = box('0', Symbol.TERMINAL_STRING1);
    tile.addCommentAbove(' lead ');
    tile.addCommentBelow(' trail ');
    expect(tile.getH1(BOUNDER)).toBe(12 + 23 + 20);
    expect(tile.getH2(BOUNDER)).toBe(12 + 23 + 20);
    expect(tile.getWidth(BOUNDER)).toBeCloseTo(52.769, 3);
    const ug = newGraphic();
    const lineColor = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
    tile.drawU(ug.apply(fore(lineColor)).apply(UStroke.withThickness(1.5)).apply(new UTranslate(40, 34)));
    expect(body(ug)).toBe(
      '<rect x="57.491" y="77" width="17.787" height="24" fill="none" style="stroke:#181818;stroke-width:0.5;"/>' +
        '<text x="62.491" y="92.889" fill="#000" font-size="14">0</text>' +
        '<path d="M40,34 L40,57 A0,0 0 0 0 40,57 L62.384,57 L66.384,77 L70.384,57 L92.769,57 A0,0 0 0 0 92.769,57 ' +
        'L92.769,44 L82.769,34 L40,34 A0,0 0 0 0 40,34" style="stroke:#181818;stroke-width:0.5;" fill="#FEFFDD"/>' +
        '<path d="M82.769,34 L82.769,44 L92.769,44 L82.769,34" style="stroke:#181818;stroke-width:0.5;" fill="#FEFFDD"/>' +
        '<text x="49.575" y="49.111" fill="#000" font-size="13" textLength="24.619">lead</text>' +
        '<path d="M41.828,121 L41.828,144 A0,0 0 0 0 41.828,144 L90.941,144 A0,0 0 0 0 90.941,144 L90.941,131 ' +
        'L80.941,121 L70.384,121 L66.384,101 L62.384,121 L41.828,121 A0,0 0 0 0 41.828,121" ' +
        'style="stroke:#181818;stroke-width:0.5;" fill="#FEFFDD"/>' +
        '<path d="M80.941,121 L80.941,131 L90.941,131 L80.941,121" style="stroke:#181818;stroke-width:0.5;" fill="#FEFFDD"/>' +
        '<text x="51.403" y="136.111" fill="#000" font-size="13" textLength="20.962">trail</text>' +
        '<line x1="40" y1="89" x2="57.491" y2="89" style="stroke:#181818;stroke-width:1.5;"/>' +
        '<line x1="75.278" y1="89" x2="92.769" y2="89" style="stroke:#181818;stroke-width:1.5;"/>',
    );
  });

  it('a box narrower than its note by more than 50 draws the side arrows', () => {
    const tile = box('0', Symbol.TERMINAL_STRING1);
    tile.addCommentAbove('a much longer comment');
    const ug = newGraphic();
    tile.drawU(ug);
    expect(
      body(ug).match(/<path d="M[0-9.]+,[0-9.]+ L[0-9.]+,[0-9.]+ L[0-9.]+,[0-9.]+ L[0-9.]+,[0-9.]+ L[0-9.]+,[0-9.]+"/g),
    ).toHaveLength(2);
  });

  it('mergeWith joins the values, getRepetitionLabel is the value, getSymbol the symbol', () => {
    const merged = box('a', Symbol.TERMINAL_STRING1).mergeWith(box('b', Symbol.TERMINAL_STRING1));
    expect(merged.getRepetitionLabel()).toBe('ab');
    expect(merged.getSymbol()).toBe(Symbol.TERMINAL_STRING1);
    expect(() => merged.push(new ETileEmpty())).toThrow('UnsupportedOperationException');
  });

  it('useDescriptiveNames renames regex shorthands through I18n (cov-descriptive-names{,-fr})', () => {
    const on = new Map([[OptionKey.USE_DESCRIPTIVE_NAMES, 'TRUE']]);
    expect(box('.', Symbol.TERMINAL_STRING1, on).getRepetitionLabel()).toBe('AnyChar');
    expect(box('\\d', Symbol.TERMINAL_STRING1, on).getRepetitionLabel()).toBe('Digit');
    expect(box('x', Symbol.TERMINAL_STRING1, on).getRepetitionLabel()).toBe('x');
    expect(box('\\d', Symbol.TERMINAL_STRING1).getRepetitionLabel()).toBe('\\d');
    const fr = new Map([
      [OptionKey.USE_DESCRIPTIVE_NAMES, 'true'],
      [OptionKey.LANGUAGE, 'fr'],
    ]);
    expect(box('.', Symbol.TERMINAL_STRING1, fr).getRepetitionLabel()).toBe('ToutCaractère');
  });
});

describe('TitleBox (TitleBox.java:47-71)', () => {
  it('draws the name bold on its baseline', () => {
    const { fc } = ebnfStyle(ebnfSkinParam());
    const title = new TitleBox('digit1', fc);
    expect(title.calculateDimension(BOUNDER).getWidth()).toBeCloseTo(33.513, 3);
    const ug = newGraphic();
    title.drawU(ug.apply(new UTranslate(10, 10)));
    expect(body(ug)).toBe(
      '<text x="10" y="20.889" fill="#000" font-size="14" textLength="33.513" font-weight="700">digit1</text>',
    );
  });
});

describe('ETile and ETileEmpty (ETile.java:49-167, ETileEmpty.java:42-67)', () => {
  it('ETileEmpty is 0 x 0, draws nothing, and the comment defaults ignore their text', () => {
    const empty = new ETileEmpty();
    expect(empty.calculateDimension(BOUNDER).getWidth()).toBe(0);
    expect(empty.calculateDimension(BOUNDER).getHeight()).toBe(0);
    empty.addCommentAbove('x');
    empty.addCommentBelow('y');
    expect(empty.getRepetitionLabel()).toBe('?');
    const ug = newGraphic();
    empty.drawU(ug);
    expect(body(ug)).toBe('');
    expect(() => empty.push(empty)).toThrow('UnsupportedOperationException');
  });

  it('the four arrows match the oracle polygons', () => {
    // butiti: <path d="M128.43,77 L128.43,74 L134.43,77 L128.43,80 L128.43,77" fill="#181818"/> (to the right) and
    // <path d="M147.345,92 L147.345,89 L141.345,92 L147.345,95 L147.345,92" fill="#181818"/> (to the left).
    const ug = newGraphic();
    ug.apply(new UTranslate(128.43, 77)).draw(ETile.getArrowToRight());
    ug.apply(new UTranslate(147.345, 92)).draw(ETile.getArrowToLeft());
    ug.draw(ETile.getArrowToBottom());
    ug.draw(ETile.getArrowToTop());
    const svg = body(ug);
    expect(svg).toContain('d="M128.43,77 L128.43,74 L134.43,77 L128.43,80 L128.43,77"');
    expect(svg).toContain('d="M147.345,92 L147.345,89 L141.345,92 L147.345,95 L147.345,92"');
    expect(svg).toContain('d="M0,0 L3,0 L0,6 L-3,0 L0,0"');
    expect(svg).toContain('d="M0,0 L3,0 L0,-6 L-3,0 L0,0"');
  });
});

describe('CornerCurved, Zigzag, Brace', () => {
  it('corners are one cubic each (butiti: M109,103 C109,109 111,111 117,111)', () => {
    const ug = newGraphic();
    CornerCurved.createSW(8).drawU(ug.apply(new UTranslate(109, 111)));
    CornerCurved.createSE(8).drawU(ug);
    CornerCurved.createNE(8).drawU(ug);
    CornerCurved.createNW(8).drawU(ug);
    const svg = body(ug);
    expect(svg).toContain('d="M109,103 C109,109 111,111 117,111"');
    expect(svg).toContain('d="M0,-8 C0,-2 -2,0 -8,0"');
    expect(svg).toContain('d="M-8,0 C-2,0 0,2 0,8"');
    expect(svg).toContain('d="M0,8 C0,2 2,0 8,0"');
    expect(() => CornerCurved.createSW(0)).toThrow('IllegalArgumentException');
  });

  it('the arrowed corners add an arrow on their vertical end', () => {
    const ug = newGraphic();
    CornerCurved.createNE_arrow(8).drawU(ug);
    CornerCurved.createNW_arrow(8).drawU(ug);
    const svg = body(ug);
    expect(svg).toContain('d="M0,3 L3,3 L0,9 L-3,3 L0,3"');
    expect(svg).toContain('d="M0,8 L3,8 L0,2 L-3,8 L0,8"');
  });

  it('Zigzag goes down and up through its midpoint (butiti: M77,77 C86,77 89,85 89,94 C89,103 92,111 101,111)', () => {
    const ug = newGraphic();
    ug.apply(new UTranslate(77, 77)).draw(new Zigzag(9, 24, 34).pathDown());
    ug.draw(new Zigzag(9, 24, 34).pathUp());
    const svg = body(ug);
    expect(svg).toContain('d="M77,77 C86,77 89,85 89,94 C89,103 92,111 101,111"');
    expect(svg).toContain('d="M0,34 C9,34 12,26 12,17 C12,8 15,0 24,0"');
  });

  it('Brace draws four 5 px corners and two lines at stroke 0.5', () => {
    const ug = newGraphic();
    new Brace(40, 10).drawU(ug);
    expect(body(ug)).toBe(
      '<path d="M0,5 C0,1.25 1.25,0 5,0" fill="none"/><path d="M20,-5 C20,-1.25 18.75,0 15,0" fill="none"/>' +
        '<path d="M20,-5 C20,-1.25 21.25,0 25,0" fill="none"/><path d="M35,0 C38.75,0 40,1.25 40,5" fill="none"/>' +
        '<line x1="5" y1="0" x2="15" y2="0" style="stroke:none;"/><line x1="25" y1="0" x2="35" y2="0" style="stroke:none;"/>',
    );
  });
});

/** Exposes ETile's protected vertical helpers, which no upstream tile calls (ETile.java:97-108). */
class Probe extends ETileEmpty {
  vertical(ug: Parameters<ETileEmpty['drawU']>[0]): void {
    this.drawVlineDirected(ug, 5, 0, 20);
    this.drawVlineAntiDirected(ug, 9, 0, 20);
  }
}

describe('ETile vertical directed lines (ETile.java:97-108)', () => {
  it('draw the line and an arrow at the middle, down then up', () => {
    const ug = newGraphic();
    new Probe().vertical(ug);
    const svg = body(ug);
    expect(svg).toContain('<line x1="5" y1="0" x2="5" y2="20"');
    expect(svg).toContain('d="M5,8 L8,8 L5,14 L2,8 L5,8"');
    expect(svg).toContain('<line x1="9" y1="0" x2="9" y2="20"');
    expect(svg).toContain('d="M9,12 L12,12 L9,6 L6,12 L9,12"');
  });
});
