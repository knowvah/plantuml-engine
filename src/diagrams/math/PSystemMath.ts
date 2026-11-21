/**
 * `@startmath`: the last non-directive line is an AsciiMath formula, exported
 * through `TextBlockExporter` with its scale (`ScientificEquationSafe#export`,
 * upstream `aa79d2d80ee`). `color`, `backgroundcolor`, `scale` and `dpi` lines
 * are tested on the trimmed lower-cased line but read their argument from the
 * ORIGINAL line (`line.substring(n)`), so an indented `  color red` reads
 * `or red`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { DirectOsDiagram } from '../../core/DirectOsDiagram.js';
import type { HColorOrPaint } from '../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import {
  DEFAULT_BACKGROUND,
  DEFAULT_FOREGROUND,
  ScientificEquationSafe,
} from '../../core/math/ScientificEquationSafe.js';
import { trin } from '../../core/string-utils-trim.js';
import { javaTrim } from '../../core/java-number-format.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { stringBounderFor } from '../../core/UgDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:92-93 */
export const COLOR_PARAM = 'color ';
export const BACK_PARAM = 'backgroundcolor ';
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:104, :114 */
export const SCALE_PARAM = 'scale ';
export const DPI_PARAM = 'dpi ';

/** `dpi1 / 96`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:119 */
const DPI_UNIT = 96;

/** Java's `FloatingDecimal` grammar for decimal strings, after its leading/trailing whitespace trim. */
const JAVA_FLOAT = /^[+-]?(?:NaN|Infinity|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)[fFdD]?$/;

/**
 * `Float.parseFloat(value)`, `undefined` where it throws (`Logme.error(e)`,
 * nothing else). Hexadecimal floats are not accepted here.
 */
export function parseJavaFloat(value: string): number | undefined {
  const trimmed = javaTrim(value); // `FloatingDecimal` trims with `String#trim`: U+00A0 stays.
  if (!JAVA_FLOAT.test(trimmed)) return undefined;
  return Math.fround(Number.parseFloat(trimmed.replace(/[fFdD]$/, '')));
}

/**
 * `getColor`: `HColorSet.instance().getColorOrWhite(col)`, kept as the `HColor` (`col` is never null here: it is a
 * substring). The port's drawing substrate carries a simple colour or a gradient; the automagic and scheme colours
 * have no paint there and stay the `UnsupportedOperationException` they were before aa79d2d80ee.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:130-132
 */
export function getColor(col: string): HColorOrPaint {
  const col2 = HColorSet.instance().getColorOrWhite(col);
  if (col2 instanceof HColorSimple || col2 instanceof HColorGradient) return col2;
  throw new Error(`UnsupportedOperationException: ${col2.constructor.name}`);
}

/** The four settings both `PSystemMath` and `PSystemLatex` hold (java:55-60). */
export interface MathSettings {
  formula: string;
  scale: number;
  color: HColorOrPaint;
  backColor: HColorOrPaint;
}

/** The defaults: `scale` 1, `ScientificEquationSafe.DEFAULT_FOREGROUND`/`DEFAULT_BACKGROUND`. @see PSystemMath.java:56-60 */
export function defaultMathSettings(): MathSettings {
  return { formula: '', scale: 1, color: DEFAULT_FOREGROUND, backColor: DEFAULT_BACKGROUND };
}

/**
 * `doCommandLine`, the same body in `PSystemMath` and `PSystemLatex`
 * (`PSystemLatex.java:90-127`), applied to `settings` in place.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:90-128
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
  /** `math`, `scale`, `color`, `backColor` (java:55-60). */
  private readonly settings: MathSettings = defaultMathSettings();

  constructor(source: UmlSource, preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:67-69 */
  getDescription(): string {
    return '(Math)';
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:71-76 */
  protected exportDiagramNow(_num: number, measurer: StringMeasurer): string {
    const { formula, scale, color, backColor } = this.settings;
    const asciiMath = ScientificEquationSafe.fromAsciiMath(formula);
    return asciiMath.exportSvg(scale, color, backColor, stringBounderFor(measurer), measurer);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:78-80 */
  getFormulaBlock(): TextBlock {
    return ScientificEquationSafe.fromAsciiMath(this.settings.formula).getTextBlock(
      this.settings.color,
      this.getFormulaBackground(),
    );
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:82-84 */
  getFormulaBackground(): HColorOrPaint {
    return this.settings.backColor;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:86-88 */
  getFormulaScale(): number {
    return this.settings.scale;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMath.java:90-128 */
  doCommandLine(line: string): void {
    doMathCommandLine(this.settings, line);
  }
}
