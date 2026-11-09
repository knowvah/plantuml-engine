/**
 * `RegexLeaf` -- a named piece of regex source with a declared capture-group count. Java's `getFoxSignature` is the
 * pre-filter `RegexConcat#match` uses to skip lines that cannot match; it only ever answers `false` early, never
 * changes a match, so it is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexLeaf.java:44-110
 */
import type { IRegex } from './IRegex.js';
import { RegexPartialMatch } from './RegexPartialMatch.js';
import type { RegexResult } from './RegexResult.js';

export class RegexLeaf implements IRegex {
  /** @see RegexLeaf.java:46-47 */
  private static readonly END = new RegexLeaf('$');
  private static readonly START = new RegexLeaf('^');

  private readonly pattern: string;
  private readonly name: string | undefined;
  private readonly groupCount: number;

  /** The three Java constructors: `(regex)`, `(count, regex)` and `(count, name, regex)`.
   *  @see RegexLeaf.java:54-69 */
  constructor(regex: string);
  constructor(count: number, regex: string);
  constructor(count: number, name: string | undefined, regex: string);
  constructor(a: string | number, b?: string, c?: string) {
    if (typeof a === 'string') {
      this.groupCount = 0;
      this.name = undefined;
      this.pattern = a;
    } else if (c === undefined) {
      this.groupCount = a;
      this.name = undefined;
      this.pattern = b as string;
    } else {
      this.groupCount = a;
      this.name = b;
      this.pattern = c;
    }
  }

  /** @see RegexLeaf.java:71-73 */
  static spaceZeroOrMore(): RegexLeaf {
    return new RegexLeaf('[%s]*');
  }

  /** @see RegexLeaf.java:75-77 */
  static spaceOne(): RegexLeaf {
    return new RegexLeaf('[%s]');
  }

  /** @see RegexLeaf.java:83-85 */
  static spaceOneOrMore(): RegexLeaf {
    return new RegexLeaf('[%s]+');
  }

  /** @see RegexLeaf.java:87-89 */
  static start(): RegexLeaf {
    return RegexLeaf.START;
  }

  /** @see RegexLeaf.java:91-93 */
  static end(): RegexLeaf {
    return RegexLeaf.END;
  }

  /** @see RegexLeaf.java:100-102 */
  getName(): string | undefined {
    return this.name;
  }

  /** @see RegexLeaf.java:104-107 */
  getPatternAsString(): string {
    return this.pattern;
  }

  /** @see RegexLeaf.java:109-111 */
  count(): number {
    return this.groupCount;
  }

  /** @see RegexLeaf.java:117-126 */
  createPartialMatch(it: Iterator<string | undefined>): Map<string, RegexPartialMatch> {
    const m = new RegexPartialMatch(this.name ?? '');
    for (let i = 0; i < this.count(); i++) m.add(it.next().value as string | undefined);

    if (this.name === undefined) return new Map();

    return new Map([[this.name, m]]);
  }

  /** @see RegexLeaf.java:128-130 */
  match(_s: string): boolean {
    throw new Error('UnsupportedOperationException');
  }

  /** @see RegexLeaf.java:132-134 */
  matcher(_s: string): RegexResult | undefined {
    throw new Error('UnsupportedOperationException');
  }
}
