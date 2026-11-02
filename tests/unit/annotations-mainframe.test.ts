/**
 * Unit tests for `mainframe` rendering (cdd-T34, E14) — mission G0b's own
 * T9 escape hatch is CLOSED by this task: `DiagramChromeFactory
 * .decorateWithFrame` + `BigFrame` (`klimt/shape/BigFrame.java`) are now
 * ported (`core/klimt/shape/big-frame.ts`, `chrome.ts#addMainframe`).
 * `plans/g0b-annotations/decisions.md` D9's "deferred whole" is superseded;
 * `DIVERGENCES.md`'s "mainframe <label> — rendered via a ported BigFrame"
 * entry records the rendered state and the non-class engines' residual.
 *
 * @see ~/git/plantuml/.../core/DiagramChromeFactory.java:275-336 (decorateWithFrame)
 * @see ~/git/plantuml/.../klimt/shape/BigFrame.java
 */
import { describe, it, expect } from 'vitest';
import { applyChrome, type AnnotationStyles } from '../../src/core/annotations/chrome.js';
import { createAnnotations, setMainFrame, singleDisplayPositioned, isEmpty } from '../../src/core/annotations/index.js';
import type { AnnotationBoxStyle, AnnotationElement } from '../../src/core/annotations/style.js';
import type { RenderFragment } from '../../src/core/dispatcher.js';
import { FixedMeasurer } from '../../src/core/measurer.js';

const MEASURER = new FixedMeasurer(10, 10);

const PLAIN_STYLE: AnnotationBoxStyle = {
  fontSize: 14,
  fontStyle: 'plain',
  fontColor: 'black',
  fontFamily: 'SansSerif',
  backgroundColor: null,
  lineColor: null,
  roundCorner: 0,
  lineThickness: 1, // G2 N50: root{}'s LineThickness 1.0 default
  documentBackground: '#FFFFFF', // G2 N51: default canvas background
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  horizontalAlignment: 'LEFT',
};

// cdd-T34: mainframe's own real defaults (plantuml.skin:85-89) rather than
// PLAIN_STYLE's all-zero padding/margin/null-color stand-in — the geometry
// assertions below need real numbers to check against.
const MAINFRAME_STYLE: AnnotationBoxStyle = {
  ...PLAIN_STYLE,
  lineColor: '#181818',
  lineThickness: 1.5,
  padding: { top: 1, right: 5, bottom: 1, left: 5 },
  margin: { top: 10, right: 5, bottom: 10, left: 5 },
};

function plainStyles(): AnnotationStyles {
  const elements: AnnotationElement[] = ['title', 'caption', 'header', 'footer', 'legend', 'mainframe'];
  const result = {} as AnnotationStyles;
  for (const el of elements) {
    const base = el === 'mainframe' ? MAINFRAME_STYLE : PLAIN_STYLE;
    result[el] = { ...base, padding: { ...base.padding }, margin: { ...base.margin } };
  }
  return result;
}

function makeFragment(width: number, height: number, body = '<rect id="BODY"/>'): RenderFragment {
  return { body, width, height, background: '#FFFFFF', extraDefs: '<marker/>' };
}

describe('mainframe — parsing + isEmpty (unaffected by cdd-T34)', () => {
  it('a mainframe-only annotations bag is NOT isEmpty (chrome still runs)', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    expect(isEmpty(annotations)).toBe(false);
  });

  it('byte-stability: applyChrome returns the SAME fragment object when no annotations are present at all', () => {
    const fragment = makeFragment(70, 107);
    const result = applyChrome(fragment, createAnnotations(), plainStyles(), MEASURER);
    expect(result).toBe(fragment);
  });
});

describe('mainframe — drawn via BigFrame (cdd-T34)', () => {
  it('wraps the original body in a frame + folder-tab title, growing width/height', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const fragment = makeFragment(70, 107);

    const result = applyChrome(fragment, annotations, plainStyles(), MEASURER);

    expect(result.body).not.toBe(fragment.body);
    expect(result.body).toContain('<rect id="BODY"/>');
    expect(result.width).toBeGreaterThan(fragment.width);
    expect(result.height).toBeGreaterThan(fragment.height);
  });

  it('draws the frame rect, the folder-tab cutout path, and the title text BEFORE the original body', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const fragment = makeFragment(70, 107);

    const result = applyChrome(fragment, annotations, plainStyles(), MEASURER);

    const rectIndex = result.body.indexOf('<rect');
    const pathIndex = result.body.indexOf('<path');
    const textIndex = result.body.indexOf('<text');
    const bodyIndex = result.body.indexOf('<rect id="BODY"/>');
    expect(rectIndex).toBeGreaterThanOrEqual(0);
    expect(pathIndex).toBeGreaterThan(rectIndex);
    expect(textIndex).toBeGreaterThan(pathIndex);
    expect(bodyIndex).toBeGreaterThan(textIndex);
  });

  it('applyChrome preserves background/extraDefs (spread-through, decisions.md D5 shape)', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const fragment = makeFragment(70, 107);

    const result = applyChrome(fragment, annotations, plainStyles(), MEASURER);

    expect(result.background).toBe('#FFFFFF');
    expect(result.extraDefs).toBe('<marker/>');
  });

  it('the outer margin is baked into every drawn coordinate (frame rect starts at margin.left/top)', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const fragment = makeFragment(70, 107);

    const result = applyChrome(fragment, annotations, plainStyles(), MEASURER);

    // MAINFRAME_STYLE.margin = {top: 10, left: 5} -- BigFrame.java:296-303's
    // `margin.getTranslate()`, the same offset `jakaja-15-faze022`'s real
    // oracle rect carries (`x="5" y="10"`).
    expect(result.body).toContain('<rect x="5" y="10"');
  });
});

describe('mainframe -- LineStyle (lgm-T1a, gunecu-53-jebu067: `mainframe { LineStyle 2 }`)', () => {
  it('a dashed style draws stroke-dasharray on the frame rect AND the tab path', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const styles = plainStyles();
    styles.mainframe = { ...styles.mainframe, lineStyle: { dashVisible: 2, dashSpace: 2 } };

    const result = applyChrome(makeFragment(70, 107), annotations, styles, MEASURER);

    expect(result.body.match(/stroke-dasharray="2,2"/g)).toHaveLength(2);
  });

  it('a solid style (dashVisible 0) draws no stroke-dasharray', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const styles = plainStyles();
    styles.mainframe = { ...styles.mainframe, lineStyle: { dashVisible: 0, dashSpace: 0 } };

    expect(applyChrome(makeFragment(70, 107), annotations, styles, MEASURER).body).not.toContain('stroke-dasharray');
  });
});

describe('mainframe -- sized from ink, not dimension (lgm-T1a)', () => {
  /** SEQUENCE bodies are scanned: `ww` = the rect's ink maxX (x + w - 1), `hh` likewise. */
  it('frames a SEQUENCE body by its LimitFinder ink', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const fragment: RenderFragment = {
      body: '<rect x="10" y="20" width="30" height="40" fill="#FFF"/>',
      width: 500,
      height: 500,
      diagramType: 'SEQUENCE',
    };

    const result = applyChrome(fragment, annotations, plainStyles(), MEASURER);

    // ink = (9,19)..(39,59): ww = 39, hh = 59. BigFrame: width = padding.left 5
    // + max(ww + 12, titleW + 10) + padding.right 5 = 61; the +margin 5/5 => 71.
    expect(result.width).toBe(5 + 61 + 5);
    // height = padding.top (1 + titleH + 10) + titleH + hh + padding.bottom 1, margin 10/10.
    const titleH = 10; // FixedMeasurer(10, 10)
    expect(result.height).toBe(10 + (1 + titleH + 10) + titleH + 59 + 1 + 10);
  });

  it('a producer-exported frameInk wins over the body, and an ink reaching x < 0 is moved back by computeDelta', () => {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(['demo'], null, null, 0));
    const fragment: RenderFragment = {
      body: '<g id="ANCHOR"/>',
      width: 500,
      height: 500,
      frameInk: { minX: -1, minY: 0, maxX: 100, maxY: 50 },
    };

    const result = applyChrome(fragment, annotations, plainStyles(), MEASURER);

    // ww = maxX - minX = 101 (BigFrame.java:81, minX < 0): 5 + (101 + 12) + 5.
    expect(result.width).toBe(5 + (5 + 113 + 5) + 5);
  });
});

/**
 * T2f (D7): `BigFrame#drawU` draws under `symbolContext.apply(ug)` (`klimt/shape/BigFrame.java:96`), whose
 * back and fore are `Style#getSymbolContext`'s `BackGroundColor` and `LineColor` (`style/Style.java:271-276`)
 * with no `equals` skip; `DriverRectangleSvg#applyFillColor` (`klimt/drawing/svg/DriverRectangleSvg.java:83-92`)
 * writes a gradient as `url(#id)`.
 */
describe('mainframe -- a gradient back (T2f)', () => {
  const GRADIENT = { color1: 'red', color2: 'blue', policy: '/' } as const;

  function framed(style: Partial<AnnotationBoxStyle>, display = ['demo']): string {
    const annotations = createAnnotations();
    setMainFrame(annotations, singleDisplayPositioned(display, null, null, 0));
    const styles = plainStyles();
    styles.mainframe = { ...styles.mainframe, ...style };
    return applyChrome(makeFragment(70, 107), annotations, styles, MEASURER).body;
  }

  it('jar `sequence-mainframe-gradient`: the frame paints url(#id) with one def, never the raw token', () => {
    const body = framed({
      backgroundColor: 'red/blue',
      documentBackground: 'red/blue',
      documentBackgroundGradient: GRADIENT,
    });
    expect(body.match(/<linearGradient /g)?.length).toBe(1);
    expect(body).toMatch(/<rect[^>]*fill="url\(#g[a-z0-9]+\)"/);
    expect(body).not.toContain('red/blue');
  });

  it('jar probe `mainframe { BackgroundColor red-blue }` on a solid canvas: url(#id) too', () => {
    const body = framed({ backgroundColor: 'red-blue' });
    expect(body).toMatch(/<rect[^>]*fill="url\(#g[a-z0-9]+\)"/);
    expect(body).not.toContain('red-blue');
  });

  it('jar probe `mainframe { BackgroundColor transparent }` on a gradient canvas: fill none (`ValueImpl.java:97-98`)', () => {
    const body = framed({
      backgroundColor: null,
      documentBackground: 'red/blue',
      documentBackgroundGradient: GRADIENT,
    });
    expect(body).toMatch(/<rect[^>]*fill="none"/);
    expect(body).not.toContain('red/blue');
    expect(body).not.toContain('linearGradient');
  });

  it('jar probe `mainframe { LineThickness 0 }` under a gradient: a rule strokes the LineColor (`Style.java:275-276`)', () => {
    const body = framed({ backgroundColor: 'red/blue', documentBackground: 'red/blue', lineThickness: 0 }, [
      'a',
      '----',
      'b',
    ]);
    expect(body).toMatch(/<line[^>]*stroke:#181818/);
    expect(body).not.toContain('red/blue');
  });

  it('a solid frame back is unchanged', () => {
    expect(framed({ backgroundColor: 'pink' })).toMatch(/<rect[^>]*fill="#FFC0CB"/);
    expect(framed({ documentBackground: '#ADD8E6' })).toMatch(/<rect[^>]*fill="#ADD8E6"/);
  });
});
