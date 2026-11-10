/**
 * `PSystemRegexFactory`: `CommonCommands.addCommonCommands1` first, then `CommandRegexfSingleLine`, and
 * `PSystemCommandFactory#createSystem`'s per-line loop over them. Upstream's two commented-out registrations stay
 * comments (rep D2). An empty block never reaches `parseRegex`: the dispatcher answers `buildEmptyError` (the Welcome
 * page) for every command factory (`dispatcher.ts#isEmptyDescription`, PSystemCommandFactory.java:117-122, rep D5
 * kind 1). `finalizeDiagram`'s `checkFinalError` is `AbstractDiagram`'s null; there is one pass.
 *
 * The `singleLine` wrapper and `executeProtected` are `ebnf/PSystemEbnfFactory.ts`'s, copied (every engine keeps
 * its own dispatch, rep D2).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/PSystemRegexFactory.java:49-69
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import type { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { InternalEmojiStore } from '../../core/internal-emoji-store.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { createSpriteRegistry } from '../../core/sprite-registry.js';
import { LineLocationImpl } from '../../core/tim/LineLocationImpl.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { versionString } from '../../core/version.js';
import { Warning } from '../../core/warning/Warning.js';
import { CommandRegexfSingleLine } from './CommandRegexfSingleLine.js';
import { PSystemRegex } from './PSystemRegex.js';
import { addCommonCommands1, type DispatchOutcome } from './regex-common-commands.js';
import { SkinParam } from './regex-skin-param.js';
import {
  createStyleDispatch,
  executeDeclarationsBefore,
  positionOf,
  type StyleDispatch,
} from './regex-style-dispatch.js';

/** `@startregex`/`@endregex`, tolerated in a hand-built source. */
const START_END_RE = /^@(start|end)regex\s*$/i;
/** The standard error text of a line no command matches. @see command/PSystemCommandFactory.java:169-175 */
const SYNTAX_ERROR = 'Syntax Error?';
/** The location description of a source string. @see LineLocation.getDescription */
const LOCATION_DESCRIPTION = 'string';

/** The `new Warning(…)` texts `CommandSkinParam#executeArg` adds, by lower-cased skin parameter name.
 *  @see command/CommandSkinParam.java:88-99 */
const SKINPARAM_WARNINGS: ReadonlyMap<string, string> = new Map([
  ['handwritten', "Please use '!option handwritten true' to enable handwritten "],
  ['participantpadding', 'Please use CSS style instead of skinparam ParticipantPadding'],
  ['padding', 'Please use CSS style instead of skinparam padding'],
]);

/** Where the command at line `index` stands. */
interface CommandInput {
  readonly diagram: PSystemRegex;
  readonly source: UmlSource;
  readonly lines: readonly string[];
  readonly index: number;
  readonly location: LineLocation;
}

/** One upstream `Command`: its name (the Java class) and the claim it makes on line `input.index`. */
interface RegexCommand {
  readonly name: string;
  /** `Command#isValid` then `execute`: `undefined` when the command does not claim the line. */
  tryExecute(input: CommandInput): DispatchOutcome | undefined;
}

/** `ProtectedCommand#execute`'s message, before the throwable's `toString()`. @see command/ProtectedCommand.java:68-75 */
function protectedMessage(t: unknown): string {
  const detail = t instanceof Error ? t.message : String(t);
  return `You should send a mail to plantuml@gmail.com with this log (V${versionString()}) ${detail}`;
}

/**
 * `AbstractDiagram#executeCommand`: every command's `execute` runs inside a `ProtectedCommand`, so a throw (the
 * tokenizer's `IllegalStateException` on an unterminated string, `cov-unterminated`) is an execution error, not a
 * crash. `isValid` runs outside it, as upstream's `getCandidate` does.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/AbstractDiagram.java:173-180
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/ProtectedCommand.java:54-77
 */
function executeProtected(execute: () => CommandExecutionResult): CommandExecutionResult {
  try {
    return execute();
  } catch (t) {
    return CommandExecutionResult.error(protectedMessage(t));
  }
}

/** A `SingleLineCommand2`: `isValid` `OK`, then `execute`. */
function singleLine(name: string, command: SingleLineCommand2<PSystemRegex>): RegexCommand {
  return {
    name,
    tryExecute({ diagram, lines, index, location }) {
      const line = new StringLocated(lines[index]!, location);
      if (command.isValid(line) !== CommandControl.OK) return undefined;
      return { result: executeProtected(() => command.execute(diagram, line, ParserPass.ONE)), nextIndex: index + 1 };
    },
  };
}

/** The `LineLocation` of source line `i`. */
function locationOf(source: UmlSource, i: number): LineLocation {
  return new LineLocationImpl(LOCATION_DESCRIPTION, undefined, refusalLineOf(source, i));
}

/** `CommonCommands.addCommonCommands1(cmds)`, one entry for its whole block (`regex-common-commands.ts`). */
const COMMON_COMMANDS_1: RegexCommand = {
  name: 'CommonCommands.addCommonCommands1',
  tryExecute: ({ diagram, lines, index }) => {
    try {
      return addCommonCommands1(diagram, lines, index) ?? undefined;
    } catch (t) {
      // A common command's `execute` throwing (`Integer.parseInt` past `int`): `ProtectedCommand`'s error.
      return { result: CommandExecutionResult.error(protectedMessage(t)), nextIndex: index + 1 };
    }
  },
};

/** @see PSystemRegexFactory.java:55-61 */
export function initCommandsList(): readonly RegexCommand[] {
  return [
    COMMON_COMMANDS_1,
    // cmds.add(new CommandUseDescriptiveNames());
    // cmds.add(new CommandLanguage());
    singleLine('CommandRegexfSingleLine', new CommandRegexfSingleLine()),
  ];
}

/** The DOCUMENT-relative line a refusal at interior index `i` names. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: PSystemRegex, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `getCandidate`: the first command, in list order, that claims line `i`. */
function getCandidate(commands: readonly RegexCommand[], input: CommandInput): DispatchOutcome | undefined {
  for (const command of commands) {
    const outcome = command.tryExecute(input);
    if (outcome !== undefined) return outcome;
  }
  return undefined;
}

/** A failed command's refusal: its error text and score. */
function executionRefusal(
  source: UmlSource,
  i: number,
  nextIndex: number,
  result: CommandExecutionResult,
): ParseRefusal {
  return refuse('execution', refusalLineOf(source, i), nextIndex, result.getError(), result.getScore());
}

/**
 * `PSystemCommandFactory#createSystem`'s loop. A refusal's `consumed` is the trace, which counts the offending
 * line (java:171-174, 180-185).
 */
function executeCommands(
  diagram: PSystemRegex,
  source: UmlSource,
  dispatch: StyleDispatch,
  commands: readonly RegexCommand[],
): ParseRefusal | null {
  const lines = source.lines;
  let i = 0;
  while (i < lines.length) {
    const styleRefusal = executeDeclarationsBefore(dispatch, positionOf(source, i));
    if (styleRefusal !== null) return styleRefusal;
    if (START_END_RE.test(lines[i]!.trim())) {
      i++;
      continue;
    }
    const outcome = getCandidate(commands, { diagram, source, lines, index: i, location: locationOf(source, i) });
    if (outcome === undefined) return refuse('syntax', refusalLineOf(source, i), i + 1, SYNTAX_ERROR);
    if (!outcome.result.isOk()) return executionRefusal(source, i, outcome.nextIndex, outcome.result);
    i = outcome.nextIndex;
  }
  return null;
}

/**
 * `createEmptyDiagram` with the skin param built here (as board's and nwdiag's), then `createSystem`'s per-line
 * dispatch and `finalizeDiagram`.
 * @param emoji port-only Twemoji artwork store (ADR-2), carried in the sprite registry as board carries it.
 * @see PSystemRegexFactory.java:63-67, PSystemCommandFactory.java:107-153
 */
export function parseRegex(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  emoji?: InternalEmojiStore,
): PSystemRegex | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(undefined, emoji),
    pragma: Pragma.createEmpty(),
  });
  const diagram = new PSystemRegex(source, preprocessing, skinParam);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch, initCommandsList());
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the export reads.
  const styleRefusal = executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  return styleRefusal ?? diagram;
}
