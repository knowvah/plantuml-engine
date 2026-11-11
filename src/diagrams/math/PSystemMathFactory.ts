/**
 * `PSystemMathFactory`: a `PSystemBasicFactory` (decisions.md D3) whose every
 * body line is `doCommandLine`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMathFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { createSystem, preprocessingArtifactOf } from '../../core/command/PSystemBasicFactory.js';
import type { BasicFactory } from '../../core/command/PSystemBasicFactory.js';
import type { ParseRefusal } from '../../core/parse-refusal.js';
import { PSystemMath } from './PSystemMath.js';
import type { DirectOsGeometry } from '../../core/DirectOsDiagram.js';
import type { SyncPlugin } from '../../core/dispatcher.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/PSystemMathFactory.java:44-63 */
export const PSystemMathFactory: BasicFactory<PSystemMath> = {
  initDiagram: (source, _startLine, preprocessing) => new PSystemMath(source, preprocessing),
  executeLine: (_source, system, line) => {
    system.doCommandLine(line);
    return system;
  },
};

/** `PSystemBasicFactory#createSystem` over {@link PSystemMathFactory}. */
export function parseMathDiagram(source: UmlSource): PSystemMath | ParseRefusal {
  return createSystem(PSystemMathFactory, source, preprocessingArtifactOf(source));
}

/**
 * `PSystemMathFactory` as a plugin: a `DirectOsDiagram` writes the whole
 * document itself (decisions.md D4), so layout has nothing to do.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:172
 */
export const mathPlugin: SyncPlugin<PSystemMath, DirectOsGeometry<PSystemMath>> = {
  type: 'math',
  factoryBase: 'PSystemBasicFactory',
  parse: (source) => parseMathDiagram(source),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo) => ({ completeSvg: geo.diagram.exportDiagram(0, geo.measurer) }),
};
