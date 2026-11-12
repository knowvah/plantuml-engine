/**
 * `ListSpriteDiagramFactory`: `CommonCommands.addCommonCommands1`, `addCommonCommands2` and `addCommonScaleCommands`
 * (the last two add nothing the first did not, `listsprite-common-commands.ts`), then `CommandListSprite`, and
 * `PSystemCommandFactory#createSystem`'s per-line loop over them. An empty block never reaches `parseListSprite`: the
 * dispatcher answers `buildEmptyError` (the Welcome page) for every command factory (`dispatcher.ts#isEmptyDescription`,
 * PSystemCommandFactory.java:117-122). `finalizeDiagram`'s `checkFinalError` is `AbstractDiagram`'s null; there is one
 * pass.
 *
 * The `singleLine` wrapper and `executeProtected` are `regex/PSystemRegexFactory.ts`'s, copied (every engine keeps
 * its own dispatch, rep D2; lsp D1).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/ListSpriteDiagramFactory.java:46-68
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:106-247
 */
import type { UmlSource } from '../../block-extractor.js';
import { CommandControl } from '../../command/CommandControl.js';
import { CommandExecutionResult } from '../../command/CommandExecutionResult.js';
import { preprocessingArtifactOf } from '../../command/PSystemBasicFactory.js';
import { ParserPass } from '../../command/ParserPass.js';
import type { SingleLineCommand2 } from '../../command/SingleLineCommand2.js';
import type { SyncPlugin } from '../../dispatcher.js';
import { internalEmojiStoreFrom, type InternalEmojiStore } from '../../internal-emoji-store.js';
import { internalSpriteStoreFrom, type InternalSpriteStore } from '../../internal-sprite-store.js';
import type { StringMeasurer } from '../../measurer.js';
import { refuse, type ParseRefusal } from '../../parse-refusal.js';
import { Pragma } from '../../skin/Pragma.js';
import { createSpriteRegistry } from '../../sprite-registry.js';
import { isEndDirective, isStartDirective } from '../../tim/StartUtils.js';
import { LineLocationImpl } from '../../tim/LineLocationImpl.js';
import type { LineLocation } from '../../tim/LineLocation.js';
import type { PreprocessingArtifact } from '../../tim/PreprocessingArtifact.js';
import { StringLocated } from '../../tim/StringLocated.js';
import type { TitledDiagram } from '../../TitledDiagram.js';
import { versionString } from '../../version.js';
import { Warning } from '../../warning/Warning.js';
import { CommandListSprite } from './CommandListSprite.js';
import { ListSpriteDiagram } from './ListSpriteDiagram.js';
import { addCommonCommands1, type DispatchOutcome } from './listsprite-common-commands.js';
import { renderListSprite } from './listsprite-export.js';
import { SkinParam } from './listsprite-skin-param.js';
import {
  createStyleDispatch,
  executeDeclarationsBefore,
  positionOf,
  type StyleDispatch,
} from './listsprite-style-dispatch.js';

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

/** The asset stores `createEmptyDiagram`'s skin param reads (ADR-2), port-only. */
export interface ListSpriteStores {
  readonly sprites?: InternalSpriteStore | undefined;
  readonly emoji?: InternalEmojiStore | undefined;
}

/** Where the command at line `index` stands. */
interface CommandInput {
  readonly diagram: ListSpriteDiagram;
  readonly lines: readonly string[];
  readonly index: number;
  readonly location: LineLocation;
}

/** One upstream `Command`: its name (the Java class) and the claim it makes on line `input.index`. */
interface ListSpriteCommand {
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
 * `AbstractDiagram#executeCommand`: every command's `execute` runs inside a `ProtectedCommand`, so a throw is an
 * execution error, not a crash. `isValid` runs outside it, as upstream's `getCandidate` does.
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
function singleLine(name: string, command: SingleLineCommand2<TitledDiagram>): ListSpriteCommand {
  return {
    name,
    tryExecute({ diagram, lines, index, location }) {
      const line = new StringLocated(lines[index]!, location);
      if (command.isValid(line) !== CommandControl.OK) return undefined;
      return { result: executeProtected(() => command.execute(diagram, line, ParserPass.ONE)), nextIndex: index + 1 };
    },
  };
}

/** `CommonCommands.addCommonCommands1(cmds)`, one entry for its whole block (`listsprite-common-commands.ts`). */
const COMMON_COMMANDS_1: ListSpriteCommand = {
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
 * `addCommonCommands1`, then `addCommonCommands2` and `addCommonScaleCommands` (folded into the first, whose block
 * already holds every command they add), then `CommandListSprite`.
 * @see ListSpriteDiagramFactory.java:52-58
 */
export function initCommandsList(): readonly ListSpriteCommand[] {
  return [COMMON_COMMANDS_1, singleLine('CommandListSprite', new CommandListSprite())];
}

/** The DOCUMENT-relative line a refusal at interior index `i` names. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
}

/** The `LineLocation` of source line `i`. */
function locationOf(source: UmlSource, i: number): LineLocation {
  return new LineLocationImpl(LOCATION_DESCRIPTION, undefined, refusalLineOf(source, i));
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: ListSpriteDiagram, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `getCandidate`: the first command, in list order, that claims line `i`. */
function getCandidate(commands: readonly ListSpriteCommand[], input: CommandInput): DispatchOutcome | undefined {
  for (const command of commands) {
    const outcome = command.tryExecute(input);
    if (outcome !== undefined) return outcome;
  }
  return undefined;
}

/** A start or end directive left in a hand-built source. */
function isDirective(line: string): boolean {
  return isStartDirective(line) || isEndDirective(line);
}

/**
 * `PSystemCommandFactory#createSystem`'s loop. A refusal's `consumed` is the trace, which counts the offending
 * line (java:171-174, 180-185).
 */
function executeCommands(
  diagram: ListSpriteDiagram,
  source: UmlSource,
  dispatch: StyleDispatch,
  commands: readonly ListSpriteCommand[],
): ParseRefusal | null {
  const lines = source.lines;
  let i = 0;
  while (i < lines.length) {
    const styleRefusal = executeDeclarationsBefore(dispatch, positionOf(source, i));
    if (styleRefusal !== null) return styleRefusal;
    if (isDirective(lines[i]!.trim())) {
      i++;
      continue;
    }
    const outcome = getCandidate(commands, { diagram, lines, index: i, location: locationOf(source, i) });
    if (outcome === undefined) return refuse('syntax', refusalLineOf(source, i), i + 1, SYNTAX_ERROR);
    if (!outcome.result.isOk()) {
      const { result } = outcome;
      return refuse('execution', refusalLineOf(source, i), outcome.nextIndex, result.getError(), result.getScore());
    }
    i = outcome.nextIndex;
  }
  return null;
}

/**
 * `createEmptyDiagram` with the skin param built here (as regex's), then `createSystem`'s per-line dispatch and
 * `finalizeDiagram`.
 * @param stores port-only asset stores (ADR-2): the internal sprites `sprite $x jar:…` reads and the Twemoji artwork.
 * @see ListSpriteDiagramFactory.java:60-64, PSystemCommandFactory.java:107-153
 */
export function parseListSprite(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  stores: ListSpriteStores = {},
): ListSpriteDiagram | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(stores.sprites, stores.emoji),
    pragma: Pragma.createEmpty(),
  });
  const diagram = new ListSpriteDiagram(source, preprocessing, skinParam);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch, initCommandsList());
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the export reads.
  const styleRefusal = executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  return styleRefusal ?? diagram;
}

/** The parsed diagram and the measurer its text is sized with. */
export interface ListSpriteGeometry {
  readonly diagram: ListSpriteDiagram;
  readonly measurer: StringMeasurer;
}

/**
 * `ListSpriteDiagramFactory` as a plugin: a `PSystemCommandFactory` on `DiagramType.SPRITES`, the type
 * `@startsprites` alone carries and `@startuml` lists last (DiagramType.java:193-200), tried at its upstream position
 * between the definition and math factories (lsp D2). The empty test is the dispatcher's.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:170
 */
export const listSpritePlugin: SyncPlugin<ListSpriteDiagram, ListSpriteGeometry> = {
  type: 'sprites',

  parse(source, options) {
    const store = options?.assetStore;
    const stores: ListSpriteStores =
      store === undefined ? {} : { sprites: internalSpriteStoreFrom(store), emoji: internalEmojiStoreFrom(store) };
    return parseListSprite(source, preprocessingArtifactOf(source), stores);
  },

  layoutSync(ast, _theme, measurer) {
    return { diagram: ast, measurer };
  },

  render(geo) {
    return renderListSprite(geo.diagram, geo.measurer);
  },
};
