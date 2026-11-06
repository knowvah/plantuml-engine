/**
 * The chart engine's `SkinParam` slice (skin/SkinParam.java), mirroring
 * `src/diagrams/wbs/wbs-skin-param.ts` (cep D2).
 */
import { describe, expect, it } from 'vitest';
import type { FontStyle } from '../../../src/core/klimt/shape/UText.js';
import { CreoleMode } from '../../../src/core/klimt/creole/CreoleMode.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { GUILLEMET_DEFAULT } from '../../../src/core/text/Guillemet.js';
import { chartSkinParam } from './helpers/chart-diagram.js';

const param = (entries: Record<string, string> = {}) => chartSkinParam(new Map(Object.entries(entries)));

const FONT = { family: 'sans-serif', size: 14, color: '#000000', styles: new Set<FontStyle>() };

describe('chart SkinParam', () => {
  it('reads a skinparam through cleanForKey, trimmed', () => {
    const p = param({ lengthAdjust: ' spacingAndGlyphs ' });
    expect(p.getValue('lengthadjust')).toBe('spacingAndGlyphs');
    expect(p.getValue('nosuch')).toBeNull();
    expect(p.getlengthAdjust()).toBe('spacingAndGlyphs');
    expect(p.values().get('lengthadjust')).toBe('spacingAndGlyphs');
    expect(param().getlengthAdjust()).toBeUndefined();
  });

  it('dpi defaults to 96 and refuses a zero', () => {
    expect(param().getDpi()).toBe(96);
    expect(param({ dpi: '200' }).getDpi()).toBe(200);
    expect(param({ dpi: '0' }).getDpi()).toBe(96);
    expect(param({ dpi: 'x' }).getDpi()).toBe(96);
  });

  it('answers the sheet members from their defaults', () => {
    const p = param();
    expect(p.getTabSize()).toBe(8);
    expect(p.getMonospacedFamily()).toBe('monospaced');
    expect(param({ defaultMonospacedFontName: 'Courier' }).getMonospacedFamily()).toBe('Courier');
    expect(p.getPadding().getLeft()).toBe(0);
    expect(param({ padding: '2.5' }).getPadding().getLeft()).toBe(2.5);
    expect(p.guillemet()).toBe(GUILLEMET_DEFAULT);
    expect(p.getFromMd5('x')).toBeNull();
    expect(p.transformStringForSizeHack('abc')).toBe('abc');
    expect(p.getSprite('nosuch')).toBeNull();
    expect(p.getPragma().constructor).toBe(Pragma);
    expect(p.getIHtmlColorSet().getColorOrNull('red')).toBeDefined();
  });

  it('copyAllFrom writes the params as they are', () => {
    const p = param();
    p.copyAllFrom(new Map([['k', 'v']]));
    expect(p.getValue('k')).toBe('v');
  });

  it('throws unported on members the chart path never reaches', () => {
    const p = param();
    const message = /is not reached by the chart engine/;
    expect(() => p.getFontHtmlColor(undefined)).toThrow(message);
    expect(() => p.getFont(undefined, false)).toThrow(message);
    expect(() => p.getHyperlinkColor()).toThrow(message);
    expect(() => p.useUnderlineForHyperlink()).toThrow(message);
    expect(() => p.getDefaultTextAlignment(HorizontalAlignment.LEFT)).toThrow(message);
    expect(() => p.strictUmlStyle()).toThrow(message);
  });

  it('builds a creole sheet over the skin', () => {
    const sheet = param().sheet(FONT, HorizontalAlignment.LEFT, CreoleMode.FULL).createSheet(Display.create('a'));
    expect([...sheet]).toHaveLength(1);
  });
});
