/**
 * The `DescriptiveLink` half of `ast.ts`, split out (a pure move) to keep that file under the 500-line cap when
 * dei T2b added `DescriptiveNode.leafType`; `ast.ts` re-exports both names, so every import path is unchanged.
 */
import type { MiddleDecor } from '../../core/svek/extremity/MiddleCircleDecor.js';
import type { Style } from '../../core/style/Style.js';
import type { NotePosition } from './note-grammar.js';

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

export type DescriptiveLinkStyle = 'solid' | 'dashed' | 'dotted' | 'bold';

export interface DescriptiveLink {
  from: string;
  to: string;
  /** `link.setPortMembers(key, null)` (`CommandCreateMap#executeNow`): the map row the link leaves from, written as
   *  the DOT tail port (`Ports#encodePortNameToId`) on the map's row table. */
  tailPortMember?: string;
  label?: string;
  /** Stripped from <<...>> either PRE-colon (`A --> B<<tag>>`, attached
   *  directly to an endpoint token -- style-selector/`remove` input ONLY,
   *  see `stereotypeIsLinkLabel`) or POST-colon-embedded (`A --> B :
   *  <<include>>`) in the link label. */
  stereotype?: string;
  /**
   * G1 I5e: true ONLY when `stereotype` came from the POST-colon-embedded
   * form (`: <<include>>` / `: text <<foo>>`, via `extractLinkStereotype`)
   * -- the ONE shape upstream actually draws as a visible edge `«tag»`
   * guillemet label (jar-verified `usecase/cevuji-49-bile305`). The
   * PRE-colon form (`CommandLinkElement`'s `STEREOTYPE` regex group,
   * attached directly after `ENT2` with no colon) feeds ONLY
   * `link.setStereotype()` for `getDefaultStyleDefinition(stereotype)`
   * (arrow skinparam/style-selector resolution, `svek/SvekEdge.java:289,
   * 817,875` -- unbuilt in this port, I2's ledgered "ArrowFont*" gap) and
   * `Link.isRemoved()`'s stereotype-removal match
   * (`abel/Link.java:492-498`) -- it is NEVER drawn as edge text upstream
   * (`CommandLinkElement.java`'s `Labels` class, which builds the real DOT
   * label, never reads the `STEREOTYPE` regex group at all). Absent
   * (`undefined`) means the pre-colon/style-only case -- `remove
   * <<stereotype>>` (`removeMatchingLinks`, element-grammar.ts) matches on
   * `stereotype` UNCONDITIONALLY regardless of this flag, faithfully
   * mirroring `Link.isRemoved()`'s own syntax-origin-blind match. */
  stereotypeIsLinkLabel?: true;
  /**
   * `remove <<stereotype>>` marker whose pattern matched THIS link's own
   * `stereotype` (exact match; single-label only -- this port's `stereotype`
   * field has no `Stereotype#getMultipleLabels()` composite equivalent).
   * Upstream `Link.isRemoved()` (net/sourceforge/plantuml/abel/Link.java
   * :492-498) checks this INDEPENDENTLY of `cl1.isRemoved() || cl2.isRemoved()`
   * -- a stereotyped link is dropped from DOT emission even when both
   * endpoints survive, and an untagged sibling link between the same two
   * endpoints is unaffected. `isStereotypeRemoved` (net/atmp/CucaDiagram.java
   * :739-745) folds the SAME `removed` HideOrShow list used for entities,
   * matched via `HideOrShow.isApplyable(Stereotype)` (HideOrShow.java:71-75).
   * A lazy marker like `DescriptiveNode.removed` -- set/cleared eagerly by
   * `removeMatchingLinks` at command-execution time (see that function's
   * doc for why eager evaluation is equivalent here); filtered out only at
   * DOT-edge build time (`layout.ts#buildDotEdges`).
   * @see plans/description-dot-100/decision-journal.md (I3)
   */
  removed?: true;
  /** Final resolved `LinkType.getStyle()` category: queue chars
   *  (`.`/`~`/`=`) set the initial value (`linkStyleFromQueue`); a bracket
   *  `dashed`/`dotted`/`bold` keyword (`WithLinkType.applyOneStyle`,
   *  `decoration/WithLinkType.java:143-148`) OVERRIDES it -- upstream
   *  applies `applyStyle` strictly AFTER `getLinkType`
   *  (`CommandLinkElement.executeArg:301,330`), so a bracket keyword always
   *  wins over a queue-char style on the same link. */
  style: DescriptiveLinkStyle;
  arrowHead?: 'open' | 'filled' | 'none';
  /**
   * Upstream `Link.getLength()` — the count of '-'/'.' characters in the
   * arrow token (`->` = 1, `-->` = 2, `->>` = 1, `--` = 2, `..` = 2, `.>` = 1,
   * `..>` = 2). Drives SvekEdge.isHorizontal() (length === 1) and therefore
   * whether a labeled link's dzeta contributes to nodesep or ranksep.
   *
   * CommandLinkElement.executeArg: when the resolved direction is LEFT or
   * RIGHT the upstream "queue" collapses to "-" (length 1, minlen 0);
   * otherwise length is the full BODY1+BODY2 character count.
   */
  length: number;
  /**
   * Upstream CommandLinkElement FIRST_LABEL / SECOND_LABEL — qualifier
   * labels attached to the tail (ENT1-side) / head (ENT2-side) end of the
   * link, e.g. `a "1" --> "0..*" b`. Swapped along with from/to whenever the
   * link is inverted (explicit `left`/`up` direction — see `length` above).
   */
  firstLabel?: string;
  secondLabel?: string;
  /** `LinkMiddleDecor`, the INSIDE group (`CommandLinkElement.java:149-157`). */
  middleDecor?: MiddleDecor;
  /** The pre-colon `<<a>><<b>>` run whole: `Stereotype.build(arg.get("STEREOTYPE"))`, every label signs the arrow style. */
  stereotypeRun?: string;
  /** `<style>` blocks executed before this link's line: its `Link#getStyleBuilder` (`CommandLinkElement.java:322`). */
  styleGeneration?: number;
  /** `getDefaultStyleDefinition(stereotype).getMergedStyle(link.getStyleBuilder())` (`SvekEdge.java:816-821,874-875`). */
  arrowStyle?: Style;
  /** `GraphvizImageBuilder#getStyleArrowCardinality` (`:124-130`, `:237`). */
  cardinalityStyle?: Style;
  /** `Link#getSupplementaryColors`: a bracket's later `;` segments (`WithLinkType.java:68-74`). */
  supplementaryColors?: readonly string[];
  /**
   * Raw HEAD1/HEAD2 `LinkDecor` tokens (trimmed, lowercased), swapped on
   * inversion like firstLabel/secondLabel. Recorded for future decor
   * rendering (diamond/crowfoot/circle/etc shapes) — not yet rendered.
   */
  tailDecor?: string;
  headDecor?: string;
  /**
   * Upstream ARROW_STYLE1/2 `hidden` keyword — `WithLinkType#goHidden`, which
   * sets a DRAW-time flag only. It does NOT produce `style=invis`: that comes
   * from `Link#isInvis()`, reading a different field entirely (corrected
   * 2026-08-13 — see `link-edge-attrs.ts#buildLinkEdgeAttributes`). The DOT
   * edge is still emitted, unchanged, and still counts structurally.
   */
  hidden?: boolean;
  /**
   * Upstream ARROW_STYLE `norank` keyword. Recorded only — no graphviz
   * constraint=false equivalent exists in the layout pipeline yet.
   */
  norank?: boolean;
  /**
   * Upstream ARROW_STYLE `single` keyword (`WithLinkType.goSingle` /
   * `isSingle`) — NOT a render style despite living in the same style-token
   * grammar as dashed/bold/hidden. It is a link-ADD-time dedup flag consumed
   * by `CucaDiagram.addLink` (`net.atmp.CucaDiagram.java:880-893`): when a
   * new link has `single === true` and the diagram already holds any other
   * link connecting the same two entities (`Link.sameConnections` —
   * endpoint identity match in either direction, ignoring style/type), the
   * new link is silently dropped instead of appended. Consumed at the
   * `state.ast.links.push` call site in parser.ts, not at render time.
   * @see ~/git/plantuml/.../decoration/WithLinkType.java:110-116,151-152
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java:880-893
   */
  single?: boolean;
  /**
   * Raw `[...]` ARROW_STYLE1/2 content (e.g. "#blue,dashed;#red"). Kept
   * verbatim for diagnostics -- the render-relevant tokens it contains
   * (dashed/dotted/bold/thickness=N/#color) are parsed into `style`/
   * `thicknessOverride`/`colorOverride` below; `plain`/`node` are
   * recognized-and-discarded (upstream's own `applyOneStyle` no-ops --
   * `plain` truly does nothing, `node`'s `useNodeStyle` flag has no
   * reachable svek/abel consumer either).
   */
  rawStyle?: string;
  /**
   * `WithLinkType.goThickness` (bracket `thickness=N` token,
   * `decoration/WithLinkType.java:159-160`) -- overrides the stroke width
   * `LinkStyle.getStroke3()` would otherwise default to (1, or 2 for
   * `bold`). A `dashed`/`dotted`/`bold` keyword occurring AFTER
   * `thickness=N` in the same bracket resets this to `undefined` (each
   * resets to a fresh `LinkStyle` instance upstream,
   * `decoration/LinkType.java:115-129`) -- token ORDER matters, ported
   * faithfully via sequential application in `parseArrowStyle`
   * (link-grammar.ts). `LinkStyle.getStroke3()` (java:98-109) ignores this
   * override entirely when `style === 'bold'` (hardcoded thickness 2) --
   * preserved as-is, not "fixed", per this mission's porting discipline.
   */
  thicknessOverride?: number;
  /**
   * `WithLinkType.applyOneStyle`'s else-branch (`decoration/
   * WithLinkType.java:161-163`): a bracket token that matches none of the
   * known keywords is a color (`HColorSet.getColorOrWhite`), applied to
   * BOTH the line stroke and the (same-color) filled extremity
   * (`svek/SvekEdge.java:884-893`). Only the FIRST `;`-separated segment
   * (upstream's `i === 0`, the primary/non-supplementary color) is
   * captured -- later segments feed upstream's multi-color `Rainbow`/
   * `supplementaryColors` drawing, a subsystem this port has never had
   * (`SvekEdge.ts`'s own class doc comment already lists "Rainbow/
   * multi-color links" as unported). The leading `#` (grammar-mandatory
   * for every non-keyword bracket token, `CommandLinkElement.LINE_STYLE`)
   * is stripped, matching this port's established inline-color-override
   * convention (`renderer-entity.ts#parseColorOverride`). Named colors
   * (`#blue`, `#green`) pass through as the bare CSS name verbatim -- this
   * port has no `HColorSet` name->hex table (I2, already-ledgered T19 gap),
   * so the value renders correctly in a browser but is not byte-identical
   * to the jar's own uppercase-hex emission.
   */
  colorOverride?: string;
  /** The trailing `#text:<c>` of the link line: the label font colour (`link-colors.ts`). */
  textColor?: string;
  /**
   * I3b write-set expansion (journaled) -- see `DescriptiveNode
   * .creationIndex`'s doc comment for the shared-counter mechanism. A
   * LEFT/UP-direction-inverted link burns TWO values (the discarded
   * pre-inversion `Link`, then the surviving inverted one) --
   * `descdiagram/command/CommandLinkElement.java:322-326`: `Link link = new
   * Link(...); if (dir == LEFT || dir == UP) link = link.getInv();` --
   * `Link#getInv()` (`abel/Link.java:145-147`) constructs a WHOLE NEW `Link`
   * (fresh `cucaDiagram.getUniqueSequence("lnk")` call), discarding the
   * first. Assigned at `command-table.ts`'s link-execute call site, AFTER
   * both endpoints are auto-created (`ensureEndpoint`) but BEFORE
   * `addLink`'s `single`-dedup check -- upstream constructs the `Link`
   * object (consuming its uid) unconditionally before `CucaDiagram
   * .addLink`'s dedup ever runs, so a dropped-as-duplicate `single` link
   * still burns its value.
   */
  creationIndex?: number;
  /**
   * dsw-T9: the link was built by `Link#getInv()` (`-left-`/`-up-` direction,
   * `CommandLinkElement.java:325-326`; `abel/Link.java:145-147` sets
   * `result.inverted = !this.inverted`). `from`/`to` are already post-inversion.
   * Only `true` is carried. Feeds `DotInputEdge.inverted`, which decides where
   * `from`'s shape line is declared (`Cluster.java:195-212,515-523`).
   */
  inverted?: true;
  /**
   * `note [pos] on|of link` -- upstream `Link#getNote()`'s `CucaNote`
   * display, kept OUT of `label` (`abel/Link.java:328-334`;
   * `CommandFactoryNoteOnLink#executeInternal` calls `link.addNote(CucaNote
   * .build(display, position, colors))`). `SvekEdge.java:307-326` merges an
   * `EntityImageNoteLink` sized from it INTO the label block rather than
   * concatenating text, which is why this is a field and not more `label`.
   * `addNote` REPLACES (`this.note = note`), so two `note on link` on the
   * same last link keep only the second.
   */
  linkNote?: string;
  /** `CucaNote#getPosition()` -- BOTTOM when the regex's optional `POSITION`
   *  group is absent (`CommandFactoryNoteOnLink.java`'s `executeInternal`:
   *  `Position position = Position.BOTTOM;`). Selects the merge operand order
   *  in `SvekEdge.java:318-325`. */
  linkNotePosition?: NotePosition;
  /** `CucaNote#getColors()` of the `note on link`, the plain `#color` form: the drawn polygon's fill. */
  linkNoteColor?: string;
}
