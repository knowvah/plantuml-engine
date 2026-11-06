/**
 * Theme resolution -- extracted out of `src/index.ts` (this repo's
 * `check-complexity.py` 500-line file cap; a MECHANICAL move, no behavior
 * change).
 */

import type { RenderOptions } from '../index.js';
import type { DiagramType } from './block-extractor.js';
import { documentBackColor, documentStyleBuilder, type DocumentBackColor } from './document-back-color.js';
import type { PreprocessorResult } from './preprocessor.js';
import { resolveTheme, deepMergeTheme } from './theme.js';
import type { Theme } from './theme.js';
import { resolveSkinparam } from './skinparam.js';
import type { StyleMap } from './skinparam.js';
import { applyStyleMap } from './style-map-theme.js';
import { applySkinRun, skinRunsOf } from './skin-loader.js';
import { computeClassTagCascadeGenerations } from './style-cascade-class.js';
import { legacyStereotypeFonts } from './legacy-stereotype-font.js';
import { objectSkinDefaults } from './object-skin-default.js';
import { elementScopeColors, type ElementScopeColors } from './style-element-scope.js';
import { styleSkinparamSegments, type StyleSkinparamSegment } from './style-skinparam-segments.js';
import { withoutSupersededByStyle, withoutSupersededCascades } from './skinparam-supersedes-cascade.js';
import { dropRootShadowed, rootColoursOf } from './style-root-shadowing.js';
import { cleanForKeySlow } from './style/mindmap-style-builder.js';
import { parseConditionalColor } from './klimt/color/HColorSet.js';
import { parseClockwise } from './annotations/annotation-clockwise.js';
import { withActivityCircleStyle } from './activity-circle-style.js';
import { withClassShadowing } from './class-style-facts.js';
import { withStateNameFont, withStateShadowing } from './state-style-facts.js';
import { withActivityBoxStyle } from './activity-box-style.js';
import { withActivityDocumentStyle } from './activity-document-style.js';
import { withNoteRoundCorner, withNoteStyleFacts } from './note-style-facts.js';
import { ROOT_LINE_COLOR_KEY } from './skinparam-key-handlers-shared.js';
import { OptionKey } from './tim/EaterOption.js';

/** The engines that draw a note through `EntityImageNote` / `FtileWithNoteOpale` and read its merged style. */
const NOTE_FACT_ENGINES: ReadonlySet<DiagramType> = new Set<DiagramType>(['activity', 'state']);

/** The engines whose notes draw through `EntityImageNote` and read the flat `skinparam roundCorner` for their corner. */
const NOTE_ROUND_CORNER_ENGINES: ReadonlySet<DiagramType> = new Set<DiagramType>(['class', 'object', 'state']);

/**
 * Five-stage theme resolution:
 *
 * Stage 1 — Named base theme.
 *   String options.theme overrides !theme from source (existing behavior).
 *
 * Stage 1.5 — Apply a `skin <name>` directive's own base layer (D6,
 *   skin-file-loading mission Batch 1). BELOW Stage 2/3 so the document's
 *   own skinparam/`<style>` always wins over the loaded skin.
 *
 * Stages 2-3 — Apply the source's skinparam directives and <style> blocks in
 *   DECLARATION order (cdd4-T7b): consecutive skinparams as one run through
 *   resolveSkinparam; consecutive style blocks merged as one run, whose
 *   top-level bare declarations ("" key) flow through resolveSkinparam and
 *   whose element-scoped entries (e.g. "actor", "class") go through
 *   applyStyleMap. A document whose styles all follow its skinparams sees
 *   exactly the former two stages. Then the merged `root`/`document`
 *   declarations reach `styleOverrides` / `diagramMargin`.
 *
 * Stage 3c — The document background, `TitledDiagram#calculateBackColor` over
 *   the style engine (dss T1a, `document-back-color.ts`), for the `diagramType`
 *   its signature names.
 *
 * Stage 3d — The element colours through the same builder (dss T2a,
 *   `style-element-scope.ts`), into `theme.colors.elements`.
 *
 * Stage 4 — Caller Partial<Theme> wins over everything.
 *
 * Resolution order confirmed against upstream TContext.java:executeTheme().
 */
export interface ResolvedThemeAndStyles {
  readonly theme: Theme;
  /** The SAME merged `StyleMap` used to build `theme` (Stage 3a) -- T7
   *  threads it back out so `resolveAnnotationStyles` (D6) sees the
   *  identical `<style>` overrides `buildTheme` itself already applied,
   *  instead of re-deriving a second copy from `preprocessed.styles`. */
  readonly styleMap: StyleMap;
}

/**
 * The five stages above. `diagramType` is `plugin.type`: the signature of the
 * document background (Stage 3c) names the diagram.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/TContext.java
 */
export function buildTheme(
  preprocessed: PreprocessorResult,
  options: RenderOptions | undefined,
  diagramType: DiagramType,
): ResolvedThemeAndStyles {
  // Stage 1: named base theme
  const themeName = typeof options?.theme === 'string' ? options.theme : (preprocessed.theme ?? 'default');
  const base = resolveTheme(themeName);

  // Stage 1.5: a `skin <name>` directive's sheet (D6, skin-file-loading
  // mission Batch 1) -- its runs come FIRST in the declaration order, so the
  // document's own skinparam/`<style>` lines below beat it, and a later root
  // colour of either shadows an earlier element value (unwind2-S8).
  // Stages 2-3: skinparam directives and <style> blocks, in declaration order
  // (cdd4-T7b -- see `style-skinparam-segments.ts`).
  // unwind2-S5: minus what a later `root` colour shadows (`style-root-shadowing.ts`).
  const builder = documentStyleBuilder(preprocessed);
  // D6a: a `<style>` the parser rejects keeps the flat colours as they were; no signature applies.
  const flatType = builder === undefined && preprocessed.styles.length > 0 ? undefined : diagramType;
  const skinRuns = skinRunsOf(preprocessed);
  const ordered = dropRootShadowed([
    ...skinRuns.map((styleMap): StyleSkinparamSegment => ({ kind: 'style', styleMap })),
    ...styleSkinparamSegments(preprocessed),
  ]);
  const skinSegments = ordered.slice(0, skinRuns.length);
  const withSkin = skinSegments.reduce((theme, segment) => applySkinSegment(theme, segment, flatType), base);
  const segments = ordered.slice(skinRuns.length).flatMap(withRootStyleRun);
  const withDeclarations = segments.reduce((theme, segment) => applySegment(theme, segment, flatType), withSkin);
  // The skin's root colours reach every style reader at the skin's position,
  // as a skinparam run's do (`withRootStyleRun`); its other values are the
  // flat theme's own defaults, which those readers already start from.
  const styleMap = mergedStyleMap([...skinSegments.map(rootColourRun), ...segments]);
  // add4-T3f: the activity circles' priority-ordered merged style -- see
  // `activity-circle-style.ts`; read only by the activity renderer.
  const withCircles = withActivityCircleStyle(withDocumentStyle(withDeclarations, styleMap), preprocessed);
  // ubt-T1b: a stereotyped box's merged style (`activity-box-style.ts`), activity only.
  const withStyleMap =
    diagramType === 'activity'
      ? withActivityDocumentStyle(withActivityBoxStyle(withCircles, preprocessed), preprocessed)
      : withCircles;
  // The note's merged `Shadowing` and `LineThickness` (`note-style-facts.ts`), the engines whose notes read them.
  const withNotes = NOTE_FACT_ENGINES.has(diagramType)
    ? withNoteStyleFacts(withStyleMap, preprocessed, diagramType)
    : withStyleMap;
  const withNoteCorner = NOTE_ROUND_CORNER_ENGINES.has(diagramType)
    ? withNoteRoundCorner(withNotes, preprocessed)
    : withNotes;
  // The class box's merged `Shadowing` (`class-style-facts.ts`), class only.
  const withClassFacts = diagramType === 'class' ? withClassShadowing(withNoteCorner, preprocessed) : withNoteCorner;
  // The state box's merged `Shadowing` replaces the flat root tier the state sites read (`state-style-facts.ts`).
  const withEngineFacts =
    diagramType === 'state'
      ? withStateNameFont(withStateShadowing(withClassFacts, preprocessed), preprocessed)
      : withClassFacts;

  // G2 N39: position-scoped classifier `.tagname` cascade generations --
  // see `preprocessed.stylePositions`'s doc comment for the mechanism.
  // `computeClassTagCascadeGenerations` itself no-ops (returns undefined)
  // for the overwhelmingly common 0-or-1-`<style>`-block case, so this is
  // zero-cost for every fixture that does not exercise the mechanism.
  const classTagCascadeGenerations = computeClassTagCascadeGenerations(preprocessed.styles);
  const withGenerations =
    classTagCascadeGenerations === undefined
      ? withEngineFacts
      : {
          ...withEngineFacts,
          colors: {
            ...withEngineFacts.colors,
            graph: { ...withEngineFacts.colors.graph, classTagCascadeGenerations },
          },
        };

  // Stage 3b: `!option handwritten true` (sdd3-T8f), the second arm of
  // `TitledDiagram#isHandwritten` -- see `withHandwrittenOption`.
  const withOptions = withHandwrittenOption(withGenerations, preprocessed);

  // Stage 3c: the document background (D1, D3).
  const callerNamedTheme = typeof options?.theme === 'string';
  const withBackColor = withDocumentBackColor(
    withOptions,
    documentBackColor(preprocessed, diagramType, callerNamedTheme, builder),
  );

  // Stage 3d: the element colours, one builder per document (D2, D3, D3a).
  const withScope = withElementScope(
    withBackColor,
    elementScopeColors(preprocessed, diagramType, withBackColor.colors.elements, { callerNamedTheme, builder }),
  );
  // Stage 3e: the class and object stereotype label colours, which upstream reads off the legacy skinparam chain
  // and no style (dss T3b, `legacy-stereotype-font.ts`).
  const withElements =
    diagramType === 'class'
      ? withElementScope(
          withElementScope(withScope, legacyStereotypeFonts(preprocessed.skinparam, withScope.colors.text)),
          objectSkinDefaults(preprocessed.skinparam),
        )
      : withScope;

  // Stage 4: caller Partial<Theme> wins over everything
  const theme =
    options?.theme !== undefined && typeof options.theme === 'object'
      ? deepMergeTheme(withElements, options.theme)
      : withElements;
  // #lizard forgives -- mechanical extraction of index.ts's own pre-existing
  // `buildTheme` (unchanged five-stage structure); was
  // never flagged in index.ts because that file's 500-line gate short-
  // circuited the per-function check first.
  return { theme, styleMap };
}

/**
 * The pair replaces BOTH fields: `calculateBackColor` has one answer, so a
 * solid value must not keep a gradient the flat path holds.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289
 */
function withDocumentBackColor(theme: Theme, pair: DocumentBackColor | undefined): Theme {
  if (pair === undefined) return theme;
  const { backgroundGradient: _replaced, ...colors } = theme.colors;
  return { ...theme, colors: { ...colors, ...pair } };
}

/**
 * Each bucket field by field: its other fields (font size, stereotype maps) are other signatures' or other tiers'.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleBuilder.java:86-104
 */
function withElementScope(theme: Theme, scope: Partial<Record<string, ElementScopeColors>>): Theme {
  const buckets = Object.entries(scope);
  if (buckets.length === 0) return theme;
  const elements = { ...theme.colors.elements };
  for (const [bucket, colors] of buckets) elements[bucket] = { ...elements[bucket], ...colors };
  return { ...theme, colors: { ...theme.colors, elements } };
}

/**
 * `TitledDiagram#isHandwritten`: `skinParam.handwritten()` (the theme's
 * `handwritten`, already built from `skinparam handwritten`) OR, through
 * `super.isHandwritten()`, `UgDiagram#isHandwritten`'s
 * `getPreprocessingArtifact().getOption().isTrue(OptionKey.HANDWRITTEN)`.
 * `ConfigurationStore#isTrue` is `"true".equalsIgnoreCase(value)`; a bare
 * `!option handwritten` defines the key's default `"true"`
 * (`OptionKey.java:40` `HANDWRITTEN("true")`, `EaterOption.java:66-67`). The
 * option can only turn handwriting ON: a `skinparam handwritten true` that
 * set it stays on whatever the option says.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:115-118
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/UgDiagram.java:117-121
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/preproc/ConfigurationStore.java:60-62
 */
function withHandwrittenOption(theme: Theme, preprocessed: PreprocessorResult): Theme {
  const value = preprocessed.options?.get(OptionKey.HANDWRITTEN);
  return value?.toLowerCase() === 'true' ? { ...theme, handwritten: true } : theme;
}

/**
 * A skinparam run, followed by the `root` style run its root colours ARE
 * (unwind2-S5): `skinparam defaultFontColor` converts to exactly
 * `root { FontColor }` (`FromSkinparamToStyle.java:157`), whose only effect
 * upstream is that style, so it reaches every resolver a `<style> root`
 * block reaches, at the skinparam's position.
 */
function withRootStyleRun(segment: StyleSkinparamSegment): StyleSkinparamSegment[] {
  if (segment.kind === 'style') return [segment];
  const root = rootColoursOf(segment.entries);
  return root.size === 0 ? [segment] : [segment, { kind: 'style', styleMap: new Map([['root', root]]) }];
}

/** Every `<style>` run merged: last writer per selector+property. */
function mergedStyleMap(segments: readonly StyleSkinparamSegment[]): StyleMap {
  return segments.reduce<StyleMap>((acc, segment) => {
    if (segment.kind === 'skinparam') return acc;
    segment.styleMap.forEach((props, selector) => {
      const existing = acc.get(selector) ?? new Map<string, string>();
      props.forEach((v, k) => existing.set(k, v));
      acc.set(selector, existing);
    });
    return acc;
  }, new Map());
}

/** Only the `root` colours of a `<style>` run (`ROOT_COLOURS` keys). */
function rootColourRun(segment: StyleSkinparamSegment): StyleSkinparamSegment {
  if (segment.kind !== 'style') return segment;
  const root = segment.styleMap.get('root') ?? new Map<string, string>();
  const colours = new Map([...root].filter(([key]) => ROOT_COLOUR_KEYS.has(key)));
  return { kind: 'style', styleMap: new Map([['root', colours]]) };
}

/** The `root` colours `style-root-shadowing.ts` ranks by declaration order. */
const ROOT_COLOUR_KEYS: ReadonlySet<string> = new Set(['fontcolor', 'linecolor']);

/** A skin run onto the theme (`skin-loader.ts#applySkinRun`). */
function applySkinSegment(theme: Theme, segment: StyleSkinparamSegment, diagramType: DiagramType | undefined): Theme {
  if (segment.kind !== 'style') return theme;
  return applySkinRun(theme, segment.styleMap, diagramType, rootCascadeSkinparams(segment.styleMap.get('root')));
}

/**
 * One run of declarations onto the theme. A skinparam run goes through
 * `resolveSkinparam`; a `<style>` run sends its top-level bare declarations
 * (the `""` key) through `resolveSkinparam` too, then its element-scoped
 * selectors through `applyStyleMap`.
 */
function applySegment(theme: Theme, segment: StyleSkinparamSegment, diagramType: DiagramType | undefined): Theme {
  if (segment.kind === 'skinparam')
    return withoutSupersededArrowCascade(
      resolveSkinparam(segment.entries, withoutSupersededCascades(theme, segment.entries.keys())).theme,
      segment.entries,
    );
  const flatRoot = new Map([
    ...rootCascadeSkinparams(segment.styleMap.get('root')),
    ...(segment.styleMap.get('') ?? new Map<string, string>()),
  ]);
  return withoutSupersededByStyle(
    applyStyleMap(segment.styleMap, resolveSkinparam(flatRoot, theme).theme, diagramType),
    segment.styleMap,
  );
}

/**
 * `skinparam ArrowColor` (and every `<type>ArrowColor`, which `cleanForKey`
 * collapses to it, `SkinParam.java:277-283`) converts to `arrow { LineColor }`
 * (`FromSkinparamToStyle.java:151`). Being later than whatever `<style>` run
 * set the class arrow cascade (`root`/`classDiagram`/`arrow` LineColor,
 * `style-cascade-class.ts`), its counter wins on the class edge's
 * `{root, element, classDiagram, arrow}` signature (`Style.java:121-134`), so
 * the cascade value it supersedes is dropped and `colors.arrow` -- which it
 * just set -- is what the edge draws (unwind2-S5).
 */
function withoutSupersededArrowCascade(theme: Theme, entries: ReadonlyMap<string, string>): Theme {
  const graph = theme.colors.graph;
  if (graph.classCascadeArrowColor === undefined && graph.descriptionCascadeArrowColor === undefined) return theme;
  if (![...entries.keys()].some((key) => cleanForKeySlow(key).includes('arrowcolor'))) return theme;
  const { classCascadeArrowColor: _superseded, descriptionCascadeArrowColor: _superseded2, ...rest } = graph;
  return { ...theme, colors: { ...theme.colors, graph: rest } };
}

/**
 * A `<style> root { FontColor; LineColor }`, AT ITS POSITION in the run order
 * (unwind2-S5). Every style signature contains `root`, and upstream merges
 * values by declaration counter, not by selector depth: `Style#mergeWith`
 * (`style/Style.java:121-134`) keeps the higher-priority value
 * (`DarkString#mergeWith`, `DarkString.java:50-66`), and every value's
 * priority is `StyleBuilder#getNextInt` (`ValueImpl.java:51-55`,
 * `StyleBuilder.java:119-122`) -- so a later `root` beats an earlier
 * `skinparam ArrowColor`, and a later `ArrowColor` beats an earlier `root`.
 *
 * - `FontColor` IS `skinparam defaultFontColor`: that skinparam converts to
 *   exactly `root { FontColor }` (`FromSkinparamToStyle.java:157`), so it
 *   runs through the same handler.
 * - `LineColor` has no skinparam twin; it reaches the two theme fields every
 *   element and arrow inherits it through, `colors.border` (`borderColor`'s
 *   handler) and `colors.arrow` (`arrowColor`'s handler).
 *
 * These two fields used to come from a precompiled summary of the theme
 * applied below every document line, so the theme's value could neither beat
 * an earlier document line nor be beaten by a later document `root` block.
 *
 * A conditional `#?light:dark` colour (`HColorScheme`) is not routed: upstream
 * resolves it per drawn element against that element's own background
 * (`HColorScheme#getAppropriateColor`), and these flat fields would carry the
 * raw token into the SVG.
 */
function rootCascadeSkinparams(root: ReadonlyMap<string, string> | undefined): Map<string, string> {
  const out = new Map<string, string>();
  const plain = (key: string): string | undefined => {
    const value = root?.get(key);
    return value === undefined || parseConditionalColor(value) !== undefined ? undefined : value;
  };
  const fontColor = plain('fontcolor');
  if (fontColor !== undefined) out.set('defaultfontcolor', fontColor);
  const lineColor = plain('linecolor');
  if (lineColor !== undefined) {
    out.set(ROOT_LINE_COLOR_KEY, lineColor);
    out.set('arrowcolor', lineColor);
  }
  return out;
}

/** A top-level `root` / `document` selector, or one nested under them. */
function isRootOrDocumentSelector(selector: string): boolean {
  return ['root', 'document'].some((name) => selector === name || selector.startsWith(`${name}.`));
}

/**
 * The merged `<style>` map's `root` / `document` declarations, routed to the
 * two `Theme` fields that carry them (cdd4-T7b; both were filled only by the
 * precompiled theme summary before, so a document's own `root { Margin 5 }`
 * never reached them either):
 *
 * - `styleOverrides` -- the selectors themselves. `root` and `document` are
 *   members of every chrome element's `{root, document, <element>}` signature
 *   (`StyleStorage#computeMergedStyle` matches by containment), which is what
 *   `annotations/style.ts` and the activity text/line resolvers read.
 * - `diagramMargin` -- `TextBlockExporter#calculateMargin`
 *   (`core/TextBlockExporter.java:510-516`): the merged `{root, document}`
 *   style's `Margin` when it has one, else `getDefaultMargins()` (left to the
 *   engine). `document` is declared after `root` in every bundled theme, and
 *   `computeMergedStyle` overwrites in declaration order, so it wins.
 */
function withDocumentStyle(theme: Theme, styleMap: StyleMap): Theme {
  const picked = [...styleMap].filter(([selector]) => isRootOrDocumentSelector(selector));
  if (picked.length === 0) return theme;
  const styleOverrides = { ...theme.styleOverrides };
  for (const [selector, props] of picked)
    styleOverrides[selector] = { ...styleOverrides[selector], ...Object.fromEntries(props) };
  const margin = styleMap.get('document')?.get('margin') ?? styleMap.get('root')?.get('margin');
  return {
    ...theme,
    styleOverrides,
    ...(margin !== undefined ? { diagramMargin: parseClockwise(margin) } : {}),
  };
}
