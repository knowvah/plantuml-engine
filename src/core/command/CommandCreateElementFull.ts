/**
 * The public regex constants of `CommandCreateElementFull`, which upstream's
 * `CommandCreateElementFull2` (class factory) reads as well.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/command/CommandCreateElementFull.java:76,126-132
 */
import { Stereotag } from '../abel/Stereotag.js';
import { COLORS_REGEXP } from '../klimt/color/ColorParser.js';
import { getRegexp, transform } from '../url/UrlBuilder.js';

/** @see CommandCreateElementFull.java:76 */
export const ALL_TYPES =
  'person|artifact|actor/|actor|folder|card|file|package|rectangle|hexagon|label|node|frame|cloud|action|process|database|queue|stack|storage|agent|usecase/|usecase|component|boundary|control|entity|interface|circle|collections|port|portin|portout';

/** @see CommandCreateElementFull.java:126 */
const CODE_CORE = String.raw`[%pLN_.]+|\(\)[%s]*[%pLN_.]+|\(\)[%s]*[%g][^%g]+[%g]|:[^:]+:/?|\([^()]+\)/?|\[[^\[\]]+\]`;
/** @see CommandCreateElementFull.java:127 */
export const CODE = `(?:${CODE_CORE})`;
/** @see CommandCreateElementFull.java:128 */
export const CODE_WITH_QUOTE = `(?:${CODE_CORE}|[%g].+?[%g])`;

/** @see CommandCreateElementFull.java:130 */
const DISPLAY_CORE = String.raw`[%g].+?[%g]|:[^:]+:/?|\([^()]+\)/?|\[[^\[\]]+\]`;
/** @see CommandCreateElementFull.java:131 */
export const DISPLAY = `(?:${DISPLAY_CORE})`;
/** @see CommandCreateElementFull.java:132 */
export const DISPLAY_WITHOUT_QUOTE = `(?:${DISPLAY_CORE}|[%pLN_.]+)`;

/** `StereotypePattern.optional(param)`, `stereo/StereotypePattern.java:53-58,66-67`. */
export function optionalStereotype(group: string): string {
  return `[%s]*(?<${group}><<.+?>>)?[%s]*`;
}

/**
 * The anchored tail both commands share: TAGS1, STEREOTYPE, TAGS2, URL, then a
 * colour under `color` (`CommandCreateElementFull.java:107-115`,
 * `CommandCreateElementFull2.java` the same run).
 */
export function elementTail(): string {
  const tags = (group: string): string => `(?<${group}>${Stereotag.pattern()})?`;
  return (
    `[%s]*${tags('TAGS1')}${optionalStereotype('STEREOTYPE')}${tags('TAGS2')}` +
    `[%s]*(?<URL>${getRegexp()})?[%s]*(?<COLOR>${COLORS_REGEXP})?$`
  );
}

/** `Pattern2.cmpile`: the `%` tokens substituted, compiled case-insensitively (`regex/Pattern2.java:109-114`). */
export function compileUpstream(pattern: string): RegExp {
  return new RegExp(transform(pattern), 'iu');
}
