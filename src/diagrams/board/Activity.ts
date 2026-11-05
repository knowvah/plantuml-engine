/**
 * Activity — one column group of a board: its root card (stage 0) and the
 * releases under it, placed on a grid of `PostIt` cells.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/Activity.java
 */
import { Display } from '../../core/klimt/creole/Display.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { BArray } from './BArray.js';
import { BNode } from './BNode.js';
import type { BoardDiagram } from './BoardDiagram.js';
import type { SkinParam } from './board-skin-param.js';
import { CardBox } from './CardBox.js';
import { PostIt } from './PostIt.js';

/** @see Activity.java:46 */
export class Activity {
  /** @see Activity.java:48 */
  private readonly node: BNode;
  /** @see Activity.java:49 */
  private readonly skinParam: SkinParam;
  /** @see Activity.java:50 */
  private cursor: BNode;
  /** Stored and never read upstream (bep D6). @see Activity.java:52 */
  protected readonly boardDiagram: BoardDiagram;
  /** Built on first read, so a release added after it is not placed. @see Activity.java:80 */
  private array: BArray | undefined = undefined;

  /** @see Activity.java:54-59 */
  constructor(boardDiagram: BoardDiagram, name: string, skinParam: SkinParam) {
    this.boardDiagram = boardDiagram;
    this.node = new BNode(0, name);
    this.skinParam = skinParam;
    this.cursor = this.node;
  }

  /** @see Activity.java:61-63 */
  getBox(): TextBlock {
    return new CardBox(Display.create(this.node.getName()), this.skinParam);
  }

  /**
   * Climbs from the cursor to the first card with a smaller stage and adds
   * the release under it; stages may skip. The climb always ends: every
   * stage is `> 0` and the root is stage 0.
   * @see Activity.java:65-78
   */
  addRelease(stage: number, label: string): void {
    if (stage <= 0) {
      throw new Error('IllegalArgumentException');
    }
    const newNode = new BNode(stage, label);
    for (;;) {
      if (stage > this.cursor.getStage()) {
        this.cursor.addChild(newNode);
        this.cursor = newNode;
        return;
      }
      this.cursor = this.cursor.getParent()!;
    }
  }

  /** @see Activity.java:82-89 */
  private getArray(): BArray {
    if (this.array === undefined) {
      this.node.computeX({ value: 0 });
      this.array = new BArray();
      this.node.initBarray(this.array);
    }
    return this.array;
  }

  /** @see Activity.java:91-94 */
  getFullWidth(): number {
    const array = this.getArray();
    return (array.getMaxX() + 1) * PostIt.getWidth();
  }

  /** @see Activity.java:96-99 */
  getMaxStage(): number {
    const array = this.getArray();
    return array.getMaxY();
  }

  /** The cards in draw order (`BArray`'s `HashMap` order), for the tests. */
  getCells(): readonly BNode[] {
    return [...this.getArray()];
  }

  /**
   * The root card, then EVERY cell in `HashMap` order, the root included:
   * the root card is drawn twice (bep D6).
   * @see Activity.java:101-128
   */
  drawMe(ug: UGraphic): void {
    this.getBox().drawU(ug);

    const array = this.getArray();

    for (const node of array) {
      const dx = node.getX() * PostIt.getWidth();
      const dy = node.getStage() * PostIt.getHeight();
      // `ug.apply(new UTranslate(dx, dy));` — its result is discarded upstream (java:110).

      const box = new CardBox(Display.create(node.getName()), this.skinParam);
      box.drawU(ug.apply(new UTranslate(dx, dy)));
    }
  }
}
