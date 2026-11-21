import type { Specificity } from './Specificity.js';

/**
 * DarkString — a style value's regular (`value1`) and `@media dark`
 * (`value2`) strings plus its {@link Specificity}. Immutable, as upstream.
 * `null` mirrors upstream's null fields: a regular value has a null
 * `value2`, a dark value a null `value1` (`ValueImpl.java:50-56`), and the
 * jar prints the null (`asString()` of a dark-only value is `null`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/value/DarkString.java
 */
export class DarkString {
  /** @see DarkString.java:44-48 */
  constructor(
    private readonly value1: string | null,
    private readonly value2: string | null,
    private readonly specificity: Specificity,
  ) {}

  /**
   * Regular+regular or dark+dark: the strictly bigger specificity wins, else
   * `other`. Regular+dark (either order): combined, keeping the regular
   * side's specificity. Anything else falls back to specificity.
   * @see DarkString.java:50-67
   */
  mergeWith(other: DarkString | undefined): DarkString {
    if (other === undefined) return this;

    if (this.bothRegularOrBothDark(other)) {
      if (this.specificity.isBiggerThan(other.specificity)) return this;
      return other;
    }
    if (this.value2 === null && other.value1 === null)
      return new DarkString(this.value1, other.value2, this.specificity);
    if (other.value2 === null && this.value1 === null)
      return new DarkString(other.value1, this.value2, other.specificity);

    if (this.specificity.isBiggerThan(other.specificity)) return this;
    return other;
  }

  /**
   * The first `mergeWith` test, `(this.value2 == null && other.value2 == null)
   * || this.value1 == null && other.value1 == null`, split out only for the
   * complexity hook (CCN <= 10); evaluated at the same point, same operands.
   * @see DarkString.java:54
   */
  private bothRegularOrBothDark(other: DarkString): boolean {
    return (this.value2 === null && other.value2 === null) || (this.value1 === null && other.value1 === null);
  }

  /** @see DarkString.java:69-71 */
  withAncestorRank(rank: number): DarkString {
    return new DarkString(this.value1, this.value2, this.specificity.withAncestorRank(rank));
  }

  /** @see DarkString.java:73-75 */
  withStereotypeCount(count: number): DarkString {
    return new DarkString(this.value1, this.value2, this.specificity.withStereotypeCount(count));
  }

  /** `value1 + "/" + value2 + " (" + specificity + ")"`, nulls as `null`. @see DarkString.java:77-80 */
  toString(): string {
    return `${String(this.value1)}/${String(this.value2)} (${this.specificity.toString()})`;
  }

  /** @see DarkString.java:82-84 */
  getValue1(): string | null {
    return this.value1;
  }

  /** @see DarkString.java:86-88 */
  getValue2(): string | null {
    return this.value2;
  }

  /** @see DarkString.java:90-92 */
  getSpecificity(): Specificity {
    return this.specificity;
  }
}
