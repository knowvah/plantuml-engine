/**
 * `RegexResult` -- result of a command pattern match, backed either by the
 * named groups `RegexComposed#matcher` fills in (the regex/`RegexConcat`
 * world) or by a ubrex {@link UMatcher}. Java's package-private `RegexResult()`
 * is {@link RegexResult.create}, `RegexResult(UMatcher)` is
 * {@link RegexResult.fromUMatcher}.
 *
 * Upstream `e2659a157bf` replaced the `HashMap` with two arrays kept in the
 * order `fillPartialMatch` adds them (`RegexResult.java:46-53`): `get` returns
 * the FIRST group of a name and `getLazzy` the FIRST group with the prefix and
 * a value. Upstream asserts (under `TeaVM.a()` only) that neither case is
 * ambiguous; the release jar runs without, so two groups sharing a name or a
 * prefix now resolve to the earlier one -- `archimate #Technology X ... #F1F1F1 [`
 * paints `#Technology`, where the HashMap kept the later.
 *
 * Java `null` returns are `undefined`; `UnsupportedOperationException` /
 * `IndexOutOfBoundsException` are `Error` (message = class name) /
 * `RangeError`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexResult.java:44-175
 */
import type { UMatcher } from '../ubrex/UMatcher.js';
import type { RegexPartialMatch } from './RegexPartialMatch.js';

/** `List#get(int)`: `IndexOutOfBoundsException` -> `RangeError`. */
function listGet(list: readonly string[], num: number): string {
  if (!Number.isInteger(num) || num < 0 || num >= list.length)
    throw new RangeError('Index ' + String(num) + ' out of bounds for length ' + String(list.length));
  return list[num] as string;
}

export class RegexResult {
  /** The named groups of one match, in the order `fillPartialMatch` added them. @see RegexResult.java:46-52 */
  private readonly names: string[] = [];
  private readonly values: RegexPartialMatch[] = [];
  private readonly matcher: UMatcher | undefined;

  private constructor(matcher: UMatcher | undefined) {
    this.matcher = matcher;
  }

  /** `RegexResult()`, filled by `RegexComposed#matcher` through `fillPartialMatch`. @see RegexResult.java:59-64 */
  public static create(): RegexResult {
    return new RegexResult(undefined);
  }

  /** `RegexResult(UMatcher)`: no named groups. @see RegexResult.java:66-70 */
  public static fromUMatcher(matcher: UMatcher): RegexResult {
    return new RegexResult(matcher);
  }

  /** @see RegexResult.java:55-57 */
  public getUMatcher(): UMatcher | undefined {
    return this.matcher;
  }

  /** Appends a group; a repeated name is kept, and `get` answers the first. @see RegexResult.java:72-84 */
  public add(name: string, value: RegexPartialMatch): void {
    this.names.push(name);
    this.values.push(value);
  }

  /** @see RegexResult.java:86-91 */
  private indexOf(key: string): number {
    return this.names.indexOf(key);
  }

  /** `{k=v, k2=v2}` when built from groups. @see RegexResult.java:93-104 */
  public toString(): string {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Java Object#toString: every UMatcher implementation has one
    if (this.matcher !== undefined) return String(this.matcher);
    return '{' + this.names.map((k, i) => k + '=' + this.values[i]!.toString()).join(', ') + '}';
  }

  /** `get(String)` (:106-111) and `get(String, int)` (:113-126) overloads. @see RegexResult.java:106-126 */
  public get(key: string): RegexPartialMatch | undefined;
  public get(key: string, num: number): string | undefined;
  public get(key: string, num?: number): RegexPartialMatch | string | undefined {
    if (num === undefined) {
      if (this.matcher !== undefined) throw new Error('UnsupportedOperationException');
      const idx = this.indexOf(key);
      return idx === -1 ? undefined : this.values[idx];
    }
    if (this.matcher !== undefined) {
      const list = this.matcher.findValuesByKey(key);
      if (list.length === 0) return undefined;
      return listGet(list, num);
    }
    const reg = this.get(key);
    if (reg === undefined) return undefined;

    return reg.get(num);
  }

  /** The first group, in match order, whose name starts with `key` and has a value at `num`. @see RegexResult.java:128-149 */
  public getLazzy(key: string, num: number): string | undefined {
    if (this.matcher !== undefined) {
      const list = this.matcher.findFirstValuesByKeyPrefix(key);
      if (list === undefined || list.length === 0) return undefined;
      return listGet(list, num);
    }

    for (let i = 0; i < this.names.length; i++) {
      const value = this.lazzyValue(i, key, num);
      if (value !== undefined) return value;
    }
    return undefined;
  }

  /** @see RegexResult.java:151-160 */
  private lazzyValue(i: number, key: string, num: number): string | undefined {
    if (!this.names[i]!.startsWith(key)) return undefined;

    const match = this.values[i]!;
    if (num >= match.size()) return undefined;

    return match.get(num);
  }

  /** @see RegexResult.java:169-173 */
  public size(): number {
    if (this.matcher !== undefined) throw new Error('UnsupportedOperationException');
    return this.names.length;
  }
}
