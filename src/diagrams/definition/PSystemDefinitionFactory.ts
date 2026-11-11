/**
 * `PSystemDefinitionFactory`: a `PSystemBasicFactory` (decisions.md D3).
 * `initDiagram` keeps the start line, the only thing the page draws.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinitionFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { createSystem, preprocessingArtifactOf } from '../../core/command/PSystemBasicFactory.js';
import type { BasicFactory } from '../../core/command/PSystemBasicFactory.js';
import type { ParseRefusal } from '../../core/parse-refusal.js';
import { PSystemDefinition } from './PSystemDefinition.js';
import type { SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';

/**
 * `if (getDiagramType() == DiagramType.DEFINITION)` is always true: the
 * constructor passes `DiagramType.DEFINITION` (java:46) and nothing changes
 * it, so the `return null` arm is unreachable and this port's factory always
 * builds the diagram.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinitionFactory.java:44-63
 */
export const PSystemDefinitionFactory: BasicFactory<PSystemDefinition> = {
  initDiagram: (source, startLine, preprocessing) => new PSystemDefinition(source, startLine, preprocessing),
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/definition/PSystemDefinitionFactory.java:57-62 */
  executeLine: (_source, system, line) => {
    system.doCommandLine(line);
    return system;
  },
};

/** `PSystemBasicFactory#createSystem` over this factory. */
export function parseDefinition(source: UmlSource): PSystemDefinition | ParseRefusal {
  return createSystem(PSystemDefinitionFactory, source, preprocessingArtifactOf(source));
}

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface DefinitionGeometry {
  readonly diagram: PSystemDefinition;
  readonly measurer: StringMeasurer;
}

/**
 * `PSystemDefinitionFactory` as a plugin: `UgSimpleDiagram`'s non-titled
 * export, a complete document (decisions.md D2).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:169
 */
export const definitionPlugin: SyncPlugin<PSystemDefinition, DefinitionGeometry> = {
  type: 'def',
  factoryBase: 'PSystemBasicFactory',
  parse: (source) => parseDefinition(source),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo) => ({ completeSvg: geo.diagram.exportDiagram(0, geo.measurer) }),
};
