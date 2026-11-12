/**
 * `ChenEerDiagramFactory`: the Chen diagram's command list, in upstream's order, and
 * `PSystemCommandFactory#createSystem`'s per-line loop over it. An empty block never reaches `parse`: the
 * dispatcher answers `buildEmptyError` for every command factory (`dispatcher.ts#isEmptyDescription`,
 * PSystemCommandFactory.java:117-122). `finalizeDiagram`'s `checkFinalError` is `AbstractDiagram`'s null and
 * `makeDiagramReady`/`isIncomplete` are its no-ops, so there is a single pass. The shape is
 * `activity-legacy/ActivityDiagramFactory.ts` (cheneer D2): every cheneer command is a `SingleLineCommand2`, so the
 * multi-line and UBrex wrappers are not carried.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/ChenEerDiagramFactory.java:50-81
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandControl } from '../../core/command/CommandControl.js';
import { CommandRankDir } from '../../core/command/CommandRankDir.js';
import { ParserPass } from '../../core/command/ParserPass.js';
import type { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { InternalEmojiStore } from '../../core/internal-emoji-store.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { createSpriteRegistry } from '../../core/sprite-registry.js';
import type { Previous } from '../../core/TitledDiagram.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { LineLocationImpl } from '../../core/tim/LineLocationImpl.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { Warning } from '../../core/warning/Warning.js';
import { ChenEerSkinParam } from './cheneer-skin-param.js';
import { ChenEerDiagram } from './ChenEerDiagram.js';
import { addCommonCommands1, type DispatchOutcome } from './common-commands-1.js';
import { CommandAssociate } from './command/CommandAssociate.js';
import { CommandCreateAttribute } from './command/CommandCreateAttribute.js';
import { CommandCreateEntity } from './command/CommandCreateEntity.js';
import { CommandEndGroup } from './command/CommandEndGroup.js';
import { CommandMultiSubclass } from './command/CommandMultiSubclass.js';
import { CommandSimpleSubclass } from './command/CommandSimpleSubclass.js';
import {
  createStyleDispatch,
  executeDeclarationsBefore,
  positionOf,
  type StyleDispatch,
} from './cheneer-style-dispatch.js';

/** `@startchen`/`@endchen`, tolerated in a hand-built source. */
const START_END_RE = /^@(start|end)chen\s*$/i;
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

/** Where the command at line `index` stands: the source and the index. */
export interface CommandInput {
  readonly diagram: ChenEerDiagram;
  readonly source: UmlSource;
  readonly lines: readonly string[];
  readonly index: number;
  readonly location: LineLocation;
}

/** One upstream `Command`: its name (the Java class) and the claim it makes on line `input.index`. */
export interface ChenCommand {
  readonly name: string;
  /** `Command#isValid` then `execute`: `undefined` when the command does not claim the line. */
  tryExecute(input: CommandInput): DispatchOutcome | undefined;
}

/** A `SingleLineCommand2`: `isValid` answers `OK`, then `execute` runs it. */
function singleLine(name: string, command: SingleLineCommand2<ChenEerDiagram>): ChenCommand {
  return {
    name,
    tryExecute({ diagram, lines, index, location }) {
      const line = new StringLocated(lines[index]!, location);
      if (command.isValid(line) !== CommandControl.OK) return undefined;
      return { result: command.execute(diagram, line, ParserPass.ONE), nextIndex: index + 1 };
    },
  };
}

/** `CommonCommands.addCommonCommands1(cmds)`, one entry for its whole block (`common-commands-1.ts`). */
const COMMON_COMMANDS_1: ChenCommand = {
  name: 'CommonCommands.addCommonCommands1',
  tryExecute: ({ diagram, lines, index }) => addCommonCommands1(diagram, lines, index) ?? undefined,
};

/**
 * `ChenEerDiagramFactory#initCommandsList`.
 * @see ChenEerDiagramFactory.java:57-69
 */
export function initCommandsList(): readonly ChenCommand[] {
  return [
    COMMON_COMMANDS_1,
    singleLine('CommandRankDir', new CommandRankDir<ChenEerDiagram>()),

    singleLine('CommandCreateEntity', new CommandCreateEntity()),
    singleLine('CommandCreateAttribute', new CommandCreateAttribute()),
    singleLine('CommandAssociate', new CommandAssociate()),
    singleLine('CommandEndGroup', new CommandEndGroup()),
    singleLine('CommandSimpleSubclass', new CommandSimpleSubclass()),
    singleLine('CommandMultiSubclass', new CommandMultiSubclass()),
  ];
}

/** `createEmptyDiagram`. @see ChenEerDiagramFactory.java:71-80 */
export function createEmptyDiagram(
  source: UmlSource,
  previous: Previous | undefined,
  preprocessing: PreprocessingArtifact,
  skinParam: ChenEerSkinParam,
): ChenEerDiagram {
  return new ChenEerDiagram(source, previous, preprocessing, skinParam);
}

/** The DOCUMENT-relative line a refusal at interior index `i` names. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
}

/** The `LineLocation` of source line `i`: the DOCUMENT-relative position a refusal and an entity carry. */
function locationOf(source: UmlSource, i: number): LineLocation {
  return new LineLocationImpl(LOCATION_DESCRIPTION, undefined, refusalLineOf(source, i));
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: ChenEerDiagram, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `getCandidate`: the first command, in list order, that claims the line. */
function getCandidate(commands: readonly ChenCommand[], input: CommandInput): DispatchOutcome | undefined {
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
  diagram: ChenEerDiagram,
  source: UmlSource,
  dispatch: StyleDispatch,
  commands: readonly ChenCommand[],
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
 * @see ChenEerDiagramFactory.java:57-81, PSystemCommandFactory.java:107-153
 */
export function parseChen(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  emoji?: InternalEmojiStore,
): ChenEerDiagram | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new ChenEerSkinParam({
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
