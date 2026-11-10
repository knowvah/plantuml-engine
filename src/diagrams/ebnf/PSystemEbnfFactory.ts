/**
 * `PSystemEbnfFactory`: `CommonCommands.addCommonCommands1` first, then the five EBNF commands in upstream order,
 * and `PSystemCommandFactory#createSystem`'s per-line loop over them. `CommandNoteMultilines` is in the package but
 * never registered (eep D4). An empty block never reaches `parseEbnf`: the dispatcher answers `buildEmptyError`
 * (the Welcome page) for every command factory (`dispatcher.ts#isEmptyDescription`, PSystemCommandFactory.java:
 * 117-122, eep D13). `finalizeDiagram`'s `checkFinalError` is `AbstractDiagram`'s null; there is one pass.
 *
 * The `ubrex`/`singleLine`/`multiLine` wrappers are `activity-legacy/ActivityDiagramFactory.ts`'s, the one factory
 * that already drives UBrex single-line and multi-line commands (eep D2).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/PSystemEbnfFactory.java:49-71
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { MultilineCommand } from '../../core/command/CommandMultilines2.js';
import { isMultilineCommandOk } from '../../core/command/multiline-candidate.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import type { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { UBrexSingleLineCommand2 } from '../../core/command/UBrexSingleLineCommand2.js';
import type { InternalEmojiStore } from '../../core/internal-emoji-store.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { createSpriteRegistry } from '../../core/sprite-registry.js';
import { LineLocationImpl } from '../../core/tim/LineLocationImpl.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { BlocLines } from '../../core/utils/BlocLines.js';
import { versionString } from '../../core/version.js';
import { Warning } from '../../core/warning/Warning.js';
import { CommandCommentMultilines } from './CommandCommentMultilines.js';
import { CommandCommentMultilines2 } from './CommandCommentMultilines2.js';
import { CommandEBnfSingleLine } from './CommandEBnfSingleLine.js';
import { addCommonCommands1, type DispatchOutcome } from './ebnf-common-commands.js';
import { SkinParam } from './ebnf-skin-param.js';
import {
  createStyleDispatch,
  executeDeclarationsBefore,
  positionOf,
  type StyleDispatch,
} from './ebnf-style-dispatch.js';
import { PSystemEbnf } from './PSystemEbnf.js';
import { UBrexCommandComment } from './UBrexCommandComment.js';
import { UBrexCommandEbnfMultilines } from './UBrexCommandEbnfMultilines.js';

/** `@startebnf`/`@endebnf`, tolerated in a hand-built source. */
const START_END_RE = /^@(start|end)ebnf\s*$/i;
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
  readonly diagram: PSystemEbnf;
  readonly source: UmlSource;
  readonly lines: readonly string[];
  readonly index: number;
  readonly location: LineLocation;
}

/** One upstream `Command`: its name (the Java class) and the claim it makes on line `input.index`. */
interface EbnfCommand {
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

/** A single-line command (`UBrexSingleLineCommand2` or `SingleLineCommand2`): `isValid` `OK`, then `execute`. */
function singleLine(
  name: string,
  command: UBrexSingleLineCommand2<PSystemEbnf> | SingleLineCommand2<PSystemEbnf>,
): EbnfCommand {
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

/**
 * A multi-line command: `getCandidate`'s two branches. `isValid(single)` answering `OK` runs the one line;
 * `OK_PARTIAL` reads on (`isMultilineCommandOk`); a command that finds no block does not claim the line.
 * @see PSystemCommandFactory.java:223-248
 */
function multiLine(name: string, command: MultilineCommand<PSystemEbnf>): EbnfCommand {
  return {
    name,
    tryExecute({ diagram, source, lines, index }) {
      const lineAt = (j: number): StringLocated => new StringLocated(lines[j]!, locationOf(source, j));
      const single = BlocLines.single(lineAt(index));
      const control = command.isValid(single);
      if (control === CommandControl.OK)
        return {
          result: executeProtected(() => command.execute(diagram, single, ParserPass.ONE)),
          nextIndex: index + 1,
        };
      if (control !== CommandControl.OK_PARTIAL) return undefined;

      const step = isMultilineCommandOk(lineAt, lines.length, index, command);
      if (step === undefined) return undefined;
      return {
        result: executeProtected(() => command.execute(diagram, step.lines, ParserPass.ONE)),
        nextIndex: step.nextIndex,
      };
    },
  };
}

/** `CommonCommands.addCommonCommands1(cmds)`, one entry for its whole block (`ebnf-common-commands.ts`). */
const COMMON_COMMANDS_1: EbnfCommand = {
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

/** @see PSystemEbnfFactory.java:55-63 */
export function initCommandsList(): readonly EbnfCommand[] {
  return [
    COMMON_COMMANDS_1,
    singleLine('UBrexCommandComment', new UBrexCommandComment()),
    multiLine('CommandCommentMultilines2', new CommandCommentMultilines2()),
    multiLine('CommandCommentMultilines', new CommandCommentMultilines()),
    singleLine('CommandEBnfSingleLine', new CommandEBnfSingleLine()),
    multiLine('UBrexCommandEbnfMultilines', new UBrexCommandEbnfMultilines()),
  ];
}

/** The DOCUMENT-relative line a refusal at interior index `i` names. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: PSystemEbnf, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `getCandidate`: the first command, in list order, that claims line `i`. */
function getCandidate(commands: readonly EbnfCommand[], input: CommandInput): DispatchOutcome | undefined {
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
  diagram: PSystemEbnf,
  source: UmlSource,
  dispatch: StyleDispatch,
  commands: readonly EbnfCommand[],
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
 * @see PSystemEbnfFactory.java:51-69, PSystemCommandFactory.java:107-153
 */
export function parseEbnf(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  emoji?: InternalEmojiStore,
): PSystemEbnf | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(undefined, emoji),
    pragma: Pragma.createEmpty(),
  });
  const diagram = new PSystemEbnf(source, preprocessing, skinParam);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch, initCommandsList());
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the export reads.
  const styleRefusal = executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  return styleRefusal ?? diagram;
}
