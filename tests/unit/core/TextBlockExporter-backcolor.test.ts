/**
 * dbp-T2e (decisions.md D7): a klimt-carrier fragment (mindmap, wbs, salt, gantt)
 * that chrome wrapped paints the document rect as the content `<g>`'s FIRST
 * child, at the FINAL canvas -- `SvgGraphics`' constructor paints it
 * (`klimt/drawing/svg/SvgGraphics.java:176-192`, `paintBackcolor` `:207-212`)
 * when `createUGraphic` runs (`core/TextBlockExporter.java:169-171`), before
 * `addChrome`'s title draws, and `finalizeRootAttributes` sizes it `format(maxX)` x
 * `format(maxY)` (`:819-821`).
 *
 * The producer's own klimt pass (`drawBodyAt`) paints that rect too, sized to
 * ITS canvas and ordered after the chrome strings around `BODY_ANCHOR`. Jar
 * oracle: `tests/fixtures/document-background/mindmap-title-solid.svg`
 * (`<rect x="0" y="0" width="110" height="110" fill="#AAA" style="stroke:none;"/>`
 * then `<g class="title" …>`, where the carrier's own rect read 90 x 90 after it).
 */
import { describe, expect, it } from 'vitest';
import { assembleSvg } from '../../../src/core/assemble-svg.js';
import type { RenderFragment } from '../../../src/core/dispatcher.js';
import { ClockwiseTopRightBottomLeft } from '../../../src/core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import type { Gradient } from '../../../src/core/paint.js';
import { ROOT_GROUP_OPEN } from '../../../src/core/svg.js';
import { BODY_ANCHOR, finalizeTitledDiagramFragment } from '../../../src/core/TextBlockExporter.js';

const INNER = '<text x="1" y="2">A</text>';
const TITLE = '<g class="title"><text x="3" y="4">T</text></g>';
/** The chrome strings shift by the margin's (left, top) = (10, 10) (`TextBlockExporter.java:173`). */
const TITLE_SHIFTED = '<g class="title"><text x="13" y="14">T</text></g>';
const RED_BLUE: Gradient = { color1: 'red', color2: 'blue', policy: '/' };
/** The carrier's own rect: the klimt pass painted it at ITS canvas (90 x 90), not the final one. */
const CARRIER_RECT = (fill: string): string =>
  `<rect x="0" y="0" width="90" height="90" fill="${fill}" style="stroke:none;"/>`;
const MARGIN = ClockwiseTopRightBottomLeft.same(10);

/** A chromed carrier: title around the anchor, the klimt block drawn by `drawBodyAt`. */
function carrier(carrierRect: string, overrides: Partial<RenderFragment>): RenderFragment {
  return {
    body: `<g>${TITLE}${BODY_ANCHOR}</g>`,
    width: 70,
    height: 90,
    diagramType: 'MINDMAP',
    bodyWrapped: true,
    exportMargin: MARGIN,
    drawBodyAt: () => ({ body: carrierRect + INNER, width: 90, height: 90 }),
    ...overrides,
  };
}

function rootGroupChildren(svg: string): string {
  const start = svg.indexOf(ROOT_GROUP_OPEN) + ROOT_GROUP_OPEN.length;
  return svg.slice(start, svg.lastIndexOf('</g></svg>'));
}

describe('finalizeTitledDiagramFragment -- the document rect leads, at the final canvas (D7)', () => {
  it('solid: one rect, first, sized to the exported canvas; the carrier rect is gone', () => {
    const out = finalizeTitledDiagramFragment(carrier(CARRIER_RECT('#AAA'), { background: '#AAAAAA' }));
    // 70 + 20 + 1 = 91 wide; 90 + 20 + 1 = 111 tall, raised by nothing (the drawn canvas is 90 x 90).
    expect([out.width, out.height]).toEqual([91, 111]);
    expect(out.body).toBe(
      `<g><rect x="0" y="0" width="91" height="111" fill="#AAA" stroke="none"/>${TITLE_SHIFTED}${INNER}</g>`,
    );
  });

  it('the rect takes the drawn canvas when it floors the dimension', () => {
    const out = finalizeTitledDiagramFragment(
      carrier(CARRIER_RECT('#AAA'), {
        background: '#AAAAAA',
        drawBodyAt: () => ({ body: CARRIER_RECT('#AAA') + INNER, width: 130, height: 10 }),
      }),
    );
    expect([out.width, out.height]).toEqual([130, 111]);
    expect(out.body).toContain('<rect x="0" y="0" width="130" height="111" fill="#AAA"');
  });

  it('scale 2: the rect is the scaled canvas, i.e. the root width/height (SvgGraphics.java:819-821)', () => {
    const out = finalizeTitledDiagramFragment(
      carrier(CARRIER_RECT('#AAA'), { background: '#AAAAAA', scaleSpec: { kind: 'simple', factor: 2 } }),
    );
    expect([out.width, out.height]).toEqual([182, 222]);
    expect(out.body.startsWith('<g><rect x="0" y="0" width="182" height="222" fill="#AAA"')).toBe(true);
  });

  it.each(['#FFFFFF', '#000000', '#00000000'])(
    '%s: the constructor paints no rect (SvgGraphics.java:187-191) and the body is untouched',
    (background) => {
      const out = finalizeTitledDiagramFragment(carrier('', { background }));
      expect(out.body).toBe(`<g>${TITLE_SHIFTED}${INNER}</g>`);
    },
  );

  it('no background on the fragment: nothing is painted', () => {
    const out = finalizeTitledDiagramFragment(carrier('', {}));
    expect(out.body).toBe(`<g>${TITLE_SHIFTED}${INNER}</g>`);
  });

  it('gradient: ONE def and ONE url(#id) rect, first, at the final size; no root background:', () => {
    const svg = assembleSvg(
      carrier(CARRIER_RECT('url(#g1)'), { background: 'red/blue', backgroundGradient: RED_BLUE }),
    );
    const rects = [...svg.matchAll(/<rect [^>]*>/g)].map((m) => m[0]);
    const defs = [...svg.matchAll(/<linearGradient /g)];
    expect(defs).toHaveLength(1);
    expect(rects).toHaveLength(1);
    expect(rects[0]).toMatch(/^<rect x="0" y="0" width="91" height="111" fill="url\(#[^)]+\)"/);
    expect(rootGroupChildren(svg).startsWith(rects[0]!)).toBe(true);
    expect(/^<svg[^>]* style="([^"]*)"/.exec(svg)?.[1]).toBe('width:91px;height:111px;');
  });
});
