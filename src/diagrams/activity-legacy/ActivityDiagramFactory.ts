/**
 * `ActivityDiagramFactory`: the legacy activity diagram's command list, in upstream's order, and
 * `PSystemCommandFactory#createSystem`'s per-line loop over it. An empty block never reaches `parse`: the
 * dispatcher answers `buildEmptyError` for every command factory (`dispatcher.ts#isEmptyDescription`,
 * PSystemCommandFactory.java:117-122). `finalizeDiagram`'s `checkFinalError` is `AbstractDiagram`'s null and
 * `makeDiagramReady`/`isIncomplete` are its no-ops (AbstractDiagram.java:161-171); `getRequiredPass` is
 * `{ONE}` (java:241-243), so there is a single pass.
 *
 * Every command of the upstream list is ported (T1a-T1d); none is pending.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/ActivityDiagramFactory.java:60-102
 */
import type { InternalEmojiStore } from '../../core/internal-emoji-store.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import type { MultilineCommand } from '../../core/command/CommandMultilines2.js';
import { isMultilineCommandOk } from '../../core/command/multiline-candidate.js';
import { CommandFactoryNoteOnLink } from '../../core/command/note/CommandFactoryNoteOnLink.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import { UBrexCommandFootboxIgnored } from '../../core/command/UBrexCommandFootboxIgnored.js';
import { UBrexCommandHideShow2 } from '../../core/command/UBrexCommandHideShow2.js';
import { UBrexCommandRankDir } from '../../core/command/UBrexCommandRankDir.js';
import type { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { UBrexSingleLineCommand2 } from '../../core/command/UBrexSingleLineCommand2.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { createSpriteRegistry } from '../../core/sprite-registry.js';
import type { Previous } from '../../core/TitledDiagram.js';
import { LineLocationImpl } from '../../core/tim/LineLocationImpl.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { BlocLines } from '../../core/utils/BlocLines.js';
import { Warning } from '../../core/warning/Warning.js';
import { ActivityDiagram } from './ActivityDiagram.js';
import { CommandFactoryNoteActivity } from './command/CommandFactoryNoteActivity.js';
import { CommandLinkActivity } from './command/CommandLinkActivity.js';
import { CommandLinkLongActivity } from './command/CommandLinkLongActivity.js';
import { UBrexCommandElse } from './command/UBrexCommandElse.js';
import { UBrexCommandEndif } from './command/UBrexCommandEndif.js';
import { UBrexCommandEndPartition } from './command/UBrexCommandEndPartition.js';
import { UBrexCommandIf } from './command/UBrexCommandIf.js';
import { UBrexCommandPartition } from './command/UBrexCommandPartition.js';
import { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';
import { addCommonCommands1, type DispatchOutcome } from './common-commands-1.js';
import {
  createStyleDispatch,
  executeDeclarationsBefore,
  positionOf,
  type StyleDispatch,
} from './legacy-style-dispatch.js';

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

/**
 * Where the command at line `i` stands: the source and the index. `location` is the `LineLocation` the
 * entities it creates carry (`StringLocated#getLocation`).
 */
export interface CommandInput {
  readonly diagram: ActivityDiagram;
  readonly source: UmlSource;
  readonly lines: readonly string[];
  readonly index: number;
  readonly location: LineLocation;
}

/** One upstream `Command`: its name (the Java class) and the claim it makes on line `input.index`. */
export interface LegacyCommand {
  readonly name: string;
  /** `Command#isValid` then `execute`: `undefined` when the command does not claim the line. */
  tryExecute(input: CommandInput): DispatchOutcome | undefined;
}

/** A `UBrexSingleLineCommand2`: `isValid` answers `OK`, then `execute` runs it. */
function ubrex(name: string, command: UBrexSingleLineCommand2<ActivityDiagram>): LegacyCommand {
  return {
    name,
    tryExecute({ diagram, lines, index, location }) {
      const line = new StringLocated(lines[index]!, location);
      if (command.isValid(line) !== CommandControl.OK) return undefined;
      return { result: command.execute(diagram, line, ParserPass.ONE), nextIndex: index + 1 };
    },
  };
}

/** A `SingleLineCommand2`: `isValid` answers `OK`, then `execute` runs it. */
function singleLine(name: string, command: SingleLineCommand2<ActivityDiagram>): LegacyCommand {
  return {
    name,
    tryExecute({ diagram, lines, index, location }) {
      const line = new StringLocated(lines[index]!, location);
      if (command.isValid(line) !== CommandControl.OK) return undefined;
      return { result: command.execute(diagram, line, ParserPass.ONE), nextIndex: index + 1 };
    },
  };
}

/** The `LineLocation` of source line `i`: the DOCUMENT-relative position a refusal and an entity carry. */
function locationOf(source: UmlSource, i: number): LineLocation {
  return new LineLocationImpl(LOCATION_DESCRIPTION, undefined, refusalLineOf(source, i));
}

/**
 * A multi-line `Command` (`CommandMultilines2`): `getCandidate`'s two branches. `isValid(single)` answering `OK`
 * runs the one line; `OK_PARTIAL` reads on, one line per round (`isMultilineCommandOk`), and a command that finds
 * no block does not claim the line (`continue` upstream).
 * @see PSystemCommandFactory.java:223-248
 */
function multiLine(name: string, command: MultilineCommand<ActivityDiagram>): LegacyCommand {
  return {
    name,
    tryExecute({ diagram, source, lines, index }) {
      const lineAt = (j: number): StringLocated => new StringLocated(lines[j]!, locationOf(source, j));
      const single = BlocLines.single(lineAt(index));
      const control = command.isValid(single);
      if (control === CommandControl.OK)
        return { result: command.execute(diagram, single, ParserPass.ONE), nextIndex: index + 1 };
      if (control !== CommandControl.OK_PARTIAL) return undefined;

      const step = isMultilineCommandOk(lineAt, lines.length, index, command);
      if (step === undefined) return undefined;
      return { result: command.execute(diagram, step.lines, ParserPass.ONE), nextIndex: step.nextIndex };
    },
  };
}

/** `CommonCommands.addCommonCommands1(cmds)`, one entry for its whole block (`common-commands-1.ts`). */
const COMMON_COMMANDS_1: LegacyCommand = {
  name: 'CommonCommands.addCommonCommands1',
  tryExecute: ({ diagram, lines, index }) => addCommonCommands1(diagram, lines, index) ?? undefined,
};

/**
 * `ActivityDiagramFactory#initCommandsList`.
 * @see ActivityDiagramFactory.java:75-100
 */
export function initCommandsList(): readonly LegacyCommand[] {
  const noteActivity = new CommandFactoryNoteActivity();
  const noteOnLink = new CommandFactoryNoteOnLink(ParserPass.ONE);
  return [
    ubrex('UBrexCommandFootboxIgnored', new UBrexCommandFootboxIgnored<ActivityDiagram>()),
    COMMON_COMMANDS_1,
    ubrex('UBrexCommandRankDir', new UBrexCommandRankDir<ActivityDiagram>()),

    ubrex('UBrexCommandPartition', new UBrexCommandPartition()),
    ubrex('UBrexCommandEndPartition', new UBrexCommandEndPartition()),
    multiLine('CommandLinkLongActivity', new CommandLinkLongActivity()),

    singleLine('CommandFactoryNoteActivity.createSingleLine', noteActivity.createSingleLine()),
    multiLine('CommandFactoryNoteActivity.createMultiLine(false)', noteActivity.createMultiLine(false)),

    singleLine('CommandFactoryNoteOnLink.createSingleLine', noteOnLink.createSingleLine()),
    multiLine('CommandFactoryNoteOnLink.createMultiLine(false)', noteOnLink.createMultiLine(false)),

    ubrex('UBrexCommandIf', new UBrexCommandIf()),
    ubrex('UBrexCommandElse', new UBrexCommandElse()),
    ubrex('UBrexCommandEndif', new UBrexCommandEndif()),

    singleLine('CommandLinkActivity', new CommandLinkActivity()),
    ubrex('UBrexCommandHideShow2', new UBrexCommandHideShow2()),
    // addCommand(new CommandInnerConcurrent(system)); -- commented out upstream (java:98)
  ];
}

/** `createEmptyDiagram`. @see ActivityDiagramFactory.java:67-72 */
export function createEmptyDiagram(
  source: UmlSource,
  previous: Previous | undefined,
  preprocessing: PreprocessingArtifact,
  skinParam: ActivityLegacySkinParam,
): ActivityDiagram {
  return new ActivityDiagram(source, previous, preprocessing, skinParam);
}

/** The DOCUMENT-relative line a refusal at interior index `i` names. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: ActivityDiagram, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `getCandidate`: the first command, in list order, that claims line `i`. */
function getCandidate(commands: readonly LegacyCommand[], input: CommandInput): DispatchOutcome | undefined {
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
  diagram: ActivityDiagram,
  source: UmlSource,
  dispatch: StyleDispatch,
  commands: readonly LegacyCommand[],
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
    const location = locationOf(source, i);
    const outcome = getCandidate(commands, { diagram, source, lines, index: i, location });
    if (outcome === undefined) return refuse('syntax', refusalLineOf(source, i), i + 1, SYNTAX_ERROR);
    if (!outcome.result.isOk()) {
      const { result, nextIndex } = outcome;
      return refuse('execution', refusalLineOf(source, i), nextIndex, result.getError(), result.getScore());
    }
    i = outcome.nextIndex;
  }
  return null;
}

/**
 * `createEmptyDiagram` with the skin param built here, then `createSystem`'s per-line dispatch and
 * `finalizeDiagram`.
 * @param emoji port-only Twemoji artwork store (ADR-2), carried in the sprite registry as board carries it.
 * @see ActivityDiagramFactory.java:60-102, PSystemCommandFactory.java:107-153
 */
export function parseActivityLegacy(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  emoji?: InternalEmojiStore,
): ActivityDiagram | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new ActivityLegacySkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(undefined, emoji),
    pragma: Pragma.createEmpty(),
  });
  const diagram = createEmptyDiagram(source, undefined, preprocessing, skinParam);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch, initCommandsList());
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the export reads.
  const styleRefusal = executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  return styleRefusal ?? diagram;
}
