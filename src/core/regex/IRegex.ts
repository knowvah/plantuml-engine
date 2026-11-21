/**
 * `IRegex` -- one node of a command grammar (`RegexLeaf`, `RegexOptional`, `RegexOr`, `RegexConcat`). Java's
 * `match(StringLocated)` takes the string here: `SingleLineCommand2` is the only caller and passes `getString()`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/IRegex.java
 */
import type { RegexResult } from './RegexResult.js';

export interface IRegex {
  /** The Java regex source of this node, `%`-tokens unexpanded. */
  getPatternAsString(): string;
  /** The number of capture groups this node (and its children) contributes. */
  count(): number;
  /**
   * Consumes exactly {@link count} groups from `it` and adds the named ones to `result`, in order (upstream
   * `e2659a157bf`: one `RegexResult` filled by every node, replacing the per-node maps).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/IRegex.java:48-59
   */
  fillPartialMatch(it: Iterator<string | undefined>, result: RegexResult): void;
  /** `UnsupportedOperationException` on a leaf, an optional and an `or`. */
  match(s: string): boolean;
  /** `UnsupportedOperationException` on a leaf, an optional and an `or`; `undefined` is Java `null`. */
  matcher(s: string): RegexResult | undefined;
}
