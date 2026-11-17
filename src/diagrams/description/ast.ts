/**
 * AST type definitions for PlantUML descriptive diagrams (component / use-case /
 * deployment).
 *
 * Upstream renders all three through one engine (`DescriptionDiagramFactory`),
 * modelling every element as a single type that carries a `USymbol` shape rather
 * than a per-diagram `kind` union. This unifies the prior `ComponentNode` /
 * `UCNode` shapes — which differed only in their `kind` union and the use-case
 * link `stereotype` field — into one model (decisions D1, D2).
 */

import type { Warning } from '../../core/warning/Warning.js';
import type { EntitySizing } from '../../core/svek/image/LeafSizingSubject.js';
import type { DescriptionEntityStyle } from './description-entity-style.js';
import type { USymbol } from '../../core/descriptive-keywords.js';
import type { DiagramAnnotations } from '../../core/annotations/index.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { StereotypeSpriteRef } from './ast-stereotype-sprite.js';
import type { DescriptionTogether } from './together.js';
import type { JsonNode } from '../../core/command/JsonNode.js';
import type { BodierMap } from '../../core/cucadiagram/BodierMap.js';

export type { StereotypeSpriteRef } from './ast-stereotype-sprite.js';

// ---------------------------------------------------------------------------
// Node
// ---------------------------------------------------------------------------

/** The `LeafType`s description draws with an image of their own (decisions D2). */
export type DescriptionLeafType = 'json' | 'map' | 'domain' | 'requirement';

export interface DescriptiveNode {
  /** A `\\l` or `\\r` in a group's display beats its title alignment (`Display.java:648-649`, `ClusterHeader.java:117-119`). */
  naturalAlignment?: 'left' | 'right';
  id: string;
  display: string;
  /** Upstream `USymbol` shape — drives both layout sizing and render dispatch. */
  symbol: USymbol;
  /** Nested children — non-empty only for container symbols. */
  children: DescriptiveNode[];
  /** Declared with a `{` body (CommandPackageWithUSymbol) — a GROUP entity
   *  at parse time even when the body is empty. Empty groups are demoted to
   *  leaves only later, at the svek stage (GraphvizImageBuilder.java:416-418),
   *  which is AFTER applySingleStrategy — so they never count as magma
   *  standalones. Braceless declarations are plain leaves. */
  declaredAsGroup?: true;
  /** `!pragma kermor on` only: the first TOP and BOTTOM note on this GROUP
   *  (`Entity.addNote(display, position, colors)`, `CommandFactoryNoteOnEntity
   *  .java:322`; `Cluster.getCucaNote` reads `getNotes(position).get(0)`, so a
   *  second note at the same position is ignored). Position is already
   *  `withRankdir`-resolved; LEFT/RIGHT notes are stored upstream but read by
   *  nothing in the kermor DOT path, so they are not kept here. */
  kermorNotes?: { top?: string; bottom?: string };
  /** The `#colour` of the note that took each {@link kermorNotes} slot: the `colors` of `Entity.addNote(display,
   *  position, colors)` (`CommandFactoryNoteOnEntity.java:322`), handed to `EntityImageNoteLink` (`Cluster.java:398`). */
  kermorNoteColors?: { top?: string; bottom?: string };
  /** Auto-vivified `GroupType.PACKAGE` wrapper synthesized ONLY at layout
   *  time from a dotted (`set separator`-qualified) declaration id that has
   *  no explicit `{ }` block of its own — mirrors upstream
   *  `CucaDiagram#eventuallyBuildPhantomGroups` (`net/atmp/CucaDiagram.java
   *  :323-336`), which materializes an intermediate Quark with no Entity
   *  data into a `GroupType.PACKAGE` group ONLY at `getTextBlock`/DOT-export
   *  time (`CucaDiagram.java:465`) — AFTER `applySingleStrategy`
   *  (`CucaDiagram.java:679`, the magma/standalone-chaining pass) already
   *  ran at parse-end (`DescriptionDiagram#checkFinalError`). Never present
   *  on a parser-produced node; only ever synthesized by
   *  `namespace-groups.ts#buildNamespaceGroups`, and consumed by
   *  `magma.ts#magmaGroups` to exclude its members from standalone-chaining
   *  (they belong to no *materialized* group at magma time upstream).
   *  @see ~/git/plantuml/.../net/atmp/CucaDiagram.java:323-336,465,679-702 */
  phantomGroup?: true;
  /** Auto-created from a bare/quoted link endpoint (LeafType.STILL_UNKNOWN);
   *  mutated to actor-or-interface at parse end (makeDiagramReady). Cleared
   *  once resolved. */
  stillUnknown?: true;
  /** `remove <id|$tag|*>` marker (CommandRemoveRestore.java). Upstream is a
   *  LAZY marker evaluated at print time (CucaDiagram.isRemoved): magma
   *  chaining and the degenerate check run on the UNFILTERED entity set;
   *  only DOT emission (nodes, edges touching removed, cluster members) and
   *  rendering filter it. `restore` clears the flag. */
  removed?: true;
  /** ALL consecutive `<<tag>>` stereotype labels on the declaration, in
   *  source order (upstream `Stereotype#getMultipleLabels()` -- one
   *  guillemet line drawn per entry, `EntityImageDescription.java:200-201`/
   *  `ClusterHeader.java:206-207`, `Display.create(labels)`).
   *
   *  Absent means no `<<...>>` token was present on the declaration at all.
   *  An EMPTY array means a run WAS present and consumed but contributed no
   *  visible label — upstream's own outcome for a `<<<...>>>` triple-bracket
   *  run and for a sprite-only `<<$name>>` (`StereotypeDecoration#cutLabels`
   *  / `#buildComplex`'s `circleSprite` label rewrite; see
   *  `parse-helpers-strings.ts#extractNodeStereotype`). Both render/measure
   *  as `TextBlockUtils.empty(0, 0)`, matching
   *  `EntityImageDescription.java:196-197`'s `stereotypeLabels.isEmpty()`
   *  branch, so every consumer that guards on `length > 0` is already
   *  correct; the distinction is preserved rather than collapsed because
   *  `hide`/`remove`/style-cascade lookups read the array itself.
   *
   *  S1L-tail F2-b widened this from the former "never an empty array"
   *  invariant, which predated routing this field through the real
   *  `Stereotype`/`StereotypeDecoration` port. */
  stereotype?: readonly string[];
  /**
   * The sprite half of the same `<<...>>` run (`StereotypeDecoration
   * .spriteName`/`spriteScale`/`htmlColor`). Present ONLY when the run named
   * a sprite; the labels above stay whatever `Stereotype#getLabels` produced
   * for it.
   *
   * `EntityImageDescription.java:193-194` tests the sprite FIRST and, when it
   * resolves, uses it INSTEAD of the label block — so a resolvable sprite
   * suppresses the `«...»` lines entirely, and an unresolvable one falls
   * through to them. That decision cannot be made at parse time (the
   * registry's internal-bundle tier is only complete once the whole block is
   * parsed), so the reference travels and the lookup happens in the sizer and
   * the renderer, symmetrically — see `EntityImageDescriptionDelegates.ts
   * #resolveStereotypeSprite` and `planning/sizer-renderer-parity.md`.
   */
  stereotypeSprite?: StereotypeSpriteRef;
  color?: string;
  /** `Stereotag` names (net.sourceforge.plantuml.stereo.Stereotag), attached
   *  via `$tag` tokens on the declaration line (CommandCreateElementFull's
   *  TAGS1/TAGS2 groups, added to the entity by
   *  CommandCreateClassMultilines.addTags). Matched by tag-form `remove`/
   *  `restore`/`hide` (HideOrShow#isApplyableTag) — see
   *  `parser.ts#removeEntity`. */
  tags?: string[];
  /** `USymbols.ARCHIMATE` (`CommandArchimate.java:144`): a rectangle by shape, `SName.archimate` by style (`USymbols.java:66`). */
  archimate?: boolean;
  /**
   * Upstream's `LeafType` for a leaf no `USymbol` describes (decisions D2): `json` (`CommandCreateJson`), `map`
   * (`CommandCreateMap`), `domain`/`requirement` (`CommandCreateDomain`). `GeneralImageBuilder` dispatches these on
   * `leaf.getLeafType()` (`GeneralImageBuilder.java:183-187,235-255`), so the sizer and the renderer read it before
   * {@link symbol}, which stays `rectangle` as filler. Absent means `LeafType.DESCRIPTION`, today's path.
   */
  leafType?: DescriptionLeafType;
  /** `BodierJSon#setJson`'s value (`CommandCreateJson.java:149`); absent when the data never parsed. */
  jsonValue?: JsonNode;
  /** `GroupType.DOMAIN`/`REQUIREMENT` (`CommandCreateDomain`): a null-usymbol group, drawn with {@link symbol}
   *  `package` (`Cluster.java:357-367,387`) but titled through `composite.title` (`ClusterHeader.java:152-165`). */
  groupType?: 'domain' | 'requirement';
  /** A map leaf's `BodierMap` (`CucaDiagram#createLeaf` builds one for `LeafType.MAP`), filled by `CommandCreateMap`. */
  mapBodier?: BodierMap;
  /** `<style>` blocks executed before this entity's line (`Entity.java:165,755-768`). */
  styleGeneration?: number;
  /** The merged styles this entity reads, set at layout start (`description-entity-style.ts`). */
  entityStyle?: DescriptionEntityStyle;
  /** The sizer's narrowed read of {@link entityStyle}. */
  entitySizing?: EntitySizing;
  /** Raw inline `[[url]]` token as written, brackets included (e.g.
   *  `[[http://x{tip}]]`). The layout/render seam builds the Url with the
   *  theme's topurl (`CommandCreateElementFull.java:333-337`). */
  url?: string;
  /**
   * I3b write-set expansion (journaled): parse-time creation-order value,
   * ONE shared sequence across every node AND link in the diagram -- mirrors
   * `net.atmp.CucaDiagram#cpt1` (`AtomicInteger`, starts at 0,
   * `addAndGet(1)` per assignment: `getUniqueSequenceValue()` for an
   * `Entity`'s `ent%04d` uid, `getUniqueSequence("lnk")` for a `Link`'s
   * `lnkN` uid -- `abel/Entity.java:171`, `abel/Link.java:135`). Assigned by
   * `parse-state.ts#emitNode` (every node, leaf or group alike -- the shared
   * `Entity` constructor assigns a uid unconditionally regardless of leaf
   * vs. group) at the exact moment the node is created (explicit
   * declaration OR link-endpoint auto-create, `ensureEndpoint`). Consumed
   * only by `renderer-uid.ts#buildUidPlan` to FORMAT the final `ent%04d`
   * id -- no layout math reads it. A `remove`d node still carries the index
   * it was assigned at declaration time (upstream never re-numbers on
   * removal; the value simply becomes an invisible gap once the removed
   * node is filtered out of `geo.nodes` at layout time).
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java:127,725-730
   */
  creationIndex?: number;
  /** `port`/`portin`/`portout` direction (abel/EntityPosition.java PORTIN/
   *  PORTOUT). `port` and `portin` both resolve to `'portin'`; `portout` to
   *  `'portout'` (descdiagram/command/CommandCreateElementFull.java:276-284).
   *  Only ever set on a `symbol: 'port'` leaf — drives rank assignment
   *  (source/sink) and the Svek `ClusterDotString` port-placeholder
   *  mechanism at the layout stage. */
  position?: 'portin' | 'portout';
}

// Link: `ast-link.ts` (split for the 500-line cap).
export type { DescriptiveLink, DescriptiveLinkStyle } from './ast-link.js';
import type { DescriptiveLink } from './ast-link.js';

// ---------------------------------------------------------------------------
// Root AST
// ---------------------------------------------------------------------------

export interface DescriptionDiagramAST {
  /** `remove @unlinked` pending (HideOrShow.isAboutUnlinked) — evaluated
   *  lazily in effectiveRemovedIds per Entity.isAloneAndUnlinked:457-476
   *  (every touching link hidden or other-endpoint removed; groups qualify
   *  when all children do). `restore @unlinked` clears it. */
  removeUnlinked?: true;
  /** Top-level nodes only; children are nested under their parent. */
  nodes: DescriptiveNode[];
  links: DescriptiveLink[];
  /**
   * Upstream skinparam Rankdir, set ONLY by `left to right direction`
   * (CommandRankDir.java). Absent = top-to-bottom default (upstream emits
   * no `rankdir` attribute at all in that case).
   */
  rankdir?: 'LR';
  /** `skinparam linetype ortho|polyline` — under ortho, svek emits edge
   *  labels as `xlabel=` instead of `label=` (SvekEdge.java:434-441) plus
   *  `splines=ortho;forcelabels=true;` graph attrs. */
  linetype?: 'ortho' | 'polyline';
  /** `set separator <sep>` / `set namespaceseparator <sep>`
   *  (CommandNamespaceSeparator.java) — splits a dotted declaration/
   *  reference id into a nested-package hierarchy. Absent (the parser's
   *  default) matches upstream `TitledDiagram`'s own field default (`private
   *  String namespaceSeparator = null;`, TitledDiagram.java:99) — NOT ".";
   *  `DescriptionDiagram` never overrides that default (unlike
   *  `StateDiagram`, which calls `setNamespaceSeparator(".")` in its own
   *  constructor), so a dot in a component/usecase id is an ordinary id
   *  character until `set separator` is written. Explicit `set separator
   *  none`/`null` records `null` here (same effective behavior as absent).
   *  @see ~/git/plantuml/.../classdiagram/command/CommandNamespaceSeparator.java
   *  @see ~/git/plantuml/.../TitledDiagram.java:99,118-123 */
  namespaceSeparator?: string | null;
  /**
   * `!pragma kermor on` (skin/PragmaKey.java:55) — svek's alternate
   * cluster/note DOT-emission path. Set by command-table.ts's `!pragma
   * kermor on` rule; read at note-attach time (parse-state.ts's
   * `attachNoteToEntity` — a kermor group-target note attaches to the
   * Entity directly, `CommandFactoryNoteOnEntity.java:322`, rather than
   * creating a separate note leaf + edge) and at layout time
   * (link-edge-attrs.ts's `computeGraphSpacing` ranksep variant,
   * `DotStringFactory.java:111-114,247-249`; layout.ts's `DotInputGraph
   * .kermor` passthrough to svek-dot-emit.ts's kermor cluster block).
   * Absent (the default) is upstream's own default (`PragmaKey` values
   * default false; `!pragma kermor on` is the only way to set it — no
   * `off`/toggle form is exercised by any fixture in this port).
   * @see ~/git/plantuml/.../svek/ClusterDotStringKermor.java
   * @see ~/git/plantuml/.../svek/Cluster.java:595-609
   * @see plans/description-dot-100/decision-journal.md (I2)
   */
  kermor?: true;
  /**
   * `!pragma layout elk` (cdd8 T3b) -- `CommandPragma.java:128-129` (inside
   * `!TeaVM.isTeaVM()`, case-insensitive NAME/VALUE) calls
   * `system.setUseElk(true)`, which `CucaDiagram.java:478-479` reads first to
   * swap in `CucaDiagramFileMakerElk`. The description diagram is a
   * `CucaDiagram`, so it takes the same maker as class. `descriptionPlugin
   * .requiresElk` reports it; `description-elk-adapter.ts` routes the layout.
   * (`!pragma layout smetana` stays unmodelled here, see command-table-directives.ts.)
   */
  layoutEngine?: 'elk';
  /**
   * `scale N` / `scale N/M` / `scale WxH` / `scale N width|height` /
   * `scale max N width|height` / `scale max WxH` (mission G1 I-scale) —
   * `CommandScale*` (6 forms, `command/CommonCommands.java
   * #addCommonScaleCommands`, wired for description diagrams via
   * `DescriptionDiagramFactory.java:90`'s `addCommonCommands1`). Parsed
   * by `command-table.ts` via the shared, diagram-type-agnostic
   * `matchScaleCommand` (`scale-command.ts`) — type-carrying only, no
   * layout math reads it (scale is an SVG-EMISSION-time concern only,
   * applied well after DOT/svek layout runs — see that module's own doc
   * comment for the full mechanism and jar Java citations). Copied
   * straight through by `layoutDescription` into
   * `DescriptionGeometry.scale`, mirroring the established `seed`/
   * `sprites` passthrough pattern above, and resolved to a clamped
   * numeric factor by `renderDescription` (`resolveScaleFactor`) against
   * the diagram's own UNSCALED document dimension.
   */
  scale?: ScaleSpec;
  /** `!pragma layout smetana`: `nodes` is filled root leaves first (`CucaDiagramFileMakerSmetana.java:283,589,636`). */
  smetanaDrawOrder?: boolean;
  /** `!pragma svginteractive`: the `SvgOption#withInteractive` of `TextBlockExporter.java:299-304`. */
  svgInteractive?: boolean;
  /** `CommandSkinParam#executeArg`'s warnings for the hoisted `skinparam` lines (`CommandSkinParam.java:92-99`). */
  warnings?: readonly Warning[];
  /**
   * T17 seed thread: `UmlSource.seed()` (see `svg-graphics-core.ts#seedOf`),
   * computed by the plugin's `parse()` step from the raw `@start.../@end...`
   * block text and carried through `layoutDescription` into
   * `DescriptionGeometry.seed` for `renderDescription`'s `UGraphicSvg.build`
   * call — the only seam back to the original source text, since the public
   * plugin contract's `render(geo, theme)` never receives it directly.
   * Type-carrying field only; no layout math reads it.
   */
  seed?: bigint;
  /**
   * All pages, in source order, when the source contains `newpage`
   * (upstream `descdiagram/command/CommandNewpage.java` wraps a
   * `NewpagedDiagram` around a brand-new empty diagram per page) — the
   * first element is this same AST object. Absent for single-page sources
   * so existing callers/tests that only look at the top-level AST fields
   * are unaffected. Mirrors the class engine's identical field
   * (`class/ast.ts`'s `ClassDiagramAST.pages`, T7).
   * @see ~/git/plantuml/.../descdiagram/command/CommandNewpage.java:76-88
   * @see ~/git/plantuml/.../NewpagedDiagram.java:61-162
   */
  pages?: DescriptionDiagramAST[];
  /**
   * title/caption/legend/header/footer/mainframe chrome (mission G0b).
   * Always populated by `parseDescription` (default `createAnnotations()`
   * when no annotation directive is present) -- optional in the type only
   * so the shared structural consumer type `{ annotations?: DiagramAnnotations
   * }` (T7) stays uniform across engines.
   * @see ../../core/annotations/index.js
   */
  annotations?: DiagramAnnotations;
  /**
   * `sprite $name [WxH/N[z]] { ... }` definitions (mission SI5b/T4),
   * populated by {@link matchSpriteCommand} at the SAME dispatch position
   * as {@link matchAnnotationCommand} (tried immediately after it, mirroring
   * upstream's `CommonCommands.addTitleCommands` then `addCommonCommands2`
   * registration order). Optional so hand-authored AST literal fixtures
   * compile unchanged; a real `parseDescription()` call always sets it via
   * `createSpriteRegistry()`.
   */
  sprites?: SpriteRegistry;
  /**
   * `hide|show <id|$tag|*|<<stereotype>>>` entity-visibility rules
   * (classdiagram/command/CommandHideShow2.java -> `CucaDiagram#hideOrShow2`
   * -> `hides2: List<HideOrShow>`). An ORDERED list, folded per-entity in
   * declaration order by `element-grammar.ts#effectiveHiddenIds` (last
   * matching rule wins, `HideOrShow#apply`) -- draw-time-only suppression,
   * NEVER removes a node from the DOT graph/geo tree (contrast `removed`
   * above; see ledger.md I-hideshow's jar-verified evidence: SvekResult
   * .java:82-91, Cluster.java:298-300, klimt/drawing/AbstractUGraphic.java
   * :141). LAZY by design (unlike `.removed`'s parse-time-incremental
   * marker): pushed by `command-table.ts` at parse time, but only ever
   * EVALUATED post-parse against the final node set -- several corpus
   * fixtures (berufi-69-dara369 et al.) declare a matching rule BEFORE any
   * entity exists.
   * @see ~/git/plantuml/.../classdiagram/command/CommandHideShow2.java
   * @see ~/git/plantuml/.../cucadiagram/HideOrShow.java
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java:606-609,747-760
   */
  hideShowRules?: Array<{ what: string; show: boolean }>;
  /**
   * `hide|show [<<label>>] stereotype` PER-LABEL stereotype-visibility rules
   * (classdiagram/command/CommandHideShowByGender.java's PORTION ===
   * STEREOTYPE branch -> `CucaDiagram#hideOrShow` -> `hideOrShows:
   * List<EntityHideOrShow>`) -- the only `EntityPortion` this port's corpus
   * exercises for description diagrams (see ledger.md I-hideshow for the
   * unbuilt member/field/circled-character portions). `pattern` undefined
   * means "every label" (upstream `EntityGenderUtils.all()`, GENDER omitted
   * from the source line); a defined `pattern` matches only that exact
   * label (`EntityGenderUtils.byStereotype`, the `<<label>>`-decorated
   * source form, guillemets stripped here). Folded PER LABEL, not per
   * entity, by `element-grammar.ts#visibleStereotypeLabels`
   * (`CucaDiagram#isStereotypeLabelShown`) -- LAZY for the identical reason
   * `hideShowRules` above is (`favega-89-rado990`'s `hide stereotype` is
   * the diagram's FIRST line, before any entity exists).
   * @see ~/git/plantuml/.../classdiagram/command/CommandHideShowByGender.java
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java:574-598
   */
  stereotypeVisibilityRules?: Array<{ pattern?: string; show: boolean }>;
  /** cdd3-T18: every `together { }` block, in opening order (`./together.ts`). */
  togethers?: DescriptionTogether[];
}
