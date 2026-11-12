/**
 * The subset/superset middle decor (cheneer T2b) against the jar's planning oracles `cov-subclass-super`,
 * `cov-subclass-sub`, `cov-multi-U` and `cov-multi-d`. The decor sits where `SvekEdge.java:982-989` puts it: at
 * `DotPath#getMiddle` of the oracle's own edge path, rotated by `angleDeg - 45`. Each edge path is copied from the
 * oracle SVG (`<path d="M.. C..">`), so the test feeds the decor the angle and point the jar fed it.
 */
import { describe, expect, it } from 'vitest';
import { getMiddleFactory, LinkMiddleDecor } from '../../../../../src/core/decoration/LinkMiddleDecor.js';
import { HColorSet } from '../../../../../src/core/klimt/color/HColorSet.js';
import { Fore } from '../../../../../src/core/klimt/Fore.js';
import type { UGraphic } from '../../../../../src/core/klimt/UGraphic.js';
import { UTranslate } from '../../../../../src/core/klimt/UTranslate.js';
import { buildDotPathFromSplinePoints } from '../../../../../src/core/svek/svek-edge-geometry.js';
import { MiddleFactorySubset } from '../../../../../src/core/svek/extremity/MiddleFactorySubset.js';
import type { MiddleSubset } from '../../../../../src/core/svek/extremity/MiddleSubset.js';
import { SvekEdge } from '../../../../../src/core/svek/SvekEdge.js';
import {
  drawMiddleDecor,
  LABEL_SHIELD,
  type MiddleDecor,
} from '../../../../../src/core/svek/extremity/MiddleCircleDecor.js';
import { asPaintColor } from '../../../../../src/core/svek/image/leaf-image-support.js';
import { drawnBody, parseProbe } from '../../../../helpers/chen-leaf-images.js';
import { newSvgGraphic } from '../../../../helpers/legacy-leaf-images.js';

type Point = { x: number; y: number };

/** `M x,y C x,y x,y x,y [C ...]` (the oracle's `<path d>`) as the spline point list a `DotPath` is built from. */
function splinePoints(d: string): Point[] {
  return [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

/**
 * `SvekEdge.java:982-989` over `path`: the decor the link type asks for, drawn in `color` at the path's middle.
 * The factory ignores the two colours (`LinkMiddleDecor.java:63-66`), the line colour comes from `ug`.
 */
function decorAlong(path: string, decor: MiddleDecor, color: string): string {
  const middle = buildDotPathFromSplinePoints(splinePoints(path)).getMiddle();
  const angleDeg = (-middle.angle * 180) / Math.PI;
  const paint = asPaintColor(HColorSet.instance().getColor(color));
  return drawnBody(0, 0, (ug: UGraphic) => {
    const colored = ug.apply(new Fore(paint));
    drawMiddleDecor(colored.apply(new UTranslate(middle.point.x, middle.point.y)), decor, angleDeg - 45, {
      backColor: 'none',
      diagramBackColor: 'none',
    });
  });
}

const STROKE = (c: string): string => `style="stroke:${c};stroke-width:1.5;"`;

describe('SvekEdge middle decor SUBSET / SUPERSET', () => {
  it('cov-subclass-super (A ->- B): the link type carries SUPERSET; arc and lines open upward', () => {
    const d = parseProbe('cov-subclass-super');
    expect(d.getLinks().map((l) => l.getType().getMiddleDecor())).toEqual([LinkMiddleDecor.SUPERSET]);

    expect(decorAlong('M21.68,41.37 C21.68,70.82 21.68,132.38 21.68,161.74', 'superset', '#181818')).toBe(
      `<path d="M15.68,101.589 A6,6 0 0 0 27.68 101.589" fill="none" ${STROKE('#181818')}/>` +
        `<line x1="15.68" y1="101.589" x2="15.68" y2="91.589" ${STROKE('#181818')}/>` +
        `<line x1="27.68" y1="101.589" x2="27.68" y2="91.589" ${STROKE('#181818')}/>`,
    );
  });

  it('cov-subclass-sub (A -<- B #line:purple): the link type carries SUBSET; arc and lines open downward', () => {
    const d = parseProbe('cov-subclass-sub');
    expect(d.getLinks().map((l) => l.getType().getMiddleDecor())).toEqual([LinkMiddleDecor.SUBSET]);

    expect(decorAlong('M21.68,41.37 C21.68,70.82 21.68,132.38 21.68,161.74', 'subset', '#800080')).toBe(
      `<path d="M27.68,101.589 A6,6 0 0 0 15.68 101.589" fill="none" ${STROKE('#800080')}/>` +
        `<line x1="27.68" y1="101.589" x2="27.68" y2="111.589" ${STROKE('#800080')}/>` +
        `<line x1="15.68" y1="101.589" x2="15.68" y2="111.589" ${STROKE('#800080')}/>`,
    );
  });

  it('cov-multi-U: the decor is on the superclass link only (D8)', () => {
    const d = parseProbe('cov-multi-U');
    expect(d.getLinks().map((l) => l.getType().getMiddleDecor())).toEqual([
      LinkMiddleDecor.SUPERSET,
      LinkMiddleDecor.NONE,
      LinkMiddleDecor.NONE,
    ]);

    expect(decorAlong('M56.68,41.46 C56.68,58.69 56.68,85.31 56.68,100.61', 'superset', '#008000')).toBe(
      `<path d="M50.68,71.759 A6,6 0 0 0 62.68 71.759" fill="none" ${STROKE('#008000')}/>` +
        `<line x1="50.68" y1="71.759" x2="50.68" y2="61.759" ${STROKE('#008000')}/>` +
        `<line x1="62.68" y1="71.759" x2="62.68" y2="61.759" ${STROKE('#008000')}/>`,
    );
  });

  it('cov-multi-d: SUPERSET sits on each subclass link, not the superclass link (CommandMultiSubclass.java:150-151); slanted edges rotate it', () => {
    const d = parseProbe('cov-multi-d');
    expect(d.getLinks().map((l) => l.getType().getMiddleDecor())).toEqual([
      LinkMiddleDecor.NONE,
      LinkMiddleDecor.SUPERSET,
      LinkMiddleDecor.SUPERSET,
    ]);

    expect(decorAlong('M53.93,126.15 C47.75,152.41 32.7,216.26 25.56,246.54', 'superset', '#181818')).toBe(
      `<path d="M34.265,183.461 A6,6 0 0 0 45.945 186.214" fill="none" ${STROKE('#181818')}/>` +
        `<line x1="34.265" y1="183.461" x2="36.559" y2="173.728" ${STROKE('#181818')}/>` +
        `<line x1="45.945" y1="186.214" x2="48.239" y2="176.48" ${STROKE('#181818')}/>`,
    );
    expect(decorAlong('M59.51,126.15 C65.87,152.41 81.35,216.26 88.69,246.54', 'superset', '#181818')).toBe(
      `<path d="M67.901,186.251 A6,6 0 0 0 79.564 183.424" fill="none" ${STROKE('#181818')}/>` +
        `<line x1="67.901" y1="186.251" x2="65.546" y2="176.532" ${STROKE('#181818')}/>` +
        `<line x1="79.564" y1="183.424" x2="77.208" y2="173.705" ${STROKE('#181818')}/>`,
    );
  });
});

describe('SvekEdge draws the SUPERSET middle decor in its link group (SvekEdge.java:982-989)', () => {
  it('cov-subclass-super: the edge path, then the arc and the two lines, in one group', () => {
    const edge = new SvekEdge({
      uid: 'lnk3',
      from: 'A',
      to: 'B',
      fromUid: 'ent0001',
      toUid: 'ent0002',
      sourceLine: 5,
      style: 'solid',
      color: '#181818',
      backgroundColor: '#FFFFFF',
      points: splinePoints('M21.68,41.37 C21.68,70.82 21.68,132.38 21.68,161.74'),
      middleDecor: { decor: 'superset', backColor: 'none', diagramBackColor: 'none' },
    });
    const ug = newSvgGraphic();
    edge.drawU(ug);
    const svg = ug.getSvgString();

    expect(svg).toContain(
      '<path d="M21.68,41.37 C21.68,70.82 21.68,132.38 21.68,161.74" style="stroke:#181818;stroke-width:1;" fill="none" id="A-B"/>' +
        `<path d="M15.68,101.589 A6,6 0 0 0 27.68 101.589" fill="none" ${STROKE('#181818')}/>` +
        `<line x1="15.68" y1="101.589" x2="15.68" y2="91.589" ${STROKE('#181818')}/>` +
        `<line x1="27.68" y1="101.589" x2="27.68" y2="91.589" ${STROKE('#181818')}/></g>`,
    );
  });

  it('a middle decor shields the label by 7 on both axes, SUBSET and SUPERSET alike (SvekEdge.java:353-356)', () => {
    const labelX = (decor: MiddleDecor | undefined): number => {
      const edge = new SvekEdge({
        uid: 'lnk3',
        from: 'A',
        to: 'B',
        fromUid: 'ent0001',
        toUid: 'ent0002',
        style: 'solid',
        color: '#181818',
        backgroundColor: '#FFFFFF',
        points: splinePoints('M21.68,41.37 C21.68,70.82 21.68,132.38 21.68,161.74'),
        label: { text: 'use', x: 87.43, y: 43, w: 22, h: 15 },
        labelFont: { family: 'sans-serif', size: 13, color: '#000000', styles: new Set() },
        ...(decor === undefined ? {} : { middleDecor: { decor, backColor: 'none', diagramBackColor: 'none' } }),
      });
      const ug = newSvgGraphic();
      edge.drawU(ug);
      const match = /<text x="([\d.]+)" y="([\d.]+)"[^>]*>use</.exec(ug.getSvgString());
      if (match === null) throw new Error('no label text drawn');
      return Number(match[1]);
    };
    const plain = labelX(undefined);

    expect(LABEL_SHIELD).toBe(7);
    expect(labelX('subset') - plain).toBeCloseTo(7, 3);
    expect(labelX('superset') - plain).toBeCloseTo(7, 3);
  });
});

describe('LinkMiddleDecor#getMiddleFactory', () => {
  it('answers a MiddleFactorySubset for SUBSET and SUPERSET only', () => {
    expect(getMiddleFactory(LinkMiddleDecor.SUBSET)).toBeInstanceOf(MiddleFactorySubset);
    expect(getMiddleFactory(LinkMiddleDecor.SUPERSET)).toBeInstanceOf(MiddleFactorySubset);
    expect(() => getMiddleFactory(LinkMiddleDecor.NONE)).toThrow('UnsupportedOperationException: NONE');
    expect(() => getMiddleFactory(LinkMiddleDecor.CIRCLE)).toThrow('UnsupportedOperationException: CIRCLE');
  });

  it('SUBSET and SUPERSET differ by the reverse rotation: the decor length is the radius, 6', () => {
    const decor = getMiddleFactory(LinkMiddleDecor.SUBSET).createUDrawable(0);
    expect((decor as MiddleSubset).getDecorationLength()).toBe(6);
  });
});
