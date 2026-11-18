/**
 * `PSystemPath` — the `path` egg: a `DirectOsDiagram` whose export is
 * `GraphicsPath#writeImage` (an SVG page in the port, ipe D2).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPath.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { DirectOsDiagram } from '../../core/DirectOsDiagram.js';
import { ColorMapper } from '../../core/klimt/color/ColorMapper.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { GraphicsPath } from './GraphicsPath.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPath.java:66 */
const DESCRIPTION = '(Path)';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPath.java:49 */
export class PSystemPath extends DirectOsDiagram {
  private readonly path: GraphicsPath;

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPath.java:54-57 */
  constructor(source: UmlSource, s: string, preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
    this.path = new GraphicsPath(ColorMapper.IDENTITY, s);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPath.java:58-63 */
  protected exportDiagramNow(_num: number, measurer: StringMeasurer): string {
    return this.path.writeImage(measurer);
  }

  /** `DiagramDescription` reduced to its text.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPath.java:65-67 */
  getDescription(): string {
    return DESCRIPTION;
  }
}
