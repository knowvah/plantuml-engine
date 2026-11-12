import { FontConfiguration } from '../../core/abel/FontConfiguration.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFace } from '../../core/klimt/font/UFont.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { SkinParamFresh } from '../../core/skin/SkinParamFresh.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { HColor } from '../../core/style/Value.js';
import type { GNode } from './GNode.js';

/** The commit-name font, monospace 15 bold. @see MagicBox.java:72 */
const NAME_FONT_SIZE = 15;
/** The comment font, sans-serif 13. @see MagicBox.java:78 */
const COMMENT_FONT_SIZE = 13;
/** `mergeTB.delta(8, 2)`. @see MagicBox.java:89 */
const BIG_DIM_DELTA_WIDTH = 8;
const BIG_DIM_DELTA_HEIGHT = 2;
/** `URectangle#rounded(8)`. @see MagicBox.java:99 */
const BOX_ROUND = 8;
/** `UStroke.withThickness(1.5)`. @see MagicBox.java:100 */
const BOX_THICKNESS = 1.5;

/**
 * The skin a git diagram draws with: the diagram's own `SkinParam`, which no
 * command can write to (gip D4).
 */
export type GitSkinParam = SkinParamFresh;

/** The `{root, element, gitDiagram}` style every git drawing reads. @see MagicBox.java:66-67, SmetanaForGit.java:87-90 */
export function gitStyleOf(skinParam: GitSkinParam) {
  return StyleSignatureBasic.of('root', 'element', 'gitDiagram').getMergedStyle(skinParam.getCurrentStyleBuilder())!;
}

/**
 * MagicBox — one node's drawing: the rounded box, the `(…)` comment above it
 * on a top node, and the commit names centred inside.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/MagicBox.java:57-111
 */
export class MagicBox {
  /** @see MagicBox.java:59-61 */
  private readonly skinParam: GitSkinParam;
  private readonly node: GNode;
  private readonly fontColor: HColor;

  /** @see MagicBox.java:63-69 */
  constructor(skinParam: GitSkinParam, node: GNode) {
    this.skinParam = skinParam;
    this.node = node;
    this.fontColor = gitStyleOf(skinParam).value('FontColor').asColor(skinParam.getIHtmlColorSet())!;
  }

  /** Java passes a `null` underline stroke, read only for a hyperlink. */
  private textBlock(display: Display, size: number, bold: boolean, family: 'monospace' | 'sansSerif'): TextBlock {
    const base = family === 'monospace' ? UFontFactory.monospace(size) : UFontFactory.sansSerif(size);
    const font = bold ? base.withFontFace(UFontFace.bold()) : base;
    const fc = bridgeFontConfiguration(
      FontConfiguration.create(font, this.fontColor, this.fontColor, null as unknown as UStroke),
    );
    return display.create(
      { fontConfiguration: fc, spriteContainer: this.skinParam, atomOps: this.skinParam.atomOps(fc) },
      HorizontalAlignment.CENTER,
    );
  }

  /** The folded commit names, one line each, creole parsed. @see MagicBox.java:71-74 */
  private getSmallBlock(): TextBlock {
    return this.textBlock(this.node.getDisplay(), NAME_FONT_SIZE, true, 'monospace');
  }

  /** The comment, only on a top node; 0×0 otherwise. @see MagicBox.java:76-83 */
  private getCommentBlock(): TextBlock {
    const comment = this.node.getComment();
    if (comment !== null && this.node.isTop())
      return this.textBlock(Display.create(comment), COMMENT_FONT_SIZE, false, 'sansSerif');
    return TextBlockUtils.empty(0, 0);
  }

  /** The size handed to the engine. @see MagicBox.java:85-90 */
  getBigDim(stringBounder: StringBounder): XDimension2D {
    const dimComment = this.getCommentBlock().calculateDimension(stringBounder);
    const dimSmall = this.getSmallBlock().calculateDimension(stringBounder);
    const mergeTB = dimComment.mergeTB(dimSmall);
    return mergeTB.delta(BIG_DIM_DELTA_WIDTH, BIG_DIM_DELTA_HEIGHT);
  }

  /**
   * The rect below the comment's height, then the comment at the origin, then
   * the names centred in the rect, in that order.
   * @see MagicBox.java:92-109
   */
  drawBorder(ug: UGraphic, sizeInDot: XDimension2D): void {
    const comment = this.getCommentBlock();
    const small = this.getSmallBlock();
    const moveY = comment.calculateDimension(ug.getStringBounder()).getHeight();
    const rect = URectangle.build(sizeInDot.getWidth(), sizeInDot.getHeight() - moveY).rounded(BOX_ROUND);
    ug.apply(UStroke.withThickness(BOX_THICKNESS)).apply(UTranslate.dy(moveY)).draw(rect);
    comment.drawU(ug);
    const deltaWidth = rect.getWidth() - small.calculateDimension(ug.getStringBounder()).getWidth();
    const deltaHeight = rect.getHeight() - small.calculateDimension(ug.getStringBounder()).getHeight();
    small.drawU(ug.apply(new UTranslate(deltaWidth / 2, moveY + deltaHeight / 2)));
  }
}
