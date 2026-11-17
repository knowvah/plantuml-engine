/**
 * `EntityImageDesignedDomain` — a Problem Frames designed domain (`<<D>>`, `<<Designed>>`, `<<Nested>>`, `<<Solved>>`,
 * `Stereotype.java:224-227`): the name in a box with a second, 4px-wide box along its left edge; the title is drawn
 * 4px right. The stereotype is sized into the title but never drawn.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/EntityImageDesignedDomain.java:64-161
 */
import { Back } from '../klimt/Back.js';
import { Fore } from '../klimt/Fore.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import { PlacementStrategyY1Y2 } from '../klimt/geom/PlacementStrategyY1Y2.js';
import { ULayoutGroup } from '../klimt/geom/ULayoutGroup.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../klimt/shape/TextBlockUtils.js';
import { URectangle } from '../klimt/shape/URectangle.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { UTranslate } from '../klimt/UTranslate.js';
import { buildTextBlock } from '../svek/image/EntityImageDescriptionTextBlock.js';
import { ShapeType } from '../svek/ShapeType.js';
import { nameAndStereotypeDimension, type DescdiagramBoxParams } from './descdiagram-common.js';

/** `withMargin(..., 2, 2)` on the name. @see EntityImageDesignedDomain.java:69-72 */
const DESIGNED_NAME_MARGIN = 2;
/** `URectangle.build(4, heightTotal)`, drawn at the box corner. @see EntityImageDesignedDomain.java:124,138 */
const DESIGNED_STRIPE = 4;
/** `header.drawU(ug.apply(UTranslate.dx(4)), ...)`. @see EntityImageDesignedDomain.java:142 */
const DESIGNED_TITLE_DX = 4;
/** `new XDimension2D(width + 5, height)`. @see EntityImageDesignedDomain.java:158 */
const DESIGNED_EXTRA_WIDTH = 5;

/** @see EntityImageDesignedDomain.java:64 */
export class EntityImageDesignedDomain {
  private readonly name: TextBlock;
  private readonly stereo: TextBlock | undefined;

  /** @see EntityImageDesignedDomain.java:69-84 */
  constructor(private readonly p: DescdiagramBoxParams) {
    const n = DESIGNED_NAME_MARGIN;
    this.name = TextBlockUtils.withMargin(
      buildTextBlock(p.display, p.nameFont, HorizontalAlignment.CENTER),
      n,
      n,
      n,
      n,
    );
    this.stereo =
      p.stereoLabels === undefined
        ? undefined
        : buildTextBlock(p.stereoLabels.join('\n'), p.stereoFont, HorizontalAlignment.CENTER);
  }

  /** @see EntityImageDesignedDomain.java:95-97 */
  private getTitleDimension(stringBounder: StringBounder): XDimension2D {
    return nameAndStereotypeDimension(this.name, this.stereo, stringBounder);
  }

  /** @see EntityImageDesignedDomain.java:108-110 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return 0;
  }

  /** @see EntityImageDesignedDomain.java:112-114 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.calculateDimension(stringBounder).getWidth();
  }

  /** @see EntityImageDesignedDomain.java:116-147 */
  drawU(ug0: UGraphic): void {
    const stringBounder = ug0.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dimTitle = this.getTitleDimension(stringBounder);
    const rect = URectangle.build(dimTotal.getWidth(), dimTotal.getHeight());
    const rect2 = URectangle.build(DESIGNED_STRIPE, dimTotal.getHeight());
    const ug = ug0.apply(new Fore(this.p.borderColor)).apply(new Back(this.p.backColor));
    ug.apply(this.p.stroke).draw(rect);
    ug.apply(this.p.stroke).draw(rect2);
    const header = new ULayoutGroup(new PlacementStrategyY1Y2(stringBounder));
    header.add(this.name);
    header.drawU(ug.apply(UTranslate.dx(DESIGNED_TITLE_DX)), dimTotal.getWidth(), dimTitle.getHeight());
  }

  /** @see EntityImageDesignedDomain.java:149-151 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  /** @see EntityImageDesignedDomain.java:153-159 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dimTitle = this.getTitleDimension(stringBounder);
    return new XDimension2D(dimTitle.getWidth() + DESIGNED_EXTRA_WIDTH, dimTitle.getHeight());
  }
}
