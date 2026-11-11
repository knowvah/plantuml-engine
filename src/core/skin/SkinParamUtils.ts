/**
 * `SkinParamUtils.getColor`: the legacy `ColorParam` read, through
 * `Rose#getHtmlColor` -- the first param the skin answers, else the first
 * param's default.
 *
 * Only the `getColor` member is ported: `BpmElement#toTextBlockInternal`
 * (`BpmElement.java:161-162`) is its one reached caller. `getFont` and
 * `getFontColor` belong to callers this port draws elsewhere.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParamUtils.java:57-59
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/rose/Rose.java:72-80
 */
import { HColorSet } from '../klimt/color/HColorSet.js';
import type { ParsedColor } from '../klimt/color/HColorSet.js';
import type { Stereotype } from '../stereo/Stereotype.js';
import type { ColorParam } from './ColorParam.js';

/** The one `ISkinParam` member `Rose#getHtmlColor` reads. @see SkinParam.java:371-396 */
export interface LegacyColorSkin {
  getHtmlColor(param: ColorParam, stereotype: Stereotype | undefined, clickable: boolean): ParsedColor | null;
}

/**
 * `rose.getHtmlColor(skinParam, stereo, colorParam)`. The default is the
 * enum's `HColor`, here built from its hex the way `HColors` builds it
 * (`set.getColorOrWhite("#...")`, HColors.java:95-96).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/rose/Rose.java:72-80
 */
export function getColor(
  skinParam: LegacyColorSkin,
  stereo: Stereotype | undefined,
  ...colorParam: ColorParam[]
): ParsedColor {
  for (const param of colorParam) {
    const result = skinParam.getHtmlColor(param, stereo, false);
    if (result !== null) return result;
  }
  const defaultValue = colorParam[0]!.defaultValue;
  // Every `ColorParam` default is a plain `HColor` constant, never a gradient (ColorParam.java:45-117).
  if (typeof defaultValue !== 'string') throw new Error(`ColorParam ${colorParam[0]!.name} has a gradient default`);
  return HColorSet.instance().getColorOrWhite(defaultValue);
}
