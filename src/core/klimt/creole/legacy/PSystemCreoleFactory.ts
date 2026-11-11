/**
 * `PSystemCreoleFactory`: a `PSystemBasicFactory` (decisions.md D3) whose
 * every body line is `doCommandLine`; the start line is ignored.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreoleFactory.java
 */
import type { UmlSource } from '../../../block-extractor.js';
import { createSystem, preprocessingArtifactOf } from '../../../command/PSystemBasicFactory.js';
import type { BasicFactory } from '../../../command/PSystemBasicFactory.js';
import type { ParseOptions } from '../../../dispatcher.js';
import { internalEmojiStoreFrom } from '../../../internal-emoji-store.js';
import { internalSpriteStoreFrom } from '../../../internal-sprite-store.js';
import type { ParseRefusal } from '../../../parse-refusal.js';
import { PSystemCreole } from './PSystemCreole.js';
import type { CreoleClasspath } from './PSystemCreole.js';
import type { SyncPlugin } from '../../../dispatcher.js';
import type { StringMeasurer } from '../../../measurer.js';

/**
 * The factory. `classpath` is port-only (ADR-2): the asset stores standing in
 * for the classpath `SpriteImage.fromInternal` and `Emoji` read.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreoleFactory.java:44-64
 */
export function PSystemCreoleFactory(classpath?: CreoleClasspath): BasicFactory<PSystemCreole> {
  return {
    /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreoleFactory.java:50-53 */
    initDiagram: (source, _startLine, preprocessing) => new PSystemCreole(source, preprocessing, classpath),
    /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/PSystemCreoleFactory.java:55-60 */
    executeLine: (_source, system, line) => {
      system.doCommandLine(line);
      return system;
    },
  };
}

/** The asset stores out of `ParseOptions`. */
export function creoleClasspathOf(options: ParseOptions | undefined): CreoleClasspath | undefined {
  const store = options?.assetStore;
  if (store === undefined) return undefined;
  return { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
}

/** `PSystemBasicFactory#createSystem` over this factory. */
export function parseCreole(source: UmlSource, options?: ParseOptions): PSystemCreole | ParseRefusal {
  return createSystem(PSystemCreoleFactory(creoleClasspathOf(options)), source, preprocessingArtifactOf(source));
}

/** What `layoutSync` hands `render`: the diagram and the layout measurer. */
export interface CreoleGeometry {
  readonly diagram: PSystemCreole;
  readonly measurer: StringMeasurer;
}

/**
 * `PSystemCreoleFactory` as a plugin: `UgDiagram`'s non-titled export, a
 * complete document (decisions.md D2).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:174
 */
export const creolePlugin: SyncPlugin<PSystemCreole, CreoleGeometry> = {
  type: 'creole',
  factoryBase: 'PSystemBasicFactory',
  parse: (source, options) => parseCreole(source, options),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  render: (geo) => ({ completeSvg: geo.diagram.exportDiagram(0, geo.measurer) }),
};
