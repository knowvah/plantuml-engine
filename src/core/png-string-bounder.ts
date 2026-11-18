/**
 * `FileFormat.PNG.getDefaultStringBounder()`: the bounder an SVG render reaches when the Java measures through a PNG
 * export or asks for PNG's bounder by name (wire `print`, `WireDiagram.java:133`; a creole math rollback,
 * `AtomMath.java:63-70` → `ScientificEquationSafe.java:116-129`).
 *
 * Stock, PNG falls through to `new StringBounderAwt()` (`FileFormat.java:272`), which {@link jarMeasurer} reproduces.
 * Under `PLANTUML_DETERMINISTIC_TEXT`, oracle seam #5 (`oracle/patches/0005-oracle-png-bounder.patch`, pbs D2)
 * replaces only the metrics: each piece is measured by the seam-#4 width-table bounder, which this port's
 * {@link DeterministicMeasurer} is, while `StringBounderAwt`'s bold `RichText` split stays. The port's
 * `PLANTUML_DETERMINISTIC_TEXT` is a render whose measurer is a `DeterministicMeasurer` (that module's doc), so the
 * arm follows the render's measurer (pbs D3).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/FileFormat.java:177-274
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringBounderAwt.java
 */
import type { StringBounder, StringBounderFileFormat } from './klimt/font/StringBounder.js';
import { XDimension2D } from './klimt/geom/XDimension2D.js';
import { FontStyle, type FontConfiguration } from './klimt/shape/UText.js';
import { MeasurerStringBounder } from './measurer-bounder.js';
import { DeterministicMeasurer } from './measurer-deterministic.js';
import { jarMeasurer } from './measurer-jar.js';
import type { FontSpec, StringMeasurer } from './measurer.js';

/** `UFontFace#isBold`: CSS weight 700 and above. @see UFontFace.java:158-160 */
const BOLD_CSS_WEIGHT = 700;

/** `StringUtils.BOLD_START`. Upstream has no producer; a literal U+EEF2 in the source reaches the bounder.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringUtils.java:115 */
export const BOLD_START = '';
/** `StringUtils.BOLD_END`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringUtils.java:116 */
export const BOLD_END = '';

/** `StringBounder`'s default descent, which the seam bounders inherit (pbs D2). @see StringBounder.java:46-49 */
const DEFAULT_DESCENT_DIVISOR = 4.5;

/** What a bounder receives: a `FontSpec`, carrying a `FontConfiguration`'s members on the atom path. */
type FontConfigurationLike = FontSpec & Partial<Pick<FontConfiguration, 'styles' | 'fontFace'>>;

/**
 * Whether `font`, the `FontConfiguration` a creole atom hands the bounder, is bold. Java's `StringBounderAwt` measures
 * the font's real weight; `jarMeasurer` keys on `FontSpec.weight`, which the atom path leaves out (`cov-print-table`'s
 * bold header cells: `b` is 6.626 bold, 6.294 plain).
 */
function isBoldFont(font: FontConfigurationLike): boolean {
  return font.styles?.has(FontStyle.BOLD) === true || (font.fontFace?.cssWeight ?? 0) >= BOLD_CSS_WEIGHT;
}

/** The measure `jarMeasurer` gives a font whose weight it can read. */
const awtMeasurer: StringMeasurer = {
  measure: (text, font) => jarMeasurer.measure(text, isBoldFont(font) ? { ...font, weight: 'bold' } : font),
  getDescent: (font, text) => jarMeasurer.getDescent(font, text),
};

/** `RichText#isRich`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/RichText.java:42-52 */
function isRich(text: string): boolean {
  return text.includes(BOLD_START) || text.includes(BOLD_END);
}

/** `StyledString`: a piece of text and the `FontStyle` it is measured in. */
interface StyledString {
  readonly text: string;
  readonly style: typeof FontStyle.PLAIN | typeof FontStyle.BOLD;
}

/** `StyledString#build`, unmatched markers included. @see StyledString.java:68-91 */
function buildStyledStrings(text: string): StyledString[] {
  const result: StyledString[] = [];
  let s = text;
  while (s.length > 0) {
    const i1 = s.indexOf(BOLD_START);
    if (i1 === -1) {
      result.push({ text: s, style: FontStyle.PLAIN });
      break;
    }
    const i2 = s.indexOf(BOLD_END);
    if (i1 > 0) result.push({ text: s.substring(0, i1), style: FontStyle.PLAIN });
    if (i2 === -1) {
      result.push({ text: s.substring(i1 + 1), style: FontStyle.BOLD });
      s = '';
    } else {
      result.push({ text: s.substring(i1 + 1, i2), style: FontStyle.BOLD });
      s = s.substring(i2 + 1);
    }
  }
  return result;
}

/**
 * `FontStyle#mutateFont` for the two styles `StyledString` produces: `PLAIN` is `UFontFace.normal()` (weight and
 * italic both reset), `BOLD` sets weight 700 and keeps the italic.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/font/FontStyle.java:75-86
 */
function mutateFont(style: StyledString['style'], font: FontConfigurationLike): FontSpec {
  if (style === FontStyle.PLAIN) return { family: font.family, size: font.size, weight: 'normal', style: 'normal' };
  const italic = font.style === 'italic' || font.styles?.has(FontStyle.ITALIC) === true || font.fontFace?.italic;
  return { family: font.family, size: font.size, weight: 'bold', style: italic === true ? 'italic' : 'normal' };
}

/** `StringBounderAwt#calculateDimension`'s shape over a piece measure: the rich split, widths summed, height the max. */
class PngStringBounder implements StringBounder {
  constructor(
    private readonly pieces: StringBounder,
    private readonly descent: (font: FontSpec, text: string) => number,
  ) {}

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringBounderAwt.java:55-71 */
  calculateDimension(font: FontConfigurationLike, text: string): XDimension2D {
    if (!isRich(text)) return this.pieces.calculateDimension(font, text);
    let width = 0;
    let height = 0;
    for (const s of buildStyledStrings(text)) {
      const rect = this.pieces.calculateDimension(mutateFont(s.style, font), s.text);
      width += rect.getWidth();
      height = Math.max(height, rect.getHeight());
    }
    return new XDimension2D(width, height);
  }

  getDescent(font: FontSpec, text: string): number {
    return this.descent(font, text);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringBounderAwt.java:80-83 */
  getFileFormat(): StringBounderFileFormat {
    return 'PNG';
  }
}

/** Stock: `new StringBounderAwt()` (`FileFormat.java:272`), whose descent is AWT's line metrics (`StringBounderAwt.java:73-78`). */
const AWT_BOUNDER: StringBounder = new PngStringBounder(new MeasurerStringBounder(awtMeasurer), (font, text) =>
  awtMeasurer.getDescent(font, text),
);

/**
 * `FileFormat.PNG.getDefaultStringBounder()` for a render measured by `measurer`: seam #5's bounder over the
 * `DeterministicMeasurer`, else the AWT bounder (production, whatever measurer the render carries).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/FileFormat.java:177-274
 */
export function pngDefaultStringBounder(measurer: StringMeasurer): StringBounder {
  if (!(measurer instanceof DeterministicMeasurer)) return AWT_BOUNDER;
  return new PngStringBounder(new MeasurerStringBounder(measurer), (font) => font.size / DEFAULT_DESCENT_DIVISOR);
}

/** The deterministic measurer PNG's bounder measures with when a host bounder says the render is deterministic. */
const DETERMINISTIC_MEASURER = new DeterministicMeasurer();

/**
 * `FileFormat.PNG.getDefaultStringBounder()` seen from a host bounder, for code that holds only a `StringBounder`
 * (`AtomMath#calculateDimensionSlow`). The Java reads the JVM property; the host's `getFileFormat()` answers
 * `SVG_DETERMINISTIC` exactly when it is set (`FileFormat.java:185-193`), so it carries the same bit.
 */
export function pngStringBounderOf(stringBounder: StringBounder): StringBounder {
  const deterministic = stringBounder.getFileFormat?.() === 'SVG_DETERMINISTIC';
  return pngDefaultStringBounder(deterministic ? DETERMINISTIC_MEASURER : jarMeasurer);
}
