/**
 * PORT-ONLY: the klimt seams every wire class crosses, in one place so each ported method reads as its Java line
 * does (as `nwdiag-klimt.ts` and `timing-klimt.ts` do; a copy, not an import, per wrp D2):
 * - `ug.apply(color)` / `ug.apply(color.bg())`;
 * - `FontConfiguration.blackBlueTrue(font).changeColor(color)` and the four-argument `FontConfiguration.create`,
 *   each bridged to the structural configuration the creole sheets read;
 * - `display.create(fontConfiguration, alignment, skinParam)` (`Display.java:614-617`), whose port takes a creole
 *   render context.
 */
import { FontConfiguration as AbelFontConfiguration } from '../../core/abel/FontConfiguration.js';
import { Back } from '../../core/klimt/Back.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import type { AtomOps } from '../../core/klimt/creole/Sea.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { UFont } from '../../core/klimt/font/UFont.js';
import { Fore } from '../../core/klimt/Fore.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import type { Pragma } from '../../core/skin/Pragma.js';
import type { ISkinSimple } from '../../core/style/ISkinSimple.js';
import type { HColor } from '../../core/style/Value.js';

/** `#0000FF`, `HColors.BLUE`, the hyperlink colour of `blackBlueTrue`. @see HColors.java:92 */
const BLUE = '#0000FF';
/** `blackBlueTrue`'s tab size. @see FontConfiguration.java:64 */
const BLACK_BLUE_TRUE_TAB_SIZE = 8;

/** The `ISkinParam` members a wire class reads. */
export interface WireSkinParam extends ISkinSimple {
  /** The creole atom capability every sheet shares. */
  readonly atomOps: AtomOps;
  getPragma(): Pragma;
}

/** `HColors.BLACK.withDark(HColors.WHITE)`, each class's `getBlack()`. @see WBlock.java:247-249 */
export function getBlack(): HColor {
  return HColors.BLACK.withDark(HColors.WHITE);
}

/** `HColors.WHITE.withDark(HColors.BLACK)`, each link's `getWhite()`. @see WLinkHorizontal.java:79-81 */
export function getWhite(): HColor {
  return HColors.WHITE.withDark(HColors.BLACK);
}

/** `(HColorSimple) color`: Java's cast where the port's driver needs a paint. */
function drawable(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: wire colour is not an HColorSimple');
}

/** `ug.apply(color)`. */
export function fore(color: HColor): Fore {
  return new Fore(drawable(color));
}

/** `ug.apply(color.bg())`. */
export function back(color: HColor): Back {
  return new Back(drawable(color));
}

/** `FontConfiguration.blackBlueTrue(font).changeColor(color)`. @see FontConfiguration.java:63-65, :258-261 */
export function blackBlueTrueChanged(font: UFont, color: HColor): FontConfiguration {
  return bridgeFontConfiguration(
    AbelFontConfiguration.create(
      font,
      color,
      HColorSet.instance().getColorOrWhite(BLUE),
      UStroke.simple(),
      BLACK_BLUE_TRUE_TAB_SIZE,
    ),
  );
}

/**
 * `FontConfiguration.create(font, color, hyperlinkColor, null)`. The null stroke is only read for a hyperlink, and a
 * block name (`[\w]+`) cannot hold one. @see WBlock.java:240, FontConfiguration.java:229-232
 */
export function createFontConfiguration(font: UFont, color: HColor, hyperlinkColor: HColor): FontConfiguration {
  return bridgeFontConfiguration(AbelFontConfiguration.create(font, color, hyperlinkColor, null as unknown as UStroke));
}

/** `display.create(fontConfiguration, HorizontalAlignment.LEFT, skinParam)`. @see Display.java:614-617 */
export function createLeft(
  display: Display,
  fontConfiguration: FontConfiguration,
  skinParam: WireSkinParam,
): TextBlock {
  return display.create(
    { fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps },
    HorizontalAlignment.LEFT,
  );
}

/** A polygon of path points, `UPath.none()` with one `moveTo` and `lineTo`s, as each arrow branch builds its path. */
export type PathPoint = readonly [number, number];

export function polygon(points: readonly PathPoint[]): UPath {
  const path = UPath.none();
  points.forEach(([x, y], i) => {
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  // `closePath()`: an upstream no-op (`UPath.ts`); kept so the Java's calls read the same.
  path.closePath();
  return path;
}
