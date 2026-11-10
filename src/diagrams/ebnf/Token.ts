/**
 * `Token`: one lexeme — a {@link Symbol} and, for literals, strings and comments, its text (`null` otherwise).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/Token.java:38-65
 */
import type { Symbol } from './Symbol.js';

export class Token {
  private readonly symbol: Symbol;
  private readonly data: string | null;

  /** Java throws `IllegalArgumentException` for an empty `data`. @see Token.java:43-48 */
  constructor(symbol: Symbol, data: string | null) {
    this.symbol = symbol;
    this.data = data;
    if (data !== null && data.length === 0) throw new Error('IllegalArgumentException');
  }

  /** @see Token.java:50-55 */
  toString(): string {
    if (this.data === null) return this.symbol;
    return `${this.symbol} ${this.data}`;
  }

  /** @see Token.java:57-59 */
  getSymbol(): Symbol {
    return this.symbol;
  }

  /** @see Token.java:61-63 */
  getData(): string | null {
    return this.data;
  }
}
