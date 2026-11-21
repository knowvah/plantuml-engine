/**
 * `FEntry#calculateDimension` and `FilesListing#calculateDimensionSlow`
 * (`FEntry.java:140-153`, `FilesListing.java:59-69`): `height + 2` below every
 * entry's own block, children `21` further right, `max` of widths, `sum` of
 * heights. Numbers in the last block are the jar's own: the pdiff oracle
 * `dobido-76-nugu008` (185x367 canvas = listing + the 10px margin both sides).
 */
import { describe, it, expect } from 'vitest';
import { parseFiles } from '../../../src/diagrams/files/parser.js';
import { SkinParam } from '../../../src/diagrams/files/files-skin-param.js';
import { FilesIcons } from '../../../src/diagrams/files/files-icons.js';
import { BOX_MARGIN, CONNECTOR_GAP, FilesRow, INDENT, ROW_SPACING } from '../../../src/diagrams/files/files-row.js';
import { Opale } from '../../../src/core/svek/image/Opale.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';

const BOUNDER = new MeasurerStringBounder(new DeterministicMeasurer());
const EMOJI = { assetStore: buildEmojiAssetsStore() };

function diagramOf(lines: string[]): ReturnType<typeof parseFiles>['diagram'] {
  const source: UmlSource = { lines, type: 'files' };
  return parseFiles(source, EMOJI).diagram;
}

const ICONS = new FilesIcons();

function rowOf(lines: string[], index = 0): FilesRow {
  const diagram = diagramOf(lines);
  const entry = diagram.list.getRoot().children[index]!;
  return new FilesRow(diagram.skinParam, ICONS, entry);
}

describe('constants (FilesListing.java:62-72)', () => {
  it('the row spacing is 2, the indent 21, the connector gap 2 and the box margin 2', () => {
    expect([ROW_SPACING, INDENT, CONNECTOR_GAP, BOX_MARGIN]).toEqual([2, 21, 2, 2]);
  });
});

describe('FilesListing dimension (FilesListing.java:82-87)', () => {
  it('an empty listing is the box margin wide and 0 high', () => {
    const dim = diagramOf([]).getTextBlock().calculateDimension(BOUNDER);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([BOX_MARGIN, 0]);
  });

  it('is the jar`s dobido-76-nugu008 listing: 14 rows of 21 + 2 high, 172.85 wide', () => {
    const diagram = diagramOf([
      '/.github/',
      '/src/example.py',
      '/src/iiimple1.py',
      '/tests/example_test.py',
      '/src/wwwmple2.py',
      '/tests/v1/example_test.py',
      '/README.md',
      '/doc/foo/dummy.doc',
      '/LICENSE',
    ]);
    const dim = diagram.getTextBlock().calculateDimension(BOUNDER);
    // oracle svg: 193x343 = listing + 2 * 10 + 1 (ensureVisible), 14 rows of 23.
    expect(dim.getHeight()).toBe(14 * (21 + ROW_SPACING));
    // tests / v1 / example_test.py: x 2 * 21, the 21 wide emoji, a 6 gap, textLength 101.85, + the box margin.
    expect(dim.getWidth()).toBeCloseTo(42 + 21 + 6 + 101.85 + BOX_MARGIN, 2);
  });
});

describe('FilesRow (FilesListing.java:171-276)', () => {
  it('a NOTE entry is drawn as an Opale: wider than its text by the Opale margins; oracle xeseve-00-tipa730 text 72.881', () => {
    const row = rowOf(['<note>', 'this is a note', '</note>']);
    expect(row.calculateDimension(BOUNDER).getWidth()).toBeCloseTo(72.881 + Opale.marginX1 + Opale.marginX2, 3);
    expect(row.getIconCenter(BOUNDER)).toBe(INDENT / 2 - CONNECTOR_GAP);
  });

  it('a folder row is the 21 wide emoji, a 6 gap, then the name (oracle dobido-76-nugu008: `.github` textLength 42)', () => {
    const row = rowOf(['/.github/']);
    expect(row.calculateDimension(BOUNDER).getWidth()).toBeCloseTo(21 + 6 + 42, 3);
    expect(row.calculateDimension(BOUNDER).getHeight()).toBe(21);
    expect(row.getIconCenter(BOUNDER)).toBe(10.5);
  });

  it('a description is written after the name, a 10 gap away', () => {
    const plain = rowOf(['/a.txt']).calculateDimension(BOUNDER).getWidth();
    const described = rowOf(['/a.txt ## xx']).calculateDimension(BOUNDER).getWidth();
    expect(described).toBeGreaterThan(plain + 10);
  });

  it('icon(none) draws no icon: the row is the name alone', () => {
    const row = rowOf(['/a.txt icon(none)']);
    expect(row.getIconCenter(BOUNDER)).toBe(INDENT / 2 - CONNECTOR_GAP);
  });
});

describe('SkinParam members FEntry#createOpale reads (FEntry.java:171-180)', () => {
  const skin = (skinparam: Record<string, string>): SkinParam =>
    new SkinParam({
      style: createMindmapSkinParam({}),
      skinparam: new Map(Object.entries(skinparam)),
      sprites: createSpriteRegistry(),
      pragma: Pragma.createEmpty(),
    });

  it('getDefaultTextAlignment answers the skinparam, else the default (SkinParam.java:731-738)', () => {
    expect(skin({}).getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(HorizontalAlignment.LEFT);
    expect(skin({ defaultTextAlignment: 'center' }).getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(
      HorizontalAlignment.CENTER,
    );
  });

  it('useUnderlineForHyperlink is the simple stroke (SkinParam.java:1057-1061)', () => {
    expect(skin({}).useUnderlineForHyperlink().getThickness()).toBe(1);
  });

  it('getPadding is the skinparam`s, else none (SkinParam.java:1147-1164)', () => {
    expect(skin({}).getPadding().getLeft()).toBe(0);
    expect(skin({ padding: '3' }).getPadding().getLeft()).toBe(3);
  });

  it('getDpi, getTabSize and getMonospacedFamily read their skinparams, else their defaults (SkinParam.java:650-656,1091-1098)', () => {
    expect([skin({}).getDpi(), skin({}).getTabSize(), skin({}).getMonospacedFamily()]).toEqual([96, 8, 'monospaced']);
    expect([skin({ dpi: '300' }).getDpi(), skin({ dpi: '0' }).getDpi()]).toEqual([300, 96]);
    expect(skin({ tabSize: '4' }).getTabSize()).toBe(4);
    expect(skin({ defaultMonospacedFontName: 'Courier' }).getMonospacedFamily()).toBe('Courier');
  });

  it('getlengthAdjust answers the skinparam, undefined when unset (SkinParam.java:1258-1269)', () => {
    expect(skin({}).getlengthAdjust()).toBeUndefined();
    expect(skin({ lengthAdjust: 'none' }).getlengthAdjust()).toBe('none');
  });

  it('values/copyAllFrom hold the cleaned keys; getValue reads them back (SkinParam.java:213-225,326-340)', () => {
    const param = skin({ Shadowing: ' true ' });
    expect(param.getValue('shadowing')).toBe('true');
    param.copyAllFrom(new Map([['other', 'x']]));
    expect(param.values().get('other')).toBe('x');
    expect(param.getValue('absent')).toBeNull();
  });

  it('no md5 map, no size hack, no sprites, and the default guillemets', () => {
    const param = skin({});
    expect(param.getFromMd5('abc')).toBeNull();
    expect(param.transformStringForSizeHack('s')).toBe('s');
    expect(param.getSprite('nope')).toBeNull();
    expect(param.guillemet()).toEqual({ start: '\u00AB', end: '\u00BB' });
  });

  it('answers `unported` for the members the files path never reaches', () => {
    const param = skin({});
    expect(() => param.getFontHtmlColor(undefined)).toThrow('unported: SkinParam#getFontHtmlColor');
    expect(() => param.getFont(undefined, false)).toThrow('unported: SkinParam#getFont');
    expect(() => param.getHyperlinkColor()).toThrow('unported: SkinParam#getHyperlinkColor');
    expect(() => param.strictUmlStyle()).toThrow('unported: SkinParam#strictUmlStyle');
  });
});
