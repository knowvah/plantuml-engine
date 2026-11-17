/**
 * dei-T2a: the core `EntityImageJson` + `TextBlockCucaJSon` port. Expected values are the jar's, from
 * `oracle/goldens/svg-description/component/dei-json-top/golden.svg` (the json box drawn at 7,115) and
 * `dei-json-group` (a stereotype over the name).
 */
import { describe, expect, it } from 'vitest';
import type { JsonNode } from '../../../../../src/core/command/JsonNode.js';
import { parseJsonNode } from '../../../../../src/core/command/CommandCreateJson.js';
import {
  EntityImageJson,
  JSON_HEADER_STYLE_SIGNATURE,
  JSON_STYLE_SIGNATURE,
  type EntityImageJsonParams,
} from '../../../../../src/core/svek/image/EntityImageJson.js';
import { ShapeType } from '../../../../../src/core/svek/ShapeType.js';
import { loadSkin } from '../../../../../src/core/style/StyleLoader.js';
import { FontStyle } from '../../../../../src/core/klimt/shape/UText.js';
import { drawnBody } from '../../../../helpers/chen-leaf-images.js';
import { testStringBounder } from '../../../../helpers/legacy-leaf-images.js';

const BUILDER = loadSkin('plantuml.skin');
const STYLE = JSON_STYLE_SIGNATURE.getMergedStyle(BUILDER)!;
const STYLE_HEADER = JSON_HEADER_STYLE_SIGNATURE.getMergedStyle(BUILDER)!;
const STEREO_FONT = {
  family: 'SansSerif',
  size: 12,
  styles: new Set([FontStyle.ITALIC]),
  color: '#000000',
} as unknown as EntityImageJsonParams['stereoFont'];
const ENTITY = { name: 'J', qualifiedName: 'J', uid: 'ent0002', location: { position: 2 } };

/** `dei-json-top`'s body. */
const TOP = parseJsonNode('{"name": "x", "list": [1, 2, 3], "inner": { "a": true, "b": null }}')!;

function image(json: JsonNode | undefined, stereoLabels?: readonly string[]): EntityImageJson {
  return new EntityImageJson({
    entity: ENTITY,
    display: 'J',
    stereoLabels,
    json,
    style: STYLE,
    styleHeader: STYLE_HEADER,
    stereoFont: STEREO_FONT,
  });
}

describe('EntityImageJson#calculateDimension (EntityImageJson.java:123-137)', () => {
  it('sizes dei-json-top as the jar does: 96.85 x 126', () => {
    const dim = image(TOP).calculateDimension(testStringBounder());
    expect(dim.getWidth()).toBeCloseTo(96.85, 3);
    expect(dim.getHeight()).toBe(126);
  });

  it('falls back to marginEmptyFieldsOrMethod = 13 for an empty object (EntityImageJson.java:217-223)', () => {
    const img = image({ kind: 'object', entries: [] });
    const title = img.getTitleHeight(testStringBounder());
    expect(img.calculateDimension(testStringBounder()).getHeight()).toBe(title + 13);
  });

  it('answers RECTANGLE_HTML_FOR_PORTS (EntityImageJson.java:241-243)', () => {
    expect(image(TOP).getShapeType()).toBe(ShapeType.RECTANGLE_HTML_FOR_PORTS);
  });
});

describe('EntityImageJson#drawU (EntityImageJson.java:154-215, TextBlockCucaJSon.java:161-224)', () => {
  const svg = drawnBody(7, 115, (ug) => image(TOP).drawU(ug));

  it('opens the entity group with no comment, then the rounded box', () => {
    expect(svg.startsWith('<g class="entity" data-qualified-name="J" id="ent0002" data-source-line="2">')).toBe(true);
    expect(svg).toContain(
      '<rect x="7" y="115" width="96.85" height="126" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;" rx="2.5" ry="2.5"/>',
    );
  });

  it('draws the object vline, then per member its hline, key and value, at the jar coordinates', () => {
    const lines = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)].map((m) =>
      m.slice(1, 5).join(','),
    );
    expect(lines).toEqual([
      '52,133,52,241',
      '7,133,103.85,133',
      '7,151,103.85,151',
      '52,169,103.85,169',
      '52,187,103.85,187',
      '7,205,103.85,205',
      '69.787,205,69.787,241',
      '52,205,103.85,205',
      '52,223,103.85,223',
    ]);
  });

  it('places the cells flush-left inside their 5,2 margins', () => {
    const texts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)</g)].map(
      (m) => `${m[3]}@${m[1]},${m[2]}`,
    );
    expect(texts).toEqual([
      'J@51.925,127.889',
      'name@12,145.889',
      'x@57,145.889',
      'list@12,163.889',
      '1@57,163.889',
      '2@57,181.889',
      '3@57,199.889',
      'inner@12,217.889',
      'a@57,217.889',
      'true@74.787,217.889',
      'b@57,235.889',
      'null@74.787,235.889',
    ]);
  });

  it('draws the dividers with the default stroke, not the box stroke (UGraphicStencil only re-strokes hlines)', () => {
    expect(svg).toContain('<line x1="52" y1="133" x2="52" y2="241" style="stroke:#181818;stroke-width:1;"/>');
  });
});

describe('EntityImageJson stereotype, colours and stencil (EntityImageJson.java:98-105,160-197,244-250)', () => {
  /** `dei-json-group`'s `json J <<data>> { "k": "v", "n": 2 }`, drawn at 125,48. */
  const GROUP = parseJsonNode('{"k": "v", "n": 2}')!;

  it('stacks the stereotype over the name and widens nothing else: 46.675 x 66', () => {
    const img = image(GROUP, ['«data»']);
    const dim = img.calculateDimension(testStringBounder());
    expect(dim.getWidth()).toBeCloseTo(46.675, 3);
    expect(dim.getHeight()).toBe(66);
    const svg = drawnBody(125, 48, (ug) => img.drawU(ug));
    expect(svg).toContain(
      '<text x="130" y="57.333" fill="#000" font-size="12" textLength="36.675" font-style="italic">«data»</text>',
    );
    expect(svg).toContain('<text x="144.837" y="72.889" fill="#000" font-size="14">J</text>');
  });

  it('draws the half-rounded header only when the header colour differs from the back (:193-197)', () => {
    const plain = drawnBody(0, 0, (ug) => image(GROUP).drawU(ug));
    expect(plain.match(/<rect /g)).toHaveLength(1);
    const header = new EntityImageJson({
      entity: ENTITY,
      display: 'J',
      stereoLabels: undefined,
      json: GROUP,
      style: STYLE,
      styleHeader: STYLE_HEADER,
      stereoFont: STEREO_FONT,
      backColor: '#FFFFFF',
      headerBackColor: '#FF0000',
    });
    const svg = drawnBody(0, 0, (ug) => header.drawU(ug));
    expect(svg).toContain('fill="#FFF"');
    expect(svg).toContain(
      '<path d="M2.5,0 L33.075,0 A2.5,2.5 0 0 1 35.575,2.5 L35.575,18 L0,18 L0,2.5 A2.5,2.5 0 0 1 2.5,0" style="stroke:#181818;stroke-width:0.5;" fill="#F00"/>',
    );
  });

  it('keeps one rect when only the back colour is given: the header takes it (:184-186)', () => {
    const backOnly = new EntityImageJson({
      entity: ENTITY,
      display: 'J',
      stereoLabels: undefined,
      json: GROUP,
      style: STYLE,
      styleHeader: STYLE_HEADER,
      stereoFont: STEREO_FONT,
      backColor: '#ADD8E6',
    });
    const svg = drawnBody(0, 0, (ug) => backOnly.drawU(ug));
    expect(svg.match(/<rect /g)).toHaveLength(1);
    expect(svg).toContain('fill="#ADD8E6"');
  });

  it('draws no entries for a json whose data never parsed, sized by the 13 fallback', () => {
    const img = image(undefined);
    const title = img.getTitleHeight(testStringBounder());
    expect(img.calculateDimension(testStringBounder()).getHeight()).toBe(title + 13);
    expect(drawnBody(0, 0, (ug) => img.drawU(ug))).not.toContain('<line');
  });

  it('is its own stencil: 0 to the box width at any y (:244-250)', () => {
    const img = image(TOP);
    expect(img.getStartingX(testStringBounder(), 40)).toBe(0);
    expect(img.getEndingX(testStringBounder(), 40)).toBeCloseTo(96.85, 3);
  });
});
