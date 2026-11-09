/**
 * `StereotypePattern` -- the `<<stereo>>` slot of the regex command grammars (`optional`, `mandatory`). The ubrex
 * variants (`umandatory`, `uoptional`) and `optionalArchimate`, `optionalIGNORED`, `removeChevronBrackets` have no
 * caller on the regex side yet.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/stereo/StereotypePattern.java:48-70
 */
import type { IRegex } from '../regex/IRegex.js';
import { RegexConcat } from '../regex/RegexConcat.js';
import { RegexLeaf } from '../regex/RegexLeaf.js';
import { RegexOptional } from '../regex/RegexOptional.js';

/** `@Deprecated`, mirrored. @see StereotypePattern.java:48-57 */
export function optional(param: string): IRegex {
  return new RegexConcat(RegexLeaf.spaceZeroOrMore(), new RegexOptional(mandatory(param)), RegexLeaf.spaceZeroOrMore());
}

/** @see StereotypePattern.java:63-65 */
export function mandatory(param: string): RegexLeaf {
  return new RegexLeaf(1, param, '(\\<\\<.+?\\>\\>)');
}
