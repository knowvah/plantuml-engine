/**
 * PostIt — the grid pitch of a board: every card cell is 170 wide and 90
 * high. The constructor, `getCard` and both fields are unused upstream and
 * ported with their names kept (bep D6).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/PostIt.java
 */
import { Display } from '../../core/klimt/creole/Display.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { BNode } from './BNode.js';
import type { SkinParam } from './board-skin-param.js';
import { CardBox } from './CardBox.js';

/** @see PostIt.java:53 */
const POST_IT_HEIGHT = 90;
/** @see PostIt.java:57 */
const POST_IT_WIDTH = 170;

/** @see PostIt.java:42 */
export class PostIt {
  /** @see PostIt.java:44 */
  private readonly node: BNode;
  /** @see PostIt.java:45 */
  private readonly skinParam: SkinParam;

  /** @see PostIt.java:47-50 */
  constructor(skinParam: SkinParam, node: BNode) {
    this.node = node;
    this.skinParam = skinParam;
  }

  /** @see PostIt.java:52-54 */
  static getHeight(): number {
    return POST_IT_HEIGHT;
  }

  /** @see PostIt.java:56-58 */
  static getWidth(): number {
    return POST_IT_WIDTH;
  }

  /** @see PostIt.java:60-63 */
  getCard(): TextBlock {
    return new CardBox(Display.create(this.node.getName()), this.skinParam);
  }
}
