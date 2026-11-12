/**
 * The four Chen EER leaf images (cheneer T2a) against the jar oracles (`tests/fixtures/cheneer/
 * <slug>.puml`, rendered with `scripts/oracle-render.sh`). Dimensions are the oracle DOT's `width`/`height`
 * x 72 (`svek-1.dot`; the one-leaf probes wrote no DOT, so their diamond is read off the SVG polygon). Each drawn
 * fragment is copied from the oracle SVG; the origin is the node position the renderer translates to, the oracle's
 * own coordinates minus the image's local ones.
 */
import { describe, expect, it } from 'vitest';
import { LeafType } from '../../../../../src/core/abel/LeafType.js';
import { createEntityImageBlockInternal } from '../../../../../src/core/svek/GeneralImageBuilder.js';
import { PortionShower } from '../../../../../src/core/cucadiagram/PortionShower.js';
import { EntityImageChenAttribute } from '../../../../../src/core/svek/image/EntityImageChenAttribute.js';
import { EntityImageChenCircle } from '../../../../../src/core/svek/image/EntityImageChenCircle.js';
import { EntityImageChenEntity } from '../../../../../src/core/svek/image/EntityImageChenEntity.js';
import { EntityImageChenRelationship } from '../../../../../src/core/svek/image/EntityImageChenRelationship.js';
import type { StringBounder } from '../../../../../src/core/klimt/font/StringBounder.js';
import { ShapeType } from '../../../../../src/core/svek/ShapeType.js';
import { drawnBody, leafNamed, parseProbe, testStringBounder } from '../../../../helpers/chen-leaf-images.js';

const sb = testStringBounder();
const DOT_INCH = 72;
const DOT_DIGITS = 6;

/** Inches of an oracle DOT `width=`/`height=` to the points the image answers. */
function inches(image: {
  calculateDimension(sb: StringBounder): { getWidth(): number; getHeight(): number };
}): [number, number] {
  const dim = image.calculateDimension(sb);
  return [dim.getWidth() / DOT_INCH, dim.getHeight() / DOT_INCH];
}

const NO_SHADOW_STYLE = 'style="stroke:#181818;stroke-width:0.5;"';
const DIAMOND_STYLE = 'style="stroke:#181818;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"';

describe('EntityImageChenAttribute (cov-attr-key, cov-attr-multi, cov-attr-derived)', () => {
  it('<<key>>: DOT 0.375225 x 0.316847, an OVAL, the title underlined', () => {
    const d = parseProbe('cov-attr-key');
    const image = new EntityImageChenAttribute(leafNamed(d, 'A/Id'), d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(0.375225, DOT_DIGITS);
    expect(h).toBeCloseTo(0.316847, DOT_DIGITS);
    expect(image.getShapeType()).toBe(ShapeType.OVAL);
    expect(drawnBody(8.17, 6, (ug) => image.drawU(ug))).toBe(
      `<g><ellipse cx="21.678" cy="17.406" rx="13.508" ry="11.406" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        '<text x="15.859" y="22.889" fill="#000" font-size="14" textLength="11.637" text-decoration="underline">Id</text></g>',
    );
  });

  it('<<multi>>: DOT 1.016567 x 0.358319 and the inner ellipse at +3,+3 shrunk by 6', () => {
    const d = parseProbe('cov-attr-multi');
    const image = new EntityImageChenAttribute(leafNamed(d, 'A/Phones'), d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(1.016567, DOT_DIGITS);
    expect(h).toBeCloseTo(0.358319, DOT_DIGITS);
    expect(drawnBody(6, 6, (ug) => image.drawU(ug))).toBe(
      `<g><ellipse cx="42.596" cy="18.899" rx="36.596" ry="12.899" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        `<ellipse cx="42.596" cy="18.899" rx="33.596" ry="9.899" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        '<text x="18.84" y="22.889" fill="#000" font-size="14" textLength="47.513">Phones</text></g>',
    );
  });

  it('<<derived>>: DOT 0.573152 x 0.358319 and stroke-dasharray 10,10', () => {
    const d = parseProbe('cov-attr-derived');
    const image = new EntityImageChenAttribute(leafNamed(d, 'A/Age'), d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(0.573152, DOT_DIGITS);
    expect(h).toBeCloseTo(0.358319, DOT_DIGITS);
    expect(drawnBody(6, 6, (ug) => image.drawU(ug))).toBe(
      '<g><ellipse cx="26.633" cy="18.899" rx="20.633" ry="12.899" fill="#F1F1F1" ' +
        'style="stroke:#181818;stroke-width:0.5;stroke-dasharray:10,10;"/>' +
        '<text x="14.165" y="22.889" fill="#000" font-size="14" textLength="24.938">Age</text></g>',
    );
  });
});

describe('EntityImageChenEntity (cov-attr-key, cov-weak)', () => {
  it('a plain entity: DOT 0.407813 x 0.472222, a RECTANGLE, the title below MARGIN + MARGIN_LINE', () => {
    const d = parseProbe('cov-attr-key');
    const image = new EntityImageChenEntity(leafNamed(d, 'A'), d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(0.407813, DOT_DIGITS);
    expect(h).toBeCloseTo(0.472222, DOT_DIGITS);
    expect(image.getShapeType()).toBe(ShapeType.RECTANGLE);
    expect(drawnBody(7, 88.82, (ug) => image.drawU(ug))).toBe(
      `<g><rect x="7" y="88.82" width="29.363" height="34" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        '<text x="17" y="109.709" fill="#000" font-size="14">A</text></g>',
    );
  });

  it('<<weak>>: DOT 0.418750 x 0.472222 and the inner rectangle at +3,+3, 6 smaller', () => {
    const d = parseProbe('cov-weak');
    const image = new EntityImageChenEntity(leafNamed(d, 'C'), d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(0.41875, DOT_DIGITS);
    expect(h).toBeCloseTo(0.472222, DOT_DIGITS);
    expect(drawnBody(20.34, 91.8, (ug) => image.drawU(ug))).toBe(
      `<g><rect x="20.34" y="91.8" width="30.15" height="34" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        `<rect x="23.34" y="94.8" width="24.15" height="28" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        '<text x="30.34" y="112.689" fill="#000" font-size="14">C</text></g>',
    );
  });

  it('a <<weak>> entity next to a plain one in cov-identifying keeps the plain one single', () => {
    const d = parseProbe('cov-identifying');
    const plain = new EntityImageChenEntity(leafNamed(d, 'P'), d.getSkinParam());
    const weak = new EntityImageChenEntity(leafNamed(d, 'C'), d.getSkinParam());

    expect(drawnBody(7, 176.29, (ug) => plain.drawU(ug))).toBe(
      `<g><rect x="7" y="176.29" width="29.363" height="34" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        '<text x="17" y="197.179" fill="#000" font-size="14">P</text></g>',
    );
    expect(drawnBody(84.61, 176.29, (ug) => weak.drawU(ug))).toBe(
      `<g><rect x="84.61" y="176.29" width="30.15" height="34" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        `<rect x="87.61" y="179.29" width="24.15" height="28" fill="#F1F1F1" ${NO_SHADOW_STYLE}/>` +
        '<text x="94.61" y="197.179" fill="#000" font-size="14">C</text></g>',
    );
  });
});

describe('EntityImageChenRelationship (cov-relationship, cov-identifying)', () => {
  it('a plain relationship: a DIAMOND of aspect ratio 2 whose points equal the oracle polygon', () => {
    const d = parseProbe('cov-relationship');
    const image = new EntityImageChenRelationship(leafNamed(d, 'Owns'), d.getSkinParam());
    const dim = image.calculateDimension(sb);

    expect(image.getShapeType()).toBe(ShapeType.DIAMOND);
    expect(dim.getWidth()).toBeCloseTo(86.148, 3);
    expect(dim.getHeight()).toBeCloseTo(43.074, 3);
    expect(drawnBody(7, 7, (ug) => image.drawU(ug))).toBe(
      '<g><polygon points="7,28.537,50.074,7,93.148,28.537,50.074,50.074" fill="#F1F1F1" ' +
        `${DIAMOND_STYLE}/>` +
        '<text x="32.18" y="32.426" fill="#000" font-size="14" textLength="35.787">Owns</text></g>',
    );
  });

  it('<<identifying>>: DOT 0.980183 x 0.490092 and the inner diamond at +10,+5, delta(-20,-10)', () => {
    const d = parseProbe('cov-identifying');
    const image = new EntityImageChenRelationship(leafNamed(d, 'PO'), d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(0.980183, DOT_DIGITS);
    expect(h).toBeCloseTo(0.490092, DOT_DIGITS);
    expect(drawnBody(25.39, 6, (ug) => image.drawU(ug))).toBe(
      `<g><polygon points="25.39,23.643,60.677,6,95.963,23.643,60.677,41.287" fill="#F1F1F1" ${DIAMOND_STYLE}/>` +
        `<polygon points="35.39,23.643,60.677,11,85.963,23.643,60.677,36.287" fill="#F1F1F1" ${DIAMOND_STYLE}/>` +
        '<text x="50.57" y="27.532" fill="#000" font-size="14" textLength="20.212">PO</text></g>',
    );
  });
});

describe('EntityImageChenCircle (cov-multi-U)', () => {
  it('is a fixed 25x25 OVAL (DOT 0.347222), the colours of the command, the symbol centred', () => {
    const d = parseProbe('cov-multi-U');
    const circle = d.leafs().find((e) => e.getLeafType() === LeafType.CHEN_CIRCLE);
    if (circle === undefined) throw new Error('no circle leaf');
    const image = new EntityImageChenCircle(circle, d.getSkinParam());
    const [w, h] = inches(image);

    expect(w).toBeCloseTo(0.347222, DOT_DIGITS);
    expect(h).toBeCloseTo(0.347222, DOT_DIGITS);
    expect(image.calculateDimension(sb).getWidth()).toBe(25);
    expect(image.getShapeType()).toBe(ShapeType.OVAL);
    expect(drawnBody(44.18, 101, (ug) => image.drawU(ug))).toBe(
      '<g><ellipse cx="56.68" cy="113.5" rx="12.5" ry="12.5" fill="#0F0" style="stroke:#008000;stroke-width:0.5;"/>' +
        '<text x="51.605" y="117.389" fill="#000" font-size="14">U</text></g>',
    );
  });
});

describe('GeneralImageBuilder: the four CHEN_* branches', () => {
  const d = parseProbe('cov-identifying');
  const skinParam = d.getSkinParam();
  const noPolygons = { getNode: () => ({ getPolygon: () => undefined }) };
  const build = (name: string): unknown =>
    createEntityImageBlockInternal(leafNamed(d, name), skinParam, noPolygons, PortionShower.ALL);

  it('answers each leaf type with its own image', () => {
    expect(build('P')).toBeInstanceOf(EntityImageChenEntity);
    expect(build('PO')).toBeInstanceOf(EntityImageChenRelationship);
  });

  it('answers the attribute and circle leaf types', () => {
    const attrs = parseProbe('cov-attr-key');
    const attribute = createEntityImageBlockInternal(
      leafNamed(attrs, 'A/Id'),
      attrs.getSkinParam(),
      noPolygons,
      PortionShower.ALL,
    );
    const circles = parseProbe('cov-multi-U');
    const circle = circles.leafs().find((e) => e.getLeafType() === LeafType.CHEN_CIRCLE);
    if (circle === undefined) throw new Error('no circle leaf');

    expect(attribute).toBeInstanceOf(EntityImageChenAttribute);
    expect(
      createEntityImageBlockInternal(circle, circles.getSkinParam(), noPolygons, PortionShower.ALL),
    ).toBeInstanceOf(EntityImageChenCircle);
  });
});
