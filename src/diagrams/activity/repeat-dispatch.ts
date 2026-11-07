/**
 * `repeat` / `repeat while` dispatch, split out of `node-dispatch.ts` (500-line cap) with the
 * `<<#color>>` reads of `CommandRepeat3` and `CommandRepeatWhile3` added.
 */
import type { ParseRefusal } from '../../core/parse-refusal.js';
import type { ActivityAction, ActivityRepeat } from './ast.js';
import {
  RE_ACTION,
  RE_REPEAT_HEAD,
  RE_REPEAT_INLINE_TERMINATOR,
  RE_REPEATWHILE,
  isRefusal,
  swimlaneSpread,
  type DispatchResult,
  type ParseContext,
  positionSpread,
} from './dispatch-support.js';
import { unescapeLabel, unescapeLabelNewlines } from './if-dispatch.js';
import { displayWithNewlines } from './dispatch-newline-sentinels.js';
import { parseNodes } from './node-dispatch.js';
import {
  RE_REPEAT_STEREOGROUP,
  backColorSpread,
  deprecatedColorWarning,
  stereogroupBackColor,
  stereogroupLabels,
  stereogroupStereotype,
  stereotypesSpread,
} from './dispatch-stereogroup.js';

// ---------------------------------------------------------------------------
// repeat / repeatwhile
// `repeat` may stand alone or be followed by an inline action:
//   repeat :foo;  <<stereo>>
// The action becomes the ENTRY tile (`ActivityRepeat.entry`), never a body
// element.
// ---------------------------------------------------------------------------

/**
 * Parses the inline action on `repeat :label;`, if present, into the
 * repeat's ENTRY tile. `undefined` for a bare `repeat`.
 * @see net/sourceforge/plantuml/activitydiagram3/CommandRepeat3.java:126
 *   -- the inline label is handed to `ActivityDiagram3#startRepeat`.
 * @see net/sourceforge/plantuml/activitydiagram3/InstructionRepeat.java:51
 *   -- stored as `startLabel`, handed to `factory.repeat(…, startLabel,
 *   …)` (`:166-167`) as the tile that replaces the entry diamond
 *   (`ftile/vcompact/FtileRepeat.java:77-80`).
 */
/** The `repeat` head: its `:label;` action, and the stereogroup that follows it (`Stereogroup.build(arg)`,
 *  `CommandRepeat3.java:118`), whichever of the two shapes carried it. */
interface RepeatHead {
  readonly entry?: ActivityAction;
  readonly group?: string | undefined;
}

function parseRepeatEntry(ctx: ParseContext, inlineRest: string | undefined): RepeatHead {
  if (inlineRest === undefined || inlineRest === '') return {};
  // `repeat <<#c>>`: the stereogroup alone, no `:label;` (`CommandRepeat3.java:64-77`).
  if (RE_REPEAT_STEREOGROUP.test(inlineRest)) return { group: inlineRest };
  // Parse the inline content as a virtual line — most commonly an action
  // :label; with optional <<stereotype>>. The action regex requires a `;`
  // followed by optional stereotype/color suffixes, so leave the line as-is
  // when it already terminates properly and only synthesize a `;` for bare
  // `:label`.
  const restLine = RE_REPEAT_INLINE_TERMINATOR.test(inlineRest) ? inlineRest : inlineRest + ';';
  const actionM = RE_ACTION.exec(restLine);
  if (actionM === null) return {};
  const label = displayWithNewlines(ctx.pragma, actionM[1]!);
  const stereotype = stereogroupStereotype(actionM[2]);
  const color = stereogroupBackColor(actionM[2]);
  const entry: ActivityAction = {
    kind: 'action',
    label,
    ...(stereotype !== undefined ? { stereotype } : {}),
    ...stereotypesSpread(actionM[2]),
    ...(color !== undefined ? { color } : {}),
    ...swimlaneSpread(ctx),
  };
  return { entry, group: actionM[2] };
}

interface RepeatClose {
  readonly condition: string;
  readonly yesLabel: string | undefined;
  readonly outLabel: string | undefined;
  /** `repeat while`'s own stereogroup (`CommandRepeatWhile3.java:61-63,147`). */
  readonly group: string | undefined;
  /** `repeat while ... -> LABEL` / `-[#c]-> LABEL`: the `back` link (`ActivityDiagram3.java:366-367`). */
  readonly backLink: { label: string; color?: string } | undefined;
  /** No closer before the end of the source: `setTest` never ran (`InstructionRepeat.java:167-168`). */
  readonly unclosed: boolean;
  readonly nextIdx: number;
}

/**
 * Parses the `repeatwhile`/`repeat while` closer line, including its
 * `is (…)`/`not (…)` side labels.
 * @see net/sourceforge/plantuml/activitydiagram3/ActivityDiagram3.java:359-371
 *   -- `repeatWhile(label, yes, out, …)`.
 * @see net/sourceforge/plantuml/activitydiagram3/InstructionRepeat.java:193-200
 *   -- `setTest` stores `yesTb`/`outTb`, drawn on the condition hexagon
 *   (`ftile/vcompact/FtileRepeat.java:150-151`). xabesu-51-dimi831 (T3i):
 *   `CommandRepeatWhile3.java:144-147` routes TEST/WHEN/OUT through the
 *   same `Display.getWithNewlines` escape as `if`/`elseif` (IFNL, T3d).
 */
function parseRepeatClose(lines: readonly string[], cursor: number): RepeatClose {
  if (cursor >= lines.length) {
    const none = { yesLabel: undefined, outLabel: undefined, group: undefined, backLink: undefined };
    return { condition: '', ...none, unclosed: true, nextIdx: cursor };
  }
  const endLine = lines[cursor]!.trim();
  const repeatMatch = RE_REPEATWHILE.exec(endLine);
  const condition = unescapeLabelNewlines(repeatMatch?.[1] ?? '');
  const yesLabel = unescapeLabel(repeatMatch?.[2]);
  const outLabel = unescapeLabel(repeatMatch?.[3]);
  const backLink = repeatBackLink(repeatMatch?.[4], repeatMatch?.[5]);
  return { condition, yesLabel, outLabel, group: repeatMatch?.[6], backLink, unclosed: false, nextIdx: cursor + 1 };
}

/** `LinkRendering.create(linkColor).withDisplay(linkLabel)` (`ActivityDiagram3.java:366`), `undefined` when it is
 *  none: `Display.isNull(display) && rainbow.size() == 0` (`LinkRendering.java:84-86`). Any `->` or `-[..]->` makes
 *  LABEL `(.*)` match (`CommandRepeatWhile3.java:95`), if only as "", and `Display.getWithNewlines(pragma, "")` is not
 *  `Display.NULL` (`Display.java:262-264`): a bare `->` is a back link whose empty label draws a ` ` text. Only a
 *  closer with no arrow at all (`LABEL` null) is none. */
function repeatBackLink(color: string | undefined, label: string | undefined): RepeatClose['backLink'] {
  if (label === undefined) return undefined;
  return { label: unescapeLabelNewlines(label), ...(color !== undefined ? { color } : {}) };
}

/**
 * `stereogroup1` colours the entry (`diamondColor1`) and, when `repeat while` has no stereogroup of its own, the
 * condition and break diamonds too: `stereogroup2.getInnerColors(colorSet).isEmpty() && stereogroup2.isEmpty()` falls
 * back to `diamondColor1`; a stereogroup without a BACK keeps the diamond style's.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorRepeat.java:80-100
 */
function repeatColors(
  group: string | undefined,
  whileGroup: string | undefined,
): Pick<ActivityRepeat, 'color' | 'whileColor' | 'whileStereogroup' | 'labels' | 'whileLabels'> {
  const whileColor = stereogroupBackColor(whileGroup);
  const labels = stereogroupLabels(group);
  const whileLabels = stereogroupLabels(whileGroup);
  return {
    ...backColorSpread(group),
    ...(whileColor !== undefined ? { whileColor } : {}),
    ...(whileGroup !== undefined ? { whileStereogroup: true as const } : {}),
    ...(labels.length > 0 ? { labels } : {}),
    ...(whileLabels.length > 0 ? { whileLabels } : {}),
  };
}

/**
 * Captures the `repeat`'s swimlane at its opener, and `swimlaneOut` at
 * `repeat while`, not at a single closer.
 * @see net/sourceforge/plantuml/activitydiagram3/InstructionRepeat.java:107
 *   -- `this.swimlane = swimlanes.getCurrentSwimlane()`, taken when the
 *   `repeat` line itself is parsed, before the body.
 * @see net/sourceforge/plantuml/activitydiagram3/InstructionRepeat.java:194-196
 *   -- `setTest` stores `swimlaneOut`, taken when `repeat while` is parsed
 *   (`ActivityDiagram3.java:367`).
 */
export function tryRepeat(ctx: ParseContext, idx: number, line: string): DispatchResult | ParseRefusal | null {
  const repeatHeadMatch = RE_REPEAT_HEAD.exec(line);
  if (repeatHeadMatch === null) return null;
  // `CommandRepeat3.java:121-123`: the leading `#color:` is warned about and dropped.
  const deprecatedColor = repeatHeadMatch[1];
  if (deprecatedColor !== undefined) ctx.pragma.addWarning(deprecatedColorWarning(deprecatedColor));
  // Mission `activity-lane-capture` D1/T5: read BEFORE the body parses, so
  // a lane switch inside the body never leaks into this node's own
  // `swimlane`.
  const openerSwimlane = swimlaneSpread(ctx);
  const { entry, group } = parseRepeatEntry(ctx, repeatHeadMatch[2]?.trim());
  const bodyResult = parseNodes(ctx, idx + 1, ['repeatwhile', 'repeat while']);
  if (isRefusal(bodyResult)) return bodyResult;
  const close = parseRepeatClose(ctx.lines, bodyResult.nextIdx);
  // Mission activity-lane-capture D1/T5: `swimlaneOut` is the lane current
  // AT `repeat while`, which may differ from the opener's.
  const closerSwimlane = ctx.currentSwimlane;
  const node: ActivityRepeat = {
    kind: 'repeat',
    ...positionSpread(ctx, idx),
    ...(entry !== undefined ? { entry } : {}),
    ...repeatColors(group, close.group),
    body: bodyResult.nodes,
    condition: close.condition,
    ...(close.yesLabel !== undefined && close.yesLabel !== '' ? { yesLabel: close.yesLabel } : {}),
    ...(close.outLabel !== undefined && close.outLabel !== '' ? { outLabel: close.outLabel } : {}),
    ...(close.backLink !== undefined ? { backLink: close.backLink } : {}),
    ...(close.unclosed ? { unclosed: true as const } : {}),
    ...openerSwimlane,
    ...(closerSwimlane !== undefined ? { swimlaneOut: closerSwimlane } : {}),
  };
  return { idx: close.nextIdx, node };
}
