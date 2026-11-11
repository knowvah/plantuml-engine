/**
 * `timing-skin-param.ts`: the slice of `SkinParam.java` a timing class reaches.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java
 */
import { describe, expect, it } from 'vitest';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { CreoleMode } from '../../../src/core/klimt/creole/CreoleMode.js';
import { CreoleParser } from '../../../src/core/klimt/creole/legacy/CreoleParser.js';
import type { UFont } from '../../../src/core/klimt/font/UFont.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import { SkinParam } from '../../../src/diagrams/timing/timing-skin-param.js';
import { paint } from './helpers/timing.js';

/** `FontParam.TIMING`'s size through `getFont`. */
function fontSize(sp: SkinParam): number {
  return (sp.getFont(undefined, false, 'TIMING') as UFont).getSize();
}

function skinParam(skinparams: Record<string, string> = {}): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map(Object.entries(skinparams)),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

describe('SkinParam values (SkinParam.java:227-234, 326-340)', () => {
  it('reads a key case-insensitively, trimmed, and null when absent', () => {
    const sp = skinParam({ DefaultFontSize: ' 20 ' });
    expect(sp.getValue('defaultfontsize')).toBe('20');
    expect(sp.getValue('nothing')).toBeNull();
    expect(sp.values().get('defaultfontsize')).toBe('20');
  });

  it('copyAllFrom overwrites by raw key', () => {
    const sp = skinParam();
    sp.copyAllFrom(new Map([['tabsize', '4']]));
    expect(sp.getTabSize()).toBe(4);
  });

  it('numeric members take digits only and otherwise their default', () => {
    expect([skinParam().getDpi(), skinParam({ dpi: '300' }).getDpi(), skinParam({ dpi: '0' }).getDpi()]).toEqual([
      96, 300, 96,
    ]);
    expect([skinParam().getTabSize(), skinParam({ tabsize: 'x' }).getTabSize()]).toEqual([8, 8]);
    expect(skinParam({ padding: '3.5' }).getPadding().getTop()).toBe(3.5);
    expect(skinParam({ padding: 'x' }).getPadding().getTop()).toBe(0);
    expect(skinParam().getPadding().getLeft()).toBe(0);
  });

  it('monospaced family, lengthAdjust, guillemet and the md5 and size hacks', () => {
    expect(skinParam().getMonospacedFamily()).toBe('monospaced');
    expect(skinParam({ defaultMonospacedFontName: 'Courier' }).getMonospacedFamily()).toBe('Courier');
    expect(skinParam().getlengthAdjust()).toBeUndefined();
    expect(skinParam({ lengthAdjust: 'spacingAndGlyphs' }).getlengthAdjust()).toBe('spacingAndGlyphs');
    expect(skinParam().guillemet()).toEqual({ start: '«', end: '»' });
    expect(skinParam().getFromMd5('x')).toBeNull();
    expect(skinParam().transformStringForSizeHack('abc')).toBe('abc');
    expect(skinParam().getSprite('missing')).toBeNull();
    expect(skinParam().getSprites()).toBeDefined();
    const pragma = Pragma.createEmpty();
    const sp = new SkinParam({
      style: createMindmapSkinParam({}),
      skinparam: new Map(),
      sprites: createSpriteRegistry(),
      pragma,
    });
    expect(sp.getPragma()).toBe(pragma);
  });
});

describe('SkinParam style and colour set', () => {
  it('has a current style builder and the shared colour set', () => {
    const sp = skinParam();
    expect(sp.getCurrentStyleBuilder()).toBeDefined();
    expect(paint(sp.getIHtmlColorSet().getColorOrWhite('#FFC0CB'))).toBe('#FFC0CB');
  });

  it('the shared atom ops build lazily and answer for the root font', () => {
    expect(Object.keys(skinParam().atomOps).sort()).toEqual(['calculateDimension', 'drawU', 'getStartingAltitude']);
  });

  it('getFont follows the timing skinparams', () => {
    const sp = skinParam({ timingFontSize: '20', timingFontColor: 'red' });
    expect(fontSize(sp)).toBe(20);
    expect(paint(sp.getFontHtmlColor(undefined, 'TIMING'))).toBe('#FF0000');
  });

  it('getHyperlinkColor is blue unless hyperlinkColor is set (SkinParam.java:305-311)', () => {
    expect(paint(skinParam().getHyperlinkColor())).toBe('#0000FF');
    expect(paint(skinParam({ hyperlinkColor: 'red' }).getHyperlinkColor())).toBe('#FF0000');
  });

  it('useUnderlineForHyperlink answers the simple stroke', () => {
    expect(skinParam().useUnderlineForHyperlink().getThickness()).toBe(1);
  });

  it('getDefaultTextAlignment answers the skinparam, else the default (SkinParam.java:731-738)', () => {
    expect(skinParam().getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(HorizontalAlignment.LEFT);
    expect(skinParam({ defaultTextAlignment: 'center' }).getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(
      HorizontalAlignment.CENTER,
    );
    expect(skinParam({ defaultTextAlignment: 'bogus' }).getDefaultTextAlignment(HorizontalAlignment.RIGHT)).toBe(
      HorizontalAlignment.RIGHT,
    );
  });

  it('strictUmlStyle is unported and says so', () => {
    expect(() => skinParam().strictUmlStyle()).toThrow('unported: SkinParam#strictUmlStyle');
  });
});

describe('SkinParam#sheet', () => {
  it('answers a creole parser over the given font and alignment', () => {
    const fc = { family: 'x' } as never;
    expect(skinParam().sheet(fc, HorizontalAlignment.LEFT, CreoleMode.FULL)).toBeInstanceOf(CreoleParser);
  });
});
