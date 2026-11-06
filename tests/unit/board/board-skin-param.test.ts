/**
 * The board engine's `SkinParam` slice: `setParam`/`getValue` through
 * `cleanForKey`, the numeric getters' defaults, the sprite registry, and the
 * members the board path never reaches, which throw rather than guess.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java
 */
import { describe, expect, it } from 'vitest';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import { SkinParam } from '../../../src/diagrams/board/board-skin-param.js';
import { parseBoard } from '../../../src/diagrams/board/BoardDiagramFactory.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';

function skinParamOf(entries: readonly (readonly [string, string])[]): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map(entries),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

describe('board SkinParam values', () => {
  it('stores each cleaned key with a trimmed value, and reads it back case-blind (java:227-234, 326-340)', () => {
    const skinParam = skinParamOf([['TabSize', ' 4 ']]);
    expect(skinParam.getValue('tabsize')).toBe('4');
    expect(skinParam.getTabSize()).toBe(4);
    expect([...skinParam.values().values()]).toContain('4');
  });

  it('answers the defaults when a key is unset or not a number', () => {
    const skinParam = skinParamOf([['dpi', 'abc']]);
    expect(skinParam.getDpi()).toBe(96);
    expect(skinParam.getTabSize()).toBe(8);
    expect(skinParam.getMonospacedFamily()).toBe('monospaced');
    expect(skinParam.getValue('nothing')).toBeNull();
    expect(skinParam.getlengthAdjust()).toBeUndefined();
  });

  it('reads dpi, the monospaced family, padding and lengthAdjust', () => {
    const skinParam = skinParamOf([
      ['dpi', '150'],
      ['defaultMonospacedFontName', 'Courier'],
      ['padding', '2.5'],
      ['lengthAdjust', 'none'],
    ]);
    expect(skinParam.getDpi()).toBe(150);
    expect(skinParam.getMonospacedFamily()).toBe('Courier');
    expect(skinParam.getPadding().getTop()).toBe(2.5);
    expect(skinParam.getlengthAdjust()).toBe('none');
  });

  it('treats dpi 0 as the default (java:650-656)', () => {
    expect(skinParamOf([['dpi', '0']]).getDpi()).toBe(96);
  });

  it('copies params in, and passes strings through the size hack and md5 map untouched', () => {
    const skinParam = skinParamOf([]);
    skinParam.copyAllFrom(new Map([['shadowing', 'false']]));
    expect(skinParam.getValue('shadowing')).toBe('false');
    expect(skinParam.transformStringForSizeHack('abc')).toBe('abc');
    expect(skinParam.getFromMd5('d41d8cd9')).toBeNull();
  });

  it('finds a sprite the diagram defined, and none it did not', () => {
    const parsed = parseBoard(
      { lines: ['sprite $s [2x2/4] {', 'FF', 'FF', '}', 'A <$s>'], type: 'board' },
      new PreprocessingArtifact(),
    );
    if ('refused' in parsed) throw new Error(parsed.message);
    expect(parsed.getSkinParam().getSprite('s')).not.toBeNull();
    expect(parsed.getSkinParam().getSprite('missing')).toBeNull();
  });
});

describe('board SkinParam unreached members', () => {
  it.each([
    ['getFontHtmlColor', (s: SkinParam) => s.getFontHtmlColor(undefined)],
    ['getFont', (s: SkinParam) => s.getFont(undefined, false)],
    ['getHyperlinkColor', (s: SkinParam) => s.getHyperlinkColor()],
    ['useUnderlineForHyperlink', (s: SkinParam) => s.useUnderlineForHyperlink()],
    ['getDefaultTextAlignment', (s: SkinParam) => s.getDefaultTextAlignment(HorizontalAlignment.LEFT)],
    ['strictUmlStyle', (s: SkinParam) => s.strictUmlStyle()],
  ] as const)('%s throws unported', (member, call) => {
    expect(() => call(skinParamOf([]))).toThrow(`unported: SkinParam#${member} is not reached by the board engine`);
  });
});
