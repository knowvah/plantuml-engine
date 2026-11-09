/**
 * The `( )` link decorations of `backward`, `elseif` and `else`: `\(`, an optional `->` | `STYLE_COLORS_MULTIPLES`
 * arrow leaf, then the text `(.*?)`, `\)` -- the arrow is no part of the label (aar-T2a/T3a).
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandBackward3.java:67-86
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandElseIf2.java:70-97
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandElse3.java:64-71
 */
import { LINE_STYLE } from '../../core/link-style-regex.js';

/** The optional arrow leaf at the head of the parens' content, no trailing space; group 1 is its style. */
const RE_PAREN_ARROW = new RegExp(`^(?:->|-\\[(${LINE_STYLE}(?:(?:;${LINE_STYLE})*)*)\\]->)`);

/** The parens' text with the arrow leaf removed. */
export function parenArrowText(raw: string): string {
  return raw.replace(RE_PAREN_ARROW, '');
}

/** The arrow leaf's bracketed style (`INCOMING_COLOR`, `WHEN_COLOR`, ...), when there is one. */
export function parenArrowStyle(raw: string): string | undefined {
  return RE_PAREN_ARROW.exec(raw)?.[1];
}
