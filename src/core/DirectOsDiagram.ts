/**
 * `DirectOsDiagram`: a diagram that writes its own bytes to the output
 * stream instead of exporting a klimt `TextBlock` (`@startmath`,
 * `@startlatex`). `exportDiagram` is `exportDiagramNow`; the stats block in
 * its `finally` reads global configuration this port does not have.
 *
 * The `AbstractDiagram` members it needs (the constructor's source and
 * preprocessing artifact) are hosted here, as `UgDiagram.ts` hosts its own.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/DirectOsDiagram.java
 */
import type { UmlSource } from './block-extractor.js';
import type { StringMeasurer } from './measurer.js';
import type { PreprocessingArtifact } from './tim/PreprocessingArtifact.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/DirectOsDiagram.java:50 */
export abstract class DirectOsDiagram {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/DirectOsDiagram.java:52-54 */
  constructor(
    private readonly source: UmlSource,
    private readonly preprocessing: PreprocessingArtifact,
  ) {}

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/AbstractDiagram.java */
  getSource(): UmlSource {
    return this.source;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/AbstractDiagram.java */
  getPreprocessingArtifact(): PreprocessingArtifact {
    return this.preprocessing;
  }

  /** The document, SVG being the one format this port writes. `measurer` stands in for the
   *  `FileFormatOption`'s string bounder (the rollback document measures text).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/DirectOsDiagram.java:56-57 */
  protected abstract exportDiagramNow(num: number, measurer: StringMeasurer): string;

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/DirectOsDiagram.java:59-79 */
  exportDiagram(index: number, measurer: StringMeasurer): string {
    return this.exportDiagramNow(index, measurer);
  }
}

/** What a `DirectOsDiagram` plugin's `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface DirectOsGeometry<D extends DirectOsDiagram> {
  readonly diagram: D;
  readonly measurer: StringMeasurer;
}
