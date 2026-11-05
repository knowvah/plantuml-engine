/**
 * PacketDiagram — one `@startpacketdiag` block: the fields in declaration
 * order, laid out by `build()` into rows of `colWidth` bits, and drawn as one
 * `TextBlock`: the bit scale across the top, then the block grid row by row.
 * `annotations` holds the chrome, as every klimt diagram's does.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketDiagram.java
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { TitledDiagram, type UmlSource } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { PacketBlock } from './PacketBlock.js';
import { PacketIndicator } from './PacketIndicator.js';
import type { SkinParam } from './packet-skin-param.js';

/** Bits per row when no `colwidth` is given. @see PacketDiagram.java:84 */
export const DEFAULT_COL_WIDTH = 16;
/** `bitWidth`'s initial value, replaced by `adjustBitWidth`. @see PacketDiagram.java:94 */
const DEFAULT_BIT_WIDTH = 24;
/** `bitHeight`'s initial value, `node_height`'s target. @see PacketDiagram.java:99 */
const DEFAULT_BIT_HEIGHT = 32;
/** `FontSize × 3` is one bit's width. @see PacketDiagram.java:464 */
const BIT_SCALE = 3.0;
/** Bits per full-length tick: a quarter row, or every bit under 4. @see PacketDiagram.java:260-262 */
const FULL_INDICATOR_DIVISOR = 4;

/** Packet grow direction. @see PacketDiagram.java:489-498 */
export const ScaleDirection = { LTR: 'LTR', RTL: 'RTL' } as const;
export type ScaleDirection = (typeof ScaleDirection)[keyof typeof ScaleDirection];

/** Java `int` division. */
function idiv(a: number, b: number): number {
  if (b === 0) throw new Error('ArithmeticException: / by zero');
  return Math.trunc(a / b);
}

/** Java `int` remainder. */
function irem(a: number, b: number): number {
  if (b === 0) throw new Error('ArithmeticException: / by zero');
  return a % b;
}

/** @see PacketDiagram.java:500-529 */
export class PacketItem {
  /** Read only by `rotate`; never passed to a block (pep D6). @see PacketDiagram.java:506 */
  textRotation = 0;
  readonly desc: string;

  /** @see PacketDiagram.java:508-514 */
  constructor(
    readonly width: number,
    readonly height: number,
    /** Only the width is laid out: no reader takes the start as a position (pep D6). */
    readonly bitStart: number,
    readonly bitEnd: number,
    desc: string | undefined,
  ) {
    this.desc = desc ?? '';
  }

  /** @see PacketDiagram.java:516-519 */
  static ofRange(start: number, end: number, height: number, desc: string | undefined): PacketItem {
    const width = end - start + 1;
    return new PacketItem(width, height, start, end, desc);
  }

  /**
   * Both `toPacketBlock`s; `textRotation` is not passed, so a block draws
   * its label upright (pep D6).
   * @see PacketDiagram.java:521-528
   */
  toPacketBlock(
    skinParam: SkinParam,
    split?: { newWidth: number; openLeft: boolean; openRight: boolean },
  ): PacketBlock {
    if (split === undefined) return new PacketBlock(this.width, this.height, this.desc, skinParam);
    return new PacketBlock(Math.min(split.newWidth, this.width), this.height, this.desc, skinParam, {
      leftOpen: split.openLeft,
      rightOpen: split.openRight,
    });
  }
}

/** @see PacketDiagram.java:80 */
export class PacketDiagram extends TitledDiagram {
  /** @see PacketDiagram.java:89 */
  private colWidth = DEFAULT_COL_WIDTH;
  /** @see PacketDiagram.java:94 */
  private bitWidth = DEFAULT_BIT_WIDTH;
  /** @see PacketDiagram.java:99 */
  private bitHeight = DEFAULT_BIT_HEIGHT;
  /** `colWidth / 2` at construction. @see PacketDiagram.java:104 */
  private scaleInterval = idiv(DEFAULT_COL_WIDTH, 2);
  /** @see PacketDiagram.java:110 */
  private useDefaultScaleInterval = true;
  /** @see PacketDiagram.java:116 */
  private sameHeight = false;
  /** @see PacketDiagram.java:121 */
  private scaleDirection: ScaleDirection = ScaleDirection.LTR;
  /** @see PacketDiagram.java:126 */
  private readonly packetItems: PacketItem[] = [];
  /** @see PacketDiagram.java:131 */
  private packetGrid: PacketBlock[][] = [];
  /** @see PacketDiagram.java:136 */
  private packetIndicators: PacketIndicator[] = [];
  /** @see PacketDiagram.java:141 */
  private style: Style | undefined = undefined;
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`), as `ChartDiagram.ts` has it. */
  scale: ScaleSpec | undefined = undefined;

  /** The skin param is built by the factory, as chart's is. @see PacketDiagram.java:143-145 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'PACKET', undefined, preprocessing);
    this.skinParam = skinParam;
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()`, else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    if (this.skinParam.getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /** @see PacketDiagram.java:220-223 */
  getDescription(): string {
    return 'Packet Diagram';
  }

  /** `build()`, then `AbstractDiagram#checkFinalError`'s null. @see PacketDiagram.java:225-229 */
  checkFinalError(): string | undefined {
    this.build();
    return undefined;
  }

  /** @see PacketDiagram.java:231-233 */
  isUseDefaultScaleInterval(): boolean {
    return this.useDefaultScaleInterval;
  }

  /** @see PacketDiagram.java:240-242 */
  getColWidth(): number {
    return this.colWidth;
  }

  /** Values `<= 0` are ignored. @see PacketDiagram.java:252-255 */
  setColWidth(colWidth: number): void {
    if (colWidth > 0) this.colWidth = colWidth;
  }

  /** @see PacketDiagram.java:260-262 */
  getFullIndicatorInterval(): number {
    return this.colWidth >= FULL_INDICATOR_DIVISOR ? idiv(this.colWidth, FULL_INDICATOR_DIVISOR) : this.colWidth;
  }

  /** Clamped to `[1, colWidth]`; a value `<= 0` is ignored. @see PacketDiagram.java:273-278 */
  updateScaleInterval(value: number): void {
    if (value > 0) {
      this.scaleInterval = Math.min(value, this.colWidth);
      this.useDefaultScaleInterval = false;
    }
  }

  /** @see PacketDiagram.java:288-290 */
  updateNodeHeight(nodeHeight: number): void {
    this.bitHeight = Math.max(nodeHeight, 0);
  }

  /**
   * Both overloads: the enum one (java:292-294) and the command-facing
   * string one, where an unknown or null value is `LTR` (java:305-315).
   */
  setScaleDirection(dir: string | undefined): void {
    const upper = dir?.toUpperCase();
    this.scaleDirection = upper === ScaleDirection.RTL ? ScaleDirection.RTL : ScaleDirection.LTR;
  }

  /** @see PacketDiagram.java:325-327 */
  setSameHeight(sameHeight: boolean): void {
    this.sameHeight = sameHeight;
  }

  /** @see PacketDiagram.java:329-331 */
  addPacketItem(packetItem: PacketItem): void {
    this.packetItems.push(packetItem);
  }

  /** @see PacketDiagram.java:342-346 */
  addPacketItemRange(start: number, end: number, height: number, desc: string | undefined, textRotation: number): void {
    const packetItem = PacketItem.ofRange(start, end, height, desc);
    packetItem.textRotation = textRotation;
    this.packetItems.push(packetItem);
  }

  /** `root, element, packetdiagDiagram`, cached. @see PacketDiagram.java:356-362 */
  getStyle(): Style {
    // `getMergedStyle` answers undefined only for an undefined builder; the skin param always has one.
    this.style ??= StyleSignatureBasic.of('root', 'element', 'packetdiagDiagram').getMergedStyle(
      this.getSkinParam().getCurrentStyleBuilder(),
    )!;
    return this.style;
  }

  /** @see PacketDiagram.java:370-372 */
  getLastPacketEnd(): number | undefined {
    return this.packetItems.length === 0 ? undefined : this.packetItems[this.packetItems.length - 1]!.bitEnd;
  }

  /** Read by the tests: the grid `adjustLayout` built. */
  getPacketGrid(): readonly (readonly PacketBlock[])[] {
    return this.packetGrid;
  }

  /** Read by the tests: the pixel width of one bit after `build()`. */
  getBitWidth(): number {
    return this.bitWidth;
  }

  /** @see PacketDiagram.java:374-382 */
  private build(): void {
    if (this.isUseDefaultScaleInterval()) this.updateScaleInterval(idiv(this.getColWidth(), 2));
    this.adjustLayout();
    this.adjustColWidth();
    this.adjustIndicators();
    this.adjustBitWidth();
  }

  /** The first row's width caps `colWidth`. @see PacketDiagram.java:387-392 */
  adjustColWidth(): void {
    if (this.packetGrid.length > 0) {
      const maxWidth = this.packetGrid[0]!.reduce((sum, block) => sum + block.getWidth(), 0);
      this.colWidth = Math.min(maxWidth, this.colWidth);
    }
  }

  /** `colWidth + 1` ticks, counting down under RTL. @see PacketDiagram.java:394-405 */
  adjustIndicators(): void {
    const fullLengthInterval = this.getFullIndicatorInterval();
    // `IntStream.limit(maxSize)` throws `IllegalArgumentException(Long.toString(maxSize))` on a
    // negative size: a field of negative width makes `colWidth` negative (java:396-398).
    if (this.colWidth + 1 < 0) throw new Error(`IllegalArgumentException: ${String(this.colWidth + 1)}`);
    const indicators: PacketIndicator[] = [];
    for (let k = 0; k < this.colWidth + 1; k++) {
      const i = this.scaleDirection === ScaleDirection.RTL ? this.colWidth - k : k;
      const full = irem(i, fullLengthInterval) === 0;
      const numbered = irem(i, this.scaleInterval) === 0;
      indicators.push(new PacketIndicator(full, numbered, i, this.getStyle(), this.getSkinParam()));
    }
    this.packetIndicators = indicators;
  }

  /**
   * Rearranges the fields into one grid, splitting a field that runs past
   * its row: the head ends the row, then `width / colWidth` full rows, then
   * the remainder opens the next row.
   * @see PacketDiagram.java:411-458
   */
  adjustLayout(): void {
    const grid: PacketBlock[][] = [];
    const state: LayoutState = { currRow: [], remainRowWidth: this.colWidth };
    for (const packet of this.packetItems) {
      const op = this.fitPacketInRow(packet, state.remainRowWidth, state.currRow);
      if (op !== undefined) this.placeOverflow(op, grid, state);
      else this.placeFitted(packet, grid, state);
    }
    if (state.currRow.length > 0) grid.push(state.currRow);
    for (const blocks of grid) {
      if (this.sameHeight) {
        // `.max(Integer::compare).orElse(1)`: a row is never empty, so the 1 is unreachable.
        const maxH = Math.max(...blocks.map((block) => block.getHeight()));
        for (const blk of blocks) blk.setHeight(maxH);
      }
      if (this.scaleDirection === ScaleDirection.RTL) blocks.reverse();
    }
    this.packetGrid = grid;
  }

  /** `adjustLayout`'s `op.isPresent()` arm. @see PacketDiagram.java:418-436 */
  private placeOverflow(p: PacketItem, grid: PacketBlock[][], state: LayoutState): void {
    state.remainRowWidth = this.colWidth;
    grid.push(state.currRow);
    state.currRow = [];

    const rowCnt = idiv(p.width, state.remainRowWidth);
    const remain = irem(p.width, state.remainRowWidth);
    for (let i = 0; i < rowCnt; i++) {
      const pb = p.toPacketBlock(this.getSkinParam(), {
        newWidth: state.remainRowWidth,
        openLeft: true,
        openRight: true,
      });
      grid.push([pb]);
    }
    if (remain > 0) {
      const pb = p.toPacketBlock(this.getSkinParam(), {
        newWidth: state.remainRowWidth,
        openLeft: true,
        openRight: false,
      });
      state.currRow.push(pb);
      state.remainRowWidth -= remain;
    } else {
      grid[grid.length - 1]![0]!.openRight(false);
    }
  }

  /** `adjustLayout`'s fitted arm. @see PacketDiagram.java:437-443 */
  private placeFitted(packet: PacketItem, grid: PacketBlock[][], state: LayoutState): void {
    state.remainRowWidth -= packet.width;
    if (state.remainRowWidth === 0) {
      state.remainRowWidth = this.colWidth;
      grid.push(state.currRow);
      state.currRow = [];
    }
  }

  /** @see PacketDiagram.java:463-466 */
  adjustBitWidth(): void {
    this.bitWidth = this.getStyle().value('FontSize').asDouble() * BIT_SCALE;
  }

  /**
   * Adds the part that fits to `row` and answers the overflow as a new item,
   * or nothing when the whole field fit.
   * @see PacketDiagram.java:474-487
   */
  private fitPacketInRow(packet: PacketItem, remainRowWidth: number, row: PacketBlock[]): PacketItem | undefined {
    const overflow = packet.width - remainRowWidth;
    if (overflow > 0) {
      const margin = packet.width - remainRowWidth;
      const bitEnd = packet.bitEnd - margin;
      row.push(
        packet.toPacketBlock(this.getSkinParam(), { newWidth: remainRowWidth, openLeft: false, openRight: true }),
      );
      return new PacketItem(margin, packet.height, bitEnd, packet.bitEnd, packet.desc);
    }
    row.push(packet.toPacketBlock(this.getSkinParam()));
    return undefined;
  }

  /** Upstream's anonymous `TextBlock`. @see PacketDiagram.java:147-212 */
  getTextBlock(): TextBlock {
    return {
      calculateDimension: (stringBounder) => this.calculateDimension(stringBounder),
      drawU: (ug) => this.drawU(ug),
    };
  }

  /**
   * The ticks across, `bitWidth` each, over the grid. A row's height is its
   * LAST block's, not its tallest (`rowHeight = dim.getHeight()`, java:170).
   * @see PacketDiagram.java:151-180
   */
  private calculateDimension(stringBounder: StringBounder): XDimension2D {
    let indicatorTotalWidth = 0;
    let indicatorMaxHeight = 0;
    for (const indicator of this.packetIndicators) {
      const iDim = indicator.calculateDimension(stringBounder);
      indicatorTotalWidth = indicatorTotalWidth + this.bitWidth;
      indicatorMaxHeight = Math.max(iDim.getHeight(), indicatorMaxHeight);
    }

    let gridMaxWidth = 0;
    let gridTotalHeight = 0;
    for (const blocks of this.packetGrid) {
      let rowWidth = 0;
      let rowHeight = 0;
      for (const block of blocks) {
        const dim = block
          .getShapeTextBlock(stringBounder, this.bitWidth, this.bitHeight)
          .calculateDimension(stringBounder);
        rowWidth += dim.getWidth();
        rowHeight = dim.getHeight();
      }
      gridMaxWidth = Math.max(gridMaxWidth, rowWidth);
      gridTotalHeight += rowHeight;
    }

    const totalWidth = Math.max(indicatorTotalWidth, gridMaxWidth);
    const totalHeight = indicatorMaxHeight + gridTotalHeight;
    return new XDimension2D(totalWidth, totalHeight);
  }

  /** @see PacketDiagram.java:181-210 */
  private drawU(ug: UGraphic): void {
    let maxWidth = 0;
    let maxHeight = 0;
    for (const indicator of this.packetIndicators) {
      indicator.drawU(ug);
      ug = ug.apply(new UTranslate(this.bitWidth, 0));
      const iDim = indicator.calculateDimension(ug.getStringBounder());
      maxWidth = maxWidth + this.bitWidth;
      maxHeight = Math.max(iDim.getHeight(), maxHeight);
    }
    ug = ug.apply(new UTranslate(-maxWidth, maxHeight));

    // Draw packets
    for (const blocks of this.packetGrid) {
      let totalWidth = 0;
      let drawHeight = 0;
      for (const block of blocks) {
        const tb = block.getShapeTextBlock(ug.getStringBounder(), this.bitWidth, this.bitHeight);
        const dim = tb.calculateDimension(ug.getStringBounder());
        totalWidth += dim.getWidth();
        drawHeight = dim.getHeight();
        tb.drawU(ug);
        ug = ug.apply(new UTranslate(dim.getWidth(), 0));
      }
      ug = ug.apply(new UTranslate(-totalWidth, drawHeight));
    }
  }
}

/** `adjustLayout`'s two loop locals, shared with its split arms (pep D8). */
interface LayoutState {
  currRow: PacketBlock[];
  remainRowWidth: number;
}
