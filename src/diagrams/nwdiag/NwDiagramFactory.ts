/**
 * `NwDiagramFactory`: `CommonCommands.addCommonCommands1` first, then the
 * nwdiag commands and `CommandFootboxIgnored` in `initCommandsList` order,
 * then `finalizeDiagram`'s `makeDiagramReady`. The shape of
 * `packetdiag/PacketDiagramFactory.ts` (nwp D2).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/NwDiagramFactory.java
 */
import { matchAnnotationCommand } from '../../core/annotations/index.js';
import { isAssumeTransparent } from '../../core/assume-transparent.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import { matchScaleCommand } from '../../core/scale-command.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { matchSpriteCommand } from '../../core/sprite-commands.js';
import { createSpriteRegistry } from '../../core/sprite-registry.js';
import type { InternalEmojiStore } from '../../core/internal-emoji-store.js';
import {
  createMindmapSkinParam,
  executeDeclaration,
  positionedDeclarationsOf,
  type PositionedDeclaration,
  type SkinParam as StyleSkinParam,
} from '../../core/style/mindmap-style-builder.js';
import { StyleParsingException, trin } from '../../core/style/parser/StyleParser.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { versionString } from '../../core/version.js';
import { Warning } from '../../core/warning/Warning.js';
import { applyComment, COMMENT_RE } from './CommandComment.js';
import { applyElement, ELEMENT_RE } from './CommandElement.js';
import { applyEndSomething, END_SOMETHING_RE } from './CommandEndSomething.js';
import { applyGroup, GROUP_RE } from './CommandGroup.js';
import { applyLink, LINK_RE } from './CommandLink.js';
import { applyNetwork, NETWORK_RE } from './CommandNetwork.js';
import { applyNwDiagInit, NWDIAG_INIT_RE } from './CommandNwDiagInit.js';
import { applyProperty, PROPERTY_RE } from './CommandProperty.js';
import { concat, SP0 } from './nwdiag-command-text.js';
import { NwDiagram } from './NwDiagram.js';
import { SkinParam } from './nwdiag-skin-param.js';

/** `@startnwdiag`/`@endnwdiag`, tolerated in a hand-built source (the wbs factory's `START_END_RE`). */
const START_END_RE = /^@(start|end)nwdiag\s*$/i;
/** The standard error text of a line no command matches. @see command/PSystemCommandFactory.java:169-175 */
const SYNTAX_ERROR = 'Syntax Error?';
/** `Integer.MAX_VALUE`, past which `Integer.parseInt` throws. */
const INT_MAX = 2147483647;
/** `%s`. @see regex/Pattern2.java:57 */
const S = String.raw`[ \t\n\x0B\f\r ]`;

/** `CommandNope`. @see command/CommandNope.java:54-58 */
const NOPE = new RegExp(`^${S}*$`);
/** `CommandRotate`: `executeArg` returns `ok()`. @see command/CommandRotate.java:54-71 */
const ROTATE = /^rotate$/i;
/** `CommandMinwidth`: `setMinwidth` is commented out, the `parseInt` is not. @see command/CommandMinwidth.java:54-77 */
const MINWIDTH = new RegExp(`^minwidth${S}+(\\d+)$`, 'i');
/** `CommandPage`: `x*`, so `page 2 3` matches too. @see command/CommandPage.java:54-63 */
const PAGE = new RegExp(`^page${S}+(\\d+)${S}*x*${S}*(\\d+)$`, 'i');
/** `CommandNamespaceSeparator`, as `GanttDiagramFactory.ts` transcribes it; `\p` forces `u`. */
const NAMESPACE_SEPARATOR =
  /^set[ \t\n\x0B\f\r ]+(?:separator|namespaceseparator)[ \t\n\x0B\f\r ]+((?:none|null)|[\\]{2}|::|[^\p{L}\p{N} \t\n\x0B\f\r _$#\\{}<>"“”])$/iu;
/** `CommandHideEmptyDescription`. @see statediagram/command/CommandHideEmptyDescription.java:56-62 */
const HIDE_EMPTY_DESCRIPTION = new RegExp(`^(?:hide|show)${S}+empty${S}+description$`, 'i');
/**
 * `CommandHideShowByVisibility`, whose `executeArg` ignores any non-class diagram.
 * @see classdiagram/command/CommandHideShowByVisibility.java:62-70, 121-128
 */
const HIDE_BY_VISIBILITY = new RegExp(
  `^(?:hide|show)${S}+(?:public|private|protected|package)?(?:[,${S.slice(1, -1)}]+(?:public|private|protected|package))*` +
    `${S}+(?:members?|attributes?|fields?|methods?)$`,
  'i',
);
/**
 * `CommandHideShowByGender`, whose `executeArg` ignores anything but class,
 * description and sequence diagrams. `[%pLN_.]` forces `u`, whose `i` folds `ſ`
 * to `s` where Java's does not: {@link isIgnoredHide} rejects it.
 * @see classdiagram/command/CommandHideShowByGender.java:66-80, 150-163
 */
const HIDE_BY_GENDER = new RegExp(
  `^(?:hide|show)${S}+` +
    `(?:(?:class|object|interface|enum|annotation|dataclass|record|abstract|[\\p{L}\\p{N}_.]+|["“”][^"“”]+["“”]|<<[^\\n\\r\\u0085\\u2028\\u2029]*>>)${S}+)*?` +
    `(?:empty${S}+)?(?:members?|attributes?|fields?|methods?|circles?|circled?|stereotypes?)$`,
  'iu',
);
/** The fold of `s` under `iu` that Java's `CASE_INSENSITIVE` does not make. */
const LONG_S = 'ſ';

/** The `new Warning(…)` texts `CommandSkinParam#executeArg` adds, keyed by the lower-cased skin parameter name.
 *  @see command/CommandSkinParam.java:88-99 */
const SKINPARAM_WARNINGS: ReadonlyMap<string, string> = new Map([
  ['handwritten', "Please use '!option handwritten true' to enable handwritten "],
  ['participantpadding', 'Please use CSS style instead of skinparam ParticipantPadding'],
  ['padding', 'Please use CSS style instead of skinparam padding'],
]);

/**
 * `CommandFootboxIgnored`: an optional `hide`/`show`, then `footbox`; `ok()`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandFootboxIgnored.java
 */
const FOOTBOX_IGNORED_RE = concat('(hide|show)?', SP0, 'footbox');

/** One registered nwdiag command: matched on the trimmed line, as every one is `doTrim = true`. */
interface NwdiagCommand {
  readonly re: RegExp;
  readonly apply: (diagram: NwDiagram, match: RegExpExecArray) => CommandExecutionResult;
}

/** @see NwDiagramFactory.java:62-74 (registration order, after the common commands) */
const NWDIAG_COMMANDS: readonly NwdiagCommand[] = [
  { re: NWDIAG_INIT_RE, apply: applyNwDiagInit },
  { re: COMMENT_RE, apply: applyComment },
  { re: ELEMENT_RE, apply: applyElement },
  { re: GROUP_RE, apply: applyGroup },
  { re: NETWORK_RE, apply: applyNetwork },
  { re: LINK_RE, apply: applyLink },
  { re: PROPERTY_RE, apply: applyProperty },
  { re: END_SOMETHING_RE, apply: applyEndSomething },
  { re: FOOTBOX_IGNORED_RE, apply: () => CommandExecutionResult.ok() },
];

interface DispatchOutcome {
  readonly result: CommandExecutionResult;
  readonly nextIndex: number;
}

function dispatchNwdiagLine(diagram: NwDiagram, raw: string, i: number): DispatchOutcome | null {
  const trimmed = trin(raw);
  for (const command of NWDIAG_COMMANDS) {
    const match = command.re.exec(trimmed);
    if (match !== null) return { result: command.apply(diagram, match), nextIndex: i + 1 };
  }
  return null;
}

/** `Integer.parseInt` on `\d+`: past `int`, Java's uncaught `NumberFormatException`, a crash. */
function parseIntOrCrash(digits: string): number {
  const value = Number(digits);
  if (value > INT_MAX) throw new Error(`NumberFormatException: For input string: "${digits}"`);
  return value;
}

/** `addCommonHides`: each reduces to accept-and-ignore on a nwdiag diagram. */
function isIgnoredHide(trimmed: string): boolean {
  if (HIDE_EMPTY_DESCRIPTION.test(trimmed) || HIDE_BY_VISIBILITY.test(trimmed)) return true;
  return HIDE_BY_GENDER.test(trimmed) && !trimmed.toLowerCase().includes(LONG_S);
}

/** The commands whose `executeArg` leaves a nwdiag diagram untouched. */
function isNoOpCommand(trimmed: string, raw: string): boolean {
  return (
    (NAMESPACE_SEPARATOR.test(trimmed) && !trimmed.includes(LONG_S)) ||
    NOPE.test(trimmed) ||
    isAssumeTransparent(raw) ||
    ROTATE.test(trimmed) ||
    isIgnoredHide(trimmed)
  );
}

/** `CommandPage#executeArg`, whose splitting is read only by the PNG exporter. @see command/CommandPage.java:86-97 */
function executePage(match: RegExpExecArray): CommandExecutionResult {
  const horizontal = parseIntOrCrash(match[1]!);
  const vertical = parseIntOrCrash(match[2]!);
  if (horizontal <= 0 || vertical <= 0) return CommandExecutionResult.error('Argument must be positive');
  return CommandExecutionResult.ok();
}

/**
 * `CommonCommands.addCommonCommands1`, registered BEFORE the nwdiag commands.
 * `skinparam`, `<style>`, `skin` and `!pragma` never reach here: the preprocessor
 * collected them. Each is `doTrim = true`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java:55-127
 */
function dispatchCommonCommand(diagram: NwDiagram, lines: readonly string[], i: number): DispatchOutcome | null {
  const raw = lines[i]!;
  const trimmed = trin(raw);
  const consumed = (count: number): DispatchOutcome => ({
    result: CommandExecutionResult.ok(),
    nextIndex: i + count,
  });

  const annotation = matchAnnotationCommand(lines, i, diagram.annotations);
  if (annotation !== null) return consumed(annotation.consumed);
  if (isNoOpCommand(trimmed, raw)) return consumed(1);

  const minwidth = MINWIDTH.exec(trimmed);
  if (minwidth !== null) {
    parseIntOrCrash(minwidth[1]!);
    return consumed(1);
  }
  const page = PAGE.exec(trimmed);
  if (page !== null) return { result: executePage(page), nextIndex: i + 1 };

  const sprite = matchSpriteCommand(lines, i, diagram.sprites);
  if (sprite !== null) return consumed(sprite.consumed);

  const scale = matchScaleCommand(trimmed);
  if (scale === undefined) return null;
  diagram.scale = scale;
  return consumed(1);
}

/** A hand-built source's style sources: no skin, no skinparam, no style. */
const EMPTY_STYLE_SOURCE: NonNullable<UmlSource['styleSource']> = {
  skinparam: new Map<string, string>(),
  styles: [],
};

/**
 * The `skinparam`/`<style>` commands the preprocessor pulled out of the source,
 * still to be dispatched: upstream executes each where it occurs, muting the
 * diagram's style builder (`SkinParam.java:164-167`).
 */
interface StyleDispatch {
  readonly style: StyleSkinParam;
  readonly skinparam: ReadonlyMap<string, string>;
  /** Source order; the head is the next to execute. */
  readonly pending: PositionedDeclaration[];
}

function createStyleDispatch(source: UmlSource): StyleDispatch {
  const styleSource = source.styleSource ?? EMPTY_STYLE_SOURCE;
  return {
    style: createMindmapSkinParam(styleSource),
    skinparam: styleSource.skinparam,
    pending: positionedDeclarationsOf(styleSource, source.stylePositions ?? []),
  };
}

/**
 * Executes every pending declaration placed before document line `position`. A
 * rejected `<style>` block is `CommandStyleMultilinesCSS`'s command error (java:92-93),
 * reported at line 0 (the preprocessor keeps no line for it).
 */
function executeDeclarationsBefore(dispatch: StyleDispatch, position: number): ParseRefusal | null {
  while (dispatch.pending.length > 0 && dispatch.pending[0]!.position < position) {
    const declaration = dispatch.pending.shift()!;
    try {
      executeDeclaration(dispatch.style, declaration, dispatch.skinparam);
    } catch (e) {
      if (!(e instanceof StyleParsingException)) throw e;
      return refuse('execution', 0, 0, `Error in style definition: ${e.message}`);
    }
  }
  return null;
}

/** Line `i`'s document position; a hand-built source reads as every declaration before its first line. */
function positionOf(source: UmlSource, i: number): number {
  if (source.linePositions === undefined) return Number.POSITIVE_INFINITY;
  return source.linePositions[i] ?? -1;
}

/** The DOCUMENT-relative line a refusal at interior index `i` names. */
function refusalLineOf(source: UmlSource, i: number): number {
  return source.linePositions?.[i] ?? i;
}

/** `CommandSkinParam#executeArg`'s deprecation warnings, in source order. */
function addSkinParamWarnings(diagram: NwDiagram, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `ProtectedCommand#execute`'s message, before the throwable's `toString()`. @see command/ProtectedCommand.java:68-75 */
function protectedMessage(t: unknown): string {
  const detail = t instanceof Error ? t.message : String(t);
  return `You should send a mail to plantuml@gmail.com with this log (V${versionString()}) ${detail}`;
}

/**
 * The line's command, run as `AbstractDiagram#executeCommand` runs every one:
 * wrapped in a `ProtectedCommand`, so a throw (a Java `NullPointerException`,
 * nwp D11) is an execution error at that line, not a crash.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/AbstractDiagram.java:173-180
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/ProtectedCommand.java:54-77
 */
function protectedDispatch(diagram: NwDiagram, lines: readonly string[], i: number): DispatchOutcome | null {
  try {
    return dispatchCommonCommand(diagram, lines, i) ?? dispatchNwdiagLine(diagram, lines[i]!, i);
  } catch (t) {
    return { result: CommandExecutionResult.error(protectedMessage(t)), nextIndex: i + 1 };
  }
}

/**
 * `PSystemCommandFactory#createSystem`'s loop over the source lines. A refusal's
 * `consumed` is the trace, which counts the offending line: `it.next()` runs before
 * `it.getTrace()` (java:171-174), and `getCandidate` has already read a failed
 * command's lines (java:180-185).
 */
function executeCommands(diagram: NwDiagram, source: UmlSource, dispatch: StyleDispatch): ParseRefusal | null {
  const lines = source.lines;
  let i = 0;

  while (i < lines.length) {
    const styleRefusal = executeDeclarationsBefore(dispatch, positionOf(source, i));
    if (styleRefusal !== null) return styleRefusal;
    if (START_END_RE.test(lines[i]!.trim())) {
      i++;
      continue;
    }

    const outcome = protectedDispatch(diagram, lines, i);
    if (outcome === null) return refuse('syntax', refusalLineOf(source, i), i + 1, SYNTAX_ERROR);
    if (!outcome.result.isOk()) {
      const { result, nextIndex } = outcome;
      return refuse('execution', refusalLineOf(source, i), nextIndex, result.getError(), result.getScore());
    }
    i = outcome.nextIndex;
  }
  return null;
}

/**
 * `PSystemCommandFactory#finalizeDiagram`: `checkFinalError` is
 * `AbstractDiagram`'s null for nwdiag (`NwDiagram` does not override it), so
 * only `makeDiagramReady` runs (java:160).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:145-165
 */
function finalizeDiagram(diagram: NwDiagram): NwDiagram {
  diagram.makeDiagramReady();
  return diagram;
}

/**
 * `createEmptyDiagram` with the skin param built here (nwp D2), then
 * `PSystemCommandFactory#createSystem`'s per-line dispatch and `finalizeDiagram`.
 * @param emoji port-only Twemoji artwork store (ADR-2), carried in the sprite registry as
 *   `GanttDiagramFactory.ts#parseGantt` carries it; upstream reads it from the classpath (`Emoji.java:167`).
 * @see NwDiagramFactory.java:56-74
 */
export function parseNwdiag(
  source: UmlSource,
  preprocessing: PreprocessingArtifact,
  emoji?: InternalEmojiStore,
): NwDiagram | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(undefined, emoji),
    pragma: Pragma.createEmpty(),
  });
  const diagram = new NwDiagram(source, preprocessing, skinParam);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch);
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the draw reads.
  const styleRefusal = executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY);
  if (styleRefusal !== null) return styleRefusal;
  return finalizeDiagram(diagram);
}
