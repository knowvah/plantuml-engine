import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../../core/klimt/geom/XDimension2D.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';

/**
 * Element — one salt widget: measured at a position, drawn at a z-index
 * (`PSystemSalt#getTextBlock` draws the root twice, z 0 then z 1) into the
 * dimension its container settled on.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/salt/element/Element.java:42-48
 */
export interface Element {
  /** @see Element.java:44 */
  getPreferredDimension(stringBounder: StringBounder, x: number, y: number): XDimension2D;

  /** `dimToUse` is nullable as upstream's reference is: tree cells are drawn
   *  with `null` (ElementTreeEntry.java:90, 96). @see Element.java:46 */
  drawU(ug: UGraphic, zIndex: number, dimToUse: XDimension2D | null): void;

  /**
   * Upstream's `default` method returning `false`; an interface member here
   * cannot carry a body, so callers read it through
   * {@link mayDrawBeyondPreferredDimension}. Overridden by the open droplist
   * and the composites that delegate to their children.
   * @see Element.java:48-71 (upstream a720bdd; f63ffe0701a, #2882)
   */
  mayDrawBeyondPreferredDimension?(): boolean;
}

/** `elt.mayDrawBeyondPreferredDimension()`, with upstream's `default` (`false`).
 *  @see Element.java:69-71 (upstream a720bdd) */
export function mayDrawBeyondPreferredDimension(elt: Element): boolean {
  return elt.mayDrawBeyondPreferredDimension?.() ?? false;
}
