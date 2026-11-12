import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { SkinParamFresh } from '../../core/skin/SkinParamFresh.js';

/**
 * The skin a BPM placeable draws with: always the fresh `SkinParam`
 * `BpmDiagram#getTextBlock` builds (BpmDiagram.java:184-185).
 */
export type BpmSkinParam = SkinParamFresh;

/**
 * Placeable — what a BPM grid cell holds: an element or a connector puzzle.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Placeable.java:43-51
 */
export interface Placeable {
  /** @see Placeable.java:45 */
  getDimension(stringBounder: StringBounder, skinParam: BpmSkinParam): XDimension2D;
  /** @see Placeable.java:47 */
  toTextBlock(skinParam: BpmSkinParam): TextBlock;
  /** Java `String`, `null` for the start element. @see Placeable.java:49 */
  getId(): string | null;
  /** `Object#toString`, which every implementation overrides (debug output). */
  toString(): string;
}
