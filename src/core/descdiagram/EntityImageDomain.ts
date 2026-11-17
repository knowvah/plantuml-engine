/**
 * `EntityImageDomain` — a Problem Frames domain: the name in a box, a `BoxedCharacter` letter in the bottom right
 * corner below the title (`X` lexical or given, `C` causal, `B` biddable or uncertain, `P` otherwise,
 * `GeneralImageBuilder.java:243-254`). The stereotype is sized into the title but never drawn.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/EntityImageDomain.java:63-173
 */
import { Back } from '../klimt/Back.js';
import type { HColorOrPaint } from '../klimt/color/ColorMapper.js';
import { Fore } from '../klimt/Fore.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { UFontFactory } from '../klimt/font/UFontFactory.js';
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
import { BoxedCharacter } from './BoxedCharacter.js';
import { nameAndStereotypeDimension, type DescdiagramBoxParams } from './descdiagram-common.js';

/** `withMargin(..., 2, 2)` on the name. @see EntityImageDomain.java:76-77 */
const DOMAIN_NAME_MARGIN = 2;
/** `new BoxedCharacter(typeLetter, 8, UFontFactory.byDefault(8), ...)`: the radius, and the font size argument. */
const TAG_RADIUS = 8;
const TAG_FONT_SIZE = 8;

/** What `EntityImageDomain` reads beyond the shared box params. */
export interface EntityImageDomainParams extends DescdiagramBoxParams {
  /** `typeLetter`, picked by `GeneralImageBuilder` from the stereotype. */
  readonly letter: string;
  /** `stereotype.getHtmlColor()`: the tag's fill, `undefined` for a stereotype with no colour (drawn `none`). */
  readonly tagBackColor: HColorOrPaint | undefined;
}

/** @see EntityImageDomain.java:63 */
export class EntityImageDomain {
  private readonly name: TextBlock;
  private readonly stereo: TextBlock | undefined;
  private readonly tag: TextBlock;

  /** @see EntityImageDomain.java:71-88 */
  constructor(private readonly p: EntityImageDomainParams) {
    const n = DOMAIN_NAME_MARGIN;
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
    this.tag = new BoxedCharacter(
      p.letter,
      TAG_RADIUS,
      UFontFactory.byDefault(TAG_FONT_SIZE),
      p.tagBackColor,
      undefined,
      p.nameFont.color ?? '#000000',
    );
  }

  /** @see EntityImageDomain.java:99-101 */
  private getTitleDimension(stringBounder: StringBounder): XDimension2D {
    return nameAndStereotypeDimension(this.name, this.stereo, stringBounder);
  }

  /** @see EntityImageDomain.java:112-114 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return 0;
  }

  /** @see EntityImageDomain.java:116-118 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.calculateDimension(stringBounder).getWidth();
  }

  /** @see EntityImageDomain.java:120-151 */
  drawU(ug0: UGraphic): void {
    const stringBounder = ug0.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dimTitle = this.getTitleDimension(stringBounder);
    const dimTag = this.tag.calculateDimension(stringBounder);
    const rect = URectangle.build(dimTotal.getWidth(), dimTotal.getHeight());
    const ug = ug0.apply(new Fore(this.p.borderColor)).apply(new Back(this.p.backColor));
    ug.apply(this.p.stroke).draw(rect);

    const header = new ULayoutGroup(new PlacementStrategyY1Y2(stringBounder));
    header.add(this.name);
    header.drawU(ug, dimTotal.getWidth(), dimTitle.getHeight());
    const footer = new ULayoutGroup(new PlacementStrategyY1Y2(stringBounder));
    footer.add(this.tag);
    footer.drawU(
      ug.apply(new UTranslate(dimTotal.getWidth() - dimTag.getWidth(), dimTitle.getHeight())),
      dimTag.getWidth(),
      dimTag.getHeight(),
    );
  }

  /** @see EntityImageDomain.java:159-161 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  /** @see EntityImageDomain.java:163-170 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dimTitle = this.getTitleDimension(stringBounder);
    const dimTag = this.tag.calculateDimension(stringBounder);
    return new XDimension2D(dimTitle.getWidth(), dimTitle.getHeight() + dimTag.getHeight());
  }
}
