/**
 * ScientificEquationSafe — upstream: math/ScientificEquationSafe.java. Since
 * upstream `aa79d2d80ee` a formula is drawn straight on the UGraphic: its
 * dimension is the JLaTeXMath `TeXIcon`'s (`TeXIconBuilder.java:53-80`, the
 * `MathDrawing`), a background colour paints a rectangle of that size behind
 * it, and a formula that cannot be made is drawn as its source in monospace
 * text (`getRollback()`). `@startmath`/`@startlatex` export that block through
 * `TextBlockExporter` with the formula's scale.
 *
 * The formula's glyphs are the one permanent divergence (DIVERGENCES.md,
 * "LaTeX rendering engine — KaTeX, not JLaTeXMath"): the jar paints
 * JLaTeXMath's glyph outlines as `<path>`s (`UGraphicTeXGraphics`), the port
 * draws KaTeX's MathML as one `<image>` of the same size, placed where the
 * jar places the formula. Everything around the glyphs -- the size, the
 * background rectangle, the rollback text, the export -- is the jar's.
 *
 * `equation` is modelled as the nullable LaTeX `source` (`getSource()` is the
 * only member read through it); "the drawing can be made" is {@link typesets}:
 * an equation whose LaTeX JLaTeXMath parses (`latex-metrics/jlm-accepts.ts`),
 * where upstream's `getDrawing` catches the exception (java:97-108).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ScientificEquationSafe.java:58-183
 */

import { Back } from '../klimt/Back.js';
import { ColorMapper, toSvgPaint, type HColorOrPaint } from '../klimt/color/ColorMapper.js';
import { HColors } from '../klimt/color/HColors.js';
import { HColorSimple } from '../klimt/color/HColorSimple.js';
import { Fore } from '../klimt/Fore.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { ClockwiseTopRightBottomLeft } from '../klimt/geom/ClockwiseTopRightBottomLeft.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import { GraphicStrings } from '../klimt/shape/GraphicStrings.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { UImage } from '../klimt/shape/UImage.js';
import { URectangle } from '../klimt/shape/URectangle.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { measureLatex, renderLatexAsImage, stripMathModeDollars } from '../latex.js';
import { jlmAccepts } from '../latex-metrics/jlm-accepts.js';
import type { StringMeasurer } from '../measurer.js';
import { exportTo } from '../UgDiagram.js';
import { AsciiMath } from './AsciiMath.js';

/** `HColors.BLACK.withDark(HColors.WHITE)`. @see ScientificEquationSafe.java:60 */
export const DEFAULT_FOREGROUND: HColorOrPaint = HColors.BLACK.withDark(HColors.WHITE) as HColorSimple;

/** `HColors.transparent()`. @see ScientificEquationSafe.java:61 */
export const DEFAULT_BACKGROUND: HColorOrPaint = HColors.transparent();

/** `MathDrawing#draw`'s "null for black" (`MathDrawing.java:51-55`). */
const NULL_FOREGROUND = '#000000';

/** `HColor#isTransparent`: only a simple colour can be. */
function isTransparent(color: HColorOrPaint): boolean {
  return color instanceof HColorSimple && color.isTransparent();
}

/** The CSS colour KaTeX's MathML is written in: the colour `UGraphicTeXGraphics` would paint the glyphs with, a
 *  gradient's first stop. */
function cssColorOf(foreground: HColorOrPaint | null): string {
  if (foreground === null) return NULL_FOREGROUND;
  const paint = toSvgPaint(foreground, ColorMapper.IDENTITY);
  return typeof paint === 'string' ? paint : paint.color1;
}

/** `getRollback()`. @see ScientificEquationSafe.java:158-160 */
function getRollback(formula: string): TextBlock {
  return GraphicStrings.createBlackOnWhiteMonospaced([formula]);
}

/** The rollback's size, for the data-oriented creole atom (`blocks-creole-atoms.ts`). @see ScientificEquationSafe.java:110-115 */
export function rollbackDimension(formula: string, stringBounder: StringBounder): XDimension2D {
  return getRollback(formula).calculateDimension(stringBounder);
}

/** The rollback drawn as text, for the data-oriented creole atom. @see ScientificEquationSafe.java:124-128 */
export function drawRollback(formula: string, ug: UGraphic): void {
  getRollback(formula).drawU(ug);
}

export class ScientificEquationSafe {
  /** java:69-72. `source === null` models upstream's `equation == null`, the state `fromAsciiMath`/`fromLatex` fall
   *  back to on a parse failure. */
  private constructor(
    private readonly formula: string,
    private readonly source: string | null,
  ) {}

  /** java:84-92. `LatexBuilder`'s constructor stores its argument and cannot throw. */
  static fromLatex(formula: string): ScientificEquationSafe {
    return new ScientificEquationSafe(formula, formula);
  }

  /** java:74-82: a converter exception gives an equation-less instance. */
  static fromAsciiMath(formula: string): ScientificEquationSafe {
    try {
      return new ScientificEquationSafe(formula, new AsciiMath(formula).getSource());
    } catch {
      // Logme.error(e); Log.info(() -> "Error parsing " + formula);
      return new ScientificEquationSafe(formula, null);
    }
  }

  /** java:174-176. */
  getFormula(): string {
    return this.formula;
  }

  /** `equation != null`. */
  hasEquation(): boolean {
    return this.source !== null;
  }

  /** java:178-180: a bare `equation.getSource()`, so an equation-less instance throws. */
  getSource(): string {
    if (this.source === null)
      throw new Error(
        'NullPointerException: ScientificEquationSafe#getSource on an instance whose formula failed to parse',
      );
    return this.source;
  }

  /** `getDrawing(stringBounder) != null`: there is an equation and JLaTeXMath parses it. @see ScientificEquationSafe.java:97-108 */
  typesets(): boolean {
    return this.source !== null && jlmAccepts(this.source);
  }

  /** The `TeXIcon`'s size (`MathDrawing#getDimension`), else the rollback's. @see ScientificEquationSafe.java:110-115 */
  getDimension(stringBounder: StringBounder): XDimension2D {
    if (!this.typesets()) return rollbackDimension(this.formula, stringBounder);
    const { width, height } = measureLatex(this.source!);
    return new XDimension2D(width, height);
  }

  /**
   * The formula, or its source as text if it cannot be made. A background that is not transparent paints the
   * formula's box first (`ug.apply(HColors.transparent()).apply(background.bg())`). The glyphs are KaTeX's image (see
   * the module comment); a formula with nothing to typeset has no glyph, so nothing is drawn for it.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ScientificEquationSafe.java:117-135
   */
  drawU(ug: UGraphic, foreground: HColorOrPaint | null, background: HColorOrPaint | null): void {
    if (!this.typesets()) {
      drawRollback(this.formula, ug);
      return;
    }
    const source = this.source!;
    if (background !== null && !isTransparent(background)) {
      const dim = this.getDimension(ug.getStringBounder());
      ug.apply(new Fore(HColors.transparent()))
        .apply(new Back(background))
        .draw(URectangle.build(dim.getWidth(), dim.getHeight()));
    }
    if (stripMathModeDollars(source).trim() === '') return;
    const image = renderLatexAsImage(source, cssColorOf(foreground));
    ug.draw(UImage.build(image.width, image.height, image.href));
  }

  /** @see ScientificEquationSafe.java:137-148 */
  getTextBlock(foreground: HColorOrPaint | null, background: HColorOrPaint | null): TextBlock {
    return {
      calculateDimension: (stringBounder) => this.getDimension(stringBounder),
      drawU: (ug) => this.drawU(ug, foreground, background),
    };
  }

  /**
   * `export`'s SVG branch: `TextBlockExporter.builder(block, fileFormat, false).backcolor(DEFAULT_BACKGROUND)
   * .scale(new ScaleSimple(scale)).build().exportTo(os)` -- margin `none()`, no skin param.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ScientificEquationSafe.java:162-172
   */
  exportSvg(
    scale: number,
    foreground: HColorOrPaint,
    background: HColorOrPaint,
    stringBounder: StringBounder,
    measurer: StringMeasurer,
  ): string {
    return exportTo(
      {
        textBlock: this.getTextBlock(foreground, background),
        backcolor: DEFAULT_BACKGROUND,
        margin: ClockwiseTopRightBottomLeft.none(),
        scale: { kind: 'simple', factor: scale },
        colorMapper: ColorMapper.IDENTITY,
        isHandwritten: false,
      },
      stringBounder,
      measurer,
    );
  }
}
