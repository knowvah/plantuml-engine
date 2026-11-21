import type { FontConfiguration as StyleFontConfiguration } from '../../core/abel/FontConfiguration.js';
import { FontConfiguration } from '../../core/abel/FontConfiguration.js';
import type { HColor } from '../../core/abel/Colors.js';
import { Back } from '../../core/klimt/Back.js';
import { Fore } from '../../core/klimt/Fore.js';
import type { HColorOrPaint } from '../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { CreoleAtom } from '../../core/klimt/creole/atom/Atom.js';
import type { Sheet } from '../../core/klimt/creole/Sheet.js';
import { SheetBlock1 } from '../../core/klimt/creole/SheetBlock1.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { VerticalAlignment } from '../../core/klimt/geom/VerticalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { LineBreakStrategy } from '../../core/klimt/LineBreakStrategy.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockMemoized } from '../../core/klimt/shape/TextBlockMemoized.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { Opale } from '../../core/svek/image/Opale.js';
import type { FEntry } from './ast.js';
import type { SkinParam } from './files-skin-param.js';
import type { FilesIcons } from './files-icons.js';

/** Horizontal shift between a folder and its children. @see FilesListing.java:62 */
export const INDENT = 21;
/** Vertical space between two rows. @see FilesListing.java:64 */
export const ROW_SPACING = 2;
/** Space between the icon and the name. @see FilesListing.java:66 */
const ICON_GAP = 6;
/** Space between the name and its description. @see FilesListing.java:68 */
const DESCRIPTION_GAP = 10;
/** Where the connector stops, on the left of the child row. @see FilesListing.java:70 */
export const CONNECTOR_GAP = 2;
/** Margin of the highlight box around a row. @see FilesListing.java:72 */
export const BOX_MARGIN = 2;
/** The corner radius of the highlight box. @see FilesListing.java:240 */
const BOX_ROUND_CORNER = 4;

/** `ug.apply(HColor)` / `new Opale(.., HColor, ..)`: the style layer's `HColor` is an `HColorSimple` or a gradient. */
function paintOf(color: HColor): HColorOrPaint {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: colour is not an HColorSimple');
}

/** `StyleQuery#withStereotype` for each of `stereotypes` (`FilesListing#withStereotypes`, java:162-166). */
function withStereotypes(signature: StyleSignatureBasic, stereotypes: readonly string[]): StyleSignatureBasic {
  let result = signature;
  for (const s of stereotypes) result = result.addStereotype(s);
  return result;
}

/**
 * What is drawn for one entry: icon, name and description, or a note.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesListing.java:171-276
 */
export class FilesRow extends TextBlockMemoized {
  private readonly icon: TextBlock | null;
  private readonly content: TextBlock;
  private readonly background: HColor | undefined;
  private readonly border: HColor | undefined;

  constructor(
    private readonly skinParam: SkinParam,
    icons: FilesIcons,
    entry: FEntry,
  ) {
    super();
    if (entry.isNote()) {
      this.icon = null;
      this.content = this.createOpale(entry.note as readonly string[]);
      return;
    }
    const style = this.styleOf(entry.isFolder() ? 'folder' : 'file', entry);
    const colorSet = skinParam.getIHtmlColorSet();
    const fc = style.getFontConfiguration(colorSet);

    const iconText = icons.getIcon(entry);
    this.icon = iconText.length === 0 ? null : this.text(iconText, fc, CreoleMode.NO_CREOLE);

    this.content = this.withDescription(this.withIcon(this.text(entry.getName(), fc, CreoleMode.NO_CREOLE)), entry);

    if (entry.getColor() !== null) {
      this.background = colorSet.getColorOrNull(entry.getColor() as string);
      this.border = this.background;
    } else {
      const back = style.value('BackGroundColor').asColor(colorSet);
      this.background = back === undefined || (back instanceof HColorSimple && back.isTransparent()) ? undefined : back;
      this.border = style.value('LineColor').asColor(colorSet);
    }
  }

  private styleOf(name: 'folder' | 'file' | 'description', entry: FEntry): Style {
    const signature = StyleSignatureBasic.of('root', 'element', 'filesDiagram', name);
    const style = withStereotypes(signature, entry.getStereotypes()).getMergedStyle(
      this.skinParam.getCurrentStyleBuilder(),
    );
    // A files diagram always has a style builder (`getMergedStyle` answers undefined only without one).
    return style as Style;
  }

  private withIcon(name: TextBlock): TextBlock {
    if (this.icon === null) return name;
    return TextBlockUtils.mergeLR(
      this.icon,
      TextBlockUtils.mergeLR(TextBlockUtils.empty(ICON_GAP, 0), name, VerticalAlignment.CENTER),
      VerticalAlignment.CENTER,
    );
  }

  private withDescription(block: TextBlock, entry: FEntry): TextBlock {
    const description = entry.getDescription();
    if (description === null || description.length === 0) return block;
    const fc = this.styleOf('description', entry).getFontConfiguration(this.skinParam.getIHtmlColorSet());
    const desc = this.text(description, fc, CreoleMode.FULL);
    return TextBlockUtils.mergeLR(
      block,
      TextBlockUtils.mergeLR(TextBlockUtils.empty(DESCRIPTION_GAP, 0), desc, VerticalAlignment.CENTER),
      VerticalAlignment.CENTER,
    );
  }

  private text(s: string, fc: StyleFontConfiguration, mode: CreoleMode): TextBlock {
    const ctx = {
      fontConfiguration: bridgeFontConfiguration(fc),
      spriteContainer: this.skinParam,
      atomOps: this.skinParam.atomOps,
    };
    return Display.getWithNewlines(this.skinParam.getPragma(), s).create7(ctx, HorizontalAlignment.LEFT, mode);
  }

  /** @see FilesListing.java:221-224 */
  getIconCenter(stringBounder: StringBounder): number {
    if (this.icon === null) return INDENT / 2 - CONNECTOR_GAP;
    return this.icon.calculateDimension(stringBounder).getWidth() / 2;
  }

  /** @see FilesListing.java:226-229 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return this.content.calculateDimension(stringBounder);
  }

  /** @see FilesListing.java:231-246 */
  drawU(ug: UGraphic): void {
    if (this.background !== undefined) {
      const dim = this.calculateDimension(ug.getStringBounder());
      const rect = URectangle.build(dim.getWidth() + 2 * BOX_MARGIN, dim.getHeight() + ROW_SPACING).rounded(
        BOX_ROUND_CORNER,
      );
      let ugBox = ug.apply(new Back(paintOf(this.background))).apply(new UTranslate(-BOX_MARGIN, -ROW_SPACING / 2));
      ugBox = ugBox.apply(new Fore(paintOf(this.border ?? this.background)));
      ugBox.draw(rect);
    }
    this.content.drawU(ug);
  }

  /**
   * The note: a creole sheet of its lines in the `root.element.filesDiagram.note` style's font, inside an `Opale`
   * of that style's colours, shadow and stroke.
   * @see FilesListing.java:248-262
   */
  private createOpale(note: readonly string[]): Opale {
    const skinParam = this.skinParam;
    const style = StyleSignatureBasic.of('root', 'element', 'filesDiagram', 'note').getMergedStyle(
      skinParam.getCurrentStyleBuilder(),
    ) as Style;
    const colorSet = skinParam.getIHtmlColorSet();
    const fc = FontConfiguration.create(
      style.getUFont(),
      style.value('FontColor').asColor(colorSet),
      style.value('HyperLinkColor').asColor(colorSet),
      skinParam.useUnderlineForHyperlink(),
      skinParam.getTabSize(),
    );
    const borderColor = style.value('LineColor').asColor(colorSet);
    const noteBackgroundColor = style.value('BackGroundColor').asColor(colorSet);

    // `SheetBuilder#createSheet` widens to `Sheet<StripeAtom>`; `SheetBlock1` takes the narrow `Sheet`
    // (the same cast as `gantt/draw/AbstractTaskDraw.ts#getOpaleNote`, a pre-existing seam between those two files).
    const sheet = skinParam
      .sheet(bridgeFontConfiguration(fc), skinParam.getDefaultTextAlignment(HorizontalAlignment.LEFT), CreoleMode.FULL)
      .createSheet(Display.create(note)) as unknown as Sheet<CreoleAtom>;
    const sheet1 = new SheetBlock1(sheet, LineBreakStrategy.NONE, skinParam.atomOps, skinParam.getPadding());
    return new Opale(
      style.getShadowing(),
      paintOf(borderColor),
      paintOf(noteBackgroundColor),
      sheet1,
      false,
      style.getStroke(),
    );
  }
}
