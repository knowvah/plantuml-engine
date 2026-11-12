/**
 * Chen EER diagram plugin (`@startchen`): `ChenEerDiagramFactory` (parse). Layout is `layout.ts` (T2c; `layout-elk.ts` under
 * `!pragma layout elk`), render is `renderer.ts` (T2d), registered in `registered-plugins.ts` (T3a). The AST is the populated
 * {@link ChenEerDiagram}, which carries everything the DOT build and the renderer read.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/ChenEerDiagramFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import type { SyncPlugin } from '../../core/dispatcher.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';
import { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { parseChen } from './ChenEerDiagramFactory.js';
import { layoutChen, type ChenGeometry } from './layout.js';
import { renderChen } from './renderer.js';

/** What `layoutSync` hands `render`: the geometry, the diagram it was laid out from and the measurer. */
export interface ChenLayout {
  readonly geometry: ChenGeometry;
  readonly diagram: ChenEerDiagram;
  readonly measurer: StringMeasurer;
}

/** The `!option` directives the preprocessor collected, as `EaterOption` defines them on the artifact. */
function preprocessingArtifactOf(source: UmlSource): PreprocessingArtifact {
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  return artifact;
}

export const chenPlugin: SyncPlugin<ChenEerDiagram, ChenLayout> = {
  type: 'chen',

  parse(source, options) {
    const emoji = options?.assetStore === undefined ? undefined : internalEmojiStoreFrom(options.assetStore);
    return parseChen(source, preprocessingArtifactOf(source), emoji);
  },

  // `!pragma layout elk` (`CommandPragma.java:128-129`, `CucaDiagram.java:478-479`, `:950-952`): the ELK maker lays the
  // diagram out through `services.elk`, and a diagram that requires it must not fall back to dot-engine.
  requiresElk(ast) {
    return ast.isUseElk();
  },

  layoutSync(ast, _theme, measurer, services) {
    return { geometry: layoutChen(ast, measurer, services?.elk), diagram: ast, measurer };
  },

  render(layout) {
    return renderChen(layout);
  },
};
