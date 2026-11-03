/**
 * renderer-classifier-header-icon.ts -- the header's visibility icon, split out of `renderer-classifier-box.ts`
 * (500-line cap) when the member rows' icons took their own entry point (`renderMemberVisibilityIcon`, T3g). The header's
 * colours are `Rose`'s, not the style engine's (`EntityImageClassHeader.java:111-112`), so it keeps `renderVisibilityIcon`.
 */
import type { ScaledTheme } from './class-scale-geo.js';
import { renderVisibilityIcon, VISIBILITY_ICON_SIZE } from './class-visibility-icon.js';
import type { ClassifierGeo } from './layout.js';

/** cdd5-T4b: the header's `VisibilityModifier#getUBlock` icon (METHOD
 *  variant), `iconWidth` = raw `classAttributeIconSize + 1` left of the tagged
 *  name row (`class-header-visibility-geo.ts`). No url: rare, unsurveyed.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageClassHeader.java:109-121 */
export function renderHeaderVisibilityIcon(geo: ClassifierGeo, headerRowCount: number, theme: ScaledTheme): string {
  const row = geo.rows.slice(0, headerRowCount).find((r) => r.visibilityIcon !== undefined);
  if (row?.visibilityIcon === undefined) return '';
  const iconWidth = ((theme.classAttributeIconSize ?? VISIBILITY_ICON_SIZE) + 1) * theme.scaleK;
  const x = geo.x + row.indent - iconWidth;
  return renderVisibilityIcon(
    row.visibilityIcon,
    false,
    x,
    geo.y + row.y + (row.visibilityBlockTopDy ?? 0),
    undefined,
    theme,
  );
}
