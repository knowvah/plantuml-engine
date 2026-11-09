/**
 * ONE port of `EntityImageNoteLink`'s dimension -- collapses the FOUR former
 * copies (`class/class-note-link-box.ts:70`, `state/state-dot-graph.ts:172`,
 * `state/state-composite-edge-label.ts:49` -- the last two byte-identical
 * private duplicates -- and `description/link-note-box.ts:58`, which already
 * routed its padding through `core/rose-note-dim.ts#roseNoteDim`) onto one
 * function. `shared-seam-extraction` (SI27) T6, D1.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageNoteLink.java
 *   -- constructor (`:61-66`) builds a `ComponentRoseNote` via
 *   `Rose#createComponentNote`; `calculateDimensionSlow` (`:69-73`) is
 *   `getPreferredWidth`/`getPreferredHeight`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/rose/ComponentRoseNote.java
 *   -- `getPreferredWidth`/`getPreferredHeight` (`:81-90`) = text dim + 2 *
 *   paddingX/Y (both 5, `Rose.java:65-66`); the text dim itself carries
 *   Opale's 6/15/5 STYLE padding (`ComponentRoseNote`'s own `super(...)`,
 *   `:66-70`). Full derivation, incl. why the two pad separately, lives on
 *   `core/rose-note-dim.ts#roseNoteDim` -- this module reuses it rather than
 *   re-deriving it.
 *
 * Upstream always measures the note's `Display` through a REAL creole
 * `TextBlock` (`AbstractTextualComponent#getTextWidth`/`getTextHeight`) --
 * there is no "raw split" in the Java. This port's three per-engine callers
 * built that PURE (un-padded) text dimension three different ways before
 * this task: class's `note-layout-measure.ts#measureNote` (creole/atom/
 * sprite-aware, the richest), description's `leaf-sizing.ts#buildNoteBody`
 * (its own creole block), and state's raw `text.split('\n')` + flat
 * `measurer.measure` per line (no creole scan at all -- an approximation,
 * not upstream's true behavior, but the one no state `note on link` corpus
 * fixture's text exercises, so it is preserved byte-identically rather than
 * "fixed" here -- CLAUDE.md "preserve information-carrying output").
 *
 * This function owns the SHARED half: padding (`roseNoteDim`) plus,
 * absent a richer strategy, state's naive per-line measurement. A caller
 * with its own creole engine (class, description) supplies a `pureText`
 * strategy closing over that engine's real note-body builder and (for
 * class) its sprite registry -- the "optional sprites/creole handling" the
 * class copy's signature needed. `font.family` is `theme.fontFamily` for
 * those two callers; state passes its own resolved `fontFamily` directly,
 * with no `Theme` in hand at all -- both are the SAME `{ family: string }`
 * shape, so omitting `pureText` reproduces the state copies' former
 * fontFamily-only call exactly.
 */
import type { StringMeasurer } from '../../measurer.js';
import { roseNoteDim, type RoseNoteDim } from '../../rose-note-dim.js';
import { NOTE_FONT_SIZE } from '../../klimt/font/FontParam.js';
import type { Colors } from '../../abel/Colors.js';
import { BodyFactory } from '../../cucadiagram/BodyFactory.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import type { Display } from '../../klimt/creole/Display.js';
import { UGraphicStencil } from '../../klimt/drawing/UGraphicStencil.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockMemoized } from '../../klimt/shape/TextBlockMemoized.js';
import { TextBlockUtils } from '../../klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UStroke } from '../../klimt/UStroke.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Style } from '../../style/Style.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { StyleBuilder } from '../../style/StyleBuilder.js';
import { ValueNull } from '../../style/ValueNull.js';
import { ShapeType } from '../ShapeType.js';
import type { LeafImageSkinParam } from './AbstractEntityImage.js';
import { OPALE_CORNERSIZE } from './Opale.js';
import { corner, polygonNormal } from './OpalePolygons.js';
import { applyBack, applyFore, colorsGetColor, mergedStyleOf } from './leaf-image-support.js';

/** The un-padded ("pure") note-body dimension a caller's own text engine
 *  produces -- `roseNoteDim`'s own operand shape, restated here as this
 *  module's public strategy contract. */
export interface PureNoteTextDim {
  readonly width: number;
  readonly height: number;
}

/**
 * A caller-supplied pure-text strategy, e.g. class's `measureNote` (atom/
 * sprite-aware) or description's `buildNoteBody`, closed over whatever
 * theme/sprite context the caller already resolved. Omitted by state, which
 * has no creole engine of its own to plug in -- see this module's doc
 * comment for why the naive default is the RIGHT reproduction, not a
 * placeholder.
 */
export type PureNoteTextMeasurer = (text: string, measurer: StringMeasurer) => PureNoteTextDim;

/**
 * State's own former measurement (`state-dot-graph.ts:172-181`,
 * `state-composite-edge-label.ts:49-58`, byte-identical duplicates before
 * this task): split on literal `\n` only (no creole scan, no block/bullet/
 * table handling), measure each line RAW at `{ family, size: NOTE_FONT_SIZE
 * }`, width = the widest line, height = `lines.length * NOTE_FONT_SIZE`.
 * Kept verbatim as the default strategy so the fontFamily-only call shape
 * reproduces byte-identically (acceptance criterion 3).
 */
function naivePureTextDim(text: string, font: { readonly family: string }, measurer: StringMeasurer): PureNoteTextDim {
  const lines = text.split('\n');
  let maxW = 0;
  for (const ln of lines) {
    maxW = Math.max(maxW, measurer.measure(ln, { family: font.family, size: NOTE_FONT_SIZE }).width);
  }
  return { width: maxW, height: lines.length * NOTE_FONT_SIZE };
}

/**
 * `EntityImageNoteLink`'s real dimension -- one body for every caller (see
 * this module's doc comment for the full derivation and the naive-default
 * rationale). `font.family` is the note text's font family; `pureText`, when
 * supplied, replaces the naive default with the caller's own creole-aware
 * measurement (class, description) -- omit it for state's former shape.
 */
export function measureLinkNoteDim(
  text: string,
  font: { readonly family: string },
  measurer: StringMeasurer,
  pureText?: PureNoteTextMeasurer,
): RoseNoteDim {
  const pure = pureText === undefined ? naivePureTextDim(text, font, measurer) : pureText(text, measurer);
  return roseNoteDim(pure);
}

/** `Rose.java:65-66`: the `paddingX`/`paddingY` `Rose#createComponentNote` passes. */
const ROSE_NOTE_PADDING = 5;
/** `ComponentRoseNote.java:66-70`, text not centred: `topRightBottomLeft(5, 15, 5, 6)`. */
const PAD_TOP = 5;
const PAD_RIGHT = 15;
const PAD_BOTTOM = 5;
const PAD_LEFT = 6;

/**
 * `EntityImageNoteLink`: the `note on link` block `SvekEdge` merges with the label and draws beside it. It wraps the
 * `ComponentRoseNote` `Rose#createComponentNote` builds from `ComponentType.NOTE`'s signature
 * `{root, element, sequenceDiagram, note}` (`ComponentType.java:98-99`); the component's `getPreferredWidth/Height`
 * and `drawInternalU` are inlined here (the component has no other caller in the shared core). `position` is
 * `noteTextAlignment`'s answer, null by default (`Rose.java:110-111`): not the centred branch.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageNoteLink.java:57-77
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/rose/ComponentRoseNote.java:56-133
 */
export class EntityImageNoteLink extends TextBlockMemoized {
  private readonly style: Style;
  private readonly textBlock: TextBlock;
  private readonly colors: Colors;
  private readonly skinParam: LeafImageSkinParam;

  /** @see EntityImageNoteLink.java:61-66 */
  constructor(note: Display, colors: Colors, skinParam: LeafImageSkinParam, styleBuilder: StyleBuilder) {
    super();
    this.colors = colors;
    this.skinParam = skinParam;
    const signature = StyleSignatureBasic.of('root', 'element', 'sequenceDiagram', 'note');
    this.style = mergedStyleOf(signature, styleBuilder);
    // `display.withoutStereotypeIfNeeded(style)` (`AbstractTextualComponent.java:80`): only a style that hides
    // stereotypes changes the display, and the `Display` port has no stereotype-less copy yet.
    const showStereotype = this.style.value('ShowStereotype');
    if (!(showStereotype instanceof ValueNull) && !showStereotype.asBoolean())
      throw new Error('unported: ShowStereotype false on a note on link (Display#withoutStereotypeIfNeeded)');
    if (note.size() === 1 && note.get(0).toString().length === 0) this.textBlock = TextBlockUtils.empty(0, 0);
    else
      this.textBlock = BodyFactory.create3(
        note,
        {
          skinParam,
          align: this.style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT,
          titleConfig: bridgeFontConfiguration(this.style.getFontConfiguration(skinParam.getIHtmlColorSet())),
          lineBreakStrategy: this.style.wrapWidth(),
        },
        {
          defaultThickness: this.style.value('LineThickness').asDouble(),
          minimumWidth: this.style.value('MinimumWidth').asDoubleDefaultTo(0),
        },
        skinParam.atomOps,
      );
  }

  /** `getTextWidth`: the text plus `getOldPaddingX1/X2`. @see AbstractTextualComponent.java:100-102 */
  private getTextWidth(stringBounder: StringBounder): number {
    return this.textBlock.calculateDimension(stringBounder).getWidth() + PAD_LEFT + PAD_RIGHT;
  }

  /** @see AbstractTextualComponent.java:104-107 */
  private getTextHeight(stringBounder: StringBounder): number {
    return this.textBlock.calculateDimension(stringBounder).getHeight() + PAD_TOP + PAD_BOTTOM;
  }

  /** `symbolContext.getDeltaShadow()`. @see Style.java:277 */
  private deltaShadow(): number {
    return this.style.getShadowing();
  }

  /** @see EntityImageNoteLink.java:69-73, ComponentRoseNote.java:81-90 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const height = this.getTextHeight(stringBounder) + 2 * ROSE_NOTE_PADDING + this.deltaShadow();
    const width = this.getTextWidth(stringBounder) + 2 * ROSE_NOTE_PADDING + this.deltaShadow();
    return new XDimension2D(width, height);
  }

  /** `comp.drawU(ug, Area(dim), ...)`: `AbstractComponent#drawU` translates by the padding, then
   *  `ComponentRoseNote#drawInternalU` with `diffX = 0`. @see ComponentRoseNote.java:97-133, AbstractComponent.java:142-149 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const padded = ug.apply(new UTranslate(ROSE_NOTE_PADDING, ROSE_NOTE_PADDING));
    const textHeight = Math.trunc(this.getTextHeight(stringBounder));
    const x2 = Math.trunc(this.getTextWidth(stringBounder));
    const roundCorner = this.style.value('RoundCorner').asInt();
    const set = this.skinParam.getIHtmlColorSet();
    const back = colorsGetColor(this.colors, this.style, 'BackGroundColor', set);
    const fore = colorsGetColor(this.colors, this.style, 'LineColor', set);
    const polygon = polygonNormal(x2, textHeight, roundCorner, OPALE_CORNERSIZE);
    polygon.setDeltaShadow(this.deltaShadow());
    const ug1 = applyFore(applyBack(padded, back), fore).apply(this.style.getStroke());
    ug1.draw(polygon);
    ug1.draw(corner(x2, roundCorner, OPALE_CORNERSIZE));
    const stencil = {
      getStartingX: (_sb: StringBounder, _y: number): number => 0,
      getEndingX: (sb: StringBounder, _y: number): number => this.getTextWidth(sb),
    };
    const ug2 = UGraphicStencil.create(ug1, stencil, UStroke.simple());
    this.textBlock.drawU(ug2.apply(new UTranslate(PAD_LEFT, PAD_TOP)));
  }

  /** @see EntityImageNoteLink.java:79-81 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }
}
