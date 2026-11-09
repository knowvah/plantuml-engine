/**
 * Legacy activity diagram plugin (`(*) --> "act"`): `ActivityDiagramFactory` (parse) and the svek DOT and layout
 * (`layout.ts`, T2b); and the render (`renderer.ts`, T2c). Not registered (`registered-plugins.ts`): that is T3a. The AST is the
 * populated {@link ActivityDiagram}, which carries everything the DOT build and the renderer read.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/ActivityDiagramFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import type { SyncPlugin } from '../../core/dispatcher.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';
import { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { parseActivityLegacy } from './ActivityDiagramFactory.js';
import { layoutActivityLegacy } from './layout.js';
import { renderActivityLegacy, type ActivityLegacyRenderInput } from './renderer.js';

/** What `layoutSync` hands `render`: the geometry, the diagram it was laid out from and the measurer. */
export type ActivityLegacyLayout = ActivityLegacyRenderInput;

/** The `!option` directives the preprocessor collected, as `EaterOption` defines them on the artifact. */
function preprocessingArtifactOf(source: UmlSource): PreprocessingArtifact {
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  return artifact;
}

export const activityLegacyPlugin: SyncPlugin<ActivityDiagram, ActivityLegacyLayout> = {
  type: 'activity-legacy',

  parse(source, options) {
    const emoji = options?.assetStore === undefined ? undefined : internalEmojiStoreFrom(options.assetStore);
    return parseActivityLegacy(source, preprocessingArtifactOf(source), emoji);
  },

  layoutSync(ast, _theme, measurer) {
    return { geometry: layoutActivityLegacy(ast, measurer), diagram: ast, measurer };
  },

  render(layout) {
    return renderActivityLegacy(layout);
  },
};
