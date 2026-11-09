/**
 * `IRegex` -- one node of a command grammar (`RegexLeaf`, `RegexOptional`, `RegexOr`, `RegexConcat`). Java's
 * `match(StringLocated)` takes the string here: `SingleLineCommand2` is the only caller and passes `getString()`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/IRegex.java
 */
import type { RegexPartialMatch } from './RegexPartialMatch.js';
import type { RegexResult } from './RegexResult.js';

export interface IRegex {
  /** The Java regex source of this node, `%`-tokens unexpanded. */
  getPatternAsString(): string;
  /** The number of capture groups this node (and its children) contributes. */
  count(): number;
  /** Consumes this node's groups from `it` and names them. */
  createPartialMatch(it: Iterator<string | undefined>): Map<string, RegexPartialMatch>;
  /** `UnsupportedOperationException` on a leaf, an optional and an `or`. */
  match(s: string): boolean;
  /** `UnsupportedOperationException` on a leaf, an optional and an `or`; `undefined` is Java `null`. */
  matcher(s: string): RegexResult | undefined;
}
