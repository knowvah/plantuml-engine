/**
 * Whether an `object`, `map` or `json` box draws its header as a second shape, and in what paint. The renderer draws
 * it; the ink finder has to know, since `URectangle#halfRounded` returns a `UPath` (`URectangle.java:123-135`) that
 * `LimitFinder#drawUPath` bounds with no inset, so it reaches `x + w` where the box's own rect stops at `x + w - 1`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageObject.java:168-205
 */
import type { Paint } from '../../core/paint.js';
import { resolveBareOrBackColor } from '../../core/color-override.js';
import type { Theme } from '../../core/theme.js';
import { classifierFill, resolveElementHeaderBackground } from './renderer-classifier-colors.js';
import { scopedPaint } from './renderer-classifier-scoped-colors.js';
import type { ClassifierGeo } from './layout.js';

/** `EntityImageObject.java:174-177`: an inline back colour IS the header's, whatever a style says. */
function headerPaint(geo: ClassifierGeo, theme: Theme, bodyBg: Paint): Paint | undefined {
  if (resolveBareOrBackColor(geo.color) !== undefined) return undefined;
  const scoped = geo.objectStyle?.header.background;
  const styled = scoped !== undefined ? scopedPaint(scoped) : resolveElementHeaderBackground(theme, geo.kind);
  // `backcolor.equals(headerBackcolor)` (`:199`): `HColorGradient` has no `equals` and the body and the header each
  // parsed their own (`ValueImpl.java:92-103`), so a gradient body always splits.
  return styled ?? (typeof bodyBg !== 'string' ? bodyBg : undefined);
}

/** The header's own paint when `EntityImageObject.java:199` draws one. */
export function objectHeaderSplitPaint(geo: ClassifierGeo, theme: Theme): Paint | undefined {
  const bodyBg = classifierFill(geo, theme);
  const paint = headerPaint(geo, theme, bodyBg);
  return paint !== undefined && (paint !== bodyBg || typeof paint !== 'string') ? paint : undefined;
}

/** `getStyle().value(PName.RoundCorner)` of the kind's own signature (`EntityImageObject.java:94`), or a flat bucket's. */
export function objectRoundCorner(geo: ClassifierGeo, theme: Theme): number | undefined {
  return geo.objectStyle?.box.roundCorner ?? theme.colors.elements?.[geo.kind]?.roundCorner;
}

/** `plantuml.skin:204-210`, `objectDiagram { element { RoundCorner 5 } }`, for a render with no builder (dark mode). */
const SKIN_ROUND_CORNER = 5;

/** Whether a header split's `UPath` reaches the ink: `halfRounded(0)` keeps the `URectangle` (`URectangle.java:124-125`). */
export function headerSplitDrawsPath(geo: ClassifierGeo, theme: Theme): boolean {
  if (objectHeaderSplitPaint(geo, theme) === undefined) return false;
  return (objectRoundCorner(geo, theme) ?? theme.colors.graph.classCascadeRoundCorner ?? SKIN_ROUND_CORNER) !== 0;
}
