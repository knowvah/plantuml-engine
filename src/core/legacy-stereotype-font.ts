/**
 * The colour of a class or object stereotype label (dss T3b, D8). Upstream draws it from the legacy font path, not a
 * style:
 *
 *   FontConfiguration.create(getSkinParam(), FontParam.CLASS_STEREOTYPE, stereotype)
 *
 * which asks `SkinParam#getFontHtmlColor` for `<param>fontcolor`, then `defaultfontcolor`, then the `FontParam`
 * default. No `<style>` is read, so `classDiagram { FontColor }`, `element { FontColor }` and `root { FontColor }`
 * leave the label `#000000` (jar: `class__kinds-font-*`). `skinparam defaultFontColor` still reaches it, which is
 * why this reads `preprocessed.skinparam` and not the theme: the theme's `text` is also written by a `root` style.
 *
 * The result is two `theme.colors.elements` buckets (D2a's device, no new field); a reader finds neither only when
 * no skinparam names a colour, and then draws the `FontParam` default.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageClassHeader.java:131
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageObject.java:105-106
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:484-505
 */
import { resolveColorToSvgHex } from './klimt/color/HColorSet.js';
import type { ElementColors } from './theme.js';

/** `FontParam.CLASS_STEREOTYPE`'s bucket in `theme.colors.elements`. */
export const CLASS_STEREOTYPE_BUCKET = 'class.stereotype';
/** `FontParam.OBJECT_STEREOTYPE`'s bucket (objects and maps). */
export const OBJECT_STEREOTYPE_BUCKET = 'object.stereotype';

/** `SkinParam#getFontHtmlColor`'s second tier. @see SkinParam.java:496 */
const DEFAULT_FONT_COLOR_KEY = 'defaultfontcolor';
/** `SkinParam#isDark`. @see SkinParam.java:114-116 */
const MODE_KEY = 'mode';
const MODE_DARK = 'dark';

const FONT_PARAMS: readonly (readonly [bucket: string, key: string])[] = [
  [CLASS_STEREOTYPE_BUCKET, 'classstereotypefontcolor'],
  [OBJECT_STEREOTYPE_BUCKET, 'objectstereotypefontcolor'],
];

/**
 * @param skinparam `preprocessed.skinparam`: lowercased key to the last value, as `SkinParam#getValue` reads it.
 * @param darkText `theme.colors.text`: in dark mode the `FontParam` default is the dark scheme's text colour,
 *   which the flat theme already holds.
 */
export function legacyStereotypeFonts(
  skinparam: ReadonlyMap<string, string>,
  darkText: string,
): Partial<Record<string, Pick<ElementColors, 'font'>>> {
  const dark = skinparam.get(MODE_KEY)?.toLowerCase() === MODE_DARK;
  const out: Partial<Record<string, Pick<ElementColors, 'font'>>> = {};
  for (const [bucket, key] of FONT_PARAMS) {
    const raw = skinparam.get(key) ?? skinparam.get(DEFAULT_FONT_COLOR_KEY);
    if (raw !== undefined) out[bucket] = { font: resolveColorToSvgHex(raw) };
    else if (dark) out[bucket] = { font: darkText };
  }
  return out;
}
