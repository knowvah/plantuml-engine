import { describe, expect, it } from 'vitest';

import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { UFont } from '../../../src/core/klimt/font/UFont.js';
import { timingFont, timingFontHtmlColor } from '../../../src/diagrams/timing/timing-font-param.js';
import { paint, timingSkinParam } from './helpers/timing.js';

const set = HColorSet.instance();
const store = (values: Record<string, string>): { getValue(key: string): string | null } => ({
  getValue: (key) => values[key] ?? null,
});

describe('timingFont (SkinParam#getFont for FontParam.TIMING)', () => {
  it('defaults to SansSerif, plain, 12 (FontParam.java:49)', () => {
    const font = timingFont(store({}));
    expect(font).toBeInstanceOf(UFont);
    expect(font.getSize()).toBe(12);
    expect(font.getFontStack().getFullDefinition()).toBe('SansSerif');
    expect(font.getFontFace().cssWeight).toBe(400);
    expect(font.getFontFace().italic).toBe(false);
  });

  it('takes timingFontSize, then defaultFontSize, only when all digits', () => {
    expect(timingFont(store({ TIMINGfontsize: '20', defaultfontsize: '30' })).getSize()).toBe(20);
    expect(timingFont(store({ defaultfontsize: '30' })).getSize()).toBe(30);
    expect(timingFont(store({ TIMINGfontsize: '2x', defaultfontsize: '3.5' })).getSize()).toBe(12);
  });

  it('takes timingFontName, then defaultFontName, and strips surrounding quotes', () => {
    expect(
      timingFont(store({ TIMINGfontname: '"Courier"' }))
        .getFontStack()
        .getFullDefinition(),
    ).toBe('Courier');
    expect(
      timingFont(store({ defaultfontname: 'Serif' }))
        .getFontStack()
        .getFullDefinition(),
    ).toBe('Serif');
    expect(
      timingFont(store({ TIMINGfontname: 'Monospaced', defaultfontname: 'Serif' }))
        .getFontStack()
        .getFullDefinition(),
    ).toBe('Monospaced');
  });

  it('takes the face from timingFontStyle, then defaultFontStyle (bold and/or italic, any case)', () => {
    const face = (values: Record<string, string>): [number, boolean] => {
      const f = timingFont(store(values)).getFontFace();
      return [f.cssWeight, f.italic];
    };
    expect(face({ TIMINGfontstyle: 'Bold' })).toEqual([700, false]);
    expect(face({ TIMINGfontstyle: 'italic' })).toEqual([400, true]);
    expect(face({ TIMINGfontstyle: 'bold italic' })).toEqual([700, true]);
    expect(face({ TIMINGfontstyle: 'plain' })).toEqual([400, false]);
    expect(face({ defaultfontstyle: 'bold' })).toEqual([700, false]);
  });
});

describe('timingFontHtmlColor (SkinParam#getFontHtmlColor for FontParam.TIMING)', () => {
  it('defaults to black, then defaultFontColor, then timingFontColor', () => {
    expect(paint(timingFontHtmlColor(store({}), set))).toBe('#000000');
    expect(paint(timingFontHtmlColor(store({ defaultfontcolor: 'red' }), set))).toBe('#FF0000');
    expect(paint(timingFontHtmlColor(store({ TIMINGfontcolor: 'blue', defaultfontcolor: 'red' }), set))).toBe(
      '#0000FF',
    );
  });
});

describe('the unit-test skin param answers the TIMING members through those functions', () => {
  it('reads timingFontSize from the skinparam store', () => {
    const sp = timingSkinParam(undefined, { timingFontSize: '30', timingFontColor: 'green' });
    expect((sp.getFont(undefined, false, 'TIMING') as UFont).getSize()).toBe(30);
    expect(paint(sp.getFontHtmlColor(undefined, 'TIMING'))).toBe('#008000');
    expect(paint(sp.getHyperlinkColor())).toBe('#0000FF');
    expect(sp.useUnderlineForHyperlink().getThickness()).toBe(1);
  });
});
