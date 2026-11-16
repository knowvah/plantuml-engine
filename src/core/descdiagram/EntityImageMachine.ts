/**
 * `EntityImageMachine` — a Problem Frames machine (`<<Machine>>`, `<<M>>`, `<<S>>`, `<<Spec>>`, `<<Specification>>`,
 * `Stereotype.java:229-233`): the name in a box with a second, 4px-wide box 4px in from its left edge; the title is
 * drawn 5px right. The stereotype is sized into the title but never drawn.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/EntityImageMachine.java:64-160
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

/** `withMargin(..., 2, 2)` on the name. @see EntityImageMachine.java:69-72 */
const MACHINE_NAME_MARGIN = 2;
/** `URectangle.build(4, heightTotal)`, drawn at `UTranslate.dx(4)`. @see EntityImageMachine.java:124,137 */
const MACHINE_STRIPE = 4;
/** `header.drawU(ug.apply(UTranslate.dx(5)), ...)`. @see EntityImageMachine.java:141 */
const MACHINE_TITLE_DX = 5;
/** `new XDimension2D(width + 10, height)`. @see EntityImageMachine.java:157 */
const MACHINE_EXTRA_WIDTH = 10;

/** @see EntityImageMachine.java:64 */
export class EntityImageMachine {
  private readonly name: TextBlock;
  private readonly stereo: TextBlock | undefined;

  /** @see EntityImageMachine.java:69-84 */
  constructor(private readonly p: DescdiagramBoxParams) {
    const n = MACHINE_NAME_MARGIN;
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

  /** @see EntityImageMachine.java:95-97 */
  private getTitleDimension(stringBounder: StringBounder): XDimension2D {
    return nameAndStereotypeDimension(this.name, this.stereo, stringBounder);
  }

  /** @see EntityImageMachine.java:108-110 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return 0;
  }

  /** @see EntityImageMachine.java:112-114 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.calculateDimension(stringBounder).getWidth();
  }

  /** @see EntityImageMachine.java:116-146 */
  drawU(ug0: UGraphic): void {
    const stringBounder = ug0.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dimTitle = this.getTitleDimension(stringBounder);
    const rect = URectangle.build(dimTotal.getWidth(), dimTotal.getHeight());
    const rect2 = URectangle.build(MACHINE_STRIPE, dimTotal.getHeight());
    const ug = ug0.apply(new Fore(this.p.borderColor)).apply(new Back(this.p.backColor));
    ug.apply(this.p.stroke).draw(rect);
    ug.apply(UTranslate.dx(MACHINE_STRIPE)).apply(this.p.stroke).draw(rect2);
    const header = new ULayoutGroup(new PlacementStrategyY1Y2(stringBounder));
    header.add(this.name);
    header.drawU(ug.apply(UTranslate.dx(MACHINE_TITLE_DX)), dimTotal.getWidth(), dimTitle.getHeight());
  }

  /** @see EntityImageMachine.java:148-150 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  /** @see EntityImageMachine.java:152-158 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dimTitle = this.getTitleDimension(stringBounder);
    return new XDimension2D(dimTitle.getWidth() + MACHINE_EXTRA_WIDTH, dimTitle.getHeight());
  }
}
