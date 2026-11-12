/**
 * `FlowDiagramFactory` as a plugin: a `PSystemCommandFactory` on `@startflow`,
 * typed `FLOW` (`FlowDiagramFactory.java:51`), registered at its upstream
 * position after `GanttDiagramFactory` and the commented-out
 * `ChronologyDiagramFactory` (`PSystemBuilder.java:183-185`). The empty test
 * is the dispatcher's, so `factoryBase` stays the default.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagramFactory.java
 */
import type { RenderFragment, SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { FlowDiagram } from './FlowDiagram.js';
import { parseFlow } from './FlowDiagramFactory.js';
import { renderFlow } from './flow-export.js';

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface FlowGeometry {
  readonly diagram: FlowDiagram;
  readonly measurer: StringMeasurer;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:185 */
export const flowPlugin: SyncPlugin<FlowDiagram, FlowGeometry> = {
  type: 'flow',
  parse: (source, options) => parseFlow(source, options),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo): RenderFragment => renderFlow(geo.diagram, geo.measurer),
};
