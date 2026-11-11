/**
 * `WOrientation`: a doubled `--` or `==` anywhere in the style makes the link vertical, so `<=>` is horizontal and
 * `<==>` vertical (wrp D4).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WOrientation.java:38-48
 */
export class WOrientation {
  static readonly HORIZONTAL = new WOrientation('HORIZONTAL');
  static readonly VERTICAL = new WOrientation('VERTICAL');

  private constructor(private readonly name: string) {}

  /** @see WOrientation.java:42-47 */
  static from(style: string): WOrientation {
    if (style.includes('==') || style.includes('--')) return WOrientation.VERTICAL;
    return WOrientation.HORIZONTAL;
  }

  toString(): string {
    return this.name;
  }
}
