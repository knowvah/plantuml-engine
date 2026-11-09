/**
 * `RegexOptional` -- `(?:child)?`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexOptional.java:43-60
 */
import type { IRegex } from './IRegex.js';
import { RegexComposed } from './RegexComposed.js';

export class RegexOptional extends RegexComposed {
  /** @see RegexOptional.java:45-47 */
  constructor(partial: IRegex) {
    super(partial);
  }

  /** @see RegexOptional.java:49-55 */
  getPatternAsString(): string {
    return '(?:' + this.partials()[0]!.getPatternAsString() + ')?';
  }

  /** @see RegexOptional.java:57-59 */
  override match(_s: string): boolean {
    throw new Error('UnsupportedOperationException');
  }
}
