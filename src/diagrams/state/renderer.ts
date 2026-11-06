/**
 * State diagram SVG renderer.
 *
 * Pure function: StateGeometry + Theme → SVG string.
 * No DOM, no async.
 *
 * mission G4 S1: routes through the CucaDiagram-family document shell
 * (T8: `core/assemble-svg.ts`'s state finalize function, mechanism 1) with one outer
 * content `<g>` and per-entity/per-link `<g>` wrapping (`renderer-
 * group.ts`, mechanism 2), inline-`<polygon>` transition arrowheads
 * (`renderer-arrowhead.ts`, mechanism 3), and the real `SvekResult`-style
 * document margin (`layout.ts#applyStateDocumentMargin` /
 * `layout-ink-extent.ts`, mechanism 4) — see `plans/g4-state-svg/
 * ledger.md` S1 for the full jar-verified mechanism writeups. mission G4
 * S2 adds the simple-state box + pseudostate content fidelity (mechanism
 * 5, `renderer-box.ts`/`renderer-pseudostate.ts`); mission G4 S3 adds the
 * composite box's own real 3-4-layer shape (mechanism 6,
 * `renderer-composite-box.ts`), replacing the pre-S3 dashed-rect
 * approximation for autonom composites.
 */

import {
  applyColorMapperToFragment,
  colorMapperOf,
  mapDocumentBackground,
} from '../../core/klimt/color/fragment-color-mapper.js';
import type { StateGeometry, StateNodeGeo, TransitionGeo } from './layout.js';
import type { StateUrl } from './state-geo-types.js';
import type { Theme } from '../../core/theme.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { RenderFragment } from '../../core/dispatcher.js';
import { isExportScaled } from '../../core/scale-command.js';
import { withDeferredFormat } from '../../core/svg-format.js';
import { line, linkWrap } from '../../core/svg.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import {} from './state-dot-graph.js';

/** `net.sourceforge.plantuml.core.DiagramType#STATE` -- verified against
 *  every cached jar state-diagram fixture's `data-diagram-type` root
 *  attribute (e.g. `test-results/dot-cache/state/jocela-05-niba392/in.svg`).
 *  T8: was `state/renderer-shell.ts`'s own copy of this constant. */
const DIAGRAM_TYPE_STATE = 'STATE';

/** `plantuml.skin`'s `arrow { FontSize 13 }` block -- the transition/edge-
 *  label font this file's own transition-label draw site renders at (G8
 *  T2). Duplicated locally (D1, avoid-import-cycle convention) rather than
 *  imported from `state-dot-graph.ts` -- same value as `description/
 *  renderer-edge.ts`'s own `ARROW_LABEL_FONT_SIZE`. */
import { buildStateUidPlan } from './renderer-uid.js';
import type { StateUidPlan } from './renderer-uid.js';
import { wrapEntity, wrapCluster, wrapStartEntity, wrapEndEntity } from './renderer-group.js';
import {} from './renderer-arrowhead.js';
import {
  renderInitial,
  renderFinal,
  renderForkJoin,
  renderChoiceJunction,
  renderHistory,
} from './renderer-pseudostate.js';
import { renderNormal, renderSdlReceive } from './renderer-box.js';
import { renderJsonLeaf } from './renderer-json.js';
import { renderBorderPoint } from './renderer-border-point.js';
import {} from './state-render-colors.js';
import { renderComposite } from './renderer-composite-box.js';
import { renderStateNote } from './renderer-note.js';
import { STATE_BUCKET, stateBucketPaint } from './state-bucket-colors.js';
import { buildStateShadowFilterDef } from './state-shadow.js';
import { noteStyleFactsOf } from '../../core/note-style-facts.js';
import { renderTransitionWrapped } from './state-renderer-transitions.js';
import { allCluster, allLines, allNodes } from './state-svek-draw-order.js';

// ---------------------------------------------------------------------------
// Node shape renderers
// ---------------------------------------------------------------------------

/**
 * `kind:'json'` leaf (mission A4 Phase L iter 20) — a plain labeled box,
 * the closest visual analog available today (`renderer-box.ts#renderNormal`
 * -- reused verbatim; a `kind:'json'` node's `headerLines` is never
 * populated at layout time, so it always takes that function's own
 * unmeasured-fallback path, UNCHANGED behavior pre/post mission G4 S2).
 * Faithful `shape=plaintext` TABLE content (member rows, matching class
 * engine's own json rendering) is deferred to future visual-fidelity work
 * — this renderer has no row-drawing infrastructure at all yet. Mirrors
 * the syncBar case's own documented no-dedicated-renderer-yet gap below.
 */
function renderJson(node: StateNodeGeo, theme: Theme): string {
  // stdd T5a: `EntityImageJson#drawU` (`renderer-json.ts`) once the layout measured the grid.
  if (node.jsonLayout !== undefined) return renderJsonLeaf(node, theme, node.jsonLayout);
  return renderNormal(node, theme);
}

/** One node's own shape markup — children NOT recursed (see {@link
 *  renderComposite}'s doc comment, renderer-composite-box.ts). */
function renderShape(node: StateNodeGeo, theme: Theme, measurer?: StringMeasurer): string {
  if (node.children.length > 0) {
    return renderComposite(node, theme, measurer);
  }
  // G9/T7: a border point is a DIFFERENT image class upstream
  // (`EntityImageStateBorder`, chosen in `GeneralImageBuilder
  // #createEntityImageBlock`), not a state box — its `<<stereotype>>` never
  // changes `StateKind`, so the switch below cannot see it. See
  // `StateNodeGeo.borderPointLabelAbove`, which is set only for these nodes.
  if (node.borderPointLabelAbove !== undefined) return renderBorderPoint(node, theme);

  switch (node.kind) {
    case 'initial':
      return renderInitial(node, theme);
    case 'final':
      return renderFinal(node, theme);
    case 'fork':
    case 'join':
    // syncBar (T2 addition, `=name=` transition endpoints -- see
    // ast.ts's StateKind) has no dedicated renderer yet: reuses the
    // fork/join bar shape, the closest visual analog -- upstream itself
    // renders synchronization bars and fork/join with the same bar shape.
    case 'syncBar':
      return renderForkJoin(node, theme);
    case 'choice':
      return renderChoiceJunction(node, theme);
    case 'history':
    case 'deepHistory':
      return renderHistory(node, theme);
    case 'normal':
      // mission G4 S14: `<<sdlreceive>>` (EntityImageState2) is a
      // DIFFERENT shape from the regular EntityImageState box -- see
      // `renderSdlReceive`'s own doc comment (renderer-box.ts).
      return node.stereotype?.toLowerCase() === 'sdlreceive'
        ? renderSdlReceive(node, theme)
        : renderNormal(node, theme);
    case 'json':
      return renderJson(node, theme);
    case 'note':
      return renderStateNote(node, theme);
    // #lizard forgives -- faithful one-branch-per-StateKind dispatch; each
    // case is a single delegating return, not real decision complexity.
  }
}

/**
 * mission G4 S1 mechanism 2: the `<g class="entity"|"start_entity"|
 * "end_entity">` wrap dispatch, jar-verified against `moleco-69-sida106`
 * (start_entity/entity), `cekolo-21-gini183` (every pseudostate stereotype
 * in one fixture -- choice wraps `entity`; fork/join bars and history/
 * deepHistory pseudostates draw UNWRAPPED, no `<g>` at all).
 *
 * Composite states (`children.length > 0`) always wrap `entity` here -- see
 * `renderer-group.ts`'s own "NOT MODELED" doc-comment note for the
 * jar-verified `entity`-vs-`cluster` (autonom vs non-autonom) split this
 * simplification does not yet capture.
 *
 * mission G4 S5: `node.emptyDescription === true` (the
 * `EntityImageStateEmptyDescription` shape, `renderer-box.ts
 * #renderEmptyDescription`'s own doc comment) draws UNWRAPPED too --
 * jar-verified `gopumi-11-pise779`'s own `S1` (bare `<rect>`+`<text>`
 * siblings, no `<g>` at all, matching fork/join/history/deepHistory's
 * existing unwrapped precedent above).
 */
function wrapClassFor(node: StateNodeGeo): 'entity' | 'start_entity' | 'end_entity' | undefined {
  if (node.children.length > 0) return 'entity';
  if (node.emptyDescription === true) return undefined;
  // stdd T1b: `EntityImageStateBorder#drawU` (`EntityImageStateBorder.java:79-104`)
  // opens no group, unlike `EntityImageState.java:117`.
  if (node.borderPointLabelAbove !== undefined) return undefined;
  // mission G4 S14: `<<sdlreceive>>` (EntityImageState2) draws UNWRAPPED --
  // see `renderSdlReceive`'s own doc comment (renderer-box.ts).
  if (node.kind === 'normal' && node.stereotype?.toLowerCase() === 'sdlreceive') return undefined;
  switch (node.kind) {
    case 'initial':
      return 'start_entity';
    case 'final':
      return 'end_entity';
    case 'fork':
    case 'join':
    case 'syncBar':
    case 'history':
    case 'deepHistory':
      return undefined;
    case 'choice':
    case 'normal':
    case 'json':
    case 'note':
      return 'entity';
    // #lizard forgives -- faithful one-branch-per-StateKind dispatch.
  }
}

/** Renders one node (recursing into composite children) with its jar
 *  `<g>` wrap applied — the mechanism-2 replacement for the pre-S1
 *  `renderNode`'s flat, unwrapped recursion. mission G4 S5 (transition-
 *  nesting mechanism): this node's OWN pass edges (`node.transitions`)
 *  render as siblings of `childrenMarkup`, INSIDE this node's own wrap --
 *  matching jar's real document nesting (a pass's own edges are direct
 *  children of that pass's own image, `renderer-group.ts`'s doc comment,
 *  `bajelo-54-dixe684` jar-verified). */
/** `ConcurrentStates.java#Separator.drawSeparator`'s dashed rule between two
 *  stacked regions -- `THICKNESS_BORDER=1.5`, `DASH=8`/gap `10` (a FIXED
 *  jar constant, independent of theme border color/width elsewhere).
 *  jar-verified `nelupe-49-xova546`: `stroke:#181818;stroke-width:1.5;
 *  stroke-dasharray:8,10;`. */
function renderSeparator(sep: { x1: number; y1: number; x2: number; y2: number }, theme: Theme): string {
  return line(sep.x1, sep.y1, sep.x2, sep.y2, {
    // dss T3e site 18: `ConcurrentStates.java:111-120` reads LineColor of `root, element,
    // stateDiagram, state`.
    stroke: stateBucketPaint(theme, STATE_BUCKET, 'border') ?? theme.colors.border,
    strokeWidth: 1.5,
    strokeDasharray: '8,10',
  });
}

/** mission G4 S6, mechanism 13: a CONCURRENT-region-owning composite
 *  interleaves each stacked region's own states+transitions with a dashed
 *  `renderSeparator` line BETWEEN each pair -- jar's real document
 *  structure never wraps a region in its own `<g>`
 *  (`ConcurrentStates.java#drawU` draws each `inner`'s content directly,
 *  then the separator, in one flat sequence inside the OWNING composite's
 *  own image). Every other node (`node.concurrentRegions === undefined`)
 *  keeps the pre-S6 "all children, then this node's own transitions"
 *  layout unchanged. */
interface StateRenderCtx {
  readonly theme: Theme;
  readonly uidPlan: StateUidPlan;
  readonly concurrentGlobalIds: ReadonlyMap<string, number>;
  /** stdd T6c -- `StateGeometry.measurer`. */
  readonly measurer?: StringMeasurer;
  /** stdd T3d: the enclosing entity's open link (`SvgGraphics#startGroup` re-opens the active link inside
   *  every nested group, `addTopOpenedLinkIfNeeded`), so a child's shape and lines sit in its own `<a>`. */
  readonly activeUrl?: StateUrl;
}

/**
 * One svek result (stdd T1c, D2): `SvekResult#drawU` (`svek/SvekResult.java:70-100`)
 * draws every cluster of the pass, then every node, then every line, each list in
 * `Bibliotekon` order (`state-svek-draw-order.ts`). A cluster's own `<g>` wraps only
 * its shape; its members and lines are flat siblings in this same result. The
 * root pass and each `InnerStateAutonom`/`ConcurrentStates` inner are each one
 * result, and each gets its own `ids` set for `SvekEdge#uniq` (`SvekResult.java:93`).
 */
function renderSvekResult(
  nodes: readonly StateNodeGeo[],
  transitions: readonly TransitionGeo[],
  ctx: StateRenderCtx,
  atRoot: boolean,
): string {
  const { theme, uidPlan, concurrentGlobalIds } = ctx;
  const sharedIds = new Set<string>();
  // stdd T5a: a hidden node draws through `UHidden` (`SvekResult.java:85`): nothing, uid kept.
  const clusters = allCluster(nodes)
    .filter((c) => c.hidden !== true)
    .map((c) =>
      wrapCluster(c.id, uidPlan.nodeUid.get(c.id) ?? '', renderShapeLinked(c, theme, ctx.activeUrl, ctx.measurer)),
    )
    .join('');
  const nodeMarkup = allNodes(nodes)
    .map((n) => renderNodeWrapped(n, ctx))
    .join('');
  const lines = allLines(nodes, transitions, atRoot)
    .map((t) => renderTransitionWrapped(t, theme, { uidPlan, concurrentGlobalIds, sharedIds }, ctx.activeUrl))
    .join('');
  return clusters + nodeMarkup + lines;
}

/** `InnerStateAutonom#drawU` (`svek/InnerStateAutonom.java:130-161`): the rounded
 *  box and its name, then the inner result; `ConcurrentStates#drawU`
 *  (`ConcurrentStates.java:122-133`) draws each inner result, then the separator
 *  between two regions, in one flat sequence. A leaf has neither. */
/** stdd T3d: `ug.startUrl(url)` right after the group opens, around the entity's own shape
 *  (`EntityImageState.java:118-120`, `InnerStateAutonom.java:141-142`, `Cluster.java:338-342`); a nested
 *  group closes the link first (`SvgGraphics#startGroup`, `closeTopActiveLinkIfNeeded`), so the children
 *  follow the `<a>` as siblings. */
function renderShapeLinked(
  node: StateNodeGeo,
  theme: Theme,
  activeUrl: StateUrl | undefined,
  measurer?: StringMeasurer,
): string {
  const shape = renderShape(node, theme, measurer);
  const url = node.url ?? activeUrl;
  return url === undefined ? shape : linkWrap(shape, url);
}

/** The node's inner result: stacked regions with their separators (`ConcurrentStates.java:122-133`), or
 *  one child pass (`InnerStateAutonom.java:149`). */
function renderInnerContent(node: StateNodeGeo, ctx: StateRenderCtx): string {
  if (node.concurrentRegions === undefined) return renderSvekResult(node.children, node.transitions, ctx, false);
  const separators = node.separators ?? [];
  const blocks = node.concurrentRegions.map((region, i) => {
    const regionMarkup = renderSvekResult(region.children, region.transitions, ctx, false);
    const sepMarkup = i < separators.length ? renderSeparator(separators[i]!, ctx.theme) : '';
    return regionMarkup + sepMarkup;
  });
  return blocks.join('');
}

function renderNodeWrapped(node: StateNodeGeo, outer: StateRenderCtx): string {
  if (node.hidden === true) return '';
  // stdd T6a: a region leaf's image is the raw `SvekResult` (`GroupMakerState.java:116-117`); its `drawU`
  // paints clusters, nodes and lines with no group and no box of its own (`SvekResult.java:69-95`).
  if (node.regionLeaf === true) return renderSvekResult(node.children, node.transitions, outer, false);
  const ownShape = renderShapeLinked(node, outer.theme, outer.activeUrl, outer.measurer);
  // The inner result (`InnerStateAutonom.java:149`, `ConcurrentStates.java:122-133`) draws while this
  // entity's url is open (`InnerStateAutonom.java:141-157`); a cluster closes it first (`Cluster.java:380`).
  const url = node.url ?? outer.activeUrl;
  const ctx: StateRenderCtx = url === undefined ? outer : { ...outer, activeUrl: url };
  const inner = ownShape + renderInnerContent(node, ctx);
  const wrapClass = wrapClassFor(node);
  if (wrapClass === undefined) return inner;
  const uid = ctx.uidPlan.nodeUid.get(node.id) ?? '';
  if (wrapClass === 'start_entity') return wrapStartEntity(node.id, uid, inner);
  if (wrapClass === 'end_entity') return wrapEndEntity(node.id, uid, inner);
  return wrapEntity(node.id, uid, inner);
}

// ---------------------------------------------------------------------------
// Transition renderer
// ---------------------------------------------------------------------------

/** A `note` node anywhere in the tree: notes sit in their owner's `children` as in the top-level array. */
function hasNote(nodes: readonly StateNodeGeo[]): boolean {
  return nodes.some((n) => n.kind === 'note' || hasNote(n.children));
}

/**
 * Render a state diagram geometry into an SVG string.
 */
export function renderState(geo: StateGeometry, skinTheme: Theme): RenderFragment {
  // unwind2-S11: the layout's `sprite` map (`layoutState`).
  const theme = geo.sprites === undefined ? skinTheme : { ...skinTheme, sprites: geo.sprites };
  const uidPlan = buildStateUidPlan(geo);
  const concurrentGlobalIds = geo.concurrentGlobalIds ?? new Map<string, number>();

  // stdd T4a: a scaled document is formatted ONCE by the export's scale pass, as `SvgGraphics#format` multiplies
  // then rounds (`SvgGraphics.java:468-475`, `TextBlockExporter.java:165-177`); see `withDeferredFormat`.
  const deferred = isExportScaled(geo.scale, theme.dpi);
  const body = withDeferredFormat(deferred, () =>
    renderSvekResult(
      geo.states,
      geo.transitions,
      { theme, uidPlan, concurrentGlobalIds, ...(geo.measurer !== undefined ? { measurer: geo.measurer } : {}) },
      true,
    ),
  );

  // mission G4 S1 mechanism 1: background is communicated via the shell's
  // own root `style="...background:...;"` attribute (T8: `core/assemble-
  // svg.ts` / `core/klimt/document-shell.ts#assembleDocumentShell`) -- jar draws
  // NO explicit full-canvas `<rect>` for it (verified: every sampled state
  // fixture's `<defs/>` is immediately followed by the content `<g>`, no
  // background rect). The pre-S1 renderer's own manual background `<rect>`
  // is removed accordingly.
  //
  // mission skin-file-loading Batch 2: ONE shared shadow filter def per
  // diagram (`state-shadow.ts`'s own doc comment for why a single
  // diagram-wide gate on `theme.shadowing` is equivalent to jar's own
  // per-shape `manageShadow`/`withShadow` once-per-document dedup -- state
  // resolves ONE shadowing value for the whole diagram via the theme
  // cascade, mission skin-file-loading Batch 1). `undefined` (svgRoot's own
  // default empty extraDefs) for every pre-Batch-2/shadow-off fixture.
  // A note casts its own merged style's shadow (`note-style-facts.ts`), whatever the diagram-wide one is.
  const noteShadowed = (noteStyleFactsOf(theme)?.shadowing ?? 0) > 0 && hasNote(geo.states);
  const extraDefs = (theme.shadowing ?? 0) > 0 || noteShadowed ? buildStateShadowFilterDef() : undefined;
  // smc-T3b: `TitledDiagram#muteColorMapper` maps EVERY drawn colour (`TitledDiagram.java:292-313`),
  // the root background too (`SvgGraphics.java:181-182`); one choke point, as class and activity.
  const colorMapper = colorMapperOf(theme);
  return {
    body: applyColorMapperToFragment(body, colorMapper),
    width: geo.totalWidth,
    height: geo.totalHeight,
    background: mapDocumentBackground(resolveColorToSvgHex(theme.colors.background), colorMapper),
    // dbp-T2b (D1): a `<style>`/`skinparam` document gradient, for the finalizer to paint as
    // `SvgGraphics`' constructor does (`SvgGraphics.java:178-183`); omitted when unset.
    ...(theme.colors.backgroundGradient === undefined ? {} : { backgroundGradient: theme.colors.backgroundGradient }),
    diagramType: DIAGRAM_TYPE_STATE,
    // stdd T4a: the exporter's inputs (`TextBlockExporter.java:205-209`), resolved by `exportTo`.
    ...(geo.scale === undefined ? {} : { scaleSpec: geo.scale }),
    ...(theme.dpi === undefined ? {} : { dpi: theme.dpi }),
    ...(deferred ? { numbersDeferred: true as const } : {}),
    ...(geo.preChromeWidth !== undefined && geo.preChromeHeight !== undefined
      ? { preChromeWidth: geo.preChromeWidth, preChromeHeight: geo.preChromeHeight }
      : {}),
    ...(geo.frameInk !== undefined ? { frameInk: geo.frameInk } : {}),
    // dss T3f: the margin the layout folded (`layout.ts#applyStateDocumentMargin`), for
    // chrome to re-apply (`document-margin.ts#documentMarginOf`).
    ...(geo.documentMargin !== undefined ? { documentMargin: geo.documentMargin } : {}),
    // dss T3f: `TextBlockExporter#maybeDrawBorder` (`TextBlockExporter.java:171`) has no
    // diagram-type branch, so `class/renderer-document.ts`'s read holds here.
    ...(theme.colors.graph.diagramBorderColor !== undefined
      ? { diagramBorderColor: resolveColorToSvgHex(theme.colors.graph.diagramBorderColor) }
      : {}),
    ...(extraDefs !== undefined ? { extraDefs } : {}),
    // lad-T1c: `TextBlockExporter.java:306-307` -- `skinparam lengthAdjust` is the document's
    // `SvgOption`, read by `SvgGraphics.java:155-158,699-705`. Unset stays unset (D4).
    ...(theme.lengthAdjust !== undefined ? { lengthAdjust: theme.lengthAdjust } : {}),
  };
}
