/**
 * `FlowDiagramFactory`: a `PSystemCommandFactory` with exactly the two flow
 * commands and no `CommonCommands` (flp D3, D5), so a blank line, `title`,
 * `skinparam` or `scale` is not a command here and yields `Syntax Error?`.
 *
 * The walk is `BpmDiagramFactory.ts`'s: upstream's `UmlSource` lines
 * (`upstreamLinesOf`), one `SingleLineCommand2` per line, `Syntax Error?`
 * on the first line no command takes. A command that throws (flp D5:
 * `IllegalArgumentException` out of `getTileById`/`buildPath`) propagates
 * to the crash page as bpm's throws do.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagramFactory.java:48-66
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-200
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import { documentLineOf, preprocessingArtifactOf, upstreamLinesOf } from '../../core/command/PSystemBasicFactory.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import type { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { ParseOptions } from '../../core/dispatcher.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';
import { internalSpriteStoreFrom } from '../../core/internal-sprite-store.js';
import { refuse } from '../../core/parse-refusal.js';
import type { ParseRefusal } from '../../core/parse-refusal.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { isEndDirective, isStartDirective } from '../../core/tim/StartUtils.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { CommandLineSimple } from './CommandLineSimple.js';
import { CommandLink } from './CommandLink.js';
import { FlowDiagram } from './FlowDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:170 */
const SYNTAX_ERROR = 'Syntax Error?';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagramFactory.java:60-64 */
export function initCommandsList(): readonly SingleLineCommand2<FlowDiagram>[] {
  return [new CommandLineSimple(), new CommandLink()];
}

/** The asset stores out of `ParseOptions` (ADR-2). */
function classpathOf(options: ParseOptions | undefined): SkinParamClasspath | undefined {
  const store = options?.assetStore;
  if (store === undefined) return undefined;
  return { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
}

/**
 * `createSystem` over `ParserPass.ONE`: each line up to the end directive
 * must be one flow command, else `Syntax Error?` on it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-140
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:165-190
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagramFactory.java:54-58
 */
export function parseFlow(source: UmlSource, options?: ParseOptions): FlowDiagram | ParseRefusal {
  const all = upstreamLinesOf(source);
  if (!isStartDirective(all[0]!)) throw new Error('UnsupportedOperationException');
  const diagram = new FlowDiagram(source, preprocessingArtifactOf(source), classpathOf(options));
  const cmds = initCommandsList();
  for (let k = 1; k < all.length && !isEndDirective(all[k]!); k++) {
    const line = new StringLocated(all[k]!, undefined);
    const cmd = cmds.find((c) => c.isValid(line) === CommandControl.OK);
    if (cmd === undefined) return refuse('syntax', documentLineOf(source, all, k), k, SYNTAX_ERROR);
    const result = cmd.execute(diagram, line, ParserPass.ONE);
    if (!result.isOk())
      return refuse('execution', documentLineOf(source, all, k), k, result.getError(), result.getScore());
  }
  return diagram;
}
