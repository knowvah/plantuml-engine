/**
 * `GitDiagramFactory` as a plugin: a `PSystemAbstractFactory` on `@startgit`,
 * typed `GIT` (`GitDiagramFactory.java:52`), registered at its upstream
 * position (`PSystemBuilder.java:191`). No empty test: an empty body draws
 * the empty canvas (gip D5), so `factoryBase` is `PSystemAbstractFactory`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GitDiagramFactory.java
 */
import type { RenderFragment, SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { GitDiagram } from './GitDiagram.js';
import { parseGit } from './GitDiagramFactory.js';
import { renderGit } from './git-export.js';

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface GitGeometry {
  readonly diagram: GitDiagram;
  readonly measurer: StringMeasurer;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:191 */
export const gitPlugin: SyncPlugin<GitDiagram, GitGeometry> = {
  type: 'git',
  factoryBase: 'PSystemAbstractFactory',
  parse: (source, options) => parseGit(source, options),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo): RenderFragment => renderGit(geo.diagram, geo.measurer),
};
