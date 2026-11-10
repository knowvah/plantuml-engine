/**
 * The single central document-assembly choke point — extracted from
 * `src/index.ts` (mission A5 / T4), which sits at the repo's 500-line hook cap.
 *
 * `assembleSvg` stays exported from `src/index.ts`, the package's only
 * "exports" subpath, so this move is invisible to consumers.
 *
 * T8 (decisions.md D2): upstream assembles every diagram type through ONE
 * shared exporter, `TextBlockExporter.java` — `exportTo` computes the FINAL
 * (fully chrome-composed) dimension (`:199-203`), draws `maybeDrawBorder`
 * (`:215-232`) against it, then hands the already-decorated `TextBlock` to
 * `createUGraphicSVG`, which stamps `data-diagram-type` (`:292-294`) and
 * nothing else per-engine. Before T8, this port re-derived that ONE exporter
 * FOUR times — four separate boolean/string discriminant fields on
 * `RenderFragment`, each routing to a separate `diagrams/<engine>/renderer-
 * shell.ts` function this module statically imported. T8 collapses the
 * fields to ONE (`RenderFragment.diagramType`) and the per-type body work
 * (background/border-rect splice, single-`<g>` wrap) to the finalize
 * functions below — plain data in, plain string out, no `diagrams/**`
 * import, matching decisions.md D1 (upstream single-place code moves to
 * `core`). `assembleDocumentShell` (`core/klimt/document-shell.ts`) itself
 * is unchanged; only the four static-import call sites collapse into a
 * `diagramType`-keyed dispatch here.
 *
 * The border/background-rect splice in particular CANNOT move into the
 * producing engine's own renderer (`renderClass`/`renderState`): both rects
 * must be sized to the FINAL, post-chrome canvas (`documentBackgroundRect`'s
 * own doc comment, jar-verified `xalaco-64-vuzu312` — a title-bearing,
 * non-default-background class fixture) and drawn as the content `<g>`'s
 * first child, which `renderClass` cannot see or produce — chrome
 * composition (`core/annotations/chrome.ts#applyChrome`) runs strictly
 * AFTER the engine returns its fragment and BEFORE this module is reached.
 * Every producer field these finalize functions read (`documentBackgroundRect`,
 * `diagramBorderColor`, `preChromeWidth`/`preChromeHeight`, `bodyWrapped`,
 * `background`) is already generic on `RenderFragment`; the math needed
 * (`core/TextBlockExporter.ts#applyCucaDocumentMargin`, `core/atmp/
 * CucaDiagram.ts`'s margin constants, `core/svg-format.ts#shortenColor` +
 * `core/klimt/color/HColorSet.ts#resolveColorToSvgHex`) was already core,
 * imported by the per-engine shell files only for historical reasons.
 */
import { printedDiagramTypeOf } from './printed-diagram-type.js';
import { formatShiftedCoordinates } from './annotations/coord-shift.js';
import type { AssembledSvg, RenderFragment } from './dispatcher.js';
import { svgRoot, group, rect } from './svg.js';
import { spliceAsFirstChild, spliceIntoContentGroup } from './assemble-svg-splice.js';
import { finalizeSequenceFragment } from './assemble-svg-sequence.js';
import { finalizeActivityFragment } from './assemble-svg-activity.js';
import { finalizeJsonFragment } from './assemble-svg-json.js';
import { backcolorMarkup } from './assemble-svg-backcolor.js';
import { applySeededDefIds } from './svg-defs-seeded.js';
import { seedOf } from './klimt/drawing/svg/svg-seed.js';
import { assembleDocumentShell } from './klimt/document-shell.js';
import { applyCucaDocumentMargin, exportTo, finalizeTitledDiagramFragment } from './TextBlockExporter.js';
import { CUCA_DOCUMENT_MARGIN, documentMarginOf, type DocumentMargin } from './document-margin.js';

/** `DiagramType` values this module dispatches on (`DiagramType.java:45`, every cached jar fixture's
 *  root `data-diagram-type`). Each engine declares its own copy to SET `RenderFragment.diagramType`
 *  (`class/renderer.ts`, `json/index.ts`, `mindmap/index.ts`, ...); these are for DISPATCH only. */
const DIAGRAM_TYPE_CLASS = 'CLASS';
const DIAGRAM_TYPE_DESCRIPTION = 'DESCRIPTION';
const DIAGRAM_TYPE_STATE = 'STATE';
const DIAGRAM_TYPE_JSON = 'JSON';
const DIAGRAM_TYPE_YAML = 'YAML';
const DIAGRAM_TYPE_HCL = 'HCL';
const DIAGRAM_TYPE_SEQUENCE = 'SEQUENCE';
const DIAGRAM_TYPE_ACTIVITY = 'ACTIVITY';
const DIAGRAM_TYPE_MINDMAP = 'MINDMAP';
const DIAGRAM_TYPE_SALT = 'SALT';
const DIAGRAM_TYPE_WBS = 'WBS';
const DIAGRAM_TYPE_GANTT = 'GANTT';
const DIAGRAM_TYPE_BOARD = 'BOARD';
const DIAGRAM_TYPE_FILES = 'FILES';
/** laep D4: legacy activity's routing key (`diagrams/activity-legacy/renderer.ts`); it prints `ACTIVITY`. */
const DIAGRAM_TYPE_ACTIVITY_LEGACY = 'ACTIVITY_LEGACY';
const DIAGRAM_TYPE_PACKET = 'PACKET';
const DIAGRAM_TYPE_NWDIAG = 'NWDIAG';
const DIAGRAM_TYPE_CHART = 'CHART';

// ---------------------------------------------------------------------------
// class finalize (formerly class/renderer-shell.ts#assembleClassShell)
// ---------------------------------------------------------------------------

/** `UStroke.simple()`'s default thickness -- jar's `TextBlockExporter
 *  #maybeDrawBorder` falls back to this whenever `LineParam.diagramBorder`
 *  has no explicit override, which is every corpus fixture found so far
 *  (`theme.ts#diagramBorderColor`'s own doc comment). */
const DIAGRAM_BORDER_THICKNESS = 1;

/** `CucaDiagram`-family margined dims minus the border stroke thickness --
 *  jar's `TextBlockExporter#maybeDrawBorder` draws the border rect at the
 *  PRE-`ensureVisible`-floor margined dims (`core/TextBlockExporter.java:
 *  227-228`), NOT what {@link applyCucaDocumentMargin} returns (which also
 *  applies the truncating `ensureVisible` quirk) -- `x`/`y` are always
 *  `(0,0)`, the border is the OUTERMOST draw, at no prior translate.
 *  Jar-verified byte-exact against `vinujo-78-kapo329` (`rawWidth=109.7875`
 *  -> rect width `113.7875`; `rawHeight=62` -> rect height `66`). */
function computeBorderRectDims(rawDims: { width: number; height: number }, thickness: number, margin: DocumentMargin) {
  return {
    width: rawDims.width + margin.left + margin.right - thickness,
    height: rawDims.height + margin.top + margin.bottom - thickness,
  };
}

/**
 * G2 N66 (near-zero harvest, `vinujo-78-kapo329`): `fragment
 * .diagramBorderColor`'s whole-canvas `<rect fill="none">` border, spliced
 * in as the outer `<g>`'s FIRST child, BEFORE the diagram's own draw
 * (`TextBlockExporter#maybeDrawBorder`, `:170`) -- and then displaced to
 * second by the document background, which `SvgGraphics`' constructor
 * painted earlier still, inside `createUGraphic` (`:169`; dbp-T2a, see
 * {@link finalizeClassBody}).
 *
 * Requires `fragment.width`/`fragment.height` (FINAL, post-chrome) to
 * exactly equal what {@link applyCucaDocumentMargin} computes from
 * `fragment.preChromeWidth`/`preChromeHeight` -- i.e., chrome did NOT
 * inflate the canvas beyond the class body's own bounds. A chrome-present
 * (title/caption/legend/header/footer) fixture combined with `skinparam
 * diagramBorderColor` has ZERO corpus reach (grepped the full 718-fixture
 * class corpus) and would need the CHROME-INCLUSIVE raw dims (not
 * currently threaded anywhere) to compute jar's exact PRE-floor border-rect
 * formula correctly -- rather than draw a possibly-wrong-sized rect, this
 * guard silently no-ops for that case.
 */
function diagramBorderRect(fragment: RenderFragment): string {
  const colorHex = fragment.diagramBorderColor;
  if (colorHex === undefined) return '';
  if (fragment.preChromeWidth === undefined || fragment.preChromeHeight === undefined) return '';
  const rawDims = { width: fragment.preChromeWidth, height: fragment.preChromeHeight };
  // dss T3b: the margin the exporter applied (`TextBlockExporter.java:510-516`): a style `Margin`, else the cuca default.
  const margin = documentMarginOf(fragment) ?? CUCA_DOCUMENT_MARGIN;
  const expectedFinal = applyCucaDocumentMargin(rawDims, margin);
  if (expectedFinal.width !== fragment.width || expectedFinal.height !== fragment.height) return '';
  const rectDims = computeBorderRectDims(rawDims, DIAGRAM_BORDER_THICKNESS, margin);
  return rect(0, 0, rectDims.width, rectDims.height, {
    fill: 'none',
    stroke: colorHex,
    strokeWidth: DIAGRAM_BORDER_THICKNESS,
  });
}

/**
 * `class/renderer.ts#renderClass`'s per-diagram body finalization: exactly
 * one top-level content `<g>` (part B of G2 N1, mechanism 2 -- class has no
 * `CompleteSvg` escape hatch, so this is the ONE place that must guarantee
 * the shape for both the annotated and unannotated case), then N66's border
 * rect, then N48's document background spliced AHEAD of it.
 *
 * dbp-T2a: the background is `SvgGraphics`' constructor paint
 * (`SvgGraphics.java:176-192`, `assemble-svg-backcolor.ts#backcolorMarkup`),
 * which runs inside `createUGraphic` BEFORE `maybeDrawBorder`
 * (`core/TextBlockExporter.java:169-171`) -- so the background rect is the
 * first child and the border the second (jar render of `skinparam
 * backgroundColor #EEEEEE` + `diagramBorderColor red`: `fill="#EEE"` rect, then
 * the `fill="none"` border). A gradient always paints (def + `url(#…)` rect,
 * `:178-183`) whatever `documentBackgroundRect` says; otherwise the solid input
 * is the producer's already colour-mapped `documentBackgroundRect`
 * (`class/renderer-document.ts#beginClassDocument`), sized to the final canvas
 * untruncated, as before.
 */
function finalizeClassBody(fragment: RenderFragment): string {
  const body = fragment.bodyWrapped === true ? fragment.body : group(fragment.body);
  const border = diagramBorderRect(fragment);
  const withBorder = border === '' ? body : spliceAsFirstChild(body, border);
  const background = backcolorMarkup(
    fragment.documentBackgroundRect,
    fragment.backgroundGradient,
    fragment.width,
    fragment.height,
  );
  return background === '' ? withBorder : spliceAsFirstChild(withBorder, background);
}

// ---------------------------------------------------------------------------
// state finalize (formerly state/renderer-shell.ts#assembleStateShell)
// ---------------------------------------------------------------------------

/**
 * mission G4 S5 / dbp-T2a: the content-level document background, the FIRST
 * child of the content `<g>`, on top of the root `style="...background:...;"`
 * `assembleDocumentShell` already handles -- `SvgGraphics`' constructor paint
 * (`SvgGraphics.java:176-192`, `assemble-svg-backcolor.ts#backcolorMarkup`):
 * a gradient always, a plain colour unless `#00000000`/`#000000`/`#FFFFFF`
 * (`:187-191`; `tests/fixtures/document-background/state-black.svg` draws no
 * rect). Sized to the truncated canvas, as before. The constructor runs before
 * any draw, chrome included (`TextBlockExporter.java:169-177`), so a
 * chrome-wrapped (`bodyWrapped`) body gets the rect spliced ahead of its title
 * too (jar render of a titled state with `skinparam backgroundColor #EEEEEE`:
 * `<rect … fill="#EEE"/>` precedes `<g class="title">`); the former
 * chrome-present carve-out recorded only that the sampled corpus lacked the case.
 */
/**
 * stdd T4a: `TextBlockExporter#exportTo` (`TextBlockExporter.java:160-177`) for state: the scale resolves over
 * the chrome-and-margin dimension and the body (border included, `maybeDrawBorder`, `:171`) is drawn at it;
 * the constructor's paint is at the exported canvas (`SvgGraphics.java:808-811`). Unscaled, `exportTo` hands
 * the body back untouched and this is dss T3f's `finalizeStateBody` byte for byte.
 */
function finalizeStateFragment(fragment: RenderFragment): RenderFragment {
  const border = diagramBorderRect(fragment);
  const content =
    fragment.bodyWrapped === true ? spliceIntoContentGroup(fragment.body, border) : group(border + fragment.body);
  // `calculateFinalDimension` (`:198-203`) is the svek block plus the margin, before `ensureVisible`'s bump
  // (`SvgGraphics.java:129-135`): the layout folded the margin (`layout.ts#applyStateDocumentMargin`) and kept
  // the block as `preChromeWidth`/`preChromeHeight`; the chromed path already set `exportedDimension`.
  const margin = documentMarginOf(fragment);
  const carrier =
    fragment.exportedDimension === undefined &&
    fragment.preChromeWidth !== undefined &&
    fragment.preChromeHeight !== undefined &&
    margin !== undefined
      ? {
          ...fragment,
          exportedDimension: {
            width: fragment.preChromeWidth + margin.left + margin.right,
            height: fragment.preChromeHeight + margin.top + margin.bottom,
          },
        }
      : fragment;
  const exported = exportTo(carrier, content);
  const backgroundRect = backcolorMarkup(
    fragment.background,
    fragment.backgroundGradient,
    Math.trunc(exported.width),
    Math.trunc(exported.height),
  );
  return { ...exported, body: spliceIntoContentGroup(exported.body, backgroundRect) };
}

// ---------------------------------------------------------------------------
// json/yaml/hcl finalize -- moved to `assemble-svg-json.ts` (dbp-T2a,
// 500-line hook cap).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// sequence finalize -- moved to `assemble-svg-sequence.ts` (sdd2-T7f, 500-line
// hook cap).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// activity finalize -- moved to `assemble-svg-activity.ts` (T2d-a pass 2,
// 500-line hook cap, see that file's own header for why it needed its own
// `spliceIntoContentGroup`-equivalent rather than importing this one back).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

/**
 * codd-T4: description's chrome-composed fragment. Two jobs, both because
 * chrome is composed OUTSIDE klimt here while the jar draws it through the
 * same `UGraphic` as the body:
 *  - the full-canvas background `<rect>` as the content `<g>`'s FIRST child,
 *    drawn at the FINAL size (`UgDiagram.java:123-135`: `addChrome`, then
 *    `TextBlockUtils.addBackcolor`);
 *  - `scale` / `skinparam dpi`, applied to the whole composed block
 *    (`TextBlockExporter.java:159-177`, title included).
 * A fragment with neither falls through unchanged, as before.
 */
function finalizeDescriptionFragment(fragment: RenderFragment): RenderFragment {
  // dbp-T2a: `SvgGraphics`' constructor paint (`SvgGraphics.java:176-192`). The klimt port already painted it
  // (`svg-graphics-core.ts#setupBackcolor`, gradient included: its def rides `extraDefs`), and
  // `description/renderer.ts#splitLeadingBackgroundRect` lifted the rect's fill -- a colour or `url(#…)` -- into
  // `documentBackgroundRect`, re-spliced here at the final size. A `backgroundGradient` is painted only when no
  // klimt rect was lifted, so the document never carries two background rects.
  const background = backcolorMarkup(
    fragment.documentBackgroundRect,
    fragment.documentBackgroundRect === undefined ? fragment.backgroundGradient : undefined,
    Math.trunc(fragment.width),
    Math.trunc(fragment.height),
  );
  // A warning banner with no other chrome reaches here unwrapped: the shared root `<g>` (`SvgGraphics.java:155-158`).
  const wrapped = fragment.bodyWrapped === true ? fragment.body : group(fragment.body);
  const body = background === '' ? wrapped : spliceAsFirstChild(wrapped, background);
  // `TextBlockExporter#exportTo` (`:159-177`): `computeScaleFactor` reads the chrome-and-margin dimension before
  // `ensureVisible` (`:204-208`); the tail is shared with every other engine.
  return exportTo(fragment, body);
}

/**
 * lad-T1a: board/files/packet. Their jar oracles open the content with the shared root `<g>`
 * (`TextBlockExporter.java:292-294`, `SvgGraphics.java:155-158`) and draw no extra chrome here, so an
 * unwrapped body gets a bare `<g>` for the document shell to decorate (`withRootGroupAttributes`);
 * a `bodyWrapped` body already carries it and passes through.
 */
function finalizeGenericRootFragment(fragment: RenderFragment): RenderFragment {
  return fragment.bodyWrapped === true ? fragment : { ...fragment, body: group(fragment.body) };
}

/**
 * Per-`diagramType` body finalization -- the work each of the four former
 * `diagrams/<engine>/renderer-shell.ts` files did to `fragment.body` (and,
 * for json, `fragment.background`) before handing off to
 * `assembleDocumentShell`.
 * The description engine has none: `unwrapKlimtSvg`'s only caller path
 * (`applyAnnotationChrome`, `src/index.ts`) already guarantees `bodyWrapped`
 * by construction (every reachable fragment is annotated, so `applyChrome`
 * always decorates), so `DESCRIPTION` -- and any other `diagramType` with no
 * finalize entry -- falls through unchanged (the identity `assembleKlimtShell`
 * used to perform, verbatim).
 */
function finalizeShellFragment(fragment: RenderFragment): RenderFragment {
  switch (fragment.diagramType) {
    case DIAGRAM_TYPE_CLASS:
      return { ...fragment, body: finalizeClassBody(fragment) };
    case DIAGRAM_TYPE_DESCRIPTION:
      return finalizeDescriptionFragment(fragment);
    case DIAGRAM_TYPE_STATE:
      return finalizeStateFragment(fragment);
    case DIAGRAM_TYPE_SEQUENCE:
      return finalizeSequenceFragment(fragment);
    case DIAGRAM_TYPE_ACTIVITY:
      return finalizeActivityFragment(fragment);
    case DIAGRAM_TYPE_JSON:
    case DIAGRAM_TYPE_YAML:
    case DIAGRAM_TYPE_HCL:
      return finalizeJsonFragment(fragment);
    case DIAGRAM_TYPE_MINDMAP:
    case DIAGRAM_TYPE_SALT:
    case DIAGRAM_TYPE_WBS:
    case DIAGRAM_TYPE_GANTT:
    case DIAGRAM_TYPE_CHART:
    case DIAGRAM_TYPE_PACKET:
    case DIAGRAM_TYPE_NWDIAG:
    case DIAGRAM_TYPE_BOARD:
    case DIAGRAM_TYPE_ACTIVITY_LEGACY:
      return finalizeTitledDiagramFragment(fragment);
    case DIAGRAM_TYPE_FILES:
      return finalizeGenericRootFragment(fragment);
    default:
      return fragment;
  }
}

/**
 * The single central `svgRoot` call site (decisions.md D2): every plugin
 * hands back an `AssembledSvg` -- either a `RenderFragment` (the common
 * case) or a `CompleteSvg` escape hatch for engines that already emit a
 * full document themselves (klimt/description's annotation-free path;
 * `@startdot`'s graphviz passthrough) and must not be re-wrapped.
 *
 * A `RenderFragment` carrying `diagramType` is finalized (see
 * {@link finalizeShellFragment}) and reassembled via `core/klimt/document-
 * shell.ts#assembleDocumentShell` -- jar's shared root-attribute/prolog/
 * defs shell (`TextBlockExporter.java:292-294`). Everything else falls
 * through to the generic `svgRoot` (`core/svg.ts`).
 */
export function assembleSvg(fragment: AssembledSvg, seed?: bigint): string {
  return withSeededDefIds(assembleDocument(fragment), seed);
}

/** The pre-seed assembly, unchanged -- split out so {@link assembleSvg}'s own
 *  body stays one expression per branch. */
function assembleDocument(fragment: AssembledSvg): string {
  if ('completeSvg' in fragment) return fragment.completeSvg;
  if (fragment.diagramType !== undefined) {
    const finalized = finalizeShellFragment(fragment);
    return assembleDocumentShell(withFormattedBody(finalized), printedDiagramTypeOf(fragment, fragment.diagramType));
  }
  const formatted = withFormattedBody(fragment);
  return svgRoot(formatted.width, formatted.height, [formatted.body], formatted.background, formatted.extraDefs);
}

/** isw-T2b-ca: the chrome/margin translates were baked into the body at
 *  full precision; upstream formats each coordinate once, at emission
 *  (`SvgGraphics.java:468-475`) -- here, after the last translate
 *  ({@link finalizeShellFragment}'s margin), where every fragment's
 *  finished body passes. */
function withFormattedBody(fragment: RenderFragment): RenderFragment {
  return { ...fragment, body: formatShiftedCoordinates(fragment.body) };
}

/**
 * cdd-B7FU-R4: renames every `<linearGradient>`/`<filter>` id to the one
 * upstream's single per-diagram `SvgGraphics` would have minted
 * (`SvgGraphics.java:160-162,285-287,393,766,1076` -- see
 * `svg-defs-seeded.ts#applySeededDefIds`).
 *
 * Here, and not in the two assemblers below it, for one reason: this is
 * already D2's single central assembly point, and it is the ONLY point that
 * also sees the `completeSvg` escape hatch. A document assembled with no
 * seed (a direct `assembleSvg(fragment)` call, every test harness that
 * predates this parameter) keeps the content-hash ids it has always had --
 * the rename is opt-in, so nothing moves until a caller supplies a seed.
 */
function withSeededDefIds(document: string, seed: bigint | undefined): string {
  return seed === undefined ? document : applySeededDefIds(document, seed);
}

/**
 * The diagram seed `assembleSvg`'s `seed` parameter wants, from the block's
 * own `UmlSource` — upstream's `UmlSource#seed()` (`UmlSource.java:222-234`:
 * `h = 31*h + line.hashCode(); h = 31*h + '\n'`, over `this.source`).
 *
 * Mirrors `diagrams/description/index.ts#reconstructSourceForSeed`, fallbacks
 * included. Upstream hashes the PREPROCESSED lines: `PSystemBuilder.java:
 * 232-240` passes `data` as `source` to `UmlSource.createWithRaw`
 * (`UmlSource.java:133-138`), which `seed()` walks -- so `seedSourceLines`
 * (`BlockUmlBuilder.ts#seedSource`) wins; then the raw block lines (equal to
 * it for a directive-free block; cdd3-T27: `popesa-39-sobe866`'s `!define`
 * was the one class fixture they missed); then the wrapped interior of a
 * hand-built source.
 */
export function seedOfUmlSource(umlSource: {
  readonly lines: readonly string[];
  readonly rawSourceLines?: readonly string[] | undefined;
  readonly seedSourceLines?: readonly string[] | undefined;
}): bigint {
  if (umlSource.seedSourceLines !== undefined) return seedOf(umlSource.seedSourceLines.join('\n'));
  const raw = umlSource.rawSourceLines;
  if (raw !== undefined) return seedOf(raw.join('\n'));
  return seedOf(['@startuml', ...umlSource.lines, '@enduml'].join('\n'));
}
