/**
 * PORT-ONLY -- the klimt seams a timing class crosses, in one place so each ported method reads as its Java
 * line does (as `nwdiag-klimt.ts` does for nwdiag; copied, not imported, per timing-engine-port D2):
 * - `StyleSignatureBasic.of(root, element, timingDiagram, sname...).getMergedStyle(skinParam.getCurrentStyleBuilder())`
 *   (`TimingRuler.java:196-205`);
 * - `ug.apply(color)`: the style layer's `HColor` is an `HColorSimple`/`HColorGradient`;
 * - `display.create(FontConfiguration.create(skinParam, style), alignment, skinParam)` (`Display.java:614-617`).
 *
 * `TimingSkinParam` is the slice of upstream's `ISkinParam` a ruler reaches; `timing-skin-param.ts` (T3a) is
 * its implementation.
 */
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import type { HColor } from '../../core/style/Value.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import type { AtomOps } from '../../core/klimt/creole/Sea.js';
import { FontConfiguration as AbelFontConfiguration } from '../../core/abel/FontConfiguration.js';
import { Back } from '../../core/klimt/Back.js';
import type { FontParam, UFont } from '../../core/abel/ISkinParam.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { FONT_PARAM_TIMING } from './timing-font-param.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { Fore } from '../../core/klimt/Fore.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import type { ResolvedColor } from '../../core/klimt/color/HColorSet.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { Pragma } from '../../core/skin/Pragma.js';
import type { Stereotype } from '../../core/stereo/Stereotype.js';
import type { HColorSet } from '../../core/style/Value.js';
import type { ISkinSimple } from '../../core/style/ISkinSimple.js';
import type { SName } from '../../core/style/SName.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';

/** The `ISkinParam` members the timing classes read. */
export interface TimingSkinParam extends ISkinSimple {
  /** The creole atom capability every sheet shares. */
  readonly atomOps: AtomOps;
  getCurrentStyleBuilder(): StyleBuilder;
  getIHtmlColorSet(): HColorSet;
  getPragma(): Pragma;
  /**
   * `ISkinParam#getFont(stereotype, false, FontParam.TIMING)` and `getFontHtmlColor(stereotype, FontParam.TIMING)`
   * (`FontConfiguration.java:203-207`): `timing-font-param.ts` has the logic; the only `FontParam` timing reads.
   */
  getFont(stereotype: Stereotype | undefined, inPackageTitle: boolean, ...fontParam: FontParam[]): UFont;
  getFontHtmlColor(stereotype: Stereotype | undefined, ...fontParam: FontParam[]): HColor;
  /** `ISkinParam#getHyperlinkColor` and `#useUnderlineForHyperlink` (`SkinParam.java:305-311,1057-1061`). */
  getHyperlinkColor(): HColor;
  useUnderlineForHyperlink(): UStroke;
  /** `SkinParam#getDefaultTextAlignment` (`SkinParam.java:731-738`): `TimingNote#createOpale` reads it. */
  getDefaultTextAlignment(defaultValue: HorizontalAlignment): HorizontalAlignment;
}

/** `root, element, timingDiagram, ...snames`, merged against the current builder. */
export function timingStyle(skinParam: TimingSkinParam, ...snames: readonly SName[]): Style {
  return timingStyleFrom(skinParam.getCurrentStyleBuilder(), ...snames);
}

/**
 * The same merge against a builder a class captured at construction (`TimeConstraint`, `TimeMessage`,
 * `TimeArrow` keep `skinParam.getCurrentStyleBuilder()` in a field). An `undefined` builder is Java's `null`.
 */
export function timingStyleFrom(builder: StyleBuilder | undefined, ...snames: readonly SName[]): Style {
  const style = StyleSignatureBasic.of('root', 'element', 'timingDiagram', ...snames).getMergedStyle(builder);
  // `getMergedStyle` answers undefined only for an undefined builder; the skin param always has one.
  if (style === undefined) throw new Error('java.lang.NullPointerException: timing style builder answered no style');
  return style;
}

/**
 * `StyleSignatureBasic.of(root, element, timingDiagram, snames...).withTOBECHANGED(stereotype)
 * .getMergedStyle(builder)` (`Player.java:77-79,98-100`).
 */
export function timingStyleStereotyped(
  skinParam: TimingSkinParam,
  stereotype: Stereotype | undefined,
  ...snames: readonly SName[]
): Style {
  const style = StyleSignatureBasic.of('root', 'element', 'timingDiagram', ...snames)
    .withTOBECHANGED(stereotype)
    .getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('java.lang.NullPointerException: timing style builder answered no style');
  return style;
}

/** `(HColorSimple) color`: Java's cast where the port's driver needs a paint. */
export function drawable(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('java.lang.ClassCastException: timing colour is not an HColorSimple');
}

/** `ug.apply(color)`. */
export function fore(color: HColor): Fore {
  return new Fore(drawable(color));
}

/**
 * `FontConfiguration.create(skinParam, FontParam.TIMING, null)` (FontConfiguration.java:203-207): the legacy
 * font lookup `Highlight#getCaption` uses instead of the style.
 */
export function timingFontParamConfiguration(skinParam: TimingSkinParam): FontConfiguration {
  return bridgeFontConfiguration(
    AbelFontConfiguration.create(
      skinParam.getFont(undefined, false, FONT_PARAM_TIMING),
      skinParam.getFontHtmlColor(undefined, FONT_PARAM_TIMING),
      skinParam.getHyperlinkColor(),
      skinParam.useUnderlineForHyperlink(),
      skinParam.getTabSize(),
    ),
  );
}

/** The structural `ResolvedColor` the port's `WithLinkType#getColorOrWhite` answers (`r`, `g`, `b`, `a` numbers). */
function isResolvedColor(color: object): color is ResolvedColor {
  const c = color as Partial<Record<keyof ResolvedColor, unknown>>;
  return typeof c.r === 'number' && typeof c.g === 'number' && typeof c.b === 'number' && typeof c.a === 'number';
}

/**
 * `WithLinkType#getSpecificColor` answers the abel layer's opaque colour. Java's `getColorOrWhite` returns an
 * `HColorSimple`; the port's `WithLinkType.ts` adaptation returns the bare `ResolvedColor`, so the
 * `HColors.simple(XColor)` wrap (`HColors.java:178-180`) happens here, as `gantt/GanttConstraint.ts` does.
 */
export function specificColorOf(color: object | undefined): HColor | undefined {
  if (color === undefined) return undefined;
  if (isResolvedColor(color)) return HColors.simple(color);
  return color as HColor;
}

/** `ug.apply(color.bg())`. */
export function back(color: HColor): Back {
  return new Back(drawable(color));
}

/**
 * `FontConfiguration.create(skinParam, style)` (`FontConfiguration.java:209-222`): the style's font and colours,
 * with the hyperlink underline and tab size taken from the skin param rather than the style.
 */
export function fontConfigurationOf(skinParam: TimingSkinParam, style: Style): FontConfiguration {
  const colorSet = skinParam.getIHtmlColorSet();
  return bridgeFontConfiguration(
    AbelFontConfiguration.create(
      style.getUFont(),
      style.value('FontColor').asColor(colorSet),
      style.value('HyperLinkColor').asColor(colorSet),
      skinParam.useUnderlineForHyperlink(),
      skinParam.getTabSize(),
    ),
  );
}

/** `display.create(fontConfiguration, alignment, skinParam)`. */
export function createDisplayWith(
  display: Display,
  fontConfiguration: FontConfiguration,
  skinParam: TimingSkinParam,
  horizontalAlignment: HorizontalAlignment,
): TextBlock {
  return display.create(
    { fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps },
    horizontalAlignment,
  );
}

/** `display.create(style.getFontConfiguration(colorSet), alignment, skinParam)` (`TimeConstraint`, `TimeArrow`). */
export function createDisplay(
  display: Display,
  style: Style,
  skinParam: TimingSkinParam,
  horizontalAlignment: HorizontalAlignment,
): TextBlock {
  const fontConfiguration = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
  return createDisplayWith(display, fontConfiguration, skinParam, horizontalAlignment);
}
