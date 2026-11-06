/**
 * `ChartDiagramFactory`: the chart commands first, the common commands last
 * ("so they don't override chart-specific ones"). So `legend right` is
 * `CommandChartLegend` and a bare `legend` reaches the common opener.
 * `CommandChartGrid` is not registered.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagramFactory.java
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
import {
  createMindmapSkinParam,
  executeDeclaration,
  positionedDeclarationsOf,
  type PositionedDeclaration,
  type SkinParam as StyleSkinParam,
} from '../../core/style/mindmap-style-builder.js';
import { StyleParsingException, trin } from '../../core/style/parser/StyleParser.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { Warning } from '../../core/warning/Warning.js';
import { ChartDiagram } from './ChartDiagram.js';
import { SkinParam } from './chart-skin-param.js';
import { applyChartAnnotation, CHART_ANNOTATION_RE } from './command/CommandChartAnnotation.js';
import { applyChartArea, CHART_AREA_RE } from './command/CommandChartArea.js';
import { applyChartBar, CHART_BAR_RE } from './command/CommandChartBar.js';
import { applyChartHAxis, CHART_H_AXIS_RE } from './command/CommandChartHAxis.js';
import { applyChartLegend, CHART_LEGEND_RE } from './command/CommandChartLegend.js';
import { applyChartLine, CHART_LINE_RE } from './command/CommandChartLine.js';
import { applyChartOrientation, CHART_ORIENTATION_RE } from './command/CommandChartOrientation.js';
import { applyChartScatter, CHART_SCATTER_RE } from './command/CommandChartScatter.js';
import { applyChartStackMode, CHART_STACK_MODE_RE } from './command/CommandChartStackMode.js';
import { applyChartVAxis, CHART_V_AXIS_RE } from './command/CommandChartVAxis.js';

/** `@startchart`/`@endchart`, tolerated in a hand-built source (the wbs factory's `START_END_RE`). */
const START_END_RE = /^@(start|end)chart\s*$/i;
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

/** One registered chart command: raw line, since every one passes `doTrim = false`. */
interface ChartCommand {
  readonly re: RegExp;
  readonly apply: (diagram: ChartDiagram, match: RegExpExecArray) => CommandExecutionResult;
}

/** @see ChartDiagramFactory.java:67-76 (registration order) */
const CHART_COMMANDS: readonly ChartCommand[] = [
  { re: CHART_H_AXIS_RE, apply: applyChartHAxis },
  { re: CHART_V_AXIS_RE, apply: applyChartVAxis },
  { re: CHART_BAR_RE, apply: applyChartBar },
  { re: CHART_LINE_RE, apply: applyChartLine },
  { re: CHART_AREA_RE, apply: applyChartArea },
  { re: CHART_SCATTER_RE, apply: applyChartScatter },
  { re: CHART_LEGEND_RE, apply: applyChartLegend },
  { re: CHART_STACK_MODE_RE, apply: applyChartStackMode },
  { re: CHART_ORIENTATION_RE, apply: applyChartOrientation },
  { re: CHART_ANNOTATION_RE, apply: applyChartAnnotation },
];

interface DispatchOutcome {
  readonly result: CommandExecutionResult;
  readonly nextIndex: number;
}

function dispatchChartLine(diagram: ChartDiagram, raw: string, i: number): DispatchOutcome | null {
  for (const command of CHART_COMMANDS) {
    const match = command.re.exec(raw);
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

/** `addCommonHides`: each reduces to accept-and-ignore on a chart. */
function isIgnoredHide(trimmed: string): boolean {
  if (HIDE_EMPTY_DESCRIPTION.test(trimmed) || HIDE_BY_VISIBILITY.test(trimmed)) return true;
  return HIDE_BY_GENDER.test(trimmed) && !trimmed.toLowerCase().includes(LONG_S);
}

/** The commands whose `executeArg` leaves a chart untouched. */
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
 * `CommonCommands.addCommonCommands1`, registered AFTER the chart commands.
 * `skinparam`, `<style>`, `skin` and `!pragma` never reach here: the preprocessor
 * collected them. Each is `doTrim = true`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java:55-127
 */
function dispatchCommonCommand(diagram: ChartDiagram, lines: readonly string[], i: number): DispatchOutcome | null {
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
function addSkinParamWarnings(diagram: ChartDiagram, skinparam: ReadonlyMap<string, string>): void {
  for (const name of skinparam.keys()) {
    const message = SKINPARAM_WARNINGS.get(name.toLowerCase());
    if (message !== undefined) diagram.addWarning(new Warning(message));
  }
}

/** `PSystemCommandFactory#createSystem`'s loop over the source lines. */
function executeCommands(diagram: ChartDiagram, source: UmlSource, dispatch: StyleDispatch): ParseRefusal | null {
  const lines = source.lines;
  let i = 0;

  while (i < lines.length) {
    const styleRefusal = executeDeclarationsBefore(dispatch, positionOf(source, i));
    if (styleRefusal !== null) return styleRefusal;
    if (START_END_RE.test(lines[i]!.trim())) {
      i++;
      continue;
    }

    const outcome = dispatchChartLine(diagram, lines[i]!, i) ?? dispatchCommonCommand(diagram, lines, i);
    if (outcome === null) return refuse('syntax', refusalLineOf(source, i), i, SYNTAX_ERROR);
    if (!outcome.result.isOk())
      return refuse('execution', refusalLineOf(source, i), i, outcome.result.getError(), outcome.result.getScore());
    i = outcome.nextIndex;
  }
  return null;
}

/**
 * `createEmptyDiagram` with the skin param built here (D2), then
 * `PSystemCommandFactory#createSystem`'s per-line dispatch.
 * @see ChartDiagramFactory.java:65-86
 */
export function parseChart(source: UmlSource, preprocessing: PreprocessingArtifact): ChartDiagram | ParseRefusal {
  const dispatch = createStyleDispatch(source);
  const skinParam = new SkinParam({
    style: dispatch.style,
    skinparam: dispatch.skinparam,
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
  const diagram = new ChartDiagram(source, preprocessing, skinParam);
  addSkinParamWarnings(diagram, dispatch.skinparam);
  const refusal = executeCommands(diagram, source, dispatch);
  if (refusal !== null) return refusal;
  // Declarations after the last command still mute the builder the render reads.
  return executeDeclarationsBefore(dispatch, Number.POSITIVE_INFINITY) ?? diagram;
}
