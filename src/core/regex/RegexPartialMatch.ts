/**
 * `RegexPartialMatch` -- the captured strings of one named regex node. Java
 * `null` entries (a group that did not participate) are `undefined`. `get`
 * out of range throws `RangeError` (Java `IndexOutOfBoundsException`).
 *
 * Upstream `e2659a157bf` made it a fixed-capacity array: the number of groups
 * is known before the first is added (one for `RegexOr`, `count()` for a
 * `RegexLeaf`), and it is no longer `Iterable`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexPartialMatch.java:40-70
 */
export class RegexPartialMatch {
  private readonly data: (string | undefined)[];
  private count = 0;

  /** @see RegexPartialMatch.java:47-49 */
  public constructor(capacity: number) {
    this.data = new Array<string | undefined>(capacity).fill(undefined);
  }

  /** @see RegexPartialMatch.java:51-53 */
  public add(group: string | undefined): void {
    this.data[this.count++] = group;
  }

  /** @see RegexPartialMatch.java:55-57 */
  public size(): number {
    return this.count;
  }

  /** @see RegexPartialMatch.java:59-64 */
  public get(i: number): string | undefined {
    if (!Number.isInteger(i) || i < 0 || i >= this.count)
      throw new RangeError('Index: ' + String(i) + ', Size: ' + String(this.count));
    return this.data[i];
  }

  /** `"{" + Arrays.asList(data) + "}"`: every slot of the capacity, `null` for an absent one. @see RegexPartialMatch.java:66-69 */
  public toString(): string {
    return '{[' + this.data.map((s) => (s === undefined ? 'null' : s)).join(', ') + ']}';
  }
}
