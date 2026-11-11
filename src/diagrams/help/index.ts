/**
 * `HelpFactory` as a plugin: a `PSystemCommandFactory` on `@startuml`, typed
 * `HELP` (`HelpFactory.java:51`), tried at its upstream position after every
 * UML engine (`PSystemBuilder.java:188`). The empty test is the
 * dispatcher's, so `factoryBase` stays the default.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/HelpFactory.java
 */
import type { RenderFragment, SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { Help } from './Help.js';
import { renderHelp } from './help-export.js';
import { parseHelp } from './HelpFactory.js';

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface HelpGeometry {
  readonly diagram: Help;
  readonly measurer: StringMeasurer;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:188 */
export const helpPlugin: SyncPlugin<Help, HelpGeometry> = {
  type: 'help',
  parse: (source, options) => parseHelp(source, options),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo): RenderFragment => renderHelp(geo.diagram, geo.measurer),
};
