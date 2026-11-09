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
import { Warning } from '../../core/warning/Warning.js';

/** The deprecation warning a leading `#color` earns (the colour itself is ignored):
 *  `CommandRepeat3.java:121-123`, `CommandActivityLong3.java:125-127`, word for word. */
export function deprecatedColorWarning(color: string): Warning {
  return new Warning(`This syntax is deprecated, you must add <<${color}>> at the end of the line, after the ';'`);
}

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
  const colors = stereogroupLabels(group)
    .map((l) => (l.startsWith('#') && l.includes(';') ? l.split(';')[0]! : l))
    .filter((l) => BACK_COLOR_LABEL.test(l));
  const last = colors.at(-1);
  // `new Colors(label, set, ColorType.BACK)` throws on an unknown one: `colorOrNeutral`'s doc.
  return last === undefined ? undefined : colorOrNeutral(last);
}

/**
 * `Stereogroup#getInnerColors`' `#`-label arm: `new Colors(label, colorSet, ColorType.BACK)` (`Stereogroup.java:184-185`,
 * `Colors.java:95-124`) also reads `line:<c>` and `text:<c>` tokens (`ColorType.getType`, `ColorType.java:41-47`);
 * the LAST one of a type wins (`Colors#mergeWith`'s `putAll`, `:80-90`). `start <<#green;line:red>>` strokes red
 * (aar, `tusaxu-17-rasi651`).
 */
function stereogroupTokenColor(group: string | undefined, type: 'line' | 'text'): string | undefined {
  if (group === undefined) return undefined;
  const wanted = new RegExp(`^${type}:(.+)$`, 'i');
  let found: string | undefined;
  for (const label of stereogroupLabels(group)) {
    if (!label.startsWith('#')) continue;
    for (const token of label.split(';')) {
      const m = wanted.exec(token.trim());
      if (m !== null) found = colorOrNeutral(m[1]!);
    }
  }
  return found;
}

/** The `line:` colour of the stereogroup's `#` labels: a terminal circle's stroke, an action box's border. */
export function stereogroupLineColor(group: string | undefined): string | undefined {
  return stereogroupTokenColor(group, 'line');
}

/** The `text:` colour (`ColorType.TEXT`) of the stereogroup's `#` labels: an action box's `FontColor`
 *  (`Style#eventuallyOverride(Colors)`, `Style.java:206-208`, called by `FtileBox.java:155`). */
export function stereogroupTextColor(group: string | undefined): string | undefined {
  return stereogroupTokenColor(group, 'text');
}

/** The `line:` and `text:` colours a box node carries, absent when there are none. */
export function innerColorsSpread(group: string | undefined): { lineColor?: string; textColor?: string } {
  const lineColor = stereogroupLineColor(group);
  const textColor = stereogroupTextColor(group);
  return { ...(lineColor === undefined ? {} : { lineColor }), ...(textColor === undefined ? {} : { textColor }) };
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
