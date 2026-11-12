/**
 * `BpmDiagramFactory`: a `PSystemCommandFactory` with exactly the seven BPM
 * commands and no `CommonCommands` (D3, D5), so a blank line, `title`,
 * `skinparam`, `<style>`, `scale` or `sprite` is not a command here.
 *
 * The walk is `HelpFactory.ts`'s: upstream's `UmlSource` lines
 * (`upstreamLinesOf`), one `SingleLineCommand2` per line, `Syntax Error?`
 * on the first line no command takes. The empty test is the dispatcher's
 * (`PSystemCommandFactory.java:117-122`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmDiagramFactory.java:48-71
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
import { BpmDiagram } from './BpmDiagram.js';
import { CommandDockedEvent } from './CommandDockedEvent.js';
import { CommandElseBranch } from './CommandElseBranch.js';
import { CommandEndBranch } from './CommandEndBranch.js';
import { CommandGoto } from './CommandGoto.js';
import { CommandMerge } from './CommandMerge.js';
import { CommandNewBranch } from './CommandNewBranch.js';
import { CommandResume } from './CommandResume.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:170 */
const SYNTAX_ERROR = 'Syntax Error?';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmDiagramFactory.java:54-63 */
export function initCommandsList(): readonly SingleLineCommand2<BpmDiagram>[] {
  return [
    new CommandDockedEvent(),
    new CommandMerge(),
    new CommandResume(),
    new CommandGoto(),
    new CommandNewBranch(),
    new CommandElseBranch(),
    new CommandEndBranch(),
  ];
}

/** The asset stores out of `ParseOptions` (ADR-2). */
function classpathOf(options: ParseOptions | undefined): SkinParamClasspath | undefined {
  const store = options?.assetStore;
  if (store === undefined) return undefined;
  return { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
}

/**
 * `createSystem` over `ParserPass.ONE`, the diagram's only required pass:
 * each line up to the end directive must be one BPM command, else
 * `Syntax Error?` on it. A refusal's `consumed` is the document index of
 * the offending line (`HelpFactory.ts`'s scale).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-140
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:165-190
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmDiagramFactory.java:65-69
 */
export function parseBpm(source: UmlSource, options?: ParseOptions): BpmDiagram | ParseRefusal {
  const all = upstreamLinesOf(source);
  if (!isStartDirective(all[0]!)) throw new Error('UnsupportedOperationException');
  const diagram = new BpmDiagram(source, preprocessingArtifactOf(source), classpathOf(options));
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
