import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { WHERE_VALUES, type ConnectorPuzzle, type Where } from './ConnectorPuzzle.js';
import type { BpmSkinParam } from './Placeable.js';

/**
 * AbstractConnectorPuzzle — the `EnumSet<Where>` of stubs a puzzle or an
 * element carries. The set keeps declaration order (D9): `connections()`
 * walks `Where.values()`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/AbstractConnectorPuzzle.java:43-74
 */
export abstract class AbstractConnectorPuzzle implements ConnectorPuzzle {
  /** `EnumSet.noneOf(Where.class)`. @see AbstractConnectorPuzzle.java:45 */
  private readonly connectionSet = new Set<Where>();

  abstract getDimension(stringBounder: StringBounder, skinParam: BpmSkinParam): XDimension2D;
  abstract toTextBlock(skinParam: BpmSkinParam): TextBlock;
  abstract getId(): string | null;

  /** @see AbstractConnectorPuzzle.java:47-49 */
  have(where: Where): boolean {
    return this.connectionSet.has(where);
  }

  /** @see AbstractConnectorPuzzle.java:51-53 */
  append(where: Where): void {
    this.connectionSet.add(where);
  }

  /** `IllegalArgumentException` when absent. @see AbstractConnectorPuzzle.java:55-60 */
  remove(where: Where): void {
    const ok = this.connectionSet.delete(where);
    if (!ok) throw new Error(`IllegalArgumentException: no ${where} connection to remove`);
  }

  /** `append(ConnectorPuzzle other)`: `addAll` of the other's set. @see AbstractConnectorPuzzle.java:62-64 */
  appendAll(other: AbstractConnectorPuzzle): void {
    for (const where of other.connections()) this.connectionSet.add(where);
  }

  /** The set in `EnumSet` order. @see AbstractConnectorPuzzle.java:66-68 */
  protected connections(): readonly Where[] {
    return WHERE_VALUES.filter((w) => this.connectionSet.has(w));
  }

  /** @see AbstractConnectorPuzzle.java:70-72 */
  protected getPragma(): Pragma {
    return Pragma.createEmpty();
  }
}
