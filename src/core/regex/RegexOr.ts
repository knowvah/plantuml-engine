/**
 * `RegexOr` -- the alternation of its children, one capture group when it is named (`arg.get(name, 0)` is then the
 * whole alternative, or `undefined` when the `or` did not take part).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexOr.java:42-91
 */
import type { IRegex } from './IRegex.js';
import { RegexComposed } from './RegexComposed.js';
import { RegexPartialMatch } from './RegexPartialMatch.js';
import type { RegexResult } from './RegexResult.js';

export class RegexOr extends RegexComposed {
  private readonly name: string | undefined;

  /** The two Java constructors: `(partials...)` and `(name, partials...)`. @see RegexOr.java:47-54 */
  constructor(...partial: IRegex[]);
  constructor(name: string | undefined, ...partial: IRegex[]);
  constructor(first?: string | IRegex, ...rest: IRegex[]) {
    const named = typeof first === 'string' || first === undefined;
    super(...(named ? rest : [first, ...rest]));
    this.name = named ? first : undefined;
  }

  /** @see RegexOr.java:56-71 */
  getPatternAsString(): string {
    return (
      '(' +
      (this.name === undefined ? '?:' : '') +
      this.partials()
        .map((p) => p.getPatternAsString())
        .join('|') +
      ')'
    );
  }

  /** @see RegexOr.java:73-75 */
  protected override getStartCount(): number {
    return 1;
  }

  /** This node's own group comes before its children's, and its own entry is added after theirs. @see RegexOr.java:74-85 */
  override fillPartialMatch(it: Iterator<string | undefined>, result: RegexResult): void {
    // Java's `name == null ? null : it.next()`: an unnamed `or` is `(?:` and owns no group.
    const fullGroup = this.name === undefined ? undefined : (it.next().value as string | undefined);
    super.fillPartialMatch(it, result);
    if (this.name !== undefined) {
      const m = new RegexPartialMatch(1);
      m.add(fullGroup);
      result.add(this.name, m);
    }
  }

  /** @see RegexOr.java:87-89 */
  override match(_s: string): boolean {
    throw new Error('UnsupportedOperationException');
  }
}
