/**
 * `WLinkType`: a thin link (`-`) or a bus (`=`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WLinkType.java:38-62
 */
export class WLinkType {
  static readonly NORMAL = new WLinkType('NORMAL');
  static readonly BUS = new WLinkType('BUS');

  private constructor(private readonly name: string) {}

  /** `-` is tested before `=`. @see WLinkType.java:42-50 */
  static from(arg: string): WLinkType {
    if (arg.includes('-')) return WLinkType.NORMAL;
    if (arg.includes('=')) return WLinkType.BUS;
    throw new Error('IllegalArgumentException');
  }

  /**
   * The gap to the next link leaving the same block. The Java switch's trailing `throw` is unreachable: the two
   * singletons are the only instances.
   * @see WLinkType.java:52-60
   */
  spaceForNext(): number {
    return this === WLinkType.NORMAL ? 15 : 25;
  }

  toString(): string {
    return this.name;
  }
}
