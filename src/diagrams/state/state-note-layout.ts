/**
 * Note-on-entity DOT node + connector-edge construction for state diagrams
 * (mission A4 Phase L iter 9) — shared by both the flat (state-dot-graph.ts)
 * and composite (state-composite-pass.ts) DOT builders. A `StateDiagramAST`'s
 * `notes` array is diagram-wide (no State-tree membership of its own), so
 * this module is factored out of both consumers rather than duplicated —
 * unlike class/state's D1 duplication (which is about NOT sharing across
 * diagram TYPES), this is sharing within state's own two DOT-building paths.
 *
 * Mirrors class engine's `../class/note-layout.ts` (same upstream svek
 * mechanism — `EntityImageNote`/`Cluster` note handling has no diagram-type
 * branch) with two state-specific additions:
 *  (1) placement is PER SCOPE (`StateNote.scopeId`) — a state diagram's
 *      notes route into whichever svek pass owns their declaring scope,
 *      unlike class's single flat pass.
 *  (2) note-position rotation under `left to right direction`
 *      (`Position.withRankdir`, utils/Position.java:49-66): RIGHT->BOTTOM,
 *      LEFT->TOP, BOTTOM->RIGHT, TOP->LEFT.
 *
 * `Entity.isAutarkic` (abel/Entity.java:706-708) iterates
 * `this.diagram.getLinks()` unconditionally, and a note-to-host `Link` is one
 * of them: `classifyDiagram` takes the notes (dss T3f).
 *
 * @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnEntity.java
 *      (leaf + Link creation: dashed decor, `LinkArg.noDisplay`, no arrowheads)
 * @see ~/git/plantuml/.../command/note/CommandFactoryNote.java (freestanding)
 */

import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { makeAtomImageResolverFor } from '../../core/creole-atoms-image-resolver.js';
import type { NotePosition, StateNote } from './ast.js';
import type { Theme } from '../../core/theme.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { DotInputNode } from '../../core/graph-layout.js';
import type { FontConfiguration, FontStyle } from '../../core/klimt/shape/UText.js';
import { buildNoteBody } from '../../core/svek/image/leaf-sizing.js';
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import type { PureNoteTextDim } from '../../core/svek/image/EntityImageNoteLink.js';
// SI30 T5: the SAME per-run size/dy/tab-stop conversion the header/body
// path uses -- one core-vs-state-local seam, not a second one for notes
// (`state-sizing-creole.ts#toStyledLine`'s own doc comment).
import { stateCreoleBlock, type StateStyledTextLine } from './state-sizing-creole.js';
import type { StateUrl } from './state-geo-types.js';
import { stateUrlOf } from './state-sizing.js';

/**
 * mission G4 S10: `Opale.java`'s real `EntityImageNote`/`Opale` margin
 * constants (`marginX1=6`/`marginX2=15`/`marginY=5`, `Opale.java:53`'s own
 * `cornersize=10` doubles as the SAME allowance the pre-S10 `NOTE_HPAD*2 +
 * NOTE_FOLD` approximation was reaching for, imprecisely) — jar-verified
 * against `labono-83-nega255` (single line, `textLength=108.4688` ->
 * `width=129.4688 === 108.4688 + 6 + 15` exactly) and `gedude-95-subi666`
 * (2 lines, `height=36 === 2*13 + 2*5` exactly, confirming NO `*1.4`
 * line-height multiplier — a note's own `BodyFactory`/`Sea` line stack uses
 * the PLAIN font size per line, unlike this port's other multi-line body
 * conventions elsewhere). The note's own font is a FIXED 13pt
 * (`plantuml.skin`'s `note { FontSize 13 }` default), NOT `theme.fontSize`
 * (the diagram's general 14pt body font) — the pre-S10 formula measured at
 * the WRONG size entirely, jar-verified via `labono`'s own `font-size="13"`.
 * `<style>`/`skinparam noteFontSize` overrides are a separate, unimplemented
 * cascade (mirrors class engine's `NOTE_FONT_SIZE` default-only precedent
 * before its own G2 N39) — not modeled here, `plans/g4-state-svg/ledger.md`
 * S10 queue.
 */
import { NOTE_FONT_SIZE } from '../../core/klimt/font/FontParam.js';
import { OPALE_MARGIN_X1 as NOTE_MARGIN_X1 } from '../../core/svek/image/Opale.js';
import { OPALE_MARGIN_X2 as NOTE_MARGIN_X2 } from '../../core/svek/image/Opale.js';
import { OPALE_MARGIN_Y as NOTE_MARGIN_Y } from '../../core/svek/image/Opale.js';

/** One measured line's own styled runs (SI30 T5: {@link StateStyledTextLine},
 *  the SAME per-run size/dy shape the header/body path draws with) — the
 *  DOT-sizing consumer (`buildScopeParts`) only reads the aggregate
 *  `width`/`height` below. `text`/`runs` are the RENDER-time approximation
 *  (see {@link buildRenderLines}'s own doc comment) — the authoritative
 *  content dimension the box is actually sized to is `NoteMeasurement.width`/
 *  `.height` below (T7, SI28 `findings/note.md`), not a sum/max of these. */
interface NoteMeasurement {
  readonly lines: readonly StateStyledTextLine[];
  readonly width: number;
  readonly height: number;
  /** stdd T3d -- see {@link NoteSpec.url}; built with the theme's `topurl` where the theme is at hand. */
  readonly url?: StateUrl;
}

/** `note { FontSize 13 }`'s plain style set (`plantuml.skin` default,
 *  `EntityImageNote.java` never applies bold/italic/underline to the note's
 *  OWN base font — per-run styling comes from creole markup INSIDE the body,
 *  not the base `FontConfiguration`) — same empty-set precedent
 *  `leaf-sizing.ts`'s own (private, description-engine) `NOTE_FONT_STYLES`
 *  constant already establishes for the identical jar font. */
const NOTE_FONT_STYLES: ReadonlySet<FontStyle> = new Set();

/**
 * SI28 `findings/note.md` (fatupo-62-bemu777, xeziki-47-zomo866#a): the note
 * body's CONTENT dimension now routes through `buildNoteBody`
 * (`core/svek/image/leaf-sizing.ts`) — the SAME `BodyFactory.create3` ->
 * `BodyEnhanced2` real creole/table pipeline `EntityImageNote.java:114-118`
 * itself calls (`AtomTable.java:90-96`'s column/row-max grid box,
 * `StripeTable.java:82-84`'s `AtomWithMargin(table,2,2)` for a `|=…|` table
 * body; `StripeSimple`/`CreoleParser`'s `<color:…>` tag recognizer for plain
 * styled text) — replacing the RAW `text.split('\n')` + literal
 * `measurer.measure` model that measured pipe-table syntax and `<color:…>`
 * tags as literal glyphs. `leaf-sizing.ts`'s own doc comment already
 * jar-pins this exact call shape for the description engine's notes
 * (`"Hello" 50.74x23`, unchanged from the old flat model for markup-free
 * text — the swap is a NO-OP for every plain note, only markup/table bodies
 * move); this task reuses it rather than re-deriving the same pipeline a
 * second time inside `diagrams/state/`, per D1's "one core seam" principle
 * (this seam sits in `core/`, not the class engine, so no D8 cross-engine
 * import). Margins stay state's own `Opale.java`-derived constants (module
 * doc comment above) — `buildNoteBody`'s returned `TextBlock` is the PURE
 * (un-padded) content box, `EntityImageNote.java:176-181`'s own split.
 */
export function measureNote(text: string, theme: Theme, measurer: StringMeasurer): NoteMeasurement {
  const pure = measureNotePureText(text, theme.fontFamily, measurer, theme.sprites);
  return {
    lines: buildRenderLines(text, theme, measurer),
    width: pure.width + NOTE_MARGIN_X1 + NOTE_MARGIN_X2,
    height: pure.height + NOTE_MARGIN_Y * 2,
  };
}

/**
 * The note body's PURE (un-padded) content dimension — the shared half of
 * {@link measureNote} above. Exported (not yet consumed elsewhere) as the
 * ready-made `pureText` strategy for `core/svek/image/EntityImageNoteLink.ts
 * #measureLinkNoteDim` (`shared-seam-extraction`/SI27's D1 extension point):
 * NOT wired into `state-composite-edge-label.ts`'s own `measureLinkNoteDim`
 * call this task, because `state-dot-graph.ts` (the FLAT pipeline's
 * byte-identical call, `computeEdgeLabelBox`, out of this task's write-set)
 * would then diverge from it — wiring only one of the two note-on-link call
 * sites breaks sizer/renderer LOCKSTEP (D1) between the flat and composite
 * pipelines, worse than the naive-default status quo both already share.
 * `state-composite-edge-label.ts`'s own SI28-flagged "duplicate" was already
 * resolved by SI27 into `EntityImageNoteLink.ts`'s one shared body (this
 * file's own top-of-file comment); the ONLY remaining gap is that shared
 * body's naive default for state, and closing it is a task for whoever owns
 * BOTH `state-dot-graph.ts` and `state-composite-edge-label.ts` at once. A
 * no-op today regardless: `EntityImageNoteLink.ts`'s own doc comment records
 * that no `note ... on link` fixture in the corpus carries creole markup. */
export function measureNotePureText(
  text: string,
  fontFamily: string,
  measurer: StringMeasurer,
  sprites?: SpriteRegistry,
): PureNoteTextDim {
  const font: FontConfiguration = { family: fontFamily, size: NOTE_FONT_SIZE, color: null, styles: NOTE_FONT_STYLES };
  // unwind2-S11: `skinParam.getSprite` sizes a `<$sprite>` atom
  // (`StripeSimple.java:229`).
  const opts = sprites === undefined ? undefined : { atomImageResolverFor: makeAtomImageResolverFor(sprites) };
  const dim = buildNoteBody(text, font, opts).calculateDimension(new MeasurerStringBounder(measurer));
  return { width: dim.getWidth(), height: dim.getHeight() };
}

/** `SkinParam#getTabSize` default (`SkinParam.java:1073`) — notes have no
 *  `theme.tabSize` cascade of their own threaded to this path (pre-existing
 *  scope limit, unchanged by SI30 T5); restated locally per this codebase's
 *  established per-module constant convention (`state-sizing-creole.ts`'s
 *  own `DEFAULT_TAB_SIZE`). */
const NOTE_TAB_SIZE_NB = 8;

/**
 * Per-visible-line render runs for {@link renderStateNote}'s per-run
 * `<text>` draw (`renderer-note.ts#renderNoteTextLines`) — kept separate
 * from the authoritative content dimension above because a note's own
 * `BodyFactory`/real-grid `AtomTable` pipeline ({@link measureNotePureText})
 * and this render-time approximation are independently derived (module doc
 * comment). Reuses the SAME {@link toStyledLine} conversion the header/body
 * path draws with (SI30 T5) for a TEXT/HR line's own per-run size/dy/color/
 * bold/italic/underline — a genuine, jar-ward improvement over the pre-T5
 * markup-stripped-and-joined single run (xeziki-47's own target shape). A
 * TABLE-kind line (T1's own `tableRowLine` doc comment: "T7 owns per-cell
 * parsing") still draws as its markup-stripped cells joined by two spaces,
 * unchanged by this task (SI29 T7 precedent: do not regress) — closer to
 * jar than the literal `|= a | b |` text, though still NOT jar's real
 * bordered grid (`AtomTable#drawU`'s per-cell rule lines), a named, deferred
 * gap since a real grid draw needs per-cell/per-column geometry
 * `StateTextLine` cannot carry without a `state-geo-types.ts` change outside
 * this task's write-set.
 */
export function buildRenderLines(
  text: string,
  theme: Pick<Theme, 'fontFamily' | 'sprites'>,
  measurer: StringMeasurer,
): readonly StateStyledTextLine[] {
  const font: FontSpec = { family: theme.fontFamily, size: NOTE_FONT_SIZE };
  // stdd T5a: the state creole block, whose `|= a | b |` rows are the real `StripeTable` grid
  // (`state-sizing-creole.ts#tableLine`, drawn by `renderer-box.ts#renderStateTable`), as a state body's
  // (fatupo-62); `EntityImageNote.java` builds the body through the same `Display#create` pipeline.
  return stateCreoleBlock(text.split('\n'), font, measurer, {
    tabSize: NOTE_TAB_SIZE_NB,
    ...(theme.sprites !== undefined ? { spriteRegistry: theme.sprites } : {}),
  }).lines;
}

/** `Position.withRankdir` (utils/Position.java:49-66) — under `left to right
 *  direction`, a note position rotates 90 degrees. No fixture in this
 *  corpus's note set uses LR, but `ctx.rankdir` is free to read at every
 *  call site, so this is ported alongside the base mechanism rather than
 *  deferred. */
function rotateForRankdir(position: NotePosition, rankdir: 'TB' | 'LR'): NotePosition {
  if (rankdir === 'TB') return position;
  const ROTATE: Record<NotePosition, NotePosition> = { right: 'bottom', left: 'top', bottom: 'right', top: 'left' };
  return ROTATE[position];
}

/** Edge direction + minlen per (rotated) note position — Svek note-on-entity,
 *  identical table to class engine's `note-layout.ts#NOTE_EDGE` (verified
 *  against the oracle on fatupo-62-bemu777/xodazu-26-cube992/gedude-95-
 *  subi666: right/left/bottom all match exactly). */
const NOTE_EDGE: Record<NotePosition, { fromNote: boolean; minLen: number }> = {
  left: { fromNote: true, minLen: 0 },
  right: { fromNote: false, minLen: 0 },
  top: { fromNote: true, minLen: 1 },
  bottom: { fromNote: false, minLen: 1 },
};

/** An attached note's not-yet-resolved connector edge — `target` is
 *  the RAW host id (a composite target may need `resolveEndpoint` at the
 *  caller, e.g. redirected to a `zaent` anchor); `noteId`/`target` are
 *  resolved against whichever pass's node set actually contains them (see
 *  state-composite-pass.ts's orphan-sweep wiring — same opportunistic,
 *  try-at-every-pass model iter 6 already established for regular
 *  transitions, since a note-to-host `Link` is, upstream, indistinguishable
 *  from any other `Link` for pass-attachment purposes). */
export interface NoteEdgeCandidate {
  id: string;
  noteId: string;
  target: string;
  fromNote: boolean;
  minLen: number;
  /** {@link NoteSpec.opalisable}, for the line drawn in the notch's stead. */
  opalisable: boolean;
  /** The note's `GMN<n>` quark name (`CommandFactoryNoteOnEntity.java:327`), in the line's id. */
  gmnName: string;
  /** The `Link` ctor's tick, right after the note's (`Link.java:135`). */
  creationIndex?: number;
}

/** A note's place in a pass's `GeoSpec` tree: upstream's note is a leaf like any
 *  other (`GroupMakerState.java:125-133` hands `group.leafs()` to the pass), and
 *  `SvekResult.java:82-90` draws every node of that pass. */
export interface NoteSpec {
  kind: 'note';
  id: string;
  /** `StateNodeGeo.noteLines`. */
  lines: readonly StateStyledTextLine[];
  /** `GraphvizImageBuilder#isOpalisable`: the `__noteedge_<id>` connector may become its notch. */
  opalisable: boolean;
  creationIndex?: number;
  color?: string;
  /** stdd T3d: `EntityImageNote.java:194,204-205` `ug.startUrl(getEntity().getUrl99())`. */
  url?: StateUrl;
}

export interface ScopeNoteParts {
  nodes: DotInputNode[];
  candidates: NoteEdgeCandidate[];
  specs: NoteSpec[];
}

/** `diagram.getUniqueSequence("GMN")`'s prefix (`CommandFactoryNoteOnEntity.java:327`). */
const GMN_PREFIX = 'GMN';

/** {@link NoteSpec} of `note`, from its own {@link measureNote}. */
function noteSpecOf(note: StateNote, m: NoteMeasurement, opalisable: boolean): NoteSpec {
  return {
    kind: 'note',
    id: note.id,
    lines: m.lines,
    opalisable,
    ...(note.creationIndex !== undefined ? { creationIndex: note.creationIndex } : {}),
    ...(note.color !== undefined ? { color: note.color } : {}),
    ...(m.url !== undefined ? { url: m.url } : {}),
  };
}

function measureAllNotes(
  notes: readonly StateNote[],
  theme: Theme,
  measurer: StringMeasurer,
): Map<string, NoteMeasurement> {
  const measurements = new Map<string, NoteMeasurement>();
  for (const note of notes) {
    const m = measureNote(note.text, theme, measurer);
    const url = stateUrlOf(note, theme);
    measurements.set(note.id, url === undefined ? m : { ...m, url });
  }
  return measurements;
}

function partitionByScope(notes: readonly StateNote[]): Map<string, StateNote[]> {
  const byScope = new Map<string, StateNote[]>();
  for (const note of notes) {
    const list = byScope.get(note.scopeId);
    if (list === undefined) byScope.set(note.scopeId, [note]);
    else list.push(note);
  }
  return byScope;
}

/** One scope's notes -> DOT nodes + connector-edge candidates (a freestanding
 *  note contributes a node only, no candidate). Each note is its own node and
 *  its own `Link`: `CommandFactoryNoteOnEntity.java:328-360` creates both per
 *  command, whatever else targets the same host and side. */
function buildScopeParts(
  scopeNotes: readonly StateNote[],
  measurements: Map<string, NoteMeasurement>,
  rankdir: 'TB' | 'LR',
  isOpalisable: (note: StateNote) => boolean,
): ScopeNoteParts {
  const nodes: DotInputNode[] = [];
  const candidates: NoteEdgeCandidate[] = [];
  const specs: NoteSpec[] = [];
  for (const note of scopeNotes) {
    const m = measurements.get(note.id)!;
    nodes.push({ id: note.id, width: m.width, height: m.height });
    const opalisable = isOpalisable(note);
    specs.push(noteSpecOf(note, m, opalisable));
    if (note.target === undefined || note.position === undefined) continue; // freestanding — no connector
    const dir = NOTE_EDGE[rotateForRankdir(note.position, rankdir)];
    candidates.push({
      id: `__noteedge_${note.id}`,
      noteId: note.id,
      target: note.target,
      fromNote: dir.fromNote,
      minLen: dir.minLen,
      opalisable,
      gmnName: `${GMN_PREFIX}${(note.creationIndex ?? 1) - 1}`,
      ...(note.creationIndex !== undefined ? { creationIndex: note.creationIndex + 1 } : {}),
    });
  }
  return { nodes, candidates, specs };
}

/** `GraphvizImageBuilder#isOpalisable` (`GraphvizImageBuilder.java:133-148`):
 *  not under `strictUml`, the note's only link, and that link's other end no
 *  note. A note another note targets holds a second link. */
function noteOpalisable(notes: readonly StateNote[], theme: Theme): (note: StateNote) => boolean {
  const ids = new Set(notes.map((n) => n.id));
  const targets = new Set(notes.map((n) => n.target));
  return (note) =>
    theme.strictUml !== true && note.target !== undefined && !ids.has(note.target) && !targets.has(note.id);
}

/**
 * Build every scope's note DOT nodes + connector-edge candidates in one pass
 * over `notes`, grouped by `scopeId` (see this module's doc). Empty for a
 * scope with no notes (`.get(scopeId)` returns `undefined` — callers treat
 * that as "nothing to add", same convention as `ClassifyResult.kindOf`).
 */
export function buildNoteGraphPartsByScope(
  notes: readonly StateNote[],
  theme: Theme,
  measurer: StringMeasurer,
  rankdir: 'TB' | 'LR',
): Map<string, ScopeNoteParts> {
  const measurements = measureAllNotes(notes, theme, measurer);
  const byScope = partitionByScope(notes);
  const isOpalisable = noteOpalisable(notes, theme);
  const out = new Map<string, ScopeNoteParts>();
  for (const [scopeId, scopeNotes] of byScope) {
    out.set(scopeId, buildScopeParts(scopeNotes, measurements, rankdir, isOpalisable));
  }
  return out;
}

/** Minimal structural shape a pass accumulator must satisfy for the sweep
 *  below — deliberately NOT `PassAccumulator` (state-composite-pass.ts) to
 *  avoid a value-level import back into that module; any accumulator whose
 *  `nodes`/`edges` are structurally compatible (both flat and composite
 *  paths' real accumulators are) works here. */
export interface NoteEdgeSweepTarget {
  nodes: readonly { id: string }[];
  edges: { id: string; from: string; to: string; attributes?: { minLen?: number } }[];
  /** The candidates this pass attached (`state-note-lines.ts#noteLinesOf`). */
  noteLinks?: NoteEdgeCandidate[];
}

/**
 * Attempt every not-yet-consumed note-edge candidate against THIS pass's own
 * node set, resolving the host id via `resolveTarget` (the caller's
 * `resolveEndpoint`, e.g. redirecting a cluster composite to its zaent
 * anchor) — mirrors `state-composite-pass.ts#sweepOrphanEdges`'s
 * opportunistic per-pass attach model 1:1 (same upstream mechanism: a note's
 * `Link` is attempted at every `GraphvizImageBuilder#buildImage` pass and
 * silently dropped where an endpoint has no `SvekNode`). A candidate's OWN
 * note node exists in exactly one pass (fixed at note-node build time), so
 * this can only ever succeed at that one pass, regardless of call order.
 */
export function sweepOrphanNoteEdges(
  acc: NoteEdgeSweepTarget,
  pool: readonly NoteEdgeCandidate[],
  consumed: Set<NoteEdgeCandidate>,
  resolveTarget: (id: string) => string,
): void {
  const nodeIds = new Set(acc.nodes.map((n) => n.id));
  for (const cand of pool) {
    if (consumed.has(cand)) continue;
    if (!nodeIds.has(cand.noteId)) continue;
    const hostId = resolveTarget(cand.target);
    if (!nodeIds.has(hostId)) continue;
    acc.edges.push({
      id: cand.id,
      from: cand.fromNote ? cand.noteId : hostId,
      to: cand.fromNote ? hostId : cand.noteId,
      attributes: { minLen: cand.minLen },
    });
    // `GraphvizImageBuilder.java:245-259`: a group has no `SvekNode`, so a note on a
    // cluster composite (its zaent point here) keeps its line.
    (acc.noteLinks ??= []).push(hostId === cand.target ? cand : { ...cand, opalisable: false });
    consumed.add(cand);
  }
}
