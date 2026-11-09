/**
 * The legacy activity leaf images (laep T2a), against the jar's oracles. Every expected fragment is copied
 * from the cached oracle SVG named on its row; positions are the node origins the renderer translates to
 * (the oracle's own coordinates minus the image's local ones). Dimensions are the oracle DOT's
 * `width`/`height` x 72.
 */
import { describe, expect, it } from 'vitest';
import { Margins } from '../../../../../src/core/svek/image/EntityImageDescriptionSupport.js';
import { ShapeType } from '../../../../../src/core/svek/ShapeType.js';
import { PortionShower } from '../../../../../src/core/cucadiagram/PortionShower.js';
import { createEntityImageBlockInternal } from '../../../../../src/core/svek/GeneralImageBuilder.js';
import { EntityImageActivity, type NodePolygons } from '../../../../../src/core/svek/image/EntityImageActivity.js';
import { EntityImageBranch } from '../../../../../src/core/svek/image/EntityImageBranch.js';
import { EntityImageCircleEnd } from '../../../../../src/core/svek/image/EntityImageCircleEnd.js';
import { EntityImageCircleStart } from '../../../../../src/core/svek/image/EntityImageCircleStart.js';
import { EntityImageNote } from '../../../../../src/core/svek/image/EntityImageNote.js';
import { EntityImageSynchroBar } from '../../../../../src/core/svek/image/EntityImageSynchroBar.js';
import { LeafType } from '../../../../../src/core/abel/LeafType.js';
import { Rankdir } from '../../../../../src/core/klimt/geom/Rankdir.js';
import { UPolygon } from '../../../../../src/core/klimt/shape/UPolygon.js';
import { drawnAt, leafNamed, parseLegacy, testStringBounder } from '../../../../helpers/legacy-leaf-images.js';

const NO_POLYGONS: NodePolygons = { getNode: () => ({ getPolygon: () => undefined }) };

/** `test-results/dot-cache/activity/bokuba-91-poda774/in.puml` (oracle `in.svg`, DOT `svek-1.dot`). */
const BOKUBA = `@startuml
(*) --> VerifyReservation
--> ===Y1===

--> ===Y2===

--> GiveTravelDocumentation
--> (*)
@enduml`;

/** Probe `lap-if-else`. */
const IF_ELSE = `@startuml
(*) --> "check"
if "ok?" then
  -->[true] "yes"
  --> (*)
else
  -->[false] "no"
  --> (*)
endif
@enduml`;

/** Probe `lap-skinparam` minus its six skinparam lines (the preprocessor strips them). */
const SKINPARAM_BODY = `@startuml
(*) --> ===B===
--> if "c" then
 --> A
else
 --> B
endif
B --> (*)
@enduml`;
const SKINPARAMS = new Map([
  ['activityBackgroundColor', '#EEEEEE'],
  ['activityBorderColor', '#333333'],
  ['activityStartColor', 'red'],
  ['activityEndColor', 'blue'],
  ['activityBarColor', 'green'],
  ['activityDiamondBackgroundColor', 'pink'],
]);
const SKINPARAM_FIRST_LINE = 7;

/** Probe `lap-style`. */
const STYLE_BODY = `@startuml
(*) --> A
A --> (*)
@enduml`;
const STYLE_BLOCK = `activityDiagram {
  activity { BackgroundColor #DDEEFF }
  arrow { LineColor #FF0000 }
}`;
const STYLE_FIRST_LINE = 7;

const sb = testStringBounder();

describe('bokuba-91 (oracle in.svg, svek-1.dot)', () => {
  const diagram = parseLegacy(BOKUBA);
  const skinParam = diagram.getSkinParam();

  it('EntityImageCircleStart is 20x20 and draws the #222 ellipse in a start_entity group', () => {
    const image = new EntityImageCircleStart(leafNamed(diagram, 'start'), skinParam);

    expect(image.calculateDimension(sb).getWidth()).toBe(20);
    expect(image.calculateDimension(sb).getHeight()).toBe(20);
    expect(image.getShapeType()).toBe(ShapeType.CIRCLE);
    expect(drawnAt(76.37, 6, (ug) => image.drawU(ug))).toBe(
      '<g class="start_entity" data-qualified-name="start" id="ent0001" data-source-line="1">' +
        '<ellipse cx="86.37" cy="16" rx="10" ry="10" fill="#222" style="stroke:#222;stroke-width:1;"/></g>',
    );
  });

  it('EntityImageCircleEnd is 22x22 and draws the 11/6 pair in an end_entity group', () => {
    const image = new EntityImageCircleEnd(leafNamed(diagram, 'end'), skinParam);

    expect(image.calculateDimension(sb).getWidth()).toBe(22);
    expect(image.calculateDimension(sb).getHeight()).toBe(22);
    expect(image.getShapeType()).toBe(ShapeType.CIRCLE);
    expect(drawnAt(75.37, 306, (ug) => image.drawU(ug))).toBe(
      '<g class="end_entity" data-qualified-name="end" id="ent0010" data-source-line="7">' +
        '<ellipse cx="86.37" cy="317" rx="11" ry="11" fill="none" style="stroke:#222;stroke-width:1.5;"/>' +
        '<ellipse cx="86.37" cy="317" rx="6" ry="6" fill="#222" style="stroke:#222;stroke-width:1;"/></g>',
    );
  });

  it('EntityImageSynchroBar is 80x8 and draws an #555 rect with no group', () => {
    const image = new EntityImageSynchroBar(leafNamed(diagram, 'Y1'), skinParam);

    expect(image.calculateDimension(sb).getWidth()).toBe(80);
    expect(image.calculateDimension(sb).getHeight()).toBe(8);
    expect(image.getShapeType()).toBe(ShapeType.RECTANGLE);
    expect(drawnAt(46.38, 138, (ug) => image.drawU(ug))).toBe(
      '<rect x="46.38" y="138" width="80" height="8" fill="#555" style="stroke:none;"/>',
    );
  });

  it('EntityImageActivity is 114.725x32 and draws rx=12.5 rect and text outside any group (D9)', () => {
    const image = new EntityImageActivity(leafNamed(diagram, 'VerifyReservation'), skinParam, NO_POLYGONS);

    expect(image.calculateDimension(sb).getWidth()).toBeCloseTo(114.725, 3);
    expect(image.calculateDimension(sb).getHeight()).toBe(32);
    expect(image.getShapeType()).toBe(ShapeType.ROUND_RECTANGLE);
    expect(drawnAt(29.01, 66, (ug) => image.drawU(ug))).toBe(
      '<rect x="29.01" y="66" width="114.725" height="32" fill="#F1F1F1" ' +
        'style="stroke:#181818;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
        '<text x="39.01" y="85.333" fill="#000" font-size="12" textLength="94.725">VerifyReservation</text>',
    );
  });

  it('draws the longer activity at the oracle position (GiveTravelDocumentation, 158.75x32)', () => {
    const image = new EntityImageActivity(leafNamed(diagram, 'GiveTravelDocumentation'), skinParam, NO_POLYGONS);

    expect(image.calculateDimension(sb).getWidth()).toBeCloseTo(158.75, 3);
    expect(drawnAt(7, 234, (ug) => image.drawU(ug))).toBe(
      '<rect x="7" y="234" width="158.75" height="32" fill="#F1F1F1" ' +
        'style="stroke:#181818;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
        '<text x="17" y="253.333" fill="#000" font-size="12" textLength="138.75">GiveTravelDocumentation</text>',
    );
  });
});

describe('lap-if-else', () => {
  const diagram = parseLegacy(IF_ELSE);
  const skinParam = diagram.getSkinParam();

  it('EntityImageBranch is 24x24 (DOT 0.333333) and draws the diamond in an entity group with no source line', () => {
    const image = new EntityImageBranch(leafNamed(diagram, '#4'), skinParam);

    expect(image.calculateDimension(sb).getWidth()).toBe(24);
    expect(image.calculateDimension(sb).getHeight()).toBe(24);
    expect(image.getShapeType()).toBe(ShapeType.DIAMOND);
    expect(drawnAt(42.34, 140, (ug) => image.drawU(ug))).toBe(
      '<g class="entity" data-qualified-name=".4" id="ent0005">' +
        '<polygon points="54.34,140,66.34,152,54.34,164,42.34,152,54.34,140" fill="#F1F1F1" ' +
        'style="stroke:#181818;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/></g>',
    );
  });
});

describe('lap-skinparam: the colours each image reads', () => {
  const diagram = parseLegacy(SKINPARAM_BODY, { skinparam: SKINPARAMS }, SKINPARAM_FIRST_LINE);
  const skinParam = diagram.getSkinParam();

  it('activityStartColor red fills the start circle, the line stays #222', () => {
    const image = new EntityImageCircleStart(leafNamed(diagram, 'start'), skinParam);

    expect(drawnAt(37, 6, (ug) => image.drawU(ug))).toBe(
      '<g class="start_entity" data-qualified-name="start" id="ent0001" data-source-line="7">' +
        '<ellipse cx="47" cy="16" rx="10" ry="10" fill="#F00" style="stroke:#222;stroke-width:1;"/></g>',
    );
  });

  it('activityEndColor blue is the end circle line, the core stays #222', () => {
    const image = new EntityImageCircleEnd(leafNamed(diagram, 'end'), skinParam);

    expect(drawnAt(79, 115, (ug) => image.drawU(ug))).toBe(
      '<g class="end_entity" data-qualified-name="end" id="ent0010" data-source-line="13">' +
        '<ellipse cx="90" cy="126" rx="11" ry="11" fill="none" style="stroke:#00F;stroke-width:1.5;"/>' +
        '<ellipse cx="90" cy="126" rx="6" ry="6" fill="#222" style="stroke:#00F;stroke-width:1;"/></g>',
    );
  });

  it('activityBarColor green fills the bar', () => {
    const image = new EntityImageSynchroBar(leafNamed(diagram, 'B'), skinParam);

    expect(drawnAt(7, 66, (ug) => image.drawU(ug))).toBe(
      '<rect x="7" y="66" width="80" height="8" fill="#008000" style="stroke:none;"/>',
    );
  });

  it('activityDiamondBackgroundColor pink fills the diamond; the border is activityBorderColor', () => {
    const image = new EntityImageBranch(leafNamed(diagram, '#4'), skinParam);

    expect(drawnAt(35, 114, (ug) => image.drawU(ug))).toBe(
      '<g class="entity" data-qualified-name=".4" id="ent0005">' +
        '<polygon points="47,114,59,126,47,138,35,126,47,114" fill="#FFC0CB" ' +
        'style="stroke:#333;stroke-width:0.5;stroke-linejoin:miter;stroke-miterlimit:10;"/></g>',
    );
  });

  it('activityBackgroundColor and activityBorderColor colour the activity', () => {
    const image = new EntityImageActivity(leafNamed(diagram, 'A'), skinParam, NO_POLYGONS);

    expect(drawnAt(32.99, 178, (ug) => image.drawU(ug))).toBe(
      '<rect x="32.99" y="178" width="28.025" height="32" fill="#EEE" ' +
        'style="stroke:#333;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
        '<text x="42.99" y="197.333" fill="#000" font-size="12">A</text>',
    );
  });
});

describe('lap-style: <style> activityDiagram { activity { BackgroundColor #DDEEFF } }', () => {
  const diagram = parseLegacy(STYLE_BODY, { styles: [STYLE_BLOCK] }, STYLE_FIRST_LINE);
  const skinParam = diagram.getSkinParam();

  it('the style fills the activity; start and end keep their defaults', () => {
    const activity = new EntityImageActivity(leafNamed(diagram, 'A'), skinParam, NO_POLYGONS);
    const start = new EntityImageCircleStart(leafNamed(diagram, 'start'), skinParam);

    expect(drawnAt(7, 66, (ug) => activity.drawU(ug))).toBe(
      '<rect x="7" y="66" width="28.025" height="32" fill="#DEF" ' +
        'style="stroke:#181818;stroke-width:0.5;" rx="12.5" ry="12.5"/>' +
        '<text x="17" y="85.333" fill="#000" font-size="12">A</text>',
    );
    expect(drawnAt(11.01, 6, (ug) => start.drawU(ug))).toBe(
      '<g class="start_entity" data-qualified-name="start" id="ent0001" data-source-line="7">' +
        '<ellipse cx="21.01" cy="16" rx="10" ry="10" fill="#222" style="stroke:#222;stroke-width:1;"/></g>',
    );
  });
});

describe('EntityImageSynchroBar in left to right', () => {
  it('is 8x80 (oracle DOT 0.111111 x 1.111111) and draws that rect', () => {
    const diagram = parseLegacy(BOKUBA);
    const skinParam = diagram.getSkinParam();
    skinParam.setRankdir(Rankdir.LEFT_TO_RIGHT);
    const image = new EntityImageSynchroBar(leafNamed(diagram, 'Y1'), skinParam);

    expect(image.calculateDimension(sb).getWidth()).toBe(8);
    expect(image.calculateDimension(sb).getHeight()).toBe(80);
    expect(drawnAt(66, 7, (ug) => image.drawU(ug))).toBe(
      '<rect x="66" y="7" width="8" height="80" fill="#555" style="stroke:none;"/>',
    );
  });
});

describe('EntityImageActivity shapes', () => {
  /** Probe `activityShape octagon` (`/tmp/laep-T2a/octagon`): the node polygon, local to (16, 66). */
  const OCTAGON_POINTS: readonly (readonly [number, number])[] = [
    [28.02, 22.63],
    [28.02, 9.37],
    [19.82, 0],
    [8.21, 0],
    [0, 9.37],
    [0, 22.63],
    [8.21, 32],
    [19.82, 32],
    [28.02, 22.63],
  ];

  it('activityShape octagon selects ShapeType.OCTAGON and draws the node polygon with a 1.5 stroke', () => {
    const diagram = parseLegacy('@startuml\n(*) --> A\n@enduml', {
      skinparam: new Map([['activityShape', 'octagon']]),
    });
    const polygon = new UPolygon();
    for (const [x, y] of OCTAGON_POINTS) polygon.addPoint(x, y);
    const image = new EntityImageActivity(leafNamed(diagram, 'A'), diagram.getSkinParam(), {
      getNode: () => ({ getPolygon: () => polygon }),
    });

    expect(image.getShapeType()).toBe(ShapeType.OCTAGON);
    expect(drawnAt(16, 66, (ug) => image.drawU(ug))).toBe(
      '<polygon points="44.02,88.63,44.02,75.37,35.82,66,24.21,66,16,75.37,16,88.63,24.21,98,35.82,98,44.02,88.63" ' +
        'fill="#F1F1F1" style="stroke:#181818;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>' +
        '<text x="26" y="85.333" fill="#000" font-size="12">A</text>',
    );
  });

  it('falls back to the rounded rect when the node has no polygon (drawOctagon, polygon == null)', () => {
    const diagram = parseLegacy('@startuml\n(*) --> A\n@enduml', {
      skinparam: new Map([['activityShape', 'octagon']]),
    });
    const image = new EntityImageActivity(leafNamed(diagram, 'A'), diagram.getSkinParam(), NO_POLYGONS);

    expect(drawnAt(7, 66, (ug) => image.drawU(ug))).toContain('rx="12.5" ry="12.5"');
  });

  it('activityShape roundedbox and an unset shape both select ROUND_RECTANGLE', () => {
    const rounded = parseLegacy('@startuml\n(*) --> A\n@enduml', {
      skinparam: new Map([['activityShape', 'roundedbox']]),
    });
    const unset = parseLegacy('@startuml\n(*) --> A\n@enduml');

    expect(new EntityImageActivity(leafNamed(rounded, 'A'), rounded.getSkinParam(), NO_POLYGONS).getShapeType()).toBe(
      ShapeType.ROUND_RECTANGLE,
    );
    expect(new EntityImageActivity(leafNamed(unset, 'A'), unset.getSkinParam(), NO_POLYGONS).getShapeType()).toBe(
      ShapeType.ROUND_RECTANGLE,
    );
  });
});

describe('per-entity colour and stereotype', () => {
  it("an activity's own #colour wins over the style's BackGroundColor", () => {
    const diagram = parseLegacy('@startuml\n(*) --> A #pink\n@enduml');
    const image = new EntityImageActivity(leafNamed(diagram, 'A'), diagram.getSkinParam(), NO_POLYGONS);

    expect(drawnAt(0, 0, (ug) => image.drawU(ug))).toContain('fill="#FFC0CB" style="stroke:#181818;stroke-width:0.5;"');
  });

  it('activityShape<<oct>> octagon applies to a stereotyped activity only', () => {
    const diagram = parseLegacy('@startuml\n(*) --> A <<oct>>\nA --> B\n@enduml', {
      skinparam: new Map([['activityShape<<oct>>', 'octagon']]),
    });
    const stereotyped = new EntityImageActivity(leafNamed(diagram, 'A'), diagram.getSkinParam(), NO_POLYGONS);
    const plain = new EntityImageActivity(leafNamed(diagram, 'B'), diagram.getSkinParam(), NO_POLYGONS);

    expect(stereotyped.getShapeType()).toBe(ShapeType.OCTAGON);
    expect(plain.getShapeType()).toBe(ShapeType.ROUND_RECTANGLE);
  });
});

describe('createEntityImageBlockInternal (GeneralImageBuilder.java:104-189)', () => {
  const diagram = parseLegacy(IF_ELSE);
  const skinParam = diagram.getSkinParam();
  const build = (name: string): unknown =>
    createEntityImageBlockInternal(leafNamed(diagram, name), skinParam, NO_POLYGONS, PortionShower.ALL);

  it('maps each legacy leaf type to its image', () => {
    expect(build('start')).toBeInstanceOf(EntityImageCircleStart);
    expect(build('end')).toBeInstanceOf(EntityImageCircleEnd);
    expect(build('check')).toBeInstanceOf(EntityImageActivity);
    expect(build('#4')).toBeInstanceOf(EntityImageBranch);
  });

  it('maps a bar leaf to EntityImageSynchroBar', () => {
    const bars = parseLegacy(BOKUBA);
    const image = createEntityImageBlockInternal(
      leafNamed(bars, 'Y1'),
      bars.getSkinParam(),
      NO_POLYGONS,
      PortionShower.ALL,
    );

    expect(image).toBeInstanceOf(EntityImageSynchroBar);
  });

  it('maps a note leaf to EntityImageNote', () => {
    const noted = parseLegacy('@startuml\n(*) --> A\nnote right: n\n@enduml');
    const note = noted.leafs().find((e) => e.getLeafType() === 'NOTE')!;

    expect(createEntityImageBlockInternal(note, noted.getSkinParam(), NO_POLYGONS, PortionShower.ALL)).toBeInstanceOf(
      EntityImageNote,
    );
  });

  it('refuses a leaf type outside the legacy set, naming the type', () => {
    const noted = parseLegacy('@startuml\n(*) --> A\nnote right: n\n@enduml');
    const note = noted.leafs().find((e) => e.getLeafType() === 'NOTE')!;
    note.muteToType(LeafType.CIRCLE);

    expect(() => createEntityImageBlockInternal(note, noted.getSkinParam(), NO_POLYGONS, PortionShower.ALL)).toThrow(
      'unported: GeneralImageBuilder has no image for leaf type CIRCLE yet',
    );
  });
});

describe('AbstractEntityImage defaults', () => {
  const diagram = parseLegacy(BOKUBA);

  it('getShield is Margins.NONE, getOverscanX is 0, the style name is activityDiagram', () => {
    const image = new EntityImageBranch(leafNamed(diagram, 'start'), diagram.getSkinParam());

    expect(image.getOverscanX(sb)).toBe(0);
    expect(image.getShield(sb)).toBe(Margins.NONE);
    expect(image.getStyleName()).toBe('activityDiagram');
    expect(image.isHidden()).toBe(false);
  });
});
