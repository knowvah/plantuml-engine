/**
 * `PlayingSpace#addParallelSiblingDisjointConstraints` (sdd2 T3c2,
 * `teoz/PlayingSpace.java:162-292`): a top-level `&` tile and every tile of
 * its cluster are pushed apart in x -- whichever starts further right clears
 * the other's whole footprint, `bMin.ensureBiggerThan(aMax)`. A `& group`
 * beside another group is the case that moves participants (`codeti-52`).
 *
 * The footprints are `getMinX`/`getMaxX`: `RealMin`/`RealMax` over candidate
 * points. `ensureBiggerThan` on a `RealMin` pushes every candidate
 * (`RealMin.java:81-85`), so one footprint pair becomes one
 * {@link DisjointConstraint}: the `RealMax` of one side's candidates and every
 * candidate of the other's, solved by `sequence-real-force.ts` with the
 * `RealMax`'s first-read cache (`real/RealMax.java:89-94`). Split out of `sequence-layout-group-clearance.ts`
 * (500-line cap); every import is a leaf, as there.
 */
import type { FrameEvent, MessageEvent, MessageExoEvent, NoteEvent, Participant, SequenceEvent } from './ast.js';
import { noteComponentWidth, noteTileFootprint, noteTiles } from './sequence-note-width.js';
import type { Anchor, DisjointConstraint, Scan } from './sequence-layout-participant-constraints.js';
import {
  elseComponentWidth,
  elsePaint,
  FRAME_EXTERNAL_MARGIN_X1,
  FRAME_EXTERNAL_MARGIN_X2,
  FRAME_MARGIN_X,
} from './sequence-frame-metrics.js';
import { groupHeaderWidth } from './sequence-frame-component.js';
import { selfDrawnWidth } from './sequence-layout-frame-extent.js';
import { messagePaint } from './sequence-arrow-paint.js';
import { ARROW_DELTA_X } from './sequence-arrowhead.js';
import { ARROW_PADDING_X, LIVE_DELTA_SIZE } from './sequence-layout-shared.js';
import { selfCompWidth } from './sequence-note-anchor.js';
import { messageLabelWidth, numberTextOf } from './text-block-geo.js';
import {
  indexOf,
  lifeReach,
  messageLifeReaches,
  tilesOf,
  wrapperAnchor,
  wrapperLevel,
  wrapperSide,
  type GroupTiles,
  type Reach,
} from './sequence-layout-group-clearance.js';

/** The literal `16` of `max2.add(this.min.addFixed(width + 16))`
 *  (`GroupingTile.java:224`). */
const HEADER_MARGIN = 16;

/** A footprint's candidates: `getMinX` is the least of `mins`, `getMaxX` the
 *  greatest of `maxs`. `undefined` where a candidate is not reachable from the
 *  participant row (a note's width, the x origin, a delay's middle). */
interface Footprint {
  readonly mins: readonly Anchor[] | undefined;
  readonly maxs: readonly Anchor[] | undefined;
}

const UNREACHABLE: Footprint = { mins: undefined, maxs: undefined };

function anchorOf(reach: Reach): Anchor {
  return { index: reach.index, offset: reach.offset, at: reach.edge === true ? 'B' : 'C' };
}

function shift(anchors: readonly Anchor[] | undefined, by: number): Anchor[] | undefined {
  return anchors?.map((a) => ({ ...a, offset: a.offset + by }));
}

/** The arrow component's preferred width, `getTextWidth + getArrowDeltaX`
 *  (`ComponentRoseArrow.java:347-349`). */
function arrowWidth(ev: MessageEvent | MessageExoEvent, scan: Scan): number {
  const paint = messagePaint(ev.styleBuilder, ev.stereotype, ev.arrow, false);
  return (
    messageLabelWidth(ev.label, numberTextOf(ev), paint.font, scan, paint.wrapWidth) +
    2 * ARROW_PADDING_X +
    ARROW_DELTA_X
  );
}

/**
 * `CommunicationTile#getMinX`/`#getMaxX` (`:445-460`): `point1` is `posC` of
 * the sender, `point2` `posC` of the receiver -- `posB`, or reversed `posD`,
 * of a created head (`:435-443`); the max is the right point or the left one
 * plus the arrow width.
 */
function messageFootprint(ev: MessageEvent, from: number, to: number, scan: Scan): Footprint {
  const reverse = from > to;
  const point1: Anchor = { index: from, offset: 0, at: 'C' };
  const point2: Anchor = { index: to, offset: 0, at: ev.create === true ? (reverse ? 'D' : 'B') : 'C' };
  const [left, right] = reverse ? [point2, point1] : [point1, point2];
  return { mins: [left], maxs: [right, { ...left, offset: left.offset + arrowWidth(ev, scan) }] };
}

/**
 * `CommunicationTileSelf#getMinX`/`#getMaxX` (`:263-277`) or, `drawn`, the
 * drawn extent (`:293-307`): `posC` to `posC2 + width` forward; `posC - width
 * - adjustment` to `posC2` reverse, `width` the component's `getCompWidth` or
 * `getDrawnWidth`.
 */
function selfFootprint(ev: MessageEvent, index: number, scan: Scan, drawn: boolean): Footprint {
  const width = drawn ? selfDrawnWidth(ev, scan) : selfCompWidth(ev, scan);
  // `index` was found in the row, and every row participant has a max position.
  const posC2 = scan.maxPosition.get(ev.from)!;
  if (ev.arrow.reverseDefine !== true) {
    return { mins: [{ index, offset: 0, at: 'C' }], maxs: [{ index, offset: posC2 + width, at: 'C' }] };
  }
  const live = scan.live.ofSource.get(ev);
  const level = live === undefined ? 0 : (scan.boxes.get(ev.from)?.getLevelAt(live, 'IGNORE_FUTURE_ACTIVATE') ?? 0);
  const adjust = level > 0 ? LIVE_DELTA_SIZE : 0;
  return { mins: [{ index, offset: -width - adjust, at: 'C' }], maxs: [{ index, offset: posC2, at: 'C' }] };
}

/** A tile's `getMinX`/`getMaxX` and its `getDrawnMinX`/`getDrawnMaxX`
 *  (`Tile.java:85-91`), which differ only for a self loop and its two
 *  note-wrapping siblings. */
interface TileExtent {
  readonly layout: Footprint;
  readonly drawn: Footprint;
}

/** Both extents of a plain wrapper: `getDrawnMinX`/`getDrawnMaxX` default to
 *  its own `getMinX`/`getMaxX` (`Tile.java:85-91`). */
function plainExtent(layout: Footprint): TileExtent {
  return { layout, drawn: layout };
}

/**
 * `CommunicationTileNoteLeft`/`NoteRight` (`TileBuilder.java:106-115`, an exo
 * message's at `:126-133`): the left wrapper's min is `posC(ls) - width`
 * (`CommunicationTileNoteLeft.java:111-115,218-224`), the right wrapper's max
 * `posC(ls) + level * 5 + width`, or `posD(ls) + width` on a create message
 * (`CommunicationTileNoteRight.java:118-126,241-249`); the other side is the
 * inner tile's.
 */
function plainSideWrap(
  ev: MessageEvent | MessageExoEvent,
  inner: Footprint,
  side: 'left' | 'right',
  w: number,
  sorted: readonly Participant[],
  scan: Scan,
): TileExtent {
  const id = wrapperAnchor(ev, side === 'left' ? 'min' : 'max', sorted);
  const index = indexOf(sorted, id);
  if (side === 'left') return plainExtent({ mins: [{ index, offset: -w, at: 'C' }], maxs: inner.maxs });
  const create = ev.kind === 'message' && ev.create === true;
  const max: Anchor = create
    ? { index, offset: w, at: 'D' }
    : { index, offset: wrapperLevel(ev, id, scan) * LIVE_DELTA_SIZE + w, at: 'C' };
  return plainExtent({ mins: inner.mins, maxs: [max] });
}

/** `CommunicationTileSelfNoteLeft`/`SelfNoteRight` (`TileBuilder.java:104-112`):
 *  the inner extent widened by the note on its side, drawn and layout alike
 *  (`CommunicationTileSelfNoteLeft.java:111-116,163-185`,
 *  `CommunicationTileSelfNoteRight.java:111-113,156-180`). */
function selfSideWrap(inner: TileExtent, side: 'left' | 'right', w: number): TileExtent {
  const widen = (f: Footprint): Footprint =>
    side === 'left' ? { mins: shift(f.mins, -w), maxs: f.maxs } : { mins: f.mins, maxs: shift(f.maxs, w) };
  return { layout: widen(inner.layout), drawn: widen(inner.drawn) };
}

/** `CommunicationTileNoteTop`/`NoteBottom` (`CommunicationTileNoteBottomTopAbstract
 *  .java:143-154`): the inner min, and `max(inner max, inner min + width)`. */
function topBottomWrap(inner: Footprint, w: number): TileExtent {
  if (inner.mins === undefined || inner.maxs === undefined || inner.mins.length === 0)
    return plainExtent({ mins: inner.mins, maxs: undefined });
  const least = leastOf(inner.mins);
  return plainExtent({ mins: inner.mins, maxs: [...inner.maxs, { ...least, offset: least.offset + w }] });
}

/** One note's wrapper around `inner` (`TileBuilder.java:102-133`): an exo
 *  message takes note 0's side for every note and builds no top/bottom one. */
function wrapOnce(
  ev: MessageEvent | MessageExoEvent,
  inner: TileExtent,
  note: NoteEvent,
  side: string,
  sorted: readonly Participant[],
  scan: Scan,
): TileExtent {
  const self = ev.kind === 'message' && ev.from === ev.to;
  if (side === 'left' || side === 'right') {
    // The self wrappers force `ComponentType.NOTE` (`CommunicationTileSelfNoteRight.java:105`).
    if (self) return selfSideWrap(inner, side, noteComponentWidth(note, scan, 'note'));
    return plainSideWrap(ev, inner.layout, side, noteComponentWidth(note, scan), sorted, scan);
  }
  if (ev.kind === 'messageExo') return inner;
  return topBottomWrap(inner.layout, noteComponentWidth(note, scan, 'note'));
}

/** A message's outermost tile (`TileBuilder.java:86-133`): one wrapper per
 *  folded note, in order, each around the tile before it. */
function wrappedExtent(
  ev: MessageEvent | MessageExoEvent,
  inner: TileExtent,
  tiles: GroupTiles,
  sorted: readonly Participant[],
  scan: Scan,
): TileExtent {
  const notes = tiles.folded.get(ev) ?? [];
  let extent = inner;
  for (const note of notes) {
    const side = wrapperSide(ev, note);
    extent = wrapOnce(ev, extent, note, side, sorted, scan);
  }
  return extent;
}

function messageTile(ev: MessageEvent, tiles: GroupTiles, sorted: readonly Participant[], scan: Scan, drawn: boolean) {
  const from = indexOf(sorted, ev.from);
  const to = indexOf(sorted, ev.to);
  if (from < 0 || to < 0) return undefined;
  const inner: TileExtent =
    from === to
      ? { layout: selfFootprint(ev, from, scan, false), drawn: selfFootprint(ev, from, scan, true) }
      : plainExtent(messageFootprint(ev, from, to, scan));
  const extent = wrappedExtent(ev, inner, tiles, sorted, scan);
  return drawn ? extent.drawn : extent.layout;
}

/** `CommunicationExoTile#getMinX`/`#getMaxX` (`:206-240`). */
function exoTile(ev: MessageExoEvent, tiles: GroupTiles, sorted: readonly Participant[], scan: Scan) {
  const index = indexOf(sorted, ev.participant);
  if (index < 0) return undefined;
  const width = arrowWidth(ev, scan);
  const right = ev.exoType === 'FROM_RIGHT' || ev.exoType === 'TO_RIGHT';
  const inner: Footprint = right
    ? { mins: [{ index, offset: 0, at: 'C' }], maxs: [{ index, offset: width, at: 'C' }] }
    : { mins: [{ index, offset: -width, at: 'C' }], maxs: [{ index, offset: 0, at: 'C' }] };
  return wrappedExtent(ev, plainExtent(inner), tiles, sorted, scan).layout;
}

/** `ReferenceTile#getMinX`/`#getMaxX` (`:163-180`): `first`, the leftmost
 *  participant's `posB`, and `last`, the rightmost's `posD`. */
function refTile(ev: FrameEvent, sorted: readonly Participant[]): Footprint {
  const indices = (ev.participants ?? []).map((id) => indexOf(sorted, id)).filter((i) => i >= 0);
  if (indices.length === 0) return UNREACHABLE;
  return {
    mins: [{ index: Math.min(...indices), offset: 0, at: 'B' }],
    maxs: [{ index: Math.max(...indices), offset: 0, at: 'D' }],
  };
}

/** No candidate at all: a tile skipped for an unknown participant. */
const EMPTY: Footprint = { mins: [], maxs: [] };

/** A message's tile and the `LifeEventTile`s it brings
 *  (`messageLifeReaches`). */
function messageChild(ev: MessageEvent, tiles: GroupTiles, sorted: readonly Participant[], scan: Scan): Footprint[] {
  const lives = (side: 'min' | 'max'): Anchor[] => messageLifeReaches(ev, side, sorted, scan).map(anchorOf);
  return [messageTile(ev, tiles, sorted, scan, true) ?? EMPTY, { mins: lives('min'), maxs: lives('max') }];
}

/** An `activate`/`deactivate`'s `LifeEventTile`. */
function lifeChild(ev: SequenceEvent, sorted: readonly Participant[], scan: Scan): Footprint[] {
  const live = scan.live.ofSource.get(ev);
  if (live?.kind !== 'life') return [];
  const reach = (side: 'min' | 'max'): Anchor[] => lifeReach(live, side, sorted, scan).map(anchorOf);
  return [{ mins: reach('min'), maxs: reach('max') }];
}

/** A standalone note's width, a divider's or newpage's x origin and a
 *  delay's middle are out of the row's reach; a note on a message is its
 *  wrapper's, and a `|||` counts for nothing (`GroupingTile.java:202-203`). */
function otherChild(ev: SequenceEvent): Footprint[] {
  if (ev.kind === 'space' || (ev.kind === 'note' && ev.onMessage === true)) return [];
  return [UNREACHABLE];
}

/** The footprints `event` contributes as a child of a group, drawn
 *  (`Tile#getDrawnMinX`/`#getDrawnMaxX`, `GroupingTile.java:211-214`). An
 *  else tile carries none (`:188-193`). */
function childFootprints(
  ev: SequenceEvent,
  tiles: GroupTiles,
  sorted: readonly Participant[],
  scan: Scan,
): Footprint[] {
  switch (ev.kind) {
    case 'message':
      return messageChild(ev, tiles, sorted, scan);
    case 'messageExo':
      return [exoTile(ev, tiles, sorted, scan) ?? EMPTY];
    case 'activate':
    case 'deactivate':
      return lifeChild(ev, sorted, scan);
    case 'frame':
      return [ev.frameType === 'ref' ? refTile(ev, sorted) : groupTile(ev, sorted, scan)];
    default:
      return otherChild(ev);
  }
}

/**
 * The least of `anchors`, as `RealMin` resolves it. Participants are placed
 * left to right in index order and every candidate here sits within its own
 * participant's column, so the lowest index wins; within one participant,
 * `posB` before `posC` before `posD`, then the offset.
 */
function leastOf(anchors: readonly Anchor[]): Anchor {
  const rank = { B: 0, C: 1, D: 2 } as const;
  return [...anchors].sort((a, b) => a.index - b.index || rank[a.at] - rank[b.at] || a.offset - b.offset)[0]!;
}

/** Every candidate of every child, or `undefined` once one is unreachable. */
function gather(footprints: readonly Footprint[], side: 'mins' | 'maxs'): Anchor[] | undefined {
  const all: Anchor[] = [];
  for (const f of footprints) {
    const anchors = f[side];
    if (anchors === undefined) return undefined;
    all.push(...anchors);
  }
  return all;
}

/**
 * A group's `getMinX`/`getMaxX` (`GroupingTile.java:984-990`) over its frame
 * (`:207-225`): each child's drawn min less `MARGINX`, its drawn max plus;
 * each else tile's `getMaxX`, `min - EXTERNAL_MARGINX1 + width`
 * (`ElseTile.java:153-161`); `min + headerWidth + 16`. An empty group starts
 * at the x origin (`:217-218`), which the row cannot reach.
 */
function groupTile(group: FrameEvent, sorted: readonly Participant[], scan: Scan): Footprint {
  const tiles = tilesOf(group);
  const children = tiles.events.flatMap((ev) => childFootprints(ev, tiles, sorted, scan));
  const mins = shift(gather(children, 'mins'), -FRAME_MARGIN_X);
  if (mins === undefined || mins.length === 0) return UNREACHABLE;
  const min = leastOf(mins);
  const elses = group.branchLabels
    .slice(1)
    .map((label, i) => elseComponentWidth(label, elsePaint(group, i + 1), scan))
    .map((w) => ({ ...min, offset: min.offset - FRAME_EXTERNAL_MARGIN_X1 + w }));
  const header = { ...min, offset: min.offset + groupHeaderWidth(group, scan) + HEADER_MARGIN };
  const maxs = shift(gather(children, 'maxs'), FRAME_MARGIN_X);
  return {
    mins: shift(mins, -FRAME_EXTERNAL_MARGIN_X1),
    maxs: maxs === undefined ? undefined : shift([...maxs, ...elses, header], FRAME_EXTERNAL_MARGIN_X2),
  };
}

/** A top-level tile's `getMinX`/`getMaxX` (not drawn): the footprint
 *  `ensureDisjoint` compares (`PlayingSpace.java:240-243`). */
function tileFootprint(ev: SequenceEvent, ctx: DisjointContext): Footprint {
  const { tiles, sorted, scan } = ctx;
  if (ev.kind === 'message') return messageTile(ev, tiles, sorted, scan, false) ?? UNREACHABLE;
  if (ev.kind === 'messageExo') return exoTile(ev, tiles, sorted, scan) ?? UNREACHABLE;
  if (ev.kind === 'frame' && ev.frameType !== 'ref') return groupTile(ev, sorted, scan);
  if (isStandaloneNote(ev)) return noteTileFootprint(ctx.notes.get(ev) ?? [ev], sorted, scan) ?? UNREACHABLE;
  return UNREACHABLE;
}

/** A `NoteTile`/`NotesTile` of its own, not a note on a message. */
function isStandaloneNote(ev: SequenceEvent): ev is NoteEvent {
  return ev.kind === 'note' && ev.onMessage !== true;
}

/**
 * `findAnchorLivingSpace` (`PlayingSpace.java:384-409`): a message's
 * participant1, an exo message's participant, a note's participant -- a
 * `Notes` group's first note's (`:392-399`, upstream `2c679666164`) -- a
 * group's first child that has one; anything else has none.
 */
function anchorIndexOf(ev: SequenceEvent, sorted: readonly Participant[]): number | undefined {
  if (ev.kind === 'message') return indexOrUndefined(sorted, ev.from);
  if (ev.kind === 'messageExo') return indexOrUndefined(sorted, ev.participant);
  if (isStandaloneNote(ev)) return indexOrUndefined(sorted, ev.participants[0] ?? '');
  if (ev.kind !== 'frame' || ev.frameType === 'ref') return undefined;
  for (const child of ev.branches.flat()) {
    const found = anchorIndexOf(child, sorted);
    if (found !== undefined) return found;
  }
  return undefined;
}

function indexOrUndefined(sorted: readonly Participant[], id: string): number | undefined {
  const index = indexOf(sorted, id);
  return index < 0 ? undefined : index;
}

/** `GroupingTile.isParallel` (`:1150-1152`), `tile.getEvent().isParallel()`:
 *  a `Notes` merge never is (`NotesTile.java:84-91`). */
function isParallel(ev: SequenceEvent, ctx: DisjointContext): boolean {
  if (ev.kind === 'note') return ev.parallel === true && ev.vmerge !== true && !ctx.notes.has(ev);
  if (ev.kind === 'frame') return ev.frameType !== 'ref' && ev.parallel === true;
  return (ev.kind === 'message' || ev.kind === 'messageExo') && ev.parallel === true;
}

/**
 * `ensureDisjoint(a, b)` (`PlayingSpace.java:240-266`): two tiles anchored on
 * the same participant are skipped; otherwise, by declaration order of the
 * anchors, the right one's `getMinX` is pushed past the left one's `getMaxX`.
 * Every candidate pair is kept, the cyclic ones too -- the jar registers them
 * all, and a cyclic one is finite only through `RealMax`'s first-read cache
 * (`sequence-real-force.ts`).
 */
function disjoint(a: SequenceEvent, b: SequenceEvent, ctx: DisjointContext): DisjointConstraint[] {
  const pair = leftThenRight(a, b, ctx.sorted);
  if (pair === undefined) return [];
  const [left, right] = pair;
  if (cannotPushApart(left, right, ctx)) return [];
  const lows = tileFootprint(right, ctx).mins ?? [];
  const highs = tileFootprint(left, ctx).maxs ?? [];
  if (lows.length === 0 || highs.length === 0) return [];
  return [{ disjoint: true, lows, highs, ...(left.kind === 'frame' ? { highsOwner: left } : {}) }];
}

/** The two tiles by declaration order of their anchors (`PlayingSpace.java:260-266`);
 *  none when either has no anchor or both share one (`:240-258`). */
function leftThenRight(
  a: SequenceEvent,
  b: SequenceEvent,
  sorted: readonly Participant[],
): [SequenceEvent, SequenceEvent] | undefined {
  const aAnchor = anchorIndexOf(a, sorted);
  const bAnchor = anchorIndexOf(b, sorted);
  if (aAnchor === undefined || bAnchor === undefined || aAnchor === bAnchor) return undefined;
  return aAnchor <= bAnchor ? [a, b] : [b, a];
}

interface DisjointContext {
  readonly tiles: GroupTiles;
  readonly sorted: readonly Participant[];
  readonly scan: Scan;
  /** A `/` group's head note and its members, one `NotesTile` (`noteTiles`). */
  readonly notes: ReadonlyMap<NoteEvent, readonly NoteEvent[]>;
}

/**
 * `cannotPushApart` (`PlayingSpace.java:294-311`, upstream `cf9e4d42a`): the
 * left tile is a lone note and the right one starts at or left of the note's
 * participant -- over several, its rightmost one once the first is found
 * (`:302-306`) -- so pushing the right tile moves the note too and the jar
 * skips the pair. Positions compare by declaration order, as `posB` pre-solve.
 */
function cannotPushApart(left: SequenceEvent, right: SequenceEvent, ctx: DisjointContext): boolean {
  if (!isStandaloneNote(left) || ctx.notes.has(left)) return false;
  // `getParticipant()`, then `getParticipant2()` only `OVER_SEVERAL` (`:302-306`).
  const found = left.participants.slice(0, left.position === 'over' ? 2 : 1).map((id) => indexOf(ctx.sorted, id));
  const noteEnd = found.length === 0 || found[0]! < 0 ? undefined : Math.max(...found);
  return noteEnd !== undefined && (leftmostIndex(right, ctx) ?? Infinity) <= noteEnd;
}

/**
 * `leftmostPosB` (`PlayingSpace.java:317-342`): the leftmost participant
 * pushing this tile moves -- a group's children, a message's two ends, a
 * note's one or two, a `Notes` group's members not `OVER_SEVERAL`.
 */
function leftmostIndex(ev: SequenceEvent, ctx: DisjointContext): number | undefined {
  const least = (ids: readonly string[]): number | undefined => {
    const found = ids.map((id) => indexOf(ctx.sorted, id)).filter((i) => i >= 0);
    return found.length === 0 ? undefined : Math.min(...found);
  };
  if (ev.kind === 'frame' && ev.frameType !== 'ref') {
    const all = ev.branches.flat().map((child) => leftmostIndex(child, ctx));
    const defined = all.filter((i): i is number => i !== undefined);
    return defined.length === 0 ? undefined : Math.min(...defined);
  }
  if (ev.kind === 'message') return least([ev.from, ev.to]);
  if (!isStandaloneNote(ev)) return undefined;
  const group = ctx.notes.get(ev);
  if (group === undefined) return least(ev.participants.slice(0, 2));
  return least(
    group.filter((n) => !(n.position === 'over' && n.participants.length > 1)).map((n) => n.participants[0]!),
  );
}

/**
 * `addParallelSiblingDisjointConstraints` (`PlayingSpace.java:188-202`) over
 * the diagram's top-level tiles: a `&` tile is kept disjoint from every tile
 * of the run it joins; any other tile starts a new run. A note on a message
 * is its message's wrapper, not a tile.
 */
export function parallelDisjoint(
  events: readonly SequenceEvent[],
  sorted: readonly Participant[],
  scan: Scan,
): DisjointConstraint[] {
  const groups = noteTiles(events).filter((t) => t.length > 1);
  const notes = new Map(groups.map((t) => [t[0]!, t] as const));
  const members = new Set(groups.flatMap((t) => t.slice(1)));
  const ctx: DisjointContext = { tiles: tilesOf({ branches: [[...events]] }), sorted, scan, notes };
  const out: DisjointConstraint[] = [];
  let cluster: SequenceEvent[] = [];
  for (const ev of events) {
    // A note on a message is its message's wrapper, and a merged `/` note is
    // its group's `NotesTile`: neither is a tile of its own.
    if ((ev.kind === 'note' && ev.onMessage === true) || members.has(ev as NoteEvent)) continue;
    if (isParallel(ev, ctx)) for (const other of cluster) out.push(...disjoint(other, ev, ctx));
    cluster = closesRun(ev, scan) ? [] : isParallel(ev, ctx) ? [...cluster, ev] : [ev];
  }
  return out;
}

/** A message's own `++`/`--`/`!!` are `LifeEventTile`s right after its tile
 *  (`SequenceDiagram.java:367-373`): not `&`, so they close the run, and they
 *  have no anchor (`PlayingSpace.java:281-298`), so the run they open is
 *  never compared. */
function closesRun(ev: SequenceEvent, scan: Scan): boolean {
  // `ownOf` holds every message of the scanned list (`sequence-live-events.ts`).
  return ev.kind === 'message' && scan.live.ownOf.get(ev)!.length > 0;
}
