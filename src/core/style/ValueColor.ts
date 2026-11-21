import type { HColor, HColorSet } from './Value.js';
import type { Specificity } from './Specificity.js';
import { ValueAbstract } from './ValueAbstract.js';

/**
 * ValueColor — an already-resolved colour with a specificity; every other
 * accessor is `ValueAbstract`'s unsupported throw.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/value/ValueColor.java:41-65
 */
export class ValueColor extends ValueAbstract {
  /** @see ValueColor.java:51-54 */
  constructor(
    private readonly color: HColor,
    private readonly specificity: Specificity,
  ) {
    super();
  }

  /** @see ValueColor.java:46-49 */
  override toString(): string {
    return this.color.toString();
  }

  /** Returns the stored colour; the set is not consulted. @see ValueColor.java:56-59 */
  override asColor(_set: HColorSet): HColor {
    return this.color;
  }

  /** @see ValueColor.java:61-64 */
  override getSpecificity(): Specificity {
    return this.specificity;
  }
}
