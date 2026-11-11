/**
 * `BpmDiagramFactory` as a plugin: a `PSystemCommandFactory` on `@startbpm`,
 * typed `BPM` (`BpmDiagramFactory.java:51`), registered at its upstream
 * position right after `ActivityDiagramFactory3` (`PSystemBuilder.java:141`).
 * The empty test is the dispatcher's, so `factoryBase` stays the default.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmDiagramFactory.java
 */
import type { RenderFragment, SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { BpmDiagram } from './BpmDiagram.js';
import { parseBpm } from './BpmDiagramFactory.js';
import { renderBpm } from './bpm-export.js';

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface BpmGeometry {
  readonly diagram: BpmDiagram;
  readonly measurer: StringMeasurer;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:141 */
export const bpmPlugin: SyncPlugin<BpmDiagram, BpmGeometry> = {
  type: 'bpm',
  parse: (source, options) => parseBpm(source, options),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo): RenderFragment => renderBpm(geo.diagram, geo.measurer),
};
