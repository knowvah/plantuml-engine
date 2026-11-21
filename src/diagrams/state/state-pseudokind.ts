/**
 * Pseudostate marker constants + stereotype/compound-id → `StateKind`
 * classification — split out of `state-parse-state.ts` (mission G4 S7,
 * 500-line file-cap compliance; pure move, no behavior change). These are
 * pure, stateless lookup functions (no dependency on `ParseState`/`Scope`),
 * unlike the rest of `state-parse-state.ts`'s own scope-stack/mutable-parse-
 * state machinery — a clean SRP split, not an arbitrary line-count cut.
 */

import type { StateKind } from './ast.js';
import { isSyncBarId } from './state-transitions.js';

// ---------------------------------------------------------------------------
// Pseudostate markers
// ---------------------------------------------------------------------------

/** The reserved pseudostate id used for initial and final transitions. */
export const PSEUDOSTATE = '[*]';

/** The shallow history pseudostate id. */
const HISTORY_SHALLOW = '[H]';

/** The deep history pseudostate id. */
const HISTORY_DEEP = '[H*]';

// ---------------------------------------------------------------------------
// Stereotype → StateKind mapping
// ---------------------------------------------------------------------------

/**
 * Upstream resolves a pseudostate's leaf type from the FIRST `<<label>>` in
 * a state's stereotype group (`Stereogroup#getLeafType`) — only these
 * labels are recognized; anything else keeps `LeafType.STATE` (our
 * `'normal'`). `<<junction>>` is `LeafType.JUNCTION` since upstream
 * `a0a410773aa` (#2905, `Stereogroup.java:127-128`), a 12x12 circle
 * (livuni-63-fira764). `entrypoint`/`exitpoint` stay OUT of this table on
 * purpose (see the table's own comment) — a separate classification axis,
 * not a StateKind.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/stereo/Stereogroup.java:114-138
 */
const STEREOTYPE_KIND_MAP: Readonly<Record<string, StateKind>> = {
  choice: 'choice',
  fork: 'fork',
  join: 'join',
  history: 'history',
  // Real upstream key is `history*` (Stereogroup.java:127-128), not
  // `deephistory` — both map here so pre-existing `<<deepHistory>>`
  // fixtures/tests keep working while the faithful `<<history*>>` spelling
  // now also resolves correctly.
  'history*': 'deepHistory',
  deephistory: 'deepHistory',
  // Named (non-anonymous) initial/final pseudostates: `state X <<start>>` /
  // `state X <<end>>` reuse the `'initial'`/`'final'` StateKind values that
  // were previously reserved-but-unused (only the anonymous `[*]` sentinel
  // used them, and `[*]` is never turned into a State node at all).
  start: 'initial',
  // Stereogroup.java:127-128 (a0a410773aa, #2905).
  junction: 'junction',
  end: 'final',
  // `<<entrypoint>>`/`<<exitpoint>>` are deliberately ABSENT here (mission
  // A4/T4 fact-4): Stereogroup.java has no such case, so upstream keeps
  // these `LeafType.STATE` (kind:'normal') — classification into a
  // border-point box happens via the INDEPENDENT `EntityPosition` axis
  // (./state-entity-position.ts), not `StateKind`. A prior (invented)
  // mapping to `'choice'` here rendered them as diamonds — wrong shape,
  // wrong size (24x24 vs the correct 12x12 border-point box) — removed.
};

export function stereotypeToKind(raw: string): StateKind {
  const key = raw.toLowerCase();
  return STEREOTYPE_KIND_MAP[key] ?? 'normal';
}

/**
 * Resolve the kind for a pseudostate transition endpoint id: exact
 * shallow/deep history (`[H]`/`[H*]`), or a `=name=` synchronization bar
 * reference. Compound `StateId[H]`/`StateId[H*]` forms are NOT resolved
 * here — see `compoundHistoryKind` below.
 */
export function pseudoKindForId(id: string): StateKind | undefined {
  if (id === HISTORY_SHALLOW) return 'history';
  if (id === HISTORY_DEEP) return 'deepHistory';
  if (isSyncBarId(id)) return 'syncBar';
  return undefined;
}

/**
 * Compound `StateId[H]`/`StateId[H*]` endpoint — `CommandLinkStateCommon
 * #getEntity`'s `code.endsWith("[H]")`/`code.endsWith("[H*]")` branches
 * (case-SENSITIVE suffix match, unlike the bare form's `equalsIgnoreCase`
 * above — faithfully preserved, not an oversight). Checked in the SAME
 * order as upstream: the deep suffix is tested before the shallow one so a
 * deep reference is never mis-split as a shallow one with a literal `*]`
 * trailing the composite name. Returns the referenced composite's own id
 * (`idShort`) plus which history flavor, or `undefined` when `id` is not a
 * compound history reference at all.
 * @see ~/git/plantuml/.../statediagram/command/CommandLinkStateCommon.java#getEntity
 */
export function compoundHistoryKind(id: string): { idShort: string; kind: StateKind } | undefined {
  if (id.endsWith(HISTORY_DEEP)) return { idShort: id.slice(0, -HISTORY_DEEP.length), kind: 'deepHistory' };
  if (id.endsWith(HISTORY_SHALLOW)) return { idShort: id.slice(0, -HISTORY_SHALLOW.length), kind: 'history' };
  return undefined;
}
