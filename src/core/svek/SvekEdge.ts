import type { UGraphic } from '../klimt/UGraphic.js';
import type { UDrawable } from '../klimt/shape/UDrawable.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../klimt/shape/TextBlockUtils.js';
import { VerticalAlignment } from '../klimt/geom/VerticalAlignment.js';
import type { Point2D } from '../klimt/UTranslate.js';
import type { Paint } from '../paint.js';
import { HColorSimple } from '../klimt/color/HColorSimple.js';
import type { HColorOrPaint } from '../klimt/color/ColorMapper.js';
import type { FontConfiguration } from '../klimt/shape/UText.js';
import { UTranslate } from '../klimt/UTranslate.js';
import { UText } from '../klimt/shape/UText.js';
import { UEmpty } from '../klimt/shape/UEmpty.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import { UComment } from '../klimt/shape/UComment.js';
import { UGroup, UGroupType } from '../klimt/shape/UGroup.js';
import { Fore } from '../klimt/Fore.js';
import { Back } from '../klimt/Back.js';
import type { DotPath } from '../klimt/shape/DotPath.js';
import { buildDotPathFromSplinePoints, edgeMidpoint } from './svek-edge-geometry.js';
import { placeHeadExtremity, placeTailExtremity } from './svek-edge-extremity.js';
import type { PlacedExtremity } from './svek-edge-extremity.js';
import { buildTextBlock } from './image/EntityImageDescriptionTextBlock.js';
import { parseWithNewlines } from '../klimt/creole/DisplayNewlines.js';
import { Pragma } from '../skin/Pragma.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import { strokeOfLink } from './svek-edge-stroke.js';
import { ExtremityArrow } from './extremity/ExtremityArrow.js';
import { parseMagicArrowLabel, type MagicArrowDirection } from '../edge-label-box.js';
import { TextBlockArrow2 } from '../klimt/shape/TextBlockArrow2.js';
import type { AtomImageResolver } from '../creole-atoms.js';
import { drawMiddleDecor, LABEL_SHIELD, type MiddleDecor } from './extremity/MiddleCircleDecor.js';
import type { MagneticBorder } from '../klimt/geom/MagneticBorder.js';
import { UStroke } from '../klimt/UStroke.js';
import { getLinkTypeName, looksLikeRevertedForSvg, lookupDecors1, lookupDecors2 } from './extremity/link-decor.js';
import type { LinkDecorName } from './extremity/link-decor.js';

/**
 * SvekEdge.ts — the DRAWING half of `svek/SvekEdge.java` (~1361 ln):
 * spline body, per-end extremity decorations, dashed/bold styling,
 * label/stereotype placement, and the edge's own comment/group
 * wrapper. Ported for T13; the LAYOUT half (dot round-tripping, label
 * position solving, DOT-attribute emission) stays with this port's
 * existing `src/diagrams/description/` layout — see `layout-helpers
 * .ts`'s `DescriptionEdgeGeo`/`link-edge-attrs.ts` (already built,
 * T5/T5b/etc — not touched by this task).
 *
 * `LinkStrategy.SIMPLEST`-only scope (verified against upstream, not
 * an assumption): `Link.getLinkStrategy()` (abel/Link.java:103) always
 * returns `LinkStrategy.SIMPLEST` — the `LEGACY_toberemoved` branch is
 * a commented-out dead `return` in the SAME method. Every upstream
 * `SvekEdge` member gated on `getLinkStrategy() == LEGACY_toberemoved`
 * (`getExtremity`, `getExtremitySpecial`, `isThereTwo`, `count`,
 * `PointListIterator`-based extraction from a rendered graphviz SVG
 * string) is therefore DEAD CODE in the current upstream jar and is
 * NOT ported here — this port's own layout never round-trips through a
 * rendered graphviz SVG string in the first place (`DescriptionEdgeGeo
 * .points` already carries plain control-point numbers), so there
 * would be nothing to feed that machinery even if it were ported.
 *
 * This port has no `abel/Link.java` class (the link model is the
 * description parser's `DescriptiveLink`), so the three `Link` members
 * `SvekEdge.drawU` consumes travel with this class instead:
 * `commentForSvg`/`idCommentForSvg` (Link.java:106-120) are private
 * methods below, and `Link#getUid`/entity names/uids/`getLocation`/
 * `getCodeLine` become plain `SvekEdgeInput` fields.
 *
 * Adapter boundary (interface contract, T13 mission brief): this class
 * does NOT import `DescriptionEdgeGeo` (that would create a
 * `core/svek` -> `diagrams/description` dependency, backwards per this
 * project's layering — no existing `core/svek/*` file imports from
 * `diagrams/*`). `SvekEdgeInput` below is `core/svek`'s own decoupled
 * shape; a later task adapts `DescriptionEdgeGeo` -> `SvekEdgeInput`.
 *
 * Full cut-line (every unported `SvekEdge` member + reason) is in the
 * T13 report, not repeated field-by-field here; the highlights are:
 * DOT/appendLine/rankSame emission (owned by `link-edge-attrs.ts`),
 * `Kal`/quantifier/role text, notes-on-links, `Rainbow`/multi-color
 * links, `MagneticBorder`, `Cluster`-aware trimming, and
 * `LinkConstraint` drawing — none of which this port's simplified
 * description-diagram data model produces today.
 */
export type SvekLinkStyle = 'solid' | 'dashed' | 'dotted' | 'bold';

/** `HColor#isTransparent` over the spellings a `Paint` can hold (`HColorSet.java:82-83`). */
function isTransparentPaint(paint: HColorOrPaint): boolean {
  if (paint instanceof HColorSimple) return paint.isTransparent();
  if (typeof paint !== 'string') return false;
  const lower = paint.toLowerCase();
  return lower === 'none' || lower === 'transparent' || lower === '#00000000';
}

/** `SvekEdge.java:372-373`: the margin around the label block (`marginLabel`). */
export const EDGE_LABEL_MARGIN = 1;
/** `SvekEdge.java:372-373`: the same margin for a self-loop. */
export const SELF_LOOP_EDGE_LABEL_MARGIN = 6;

/** `CucaNote#getPosition()` of a `note on link` (`SvekEdge.java:318-325`). */
export type SvekLinkNotePosition = 'left' | 'right' | 'top' | 'bottom';

/** The `EntityImageNoteLink` block `SvekEdge.java:312-326` merges with the label text. */
export interface SvekEdgeLabelNote {
  readonly block: TextBlock;
  readonly position: SvekLinkNotePosition;
}

export interface SvekEdgeLabel {
  readonly text: string;
  /** A `note on link`: the label block becomes `mergeLR/TB(labelOnly, note)` by `position`, drawn at the table
   *  corner (`SvekEdge.java:951-954`). Needs `w`/`h`. */
  readonly note?: SvekEdgeLabelNote;
  /** With `w`/`h`: the CENTRE of the DOT label table the engine placed
   *  (the jar's corner is `SvekEdge#getXY`, the table polygon's min). */
  readonly x: number;
  readonly y: number;
  /** The label table graphviz was given (`SvekEdge#appendTable`'s
   *  `(int)`-truncated `WIDTH`/`HEIGHT`). When both are present the label
   *  is drawn as `SvekEdge#drawU` does (`:951-954`): the text block at the
   *  table corner plus `labelShield`, inside its `marginLabel`. Absent for
   *  the link-note labels (a distinct mechanism), which keep `x`/`y` as the
   *  text origin. */
  readonly w?: number;
  readonly h?: number;
}

/** A quantifier text, at the corner the layout resolved (`SvekEdge.java:750-767,1205-1218`). */
export interface SvekEdgeEndText {
  readonly text: string;
  /** The block the engine measured (`SvekEdge#startTailText`/`endHeadText`); drawn as is when given, `text` unread. */
  readonly block?: TextBlock;
  readonly x: number;
  readonly y: number;
  readonly font: FontConfiguration;
}

export interface SvekEdgeInput {
  /** `Link#getUid()` (e.g. `lnk3`) — rendered as the `<g id="...">`
   *  attribute via `UGroupType.DATA_UID` (see `buildGroup`). */
  readonly uid: string;
  /** Graphviz-spline-format control points: `points[0]` is the curve
   *  start, subsequent (cp1, cp2, endpoint) triples each add one cubic
   *  bezier segment (see `svek-edge-geometry.ts`). */
  readonly points: readonly Point2D[];
  /** `Link#getEntity1().getName()` — display name of the tail entity
   *  (near `points[0]`); used by the `<!--link X to Y-->` comment and
   *  the path's `id` (`idCommentForSvg`). */
  readonly from: string;
  /** `Link#getEntity2().getName()` — display name of the head entity
   *  (near the last point). */
  readonly to: string;
  /** `Link#getEntity1().getUid()` (e.g. `ent0001`) — rendered as the
   *  group's `data-entity-1` attribute via `DATA_ENTITY_1_UID`. */
  readonly fromUid: string;
  /** `Link#getEntity2().getUid()` — rendered as `data-entity-2`. */
  readonly toUid: string;
  /** `Link#getLocation().getPosition()` — the `data-source-line`
   *  group attribute (upstream passes location unconditionally; absent
   *  here simply omits the attribute, like upstream's null location). */
  readonly sourceLine?: number;
  /** `Link#getCodeLine()` — the path's `codeLine` attribute (only
   *  emitted by upstream under `-codeLine`-style tracing; optional). */
  readonly codeLine?: string;
  readonly style: SvekLinkStyle;
  /** `link.getUrl()` (`SvekEdge.java:857-859`, `:992-993`): the anchor around the path, arrowheads and labels. */
  readonly url?: { readonly url: string; readonly tooltip: string };
  /**
   * The stroke `SvekEdge#drawU` applies, already resolved by an engine that holds the real `LinkType`
   * (`SvekEdge.java:895-905`). When given, {@link style} and the thickness inputs below are not read.
   */
  readonly stroke?: UStroke;
  /** `DescriptiveLink.thicknessOverride` (bracket `thickness=N`) — see
   *  `svek-edge-stroke.ts#strokeForStyle`'s doc comment for the per-style
   *  override semantics (BOLD ignores this, matching upstream). */
  readonly styleThickness?: number;
  /** `defaultThickness` (`SvekEdge.java:265`, `skinparam arrowThickness`): the stroke a non-normal link takes. */
  readonly defaultThickness?: number;
  /** `styleLine.getStroke()` (`SvekEdge.java:876`): the `arrow` style's thickness and dash. */
  readonly suggestedStroke?: UStroke;
  /** `Rainbow#getArrowHeadColor` (`HeadColor`, `Rainbow.java:83-90`); absent means {@link color}. */
  readonly headColor?: HColorOrPaint;
  /** `link.getSupplementaryColors()`: extra paths drawn offset (`SvekEdge.java:1141-1145`). */
  readonly supplementaryColors?: readonly HColorOrPaint[];
  /** `Link.inverted`: a left or up arrow runs the other way (`Link.java:145-147,423-428`). */
  readonly linkInverted?: boolean;
  /** `wrapWidth` (`SvekEdge.java:291-294`): the arrow style's `MaximumWidth`, else `skinparam maxMessageSize`. */
  readonly labelMaxWidth?: number;
  /** A `<$sprite>` or `<img>` atom in the label. */
  readonly resolveAtomImage?: (font: FontConfiguration) => AtomImageResolver;
  /** `linkType.getMiddleDecor()` with `getMiddleFactory(arrowLollipopColor, backgroundColor)` (`:982-990`). */
  readonly middleDecor?: { readonly decor: MiddleDecor; readonly backColor: Paint; readonly diagramBackColor: Paint };
  /** `startTailText`, `endHeadText` (`:330-340`), centred on the table graphviz placed (`:956-980`). */
  readonly tailQuantifier?: SvekEdgeEndText;
  readonly headQuantifier?: SvekEdgeEndText;
  /** `getSvekNode1/2().getMagneticBorder()`, or the cluster's (`:923-942`), in this edge's coordinates. */
  readonly magnet1?: MagneticBorder | undefined;
  readonly magnet2?: MagneticBorder | undefined;
  /** Raw decor token near `from` (`DescriptiveLink.tailDecor` — e.g.
   *  `'<|'`, `'o'`, `'<<'`) — upstream's `head1`, resolved via
   *  `LinkDecor.lookupDecors1` (`link-decor.ts`). */
  readonly tailDecor?: string;
  /** Raw decor token near `to` — upstream's `head2`, resolved via
   *  `LinkDecor.lookupDecors2`. */
  readonly headDecor?: string;
  /** Line/arrowhead-fill color — upstream's `Rainbow#getColor()`
   *  (this port has no multi-color `Rainbow`, so one color serves both
   *  the line and every filled extremity). */
  readonly color: HColorOrPaint;
  /** Diagram background paint — upstream's `skinParam.getBackgroundColor()`,
   *  used by hollow decors (`CIRCLE`, `SQUARE`, `SVEK_CIRCLE_CONNECT`, …)
   *  to punch a background-colored hole. */
  readonly backgroundColor: Paint;
  readonly label?: SvekEdgeLabel;
  readonly stereotype?: string;
  /** Font for both `label` and `stereotype` text — required only when
   *  either is present (see `drawLabels`). */
  readonly labelFont?: FontConfiguration;
  /** `SvekEdge.java:376-381` `getMessageTextAlignment`: `skinParam.getDefaultTextAlignment(CENTER)` -- the label
   *  block's alignment when the text carries no `\l`/`\r` marker (`Display.java:648-649` lets a marker override it).
   *  Absent means CENTER. */
  readonly labelAlignment?: HorizontalAlignment;
}

/** Duck-typed widening of `UGraphic` for the two group methods T2
 *  deferred off the shared interface (see `UGraphic.ts`'s doc comment —
 *  `UGraphicSvg` carries them as extra public members beyond the
 *  interface surface). Calls are feature-detected and silently skipped
 *  when absent (e.g. a minimal test double), matching this port's
 *  "widen locally via optional members" pattern rather than expanding
 *  the shared `UGraphic` interface from this task's write-set. */
interface GroupCapableUGraphic {
  startGroup?(group: UGroup): void;
  closeGroup?(): void;
  startUrl?(url: { readonly url: string; readonly tooltip: string }): void;
  closeUrl?(): void;
}

/**
 * SvekEdge — a drawable svek link: spline body + both end extremities
 * + label/stereotype text, through a klimt `UGraphic`.
 *
 * Upstream: `svek/SvekEdge.java`'s `drawU` (comment + group + path id
 * stamping, SvekEdge.java:830-948) + the `solveLine` subset that
 * builds `extremity1`/`extremity2` and trims `dotPath`
 * (`getExtremitySimplier`, ported in `svek-edge-extremity.ts`) +
 * `drawRainbow` (ported inline below, single-color simplification —
 * see the class doc comment's cut-line pointer) + `uniq`/
 * `setSharedIds` (SvekEdge.java:824-827, 1093-1105).
 */
export class SvekEdge implements UDrawable {
  private readonly input: SvekEdgeInput;
  private readonly dotPath: DotPath;
  private readonly tailExtremity: PlacedExtremity | undefined;
  private readonly headExtremity: PlacedExtremity | undefined;
  /** Upstream `LinkType.decor1` — the HEAD-side decor (near entity 2);
   *  `CommandLinkElement.java:140` builds `new LinkType(d2, d1)`,
   *  swapping the token-side numbering (see `link-decor.ts`). */
  private readonly decor1: LinkDecorName | undefined;
  /** Upstream `LinkType.decor2` — the TAIL-side decor (near entity 1). */
  private readonly decor2: LinkDecorName | undefined;
  /** Upstream `setSharedIds(Set<String> ids)` — one set shared across
   *  every edge of a diagram so duplicate links get `-1`/`-2`-suffixed
   *  path ids. Defaults to a per-instance set (a single edge drawn
   *  standalone needs no cross-edge dedup). */
  private ids: Set<string> = new Set();

  constructor(input: SvekEdgeInput) {
    this.input = input;
    this.decor1 = lookupDecors2(input.headDecor);
    this.decor2 = lookupDecors1(input.tailDecor);
    const dotPath = buildDotPathFromSplinePoints(input.points);

    this.tailExtremity = placeTailExtremity(
      input.tailDecor,
      dotPath.getStartPoint(),
      dotPath.getStartAngle() + Math.PI,
      input.backgroundColor,
    );
    if (this.tailExtremity !== undefined) {
      dotPath.moveStartPoint(this.tailExtremity.trim.x, this.tailExtremity.trim.y);
    }

    this.headExtremity = placeHeadExtremity(
      input.headDecor,
      dotPath.getEndPoint(),
      dotPath.getEndAngle(),
      input.backgroundColor,
    );
    if (this.headExtremity !== undefined) {
      dotPath.moveEndPoint(this.headExtremity.trim.x, this.headExtremity.trim.y);
    }

    this.dotPath = dotPath;
  }

  /** Upstream: `SvekEdge#setSharedIds` (SvekEdge.java:826). */
  setSharedIds(ids: Set<string>): void {
    this.ids = ids;
  }

  /** Upstream: `Link#commentForSvg()` (Link.java:116) — see the class
   *  doc comment on why the two Link members live here. */
  private commentForSvg(): UComment {
    if (looksLikeRevertedForSvg(this.decor1, this.decor2))
      return new UComment(`reverse link ${this.input.from} to ${this.input.to}`);
    return new UComment(`link ${this.input.from} to ${this.input.to}`);
  }

  /** Upstream: `Link#idCommentForSvg()` (Link.java:106) — becomes the
   *  `<path id="...">` attribute via `setCommentAndCodeLine`. The
   *  middle branch (`looksLikeNoDecorAtAllSvg` -> plain `X-Y`) is
   *  inlined: both-NONE or both-set. */
  private idCommentForSvg(): string {
    if (looksLikeRevertedForSvg(this.decor1, this.decor2)) return `${this.input.from}-backto-${this.input.to}`;
    if ((this.decor1 === undefined) === (this.decor2 === undefined)) return `${this.input.from}-${this.input.to}`;
    return `${this.input.from}-to-${this.input.to}`;
  }

  /**
   * Upstream: the `UGroup` block of `SvekEdge#drawU`
   * (SvekEdge.java:845-855), put-for-put in source order. Two of the
   * keys (`ID`, and the display-name `DATA_ENTITY_1`/`DATA_ENTITY_2`)
   * are dropped by `applyGroupAttribute` (`xml-writer.ts` — verified
   * upstream quirk); they are still put here verbatim. The rendered
   * `id`/`data-entity-1`/`data-entity-2` come from `DATA_UID`/
   * `DATA_ENTITY_1_UID`/`DATA_ENTITY_2_UID`, and `EnumMap` declaration
   * order (see `UGroup.asMap`) yields the jar's attribute order.
   */
  private buildGroup(): UGroup {
    const input = this.input;
    const group = new UGroup(input.sourceLine !== undefined ? { position: input.sourceLine } : null);
    group.put(UGroupType.DATA_UID, input.uid);
    group.put(UGroupType.CLASS, 'link');
    group.put(UGroupType.ID, `link_${input.from}_${input.to}`);
    group.put(UGroupType.DATA_ENTITY_1, input.from);
    group.put(UGroupType.DATA_ENTITY_2, input.to);
    group.put(UGroupType.DATA_ENTITY_1_UID, input.fromUid);
    group.put(UGroupType.DATA_ENTITY_2_UID, input.toUid);
    const linkTypeName = getLinkTypeName(this.decor1, this.decor2);
    if (linkTypeName !== undefined) group.put(UGroupType.DATA_LINK_TYPE, linkTypeName);
    return group;
  }

  /** Upstream: `SvekEdge#uniq` (SvekEdge.java:1093), verbatim. */
  private uniq(ids: Set<string>, comment: string): string {
    if (!ids.has(comment)) {
      ids.add(comment);
      return comment;
    }
    let i = 1;
    for (;;) {
      const candidate = `${comment}-${i}`;
      if (!ids.has(candidate)) {
        ids.add(candidate);
        return candidate;
      }
      i++;
    }
  }

  drawU(ug: UGraphic): void {
    ug.draw(this.commentForSvg());
    const groupable = ug as UGraphic & GroupCapableUGraphic;
    groupable.startGroup?.(this.buildGroup());
    if (this.input.url !== undefined) groupable.startUrl?.(this.input.url);

    const stroke =
      this.input.stroke ??
      strokeOfLink(
        this.input.style,
        this.input.styleThickness,
        this.input.defaultThickness,
        this.input.suggestedStroke,
      );
    const lined = ug.apply(new Fore(this.input.color)).apply(new Back('none')).apply(stroke);
    // `SvekEdge.java:950`: labels and the middle decor draw under `UStroke.simple()`.
    const simple = ug.apply(new Fore(this.input.color)).apply(new Back('none')).apply(UStroke.simple());
    const bounder = ug.getStringBounder();
    const todraw = this.dotPath.copy();
    const force1 = this.input.magnet1?.getForceAt(todraw.getStartPoint(), bounder) ?? UTranslate.none();
    const force2 = this.input.magnet2?.getForceAt(todraw.getEndPoint(), bounder) ?? UTranslate.none();
    todraw.moveStartPoint(force1);
    todraw.moveEndPoint(force2);
    todraw.setCommentAndCodeLine(this.uniq(this.ids, this.idCommentForSvg()), this.input.codeLine ?? null);
    lined.draw(todraw);

    this.drawExtremity(lined.apply(force1), this.tailExtremity, stroke.onlyThickness());
    this.drawExtremity(lined.apply(force2), this.headExtremity, stroke.onlyThickness());
    (this.input.supplementaryColors ?? []).forEach((color, i) => {
      lined
        .apply(new UTranslate(2 * (i + 1), 2 * (i + 1)))
        .apply(new Fore(color))
        .draw(todraw);
    });
    this.drawLabels(simple);
    this.drawEndText(simple, this.input.tailQuantifier);
    this.drawEndText(simple, this.input.headQuantifier);
    this.drawMiddle(simple);

    if (this.input.url !== undefined) groupable.closeUrl?.();
    groupable.closeGroup?.();
  }

  /**
   * `SvekResult#drawU` draws a hidden edge through `ug.apply(UHidden.HIDDEN)` (SvekResult.java:98): each
   * `SvgGraphics` element writer is gated by `if (hidden == false)` (SvgGraphics.java:337,352,...), so the
   * `<g class="link">` stays empty (and is dropped), while `SvekEdge#drawU`'s comment (SvekEdge.java:845) is
   * still written and `uniq(ids, ...)` still consumes the path id (SvekEdge.java:944). The ink extent is
   * counted by the LimitFinder pass, which draws the edge un-hidden (it never sees `UHidden`).
   */
  drawHiddenU(ug: UGraphic): void {
    ug.draw(this.commentForSvg());
    this.uniq(this.ids, this.idCommentForSvg());
  }

  /** `drawRainbow` (`SvekEdge.java:1113-1139`): under a transparent `HeadColor` only an arrow draws, as a line. */
  private drawExtremity(ug: UGraphic, placed: PlacedExtremity | undefined, thicknessOnlyStroke: UStroke): void {
    if (placed === undefined) return;
    const head = this.input.headColor ?? this.input.color;
    if (isTransparentPaint(head)) {
      if (placed.drawable instanceof ExtremityArrow)
        placed.drawable.drawLineIfTransparent(ug.apply(thicknessOnlyStroke));
      return;
    }
    const backed = ug
      .apply(new Fore(head))
      .apply(thicknessOnlyStroke)
      .apply(new Back(placed.isFill ? this.input.color : 'none'));
    placed.drawable.drawU(backed);
  }

  /** `SvekEdge.java:956-980`: the text block at the placed table's corner. */
  private drawEndText(ug: UGraphic, end: SvekEdgeEndText | undefined): void {
    if (end === undefined) return;
    const block = end.block ?? buildTextBlock(end.text, end.font, HorizontalAlignment.CENTER);
    block.drawU(ug.apply(new UTranslate(end.x, end.y)));
  }

  /** `getArrowDirectionInRadian` (`SvekEdge.java:200-217`). `Link#getLinkArrow` reverses for an inverted link (`Link.java:423-428`). */
  private arrowDirectionInRadian(direction: MagicArrowDirection): number {
    const start = this.dotPath.getStartPoint();
    const end = this.dotPath.getEndPoint();
    const internal =
      this.input.fromUid === this.input.toUid
        ? this.dotPath.getStartAngle()
        : Math.atan2(end.x - start.x, end.y - start.y);
    const backward = (direction === 'backward') !== (this.input.linkInverted === true);
    return backward ? Math.PI + internal : internal;
  }

  /** `SvekEdge.java:982-990`. */
  private drawMiddle(ug: UGraphic): void {
    const middle = this.input.middleDecor;
    if (middle === undefined) return;
    const { point, angle } = this.dotPath.getMiddle();
    const angleDeg = (-angle * 180) / Math.PI;
    drawMiddleDecor(ug.apply(new UTranslate(point.x, point.y)), middle.decor, angleDeg - 45, middle);
  }

  private drawLabels(ug: UGraphic): void {
    const font = this.input.labelFont;
    if (font === undefined) return;
    const label = this.input.label;
    if (label?.w !== undefined && label.h !== undefined) {
      this.drawLabelBlock(ug, { ...label, w: label.w, h: label.h }, font);
      return;
    }
    if (this.input.stereotype !== undefined) {
      const mid = edgeMidpoint(this.input.points);
      ug.apply(new UTranslate(mid.x, mid.y - 6)).draw(UText.build(`«${this.input.stereotype}»`, font));
    }
    if (this.input.label !== undefined) {
      const { text, x, y } = this.input.label;
      ug.apply(new UTranslate(x, y)).draw(UText.build(text, font));
    }
  }

  /** `SvekEdge.java:951-954`: `labelText.drawU(UTranslate(x + labelXY.x +
   *  labelShield, ...))` where `labelXY` is the table's min corner
   *  (`getXY`, `:808-815`) and `labelText` is the label block inside
   *  `withMargin(block, marginLabel, marginLabel)` (`:372-373`). The engine
   *  position arrives as the table centre, so the corner is `centre -
   *  trunc(size) / 2`. */
  private drawLabelBlock(ug: UGraphic, label: LabelWithTable, font: FontConfiguration): void {
    const margin = this.input.fromUid === this.input.toUid ? SELF_LOOP_EDGE_LABEL_MARGIN : EDGE_LABEL_MARGIN;
    const shield = this.input.middleDecor === undefined ? 0 : LABEL_SHIELD;
    const x = label.x - Math.trunc(label.w) / 2 + shield + margin;
    const y = label.y - Math.trunc(label.h) / 2 + shield + margin;
    // `Display.java:648-649`: `if (getNaturalHorizontalAlignment() != null) horizontalAlignment = natural`.
    const parsed = parseWithNewlines(Pragma.createEmpty(), label.text)!;
    const alignment = parsed.naturalHorizontalAlignment ?? this.input.labelAlignment ?? HorizontalAlignment.CENTER;
    const magic = parsed.lines.length === 1 ? parseMagicArrowLabel(parsed.lines[0]!) : undefined;
    const shownText = magic === undefined ? parsed.lines.join('\n') : (magic.text ?? '');
    const block = buildTextBlock(
      shownText,
      font,
      alignment,
      this.input.resolveAtomImage?.(font),
      this.input.labelMaxWidth ?? 0,
    );
    if (magic !== undefined && label.note === undefined) {
      // `StringWithArrow.addMagicArrow` (`SvekEdge.java:281-285,304`): the glyph left of the margined block; a bare `<`
      // has no block and so no margin.
      const labelOnly =
        magic.text === undefined ? TextBlockUtils.EMPTY_TEXT_BLOCK : TextBlockUtils.withMargin(block, margin, margin);
      const arrow = new TextBlockArrow2(this.arrowDirectionInRadian(magic.direction), font);
      const merged = TextBlockUtils.mergeLR(arrow, labelOnly, VerticalAlignment.CENTER);
      merged.drawU(ug.apply(new UTranslate(x - margin, y - margin)));
      return;
    }
    if (label.note !== undefined) {
      this.drawNotedLabel(ug, label, label.text === '' ? undefined : block, { x, y }, margin);
      return;
    }
    // `TextBlockMarged#drawU` (`TextBlockMarged.java:81-87`): the marged block first draws `UEmpty.create(dim)` over
    // text + 2 x margin (drawn only when that width is > 0), which `LimitFinder#drawEmpty` folds into the ink extent.
    const text = block.calculateDimension(ug.getStringBounder());
    const marged = new XDimension2D(text.getWidth() + 2 * margin, text.getHeight() + 2 * margin);
    if (marged.getWidth() > 0) ug.apply(new UTranslate(x - margin, y - margin)).draw(UEmpty.create(marged));
    block.drawU(ug.apply(new UTranslate(x, y)));
  }

  /** `SvekEdge.java:307-326`: `labelText = merge(labelOnly, noteOnly)`; `labelOnly` is `addVisibilityModifier`'s
   *  `withMargin(block, marginLabel, marginLabel)` (`:372-373`), `EMPTY_TEXT_BLOCK` without a label (`:281-283`). */
  private drawNotedLabel(
    ug: UGraphic,
    label: LabelWithTable,
    text: TextBlock | undefined,
    at: Point2D,
    margin: number,
  ): void {
    const { block: note, position } = label.note!;
    const labelOnly =
      text === undefined ? TextBlockUtils.EMPTY_TEXT_BLOCK : TextBlockUtils.withMargin(text, margin, margin);
    const merged = mergeNote(labelOnly, note, position);
    merged.drawU(ug.apply(new UTranslate(at.x - margin, at.y - margin)));
  }
}

type LabelWithTable = SvekEdgeLabel & { readonly w: number; readonly h: number };

/** `SvekEdge.java:318-325`. */
function mergeNote(labelOnly: TextBlock, note: TextBlock, position: SvekLinkNotePosition): TextBlock {
  switch (position) {
    case 'left':
      return TextBlockUtils.mergeLR(note, labelOnly, VerticalAlignment.CENTER);
    case 'right':
      return TextBlockUtils.mergeLR(labelOnly, note, VerticalAlignment.CENTER);
    case 'top':
      return TextBlockUtils.mergeTB(note, labelOnly, HorizontalAlignment.CENTER);
    case 'bottom':
      return TextBlockUtils.mergeTB(labelOnly, note, HorizontalAlignment.CENTER);
  }
}
