/**
 * action-dispatch -- `CommandActivity3`, the single-line `:label;` activity,
 * split out of `node-dispatch.ts` (500-line cap): the plain form
 * ({@link tryAction}) and the form with the two prefixes it parses and ignores
 * ({@link tryPrefixedAction}): a leading `#color` (`ColorParser.simpleColor(BACK)`,
 * added upstream in 443598c29ce) and a stereotype before the `:`
 * (`StereotypePattern.optionalIGNORED()`). Each prefix only warns.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandActivity3.java:68-79,122-149
 */
import type { ActivityAction } from './ast.js';
import { COLORS_REGEXP } from '../../core/klimt/color/ColorParser.js';
import { Warning } from '../../core/warning/Warning.js';
import {
  RE_ACTION,
  positionSpread,
  swimlaneSpread,
  type DispatchResult,
  type ParseContext,
} from './dispatch-support.js';
import { displayWithNewlines } from './dispatch-newline-sentinels.js';
import {
  innerColorsSpread,
  stereogroupBackColor,
  stereogroupStereotype,
  stereotypesSpread,
} from './dispatch-stereogroup.js';

/**
 * `CommandActivity3` with its prefixes: COLOR (`COLORS_REGEXP`, optional), then
 * `optionalIGNORED` (`spaceZeroOrMore`, `(<<.+?>>)?`, `spaceZeroOrMore`), `:`,
 * `LABEL (.*?)`, `;`, the stereogroup. Groups: 1 COLOR, 2 IGNORED, 3 LABEL, 4 stereogroup.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandActivity3.java:68-79
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/stereo/StereotypePattern.java:53-68
 */
const RE_PREFIXED_ACTION = new RegExp(
  `^(${COLORS_REGEXP})?\\s*(<<.+?>>)?\\s*:(.*?);\\s*(<<[^<>]+>>(?:\\s*<<[^<>]+>>)*)?\\s*$`,
);

/** `diagram.addActivity(Display.getWithNewlines2(label), style, url, stereogroup)` (`CommandActivity3.java:146-147`):
 *  the action node for a raw label and its trailing stereogroup. */
function actionNode(ctx: ParseContext, idx: number, rawLabel: string, group: string | undefined): ActivityAction {
  const stereotype = stereogroupStereotype(group);
  const color = stereogroupBackColor(group);
  return {
    kind: 'action',
    label: displayWithNewlines(ctx.pragma, rawLabel),
    ...(stereotype !== undefined ? { stereotype } : {}),
    ...stereotypesSpread(group),
    ...innerColorsSpread(group),
    ...(color !== undefined ? { color } : {}),
    ...swimlaneSpread(ctx),
    ...positionSpread(ctx, idx),
  };
}

/** Single-line action without a prefix: `:label;` with an optional trailing stereogroup. */
export function tryAction(ctx: ParseContext, idx: number, line: string): DispatchResult | null {
  const actionMatch = RE_ACTION.exec(line);
  if (actionMatch === null) return null;
  return { idx: idx + 1, node: actionNode(ctx, idx, actionMatch[1]!, actionMatch[2]) };
}

/**
 * Single-line action with a leading `#color` and/or a stereotype before the
 * `:`; `null` for a line with neither (the plain form is {@link tryAction}'s).
 * Each prefix adds its warning, the stereotype's first (`CommandActivity3.java:136-144`).
 * Tried right after `tryRepeat`: `CommandRepeat3` is registered just before
 * `CommandActivity3` (`ActivityDiagramFactory3.java:116-117`) and takes
 * `#c:repeat :x;` first.
 */
export function tryPrefixedAction(ctx: ParseContext, idx: number, line: string): DispatchResult | null {
  const m = RE_PREFIXED_ACTION.exec(line);
  if (m === null) return null;
  const [, color, ignored, label, group] = m;
  if (color === undefined && ignored === undefined) return null;
  if (ignored !== undefined)
    ctx.pragma.addWarning(
      new Warning(`The stereotype ${ignored} before the ':' is ignored: write ':${label!}; ${ignored}' instead`),
    );
  if (color !== undefined)
    ctx.pragma.addWarning(
      new Warning(
        `This syntax is deprecated and the color is ignored: write ':${label!}; <<${color}>>' instead of '${color}:${label!};'`,
      ),
    );
  return { idx: idx + 1, node: actionNode(ctx, idx, label!, group) };
}
