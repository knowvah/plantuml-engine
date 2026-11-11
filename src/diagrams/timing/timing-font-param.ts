/**
 * `SkinParam#getFont` / `#getFontHtmlColor` for the one legacy `FontParam` timing reaches, `FontParam.TIMING`
 * (`Highlight#getCaption`, Highlight.java:99-100), with no stereotype. Free functions over the skinparam store so
 * that `timing-skin-param.ts` (T3a) and the unit-test skin param answer the `ISkinParam` members the same way.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:441-543,546-554
 */
import type { FontParam } from '../../core/abel/ISkinParam.js';
import type { FontFace } from '../../core/klimt/shape/UText.js';
import { UFontFace } from '../../core/klimt/font/UFont.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import type { UFont } from '../../core/klimt/font/UFont.js';
import { eventuallyRemoveStartingAndEndingDoubleQuote } from '../../core/url/Url.js';
import type { ISkinSimple } from '../../core/style/ISkinSimple.js';
import type { HColor, HColorSet } from '../../core/style/Value.js';

/** `FontParam.TIMING(12, UFontFace.normal())` (FontParam.java:49) with `FontParamConstant.FAMILY`/`COLOR`. */
export const FONT_PARAM_TIMING: FontParam = 'TIMING';
const TIMING_DEFAULT_SIZE = 12;
const FONT_FAMILY_DEFAULT = 'SansSerif';
const FONT_COLOR_DEFAULT = 'black';
/** `SkinParam.DIGITS` (SkinParam.java:131). */
const DIGITS = /^\d+$/;
/** The format `eventuallyRemoveStartingAndEndingDoubleQuote(String)` passes on (StringUtils.java:90). */
const QUOTE_FORMAT = '"([:';

/** `getFirstValueNonNullWithSuffix(suffix, TIMING)` (SkinParam.java:507-515): `getValue("TIMING" + suffix)`. */
function timingValue(skinParam: Pick<ISkinSimple, 'getValue'>, suffix: string): string | null {
  return skinParam.getValue(FONT_PARAM_TIMING + suffix);
}

/** `getFontSize` (SkinParam.java:441-458) without a stereotype. */
function getFontSize(skinParam: Pick<ISkinSimple, 'getValue'>): number {
  let value = timingValue(skinParam, 'fontsize');
  if (value === null || !DIGITS.test(value)) value = skinParam.getValue('defaultfontsize');
  if (value === null || !DIGITS.test(value)) return TIMING_DEFAULT_SIZE;
  return Number.parseInt(value, 10);
}

/** `getFontFamily` (SkinParam.java:460-481) without a stereotype. */
function getFontFamily(skinParam: Pick<ISkinSimple, 'getValue'>): string {
  let value = timingValue(skinParam, 'fontname');
  if (value !== null) return eventuallyRemoveStartingAndEndingDoubleQuote(value, QUOTE_FORMAT) as string;

  value = skinParam.getValue('defaultfontname');
  if (value !== null) return eventuallyRemoveStartingAndEndingDoubleQuote(value, QUOTE_FORMAT) as string;

  return FONT_FAMILY_DEFAULT;
}

/** `getFontFace` (SkinParam.java:517-543) without a stereotype. */
function getFontFace(skinParam: Pick<ISkinSimple, 'getValue'>): FontFace {
  let value = timingValue(skinParam, 'fontstyle');
  if (value === null) value = skinParam.getValue('defaultfontstyle');
  if (value === null) return UFontFace.normal();

  const lower = value.toLowerCase();
  const bold = lower.includes('bold');
  const italic = lower.includes('italic');
  if (bold && italic) return UFontFace.boldItalic();
  if (bold) return UFontFace.bold();
  if (italic) return UFontFace.italic();
  return UFontFace.normal();
}

/** `SkinParam#getFont(null, false, FontParam.TIMING)` (SkinParam.java:546-554). */
export function timingFont(skinParam: Pick<ISkinSimple, 'getValue'>): UFont {
  return UFontFactory.build(getFontFamily(skinParam), getFontFace(skinParam), getFontSize(skinParam));
}

/** `SkinParam#getFontHtmlColor(null, FontParam.TIMING)` (SkinParam.java:484-505). */
export function timingFontHtmlColor(skinParam: Pick<ISkinSimple, 'getValue'>, colorSet: HColorSet): HColor {
  let value = timingValue(skinParam, 'fontcolor');
  if (value === null) value = skinParam.getValue('defaultfontcolor');
  if (value === null) value = FONT_COLOR_DEFAULT;
  return colorSet.getColorOrWhite(value);
}
