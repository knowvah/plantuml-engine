import type { HColor } from '../../core/abel/Colors.js';
import { getWBSDirection } from '../../core/abel/Direction.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { NoSuchColorException } from '../../core/klimt/color/NoSuchColorException.js';
import { transform } from '../../core/url/UrlBuilder.js';
import { Warning } from '../../core/warning/Warning.js';
import { fromDesc, IdeaShape } from '../mindmap/IdeaShape.js';
import type { WBSDiagram } from './WBSDiagram.js';

/**
 * `CommandWBSItemOld` — the single-line WBS item whose colour/code pair comes
 * BEFORE the shape/direction markers (`**[#red](c1)_< Label`); every match
 * adds {@link orderWarning}, the prefix rewritten in the expected order. Two
 * modes, registered as `Old(1)`, `Old(0)` (WBSDiagramFactory.java:8-12).
 * See {@link ./CommandWBSItemNew.ts} for the group-naming and expansion
 * conventions (identical here).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wbs/CommandWBSItemOld.java
 */

/** `.` — Java excludes `\n \r \u0085    ` (Pattern javadoc). */
const ANY = '[^\\n\\r\\u0085\\u2028\\u2029]';

/** `RegexLeaf(1, WBS_TYPE, "([ \t]*[*+-]+)")` @see CommandWBSItemOld.java:49,63 */
const TYPE = '(?<TYPE>[ \\t]*[*+-]+)';

/** @see CommandWBSItemOld.java:50-55 */
const COLOR_CODE =
  '(?:(?:\\[(?<BACKCOLOR_1>#\\w+)\\])?(?:\\((?<CODE_1>[%pLN_]+)\\))?' +
  '|(?:\\((?<CODE_2>[%pLN_]+)\\))?(?:\\[(?<BACKCOLOR_2>#\\w+)\\])?)';

/**
 * The shape/direction `RegexOr` — THREE alternatives (`SHAPE_2` is the
 * `RegexOr`'s own third argument, outside the second `RegexConcat`).
 * @see CommandWBSItemOld.java:56-62,64-70
 */
const SHAPE_DIR = '(?:(?<SHAPE_1>_)?(?<DIR_1>[<>])?|(?<DIR_2>[<>])?|(?<SHAPE_2>_)?)';

/** `RegexOptional(RegexConcat(spaceOneOrMore, LABEL))` @see CommandWBSItemOld.java:63 */
const OPTIONAL_LABEL = `(?:[%s]+(?<LABEL>[^%s]${ANY}*))?`;

function compile(source: string): RegExp {
  return new RegExp(`^${transform(source)}$`, 'iu');
}

/** Mode 0. @see CommandWBSItemOld.java:8-26 */
export const WBS_ITEM_OLD_RE_0: RegExp = compile(TYPE + COLOR_CODE + SHAPE_DIR + OPTIONAL_LABEL);

/** Mode 1, the `"label" as code` form. @see CommandWBSItemOld.java:27-43 */
export const WBS_ITEM_OLD_RE_1: RegExp = compile(
  TYPE +
    '(?:\\[(?<BACKCOLOR>#\\w+)\\])?' +
    SHAPE_DIR +
    '[%s]+[%g](?<LABEL>' +
    ANY +
    '*)[%g][%s]+as[%s]+(?<CODE>[%pLN_]+)',
);

/** `RegexResult.getLazzy(key, 0)`. @see RegexResult.java:98-111 */
function getLazzy(groups: Readonly<Record<string, string | undefined>>, key: string): string | undefined {
  for (const [name, value] of Object.entries(groups)) if (name.startsWith(key) && value !== undefined) return value;
  return undefined;
}

/**
 * `executeArg`; `NoSuchColorException` → `badColor()` as in
 * `SingleLineCommand2#execute` (:174-178). The warning is added only after the
 * label/shape checks pass (Old.java:66), so a refused line adds none.
 * @see CommandWBSItemOld.java:51-68
 */
export function applyWbsItemOld(diagram: WBSDiagram, match: RegExpExecArray, mode: 0 | 1): CommandExecutionResult {
  const groups = match.groups ?? {};
  const type = groups['TYPE']!;
  const label = groups['LABEL'];
  const code = getLazzy(groups, 'CODE');
  const stringColor = getLazzy(groups, 'BACKCOLOR');

  let backColor: HColor | undefined;
  try {
    if (stringColor !== undefined) backColor = diagram.getSkinParam().getIHtmlColorSet().getColor(stringColor);
  } catch (e) {
    if (e instanceof NoSuchColorException) return CommandExecutionResult.badColor();
    throw e;
  }

  const dir = getWBSDirection(type, groups['DIR_1'], groups['DIR_2']);
  let shape = fromDesc(getLazzy(groups, 'SHAPE'));
  if (label === undefined && shape === IdeaShape.NONE) shape = IdeaShape.PSEUDO;
  else if (label === undefined) return CommandExecutionResult.error('Missing label for WBS node.');

  // `orderWarning(arg, mode == 0)`: mode 1's CODE (`"x" as c`) is not shown. @see CommandWBSItemOld.java:136
  const prefix = {
    type,
    shape: getLazzy(groups, 'SHAPE'),
    direction: getLazzy(groups, 'DIR'),
    backColor: stringColor,
    code,
  };
  diagram.addWarning(orderWarning(prefix, mode === 0));
  return diagram.addIdea(code, diagram.getSmartLevel(type), { backColor, label: label ?? '', shape }, dir);
}

/** The markers of a legacy-order WBS line, as `orderWarning` reads them
 *  (`arg.get(WBS_TYPE)` and the `getLazzy` prefixes SHAPE, DIRECTION,
 *  BACKCOLOR, CODE). @see CommandWBSItemOld.java:145-151 */
export interface WbsOrderPrefix {
  readonly type: string;
  readonly shape: string | undefined;
  readonly direction: string | undefined;
  readonly backColor: string | undefined;
  readonly code: string | undefined;
}

/** `appendIfPresent`: `before + value + after` when `value` is non-empty. @see CommandWBSItemOld.java:157-160 */
function appendIfPresent(before: string, value: string | undefined, after: string): string {
  return value !== undefined && value.length > 0 ? `${before}${value}${after}` : '';
}

/**
 * `orderWarning` — the warning for the legacy order where the colour and/or id
 * come before the shape/direction markers, showing the prefix rewritten in the
 * expected order (`**_>[#red](id)` for `**[#red](id)_>`). Shared with
 * `CommandWBSItemMultilineOld` (java:124), which passes `withCode = true`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wbs/CommandWBSItemOld.java:139-155
 */
export function orderWarning(prefix: WbsOrderPrefix, withCode: boolean): Warning {
  const sb =
    prefix.type.trim() +
    appendIfPresent('', prefix.shape, '') +
    appendIfPresent('', prefix.direction, '') +
    appendIfPresent('[', prefix.backColor, ']') +
    (withCode ? appendIfPresent('(', prefix.code, ')') : '');
  return new Warning(`Shape (_) and direction (< >) must come before color and id: start the line with '${sb}'`);
}
