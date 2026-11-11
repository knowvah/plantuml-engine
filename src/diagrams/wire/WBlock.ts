/**
 * `WBlock`: a named rectangle holding child blocks and printed lines, laid out at a cursor.
 *
 * Every field the Java reassigns is mutable here too (`cursor`, `addedToCursor`, the two `futureOut*`, `parent`): the
 * parse mutates the tree one line at a time, in place. Upstream's quirks stay (wrp D4): the root draws its empty name,
 * a duplicate is checked at every level a call passes through, and `getLastChild()` is undefined at a level with no
 * child, so each recursing method throws where the Java raises its `NullPointerException` (wrp D5).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WBlock.java:60-318
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { SpriteContainerEmpty } from '../../core/klimt/sprite/SpriteContainerEmpty.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { HColor } from '../../core/style/Value.js';
import { back, createFontConfiguration, fore, getBlack, type WireSkinParam } from './wire-klimt.js';
import type { WLinkType } from './WLinkType.js';
import { WPrint } from './WPrint.js';

/** @see WBlock.java:63 */
const STARTING_Y = 10;
/** The cursor's starting x, and the column gap. @see WBlock.java:74, :164 */
const COLUMN_MARGIN = 10;
/** The gap `addBlock` adds before and after a block. @see WBlock.java:207, :209 */
const BLOCK_GAP = 10;
/** A leaf's size on an axis forced to 0. @see WBlock.java:276-277 */
const DEFAULT_LEAF_SIZE = 100;
/** The margin past a child in `getNaturalDimension`. @see WBlock.java:286-287 */
const NATURAL_MARGIN = 10;
/** The label's `UTranslate.dx(5)` and its `sansSerif(12)`. @see WBlock.java:239, :243 */
const LABEL_DX = 5;
const LABEL_FONT_SIZE = 12;
/** A link's default start, as `getAbsolutePosition` arguments. @see WBlock.java:297, :310 */
const FULL = '100%';
const FIVE = '5';

export class WBlock {
  private readonly name: string;
  private readonly forcedWidth: number;
  private readonly forcedHeight: number;
  private readonly color: HColor | undefined;

  private readonly children: WBlock[] = [];
  private readonly position: UTranslate;
  private parent: WBlock | undefined = undefined;

  private cursor = new UTranslate(COLUMN_MARGIN, STARTING_Y);
  private addedToCursor: WBlock | undefined = undefined;

  private futureOutHorizontal: UTranslate | undefined = undefined;
  private futureOutVertical: UTranslate | undefined = undefined;

  private readonly prints: WPrint[] = [];

  /** @see WBlock.java:129-135 */
  constructor(name: string, position: UTranslate, width: number, height: number, color: HColor | undefined) {
    this.name = name;
    this.forcedWidth = width;
    this.forcedHeight = height;
    this.color = color;
    this.position = position;
  }

  /** On the root, `position`, ignoring both arguments (`parent == null`). @see WBlock.java:82-92 */
  getAbsolutePosition(supx: string, supy: string): UTranslate {
    if (this.parent === undefined) return this.position;

    const p = this.parent.getAbsolutePosition('0', '0');
    const x = this.position.getDx() + p.getDx() + this.parseWidth(supx);
    const y = this.position.getDy() + p.getDy() + this.parseHeight(supy);
    return new UTranslate(x, y);
  }

  /** @see WBlock.java:94-107 */
  private parseWidth(value: string): number {
    return parseCoordinate(value, this.getMaxDimension().getWidth());
  }

  /** @see WBlock.java:109-122 */
  private parseHeight(value: string): number {
    return parseCoordinate(value, this.getMaxDimension().getHeight());
  }

  /** @see WBlock.java:124-127 */
  toString(): string {
    return this.name + ' ' + this.position.toString();
  }

  /** @see WBlock.java:137-143 */
  private getChildByName(name: string): WBlock | undefined {
    for (const child of this.children) if (name === child.getName()) return child;
    return undefined;
  }

  /** @see WBlock.java:145-155 */
  getBlock(name: string): WBlock | undefined {
    const x = name.indexOf('.');
    if (x === -1) return this.getChildByName(name);

    const first = this.getChildByName(name.substring(0, x));
    if (first === undefined) return undefined;

    return first.getBlock(name.substring(x + 1));
  }

  /** @see WBlock.java:157-159 */
  private getName(): string {
    return this.name;
  }

  /** @see WBlock.java:161-169 */
  newColumn(level: number): CommandExecutionResult {
    if (level === 0) {
      const max = this.getNaturalDimension();
      this.cursor = new UTranslate(max.getWidth() + COLUMN_MARGIN, STARTING_Y);
      this.addedToCursor = undefined;
      return CommandExecutionResult.ok();
    }
    // `getLastChild().newColumn(...)`: a `NullPointerException` when there is no child (wrp D5).
    return this.getLastChild()!.newColumn(level - 1);
  }

  /** @see WBlock.java:171-178 */
  wgoto(level: number, x: number, y: number): CommandExecutionResult {
    if (level === 0) {
      this.cursor = new UTranslate(x, y);
      this.addedToCursor = undefined;
      return CommandExecutionResult.ok();
    }
    // A `NullPointerException` when there is no child (wrp D5).
    return this.getLastChild()!.wgoto(level - 1, x, y);
  }

  /** `addedToCursor` stays: the height still owed is added on the next position. @see WBlock.java:180-186 */
  wmove(level: number, x: number, y: number): CommandExecutionResult {
    if (level === 0) {
      this.cursor = this.cursor.compose(new UTranslate(x, y));
      return CommandExecutionResult.ok();
    }
    // A `NullPointerException` when there is no child (wrp D5).
    return this.getLastChild()!.wmove(level - 1, x, y);
  }

  /**
   * The `stringBounder` is `WireDiagram#print`'s, always the AWT one (wrp D3).
   * @see WBlock.java:188-197
   */
  print(stringBounder: StringBounder, skinParam: WireSkinParam, level: number, text: string): CommandExecutionResult {
    if (level === 0) {
      const print = new WPrint(
        skinParam,
        this.getNextPosition(),
        undefined,
        Display.getWithNewlines(skinParam.getPragma(), text),
      );
      this.prints.push(print);
      this.cursor = this.cursor.compose(UTranslate.dy(print.getHeight(stringBounder)));
      return CommandExecutionResult.ok();
    }
    // A `NullPointerException` when there is no child (wrp D5).
    return this.getLastChild()!.print(stringBounder, skinParam, level - 1, text);
  }

  /**
   * The duplicate check runs before the level test, so at every level the call passes through (wrp D4). The
   * `name.contains(".")` throw is unreachable from `CommandComponent` (`[\w]+`), and kept.
   * @see WBlock.java:199-219
   */
  addBlock(
    level: number,
    name: string,
    width: number,
    height: number,
    color: HColor | undefined,
  ): CommandExecutionResult {
    if (name.includes('.')) throw new Error('IllegalArgumentException');
    if (this.getChildByName(name) !== undefined) return CommandExecutionResult.error('Component exists already');
    if (level === 0) {
      this.cursor = this.cursor.compose(UTranslate.dy(BLOCK_GAP));
      const newBlock = new WBlock(name, this.getNextPosition(), width, height, color);
      this.cursor = this.cursor.compose(UTranslate.dy(BLOCK_GAP));
      this.addedToCursor = newBlock;

      this.children.push(newBlock);
      newBlock.parent = this;
      return CommandExecutionResult.ok();
    }

    // `last.addBlock(...)`: a `NullPointerException` when there is no child (wrp D5).
    return this.getLastChild()!.addBlock(level - 1, name, width, height, color);
  }

  /** The height of the block last added is owed until the next position is asked for. @see WBlock.java:221-228 */
  private getNextPosition(): UTranslate {
    if (this.addedToCursor !== undefined) {
      const dim = this.addedToCursor.getMaxDimension();
      this.cursor = this.cursor.compose(UTranslate.dy(dim.getHeight()));
    }
    this.addedToCursor = undefined;
    return this.cursor;
  }

  /** `null` is undefined. @see WBlock.java:230-235 */
  private getLastChild(): WBlock | undefined {
    if (this.children.length === 0) return undefined;
    return this.children[this.children.length - 1];
  }

  /** The root draws its empty name too: `<text> </text>` in every drawn row (wrp D4). @see WBlock.java:237-245 */
  drawMe(ug: UGraphic): void {
    this.drawBox(ug);
    const font = UFontFactory.sansSerif(LABEL_FONT_SIZE);
    const fontConfiguration = createFontConfiguration(font, getBlack(), getBlack());
    const display = Display.create(this.name.replaceAll('_', ' '));
    const spriteContainer = new SpriteContainerEmpty();
    const text = display.create(
      { fontConfiguration, spriteContainer, atomOps: spriteContainer.atomOps(fontConfiguration) },
      HorizontalAlignment.LEFT,
    );
    text.drawU(ug.apply(UTranslate.dx(LABEL_DX)));
  }

  /** @see WBlock.java:251-267 */
  private drawBox(ugIn: UGraphic): void {
    const ug = ugIn.apply(fore(getBlack()));
    if (this.name.length > 0) {
      const max = this.getMaxDimension();
      const rect = URectangle.build(max.getWidth(), max.getHeight());
      const ugRect = this.color === undefined ? ug : ug.apply(back(this.color));
      ugRect.draw(rect);
    }
    for (const child of this.children) child.drawMe(ug.apply(child.position));
    for (const print of this.prints) print.drawMe(ug.apply(print.getPosition()));
  }

  /** A forced parent keeps its size, even smaller than a child; a leaf treats 0 as 100 per axis. @see WBlock.java:269-279 */
  getMaxDimension(): XDimension2D {
    if (this.children.length > 0) {
      if (this.forcedWidth !== 0) return new XDimension2D(this.forcedWidth, this.forcedHeight);
      return this.getNaturalDimension();
    }
    const x = this.forcedWidth === 0 ? DEFAULT_LEAF_SIZE : this.forcedWidth;
    const y = this.forcedHeight === 0 ? DEFAULT_LEAF_SIZE : this.forcedHeight;
    return new XDimension2D(x, y);
  }

  /** @see WBlock.java:281-290 */
  private getNaturalDimension(): XDimension2D {
    let x = 0;
    let y = 0;
    for (const child of this.children) {
      const dim = child.getMaxDimension();
      x = Math.max(x, child.position.getDx() + dim.getWidth() + NATURAL_MARGIN);
      y = Math.max(y, child.position.getDy() + dim.getHeight() + NATURAL_MARGIN);
    }
    return new XDimension2D(x, y);
  }

  /** An explicit `(x,y)` also moves where the next link starts (wrp D4). @see WBlock.java:292-303 */
  getNextOutHorizontal(x: string | undefined, y: string | undefined, type: WLinkType): UTranslate {
    let result: UTranslate;
    if (x !== undefined && y !== undefined) result = this.getAbsolutePosition(x, y);
    else if (this.futureOutHorizontal === undefined) result = this.getAbsolutePosition(FULL, FIVE);
    else result = this.futureOutHorizontal;
    this.futureOutHorizontal = result.compose(UTranslate.dy(type.spaceForNext()));
    return result;
  }

  /** @see WBlock.java:305-316 */
  getNextOutVertical(x: string | undefined, y: string | undefined, type: WLinkType): UTranslate {
    let result: UTranslate;
    if (x !== undefined && y !== undefined) result = this.getAbsolutePosition(x, y);
    else if (this.futureOutVertical === undefined) result = this.getAbsolutePosition(FIVE, FULL);
    else result = this.futureOutVertical;
    this.futureOutVertical = result.compose(UTranslate.dx(type.spaceForNext()));
    return result;
  }
}

/**
 * `parseWidth`/`parseHeight`'s shared body: `n%`, `n%±m` (`StringTokenizer(value, "%")`'s two tokens, wrp D9), or a
 * plain number.
 * @see WBlock.java:94-107, :109-122
 */
function parseCoordinate(value: string, size: number): number {
  if (value.endsWith('%')) return size * (Number(value.substring(0, value.length - 1)) / 100.0);
  if (value.includes('%')) {
    const [v1, v2] = value.split('%').filter((token) => token.length > 0);
    return size * (Number(v1) / 100.0) + Number(v2);
  }
  return Number(value);
}
