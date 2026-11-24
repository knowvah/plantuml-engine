/**
 * Legacy activity diagram plugin (`(*) --> "act"`): `ActivityDiagramFactory` (parse) and the svek DOT and layout
 * (`layout.ts`; `layout-elk.ts` under `!pragma layout elk`); and the render (`renderer.ts`), registered in
 * `registered-plugins.ts`. The AST is the populated {@link ActivityDiagram}, which carries everything the DOT build and
 * the renderer read.
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

  // `!pragma layout elk` (`CommandPragma.java:128-129`, `CucaDiagram.java:478-479`, `:950-952`): the ELK maker lays the
  // diagram out through `services.elk`, and a diagram that requires it must not fall back to dot-engine.
  requiresElk(ast) {
    return ast.isUseElk();
  },

  layoutSync(ast, _theme, measurer, services) {
    return { geometry: layoutActivityLegacy(ast, measurer, services?.elk), diagram: ast, measurer };
  },

  render(layout) {
    return renderActivityLegacy(layout);
  },
};
