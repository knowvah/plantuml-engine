/**
 * `@startmath`: the last non-directive line is an AsciiMath formula, drawn as
 * the Batik document of `core/math/math-document.ts` (decisions.md D4).
 * `color`, `backgroundcolor`, `scale` and `dpi` lines are tested on the
 * trimmed lower-cased line but read their argument from the ORIGINAL line
 * (`line.substring(n)`), so an indented `  color red` reads `or red`.
 * `scale` and `dpi` are stored and never reach SVG
 * (`ScientificEquationSafe.java:149`, `getSvg(1, ...)`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { DirectOsDiagram } from '../../core/DirectOsDiagram.js';
import { ColorMapper } from '../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { AwtColor } from '../../core/math/math-document.js';
import { ScientificEquationSafe } from '../../core/math/ScientificEquationSafe.js';
import { trin } from '../../core/style/parser/StyleParser.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { stringBounderFor } from '../../core/UgDiagram.js';

/** `XColor.BLACK`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/awt/XColor.java */
export const XCOLOR_BLACK: AwtColor = { r: 0, g: 0, b: 0, a: 255 };

/** `XColor.WHITE`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/awt/XColor.java */
export const XCOLOR_WHITE: AwtColor = { r: 255, g: 255, b: 255, a: 255 };

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:80-81 */
export const COLOR_PARAM = 'color ';
export const BACK_PARAM = 'backgroundcolor ';
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:92, :102 */
export const SCALE_PARAM = 'scale ';
export const DPI_PARAM = 'dpi ';

/** `dpi1 / 96`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:107 */
const DPI_UNIT = 96;

/** Java's `FloatingDecimal` grammar for decimal strings, after its leading/trailing whitespace trim. */
const JAVA_FLOAT = /^[+-]?(?:NaN|Infinity|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)[fFdD]?$/;

/**
 * `Float.parseFloat(value)`, `undefined` where it throws (`Logme.error(e)`,
 * nothing else). Hexadecimal floats are not accepted here; the value never
 * reaches the SVG either way (`getSvg(1, ...)`).
 */
export function parseJavaFloat(value: string): number | undefined {
  const trimmed = trin(value);
  if (!JAVA_FLOAT.test(trimmed)) return undefined;
  return Math.fround(Number.parseFloat(trimmed.replace(/[fFdD]$/, '')));
}

/**
 * `getColor`: `HColorSet.instance().getColorOrWhite(col).toColor(ColorMapper.IDENTITY)`.
 * A gradient answers its first colour (`HColorGradient#toColor`); any other
 * `HColor` throws `UnsupportedOperationException` (`HColor.java:65-67`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:118-122
 */
export function getColor(col: string): AwtColor {
  const col2 = HColorSet.instance().getColorOrWhite(col);
  if (col2 instanceof HColorSimple) return col2.toColor(ColorMapper.IDENTITY);
  if (col2 instanceof HColorGradient) return col2.toColor();
  throw new Error(`UnsupportedOperationException: ${col2.constructor.name}`);
}

/** The four settings both `PSystemMath` and `PSystemLatex` hold. */
export interface MathSettings {
  formula: string;
  scale: number;
  color: AwtColor;
  backColor: AwtColor;
}

/**
 * `doCommandLine`, the same body in `PSystemMath` and `PSystemLatex`
 * (`PSystemLatex.java:78-114`), applied to `settings` in place.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:78-116
 */
export function doMathCommandLine(settings: MathSettings, line: string): void {
  const lineLower = trin(line.toLowerCase());
  if (lineLower.startsWith(COLOR_PARAM)) {
    settings.color = getColor(line.substring(COLOR_PARAM.length));
  } else if (lineLower.startsWith(BACK_PARAM)) {
    settings.backColor = getColor(line.substring(BACK_PARAM.length));
  } else if (lineLower.startsWith(SCALE_PARAM)) {
    const scale1 = parseJavaFloat(line.substring(SCALE_PARAM.length));
    if (scale1 !== undefined && scale1 > 0) settings.scale = scale1;
  } else if (lineLower.startsWith(DPI_PARAM)) {
    const dpi1 = parseJavaFloat(line.substring(DPI_PARAM.length));
    if (dpi1 !== undefined && dpi1 > 0) settings.scale = dpi1 / DPI_UNIT;
  } else {
    settings.formula = line;
  }
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:55 */
export class PSystemMath extends DirectOsDiagram {
  /** `math`, `scale`, `color`, `backColor` (java:57-60). */
  private readonly settings: MathSettings = { formula: '', scale: 1, color: XCOLOR_BLACK, backColor: XCOLOR_WHITE };

  constructor(source: UmlSource, preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:66-68 */
  getDescription(): string {
    return '(Math)';
  }

  /** The stored `scale`, which no output reads. */
  getScale(): number {
    return this.settings.scale;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:70-76 */
  protected exportDiagramNow(_num: number, measurer: StringMeasurer): string {
    const asciiMath = ScientificEquationSafe.fromAsciiMath(this.settings.formula);
    return asciiMath.exportSvg(this.settings.color, this.settings.backColor, stringBounderFor(measurer));
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:78-116 */
  doCommandLine(line: string): void {
    doMathCommandLine(this.settings, line);
  }
}
