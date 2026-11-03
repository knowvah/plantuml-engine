import type { Tile } from '../tiles/tile.js';
import type { Out } from './tile-coordinates.js';
import { applyOutColor } from './tile-layout-inlabel.js';

/** The tiles that hand their first child's `getInLinkRendering()` on: `FtileWithNoteOpale.java:251`,
 *  `FtileWithNotes.java:222`, `FtileGroup.java:124`, `FtileAssemblySimple.java:114` (a list is `assembly(tile1, ..)`),
 *  and the `FtileDecorate`/`FtileMarged` wrappers (no tile of ours). */
const IN_LINK_DELEGATES: ReadonlySet<string> = new Set([
  'gtile-top-down',
  'gtile-note-opale',
  'gtile-with-notes',
  'gtile-group',
  'gtile-partition',
]);

/**
 * Whether `tile`'s `getInLinkRendering()` is the `arrow` signature's rainbow: only an action box carries one
 * (`FtileBox.java:158`; `FtileBoxOld.java:160`, `FtileBoxEmoji.java:117`). Every other tile inherits
 * `AbstractFtile.java:84-86`'s `LinkRendering.none()`, and so does an empty list (`InstructionList.java:136-143`
 * builds `FtileEmpty`). An inline arrow ahead of the tile wraps it in `FtileDecorateIn`, whose own rendering replaces
 * the box's (`InstructionList.java:150-151`, `VCompactFactory.java:212-214`): a label with no colour leaves that
 * rainbow empty. A killed box, notes included, is wrapped in `FtileKilled` last (`InstructionSimple.java:109-113`),
 * which forwards nothing.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/ParallelBuilderMerge.java:80-82
 */
export function carriesArrowRainbow(tile: Tile | undefined): boolean {
  if (tile === undefined || tile.inLabel !== undefined || tile.killed === true) return false;
  if (tile.kind === 'gtile-action') return true;
  if (!IN_LINK_DELEGATES.has(tile.kind)) return false;
  return carriesArrowRainbow((tile as Tile & { readonly children: readonly Tile[] }).children[0]);
}

/**
 * `ParallelBuilderMerge#doStep1`'s connection, just pushed: `tmp.getInLinkRendering().getRainbow(def)` with `def` the
 * `activity` signature's rainbow (`:80-82`). A rainbow of the branch's own wins (`LinkRendering.java:77-82`): the
 * inline colour {@link applyInLabel} already wrote, or the action box's `arrow` rainbow.
 */
export function markMergeIn(out: Out, branch: Tile): void {
  const edge = out.edges[out.edges.length - 1]!;
  if (edge.color === undefined && !carriesArrowRainbow(branch)) edge.lineSName = 'activity';
}

/**
 * `ParallelBuilderMerge#doStep2`'s connection, just pushed: `tmp.getOutLinkRendering().getRainbow(def)` (`:110-111`).
 * Only a trailing inline arrow has a rainbow of its own (`FtileDecorateOut`, `InstructionList.java:162-163`).
 */
export function markMergeOut(out: Out, branch: Tile): void {
  applyOutColor(out, branch);
  const edge = out.edges[out.edges.length - 1]!;
  if (edge.color === undefined) edge.lineSName = 'activity';
}
