import type { UmlSource } from '../../core/block-extractor.js';
import { preprocessingArtifactOf, upstreamLinesOf } from '../../core/command/PSystemBasicFactory.js';
import type { ParseOptions } from '../../core/dispatcher.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';
import { internalSpriteStoreFrom } from '../../core/internal-sprite-store.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { GitDiagram } from './GitDiagram.js';
import { GitTextArea } from './GitTextArea.js';

/** The asset stores out of `ParseOptions` (ADR-2), as `BpmDiagramFactory.ts`. */
function classpathOf(options: ParseOptions | undefined): SkinParamClasspath | undefined {
  const store = options?.assetStore;
  if (store === undefined) return undefined;
  return { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
}

/**
 * `GitDiagramFactory#createSystem`: a `PSystemAbstractFactory` with no command
 * and no empty test. Every line of upstream's `UmlSource` after the start tag
 * goes into the text area while another line follows it, so the end tag never
 * does. The grid parse runs in `GitDiagram`'s constructor, so a bad grid throws
 * from here (gip D5).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GitDiagramFactory.java:49-72
 */
export function parseGit(source: UmlSource, options?: ParseOptions): GitDiagram {
  const textArea = new GitTextArea();
  const all = upstreamLinesOf(source);
  for (let k = 1; k + 1 < all.length; k++) textArea.add(all[k]!);
  return new GitDiagram(source, textArea, preprocessingArtifactOf(source), classpathOf(options));
}
