/**
 * The ink of a `USymbolFrame`'s title-tab underline in the canvas scan. A `UPath` draws as `[x + minX, x + maxX]` x
 * `[y + minY, y + maxY]` exactly (`LimitFinder#drawUPath`), and `UGraphicCompressOnXorY` only translates it
 * (`:107-108`, it is no `URectangle`), so a tab wider than the compressed frame rect (a sprite title whose shapes leave
 * empty space) still reaches its full width.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/LimitFinder.java:164-167
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/UGraphicCompressOnXorY.java:107-108
 */
import type { Theme } from '../../../core/theme.js';
import type { ActivityNodeGeo } from '../activity-geometry.types.js';
import { withCompositeStyle } from '../activity-composite-theme.js';
import { frameTabShape } from './compress/shapes-of-frame.js';
import type { MutableInkBounds } from './canvas-origin.js';

/** A bare `USymbolFrame` group/partition (`usymbol` absent) draws the tab. */
export function extendForFrameTab(acc: MutableInkBounds, node: ActivityNodeGeo, theme: Theme): void {
  if ((node.kind !== 'group' && node.kind !== 'partition') || node.usymbol !== undefined) return;
  const tab = frameTabShape(node, withCompositeStyle(theme, node.compositeStyle));
  acc.minX = Math.min(acc.minX, tab.x);
  acc.maxX = Math.max(acc.maxX, tab.x + tab.width);
  acc.minY = Math.min(acc.minY, tab.y);
  acc.maxY = Math.max(acc.maxY, tab.y + tab.height);
}
