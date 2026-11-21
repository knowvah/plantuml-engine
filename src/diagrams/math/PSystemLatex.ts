/**
 * `@startlatex`: as `@startmath`, with the formula passed to JLaTeXMath as
 * LaTeX (`ScientificEquationSafe.fromLatex`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { DirectOsDiagram } from '../../core/DirectOsDiagram.js';
import type { HColorOrPaint } from '../../core/klimt/color/ColorMapper.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ScientificEquationSafe } from '../../core/math/ScientificEquationSafe.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { stringBounderFor } from '../../core/UgDiagram.js';
import { defaultMathSettings, doMathCommandLine } from './PSystemMath.js';
import type { MathSettings } from './PSystemMath.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:55 */
export class PSystemLatex extends DirectOsDiagram {
  /** `latex`, `scale`, `color`, `backColor` (java:55-60). */
  private readonly settings: MathSettings = defaultMathSettings();

  constructor(source: UmlSource, preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:67-69 */
  getDescription(): string {
    return '(Latex)';
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:71-76 */
  protected exportDiagramNow(_num: number, measurer: StringMeasurer): string {
    const { formula, scale, color, backColor } = this.settings;
    const asciiMath = ScientificEquationSafe.fromLatex(formula);
    return asciiMath.exportSvg(scale, color, backColor, stringBounderFor(measurer), measurer);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:78-80 */
  getFormulaBlock(): TextBlock {
    return ScientificEquationSafe.fromLatex(this.settings.formula).getTextBlock(
      this.settings.color,
      this.getFormulaBackground(),
    );
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:82-84 */
  getFormulaBackground(): HColorOrPaint {
    return this.settings.backColor;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:86-88 */
  getFormulaScale(): number {
    return this.settings.scale;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:90-127 */
  doCommandLine(line: string): void {
    doMathCommandLine(this.settings, line);
  }
}
