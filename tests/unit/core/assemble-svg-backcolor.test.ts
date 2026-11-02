/**
 * dbp-T2a (decisions.md D2): the json/yaml/hcl, state, class and description
 * finalizers paint the document background through `SvgGraphics`' constructor
 * branches (`svg-backcolor.ts#backcolorPaint`,
 * `klimt/drawing/svg/SvgGraphics.java:176-192`):
 *
 * - `HColorGradient` (`:178-183`): `createSvgGradient` + `paintBackcolor("url(#id)")`,
 *   ALWAYS painted, `backcolorString = null` -- no root `background:`;
 * - plain colour (`:186-191`): root `background:` kept, rect painted unless the
 *   colour is `#00000000`, `#000000` or `#FFFFFF`.
 *
 * The rect is the root `<g>`'s first child (`paintBackcolor`, `:207-212`) because
 * the constructor runs inside `createUGraphic`, before `maybeDrawBorder` and the
 * diagram draw (`core/TextBlockExporter.java:169-177`) -- chrome included.
 *
 * Jar oracles: `tests/fixtures/document-background/{json,state,class}-gradient.svg`
 * (`<defs><linearGradient x1="0%" y1="0%" x2="100%" y2="100%" …><stop stop-color="#F00"
 * offset="0%"/><stop stop-color="#00F" offset="100%"/>`, root style without
 * `background:`, content `<g>` opening with the `url(#…)` rect) and
 * `{json,state}-black.svg` (root `background:#000000;`, no rect).
 */
import { describe, expect, it } from 'vitest';
import { assembleSvg } from '../../../src/core/assemble-svg.js';
import type { RenderFragment } from '../../../src/core/dispatcher.js';
import type { Gradient } from '../../../src/core/paint.js';
import { ROOT_GROUP_OPEN } from '../../../src/core/svg.js';
import { ClockwiseTopRightBottomLeft } from '../../../src/core/klimt/geom/ClockwiseTopRightBottomLeft.js';

const INNER = '<text x="1" y="2">A</text>';
const TITLE = '<g class="title"><text x="3" y="4">T</text></g>';
/** `red/blue` as `HColorSet.java:78-119` parses it: `/` is the default diagonal policy. */
const RED_BLUE: Gradient = { color1: 'red', color2: 'blue', policy: '/' };
/** The def the fixtures' jar oracles carry, in this port's attribute order. */
const RED_BLUE_DEF_RE =
  /<defs><linearGradient id="([^"]+)" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F00"\/><stop offset="100%" stop-color="#00F"\/><\/linearGradient><\/defs>/;
const W = 72;
const H = 260;
const BLACK = '#000000';

/** Everything inside the content root `<g …>`. */
function rootGroupChildren(svg: string): string {
  const start = svg.indexOf(ROOT_GROUP_OPEN) + ROOT_GROUP_OPEN.length;
  return svg.slice(start, svg.lastIndexOf('</g></svg>'));
}

/** The root `<svg>`'s `style` attribute. */
function rootStyle(svg: string): string {
  return /^<svg[^>]* style="([^"]*)"/.exec(svg)?.[1] ?? '';
}

/** The gradient id in the lifted `<defs>`, asserting the def's exact shape. */
function gradientId(svg: string): string {
  const id = RED_BLUE_DEF_RE.exec(svg)?.[1];
  expect(id).toBeDefined();
  return String(id);
}

function gradientRect(id: string, width: number, height: number): string {
  return `<rect x="0" y="0" width="${String(width)}" height="${String(height)}" fill="url(#${id})" stroke="none"/>`;
}

function fragment(diagramType: string, overrides: Partial<RenderFragment> = {}): RenderFragment {
  return { body: INNER, width: W, height: H, diagramType, ...overrides };
}

function wrapped(diagramType: string, overrides: Partial<RenderFragment> = {}): RenderFragment {
  return fragment(diagramType, { body: ROOT_GROUP_OPEN + TITLE + INNER + '</g>', bodyWrapped: true, ...overrides });
}

// ---------------------------------------------------------------------------
// json / yaml / hcl
// ---------------------------------------------------------------------------

describe('assembleSvg — JSON family document gradient (SvgGraphics.java:178-183)', () => {
  it.each([['JSON'], ['YAML'], ['HCL']])(
    '%s: one def + one url rect as the first child, no root background',
    (diagramType) => {
      // `red/blue` is the flattened spelling the theme keeps beside the gradient
      // (`skinparam-key-handlers-table-a.ts`); the gradient branch never reads it.
      const svg = assembleSvg(fragment(diagramType, { background: 'red/blue', backgroundGradient: RED_BLUE }));
      const id = gradientId(svg);
      expect(rootGroupChildren(svg)).toBe(gradientRect(id, W, H) + INNER);
      expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;`);
      expect(svg.match(/<linearGradient /g)).toHaveLength(1);
    },
  );

  it('splices the gradient rect ahead of the title in a chrome-wrapped body', () => {
    const svg = assembleSvg(wrapped('YAML', { backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + TITLE + INNER);
  });

  it('sizes the gradient rect to the exported canvas on the exportTo path (SvgGraphics.java:819-821)', () => {
    // block 50.5 x 30.25 + same(10), scale 2: canvas trunc(70.5 + 1) x 2 = 142, trunc(50.25 + 1) x 2 = 102
    // (the solid case is pinned in assemble-svg-json-export.test.ts).
    const svg = assembleSvg({
      body: ROOT_GROUP_OPEN + INNER + '</g>',
      width: 50.5,
      height: 30.25,
      bodyWrapped: true,
      exportMargin: ClockwiseTopRightBottomLeft.same(10),
      scaleSpec: { kind: 'simple', factor: 2 },
      backgroundGradient: RED_BLUE,
      diagramType: 'JSON',
    });
    expect(rootGroupChildren(svg).startsWith(gradientRect(gradientId(svg), 142, 102))).toBe(true);
    expect(rootStyle(svg)).not.toContain('background:');
  });

  it.each([[BLACK], ['black'], ['#000']])(
    'draws no rect for %s, keeping the root background:#000000 (json-black)',
    (background) => {
      const svg = assembleSvg(fragment('JSON', { background }));
      expect(rootGroupChildren(svg)).toBe(INNER);
      expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;background:#000000;`);
    },
  );

  it('draws no rect for black on the exportTo path either', () => {
    const svg = assembleSvg({
      body: INNER,
      width: 50.5,
      height: 30.25,
      exportMargin: ClockwiseTopRightBottomLeft.same(10),
      background: BLACK,
      diagramType: 'YAML',
    });
    expect(svg).not.toContain('<rect x="0" y="0"');
    expect(svg).toContain('background:#000000;');
  });
});

// ---------------------------------------------------------------------------
// state
// ---------------------------------------------------------------------------

describe('assembleSvg — STATE document background (SvgGraphics.java:176-192)', () => {
  it('a gradient: one def + one url rect as the first child, no root background (state-gradient)', () => {
    const svg = assembleSvg(fragment('STATE', { background: 'red/blue', backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + INNER);
    expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;`);
  });

  it('truncates the rect to the integer canvas, as before', () => {
    const svg = assembleSvg(fragment('STATE', { width: 72.9, height: 260.4, backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + INNER);
  });

  it('black: no rect, root background:#000000 kept (state-black)', () => {
    const svg = assembleSvg(fragment('STATE', { background: BLACK }));
    expect(rootGroupChildren(svg)).toBe(INNER);
    expect(rootStyle(svg)).toContain('background:#000000;');
  });

  it('transparent (#00000000): no rect and no root background (SvgGraphics.java:187-189,805-806)', () => {
    const svg = assembleSvg(fragment('STATE', { background: '#00000000' }));
    expect(rootGroupChildren(svg)).toBe(INNER);
    expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;`);
  });

  it('white: no rect, as before', () => {
    const svg = assembleSvg(fragment('STATE', { background: '#FFFFFF' }));
    expect(rootGroupChildren(svg)).toBe(INNER);
  });

  it('a chrome-wrapped body still gets the gradient rect ahead of the title (the constructor paints before any draw)', () => {
    const svg = assembleSvg(wrapped('STATE', { backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + TITLE + INNER);
  });

  it('a chrome-wrapped body gets the solid rect ahead of the title too (jar: titled state, #EEEEEE)', () => {
    // Jar render (`scripts/oracle-render.sh`) of `skinparam backgroundColor #EEEEEE` + `title Hello` + one
    // state: `<g …><rect x="0" y="0" width="72" height="185" fill="#EEE" style="stroke:none;"/><g class="title"`.
    const svg = assembleSvg(wrapped('STATE', { background: '#EEEEEE' }));
    expect(rootGroupChildren(svg)).toBe(
      `<rect x="0" y="0" width="${String(W)}" height="${String(H)}" fill="#EEE" stroke="none"/>` + TITLE + INNER,
    );
  });
});

// ---------------------------------------------------------------------------
// class
// ---------------------------------------------------------------------------

describe('assembleSvg — CLASS document background (SvgGraphics.java:176-192)', () => {
  it('a gradient: one def + one url rect as the first child, no root background (class-gradient)', () => {
    const svg = assembleSvg(wrapped('CLASS', { background: 'red/blue', backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + TITLE + INNER);
    expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;`);
  });

  it('a gradient wins over a solid documentBackgroundRect: the jar draws only the gradient rect', () => {
    const svg = assembleSvg(wrapped('CLASS', { documentBackgroundRect: 'red/blue', backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + TITLE + INNER);
  });

  it('the `none` spelling of transparent draws no rect (jar: skinparam backgroundColor none, no rect)', () => {
    const svg = assembleSvg(wrapped('CLASS', { background: 'none', documentBackgroundRect: 'none' }));
    expect(rootGroupChildren(svg)).toBe(TITLE + INNER);
  });

  it('the background rect precedes the border rect (createUGraphic, then maybeDrawBorder: TextBlockExporter.java:169-171)', () => {
    // Jar render of `skinparam backgroundColor #EEEEEE` + `skinparam diagramBorderColor red` + `class A`:
    // `<rect … width="61" height="68" fill="#EEE" style="stroke:none;"/><rect … width="59.363" height="66"
    // fill="none" style="stroke:#F00;stroke-width:1;"/>`.
    const svg = assembleSvg({
      body: ROOT_GROUP_OPEN + INNER + '</g>',
      // `applyCucaDocumentMargin(60 x 40)` -- the border guard's own precondition (`withDiagramBorderRect`).
      width: 66,
      height: 46,
      preChromeWidth: 60,
      preChromeHeight: 40,
      bodyWrapped: true,
      documentBackgroundRect: '#EEEEEE',
      diagramBorderColor: '#FF0000',
      diagramType: 'CLASS',
    });
    expect(rootGroupChildren(svg)).toBe(
      '<rect x="0" y="0" width="66" height="46" fill="#EEE" stroke="none"/>' +
        '<rect x="0" y="0" width="64" height="44" fill="none" stroke="#F00" stroke-width="1"/>' +
        INNER,
    );
  });
});

// ---------------------------------------------------------------------------
// description (the chrome-composed klimt fragment, codd-T4)
// ---------------------------------------------------------------------------

describe('assembleSvg — DESCRIPTION document background (SvgGraphics.java:176-192)', () => {
  it('a gradient: one def + one url rect as the first child, no root background', () => {
    const svg = assembleSvg(wrapped('DESCRIPTION', { background: 'red/blue', backgroundGradient: RED_BLUE }));
    expect(rootGroupChildren(svg)).toBe(gradientRect(gradientId(svg), W, H) + TITLE + INNER);
    expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;`);
  });

  it('a lifted klimt url(#…) rect is re-spliced alone: the gradient never paints a second rect (T2b contract)', () => {
    // T2b: the klimt port paints the gradient (`svg-graphics-core.ts#setupBackcolor`, `SvgGraphics.java:178-183`),
    // `splitLeadingBackgroundRect` lifts `fill="url(#id)"` into `documentBackgroundRect` and the def rides `extraDefs`.
    const def =
      '<linearGradient id="gk0" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F00"/>' +
      '<stop offset="100%" stop-color="#00F"/></linearGradient>';
    const svg = assembleSvg(
      wrapped('DESCRIPTION', {
        background: '#00000000',
        documentBackgroundRect: 'url(#gk0)',
        backgroundGradient: RED_BLUE,
        extraDefs: def,
      }),
    );
    expect(rootGroupChildren(svg)).toBe(gradientRect('gk0', W, H) + TITLE + INNER);
    expect(svg.match(/<linearGradient /g)).toHaveLength(1);
    expect(rootStyle(svg)).toBe(`width:${String(W)}px;height:${String(H)}px;`);
  });

  it('a solid documentBackgroundRect is unchanged: truncated canvas, first child', () => {
    const svg = assembleSvg(
      wrapped('DESCRIPTION', { width: 72.9, height: 260.4, background: '#808080', documentBackgroundRect: '#808080' }),
    );
    expect(rootGroupChildren(svg)).toBe(
      `<rect x="0" y="0" width="${String(W)}" height="${String(H)}" fill="#808080" stroke="none"/>` + TITLE + INNER,
    );
    expect(rootStyle(svg)).toContain('background:#808080;');
  });
});
