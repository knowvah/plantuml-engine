/**
 * Same-footprint `&` notes stack (plantuml#2883, upstream `2c679666164`):
 * `NoteTile`'s constructor (`teoz/NoteTile.java:100-133`) aligns a `& note` on
 * the run's contact line unless an earlier note in the same `&` run already
 * claimed its footprint -- then it falls back to `YGauge.createPropagating`,
 * stacking below everything drawn so far in the run while still handing the
 * contact line on to a later sibling.
 *
 * The footprint is `(livingSpace1, note.getPosition())`: `note left of U` and
 * `note right of U` share `U` but extend away from it in opposite directions,
 * so only two notes on the same side (or both `over`) collide. The keys ride
 * on the gauge (`YGauge#noteAnchorsInRun`); only a `NoteTile` writes them, so
 * any other tile ends the run.
 *
 * @see net/sourceforge/plantuml/sequencediagram/teoz/NoteTile.java:100-133
 * @see net/sourceforge/plantuml/sequencediagram/teoz/YGauge.java
 */
import type { NoteEvent, SequenceEvent } from './ast.js';
import {
  createParallel,
  createPropagating,
  createWithContact,
  withNoteAnchorsInRun,
  type TileMetrics,
  type YGauge,
} from './sequence-y-gauge.js';

/**
 * `Arrays.asList(livingSpace1, note.getPosition())`: the note's first
 * participant (`TileBuilder` builds a `NoteTile` on `note.getParticipant()`)
 * and its `NotePosition`, `OVER_SEVERAL` for an `over` spanning two or more.
 */
export function noteFootprint(note: NoteEvent): string {
  const position = note.position === 'over' && note.participants.length > 1 ? 'OVER_SEVERAL' : note.position;
  return `${note.participants[0] ?? ''}\u0000${position}`;
}

/** Whether a `& note` meets a footprint the run already claimed
 *  (`anchorsInRun != null && anchorsInRun.contains(footprint)`). */
export function stacksInRun(note: NoteEvent, anchors: ReadonlySet<string> | undefined): boolean {
  return note.parallel === true && anchors?.has(noteFootprint(note)) === true;
}

/** The run's footprints once `note` joins it as a parallel member: the set
 *  grown by its footprint (`new HashSet<>(anchorsInRun)` + `add`). */
export function grownAnchors(anchors: ReadonlySet<string> | undefined, note: NoteEvent): ReadonlySet<string> {
  return new Set([...(anchors ?? []), noteFootprint(note)]);
}

/**
 * A standalone note's gauge (`NoteTile.java:119-133`): stacked
 * (`createPropagating`) when its footprint is taken, else `createParallel`
 * for a `&` note or `createWithContact` (raised by the `&` members that will
 * share its line, {@link createWithContact}'s `raisedBy`), each carrying the
 * run's footprints on.
 */
export function noteTileGauge(
  currentY: YGauge,
  note: NoteEvent,
  metrics: TileMetrics,
  raisedBy: readonly number[],
): YGauge {
  const anchors = currentY.noteAnchorsInRun;
  if (stacksInRun(note, anchors)) return withNoteAnchorsInRun(createPropagating(currentY, metrics.height), anchors!);
  if (note.parallel === true)
    return withNoteAnchorsInRun(createParallel(currentY, metrics), grownAnchors(anchors, note));
  return withNoteAnchorsInRun(createWithContact(currentY, metrics, raisedBy), new Set([noteFootprint(note)]));
}

/** The footprints a contact tile's gauge hands on, for the look-ahead that
 *  raises a run's head: a lone note's ({@link noteTileGauge}); none after a
 *  message, exo message, `Notes` group (a `NotesTile`), or any other tile. */
export function anchorsAfter(
  tile: SequenceEvent,
  groups: ReadonlyMap<NoteEvent, unknown>,
  anchors: ReadonlySet<string> | undefined,
): ReadonlySet<string> | undefined {
  if (tile.kind !== 'note' || groups.has(tile)) return undefined;
  return tile.parallel === true ? grownAnchors(anchors, tile) : new Set([noteFootprint(tile)]);
}
