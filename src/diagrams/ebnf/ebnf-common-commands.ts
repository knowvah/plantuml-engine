/**
 * `CommonCommands.addCommonCommands1` as `PSystemEbnfFactory#initCommandsList` registers it (first): the title
 * commands, `addCommonCommands2`, the scale commands and the hides. A copy of
 * `activity-legacy/common-commands-1.ts` (every engine keeps its own dispatch, eep D2): `CommandNamespaceSeparator`
 * and `CommandPragma` act on the `TitledDiagram` (`!pragma compact` reaches `PSystemEbnf#addBlocLines`), the hides
 * are ignored. `skinparam`, `<style>` and `skin` never reach here: the preprocessor collected them.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java:55-127
 */
import { matchAnnotationCommand } from '../../core/annotations/index.js';
import { isAssumeTransparent } from '../../core/assume-transparent.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { matchScaleCommand } from '../../core/scale-command.js';
import { matchSpriteCommand } from '../../core/sprite-commands.js';
import { trin } from '../../core/style/parser/StyleParser.js';
import type { PSystemEbnf } from './PSystemEbnf.js';

/** What a command that claimed line `i` leaves: its result and the index of the next line. */
export interface DispatchOutcome {
  readonly result: CommandExecutionResult;
  readonly nextIndex: number;
}

/** `Integer.MAX_VALUE`, past which `Integer.parseInt` throws. */
const INT_MAX = 2147483647;
/** `%s`. @see regex/Pattern2.java:57 */
const S = String.raw`[ \t\n\x0B\f\r ]`;
/** The fold of `s` under `iu` that Java's `CASE_INSENSITIVE` does not make. */
const LONG_S = 'ſ';
/** The pragma names `CommandPragma#executeArg` special-cases. @see CommandPragma.java:105-130 */
const PRAGMA_SVGSIZE = 'svgsize';
const PRAGMA_GRAPHVIZ_DOT = 'graphviz_dot';
const PRAGMA_LAYOUT = 'layout';
const LAYOUT_SMETANA = 'smetana';
const LAYOUT_ELK = 'elk';

/** `CommandNope`. @see command/CommandNope.java:54-58 */
const NOPE = new RegExp(`^${S}*$`);
/** `CommandRotate`. @see command/CommandRotate.java:54-71 */
const ROTATE = /^rotate$/i;
/** `CommandMinwidth`. @see command/CommandMinwidth.java:54-77 */
const MINWIDTH = new RegExp(`^minwidth${S}+(\\d+)$`, 'i');
/** `CommandPage`. @see command/CommandPage.java:54-63 */
const PAGE = new RegExp(`^page${S}+(\\d+)${S}*x*${S}*(\\d+)$`, 'i');
/** `CommandNamespaceSeparator`. @see classdiagram/command/CommandNamespaceSeparator.java:70-93 */
const NAMESPACE_SEPARATOR =
  /^set[ \t\n\x0B\f\r ]+(?:separator|namespaceseparator)[ \t\n\x0B\f\r ]+((?:none|null)|[\\]{2}|::|[^\p{L}\p{N} \t\n\x0B\f\r _$#\\{}<>"“”])$/iu;
/** `CommandPragma`. @see command/CommandPragma.java:60-70 */
const PRAGMA = new RegExp(`^!pragma${S}+([A-Za-z_][A-Za-z_0-9]*)(?:${S}+(.*))?$`, 'i');
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
 * `CommandHideShowByGender`, whose `executeArg` is "Just ignored" for an EBNF diagram (java:159-160).
 * @see classdiagram/command/CommandHideShowByGender.java:66-80, 148-161
 */
const HIDE_BY_GENDER = new RegExp(
  `^(?:hide|show)${S}+` +
    `(?:(?:class|object|interface|enum|annotation|dataclass|record|abstract|[\\p{L}\\p{N}_.]+|["“”][^"“”]+["“”]|<<[^\\n\\r\\u0085\\u2028\\u2029]*>>)${S}+)*?` +
    `(?:empty${S}+)?(?:members?|attributes?|fields?|methods?|circles?|circled?|stereotypes?)$`,
  'iu',
);

/** `Integer.parseInt` on `\d+`: past `int`, Java's uncaught `NumberFormatException`, a crash. */
function parseIntOrCrash(digits: string): number {
  const value = Number(digits);
  if (value > INT_MAX) throw new Error(`NumberFormatException: For input string: "${digits}"`);
  return value;
}

/** `addCommonHides`: each reduces to accept-and-ignore on an EBNF diagram. */
function isIgnoredHide(trimmed: string): boolean {
  if (HIDE_EMPTY_DESCRIPTION.test(trimmed) || HIDE_BY_VISIBILITY.test(trimmed)) return true;
  return HIDE_BY_GENDER.test(trimmed) && !trimmed.toLowerCase().includes(LONG_S);
}

/** `CommandPage#executeArg`. @see command/CommandPage.java:86-97 */
function executePage(match: RegExpExecArray): CommandExecutionResult {
  const horizontal = parseIntOrCrash(match[1]!);
  const vertical = parseIntOrCrash(match[2]!);
  if (horizontal <= 0 || vertical <= 0) return CommandExecutionResult.error('Argument must be positive');
  return CommandExecutionResult.ok();
}

/** `CommandNamespaceSeparator#executeArg`. @see classdiagram/command/CommandNamespaceSeparator.java:95-104 */
function executeNamespaceSeparator(diagram: PSystemEbnf, separator: string): CommandExecutionResult {
  const lower = separator.toLowerCase();
  diagram.setNamespaceSeparator(lower === 'none' || lower === 'null' ? undefined : separator);
  return CommandExecutionResult.ok();
}

/**
 * `CommandPragma#executeArg`. `setUseVizJs` has no consumer in this port (no viz.js backend).
 * @see command/CommandPragma.java:100-138
 */
function executePragma(diagram: PSystemEbnf, match: RegExpExecArray): CommandExecutionResult {
  const name = match[1]!.toLowerCase();
  const value = match[2];
  if (name === PRAGMA_SVGSIZE) return CommandExecutionResult.ok();
  diagram.getPragma().define(name, value ?? null);
  const layout = value?.toLowerCase();
  if (name === PRAGMA_LAYOUT && layout === LAYOUT_SMETANA) diagram.setUseSmetana(true);
  if (name === PRAGMA_GRAPHVIZ_DOT && layout === 'jdot')
    return CommandExecutionResult.error(
      "This directive has been renamed to '!pragma layout smetana'. Please update your diagram.",
    );
  if (name === PRAGMA_GRAPHVIZ_DOT)
    return CommandExecutionResult.error(
      `This directive has been renamed to '!pragma layout ${value ?? 'null'}'. Please update your diagram.`,
    );
  if (name === PRAGMA_LAYOUT && layout === LAYOUT_ELK) diagram.setUseElk(true);
  return CommandExecutionResult.ok();
}

/** Applies the commands that mutate the diagram or can fail; `null` when `trimmed` is none of them. */
function tryMutating(diagram: PSystemEbnf, trimmed: string): CommandExecutionResult | null {
  const namespace = NAMESPACE_SEPARATOR.exec(trimmed);
  if (namespace !== null && !trimmed.includes(LONG_S)) return executeNamespaceSeparator(diagram, namespace[1]!);
  const pragma = PRAGMA.exec(trimmed);
  if (pragma !== null) return executePragma(diagram, pragma);
  const minwidth = MINWIDTH.exec(trimmed);
  if (minwidth !== null) {
    parseIntOrCrash(minwidth[1]!);
    return CommandExecutionResult.ok();
  }
  const page = PAGE.exec(trimmed);
  if (page !== null) return executePage(page);
  return null;
}

/**
 * `CommonCommands.addCommonCommands1`. Each command is `doTrim = true`.
 * @returns the outcome of the first command claiming line `i`, or `null` for none.
 * @see CommonCommands.java:55-59
 */
export function addCommonCommands1(diagram: PSystemEbnf, lines: readonly string[], i: number): DispatchOutcome | null {
  const raw = lines[i]!;
  const trimmed = trin(raw);
  const consumed = (count: number): DispatchOutcome => ({ result: CommandExecutionResult.ok(), nextIndex: i + count });

  const annotation = matchAnnotationCommand(lines, i, diagram.annotations);
  if (annotation !== null) return consumed(annotation.consumed);

  const mutating = tryMutating(diagram, trimmed);
  if (mutating !== null) return { result: mutating, nextIndex: i + 1 };
  if (NOPE.test(trimmed) || isAssumeTransparent(raw) || ROTATE.test(trimmed)) return consumed(1);

  const sprite = matchSpriteCommand(lines, i, diagram.sprites);
  if (sprite !== null) return consumed(sprite.consumed);

  const scale = matchScaleCommand(trimmed);
  if (scale !== undefined) {
    diagram.scale = scale;
    return consumed(1);
  }
  return isIgnoredHide(trimmed) ? consumed(1) : null;
}
