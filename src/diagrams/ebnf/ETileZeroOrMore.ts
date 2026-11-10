/**
 * `ETileZeroOrMore`: `{ x }`, an optional bypass around a loop — `ETileOptional2` over `ETileOneOrMore`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileZeroOrMore.java:40-46
 */
import type { SkinParam } from './ebnf-skin-param.js';
import type { ETile } from './ETile.js';
import { ETileOneOrMore } from './ETileOneOrMore.js';
import { ETileOptional2 } from './ETileOptional2.js';

export class ETileZeroOrMore extends ETileOptional2 {
  /** @see ETileZeroOrMore.java:42-44 */
  constructor(orig: ETile, skinParam: SkinParam) {
    super(new ETileOneOrMore(orig), skinParam);
  }
}
