/**
 * Specificity — how specific a style declaration is: an ordered tuple
 * compared one component at a time, most significant first, never one
 * number that several tiers are summed or multiplied into. It replaced the
 * single-int priority (plain counter + `DELTA_PRIORITY_FOR_STEREOTYPE` for a
 * stereotype rule + the wbs/mindmap `STEP_BY_PARENT * 1000` cascade lift,
 * which overflowed `int`) in upstream c9d62097ff5. Immutable, as upstream.
 *
 * From most to least significant (Specificity.java:55-78):
 * - `forced`: an explicit override (`Style#eventuallyOverride`) that always wins;
 * - `ancestorCascade`: applied through the wbs/mindmap ancestor-inheritance
 *   cascade (`StyleBuilder#getMergedStyleSpecial`), outranking any ordinary declaration;
 * - `ancestorRank`: only meaningful under the cascade -- 0 is the element's
 *   own level, more negative is farther up, so a nearer ancestor wins;
 * - `stereotypeCount`: how many stereotypes the selector requires, so a
 *   declaration naming more stereotypes beats one naming fewer;
 * - `order`: the position the declaration was parsed at, the source-order tiebreak.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/value/Specificity.java:80-165
 */
export class Specificity {
  /** @see Specificity.java:88-94 */
  private constructor(
    private readonly forced: boolean,
    private readonly ancestorCascade: boolean,
    private readonly ancestorRank: number,
    private readonly stereotypeCount: number,
    private readonly order: number,
  ) {}

  /** A plain declaration's specificity, at the position it was parsed at. @see Specificity.java:96-99 */
  static atOrder(order: number): Specificity {
    return new Specificity(false, false, 0, 0, order);
  }

  /** An explicit, programmatic override that always wins. @see Specificity.java:101-108 */
  static forcedOverride(): Specificity {
    return new Specificity(true, false, 0, 0, 0);
  }

  /** This specificity, requiring `count` stereotypes. @see Specificity.java:110-113 */
  withStereotypeCount(count: number): Specificity {
    return new Specificity(this.forced, this.ancestorCascade, this.ancestorRank, count, this.order);
  }

  /** This specificity, applied through the ancestor cascade at `rank` (0 = own level). @see Specificity.java:115-122 */
  withAncestorRank(rank: number): Specificity {
    return new Specificity(this.forced, true, rank, this.stereotypeCount, this.order);
  }

  /** Whether the declaration requires at least one stereotype. @see Specificity.java:124-127 */
  hasStereotype(): boolean {
    return this.stereotypeCount > 0;
  }

  /** Tier by tier: forced, ancestor cascade, ancestor rank, stereotype count, order. @see Specificity.java:129-148 */
  compareTo(other: Specificity): number {
    if (this.forced !== other.forced) return this.forced ? 1 : -1;
    if (this.ancestorCascade !== other.ancestorCascade) return this.ancestorCascade ? 1 : -1;
    if (this.ancestorRank !== other.ancestorRank) return Math.sign(this.ancestorRank - other.ancestorRank);
    if (this.stereotypeCount !== other.stereotypeCount) return Math.sign(this.stereotypeCount - other.stereotypeCount);
    return Math.sign(this.order - other.order);
  }

  /** @see Specificity.java:150-152 */
  isBiggerThan(other: Specificity): boolean {
    return this.compareTo(other) > 0;
  }

  /** @see Specificity.java:154-163 */
  toString(): string {
    if (this.forced) return 'override';
    if (this.ancestorCascade)
      return `${String(this.order)},stereo=${String(this.stereotypeCount)},ancestor=${String(this.ancestorRank)}`;
    if (this.stereotypeCount !== 0) return `${String(this.order)},stereo=${String(this.stereotypeCount)}`;
    return String(this.order);
  }
}
