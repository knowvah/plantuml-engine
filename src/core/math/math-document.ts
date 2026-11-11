/**
 * The document `@startmath` and `@startlatex` write: Batik's `SVGGraphics2D`
 * stream of a JLaTeXMath `TeXIcon`, which `ScientificEquationSafe#export`
 * copies straight to the output (`getSvg(1, fg, bg).getSvg(true)`,
 * `ScientificEquationSafe.java:149`). Klimt never runs, so there is no
 * `<?plantuml-src?>`, no `data-diagram-type`, and no scale (decisions.md D4).
 *
 * Every byte outside the glyph group is Batik's, copied from the jar's output
 * (`caruta-83-deta919`, `cov-math-back`, `cov-math-back-transparent`)
 * including its line-wrapped tag layout, where each `>` opens the next line.
 * The glyph group is JLaTeXMath's paths in the jar; here it is KaTeX's MathML
 * in a `<foreignObject>` (`core/latex.ts#renderLatexMathML`), the permanent
 * KaTeX divergence named in `DIVERGENCES.md`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ConverterSvg.java:77-115
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ScientificEquationSafe.java:145-151
 */
import { measureTeXIcon } from '../latex-metrics.js';
import { renderLatexMathML, stripMathModeDollars } from '../latex.js';
import { attrs } from '../svg.js';

/** An AWT `Color`: 0-255 channels, `a` 255 when opaque (`XColor#toAwtColor`). */
export interface AwtColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

/** `Color.getAlpha()` of an opaque colour. */
const OPAQUE = 255;

/**
 * `SVGColor.colorMap`, keyed by the opaque AWT colour it names. A `Color` key
 * matches by `equals`, i.e. all four channels, so only an opaque colour is
 * ever named. `gray` is AWT's `Color.gray`, (128,128,128).
 * @see batik-all-1.17.jar org/apache/batik/svggen/SVGColor.<clinit> (javap)
 */
const SVG_COLOR_NAMES: ReadonlyMap<string, string> = new Map([
  ['0,0,0', 'black'],
  ['192,192,192', 'silver'],
  ['128,128,128', 'gray'],
  ['255,255,255', 'white'],
  ['128,0,0', 'maroon'],
  ['255,0,0', 'red'],
  ['128,0,128', 'purple'],
  ['255,0,255', 'fuchsia'],
  ['0,128,0', 'green'],
  ['0,255,0', 'lime'],
  ['128,128,0', 'olive'],
  ['255,255,0', 'yellow'],
  ['0,0,128', 'navy'],
  ['0,0,255', 'blue'],
  ['0,128,128', 'teal'],
  ['0,255,255', 'aqua'],
]);

/** `SVGGeneratorContext#doubleString` at Batik's default precision: at most 4 decimals, trailing zeros dropped. */
const DOUBLE_STRING_DECIMALS = 4;

/**
 * `SVGColor#toSVG`'s colour value: the `colorMap` name, else `rgb(r,g,b)`.
 * @see batik-all-1.17.jar org/apache/batik/svggen/SVGColor.toSVG (javap)
 */
export function batikColorName(c: AwtColor): string {
  const rgb = `${c.r},${c.g},${c.b}`;
  return (c.a === OPAQUE ? SVG_COLOR_NAMES.get(rgb) : undefined) ?? `rgb(${rgb})`;
}

/** `gc.doubleString(color.getAlpha() / 255f)`: the alpha in Java `float`, printed with `#.####`. */
function batikOpacity(alpha: number): string {
  const f = Math.fround(alpha / Math.fround(OPAQUE));
  return String(Number(f.toFixed(DOUBLE_STRING_DECIMALS)));
}

/**
 * The style of the group Batik opens for `g2.setColor(bg); g2.fillRect(...)`.
 * An opaque paint writes `fill`/`stroke`; a translucent one adds the two
 * opacities between them, in Batik's own attribute order (jar:
 * `fill:rgb(0,0,0); fill-opacity:0; stroke-opacity:0; stroke:rgb(0,0,0);` for
 * `transparent`, `fill-opacity:0.502` for alpha 128).
 */
function paintGroupStyle(c: AwtColor): string {
  const name = batikColorName(c);
  if (c.a === OPAQUE) return `fill:${name}; stroke:${name};`;
  const opacity = batikOpacity(c.a);
  return `fill:${name}; fill-opacity:${opacity}; stroke-opacity:${opacity}; stroke:${name};`;
}

/** Batik's root element and comment, up to the `<defs>` (jar bytes, `SVGGraphics2D#stream` with `useCSS`). */
const ROOT_STYLE =
  "fill-opacity:1; color-rendering:auto; color-interpolation:auto; text-rendering:auto; stroke:black; stroke-linecap:square; stroke-miterlimit:10; shape-rendering:auto; stroke-opacity:1; fill:black; stroke-dasharray:none; font-weight:normal; stroke-width:1; font-family:'Dialog'; font-style:normal; stroke-linejoin:miter; font-size:12px; stroke-dashoffset:0; image-rendering:auto;";

const PROLOG =
  '<?xml version="1.0"?>\n' +
  "<!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.0//EN'\n" +
  "          'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'>\n";

/**
 * The size and LaTeX source of the formula, as `TeXIcon` reports them
 * (`icon.getIconWidth/Height`, `ConverterSvg.java:96`). JLaTeXMath skips a
 * math-mode `$` (`core/latex.ts#stripMathModeDollars`).
 */
export function mathDocumentSize(tex: string): { width: number; height: number } {
  const { width, height } = measureTeXIcon(stripMathModeDollars(tex));
  return { width, height };
}

/** JLaTeXMath ignores white space in math mode, so a blank formula is the empty box. */
function isBlankFormula(tex: string): boolean {
  return stripMathModeDollars(tex).trim() === '';
}

/**
 * The whole document for `tex` (already LaTeX: `AsciiMath#getSource` for
 * `@startmath`). `background` `null` draws no paint group
 * (`if (backgroundColor != null)`, `ConverterSvg.java:99-102`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ConverterSvg.java:77-115
 */
export function mathDocument(tex: string, foreground: AwtColor, background: AwtColor | null): string {
  const { width, height } = mathDocumentSize(tex);
  const paint =
    background === null
      ? ''
      : `<g${attrs([['style', paintGroupStyle(background)]])}\n` +
        `    ><rect${attrs([
          ['x', 0],
          ['width', width],
          ['height', height],
          ['y', 0],
          ['style', 'stroke:none;'],
        ])}\n` +
        `    /></g`;
  // The KaTeX body takes the glyph group's place. Its closing `>` moves to the
  // next line, as every Batik closing tag's does. A formula with nothing to
  // typeset paints nothing, and Batik writes no group for it
  // (`cov-math-only-directive`: the outer `<g>` holds the paint group only).
  const glyphs = isBlankFormula(tex)
    ? ''
    : renderLatexMathML(tex, 0, 0, width, height, batikColorName(foreground)).replace(/>$/, '');
  // Each sibling after the first opens on a new line behind the previous `>`.
  const body = paint !== '' && glyphs !== '' ? `\n    >${glyphs}` : glyphs;
  return (
    PROLOG +
    `<svg${attrs([
      ['xmlns:xlink', 'http://www.w3.org/1999/xlink'],
      ['style', ROOT_STYLE],
      ['width', width],
      ['height', height],
      ['xmlns', 'http://www.w3.org/2000/svg'],
    ])}\n` +
    '><!--Generated by the Batik Graphics2D SVG Generator--><defs id="genericDefs"\n' +
    `  /><g\n  >${paint}${body}\n  ></g\n></svg\n>\n`
  );
}
