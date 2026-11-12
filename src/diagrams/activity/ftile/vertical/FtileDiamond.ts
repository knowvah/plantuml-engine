import type { StringBounder } from '../../../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../../../core/klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../../core/klimt/UTranslate.js';
import { applyBack, applyFore, type PaintColor } from '../../../../core/svek/image/leaf-image-support.js';
import { FtileGeometry } from '../FtileGeometry.js';
import { Hexagon } from '../Hexagon.js';
import type { FtileStyledSkin } from '../AbstractFtile.js';
import { FtileDiamondWIP } from './FtileDiamondWIP.js';

/** The four label blocks of the private constructor. @see FtileDiamond.java:80-81 */
export interface FtileDiamondLabels {
  readonly north: TextBlock;
  readonly south: TextBlock;
  readonly east: TextBlock;
  readonly west: TextBlock;
}

/**
 * FtileDiamond — the 24-px activity decision diamond, with optional
 * north/south/east/west labels.
 *
 * Java's public four-argument and private eight-argument constructors are
 * one TS constructor whose fifth argument, the labels, defaults to four
 * `TextBlockUtils.empty(0, 0)` (java:53-56), keeping the 5-parameter cap.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileDiamond.java:51-134
 */
export class FtileDiamond extends FtileDiamondWIP implements TextBlock {
  /** @see FtileDiamond.java:53-56,80-83 */
  constructor(
    skinParam: FtileStyledSkin,
    backColor: PaintColor,
    borderColor: PaintColor,
    swimlane: undefined,
    labels: FtileDiamondLabels = {
      north: TextBlockUtils.empty(0, 0),
      south: TextBlockUtils.empty(0, 0),
      east: TextBlockUtils.empty(0, 0),
      west: TextBlockUtils.empty(0, 0),
    },
  ) {
    super({ label: undefined, skinParam, backColor, borderColor, swimlane, ...labels });
  }

  private labels(): FtileDiamondLabels {
    return { north: this.north, south: this.south, east: this.east, west: this.west };
  }

  private with(labels: FtileDiamondLabels): FtileDiamond {
    return new FtileDiamond(this.styledSkin, this.backColor, this.borderColor, this.swimlane, labels);
  }

  /** @see FtileDiamond.java:58-60 */
  withNorth(north: TextBlock): FtileDiamond {
    return this.with({ ...this.labels(), north });
  }

  /** @see FtileDiamond.java:62-67 */
  withWest(west1: TextBlock | undefined): FtileDiamond {
    if (west1 === undefined) return this;
    return this.with({ ...this.labels(), west: west1 });
  }

  /** @see FtileDiamond.java:69-74 */
  withEast(east1: TextBlock | undefined): FtileDiamond {
    if (east1 === undefined) return this;
    return this.with({ ...this.labels(), east: east1 });
  }

  /** @see FtileDiamond.java:76-78 */
  withSouth(south: TextBlock): FtileDiamond {
    return this.with({ ...this.labels(), south });
  }

  /** @see FtileDiamond.java:85-105 */
  drawU(ugIn: UGraphic): void {
    const half = Hexagon.hexagonHalfSize;
    const suppY1 = this.north.calculateDimension(ugIn.getStringBounder()).getHeight();
    const ug = ugIn.apply(UTranslate.dy(suppY1));
    applyBack(applyFore(ug, this.borderColor).apply(this.getStyle().getStroke()), this.backColor).draw(
      Hexagon.asPolygon(this.shadowing),
    );
    this.north.drawU(ug.apply(new UTranslate(half * 1.5, -suppY1)));
    this.south.drawU(ug.apply(new UTranslate(half * 1.5, 2 * half)));

    const dimWeat1 = this.west.calculateDimension(ug.getStringBounder());
    this.west.drawU(ug.apply(new UTranslate(-dimWeat1.getWidth(), -dimWeat1.getHeight() + half)));
    const dimEast1 = this.east.calculateDimension(ug.getStringBounder());
    this.east.drawU(ug.apply(new UTranslate(half * 2, -dimEast1.getHeight() + half)));
  }

  /** @see FtileDiamond.java:108-112 */
  protected calculateDimensionFtile(stringBounder: StringBounder): FtileGeometry {
    const suppY1 = this.north.calculateDimension(stringBounder).getHeight();
    const dim = new XDimension2D(Hexagon.hexagonHalfSize * 2, Hexagon.hexagonHalfSize * 2 + suppY1);
    return new FtileGeometry(dim.getWidth(), dim.getHeight(), dim.getWidth() / 2, suppY1, dim.getHeight());
  }

  /** @see FtileDiamond.java:114-116 */
  withWestAndEast(tb1: TextBlock | undefined, tb2: TextBlock | undefined): FtileDiamond {
    return this.withWest(tb1).withEast(tb2);
  }

  /** @see FtileDiamond.java:118-122 */
  getWestEastLabelHeight(stringBounder: StringBounder): number {
    const dimEast = this.east.calculateDimension(stringBounder);
    const dimWest = this.west.calculateDimension(stringBounder);
    return Math.max(dimEast.getHeight(), dimWest.getHeight());
  }

  /** @see FtileDiamond.java:124-127 */
  getEastLabelWidth(stringBounder: StringBounder): number {
    return this.east.calculateDimension(stringBounder).getWidth();
  }

  /** @see FtileDiamond.java:129-132 */
  getSouthLabelHeight(stringBounder: StringBounder): number {
    return this.south.calculateDimension(stringBounder).getHeight();
  }
}
