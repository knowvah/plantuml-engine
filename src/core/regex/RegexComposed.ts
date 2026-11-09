/**
 * `RegexComposed` -- the base of the composite nodes: it concatenates its children's sources, counts their groups
 * and, as a root, compiles and runs the whole pattern.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexComposed.java:49-123
 */
import type { IRegex } from './IRegex.js';
import { compileInternal } from './Pattern2.js';
import type { RegexPartialMatch } from './RegexPartialMatch.js';
import { RegexResult } from './RegexResult.js';

export abstract class RegexComposed implements IRegex {
  private readonly parts: readonly IRegex[];
  private compiled: RegExp | undefined = undefined;

  /** @see RegexComposed.java:77-79 */
  constructor(...partial: IRegex[]) {
    this.parts = [...partial];
  }

  abstract getPatternAsString(): string;

  /** @see RegexComposed.java:49 */
  protected partials(): readonly IRegex[] {
    return this.parts;
  }

  /** `Pattern2.cmpile`, once. @see RegexComposed.java:54-67 */
  private getPattern(): RegExp {
    this.compiled ??= compileInternal(this.getPatternAsString());
    return this.compiled;
  }

  /** @see RegexComposed.java:81-88 */
  createPartialMatch(it: Iterator<string | undefined>): Map<string, RegexPartialMatch> {
    const result = new Map<string, RegexPartialMatch>();
    for (const r of this.parts) for (const [key, value] of r.createPartialMatch(it)) result.set(key, value);

    return result;
  }

  /** @see RegexComposed.java:90-96 */
  count(): number {
    let cpt = this.getStartCount();
    for (const r of this.parts) cpt += r.count();

    return cpt;
  }

  /** @see RegexComposed.java:98-100 */
  protected getStartCount(): number {
    return 0;
  }

  /** `Matcher#find`, then the groups through `createPartialMatch`. @see RegexComposed.java:102-109 */
  matcher(s: string): RegexResult | undefined {
    const m = this.getPattern().exec(s);
    if (m === null) return undefined;

    return RegexResult.fromMap(this.createPartialMatch(m.slice(1).values()));
  }

  /** `Matcher#find`. @see RegexComposed.java:111-118 */
  match(s: string): boolean {
    return this.getPattern().test(s);
  }
}
