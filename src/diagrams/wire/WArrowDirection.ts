/**
 * `WArrowDirection`: which ends of a wire link carry a head. A class of named singletons, so the Java spelling
 * `WArrowDirection.from(style)` survives and `toString` prints the enum's name.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WArrowDirection.java:38-54
 */
export class WArrowDirection {
  static readonly NORMAL = new WArrowDirection('NORMAL');
  static readonly REVERSE = new WArrowDirection('REVERSE');
  static readonly BOTH = new WArrowDirection('BOTH');
  static readonly NONE = new WArrowDirection('NONE');

  private constructor(private readonly name: string) {}

  /** @see WArrowDirection.java:41-52 */
  static from(type: string): WArrowDirection {
    if (type.includes('<') && type.includes('>')) return WArrowDirection.BOTH;
    if (type.includes('>')) return WArrowDirection.NORMAL;
    if (type.includes('<')) return WArrowDirection.REVERSE;
    return WArrowDirection.NONE;
  }

  toString(): string {
    return this.name;
  }
}
