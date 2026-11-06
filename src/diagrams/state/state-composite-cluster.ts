/**
 * Non-autonom `Cluster` composite pass building — split out of
 * ./state-composite-pass.ts (mission A4 Phase L iter 16, 500-line file-cap
 * compliance; pure move, only the CONC-region-leaf mechanism is new — see
 * its own doc below). Mirrors state-composite-concurrent.ts's existing
 * split (same file-cap rationale, same "coherent unit on its own" note).
 * The `ClusterHeader` title/stereotype/attribute-text sizing formula itself
 * (`measureClusterTitle`, `titleAndAttributeWidth`; `computeTitleTableHeight`
 * moved to ../../core/cluster-title-table.ts, T3) was split further into
 * ./state-composite-header.ts (G7 T11, same file-cap rationale) — pure move.
 *
 * @see ~/git/plantuml/.../svek/ClusterDotString.java
 * @see ~/git/plantuml/.../svek/GroupMakerState.java#getImage
 */

import type { State } from './ast.js';
import { stateNameFontSizeOf } from '../../core/state-style-facts.js';
import type { TransitionGeo } from './state-geo-types.js';
import { stateColorsOf } from './state-colors.js';
import { stateFontFamily } from './state-render-colors.js';
import type { FontSpec } from '../../core/measurer.js';
import type { DotInputNode, DotInputCluster } from '../../core/graph-layout.js';
import { splitStateDisplayLines, stateUrlOf } from './state-sizing.js';
import { stateCreoleBlock, stateCreoleOpts } from './state-sizing-creole.js';
import { ENTITY_IMAGE_MARGIN as MARGIN } from '../../core/svek/IEntityImage.js';
import { stateDescriptionBlockWidth } from './state-composite-description-block.js';
import { measureClusterTitle, titleAndAttributeWidth } from './state-composite-header.js';
import { computeTitleTableHeight } from '../../core/cluster-title-table.js';
import { zaentId } from './state-composite-classify.js';
import { isGroupTouched, recordBorderPointCluster } from './state-composite-detect.js';
import { getEntityPosition, isInputPosition, isOutputPosition } from './state-entity-position.js';
import { concurrentRegionScopeId } from './state-parse-state.js';
import { regionInkGeometry, type ConcurrentRegionPassResult } from './state-composite-concurrent.js';
import { pseudoNodeItems, runInCreationOrder, type CreationOrdered } from './state-composite-pseudo.js';
import { shiftGroupAutoLinks } from './state-composite-transition-geo.js';
import {
  type DiagramCtx,
  type PassAccumulator,
  type GeoSpec,
  ANCHOR_SIZE,
  nextClusterId,
  resolveMember,
  addScopeNotes,
  addLevelEdges,
  buildLevelTransitionGeos,
  sortSpecsByCreationIndex,
} from './state-composite-pass.js';

/** The BORDER-POINT family's own title offset — `IEntityImage.MARGIN`,
 *  literally (`svek/IEntityImage.java:45`). A composite whose title moved onto
 *  the `${id}ee` subgraph never gets its title position from graphviz's own
 *  cluster label: `Cluster#manageEntryExitPoint` computes it itself, as
 *  `rectangleArea.getMinY() + IEntityImage.MARGIN` (`Cluster.java:435`), and
 *  `drawUState` draws the title block's TOP there (`:496-498`). Hence 15.8889
 *  (= 5 + `textAscent(14)`) against the plain family's 14.8889, which comes
 *  from `setTitlePosition` and the entirely different `ClusterHeader` path.
 *
 *  G7 T14b measured this split and deliberately left it — "the WithLabel
 *  family's own `=5` correction is OUT of the confirmed ten-item edit list
 *  (render-position-only)". G9/T10 closes it; `temuxi-28-cega322`'s four
 *  composite titles were the last thing in that fixture not matching jar. */
const BORDER_POINT_TITLE_BASELINE_MARGIN = 5;

/** `GroupMakerState.getImage()`'s degenerate-empty-group branch
 *  (`countChildren()==0 && groups().size()==0`, checked BEFORE the
 *  CONCURRENT_STATE branch) -- a region with ZERO content (no states, no
 *  notes) never runs the real svek pipeline; it gets `EntityImageState`'s
 *  own min-size placeholder instead (mechanisms.md row 26's "empty body"
 *  case). Not exercised by any fixture in the corpus yet -- guarded here
 *  so a future truly-empty region doesn't silently emit a padded 15x15px
 *  node instead of matching this branch.
 * @see ~/git/plantuml/.../svek/GroupMakerState.java:113-114
 */
const EMPTY_REGION_MIN_SIZE = 50;

/**
 * Build the flattened leaf that re-enters the CALLING (cluster) pass in
 * place of one `--`-delimited concurrent region -- mission A4 Phase L iter
 * 16 (jijuze-43-ceva131), rewritten iteration 19 to a pure LOOKUP: every
 * CONC region is unconditionally autarkic (`GroupType.CONCURRENT_STATE`
 * short-circuits `isAutarkic()` true, `Entity.java:700-701`), so its own
 * svek pass is always built at the region's OWN firing-order turn
 * (`buildConcurrentRegionPass`, ./state-composite-concurrent.ts) whether
 * the OWNER ends up 'autonom' or 'cluster'.
 *
 * stdd T6a: the region's image is the raw `SvekResult`
 * (`GroupMakerState.java:116-117`), never wrapped by `InnerStateAutonom`,
 * so the leaf is sized `minMax + (15, 15)` and its content moved to
 * `(6 - minX, 6 - minY)` (`SvekResult.java:130-135`) through the SAME
 * `regionInkGeometry` the stacked (autonom) case uses, and it renders as
 * its content alone (`regionLeaf`, `renderer.ts#renderNodeWrapped`:
 * `SvekResult#drawU` opens no group and draws no box, `SvekResult.java:69-95`).
 * @see ~/git/plantuml/.../svek/GroupMakerState.java:116-117
 */
function resolvedRegionOf(regionId: string, ctx: DiagramCtx): ConcurrentRegionPassResult {
  const resolved = ctx.resolvedRegions.get(regionId);
  if (resolved === undefined) {
    // Cannot occur given firingOrder's depth-descending guarantee -- a
    // region is strictly deeper than its owning composite, hence already
    // resolved earlier in the same `resolveAllAutonomPasses` loop (mirrors
    // `buildConcurrentAutonomSpec`'s identical guard,
    // state-composite-concurrent.ts).
    throw new Error(`concurrent region "${regionId}" resolved out of firing order`);
  }
  return resolved;
}

/** The region's own transitions, a composite self-link among them taking the region's `moveDelta` again
 *  (`shiftGroupAutoLinks`). */
function regionLeafTransitions(resolved: ConcurrentRegionPassResult, passDx: number): TransitionGeo[] {
  const geos = buildLevelTransitionGeos(resolved.acc, resolved.result);
  return shiftGroupAutoLinks(geos, passDx, resolved.result.originShift?.x ?? 0);
}

function buildConcurrentRegionLeaf(
  s: State,
  regionNumber: number,
  ctx: DiagramCtx,
): { node: DotInputNode; spec: GeoSpec } {
  const regionId = concurrentRegionScopeId(s.id, regionNumber);
  const resolved = resolvedRegionOf(regionId, ctx);
  const creationIndex = s.concurrentRegionCreationIndexes?.[regionNumber - 1];
  const tick = creationIndex !== undefined ? { creationIndex } : {};
  if (resolved.result.nodes.length === 0) {
    return {
      node: { id: regionId, width: EMPTY_REGION_MIN_SIZE, height: EMPTY_REGION_MIN_SIZE, shape: 'rounded' },
      spec: { kind: 'state', id: regionId, stateKind: 'normal', display: '', ...tick },
    };
  }
  const geom = regionInkGeometry(resolved, ctx.theme.shadowing ?? 0);
  return {
    node: { id: regionId, width: geom.width, height: geom.height, shape: 'rect' },
    spec: {
      kind: 'autonom',
      id: regionId,
      display: '',
      offset: { x: geom.dx, y: geom.dy },
      width: geom.width,
      height: geom.height,
      localStates: resolved.specs,
      localPositions: resolved.result,
      localTransitions: regionLeafTransitions(resolved, geom.dx),
      regionLeaf: true,
      ...tick,
    },
  };
  // #lizard forgives -- faithful port of GroupMakerState's region-leaf
  // dimension formula; a guard clause plus one straight-line construction.
}

/** stdd T6a/T6b: resolve a cluster's direct leafs, its region leafs and its `[*]` pseudostates in ONE
 *  creation-ordered walk. `Entity#leafs()` returns the quark's children in creation order
 *  (`Entity.java:649-657`); a CONCURRENT_STATE region is one of them once `overrideImage` made it a leaf
 *  (`Entity.java:395-405`), and so is a `[*]` the scope's links made. `--` fires on pass ONE
 *  (`CommandConcurrentState.java:57-59`), a link and its endpoints on pass TWO
 *  (`CommandLinkStateCommon.java:70-72`): `CONC1` precedes `XA1` in jijuze-43's `svek-2.dot`, and
 *  butigu-57's start precedes its history. A member without a tick keeps the old order, last. */
function resolveLeafsInCreationOrder(
  s: State,
  directMembers: readonly State[],
  acc: PassAccumulator,
  ctx: DiagramCtx,
  cluster: DotInputCluster,
): { childSpecs: GeoSpec[]; regionSpecs: GeoSpec[]; pseudoSpecs: GeoSpec[] } {
  const childSpecs: GeoSpec[] = [];
  const regionSpecs: GeoSpec[] = [];
  const pseudoSpecs: GeoSpec[] = [];
  const items: CreationOrdered[] = directMembers.map((c) => ({
    ...(c.creationIndex !== undefined ? { creationIndex: c.creationIndex } : {}),
    run: () => {
      childSpecs.push(resolveMember(c, acc, ctx, cluster.id));
      if (ctx.classify.kindOf.get(c.id) !== 'cluster') cluster.nodeIds.push(c.id);
    },
  }));
  s.concurrentRegions.forEach((_region, i) => {
    const creationIndex = s.concurrentRegionCreationIndexes?.[i];
    items.push({
      ...(creationIndex !== undefined ? { creationIndex } : {}),
      run: () => {
        const { node, spec } = buildConcurrentRegionLeaf(s, i + 1, ctx);
        acc.nodes.push(node);
        cluster.nodeIds.push(node.id);
        regionSpecs.push(spec);
      },
    });
  });
  items.push(
    ...pseudoNodeItems(s.id, s.transitions, acc, ctx.pseudoCreationIndex, (spec) => {
      pseudoSpecs.push(spec);
      cluster.nodeIds.push(spec.id);
    }),
  );
  runInCreationOrder(items);
  return { childSpecs, regionSpecs, pseudoSpecs };
}

/** Resolve one composite as a non-autonom `Cluster`: recurse its own
 *  children into the SAME pass accumulator (nesting via `parentId`), give
 *  every `--`-delimited region ITS OWN pass (`buildConcurrentRegionLeaf`),
 *  add the zaent anchor when needed, add its own scope-local `[*]`
 *  anchors, add its own inner transitions as edges of the SAME pass. */
export function resolveClusterComposite(
  s: State,
  acc: PassAccumulator,
  ctx: DiagramCtx,
  parentClusterId: string | undefined,
): GeoSpec {
  const clusterId = nextClusterId();
  const title = measureClusterTitle(s.display, ctx);
  // G7 T11: `attrLines` (count) feeds `computeTitleTableHeight` below;
  // `attrTextLines` (the underlying line array) additionally feeds
  // `titleAndAttributeWidth` via `measureLines` -- `s.description` is the
  // SAME field `state-composite-sizing.ts:71`'s `bodyLines` reads for the
  // autonom shape's own action-zone height (the composite's OWN
  // entry/exit/body lines, jar's `getStateDescription()`, NOT nested
  // children's own bodies).
  const attrTextLines = (s.description ?? []).flatMap(splitStateDisplayLines);
  const attrLines = attrTextLines.length;
  // Stereotype term: ALWAYS zero for a state-diagram cluster header,
  // regardless of `s.stereotype` -- diagnosed this task (pesita-10-dene726's
  // `AA`, `state AA <<O-O>>`, is the corpus's first titled+stereotyped
  // composite cluster; `s.stereotype === "O-O"` is genuinely parsed, but the
  // cached oracle's `cluster15ee` HEIGHT="28" only matches
  // `computeTitleTableHeight(1, 0, 1, 14)` -- WITH a nonzero stereoLines=1 it
  // is 42, a miss). Root cause: `ClusterHeader`'s stereo term reads
  // `portionShower.getVisibleStereotypeLabels(g)` (`ClusterHeader.java:197`),
  // and state diagrams' OWN svek pass hardcodes `PortionShower.ALL`
  // (`GroupMakerState.java:145`, no configurability), whose
  // `getVisibleStereotypeLabels` unconditionally returns
  // `Collections.emptyList()` (`PortionShower.java:51-53`) --
  // `getStereoBlockWithoutLegend`'s `visibleStereotypes.isEmpty()` guard
  // (`ClusterHeader.java:198-199`) therefore ALWAYS short-circuits to
  // `TextBlockUtils.empty(0, 0)` for this diagram type, independent of
  // whether the state actually carries a stereotype. This is a
  // diagram-type-specific suppression (jar-verified for state; NOT a claim
  // about class/component/other diagram cluster headers, which may pass a
  // different `PortionShower`), so the term is fixed at 0 here rather than
  // read from `s.stereotype` -- reading-then-discarding it would be
  // misleading dead code (`code-principles.md`'s no-magic-strings/dead-code
  // discipline), and `titleAndAttributeHeight`/`titleAndAttributeWidth`
  // (state-composite-header.ts) keep their `stereoLines`/`stereoWidth`
  // parameters general for any future diagram type that DOES pass a
  // stereotype-showing `PortionShower`. Subsumes G6 T8's own D4 finding
  // (`<<O-O>>`-sentinel-only exclusion) -- T11 found the suppression is
  // unconditional for state, so no separate exclusion branch is needed.
  const stereoLines = 0;
  const stereoWidth = 0;
  const headerFont: FontSpec = { family: stateFontFamily(ctx.theme), size: stateNameFontSizeOf(ctx.theme) };
  // `ClusterHeader.java:78`: the jar's creole sheet width (Bullet header
  // included), not the raw glyph width -- gopudo-91-bego999 jar 40 vs raw 38.
  const attrWidth = stateDescriptionBlockWidth(attrTextLines, headerFont, ctx.measurer, ctx.theme);
  // The single jar-real `label` value (`titleAndAttributeWidth`'s own doc
  // comment) -- fed to BOTH `labelWidth`/`labelHeight` (unconditional,
  // below) and `titleTableWidth`/`titleTableHeight`
  // (now unconditional, below): jar computes ONE `ClusterHeader` per
  // cluster regardless of border-point routing, so both port fields must
  // carry the IDENTICAL formula output.
  const headerWidth = titleAndAttributeWidth(title.width, stereoWidth, attrWidth);
  const headerHeight = computeTitleTableHeight(title.lineCount, stereoLines, attrLines, stateNameFontSizeOf(ctx.theme));
  // stdd T3c: the drawn blocks -- `ClusterHeader#getTitleBlock` (`ClusterHeader.java:151-170`,
  // `Display#create`, no wrap) and `Entity#getStateDescription` (`Entity.java:610-632`); the creole
  // block is what `RoundedContainer` measures (`Cluster.java:473-474,489-490`).
  const titleBlock = stateCreoleBlock(
    splitStateDisplayLines(s.display),
    headerFont,
    ctx.measurer,
    stateCreoleOpts(ctx.theme, false),
  );
  const bodyBlock = stateCreoleBlock(
    attrTextLines,
    headerFont,
    ctx.measurer,
    stateCreoleOpts(ctx.theme, false, 'description'),
  );
  const directMembers = s.children;
  // G5 C3, mechanism 16 shape half: `applyBorderPointRanks`'s own real
  // eligibility test (below) -- NOT the broader `ctx.classify.needsAnchor`
  // flag, which ALSO fires for a composite with NO direct border-point
  // children at all whenever an EXTERNAL edge merely needs an anchor POINT
  // on its boundary (e.g. `state A { [*] --> Configuring }`, `Configuring`
  // declared OUTSIDE `A` -- `gojuja-90-pune699`'s own `A`, jar-verified:
  // its real oracle shape is the PLAIN cluster title/baseline-margin-4
  // case, NOT the WithLabel/`ee`-wrapped one, because `applyBorderPointRanks`
  // itself no-ops on an EMPTY `directMembers` list). Using `needsAnchor`
  // directly here excluded `A` from the title-table entirely, wrongly
  // falling back to the dashed-rect shape for a case this iteration DOES
  // cover -- caught by direct SVG diff inspection, not assumed.
  //
  // G7 T14b: also collects the direct border-point member ids themselves
  // (not just the boolean) -- `state-composite-geo.ts#materializeCluster`
  // needs this exact set to partition its own already-materialized
  // `children` into FrontierCalculator's `insides`/`points` terms (see
  // `GeoSpec`'s `borderPointMemberIds` doc comment, state-composite-
  // pass-types.ts).
  const borderPointMemberIds = directMembers
    .filter((c) => isInputPosition(getEntityPosition(c)) || isOutputPosition(getEntityPosition(c)))
    .map((c) => c.id);
  const hasBorderPointChildren = borderPointMemberIds.length > 0;
  // Eligible for the jar-real HTML title table + render shape at the
  // default font-size (G6 T7: `title.lineCount === 1` RELAXED, formula is
  // `titleLines`-parametric, jar-verified exact at titleLines=1 and 3 --
  // `plans/g6-cluster-geometry/batch-3/title-height-derivation.md` §5).
  //
  // G7 T14b: `!hasBorderPointChildren` REMOVED. Jar's `ClusterHeader`
  // computes the SAME title/attribute-table reservation regardless of
  // `entityPositionsExceptNormal.size()` -- the border-point family only
  // differs in WHERE that table attaches (`${id}ee`'s own `label=`) and in
  // the outer box's post-layout correction (`Cluster#manageEntryExitPoint`/
  // `FrontierCalculator`, wired below via `state-composite-geo.ts
  // #materializeCluster`) -- both now landed, closing the deferred item
  // this comment previously named (`withlabel-derivation.md`'s multi-round
  // derivation + "Paper gate v5 (G7 T19)" confirmation). `hasBorderPointChildren`
  // remains a live, needed local -- it still gates `applyBorderPointRanks`
  // and additionally gates: (a) `innerMarginLevels`/`unwrappedNodeId`
  // staying UNSET for this family (protection0/1 forced off,
  // `ClusterDotString.java:107-112`); (b) `addClusters`'s ee/i-wrapped
  // branch (`portRanksLabelOnEe`); (c) the FrontierCalculator correction
  // pass (`borderPointMemberIds` below).
  //
  // The former `ctx.theme.fontSize === 14` gate is REMOVED (dsw-T1d):
  // jar's `ClusterDotString.java:107-125,299-314` has no font-size term --
  // `protection0/1`, the title TABLE and the `p0`/`p1` wrappers depend only
  // on `thereALinkFromOrToGroup` and the `ClusterHeader` dims
  // (`ClusterHeader.java:60-120`), which `computeTitleTableHeight`
  // parameterises on `fontSize` already (`niveno-60-tiro789`, font size
  // != 14, jar emits `cluster<N>p0 > cluster<N> (104x38 TABLE) > p1`).
  // G8 T2: `ctx.insideAutonomPass !== true` REMOVED -- jar's own eligibility
  // test has no concept of "which port pass" a cluster resolves in; the
  // `buildPlainAutonomSpec` `Math.max` floor this guarded against is now
  // provably redundant once the `labelInk` ink-walk fold lands (D6). See
  // `plans/g8-label-placement/` decision journal for the full writeup.
  // G5 C7 (ledger.md §C7, `DotInputCluster.innerMarginLevels`'s doc has the
  // full derivation): `needsZaentPoint` reduces to jar's own
  // `thereALinkFromOrToGroup` ("touched") boolean for every
  // composite -- guarded `!hasBorderPointChildren`
  // below since protection0/1 are forced off for that family regardless
  // (`ClusterDotString.java:107-112`; `borderPointAncestorWrap` below is
  // its own, narrower, replacement). `anchorId` is computed here so
  // `unwrappedNodeId` can share this object literal; `zaentId` is pure.
  const needsZaentPoint = ctx.classify.needsZaentPoint.has(s.id);
  const anchorId = zaentId(s.id);
  // G7 T14b: `thereALinkFromOrToGroup1` (`ClusterDotString.java:91-96`) --
  // gates BOTH the outer "a" wrap and the inner "${id}i" wrap for a
  // border-point composite (`protection0`/`protection1` forced OFF whenever
  // `entityPositionsExceptNormal.size() > 0`, so the plain family's
  // `innerMarginLevels===2` encoding doesn't apply -- `graph-layout.types.ts`'s
  // `borderPointAncestorWrap` doc has the full derivation). NARROWER than
  // `ctx.classify.needsZaentPoint` (which ALSO fires via
  // `hasDirectBorderPointChild && !hasNonBorderEeContent`, unrelated) --
  // `bitaxo-18-tamo974`'s `C` is the counterexample ruling out reuse: it has
  // a zaent anchor (fallback path) but ZERO transitions diagram-wide
  // (`isGroupTouched('C', ...)` false) -- no "a"/"i" wrap in jar's own DOT.
  const borderPointAncestorWrap = hasBorderPointChildren && isGroupTouched(s.id, ctx.classify.allTransitions);
  const cluster: DotInputCluster = {
    id: clusterId,
    nodeIds: [],
    label: s.display,
    labelWidth: headerWidth,
    labelHeight: headerHeight,
    titleTableWidth: headerWidth,
    titleTableHeight: headerHeight,
    ...(!hasBorderPointChildren ? { innerMarginLevels: needsZaentPoint ? 2 : 1 } : {}),
    ...(needsZaentPoint && !hasBorderPointChildren ? { unwrappedNodeId: anchorId } : {}),
    ...(borderPointAncestorWrap ? { borderPointAncestorWrap: true as const } : {}),
    ...(parentClusterId !== undefined ? { parentId: parentClusterId } : {}),
  };
  acc.clusters.push(cluster);
  if (hasBorderPointChildren) recordBorderPointCluster(acc, ctx.rankdir, s.id, cluster, borderPointMemberIds);

  const { childSpecs, regionSpecs, pseudoSpecs } = resolveLeafsInCreationOrder(s, directMembers, acc, ctx, cluster);
  const noteSpecs = addScopeNotes(s.id, ctx, acc, [...pseudoSpecs, ...childSpecs, ...regionSpecs], cluster);
  if (ctx.classify.needsAnchor.has(s.id)) {
    // The POINT NODE is strictly narrower than the port-block gate itself
    // (ClassifyResult.needsZaentPoint's doc, state-composite-classify.ts) --
    // a composite with real non-border content in its `ee` wrapper needs no
    // placeholder (bujuta-44-rovo666, diteme-18-favi840); `applyBorderPointRanks`
    // below still fires (self-guards to a no-op with no direct border-point
    // children) so `cluster.portAnchorId` staying a valid (if nodeless) id is
    // harmless -- state diagrams always take the WithLabel branch, which
    // never reads `portAnchorId` (see `portChainLines`'s `!labelOnEe` guard).
    if (ctx.classify.needsZaentPoint.has(s.id)) {
      acc.nodes.push({ id: anchorId, width: ANCHOR_SIZE, height: ANCHOR_SIZE, shape: 'point' });
      cluster.nodeIds.push(anchorId);
    }
    applyBorderPointRanks(directMembers, cluster, anchorId);
  }
  addLevelEdges(s.id, s.transitions, acc, ctx);

  const clusterColors = stateColorsOf(s);
  const clusterUrl = stateUrlOf(s, ctx.theme);
  return {
    kind: 'cluster',
    id: s.id,
    display: s.display,
    children: sortSpecsByCreationIndex([...pseudoSpecs, ...childSpecs, ...regionSpecs, ...noteSpecs]),
    clusterId,
    headerLines: titleBlock.lines,
    bodyLines: bodyBlock.lines,
    // `Cluster.java:489-490`: `nameHeight = title.height + MARGIN`.
    clusterHeaderHeight: titleBlock.height + MARGIN,
    ...(s.color !== undefined ? { color: s.color } : {}),
    ...(clusterUrl !== undefined ? { url: clusterUrl } : {}),
    ...(s.stereotype !== undefined ? { stereotype: s.stereotype } : {}),
    // Plain family: no margin here -- `state-composite-geo.ts#clusterTitleBaselineMargin`
    // reads graphviz's title table (`Cluster#setTitlePosition`, gtc T8/D3).
    ...(hasBorderPointChildren ? { titleBaselineMargin: BORDER_POINT_TITLE_BASELINE_MARGIN } : {}),
    // lgm-T1d: `solveAcc` lets `materializeCluster` replay this pass's
    // `Cluster#manageEntryExitPoint` calls (`state-composite-drawn-rects.ts`).
    ...(hasBorderPointChildren ? { borderPointMemberIds, solveAcc: acc } : {}),
    ...(s.creationIndex !== undefined ? { creationIndex: s.creationIndex } : {}),
    ...(s.autoPhantom === true ? { packageTitle: true } : {}),
    ...(s.container === 'frame' ? { usymbol: 'frame' as const } : {}),
    ...(clusterColors !== undefined ? { stateColors: clusterColors } : {}),
  };
  // #lizard forgives -- faithful port of ClusterDotString's envelope assembly;
  // each block is one independently-conditional layer (mechanisms.md §2).
}

/** Group a non-autonom composite's DIRECT border-point (entry/exit/pin)
 *  children into `cluster.portRanks` by input/output position — reuses the
 *  same rank-group DOT shape as genuine PORTIN/PORTOUT ports (needed so the
 *  DOT-parity comparator's brace-stack `{rank=...}` quirk zeroes out this
 *  cluster's member count on BOTH sides symmetrically — see
 *  graph-layout.types.ts's `portRanksLabelOnEe` doc), with the WithLabel/
 *  no-chain rendering (state diagrams never produce PORTIN/PORTOUT, so the
 *  NoLabel/chained hasPort() branch never applies here). No-op when `s` has
 *  no border-point direct children. */
function applyBorderPointRanks(directMembers: readonly State[], cluster: DotInputCluster, anchorId: string): void {
  const inputs = directMembers.filter((c) => isInputPosition(getEntityPosition(c))).map((c) => c.id);
  const outputs = directMembers.filter((c) => isOutputPosition(getEntityPosition(c))).map((c) => c.id);
  if (inputs.length === 0 && outputs.length === 0) return;
  cluster.portRanks = [
    ...(inputs.length > 0 ? [{ rank: 'source' as const, nodeIds: inputs }] : []),
    ...(outputs.length > 0 ? [{ rank: 'sink' as const, nodeIds: outputs }] : []),
  ];
  cluster.portAnchorId = anchorId;
  cluster.portRanksLabelOnEe = true;
}
