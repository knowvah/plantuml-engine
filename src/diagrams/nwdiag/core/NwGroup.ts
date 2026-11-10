/**
 * NwGroup — a named set of servers drawn as one box behind them, with an
 * optional description as its header. `names` is a Java `HashSet<String>`
 * read only through `contains` (nwp D4).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/core/NwGroup.java
 */
import { Display } from '../../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../../core/klimt/geom/HorizontalAlignment.js';
import type { MinMax } from '../../../core/klimt/geom/MinMax.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { HColor } from '../../../core/style/Value.js';
import { NBox } from '../next/NBox.js';
import { createDisplay, nwdiagStyle, paintOf } from '../nwdiag-klimt.js';
import type { SkinParam } from '../nwdiag-skin-param.js';
import type { NServer } from './NServer.js';
import type { NStackable } from './NStackable.js';

/** The header's indent from the box's left edge. @see NwGroup.java:161 */
const HEADER_DX = 5;

/** @see NwGroup.java:60 */
export class NwGroup implements NStackable {
  /** @see NwGroup.java:62 */
  private readonly nameSet = new Set<string>();
  /** `null` for a nameless `group {` (`CommandGroup`'s optional `NAME`). @see NwGroup.java:64 */
  private readonly name: string | null;
  /** @see NwGroup.java:65 */
  private color: HColor | null = null;
  /** @see NwGroup.java:66 */
  private description: string | null = null;
  /** @see NwGroup.java:67 */
  private nbox: NBox | null = null;

  /** @see NwGroup.java:96-98 */
  constructor(name: string | null) {
    this.name = name;
  }

  /** @see NwGroup.java:69-74 */
  getNboxInternal(): NBox {
    this.nbox ??= new NBox();
    return this.nbox;
  }

  /** Built once, from the servers whose name the group holds. @see NwGroup.java:76-85 */
  getNbox(servers: ReadonlyMap<string, NServer>): NBox {
    if (this.nbox === null) {
      const nbox = new NBox();
      for (const [key, value] of servers) if (this.nameSet.has(key)) nbox.add(value.getBar());
      this.nbox = nbox;
    }
    return this.nbox;
  }

  /** @see NwGroup.java:87-89 */
  addName(name: string): void {
    this.nameSet.add(name);
  }

  /**
   * Java prints the `HashSet` in hash order and `NBox`'s identity
   * `Object#toString`; debug output only.
   * @see NwGroup.java:91-94
   */
  toString(): string {
    return `NwGroup:${String(this.name)} [${[...this.nameSet].join(', ')}] ${this.nbox === null ? 'null' : 'NBox'}`;
  }

  /** @see NwGroup.java:100-102 */
  getName(): string | null {
    return this.name;
  }

  /** @see NwGroup.java:104-106 */
  getColor(): HColor | null {
    return this.color;
  }

  /** @see NwGroup.java:108-111 */
  setColor(color: HColor | null): void {
    this.color = color;
  }

  /** @see NwGroup.java:113-116 */
  setDescription(value: string | null): void {
    this.description = value;
  }

  /** @see NwGroup.java:118-120 */
  protected getDescription(): string | null {
    return this.description;
  }

  /** `Collections.unmodifiableSet(names)`. @see NwGroup.java:122-124 */
  names(): ReadonlySet<string> {
    return this.nameSet;
  }

  /** @see NwGroup.java:126-128 */
  contains(server: NServer): boolean {
    return this.nameSet.has(server.getName());
  }

  /** The header's height, 0 with no description. @see NwGroup.java:130-137 */
  getTopHeaderHeight(stringBounder: StringBounder, skinParam: SkinParam): number {
    const block = this.buildHeaderName(skinParam);
    if (block === null) return 0;
    const blockDim = block.calculateDimension(stringBounder);
    return blockDim.getHeight();
  }

  /**
   * The members' box grown up by the header, filled with `color` or the
   * style's `BackGroundColor`, the header drawn inside its top-left.
   * @see NwGroup.java:143-163
   */
  drawGroup(ug: UGraphic, size: MinMax, skinParam: SkinParam): void {
    const style = nwdiagStyle('group', skinParam);
    const block = this.buildHeaderName(skinParam);
    if (block !== null) {
      const blockDim = block.calculateDimension(ug.getStringBounder());
      const dy = size.getMinY() - blockDim.getHeight();
      size = size.addPoint(size.getMinX(), dy);
    }
    const backgroundColor = this.getColor() ?? style.value('BackGroundColor').asColor(skinParam.getIHtmlColorSet());
    const lineColor = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());

    size.draw(ug, paintOf(lineColor), paintOf(backgroundColor));

    if (block !== null) block.drawU(ug.apply(new UTranslate(size.getMinX() + HEADER_DX, size.getMinY())));
  }

  /** @see NwGroup.java:165-173 */
  private buildHeaderName(skinParam: SkinParam): TextBlock | null {
    const description = this.getDescription();
    if (description === null) return null;
    const style = nwdiagStyle('group', skinParam);
    return createDisplay(
      Display.getWithNewlines(skinParam.getPragma(), description),
      style,
      skinParam,
      HorizontalAlignment.LEFT,
    );
  }
}
