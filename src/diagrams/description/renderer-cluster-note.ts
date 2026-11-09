/**
 * renderer-cluster-note.ts -- the `!pragma kermor on` group note `Cluster#drawU` draws before the cluster's own
 * symbol: `getCucaNote(Position.TOP|BOTTOM).drawU(ug.apply(UTranslate.point(xyNote...)))`
 * (`Cluster.java:302-307`). `getCucaNote` (`Cluster.java:393-399`) builds an `EntityImageNoteLink` over the note's
 * display and its own `Colors` -- the same class, signature (`ComponentType.NOTE`) and draw as the `note on link`
 * block, so this delegates to `link-note-block.ts#buildLinkNoteBlock` -- NOT the `EntityImageNote` the `note` leaf
 * draws (`renderer-note.ts`): no entity group, and the fold is stroked like the outline.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:393-399
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageNoteLink.java:61-76
 */
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { Theme } from '../../core/theme.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';
import type { KermorNoteGeo } from './layout-helpers.js';
import { buildLinkNoteBlock } from './link-note-block.js';

/** `new EntityImageNoteLink(note.getDisplay(), note.getColors(), ...)` drawn at `note.x/y`. */
export function drawKermorGroupNote(
  ug: UGraphic,
  note: KermorNoteGeo,
  theme: Theme,
  sprites: SpriteRegistry | undefined,
): void {
  buildLinkNoteBlock(note.text, theme, sprites, note.color).drawU(ug.apply(new UTranslate(note.x, note.y)));
}
