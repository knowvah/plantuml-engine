/**
 * `InnerActivity` — the image of an autarkic activity group: the nested svek result inside a rounded rectangle
 * filled with the group's back colour and framed in its border colour (`THICKNESS_BORDER` 1.5). It is what
 * `GroupMakerActivity#getImage` returns and `Entity#overrideImage` stores on the group, which has become an
 * `ACTIVITY` leaf of the parent pass.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/InnerActivity.java:46-100
 */
import type { IEntityImage } from '../abel/IEntityImage.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import type { XDimension2D } from '../klimt/geom/XDimension2D.js';
import { URectangle } from '../klimt/shape/URectangle.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { UStroke } from '../klimt/UStroke.js';
import { CORNER } from './image/EntityImageActivity.js';
import { applyBack, applyFore, type PaintColor } from './image/leaf-image-support.js';
import { ShapeType } from './ShapeType.js';

/** `InnerActivity.THICKNESS_BORDER`. @see InnerActivity.java:60 */
export const THICKNESS_BORDER = 1.5;

/** The inner image: a block that can also say whether it is hidden. */
export interface InnerImage extends TextBlock {
  isHidden(): boolean;
}

/** @see InnerActivity.java:46 */
export class InnerActivity implements IEntityImage, TextBlock {
  readonly __iEntityImageBrand?: never;
  private readonly im: InnerImage;
  private readonly borderColor: PaintColor;
  private readonly shadowing: number;
  private readonly backColor: PaintColor;

  /** @see InnerActivity.java:53-58 */
  constructor(im: InnerImage, borderColor: PaintColor, backColor: PaintColor, shadowing: number) {
    this.im = im;
    this.backColor = backColor;
    this.borderColor = borderColor;
    this.shadowing = shadowing;
  }

  /** @see InnerActivity.java:62-72 */
  drawU(ug: UGraphic): void {
    const total = this.calculateDimension(ug.getStringBounder());

    const framed = applyFore(applyBack(ug, this.backColor), this.borderColor).apply(
      UStroke.withThickness(THICKNESS_BORDER),
    );
    const rect = URectangle.build(total.getWidth(), total.getHeight()).rounded(CORNER);
    rect.setDeltaShadow(this.shadowing);
    framed.draw(rect);
    this.im.drawU(framed.apply(UStroke.simple()));
  }

  /** @see InnerActivity.java:79-82 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return this.im.calculateDimension(stringBounder);
  }

  /** @see InnerActivity.java:84-86 */
  getShapeType(): ShapeType {
    return ShapeType.ROUND_RECTANGLE;
  }

  /** @see InnerActivity.java:92-94 */
  isHidden(): boolean {
    return this.im.isHidden();
  }
}
