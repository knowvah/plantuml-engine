/**
 * hnh T2a (#204, D1): a class/object `NOTE` leaf's hidden flag, carried onto
 * its {@link NoteGeo} so the renderer can draw it under `UHidden` (nothing).
 */
import type { NoteGeo } from './note-layout-types.js';

/**
 * Marks every `'note'` geo whose id is in `hiddenIds` as `hidden: true`.
 * `hiddenIds` is `computeHiddenIds`' set, which already gives a note with
 * exactly one non-invisible link to a non-note its host's own flag
 * (`CucaDiagram#isHidden`, `net/atmp/CucaDiagram.java:778-794`,
 * `isNoteWithSingleLinkAttachedTo` `:835-853`) and lets any other note fold
 * `hide`/`show` by itself. `SvekResult#drawU` then draws the node through
 * `UHidden` (`svek/SvekResult.java:82-90`).
 *
 * A `'tips'` geo is left as it is: the brief's D2 keeps a member tip drawing
 * on a hidden host (`isNoteWithSingleLinkAttachedTo` returns null for
 * anything but `LeafType.NOTE`, `CucaDiagram.java:836-837`).
 * @see ~/git/plantuml/src/main/java/net/atmp/CucaDiagram.java#isHidden
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekResult.java#drawU
 */
export function markHiddenNotes(notes: readonly NoteGeo[], hiddenIds: ReadonlySet<string>): NoteGeo[] {
  return notes.map((n) => (n.kind === 'note' && hiddenIds.has(n.id) ? { ...n, hidden: true as const } : n));
}
