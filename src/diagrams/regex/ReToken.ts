/**
 * `ReToken`: one regex lexeme, a {@link ReTokenType} and its text.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/ReToken.java:38-61
 */
import type { ReTokenType } from './ReTokenType.js';

export class ReToken {
  private readonly type: ReTokenType;
  private readonly data: string;

  /** @see ReToken.java:43-46 */
  constructor(type: ReTokenType, data: string) {
    this.type = type;
    this.data = data;
  }

  /** `type.toString() + "[" + data + "]"`. @see ReToken.java:48-51 */
  toString(): string {
    return `${this.type}[${this.data}]`;
  }

  /** @see ReToken.java:53-55 */
  getType(): ReTokenType {
    return this.type;
  }

  /** @see ReToken.java:57-59 */
  getData(): string {
    return this.data;
  }
}
