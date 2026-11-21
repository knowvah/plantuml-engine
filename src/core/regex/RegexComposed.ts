/**
 * `RegexComposed` -- the base of the composite nodes: it concatenates its children's sources, counts their groups
 * and, as a root, compiles and runs the whole pattern.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexComposed.java:46-120
 */
import type { IRegex } from './IRegex.js';
import { compileInternal } from './Pattern2.js';
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

  /** @see RegexComposed.java:80-84 */
  fillPartialMatch(it: Iterator<string | undefined>, result: RegexResult): void {
    for (const r of this.parts) r.fillPartialMatch(it, result);
  }

  /** @see RegexComposed.java:86-92 */
  count(): number {
    let cpt = this.getStartCount();
    for (const r of this.parts) cpt += r.count();

    return cpt;
  }

  /** @see RegexComposed.java:94-96 */
  protected getStartCount(): number {
    return 0;
  }

  /** `Matcher#find`, then the one result every node fills through `fillPartialMatch`. @see RegexComposed.java:98-108 */
  matcher(s: string): RegexResult | undefined {
    const m = this.getPattern().exec(s);
    if (m === null) return undefined;

    const result = RegexResult.create();
    this.fillPartialMatch(m.slice(1).values(), result);
    return result;
  }

  /** `Pattern2#find`. @see RegexComposed.java:110-112 */
  match(s: string): boolean {
    return this.getPattern().test(s);
  }
}
