import type { TextBlock } from '../../../../core/klimt/shape/TextBlock.js';
import type { Style } from '../../../../core/style/Style.js';
import { StyleSignatureBasic } from '../../../../core/style/StyleSignatureBasic.js';
import { mergedStyleOf, type PaintColor } from '../../../../core/svek/image/leaf-image-support.js';
import { AbstractFtile, type FtileStyledSkin } from '../AbstractFtile.js';

/**
 * The nine-argument constructor's arguments as one object (D11, the
 * `ETileBoxArgs` precedent). `swimlane` is always `undefined` here.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileDiamondWIP.java:88-89
 */
export interface FtileDiamondWIPArgs {
  readonly label: TextBlock | undefined;
  readonly skinParam: FtileStyledSkin;
  readonly backColor: PaintColor;
  readonly borderColor: PaintColor;
  readonly swimlane: undefined;
  readonly north: TextBlock;
  readonly south: TextBlock;
  readonly east: TextBlock;
  readonly west: TextBlock;
}

/**
 * FtileDiamondWIP — the shared base of the activity diamonds: colours,
 * shadowing from the `{activity, diamond}` style, and four label blocks.
 *
 * As in `FtileCircleStart`, the swimlane members (java:105-118) are not
 * ported: `AbstractFtile.ts` declares none.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileDiamondWIP.java:53-120
 */
export abstract class FtileDiamondWIP extends AbstractFtile {
  /** @see FtileDiamondWIP.java:55 */
  protected readonly backColor: PaintColor;
  /** @see FtileDiamondWIP.java:56 */
  protected readonly borderColor: PaintColor;
  /** @see FtileDiamondWIP.java:57 */
  protected readonly swimlane: undefined;
  /** @see FtileDiamondWIP.java:59 */
  protected readonly label: TextBlock | undefined;
  /** @see FtileDiamondWIP.java:61 */
  protected readonly north: TextBlock;
  /** @see FtileDiamondWIP.java:62 */
  protected readonly south: TextBlock;
  /** @see FtileDiamondWIP.java:63 */
  protected west: TextBlock;
  /** @see FtileDiamondWIP.java:64 */
  protected east: TextBlock;
  /** @see FtileDiamondWIP.java:66 */
  protected readonly shadowing: number;
  /** `skinParam()` with its real style builder (see {@link FtileStyledSkin}). */
  protected readonly styledSkin: FtileStyledSkin;

  /** @see FtileDiamondWIP.java:88-103 */
  protected constructor(args: FtileDiamondWIPArgs) {
    super(args.skinParam);
    this.styledSkin = args.skinParam;
    const style = mergedStyleOf(this.getStyleSignature(), args.skinParam.getCurrentStyleBuilder());
    this.borderColor = args.borderColor;
    this.backColor = args.backColor;
    this.shadowing = style.getShadowing();
    this.swimlane = args.swimlane;
    this.label = args.label;
    this.north = args.north;
    this.west = args.west;
    this.east = args.east;
    this.south = args.south;
  }

  /** @see FtileDiamondWIP.java:68-72 */
  swapEastWest(): void {
    const tmp = this.west;
    this.west = this.east;
    this.east = tmp;
  }

  /** @see FtileDiamondWIP.java:75-77 */
  getStyleSignature(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity', 'diamond');
  }

  /** @see FtileDiamondWIP.java:79-81 */
  getStyle(): Style {
    return mergedStyleOf(this.getStyleSignature(), this.styledSkin.getCurrentStyleBuilder());
  }

  /** @see FtileDiamondWIP.java:84-86 */
  getMyChildren(): readonly never[] {
    return [];
  }
}
