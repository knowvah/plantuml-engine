/**
 * `FloatingNote`: a note drawn on its own, an `Opale` around the note's creole sheet in the
 * `root, element, <sname>, note` style. The EBNF engine draws every comment through it (`EbnfExpression.java`,
 * `PSystemEbnf.java`); the activity engine keeps its own note drawing (eep D3).
 *
 * Adaptations: `skinParam` is the structural slice the constructor reads ({@link FloatingNoteSkinParam}); the
 * port's `SheetBlock1` takes the skin's `atomOps` (the port's inline-sprite seam) beside `wrapWidth`/`getPadding`.
 * `FontConfiguration.create(skinParam, style)` is inlined as `files/layout.ts#createOpale` inlines it
 * (`FontConfiguration.java:209-220`, `colors == null`). `HColor` → `Opale`'s paint goes through `paintOf`, as there.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FloatingNote.java:63-128
 */
import { FontConfiguration } from '../../../../core/abel/FontConfiguration.js';
import type { HColor } from '../../../../core/abel/Colors.js';
import type { Direction } from '../../../../core/abel/Direction.js';
import type { ISkinParamWithSimple } from '../../../../core/abel/ISkinParam.js';
import type { HColorOrPaint } from '../../../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../../../core/klimt/color/HColorSimple.js';
import type { CreoleAtom } from '../../../../core/klimt/creole/atom/Atom.js';
import { CreoleMode } from '../../../../core/klimt/creole/CreoleMode.js';
import type { Display } from '../../../../core/klimt/creole/Display.js';
import type { AtomOps } from '../../../../core/klimt/creole/Sea.js';
import type { Sheet } from '../../../../core/klimt/creole/Sheet.js';
import { SheetBlock1 } from '../../../../core/klimt/creole/SheetBlock1.js';
import { SheetBlock2 } from '../../../../core/klimt/creole/SheetBlock2.js';
import type { Stencil } from '../../../../core/klimt/creole/Stencil.js';
import { bridgeFontConfiguration } from '../../../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../../../core/klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../../../core/klimt/geom/XDimension2D.js';
import type { XPoint2D } from '../../../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../../../core/klimt/UGraphic.js';
import type { SName } from '../../../../core/style/SName.js';
import type { Style } from '../../../../core/style/Style.js';
import type { StyleBuilder } from '../../../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../../../core/style/StyleSignatureBasic.js';
import { Opale } from '../../../../core/svek/image/Opale.js';

/** The `ISkinParam` members `FloatingNote`'s constructor reads, plus the port's `atomOps` seam. */
export type FloatingNoteSkinParam = Pick<
  ISkinParamWithSimple,
  'getIHtmlColorSet' | 'useUnderlineForHyperlink' | 'getTabSize' | 'sheet' | 'getDefaultTextAlignment' | 'getPadding'
> & { readonly atomOps: AtomOps; getCurrentStyleBuilder(): StyleBuilder };

/** `HColor` → `Opale`'s paint: an `HColorSimple` or a gradient (the cast `files/layout.ts#paintOf` makes). */
function paintOf(color: HColor): HColorOrPaint {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: colour is not an HColorSimple');
}

/** `getMergedStyle` answers `null` upstream only for a missing builder, which every diagram has. */
function mergedStyleOf(signature: StyleSignatureBasic, skinParam: FloatingNoteSkinParam): Style {
  const style = signature.getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('NullPointerException: no style for ' + String(signature));
  return style;
}

export class FloatingNote implements Stencil, TextBlock {
  private readonly opale: Opale;

  /** @see FloatingNote.java:67-87 */
  private constructor(note: Display, skinParam: FloatingNoteSkinParam, sname: SName, withLink: boolean) {
    const style = mergedStyleOf(StyleSignatureBasic.of('root', 'element', sname, 'note'), skinParam);
    const wrapWidth = style.wrapWidth();
    const colorSet = skinParam.getIHtmlColorSet();
    // FontConfiguration.create(skinParam, style) (FontConfiguration.java:209-220)
    const fc = FontConfiguration.create(
      style.getUFont(),
      style.value('FontColor').asColor(colorSet),
      style.value('HyperLinkColor').asColor(colorSet),
      skinParam.useUnderlineForHyperlink(),
      skinParam.getTabSize(),
    );
    const noteBackgroundColor = style.value('BackGroundColor').asColor(colorSet);
    const borderColor = style.value('LineColor').asColor(colorSet);
    const stroke = style.getStroke();
    const shadowing = style.getShadowing();

    // `SheetBuilder#createSheet` widens to `Sheet<StripeAtom>`; `SheetBlock1` takes the narrow `Sheet` (the cast
    // `files/layout.ts#createOpale` makes).
    const sheet = skinParam
      .sheet(bridgeFontConfiguration(fc), skinParam.getDefaultTextAlignment(HorizontalAlignment.LEFT), CreoleMode.FULL)
      .createSheet(note) as unknown as Sheet<CreoleAtom>;
    const sheetBlock2 = new SheetBlock2(
      new SheetBlock1(sheet, wrapWidth, skinParam.atomOps, skinParam.getPadding()),
      this,
      stroke,
    );
    this.opale = new Opale(
      shadowing,
      paintOf(borderColor),
      paintOf(noteBackgroundColor),
      sheetBlock2,
      withLink,
      stroke,
    );
  }

  /** @see FloatingNote.java:89-91 */
  static create(note: Display, skinParam: FloatingNoteSkinParam, sname: SName): FloatingNote {
    return new FloatingNote(note, skinParam, sname, false);
  }

  /** @see FloatingNote.java:93-95 */
  static createOpale(note: Display, skinParam: FloatingNoteSkinParam, sname: SName): FloatingNote {
    return new FloatingNote(note, skinParam, sname, true);
  }

  /** @see FloatingNote.java:97-100 */
  setOpale(strategy: Direction, pp1: XPoint2D, pp2: XPoint2D): void {
    this.opale.setOpale(strategy, pp1, pp2);
  }

  /** @see FloatingNote.java:102-104 */
  drawU(ug: UGraphic): void {
    this.opale.drawU(ug);
  }

  /** @see FloatingNote.java:106-110 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return this.opale.calculateDimension(stringBounder);
  }

  /** @see FloatingNote.java:112-114 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return -this.opale.getMarginX1();
  }

  /** @see FloatingNote.java:116-118 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.opale.calculateDimension(stringBounder).getWidth() - this.opale.getMarginX1();
  }
}
