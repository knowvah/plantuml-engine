/**
 * `CrashDiagramFactory`: a `PSystemCommandFactory` on `DiagramType.CRASH`
 * (`@startcrash` alone carries it, `DiagramType.java:113-114`) with exactly
 * two commands and no `CommonCommands`, so `CommandCrashAny` swallows every
 * line `CommandSelectCrash` does not claim, `title`, `scale` and `skinparam`
 * included.
 *
 * The lines walked are upstream's `UmlSource` (`seedSourceLines`), as
 * `help/HelpFactory.ts` walks them: the preprocessor's directive-stripped
 * `lines` drop the `skinparam` lines this factory must swallow. The empty
 * test is the dispatcher's (`PSystemCommandFactory.java:117-122`); the
 * plugin keeps the default `factoryBase`.
 *
 * Each command runs inside `ProtectedCommand` (`AbstractDiagram
 * #executeCommand`), so `crash when parsing` is an execution error on its
 * line. `crash when finalizing` throws out of `finalizeDiagram`'s
 * `checkFinalError` -- out of `createSystem` -- for `PSystemBuilder`'s catch.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagramFactory.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-200
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { documentLineOf, preprocessingArtifactOf, upstreamLinesOf } from '../../core/command/PSystemBasicFactory.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import type { UBrexSingleLineCommand2 } from '../../core/command/UBrexSingleLineCommand2.js';
import type { ParseOptions } from '../../core/dispatcher.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';
import { internalSpriteStoreFrom } from '../../core/internal-sprite-store.js';
import { refuse } from '../../core/parse-refusal.js';
import type { ParseRefusal } from '../../core/parse-refusal.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { isEndDirective, isStartDirective } from '../../core/tim/StartUtils.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { versionString } from '../../core/version.js';
import { CommandCrashAny } from './CommandCrashAny.js';
import { CommandSelectCrash } from './CommandSelectCrash.js';
import { CrashDiagram } from './CrashDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:170 */
const SYNTAX_ERROR = 'Syntax Error?';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagramFactory.java:54-58 */
export function initCommandsList(): readonly UBrexSingleLineCommand2<CrashDiagram>[] {
  return [new CommandSelectCrash(), new CommandCrashAny()];
}

/** The asset stores out of `ParseOptions` (ADR-2). */
function classpathOf(options: ParseOptions | undefined): SkinParamClasspath | undefined {
  const store = options?.assetStore;
  if (store === undefined) return undefined;
  return { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
}

/**
 * `ProtectedCommand#execute`: a throw is an execution error carrying
 * `" " + t.toString()` (the port's thrown messages are Java's `toString()`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/ProtectedCommand.java:54-77
 */
function executeProtected(execute: () => CommandExecutionResult): CommandExecutionResult {
  try {
    return execute();
  } catch (t) {
    const detail = t instanceof Error ? t.message : String(t);
    const msg = `You should send a mail to plantuml@gmail.com with this log (V${versionString()}) ${detail}`;
    return CommandExecutionResult.error(msg, t instanceof Error ? t : undefined);
  }
}

/**
 * `createSystem` (`ParserPass.ONE` is the only required pass), then
 * `finalizeDiagram`'s `checkFinalError`. A refusal's `consumed` is upstream's
 * `trace.size() - 1`, the document index of the offending line
 * (`HelpFactory.ts`'s scale).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-200
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CrashDiagramFactory.java:60-64
 */
export function parseCrash(source: UmlSource, options?: ParseOptions): CrashDiagram | ParseRefusal {
  const all = upstreamLinesOf(source);
  if (!isStartDirective(all[0]!)) throw new Error('UnsupportedOperationException');
  const diagram = new CrashDiagram(source, preprocessingArtifactOf(source), classpathOf(options));
  const cmds = initCommandsList();
  let k = 1;
  for (; k < all.length && !isEndDirective(all[k]!); k++) {
    const line = new StringLocated(all[k]!, undefined);
    const cmd = cmds.find((c) => c.isValid(line) === CommandControl.OK);
    if (cmd === undefined) return refuse('syntax', documentLineOf(source, all, k), k, SYNTAX_ERROR);
    const result = executeProtected(() => cmd.execute(diagram, line, ParserPass.ONE));
    if (!result.isOk())
      return refuse('execution', documentLineOf(source, all, k), k, result.getError(), result.getScore());
  }
  // `finalizeDiagram`: `buildExecutionError` at `it.next()`, the end line (java:150-153).
  const err = diagram.checkFinalError();
  if (err !== undefined) return refuse('final', documentLineOf(source, all, k), k, err);
  return diagram;
}
