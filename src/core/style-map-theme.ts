/**
 * Selector → Theme field mapping (element-scoped <style> blocks).
 *
 * Extracted verbatim from src/index.ts to keep that entry module under the
 * line cap. Mirrors upstream StyleSignature resolution: selector paths map to
 * specific Theme color fields. `applyStyleMap` itself is a composition of
 * several table-driven sub-resolvers (`style-map-simple-fields.ts`,
 * `style-map-element.ts`,
 * `style-cascade-class.ts`) split out purely to satisfy per-file/per-function
 * size limits — the field mappings, cascade/priority order, and defaults are
 * unchanged from the original single-function version (see .agent-notes).
 */

import type { DiagramType } from './block-extractor.js';
import type { Theme, ElementColors } from './theme.js';
import type { StyleMap } from './skinparam.js';
import { deepMergeTheme, mergeElementBuckets } from './theme.js';
import { resolveColor } from './skinparam.js';
import {
  collectElementStyleBuckets,
  computeNoteStyleTagCascade,
  computeShowStereotypeByTag,
  resolveGlobalShadowing,
  resolveGlobalBackground,
  resolveGlobalBorder,
} from './style-map-element.js';
import { computeClassStyleCascadeOverrides } from './style-cascade-class.js';
import { computeDescriptionStyleCascadeOverrides } from './style-cascade-description.js';
import { computeStateStyleCascadeOverrides } from './style-cascade-state.js';
// T11 (cdd3): moved to a sibling module (500-line cap on style-cascade-
// class.ts) -- see that file's own doc comment.
import { computeCardinalityFontOverride, computeArrowFontOverride } from './style-cascade-class-arrow-font.js';
import { computeSimpleSelectorOverrides } from './style-map-simple-fields.js';

type GraphColors = Theme['colors']['graph'];

/**
 * Every `Theme.colors.graph` override reachable from `styleMap` alone
 * (i.e. everything except the document/elements/shadowing/border extras
 * handled by {@link computeStyleMapExtras}): the simple single-selector
 * table, the class-cascade ancestor
 * overrides (G2 N36), and the bare root/element BackgroundColor cascade
 * (D3).
 */
function computeGraphOverride(styleMap: StyleMap, base: Theme): Partial<GraphColors> {
  const graphOverride: Partial<GraphColors> = { ...computeSimpleSelectorOverrides(styleMap) };
  // G2 N36: classDiagram/root/nested-class-selector ancestor cascade (box
  // background/border/font, badge root-fallback, edge stroke) -- merged
  // into graphOverride BEFORE the early-return check below so a fixture
  // with ONLY a cascade-shaped <style> block (no bare `class {}`/
  // `database {}` selector) still produces a non-base Theme.
  // B4 (A2s): `skinparam wrapWidth` seeds the MaximumWidth cascade defaults;
  // an explicit <style> MaximumWidth still wins (per-field ??= inside).
  Object.assign(graphOverride, computeClassStyleCascadeOverrides(styleMap, base.wrapWidth));
  Object.assign(graphOverride, computeDescriptionStyleCascadeOverrides(styleMap));
  Object.assign(graphOverride, computeStateStyleCascadeOverrides(styleMap));
  // D3/D4 (T2 + T6): `<style> arrow { FontName/FontSize/FontStyle }` cascade
  // -- all three fields land in `graphOverride`, mirroring
  // `skinparam-theme-builder.ts`'s `GRAPH_OVERRIDE_FIELDS`. `arrowFontSize`
  // was T2-excluded from this merge (its only reader,
  // `description/layout.ts`, was skinparam-only) until T6 retired that read
  // in favor of `resolveArrowLabelFont`, which now wires the cascade into
  // both the DOT-measurement and SVG-text sites in the same commit (D4).
  // SI26 D4: `arrowFontColor` rides the same call; `base.colors.background`
  // is the canvas the label paints on (`#?light:dark` resolution).
  const arrowFont = computeArrowFontOverride(styleMap, [], base.colors.background);
  if (arrowFont.arrowFontFamily !== undefined) graphOverride.arrowFontFamily = arrowFont.arrowFontFamily;
  if (arrowFont.arrowFontSize !== undefined) graphOverride.arrowFontSize = arrowFont.arrowFontSize;
  if (arrowFont.arrowFontStyle !== undefined) graphOverride.arrowFontStyle = arrowFont.arrowFontStyle;
  if (arrowFont.arrowFontColor !== undefined) graphOverride.arrowFontColor = arrowFont.arrowFontColor;
  // mission skin-file-loading Batch 1 (D3): see `style-map-element.ts
  // #resolveGlobalBackground`'s own doc comment for the bare root/element
  // selector precedence this resolves.
  const rootElementBackground = resolveGlobalBackground(styleMap);
  if (rootElementBackground !== undefined) graphOverride.rootElementBackground = rootElementBackground;
  return graphOverride;
}

/** The non-`graph` StyleMap-derived Theme overrides, computed once and
 *  threaded through {@link applyStyleMapHasNoOverrides} and {@link
 *  buildStyleMapPartialTheme}. */
interface StyleMapExtras {
  readonly elements: Record<string, ElementColors>;
  readonly hasElements: boolean;
  readonly noteTagCascade: Readonly<Record<string, ElementColors>>;
  readonly showStereotypeByTag: Readonly<Record<string, boolean>>;
  readonly hasShowStereotypeByTag: boolean;
  readonly hasNoteTagCascade: boolean;
  readonly shadowing: number | undefined;
  readonly rootElementBorderRaw: string | undefined;
  /** The bare `root`/`element` BackgroundColor, RAW. */
  readonly rootElementBackgroundRaw: string | undefined;
  /** T14/D3: `computeCardinalityFontOverride`'s result -- the ONLY two
   *  `StyleMap`-derived fields that live at the TOP of `Theme` rather than
   *  under `colors.graph` (`theme.ts:21-22`), so they ride the partial's
   *  own top level in {@link buildStyleMapPartialTheme} instead of
   *  `graphOverride`. Empty (`{}`) for a StyleMap that never touches
   *  `arrow`/`arrow.cardinality` -- the caller keeps `base`'s own value via
   *  `deepMergeTheme`'s `partial[key] ?? base[key]` (`theme.ts:491`), which
   *  is how the "fallthrough through arrow, not a literal" behavior this
   *  task requires falls out for free. */
  readonly cardinalityFont: ReturnType<typeof computeCardinalityFontOverride>;
}

/**
 * database { … } → per-element
 * buckets (D4); the `.tagname` note-bucket cascade (G2 N37); the bare
 * root/element Shadowing/LineColor cascade (D3); and the D3 cardinality-font
 * cascade (T14).
 */
function computeStyleMapExtras(styleMap: StyleMap, base: Theme, diagramType: DiagramType | undefined): StyleMapExtras {
  const elements = collectElementStyleBuckets(styleMap, diagramType);
  const noteTagCascade = computeNoteStyleTagCascade(styleMap);
  const showStereotypeByTag = computeShowStereotypeByTag(styleMap);
  return {
    elements,
    hasElements: Object.keys(elements).length > 0,
    noteTagCascade,
    hasNoteTagCascade: Object.keys(noteTagCascade).length > 0,
    showStereotypeByTag,
    hasShowStereotypeByTag: Object.keys(showStereotypeByTag).length > 0,
    shadowing: resolveGlobalShadowing(styleMap),
    rootElementBorderRaw: resolveGlobalBorder(styleMap),
    rootElementBackgroundRaw: resolveGlobalBackground(styleMap),
    // SI26 D5: `cardinalityFontColor` rides the same top-level fold.
    cardinalityFont: computeCardinalityFontOverride(styleMap, [], base.colors.background),
  };
}

/** True when neither `graphOverride` nor any extra resolved to anything —
 *  `applyStyleMap` returns `base` unchanged in that case. */
function styleMapHasNoOverrides(graphOverride: Partial<GraphColors>, extras: StyleMapExtras): boolean {
  return (
    Object.keys(graphOverride).length === 0 &&
    !extras.hasElements &&
    !extras.hasNoteTagCascade &&
    !extras.hasShowStereotypeByTag &&
    extras.shadowing === undefined &&
    extras.rootElementBorderRaw === undefined &&
    Object.keys(extras.cardinalityFont).length === 0
  );
}

/** Assemble the `Partial<Theme>` passed to `deepMergeTheme`. */
function buildStyleMapPartialTheme(
  base: Theme,
  graphOverride: Partial<GraphColors>,
  extras: StyleMapExtras,
): Partial<Theme> {
  return {
    ...(extras.shadowing !== undefined ? { shadowing: extras.shadowing } : {}),
    // T14/D3: top-level fold -- see StyleMapExtras#cardinalityFont's own
    // doc comment for why this rides the partial's top level rather than
    // graphOverride.
    ...extras.cardinalityFont,
    colors: {
      ...base.colors,
      ...(extras.rootElementBorderRaw !== undefined ? { border: resolveColor(extras.rootElementBorderRaw) } : {}),
      ...(extras.hasElements ? { elements: mergeElementBuckets(base.colors.elements, extras.elements) } : {}),
      ...(extras.hasNoteTagCascade ? { noteTagCascade: extras.noteTagCascade } : {}),
      ...(extras.hasShowStereotypeByTag ? { showStereotypeByTag: extras.showStereotypeByTag } : {}),
      graph: { ...base.colors.graph, ...graphOverride },
    },
  };
}

/**
 * Apply element-scoped StyleMap entries to a base Theme.
 *
 * Reads selector-keyed entries from the merged StyleMap and maps them to
 * their corresponding Theme fields. The top-level bare key ("") is handled
 * separately via resolveSkinparam and is not processed here.
 *
 * The document background is not here: `document-back-color.ts` reads it
 * through the style engine (dss T1a, D5).
 *
 * `diagramType` decides which prefixed selectors are foreign to a bucket's
 * signature (D5, D5a, `collectElementStyleBuckets`); `undefined` for a `<style>`
 * the parser rejects (D6a).
 *
 * Returns a new Theme — neither `base` nor the StyleMap is mutated.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleBuilder.java:86-104
 */
export function applyStyleMap(styleMap: StyleMap, base: Theme, diagramType: DiagramType | undefined): Theme {
  const graphOverride = computeGraphOverride(styleMap, base);
  const extras = computeStyleMapExtras(styleMap, base, diagramType);
  const themed = styleMapHasNoOverrides(graphOverride, extras)
    ? base
    : deepMergeTheme(base, buildStyleMapPartialTheme(base, graphOverride, extras));
  return withElementMaximumWidth(themed, styleMap);
}

/**
 * `skinparam wrapWidth` IS `element { MaximumWidth }` (`addConvert("wrapWidth", PName.MaximumWidth, SName.element)`,
 * `FromSkinparamToStyle.java:250`), and `element` sits in every element signature: a bare `<style> element
 * { MaximumWidth N }` is the same knob as `theme.wrapWidth` (aar-T4c, `raneku-06-labe982`).
 */
function withElementMaximumWidth(theme: Theme, styleMap: StyleMap): Theme {
  const raw = styleMap.get('element')?.get('maximumwidth');
  const width = raw === undefined ? Number.NaN : Number.parseFloat(raw);
  return Number.isFinite(width) ? { ...theme, wrapWidth: width } : theme;
}
