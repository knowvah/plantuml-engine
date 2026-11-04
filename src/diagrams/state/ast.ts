/**
 * AST type definitions for PlantUML state diagrams.
 */

// ---------------------------------------------------------------------------
// JSON leaf value type — ONE definition shared by class and state, under
// core/command/JsonNode.ts (mission shared-seam-extraction D7).
// ---------------------------------------------------------------------------

import type { ScaleSpec } from '../../core/scale-command.js';
import type { JsonNode } from '../../core/command/JsonNode.js';
export type { JsonNode };

import type { DiagramAnnotations } from '../../core/annotations/index.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';

// ---------------------------------------------------------------------------
// State kinds
// ---------------------------------------------------------------------------

export type StateKind =
  | 'normal'
  | 'initial'
  | 'final'
  | 'history'
  | 'deepHistory'
  | 'fork'
  | 'join'
  | 'choice'
  /**
   * A synchronization bar auto-created from a bare `=name=` transition
   * endpoint (no prior `<<fork>>`/`<<join>>` declaration needed).
   * @see ~/git/plantuml/.../statediagram/command/CommandLinkStateCommon.java#getEntity
   *      (LeafType.SYNCHRO_BAR)
   */
  | 'syncBar'
  /**
   * An embedded `json Name { ... }` / `json Name value` leaf (upstream
   * `LeafType.JSON`) — `CommandCreateJson`/`CommandCreateJsonSingleLine`,
   * registered verbatim by `StateDiagramFactory` from the shared
   * `objectdiagram.command` package (mission A4 Phase L iter 20). See
   * {@link State.jsonValue} for the parsed payload.
   * @see ~/git/plantuml/.../statediagram/StateDiagramFactory.java:115-116
   */
  | 'json';

// ---------------------------------------------------------------------------
// History pseudostate
// ---------------------------------------------------------------------------

/**
 * Represents a UML history pseudostate — either shallow `[H]` or deep `[H*]`.
 * These are represented in the parsed AST as State nodes with kind='history'
 * or kind='deepHistory'. This interface documents the discriminated shape.
 */
export interface HistoryPseudostate {
  kind: 'history';
  id: string;
  depth: 'shallow' | 'deep';
}

/**
 * `--`/`||` separator orientation — name/members mirror upstream
 * `ConcurrentStates.Separator` verbatim. `HORIZONTAL` (`--`, a horizontal
 * LINE) stacks regions top-to-bottom; `VERTICAL` (`||`, a vertical LINE)
 * stacks regions side-by-side.
 * @see ~/git/plantuml/.../svek/ConcurrentStates.java:63-89 (fromChar, .add)
 */
export type Separator = 'HORIZONTAL' | 'VERTICAL';

// ---------------------------------------------------------------------------
// State node
// ---------------------------------------------------------------------------

export interface State {
  id: string;
  display: string;
  kind: StateKind;
  /** Nested states for composite states. */
  children: State[];
  /**
   * Concurrent regions for states with `--` separators.
   * Each sub-array is one region. Empty unless `--` was present.
   */
  concurrentRegions: State[][];
  /** stdd T6a: the `cpt1` tick each `--`/`||` burnt on pass ONE, parallel to `concurrentRegions`
   *  (`StateDiagram#concurrentState` -> `gotoGroup` -> `new Entity`, `StateDiagram.java:194-208`).
   *  `Entity#leafs()` walks a composite's quark children in that order (`Entity.java:649-657`), so a
   *  region that became a leaf (`overrideImage`, `Entity.java:395-405`) is sorted among its siblings
   *  by this tick in the cluster's DOT (`state-composite-cluster.ts#resolveLeafsInCreationOrder`). */
  concurrentRegionCreationIndexes?: readonly number[];
  /** Orientation of the `--`/`||` line(s) that produced `concurrentRegions`
   *  (undefined until one is seen). Last-write-wins, mirroring upstream
   *  `Entity#setConcurrentSeparator`, called on every eligible visit.
   *  @see ~/git/plantuml/.../statediagram/StateDiagram.java:194-206 */
  concurrentSeparator?: Separator;
  /**
   * Transitions that belong to this composite state's inner scope.
   * Empty for leaf states. Inner transitions are NOT hoisted to the
   * parent scope — they are rendered within the composite's bounding box.
   */
  transitions: Transition[];
  color?: string;
  /** stdd T3d: the raw `[[...]]` token of the declaration (`CommandCreateState.java` / `CommandCreatePackageState
   *  .java:181-186`, `arg.get(UrlBuilder.URL_KEY, 0)`); built into a `Url` with the theme's `topurl` at layout
   *  (`state-sizing.ts#stateUrlOf`), as upstream reads `skinParam.getValue("topurl")` there. */
  url?: string;
  /**
   * Raw `##[dotted|dashed|bold]colorname` line-color spec, stored
   * unparsed (matches `color`'s own precedent — neither field is
   * consumed downstream yet; the DOT-parity comparator never reads
   * colors, so the only parity-relevant effect of capturing this is
   * stopping the declaration line from being dropped entirely).
   * @see ~/git/plantuml/.../statediagram/command/CommandCreateState.java:108
   */
  lineColor?: string;
  stereotype?: string;
  /**
   * Body/description lines added via `State : text` (either inline on the
   * `state X : text` declaration, or as a standalone line referencing an
   * already-declared or auto-created state). Multiple lines accumulate in
   * source order — mirrors `Bodier#addFieldOrMethod`, called once per line.
   * @see ~/git/plantuml/.../statediagram/command/CommandCreateState.java
   *      (inline ADDFIELD group)
   * @see ~/git/plantuml/.../statediagram/command/CommandAddField.java
   *      (standalone `CODE : text` form)
   */
  description?: string[];
  /**
   * Set to `'frame'` for a composite opened with the `frame X { ... }` /
   * `frame X begin` keyword instead of `state X { ... }`. Upstream models
   * this as a `GroupType.PACKAGE` entity decorated with `USymbols.FRAME`
   * (a visually distinct container), rather than `GroupType.STATE` — the
   * DOT/SVG layer (T3/T4) uses this to pick the frame envelope instead of
   * the composite-state cluster envelope. `undefined` means a regular
   * `state { }` composite.
   * @see ~/git/plantuml/.../statediagram/command/CommandCreatePackage2.java
   */
  container?: 'frame';
  /** stdd T6c: declared with a `{ }`/`begin` block (`state X {`, `frame X {`), a GROUP upstream even when
   *  empty: `GroupMakerState#getImage` gives a childless group a plain `EntityImageState`
   *  (`GroupMakerState.java:113-114`), while a childless LEAF under `hide empty description` is
   *  `EntityImageStateEmptyDescription` (`GeneralImageBuilder.java:135-136`) -- bitaxo-18's `state A` against
   *  `state B {}`. Read through `state-sizing.ts#hidesEmptyDescription`. */
  explicitComposite?: true;
  /**
   * `true` when this composite exists ONLY as an auto-created, never
   * explicitly declared, ANCESTOR segment of a dotted id opened as a
   * composite/frame BLOCK (`state S.I { ... }` auto-creates phantom
   * ancestor `S`) -- mission A4 Phase L iter 10. Mirrors upstream
   * `GroupType.PACKAGE`, materialized once at end-of-parse by
   * `eventuallyBuildPhantomGroups` for any quark still lacking Entity data:
   * `Entity.isAutarkic`'s very first line unconditionally disqualifies a
   * PACKAGE-type group from autonom, regardless of link topology
   * (`abel/Entity.java:691-692`). A LEAF-style dotted declare (`state A.X`,
   * no `{ }`) instead promotes its ancestors EAGERLY via upstream
   * `ensureParentState` (`StateDiagram.java:268-280`) to ordinary
   * `GroupType.STATE` (autonom-eligible, no flag) -- so this is set ONLY by
   * the composite/frame block-opener path, and is CLEARED the moment a
   * later leaf-style declare passes through the same ancestor (mirrors
   * `ensureParentState`'s own eager-promotion check, which stops walking up
   * as soon as it finds a quark that already has Entity data -- so any
   * still-phantom ancestor a LATER leaf declare reaches gets promoted for
   * good).
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java#eventuallyBuildPhantomGroups
   * @see ~/git/plantuml/.../abel/Entity.java#isAutarkic (:691-692)
   */
  autoPhantom?: true;
  /**
   * `$tag` names attached via a state declaration (`state Foo $a $b`, or
   * `state "A" as a $tagA { }` on a composite opener) — upstream
   * `Entity#stereotags()` (`Set<Stereotag>`). Consulted by `remove`/
   * `restore $tag` directives (state-directives.ts#computeRemovedIds) —
   * mirrors the class engine's `Classifier.tags` precedent exactly (the
   * SAME shared `CommandCreateClassMultilines#addTags`/`Stereotag`/
   * `HideOrShow` machinery upstream, reused verbatim by the state factory).
   * @see ~/git/plantuml/.../stereo/Stereotag.java
   * @see ~/git/plantuml/.../statediagram/command/CommandCreateState.java (TAGS1/TAGS2)
   * @see ~/git/plantuml/.../statediagram/command/CommandCreatePackageState.java (TAGS1/TAGS2)
   */
  tags?: string[];
  /**
   * For `kind: 'json'` only — the parsed JSON value (`CommandCreateJson`'s
   * `BodierJSon#setJson`). Absent when the json body failed to parse (a
   * `json Name {}` with no/malformed data — mirrors upstream leaving the
   * leaf entity created but never calling `setJson`; see
   * state-json-sizing.ts's empty-object fallback for how sizing represents
   * that state) or for a `kind: 'json'` state created only as an
   * auto-referenced endpoint that a real `json` declaration never reached
   * (should not occur in practice — `json` leaves have no forward-reference
   * grammar, unlike `state`).
   * @see ~/git/plantuml/.../objectdiagram/command/CommandCreateJson.java
   * @see {@link JsonNode}
   */
  jsonValue?: JsonNode;
  /**
   * mission G4 S7 (mechanism 10, id-numbering creation-index gap): the
   * parse-time tick this state's uid slot was assigned, drawn from a SINGLE
   * counter (`ParseState.creationCounter`) shared across states, concurrent-
   * region phantom groups, pseudostates, AND transitions -- mirrors upstream
   * `net.atmp.CucaDiagram#cpt1` (`AtomicInteger`), the SAME shared counter
   * behind every `Entity`'s own `ent%04d` uid AND every `Link`'s own `lnkN`
   * uid (`Entity.java:171`, `Link.java:135`). Stamped exactly once, at the
   * SINGLE true creation chokepoint (`state-parse-resolve.ts
   * #registerStateInto`), in the SAME order the two-pass parser (`Pass`'s
   * doc, state-parse-state.ts) already walks the source -- which already
   * matches jar's own PASS ONE (declarations, nested source order) THEN
   * PASS TWO/THREE (transitions + their own newly-auto-created endpoints,
   * transition source order) structure. A `remove`d state still gets a
   * REAL `creationIndex` here (stamped during parsing, before
   * `state-directives.ts#filterRemovedEntities` excludes it from the
   * layout-input AST) -- its raw tick is simply never attached to any
   * surviving `StateNodeGeo`, which is what lets downstream numbering
   * (`renderer-uid.ts`) use RAW `creationIndex` values directly (no dense
   * re-packing) and still reproduce jar's real id GAP at that slot.
   * `undefined` for every hand-built AST literal predating this mission
   * (unit-test fixtures, `renderer-uid.ts`'s own dense-fallback path).
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java#cpt1
   * @see ~/git/plantuml/.../abel/Entity.java:171
   * @see plans/g4-state-svg/ledger.md (S7)
   */
  creationIndex?: number;
}

// ---------------------------------------------------------------------------
// Transition
// ---------------------------------------------------------------------------

/** Compass-style forced routing direction on a transition arrow. */
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';

export interface Transition {
  /** State id; '[*]' for initial/final pseudostates. */
  from: string;
  /** State id; '[*]' for initial/final pseudostates. */
  to: string;
  guard?: string;
  action?: string;
  /**
   * Free-form label — set when there is a label that does not parse into
   * distinct guard/action parts (or when guard + action are both present,
   * this holds the raw label text).
   */
  label?: string;
  /**
   * Forced routing direction from an abbreviated arrow body
   * (`-right->`, `-r->`, …). Absent when the transition uses a plain `-->`.
   * Reverse-arrow transitions (`A <-- B`) default to `'left'` when no
   * explicit direction is written — mirrors `getDefaultDirection()`.
   * @see ~/git/plantuml/.../statediagram/command/CommandLinkStateCommon.java#getDirection
   */
  direction?: TransitionDirection;
  /** True for an `x-->`-style arrow (circled cross at the start). */
  crossStart?: boolean;
  /** True for a `-->o`-style arrow (circle decoration at the end). */
  circleEnd?: boolean;
  /**
   * Raw contents of the `-[style]->` bracket, e.g. `'dotted'`, `'bold'`,
   * `'#red'`, or `'node'` (the `node` keyword asks for the label to be
   * drawn as an intermediate transition node — a layout decision, not a
   * parser one; T3/T4 interprets this string).
   * @see ~/git/plantuml/.../descdiagram/command/CommandLinkElement.java#LINE_STYLE
   */
  arrowStyle?: string;
  /** `<<stereotype>>` written on the transition itself. */
  stereotype?: string;
  /**
   * Total dash-count of the arrow body (`-->` = 2, `--->` = 3, …) — upstream
   * uses this as the graphviz `minlen` driver for the transition edge.
   * @see ~/git/plantuml/.../statediagram/command/CommandLinkStateCommon.java#executeArg
   *      (`LinkArg.build(label, length, ...)`)
   */
  length?: number;
  /**
   * Text from a `note [pos] on|of link : text` command attached to this
   * (the most-recently-parsed) transition.
   * @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnLink.java
   */
  linkNote?: string;
  /**
   * Position of `linkNote` relative to the transition's own label — LEFT/TOP
   * put the note ahead of the label in the merged edge label, RIGHT/BOTTOM
   * put it after (`CucaNote#getPosition`, default BOTTOM when unwritten).
   * Only meaningful when `linkNote` is set.
   * @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnLink.java#executeInternal
   * @see ~/git/plantuml/.../svek/SvekEdge.java (SvekEdge.java:308-326, mergeLR/mergeTB)
   */
  linkNotePosition?: NotePosition;
  /** stdd T5b: the `note on link #colour` BACK colour (`CucaNote#getColors`, `CommandFactoryNoteOnLink.java:217`),
   *  `Style#getSymbolContext`'s override of the rose note's fill (`Style.java:371-373`). */
  linkNoteColor?: string;
  /**
   * mission G4 S7 (mechanism 10, id-numbering creation-index gap): the
   * parse-time tick this transition's `lnkN` uid slot was assigned --
   * stamped once, at the SINGLE true creation chokepoint
   * (`state-parse-state.ts#emitTransition`), AFTER both endpoints have
   * already been resolved-or-auto-created (`state-commands.ts`'s transition
   * dispatch calls `ensureState(from)` then `ensureState(to)` before
   * `emitTransition` -- mirrors upstream `Link`'s own ctor tick
   * (`Link.java:135`, `getUniqueSequence("lnk")`), which always fires AFTER
   * `CommandLinkStateCommon#getEntity` has already resolved/created both
   * endpoints). See {@link State.creationIndex}'s doc for the full shared-
   * counter mechanism and why RAW values (no dense re-packing) are correct.
   * `undefined` for every hand-built AST literal predating this mission.
   * @see ~/git/plantuml/.../abel/Link.java:135
   * @see plans/g4-state-svg/ledger.md (S7)
   */
  creationIndex?: number;
}

import type { NotePosition, StateNote } from './ast-notes.js';

export type { NotePosition, StateNote } from './ast-notes.js';

// ---------------------------------------------------------------------------
// Remove/restore directives
// ---------------------------------------------------------------------------

/**
 * A `remove`/`restore` directive (upstream `CommandRemoveRestore`, registered
 * verbatim by `StateDiagramFactory` from the classdiagram package — the SAME
 * command class, not a state-specific reimplementation). Excludes the
 * matched entities from the exported graph entirely: nodes disappear and any
 * transition touching a removed entity is dropped too. Mirrors the class
 * engine's `RemoveRestoreDirective` (class ast.ts) exactly.
 * @see ~/git/plantuml/.../classdiagram/command/CommandRemoveRestore.java
 * @see ~/git/plantuml/.../statediagram/StateDiagramFactory.java:87
 */
export interface RemoveRestoreDirective {
  kind: 'removerestore';
  /** stdd T5a: `hide`/`show` (`CommandHideShow2`, `CucaDiagram#hideOrShow2`) share the matcher but
   *  keep the entity in the layout (`Entity#isHidden`, drawn through `UHidden`). */
  action: 'remove' | 'restore' | 'hide' | 'show';
  /**
   * Raw target expression, interpreted by
   * state-directives.ts#computeRemovedIds (mirrors `HideOrShow#isApplyable`):
   * `*` (or any `*`-wildcard pattern) matches every entity by name; `$tag`
   * matches {@link State.tags}; `<<stereotype>>` matches
   * {@link State.stereotype}; `@unlinked` matches entities with no incident
   * transition; anything else is a bare/wildcard id match.
   */
  what: string;
}

// ---------------------------------------------------------------------------
// Root AST
// ---------------------------------------------------------------------------

export interface StateDiagramAST {
  states: State[];
  transitions: Transition[];
  /**
   * Optional so pre-existing literal `StateDiagramAST` construction (e.g. in
   * layout/renderer tests predating notes support) does not need updating —
   * `parseState` always sets this to `[]` at minimum; treat as `notes ?? []`
   * when reading.
   */
  notes?: StateNote[];
  /**
   * Additive (optional, unlike `states`/`transitions` above) so existing AST
   * literal constructors elsewhere (layout/renderer tests predating this
   * feature) are unaffected — absent is equivalent to `[]` everywhere this
   * is read (state-directives.ts#computeRemovedIds, layout.ts).
   */
  removeDirectives?: RemoveRestoreDirective[];
  /**
   * `hide empty description` / `show empty description` — states with no
   * description/body lines render as a simple one-compartment box when
   * true, instead of the default two-compartment shape.
   * @see ~/git/plantuml/.../statediagram/command/CommandHideEmptyDescription.java
   */
  hideEmptyDescription?: boolean;
  /** stdd T5a: `hide X`/`show X` directives (`CucaDiagram.java:628-631` `hides2`), evaluated at
   *  export like {@link removeDirectives} (`CucaDiagram.java:769-781`). */
  hideDirectives?: RemoveRestoreDirective[];
  /** stdd T4a: the `scale` directive (`core/scale-command.ts`), resolved at export against the
   *  chrome-and-margin dimension (`TextBlockExporter.java:205-209`). */
  scale?: ScaleSpec;
  /**
   * `left to right direction` / `top to bottom direction` (default is
   * top-to-bottom when absent) — global graphviz rankdir override.
   * @see ~/git/plantuml/.../command/CommandRankDir.java
   */
  rankdir?: 'top-to-bottom' | 'left-to-right';
  /**
   * title/caption/legend/header/footer/mainframe chrome, populated by
   * {@link matchAnnotationCommand} at the parser's command-dispatch position
   * (mission G0b, decisions.md D3). Optional (unlike `states`/`transitions`)
   * so pre-existing hand-authored AST literal fixtures compile unchanged; a
   * real `parseState()` call always sets it via `createAnnotations()` —
   * `isEmpty()` distinguishes "no chrome present" from "not yet populated".
   */
  annotations?: DiagramAnnotations;
  /**
   * `sprite $name [WxH/N[z]] { ... }` definitions (mission SI5b/T4),
   * populated by {@link matchSpriteCommand} at the SAME dispatch position
   * as {@link matchAnnotationCommand} (tried immediately after it, mirroring
   * upstream's `CommonCommands.addTitleCommands` then `addCommonCommands2`
   * registration order). Optional so hand-authored AST literal fixtures
   * compile unchanged; a real `parseState()` call always sets it via
   * `createSpriteRegistry()`.
   */
  sprites?: SpriteRegistry;
  /**
   * mission G4 S7 (mechanism 10, id-numbering creation-index gap): the
   * parse-time `creationIndex` lazily assigned to each scope's synthetic
   * `[*]`-derived pseudostate (`*start*`/`*end*`, upstream `StateDiagram
   * #getStart`/`#getEnd`) -- these are NOT `State` nodes in this port's AST
   * (unlike upstream's real, lazily-`reallyCreateLeaf`d `Entity`), so their
   * tick has nowhere else to live. Keyed by `pseudoTickKey(scopeId, which)`
   * (state-parse-state.ts) -- `scopeId` is the SAME string
   * `noteScopeId`/`concurrentRegionScopeId` already produce (top level `''`,
   * a composite's own `id`, or a concurrent region's `concurrentRegionScopeId`
   * form), matching the scope-id convention `state-composite-pass.ts
   * #scopedPseudoIds`/`addLocalPseudoNodes` already use at layout time so
   * both sides agree on the same key without re-deriving it independently.
   * Populated once, at end-of-parse, from `ParseState.pseudoCreationIndex`
   * (mirrors `ast.states`/`ast.transitions`'s own end-of-parse handoff).
   * `undefined` for every hand-built AST literal predating this mission.
   * @see ~/git/plantuml/.../statediagram/StateDiagram.java#getStart
   * @see ~/git/plantuml/.../statediagram/StateDiagram.java#getEnd
   * @see plans/g4-state-svg/ledger.md (S7)
   */
  pseudoCreationIndex?: ReadonlyMap<string, number>;
  /**
   * mission G4 S14 (CONC-region bare-name global numbering): maps this
   * port's own internal, owner-local `concurrentRegionScopeId` key (e.g.
   * `"State2::CONC1"`) to the GLOBAL region number jar's real
   * `net.atmp.CucaDiagram#cpt2` counter assigns -- one tick per `--`/`||`
   * separator, in document (parse) order, regardless of which composite
   * owns it (upstream `StateDiagram#concurrentState`'s
   * `getUniqueSequence2(CONCURRENT_PREFIX)`, StateDiagram.java:194-208).
   * Consumed only by `renderer.ts#localScopeName` to translate a RENDERED
   * bare `CONC<n>` pseudo-anchor path id (`*start*CONC<n>-to-X`) from this
   * port's own per-owner-local numbering to jar's diagram-global one --
   * the internal `concurrentRegionScopeId` dedup key ITSELF is unchanged
   * (still owner-local; every other internal lookup keeps using it as-is).
   * Populated once, at end-of-parse, from `ParseState.concurrentGlobalIds`
   * (mirrors `pseudoCreationIndex`'s own end-of-parse handoff above).
   * `undefined` for every hand-built AST literal predating this mission.
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java#cpt2
   * @see ~/git/plantuml/.../statediagram/StateDiagram.java:194-208
   * @see plans/g4-state-svg/ledger.md (S14)
   */
  concurrentGlobalIds?: ReadonlyMap<string, number>;
}
