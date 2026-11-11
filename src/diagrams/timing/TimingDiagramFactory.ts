/**
 * `TimingDiagramFactory`: `CommonCommands.addCommonCommands1` first, then the timing commands in
 * `initCommandsList` order (which decides the command that claims a line), and `PSystemCommandFactory#createSystem`'s
 * per-line loop over them. `CommandStopAt` stays a comment (tep D1). An empty block never reaches `parseTiming`:
 * the dispatcher answers `buildEmptyError` (the Welcome page) for every command factory
 * (`dispatcher.ts#isEmptyDescription`, PSystemCommandFactory.java:117-122). `finalizeDiagram`'s `checkFinalError` is
 * `AbstractDiagram`'s null; there is one pass.
 *
 * The dispatch (`singleLine`, `multiLine`, `executeProtected`) is `ebnf/PSystemEbnfFactory.ts`'s, copied (every
 * engine keeps its own, tep D2). The skin param is built here, as nwdiag's and regex's are.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagramFactory.java:55-110
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { CommandFootboxIgnored } from '../../core/command/CommandFootboxIgnored.js';
import type { MultilineCommand } from '../../core/command/CommandMultilines2.js';
import { isMultilineCommandOk } from '../../core/command/multiline-candidate.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import type { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import { DEFAULT_CLOCK } from '../../core/clock.js';
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
import { CommandAnalog } from './command/CommandAnalog.js';
import { CommandAtPlayer } from './command/CommandAtPlayer.js';
import { CommandAtTime } from './command/CommandAtTime.js';
import { CommandBinary } from './command/CommandBinary.js';
import { CommandChangeStateByPlayerCode } from './command/CommandChangeStateByPlayerCode.js';
import { CommandChangeStateByTime } from './command/CommandChangeStateByTime.js';
import { CommandClock } from './command/CommandClock.js';
import { CommandConstraint } from './command/CommandConstraint.js';
import { CommandDefineStateLong } from './command/CommandDefineStateLong.js';
import { CommandDefineStateShort } from './command/CommandDefineStateShort.js';
import { CommandHideTimeAxis } from './command/CommandHideTimeAxis.js';
import { CommandHighlight } from './command/CommandHighlight.js';
import { CommandModeCompact } from './command/CommandModeCompact.js';
import { CommandNote } from './command/CommandNote.js';
import { CommandNoteLong } from './command/CommandNoteLong.js';
import { CommandPixelHeight } from './command/CommandPixelHeight.js';
import { CommandRobustConcise } from './command/CommandRobustConcise.js';
import { CommandScalePixel } from './command/CommandScalePixel.js';
import { CommandTicks } from './command/CommandTicks.js';
import { CommandTimeMessage } from './command/CommandTimeMessage.js';
import { CommandUseDateFormat } from './command/CommandUseDateFormat.js';
import { TimingDiagram } from './TimingDiagram.js';
import { SkinParam } from './timing-skin-param.js';
import { addCommonCommands1, type DispatchOutcome } from './timing-common-commands.js';
import {
  createStyleDispatch,
  executeDeclarationsBefore,
  positionOf,
  type StyleDispatch,
} from './timing-style-dispatch.js';

/** `@startuml`/`@enduml`, tolerated in a hand-built source. */
const START_END_RE = /^@(start|end)uml\s*$/i;
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
  readonly diagram: TimingDiagram;
  readonly source: UmlSource;
  readonly lines: readonly string[];
  readonly index: number;
  readonly location: LineLocation;
}

/** One upstream `Command`: its name (the Java class) and the claim it makes on line `input.index`. */
interface TimingCommand {
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
 * `AbstractDiagram#executeCommand`: every command's `execute` runs inside a `ProtectedCommand`, so a throw (a Java
 * `NullPointerException`, a `NumberFormatException`) is an execution error at that line, not a crash. `isValid`
 * runs outside it, as upstream's `getCandidate` does.
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
function singleLine(name: string, command: SingleLineCommand2<TimingDiagram>): TimingCommand {
  return {
    name,
    tryExecute({ diagram, lines, index, location }) {
      const line = new StringLocated(lines[index]!, location);
      if (command.isValid(line) !== CommandControl.OK) return undefined;
      return { result: executeProtected(() => command.execute(diagram, line, ParserPass.ONE)), nextIndex: index + 1 };
    },
  };
}

/** The document-relative line source line `i` reports. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
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
function multiLine(name: string, command: MultilineCommand<TimingDiagram>): TimingCommand {
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

/** `CommonCommands.addCommonCommands1(cmds)`, one entry for its whole block (`timing-common-commands.ts`). */
const COMMON_COMMANDS_1: TimingCommand = {
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

/**
 * The order is the contract: it decides which command claims a line.
 * @see TimingDiagramFactory.java:83-109
 */
export function initCommandsList(): readonly TimingCommand[] {
  return [
    COMMON_COMMANDS_1,
    singleLine('CommandFootboxIgnored', new CommandFootboxIgnored<TimingDiagram>()),
    singleLine('CommandRobustConcise', new CommandRobustConcise()),
    singleLine('CommandClock', new CommandClock()),
    singleLine('CommandAnalog', new CommandAnalog()),
    singleLine('CommandBinary', new CommandBinary()),
    singleLine('CommandDefineStateShort', new CommandDefineStateShort()),
    singleLine('CommandDefineStateLong', new CommandDefineStateLong()),
    singleLine('CommandChangeStateByPlayerCode', new CommandChangeStateByPlayerCode()),
    singleLine('CommandChangeStateByTime', new CommandChangeStateByTime()),
    singleLine('CommandAtTime', new CommandAtTime()),
    singleLine('CommandAtPlayer', new CommandAtPlayer()),
    singleLine('CommandTimeMessage', new CommandTimeMessage()),
    singleLine('CommandNote', new CommandNote()),
    multiLine('CommandNoteLong', new CommandNoteLong()),
    singleLine('CommandConstraint', new CommandConstraint()),
    singleLine('CommandScalePixel', new CommandScalePixel()),
    singleLine('CommandHideTimeAxis', new CommandHideTimeAxis()),
    singleLine('CommandHighlight', new CommandHighlight()),
    singleLine('CommandModeCompact', new CommandModeCompact()),
    singleLine('CommandTicks', new CommandTicks()),
    singleLine('CommandPixelHeight', new CommandPixelHeight()),
    singleLine('CommandUseDateFormat', new CommandUseDateFormat()),
    // cmds.add(new CommandStopAt());
  ];
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: TimingDiagram, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `getCandidate`: the first command, in list order, that claims line `i`. */
function getCandidate(commands: readonly TimingCommand[], input: CommandInput): DispatchOutcome | undefined {
  for (const command of commands) {
    const outcome = command.tryExecute(input);
    if (outcome !== undefined) return outcome;
  }
  return undefined;
}

/**
 * `PSystemCommandFactory#createSystem`'s loop. A refusal's `consumed` is the trace, which counts the offending
 * line (java:171-174, 180-185).
 */
function executeCommands(
  diagram: TimingDiagram,
  source: UmlSource,
  dispatch: StyleDispatch,
  commands: readonly TimingCommand[],
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
    const { result, nextIndex } = outcome;
    if (!result.isOk()) {
      return refuse('execution', refusalLineOf(source, i), nextIndex, result.getError(), result.getScore());
    }
    i = nextIndex;
  }
  return null;
}

/**
 * `createEmptyDiagram` with the skin param built here, then `createSystem`'s per-line dispatch.
 * @param emoji port-only Twemoji artwork store (ADR-2), carried in the sprite registry as nwdiag carries it.
 * @param zone the zone `use date format` formats in; the JVM default upstream, the injected clock's here (D4).
 * @see TimingDiagramFactory.java:60-66, PSystemCommandFactory.java:107-153
 */
export function parseTiming(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  emoji?: InternalEmojiStore,
  zone: string = DEFAULT_CLOCK.zone,
): TimingDiagram | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(undefined, emoji),
    pragma: Pragma.createEmpty(),
  });
  const diagram = new TimingDiagram(source, preprocessing, skinParam, zone);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch, initCommandsList());
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the draw reads.
  const styleRefusal = executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  return styleRefusal ?? diagram;
}
