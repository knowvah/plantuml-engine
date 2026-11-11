/**
 * `HelpFactory`: a `PSystemCommandFactory` with exactly the five `help`
 * commands and no `CommonCommands`, so a `title`, `scale`, `skinparam`,
 * `<style>` or blank line anywhere in the block is `Syntax Error?` here
 * (`cov-help-title`, `cov-help-skinparam`, `cov-help-style`).
 *
 * The lines walked are upstream's `UmlSource` (`seedSourceLines`): the
 * preprocessor's directive-stripped `lines` drop the `skinparam` and
 * `<style>` lines this factory must refuse. The empty test is the
 * dispatcher's (`PSystemCommandFactory.java:117-122`); the plugin keeps the
 * default `factoryBase`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/HelpFactory.java
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
import { CommandHelpColor } from './CommandHelpColor.js';
import { CommandHelpFont } from './CommandHelpFont.js';
import { CommandHelpKeyword } from './CommandHelpKeyword.js';
import { CommandHelpTheme } from './CommandHelpTheme.js';
import { CommandHelpType } from './CommandHelpType.js';
import { Help } from './Help.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:170 */
const SYNTAX_ERROR = 'Syntax Error?';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/HelpFactory.java:62-69 */
export function initCommandsList(): readonly SingleLineCommand2<Help>[] {
  return [
    new CommandHelpColor(),
    new CommandHelpFont(),
    new CommandHelpKeyword(),
    new CommandHelpType(),
    new CommandHelpTheme(),
  ];
}

/** The asset stores out of `ParseOptions` (ADR-2). */
function classpathOf(options: ParseOptions | undefined): SkinParamClasspath | undefined {
  const store = options?.assetStore;
  if (store === undefined) return undefined;
  return { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
}

/**
 * `createSystem` (`ParserPass.ONE` is `Help`'s only required pass): each line
 * up to the end directive must be one `help` command, else `Syntax Error?` on
 * it. A refusal's `consumed` is upstream's `trace.size() - 1`, the document
 * index of the offending line (`PSystemSingleLineFactory.ts`'s scale).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-140
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:165-190
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:223-247
 */
export function parseHelp(source: UmlSource, options?: ParseOptions): Help | ParseRefusal {
  const all = upstreamLinesOf(source);
  if (!isStartDirective(all[0]!)) throw new Error('UnsupportedOperationException');
  const diagram = new Help(source, preprocessingArtifactOf(source), classpathOf(options));
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
