/**
 * dispatch-stereogroup -- the single `stereotype` an activity keeps from its
 * trailing stereogroup (`<<a>> <<b>>`), split out of `dispatch-support.ts`
 * (500-line cap).
 *
 * `Stereogroup#getLabels` (`stereo/Stereogroup.java:134-144`) is every
 * `<<([^<>]+)>>` match, trimmed; `getBoxStyle` (`:100-107`) is the FIRST
 * label `BoxStyle.fromString` maps to a non-PLAIN style. The AST keeps one
 * field, so it carries that label when there is one, else the first label
 * (the pre-existing single-stereotype behaviour), lowercased.
 */
import { colorOrNeutral } from '../../core/klimt/color/HColorSet.js';
import { boxStyleName } from './tiles/gtile-action.js';

/** `Stereogroup.java:70`'s `pattern`. */
const STEREO_LABEL = /<<([^<>]+)>>/g;

/** See module doc. `undefined` when there is no stereogroup. */
export function stereogroupStereotype(group: string | undefined): string | undefined {
  if (group === undefined) return undefined;
  const labels = [...group.matchAll(STEREO_LABEL)].map((m) => m[1]!.trim().toLowerCase());
  return labels.find((l) => boxStyleName(l) !== undefined) ?? labels[0];
}

/** `Stereogroup#getLabels` (`Stereogroup.java:134-144`): every label, trimmed, in group order. */
export function stereogroupLabels(group: string | undefined): readonly string[] {
  return group === undefined ? [] : [...group.matchAll(STEREO_LABEL)].map((m) => m[1]!.trim());
}

/** The `stereotypes` an action or backward node carries: every label of `group`, absent when there is none. */
export function stereotypesSpread(group: string | undefined): { stereotypes?: readonly string[] } {
  const labels = stereogroupLabels(group);
  return labels.length === 0 ? {} : { stereotypes: labels };
}

/** A bare `#color` label, the slice of `Stereogroup#getInnerColors`
 *  (`Stereogroup.java:184-185`, `new Colors(label, set, ColorType.BACK)`)
 *  this port reads. `##`/`###` (line/text colour) and `name:value;` style
 *  labels (`:150-190`) are not ported. */
const BACK_COLOR_LABEL = /^#\w+(?:[-\\|/]\w+)?$/;

/** The BACK colour of the stereogroup's `<<#color>>` labels -- the LAST one
 *  wins, `Colors#mergeWith`'s `putAll` (`klimt/color/Colors.java:80-90`). */
export function stereogroupBackColor(group: string | undefined): string | undefined {
  if (group === undefined) return undefined;
  const colors = [...group.matchAll(STEREO_LABEL)].map((m) => m[1]!.trim()).filter((l) => BACK_COLOR_LABEL.test(l));
  const last = colors.at(-1);
  // `new Colors(label, set, ColorType.BACK)` throws on an unknown one: `colorOrNeutral`'s doc.
  return last === undefined ? undefined : colorOrNeutral(last);
}

/** The `colour` a command's node carries: the BACK of its stereogroup, absent when there is none. */
export function backColorSpread(group: string | undefined): { color?: string } {
  const color = stereogroupBackColor(group);
  return color === undefined ? {} : { color };
}

/** `start`/`stop`/`end` and an optional trailing stereogroup (`;?` is stripped before dispatch).
 *  @see net/sourceforge/plantuml/activitydiagram3/command/CommandStart3.java:58-65
 *  @see net/sourceforge/plantuml/activitydiagram3/command/CommandStop3.java:58-65
 *  @see net/sourceforge/plantuml/activitydiagram3/command/CommandEnd3.java:58-65 */
export const RE_TERMINAL = /^(start|stop|end)\s*(<<[^<>]+>>(?:\s*<<[^<>]+>>)*)?$/i;

/** The `repeat` head's `<<stereogroup>>` alone: `repeat` with no `:label;`
 *  @see net/sourceforge/plantuml/activitydiagram3/command/CommandRepeat3.java:64-77 */
export const RE_REPEAT_STEREOGROUP = /^(<<[^<>]+>>(?:\s*<<[^<>]+>>)*)$/;
