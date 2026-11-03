/**
 * link-note-block.ts -- the `note on link` block `SvekEdge` merges into a description link's label and draws with it:
 * `EntityImageNoteLink`, a `TextBlock` whose `drawU` is `comp.drawU(ug, new Area(calculateDimension(...)), ...)` over a
 * `ComponentRoseNote` (`EntityImageNoteLink.java:61-76`). Its own box is the preferred size, so the polygon never
 * stretches (`ComponentRoseNote.java:109-113`).
 *
 * The signature is `ComponentType.NOTE`'s `{root, element, sequenceDiagram, note}` (`EntityImageNoteLink.java:63-64`,
 * `ComponentType.java:98-99`), not the document's: `style-element-scope.ts` writes it to {@link LINK_NOTE_BUCKET}, read
 * before the free note's `note` bucket (D2a). Same draw as `renderer-cluster-note.ts#drawKermorGroupNote`, which reads
 * `note` for the same upstream class (follow-on, left as is).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageNoteLink.java:61-76
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/rose/ComponentRoseNote.java:81-133
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/AbstractComponent.java:142-149
 */
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { Theme } from '../../core/theme.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { Back } from '../../core/klimt/Back.js';
import { Fore } from '../../core/klimt/Fore.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { UGraphicStencil } from '../../core/klimt/drawing/UGraphicStencil.js';
import { parseSvgPath } from '../../core/klimt/sprite/SvgPath.js';
import { opaleCorner } from '../../core/svek/image/Opale.js';
import { LINK_NOTE_BUCKET } from '../../core/style-element-scope.js';
import type { DescriptionNodeGeo } from './layout-helpers.js';
import { opalePolygonNormal } from './renderer-note-opale.js';
import { buildNoteBlock, resolveNotePaints } from './renderer-note.js';

/** `Rose.java:65-66`: the `paddingX`/`paddingY` every `ComponentRoseNote` is built with. */
const ROSE_NOTE_PADDING = 5;
/** `ComponentRoseNote.java:66-70`, default (non-CENTER) text alignment: `topRightBottomLeft(5, 15, 5, 6)`. */
const PAD_TOP = 5;
const PAD_RIGHT = 15;
const PAD_BOTTOM = 5;
const PAD_LEFT = 6;

/** `resolveNotePaints` reads only `color` and the stereotypes; `EntityImageNoteLink` passes the note's own `Colors`. */
const PAINT_PROBE: DescriptionNodeGeo = {
  id: 'note-on-link',
  symbol: 'note',
  display: '',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  children: [],
};

/** The theme as `ComponentType.NOTE`'s signature sees it: the {@link LINK_NOTE_BUCKET} bucket, where the style set one. */
function linkNoteTheme(theme: Theme): Theme {
  const own = theme.colors.elements?.[LINK_NOTE_BUCKET];
  if (own === undefined) return theme;
  const elements = { ...theme.colors.elements, note: { ...theme.colors.elements?.['note'], ...own } };
  return { ...theme, colors: { ...theme.colors, elements } };
}

/** `EntityImageNoteLink` over `display`: preferred size (`getPreferredWidth/Height`) and the `ComponentRoseNote` draw. */
export function buildLinkNoteBlock(
  display: string,
  theme: Theme,
  sprites: SpriteRegistry | undefined,
  color?: string,
): TextBlock {
  const noteTheme = linkNoteTheme(theme);
  const paints = resolveNotePaints(color === undefined ? PAINT_PROBE : { ...PAINT_PROBE, color }, noteTheme);
  const body = buildNoteBlock(display, noteTheme, sprites);
  return {
    calculateDimension(stringBounder: StringBounder): XDimension2D {
      const pure = body.calculateDimension(stringBounder);
      // `getTextWidth`/`getTextHeight` (`AbstractTextualComponent.java:106-114`) plus `2 * getPaddingX/Y` (`:81-90`).
      return new XDimension2D(
        pure.getWidth() + PAD_LEFT + PAD_RIGHT + 2 * ROSE_NOTE_PADDING,
        pure.getHeight() + PAD_TOP + PAD_BOTTOM + 2 * ROSE_NOTE_PADDING,
      );
    },
    drawU(ug: UGraphic): void {
      const pure = body.calculateDimension(ug.getStringBounder());
      const textWidth = pure.getWidth() + PAD_LEFT + PAD_RIGHT;
      // `drawInternalU` (`ComponentRoseNote.java:101-107`): `(int) getTextHeight`, `(int) getTextWidth`.
      const textHeight = Math.trunc(pure.getHeight() + PAD_TOP + PAD_BOTTOM);
      const x2 = Math.trunc(textWidth);
      const stroked = ug
        .apply(new UTranslate(ROSE_NOTE_PADDING, ROSE_NOTE_PADDING))
        .apply(new Back(paints.back))
        .apply(new Fore(paints.border))
        .apply(paints.stroke);
      stroked.draw(parseSvgPath(opalePolygonNormal(x2, textHeight), UTranslate.none()));
      stroked.draw(parseSvgPath(opaleCorner({ x: 0, y: 0 }, x2), UTranslate.none()));
      const stencil = { getStartingX: (): number => 0, getEndingX: (): number => textWidth };
      const textUg = UGraphicStencil.create(stroked, stencil, UStroke.simple());
      body.drawU(textUg.apply(new UTranslate(PAD_LEFT, PAD_TOP)));
    },
  };
}
