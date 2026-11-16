/**
 * dei-T3a: the core `BodierMap`, `TextBlockMap` and `EntityImageMap` ports. Expected values are the jar's, from
 * `test-results/dot-cache/unknown/liripi-72-kefa167/in.svg` (the map drawn at 54.5,121.611) and the authored
 * `dei-map-link` golden.
 */
import { describe, expect, it } from 'vitest';
import { BodierMap } from '../../../../../src/core/cucadiagram/BodierMap.js';
import {
  EntityImageMap,
  MAP_HEADER_STYLE_SIGNATURE,
  MAP_STYLE_SIGNATURE,
  type EntityImageMapParams,
} from '../../../../../src/core/svek/image/EntityImageMap.js';
import { ShapeType } from '../../../../../src/core/svek/ShapeType.js';
import { Ports } from '../../../../../src/core/svek/Ports.js';
import { loadSkin } from '../../../../../src/core/style/StyleLoader.js';
import { FontStyle } from '../../../../../src/core/klimt/shape/UText.js';
import { drawnBody } from '../../../../helpers/chen-leaf-images.js';
import { testStringBounder } from '../../../../helpers/legacy-leaf-images.js';

const BUILDER = loadSkin('plantuml.skin');
const STYLE = MAP_STYLE_SIGNATURE.getMergedStyle(BUILDER)!;
const STYLE_HEADER = MAP_HEADER_STYLE_SIGNATURE.getMergedStyle(BUILDER)!;
const STEREO_FONT = {
  family: 'SansSerif',
  size: 12,
  styles: new Set([FontStyle.ITALIC]),
  color: '#000000',
} as unknown as EntityImageMapParams['stereoFont'];
const ENTITY = { name: 'maps', qualifiedName: 'attribute_mapper.mapper_engine.maps', uid: 'ent0005', location: null };

function rowsOf(...lines: string[]): ReadonlyMap<string, string> {
  const bodier = new BodierMap();
  for (const line of lines) expect(bodier.addFieldOrMethod(line)).toBe(true);
  return bodier.getMap();
}

/** `liripi`'s body. */
const LIRIPI = rowsOf("Rule 1 => r'1 =  2 * r'2", "Rule 2 => d'2 =  d'1 / 2", "Rule 3 => r'3 =  r'4 + r'2");

function image(map: ReadonlyMap<string, string>, extra: Partial<EntityImageMapParams> = {}): EntityImageMap {
  return new EntityImageMap({
    entity: ENTITY,
    display: 'Mappings',
    stereoLabels: undefined,
    map,
    style: STYLE,
    styleHeader: STYLE_HEADER,
    stereoFont: STEREO_FONT,
    ...extra,
  });
}

describe('BodierMap#getMap (BodierMap.java:55,71-85)', () => {
  it('keeps the trimmed key and value of each => row, inner spaces included', () => {
    expect([...LIRIPI]).toEqual([
      ['Rule 1', "r'1 =  2 * r'2"],
      ['Rule 2', "d'2 =  d'1 / 2"],
      ['Rule 3', "r'3 =  r'4 + r'2"],
    ]);
  });

  it('stores a linked row with the NUL value', () => {
    expect([...rowsOf('second *-> C')]).toEqual([['second', String.fromCharCode(0)]]);
  });
});

describe('EntityImageMap#calculateDimension (EntityImageMap.java:124-135)', () => {
  it("sizes liripi's map as the jar does: 141.625 x 72", () => {
    const dim = image(LIRIPI).calculateDimension(testStringBounder());
    expect(dim.getWidth()).toBeCloseTo(141.625, 3);
    expect(dim.getHeight()).toBe(72);
  });

  it('adds no height for an empty body (the 13 fallback skips LeafType.MAP, :222-228)', () => {
    expect(image(new Map()).calculateDimension(testStringBounder()).getHeight()).toBe(18);
  });

  it('answers RECTANGLE_HTML_FOR_PORTS and is its own stencil (:245-255)', () => {
    const img = image(LIRIPI);
    expect(img.getShapeType()).toBe(ShapeType.RECTANGLE_HTML_FOR_PORTS);
    expect(img.getStartingX(testStringBounder(), 3)).toBe(0);
    expect(img.getEndingX(testStringBounder(), 3)).toBeCloseTo(141.625, 3);
  });
});

describe('EntityImageMap#getPorts (EntityImageMap.java:116-119, TextBlockMap.java:93-106)', () => {
  it('reports one 18px band per key, below the 18px title', () => {
    const ports = image(rowsOf('first => one', 'second *-> C')).getPorts(testStringBounder());
    expect(ports.getAllPortGeometry().map((g) => [g.getId(), g.getPosition(), g.getHeight()])).toEqual([
      [Ports.encodePortNameToId('first'), 18, 18],
      [Ports.encodePortNameToId('second'), 36, 18],
    ]);
  });
});

describe('EntityImageMap#drawU (EntityImageMap.java:151-220, TextBlockMap.java:130-155)', () => {
  const svg = drawnBody(54.5, 121.611, (ug) => image(LIRIPI, { backColor: '#ACFFA0' }).drawU(ug));

  it('draws the box in the back colour with the 0.5 border, and no separate header', () => {
    expect(svg).toContain(
      '<rect x="54.5" y="121.611" width="141.625" height="72" fill="#ACFFA0" style="stroke:#181818;stroke-width:0.5;" rx="2.5" ry="2.5"/>',
    );
    expect(svg.match(/<rect /g)).toHaveLength(1);
  });

  it('draws per row the full-width line, the centred key, the value, then the column line', () => {
    const items = [...svg.matchAll(/<(line|text) ([^>]*)>([^<]*)/g)].map((m) =>
      m[1] === 'line'
        ? /x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/.exec(m[2]!)!.slice(1).join(',')
        : `${m[3]}@${/x="([\d.]+)" y="([\d.]+)"/.exec(m[2]!)!.slice(1).join(',')}`,
    );
    expect(items.slice(0, 6)).toEqual([
      'Mappings@94.95,134.5',
      '54.5,139.611,196.125,139.611',
      'Rule 1@59.5,152.5',
      "r'1 =  2 * r'2@110.013,152.5",
      '105.013,139.611,105.013,157.611',
      '54.5,157.611,196.125,157.611',
    ]);
  });

  it('gives a linked row its key across the whole width and draws no point (TextBlockMap.java:142-144)', () => {
    const linked = drawnBody(7, 7, (ug) => image(rowsOf('first => one', 'second *-> C'), { display: 'M' }).drawU(ug));
    expect(linked).toContain('<text x="28.681" y="55.889" fill="#000" font-size="14" textLength="45.15">second</text>');
    expect(linked).not.toContain('<ellipse');
    expect(linked.match(/<line /g)).toHaveLength(3);
  });

  it('borders with the entity LINE colour when given (EntityImageMap.java:166-167)', () => {
    const red = drawnBody(0, 0, (ug) => image(LIRIPI, { lineColor: '#FF0000' }).drawU(ug));
    expect(red).toContain('style="stroke:#F00;stroke-width:0.5;"');
  });
});
