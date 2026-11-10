/**
 * GridTextBlockDecorated — the grid with its decoration drawn first: every
 * group's box, every network's tube, then every server's links.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/GridTextBlockDecorated.java
 */
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { MinMax } from '../../../core/klimt/geom/MinMax.js';
import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { Network } from '../core/Network.js';
import type { NwGroup } from '../core/NwGroup.js';
import { back, fore, nwdiagStyle } from '../nwdiag-klimt.js';
import type { SkinParam } from '../nwdiag-skin-param.js';
import { GridTextBlockSimple } from './GridTextBlockSimple.js';
import type { NServerDraw } from './NServerDraw.js';

/** A network tube's height. @see GridTextBlockDecorated.java:56 */
export const NETWORK_THIN = 5;

/** @see GridTextBlockDecorated.java:54 */
export class GridTextBlockDecorated extends GridTextBlockSimple {
  /** @see GridTextBlockDecorated.java:56 */
  static readonly NETWORK_THIN = NETWORK_THIN;

  /** @see GridTextBlockDecorated.java:58 */
  private readonly groups: readonly NwGroup[];
  /** @see GridTextBlockDecorated.java:59 */
  private readonly networks: readonly Network[];

  /** @see GridTextBlockDecorated.java:61-66 */
  constructor(
    lines: number,
    cols: number,
    groups: readonly NwGroup[],
    networks: readonly Network[],
    skinparam: SkinParam,
  ) {
    super(lines, cols, skinparam);
    this.groups = groups;
    this.networks = networks;
  }

  /** @see GridTextBlockDecorated.java:68-75 */
  protected override drawGrid(ug: UGraphic): void {
    for (const group of this.groups) this.drawGroups(ug, group, this.getSkinParam());
    this.drawNetworkTube(ug);
    this.drawLinks(ug);
  }

  /** Every server's links, in the `arrow` style's `LineColor`. @see GridTextBlockDecorated.java:77-97 */
  private drawLinks(ug: UGraphic): void {
    const style = nwdiagStyle('arrow', this.getSkinParam());
    const lineColor = style.value('LineColor').asColor(this.getSkinParam().getIHtmlColorSet());
    ug = ug.apply(fore(lineColor));

    const stringBounder = ug.getStringBounder();
    for (let i = 0; i < this.data.getNbLines(); i++) {
      const lineHeight = this.lineHeight(stringBounder, i);
      let x = 0;
      for (let j = 0; j < this.data.getNbCols(); j++) {
        const colWidth = this.colWidth(stringBounder, j);
        this.data.get(i, j)?.drawLinks(ug, x, colWidth, lineHeight);
        x += colWidth;
      }
    }
  }

  /** The union of the group's members' boxes, drawn by the group. @see GridTextBlockDecorated.java:99-122 */
  private drawGroups(ug: UGraphic, group: NwGroup, skinParam: SkinParam): void {
    const stringBounder = ug.getStringBounder();

    let size: MinMax | null = null;
    let y = 0;
    for (let i = 0; i < this.data.getNbLines(); i++) {
      const lineHeight = this.lineHeight(stringBounder, i);
      let x = 0;
      for (let j = 0; j < this.data.getNbCols(); j++) {
        const colWidth = this.colWidth(stringBounder, j);
        const element = this.data.get(i, j);
        if (element !== null && group.contains(element.getServer())) {
          const minMax = element.getMinMax(stringBounder, colWidth, lineHeight).translate(new UTranslate(x, y));
          size = size === null ? minMax : size.addMinMax(minMax);
        }
        x += colWidth;
      }
      y += lineHeight;
    }
    if (size !== null) group.drawGroup(ug, size, skinParam);
  }

  /** @see GridTextBlockDecorated.java:124-132 */
  private isThereALink(j: number, network: Network): boolean {
    for (let i = 0; i < this.data.getNbLines(); i++) {
      const element = this.data.get(i, j);
      if (element?.isLinkedTo(network) === true) return true;
    }
    return false;
  }

  /**
   * Each network's tube, at least `MINIMUM_WIDTH` wide, in the `network`
   * style (its `color` wins over `BackGroundColor`), with the style's
   * shadow. Sets each network's y, which the links then read.
   * @see GridTextBlockDecorated.java:138-168
   */
  private drawNetworkTube(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    let y = 0;
    for (let i = 0; i < this.data.getNbLines(); i++) {
      const network = this.getNetwork(i);
      this.computeMixMax(this.data.getLine(i), stringBounder, network);

      const width = Math.max(GridTextBlockSimple.MINIMUM_WIDTH, network.getXmax() - network.getXmin());
      const rect = URectangle.build(width, NETWORK_THIN);

      let ug2 = ug.apply(new UTranslate(network.getXmin(), y));
      const style = nwdiagStyle('network', this.getSkinParam());
      const deltaShadow = style.getShadowing();
      const set = this.getSkinParam().getIHtmlColorSet();
      ug2 = ug2.apply(fore(style.value('LineColor').asColor(set)));
      ug2 = ug2.apply(back(style.value('BackGroundColor').asColor(set)));

      rect.setDeltaShadow(deltaShadow);
      const color = network.getColor();
      if (color !== null) ug2 = ug2.apply(back(color));

      network.setY(y);

      if (network.isVisible()) ug2.draw(rect);

      y += this.lineHeight(stringBounder, i);
    }
  }

  /**
   * The x range of the columns linked to `network`; a full-width network
   * starts at 0 and runs to the last column.
   * @see GridTextBlockDecorated.java:170-186
   */
  private computeMixMax(line: readonly (NServerDraw | null)[], stringBounder: StringBounder, network: Network): void {
    let x = 0;
    let xmin = network.isFullWidth() ? 0 : -1;
    let xmax = 0;
    for (let j = 0; j < line.length; j++) {
      const hline = this.isThereALink(j, network);
      if (hline && xmin < 0) xmin = x;

      x += this.colWidth(stringBounder, j);
      if (hline || network.isFullWidth()) xmax = x;
    }
    network.setMinMax(xmin, xmax);
  }

  /** @see GridTextBlockDecorated.java:188-190 */
  private getNetwork(i: number): Network {
    return this.networks[i]!;
  }
}
