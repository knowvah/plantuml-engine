/**
 * `PSystemLatexFactory`: a `PSystemBasicFactory` (decisions.md D3) whose every
 * body line is `doCommandLine`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatexFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { createSystem, preprocessingArtifactOf } from '../../core/command/PSystemBasicFactory.js';
import type { BasicFactory } from '../../core/command/PSystemBasicFactory.js';
import type { ParseRefusal } from '../../core/parse-refusal.js';
import { PSystemLatex } from './PSystemLatex.js';
import type { DirectOsGeometry } from '../../core/DirectOsDiagram.js';
import type { SyncPlugin } from '../../core/dispatcher.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemLatexFactory.java:44-63 */
export const PSystemLatexFactory: BasicFactory<PSystemLatex> = {
  initDiagram: (source, _startLine, preprocessing) => new PSystemLatex(source, preprocessing),
  executeLine: (_source, system, line) => {
    system.doCommandLine(line);
    return system;
  },
};

/** `PSystemBasicFactory#createSystem` over {@link PSystemLatexFactory}. */
export function parseLatexDiagram(source: UmlSource): PSystemLatex | ParseRefusal {
  return createSystem(PSystemLatexFactory, source, preprocessingArtifactOf(source));
}

/**
 * `PSystemLatexFactory` as a plugin; see `PSystemMathFactory.ts#mathPlugin`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:173
 */
export const latexPlugin: SyncPlugin<PSystemLatex, DirectOsGeometry<PSystemLatex>> = {
  type: 'latex',
  factoryBase: 'PSystemBasicFactory',
  parse: (source) => parseLatexDiagram(source),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo) => ({ completeSvg: geo.diagram.exportDiagram(0, geo.measurer) }),
};
