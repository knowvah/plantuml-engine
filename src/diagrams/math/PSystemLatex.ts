/**
 * `@startlatex`: as `@startmath`, with the formula passed to JLaTeXMath as
 * LaTeX (`ScientificEquationSafe.fromLatex`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { DirectOsDiagram } from '../../core/DirectOsDiagram.js';
import { ScientificEquationSafe } from '../../core/math/ScientificEquationSafe.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { stringBounderFor } from '../../core/UgDiagram.js';
import { doMathCommandLine, XCOLOR_BLACK, XCOLOR_WHITE } from './PSystemMath.js';
import type { MathSettings } from './PSystemMath.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:55 */
export class PSystemLatex extends DirectOsDiagram {
  /** `latex`, `scale`, `color`, `backColor` (java:57-60). */
  private readonly settings: MathSettings = { formula: '', scale: 1, color: XCOLOR_BLACK, backColor: XCOLOR_WHITE };

  constructor(source: UmlSource, preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:66-68 */
  getDescription(): string {
    return '(Latex)';
  }

  /** The stored `scale`, which no output reads. */
  getScale(): number {
    return this.settings.scale;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:70-75 */
  protected exportDiagramNow(_num: number, measurer: StringMeasurer): string {
    const asciiMath = ScientificEquationSafe.fromLatex(this.settings.formula);
    return asciiMath.exportSvg(this.settings.color, this.settings.backColor, stringBounderFor(measurer));
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatex.java:77-114 */
  doCommandLine(line: string): void {
    doMathCommandLine(this.settings, line);
  }
}
