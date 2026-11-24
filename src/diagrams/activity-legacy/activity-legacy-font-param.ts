/**
 * `FontConfiguration.create(skinParam, FontParam.ARROW, null)` for the legacy activity engine: the skin-parameter
 * font (not the style one) the ELK maker gives a link's quantifier and role (`CucaDiagramFileMakerElk.java:257`,
 * `:272`). It reads `SkinParam#getFont`, `getFontHtmlColor`, `getHyperlinkColor`, `useUnderlineForHyperlink` and
 * `getTabSize` with no stereotype, and `FontParam.ARROW`'s defaults: 13, but 11 in an `ACTIVITY` diagram, which
 * every legacy activity diagram is (`FontParam.java:159-162`).
 *
 * Only `FontParam.ARROW` is ported: no other caller reaches it on this engine.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/font/FontConfiguration.java:202-206
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:461-574
 */
import type { HColor } from '../../core/abel/Colors.js';
import { FontConfiguration as StyleFontConfiguration } from '../../core/abel/FontConfiguration.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { UFontFace } from '../../core/klimt/font/UFont.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import type { FontConfiguration, FontFace } from '../../core/klimt/shape/UText.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';

/** `FontParam.ARROW.name()`, the prefix of every `getFirstValueNonNullWithSuffix` key. @see SkinParam.java:527-535 */
const ARROW = 'ARROW';
/** `FontParam#getDefaultSize` for `ARROW` in an `ACTIVITY` diagram. @see FontParam.java:159-162 */
const ARROW_ACTIVITY_DEFAULT_SIZE = 11;
/** `FontParamConstant.FAMILY`, `ARROW`'s default family. @see FontParam.java:45-48, 56 */
const DEFAULT_FAMILY = 'SansSerif';
/** `FontParamConstant.COLOR`, `ARROW`'s default colour. @see FontParam.java:45-48, 56 */
const DEFAULT_COLOR = 'black';
/** `getAsInt("tabsize", 8)`. @see SkinParam.java:1116-1118 */
const DEFAULT_TAB_SIZE = 8;
const DIGITS = /^\d+$/;

/** `getFirstValueNonNullWithSuffix(suffix, ARROW)`. @see SkinParam.java:527-535 */
function arrowValue(skinParam: ActivityLegacySkinParam, suffix: string): string | null {
  return skinParam.getValue(ARROW + suffix);
}

/** `StringUtils.eventuallyRemoveStartingAndEndingDoubleQuote`. */
function unquote(value: string): string {
  return value.length >= 2 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
}

/** `getFontSize(null, ARROW)`. @see SkinParam.java:461-478 */
function getFontSize(skinParam: ActivityLegacySkinParam): number {
  let value = arrowValue(skinParam, 'fontsize');
  if (value === null || !DIGITS.test(value)) value = skinParam.getValue('defaultfontsize');
  if (value === null || !DIGITS.test(value)) return ARROW_ACTIVITY_DEFAULT_SIZE;
  return Number.parseInt(value, 10);
}

/** `getFontFamily(null, ARROW)`: `ARROW` is not `CIRCLED_CHARACTER`, so `defaultfontname` applies. @see SkinParam.java:480-501 */
function getFontFamily(skinParam: ActivityLegacySkinParam): string {
  const value = arrowValue(skinParam, 'fontname') ?? skinParam.getValue('defaultfontname');
  return value === null ? DEFAULT_FAMILY : unquote(value);
}

/** `getFontFace(null, false, ARROW)`: `ARROW`'s default face is normal. @see SkinParam.java:537-563, FontParam.java:169-177 */
function getFontFace(skinParam: ActivityLegacySkinParam): FontFace {
  const value = arrowValue(skinParam, 'fontstyle') ?? skinParam.getValue('defaultfontstyle');
  if (value === null) return UFontFace.normal();
  const lower = value.toLowerCase();
  const bold = lower.includes('bold');
  const italic = lower.includes('italic');
  if (bold && italic) return UFontFace.boldItalic();
  if (bold) return UFontFace.bold();
  if (italic) return UFontFace.italic();
  return UFontFace.normal();
}

/** `getFontHtmlColor(null, ARROW)`. @see SkinParam.java:504-525 */
function getFontHtmlColor(skinParam: ActivityLegacySkinParam): HColor {
  const value = arrowValue(skinParam, 'fontcolor') ?? skinParam.getValue('defaultfontcolor') ?? DEFAULT_COLOR;
  return skinParam.getIHtmlColorSet().getColorOrWhite(value);
}

/** `getHyperlinkColor()`: `ColorParam.hyperlink`, else blue. @see SkinParam.java:325-331 */
function getHyperlinkColor(skinParam: ActivityLegacySkinParam): HColor {
  const value = skinParam.getValue('hyperlinkcolor');
  const result = value === null ? undefined : skinParam.getIHtmlColorSet().getColorOrNull(value);
  return result ?? HColors.BLUE;
}

/** `useUnderlineForHyperlink()`. @see SkinParam.java:1077-1081 */
function useUnderlineForHyperlink(skinParam: ActivityLegacySkinParam): UStroke | null {
  return skinParam.getValue('hyperlinkunderline')?.toLowerCase() === 'false' ? null : UStroke.simple();
}

/** `getTabSize()`. @see SkinParam.java:1116-1118 */
function getTabSize(skinParam: ActivityLegacySkinParam): number {
  const value = skinParam.getValue('tabsize');
  return value !== null && DIGITS.test(value) ? Number.parseInt(value, 10) : DEFAULT_TAB_SIZE;
}

/**
 * `FontConfiguration.create(skinParam, FontParam.ARROW, null)`, as the creole layer reads it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/font/FontConfiguration.java:202-206
 */
export function arrowFontConfiguration(skinParam: ActivityLegacySkinParam): FontConfiguration {
  const font = UFontFactory.build(getFontFamily(skinParam), getFontFace(skinParam), getFontSize(skinParam));
  const underline = useUnderlineForHyperlink(skinParam);
  const bridged = bridgeFontConfiguration(
    StyleFontConfiguration.create(
      font,
      getFontHtmlColor(skinParam),
      getHyperlinkColor(skinParam),
      underline ?? UStroke.simple(),
      getTabSize(skinParam),
    ),
  );
  // The abel `FontConfiguration` port types the stroke non-null; upstream's is null when the underline is off.
  return underline === null ? { ...bridged, hyperlinkUnderlineStroke: null } : bridged;
}
