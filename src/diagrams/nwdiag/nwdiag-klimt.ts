/**
 * PORT-ONLY — the three klimt seams every nwdiag class crosses, kept in one
 * place so each ported method reads as its Java line does:
 * - `StyleSignatureBasic.of(root, element, nwdiagDiagram, sname)
 *   .getMergedStyle(skinParam.getCurrentStyleBuilder())`
 *   (`NServer.java:153-155`, `NwGroup.java:139-141`,
 *   `GridTextBlockDecorated.java:134-136`, `NwDiagram.java:319-321`);
 * - `ug.apply(color)` / `ug.apply(color.bg())`: the style layer's `HColor` is
 *   an `HColorSimple`/`HColorGradient` (the `Style.ts#foregroundOf` cast);
 * - `Display#create(fontConfiguration, alignment, spriteContainer)`
 *   (`Display.java:614-617`), whose port takes a creole render context.
 */
import { Back } from '../../core/klimt/Back.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import type { AtomOps } from '../../core/klimt/creole/Sea.js';
import type { Fashion } from '../../core/klimt/Fashion.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { Fore } from '../../core/klimt/Fore.js';
import type { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { ISkinSimple } from '../../core/style/ISkinSimple.js';
import { SymbolContext } from '../../core/decoration/symbol/SymbolContext.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { HColor } from '../../core/style/Value.js';
import type { SkinParam } from './nwdiag-skin-param.js';

/** The `SName`s nwdiag's styles end in. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/SName.java */
export type NwdiagSName = 'network' | 'server' | 'arrow' | 'group';

/** `root, element, nwdiagDiagram, sname`, merged against the current builder. */
export function nwdiagStyle(sname: NwdiagSName, skinParam: SkinParam): Style {
  const style = StyleSignatureBasic.of('root', 'element', 'nwdiagDiagram', sname).getMergedStyle(
    skinParam.getCurrentStyleBuilder(),
  );
  // `getMergedStyle` answers undefined only for an undefined builder; the skin param always has one.
  if (style === undefined) throw new Error('NullPointerException: nwdiag style builder answered no style');
  return style;
}

/** `(HColorSimple) color`: Java's cast where the port's driver needs a paint. */
function drawable(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: nwdiag colour is not an HColorSimple');
}

/** `ug.apply(color)`. */
export function fore(color: HColor): Fore {
  return new Fore(drawable(color));
}

/** `ug.apply(color.bg())`. */
export function back(color: HColor): Back {
  return new Back(drawable(color));
}

/** A style colour as a paint, for `MinMax#draw`. */
export function paintOf(color: HColor): HColorSimple | HColorGradient {
  return drawable(color);
}

/**
 * `Fashion` as the port's `SymbolContext` (the same class under its older
 * upstream name, `decoration/symbol/SymbolContext.ts`), which `USymbol#asSmall`
 * takes.
 */
export function symbolContextOf(fashion: Fashion): SymbolContext {
  const backColor = fashion.getBackColor();
  const foreColor = fashion.getForeColor();
  return new SymbolContext(
    backColor === undefined ? null : drawable(backColor),
    foreColor === undefined ? null : drawable(foreColor),
    fashion.getStroke(),
    fashion.getDeltaShadow(),
    fashion.getRoundCorner(),
    fashion.getDiagonalCorner(),
  );
}

/** The creole sprite seam: the container and the atom capability it draws with. */
export interface SpriteSeam {
  readonly spriteContainer: ISkinSimple;
  readonly atomOps: AtomOps;
}

/**
 * `display.create(style.getFontConfiguration(set), alignment, spriteContainer)`
 * (`Display.java:614-617`, `CreoleMode.FULL`). The sprite container is the
 * skin param unless `seam` names another.
 */
export function createDisplay(
  display: Display,
  style: Style,
  skinParam: SkinParam,
  horizontalAlignment: HorizontalAlignment,
  seam?: SpriteSeam,
): TextBlock {
  const fontConfiguration = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
  const sprites = seam ?? { spriteContainer: skinParam, atomOps: skinParam.atomOps };
  return display.create({ fontConfiguration, ...sprites }, horizontalAlignment);
}
