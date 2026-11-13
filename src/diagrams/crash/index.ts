/**
 * `CrashDiagramFactory` as a plugin: a `PSystemCommandFactory` on
 * `DiagramType.CRASH`, which `@startcrash` alone carries (`DiagramType.java:113-114`)
 * and the `@startuml` candidate set omits (`DiagramType.java:198-200`), tried
 * last (`PSystemBuilder.java:200`). The empty test is the dispatcher's, so
 * `factoryBase` stays the default.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagramFactory.java
 */
import type { RenderFragment, SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { CrashDiagram } from './CrashDiagram.js';
import { parseCrash } from './CrashDiagramFactory.js';
import { renderCrash } from './crash-export.js';

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface CrashGeometry {
  readonly diagram: CrashDiagram;
  readonly measurer: StringMeasurer;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:200 */
export const crashPlugin: SyncPlugin<CrashDiagram, CrashGeometry> = {
  type: 'crash',
  parse: (source, options) => parseCrash(source, options),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo): RenderFragment => renderCrash(geo.diagram, geo.measurer),
};
