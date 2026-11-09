/**
 * `RegexConcat` -- the sequence of its children; as a root it is a whole command grammar, bracketed by
 * `RegexLeaf.start()` and `RegexLeaf.end()`. Java's `foxRegex` signature pre-filter and `protectSize` are not
 * ported: the first never changes an answer, the second is never called by the engines ported so far.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexConcat.java:49-182
 */
import type { IRegex } from './IRegex.js';
import { RegexComposed } from './RegexComposed.js';

export class RegexConcat extends RegexComposed {
  /** `build(key, partials...)`: the `key` only served a cache that is commented out upstream.
   *  @see RegexConcat.java:96-111 */
  static build(_key: string, ...partials: IRegex[]): RegexConcat {
    return new RegexConcat(...partials);
  }

  /** @see RegexConcat.java:176-181 */
  getPatternAsString(): string {
    return this.partials()
      .map((p) => p.getPatternAsString())
      .join('');
  }
}
