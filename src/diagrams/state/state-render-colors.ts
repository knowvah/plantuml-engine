/**
 * Shared state-box color/stroke constants and per-node `#color` override
 * resolution (mission G4 S2, mechanism 5) — used by both renderer-box.ts
 * (normal/json leaf box) and renderer-pseudostate.ts (history/deepHistory).
 * History draws the plain leaf box's default fill/border/stroke-width
 * (cekolo-21-gini183: fill="#F1F1F1" stroke="#181818" stroke-width="0.5"),
 * but by value only: `EntityImagePseudoState.java:70-71` signs `root,
 * element, stateDiagram, diamond`, not `EntityImageStateCommon.STYLE`'s
 * `state`, and `EntityImageBranch.java:62-63` (`<<choice>>`) signs `root,
 * element, activityDiagram, activity, diamond` (dss T3e; the former claim
 * that both share `STYLE` was false). Initial/final/fork/join have their
 * own, visually distinct default colors — see renderer-pseudostate.ts.
 * @see ~/git/plantuml/.../svek/image/EntityImageStateCommon.java
 */
import type { StateNodeGeo } from './state-geo-types.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import { resolveBareOrBackColor } from '../../core/color-override.js';
import type { Theme } from '../../core/theme.js';
import { isTransparentColor, parseColor, type Paint } from '../../core/paint.js';
import {
  STATE_BODY_BUCKET,
  STATE_BUCKET,
  stateBucketColor,
  stateBucketPaint,
  STATE_NAME_BUCKET,
} from './state-bucket-colors.js';

/** Default box fill (`skinparam stateBackgroundColor`'s own terminal
 *  default) — jar-verified jocela-05-niba392 / votoki-67-gufa610 /
 *  gefefe-91-xoge233 / cekolo-21-gini183 (history + choice). */
export const STATE_DEFAULT_BACKGROUND = '#F1F1F1';

/** Box/divider/history/choice border stroke-width — jar-verified for state
 *  directly (not assumed from class's own identical `0.5` default). */
export const STATE_BORDER_STROKE_WIDTH = 0.5;

/**
 * `Colors#getColor(BackGroundColor)` — a per-node `#color`/`#back:color`
 * inline override (`State.color`, the SAME raw grammar `Classifier.color`
 * uses upstream, per `state-commands-declarations.ts`'s own doc comment)
 * wins over `fallback`. Jar-verified jocela-05-niba392 (`state state1
 * #red` → `fill="#FF0000"`).
 */
export function resolveStateFill(node: Pick<StateNodeGeo, 'color'>, fallback: Paint): Paint {
  const override = resolveBareOrBackColor(node.color);
  return override !== undefined ? inlineBack(override) : fallback;
}

/**
 * An inline `#a-b` is a gradient, as `HColorSet` splits every colour token (`HColorSet.java:109-116`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/HColorSet.java:109-116
 */
export function inlineBack(token: string): Paint {
  const paint = parseColor(token);
  return typeof paint === 'string' ? resolveColorToSvgHex(paint) : paint;
}

/** stdd T3d: `Style#getUFont` of the `state` style (`EntityImageStateCommon.java:72-80`, `InnerStateAutonom.java:92`,
 *  `ClusterHeader.java:156`): `state { FontName }` (`skinparam state { FontName }`, `FromSkinparamToStyle.java:206`),
 *  else the root's. `SvgGraphics#text` prints it only when it is not the root's (`SvgGraphics.java:726-727`). */
export function stateFontFamily(theme: Pick<Theme, 'colors' | 'fontFamily'>): string {
  return theme.colors.elements?.['state']?.fontFamily ?? theme.fontFamily;
}

/** mission G4 S10: `theme.colors.elements['state'].background` -- the SAME
 *  generic `ELEMENT_BUCKET_SNAMES` bucket `object`/`map`/`json`/`note`
 *  already reuse for FREE (`core/skinparam.ts`'s own `'state'` entry doc
 *  comment) for the PLAIN `skinparam stateBackgroundColor` form -- a plain
 *  color NAME still needs HColorSet resolution (mirrors `renderer-classifier-
 *  box.ts#resolveElementBackground`'s identical branch); a gradient stays whole. */
function resolveStateBucketBackground(theme: Theme): Paint | undefined {
  return stateBucketPaint(theme, STATE_BUCKET, 'background');
}

/** mission skin-file-loading Batch 1 (D3): `theme.colors.graph.
 *  rootElementBackground` -- the GLOBAL `skin <name>`/`<style> root {}`/
 *  `<style> element {}` universal BackgroundColor cascade (`style-map-
 *  element.ts#resolveGlobalBackground`'s own doc comment for the full
 *  mechanism and why it is a DEDICATED field, not `theme.colors.
 *  background`). Sits BELOW the `state`-element bucket tier ({@link
 *  resolveStateBucketBackground}) and ABOVE each shape's own hardcoded
 *  default -- a bare `state { BackgroundColor }` selector is strictly
 *  more specific than the universal `root`/`element` fallback, matching
 *  every other tiered resolver in this module. Jar-verified
 *  `nimana-36-veco708` (`skin rose`, no `state {}` override -> box
 *  `fill="#FEFECE"`, rose's `root { BackGroundColor #FEFECE }` value). */
function resolveStateRootElementBackground(theme: Theme): string | undefined {
  const raw = theme.colors.graph.rootElementBackground;
  return raw !== undefined ? resolveColorToSvgHex(raw) : undefined;
}

/** mission G6 T4: `theme.colors.elements['state'].border` -- the SAME
 *  generic bucket {@link resolveStateBucketBackground} reads, applied to a
 *  state box/composite-cluster outline's own stroke. Populated by a bare
 *  `<style> state { LineColor ... } }` selector directly, OR (mission G6
 *  T4) by `core/skinparam.ts#parseStyleBlock`'s own bare `stateDiagram {
 *  LineColor ... } }` cascade alias (`decede-10-buvu414`, jar-verified --
 *  see `resolveStateBorder`'s own doc comment for the full precedence
 *  tier). A gradient stays whole, as {@link resolveStateBucketBackground}. */
function resolveStateBucketBorder(theme: Theme): Paint | undefined {
  return stateBucketPaint(theme, STATE_BUCKET, 'border');
}

/** mission G6 T4: `theme.colors.elements['state'].font` -- the SAME generic
 *  bucket {@link resolveStateBucketBackground} reads, applied to a state
 *  box's own label text color. See {@link resolveStateBucketBorder}'s own
 *  doc comment for the identical population mechanism (bare `state {
 *  FontColor ... } }` OR the `stateDiagram { FontColor ... } }` cascade
 *  alias). */
function resolveStateBucketFontColor(theme: Theme): string | undefined {
  const bucket = theme.colors.elements?.['state']?.font;
  return typeof bucket === 'string' ? resolveColorToSvgHex(bucket) : undefined;
}

/** mission G4 S15: `skinparam stateBackgroundColor<<stereo>> #X` --
 *  `theme.colors.graph.stateBackgroundColorByStereo`'s own doc comment
 *  (theme.ts) for the precedence tier this sits at (below the `#color`
 *  inline override, above the bare `state`-element bucket). Keyed by the
 *  node's OWN lowercased stereotype, mirroring `resolveStateBorder`'s
 *  identical lookup shape. */
function resolveStateBackgroundByStereo(node: Pick<StateNodeGeo, 'stereotype'>, theme: Theme): string | undefined {
  if (node.stereotype === undefined) return undefined;
  const override = theme.colors.graph.stateBackgroundColorByStereo?.[node.stereotype.toLowerCase()];
  return override !== undefined ? resolveColorToSvgHex(override) : undefined;
}

/**
 * `resolveStateFill` PLUS the `state`-element bucket tier, for the call
 * sites that share jar's `EntityImageStateCommon` StyleSignature (plain
 * leaf box, composite box, choice/history/deepHistory pseudostates) -- NOT
 * initial/final/fork/join/syncBar, which keep their OWN distinct default
 * colors and stay on the plain {@link resolveStateFill} (module doc
 * comment's own scoping note; `core/skinparam.ts`'s `'state'` bucket entry
 * doc comment). Precedence: `#color`/`#back:color` inline override (highest)
 * -> `skinparam stateBackgroundColor<<stereo>>` (mission G4 S15) ->
 * `skinparam stateBackgroundColor` bucket -> the `skin <name>`/`<style>
 * root {}`/`element {}` universal cascade (mission skin-file-loading
 * Batch 1, D3 -- {@link resolveStateRootElementBackground}) -> `fallback`
 * (the per-kind hardcoded default, e.g. {@link STATE_DEFAULT_BACKGROUND}).
 * `zoneBucket` (dss T3c) names the composite zone being filled; see the tier note below.
 */
export function resolveStateFillBucketed(
  node: Pick<StateNodeGeo, 'color' | 'stereotype'>,
  theme: Theme,
  fallback: string,
  zoneBucket?: string,
): Paint {
  const override = resolveBareOrBackColor(node.color);
  if (override !== undefined) return inlineBack(override);
  return (
    resolveStateBackgroundByStereo(node, theme) ??
    // dss T3c: a zone (`state.name|description|body`) is a narrower signature
    // than `state` (`EntityImageStateCommon.java:75-96`), so its bucket sits
    // above the `state` one and below the stereotype tier (+1000 priority).
    (zoneBucket !== undefined ? stateBucketPaint(theme, zoneBucket, 'background') : undefined) ??
    resolveStateBucketBackground(theme) ??
    resolveStateRootElementBackground(theme) ??
    fallback
  );
}

/** The `body` zone's default: the skin's `state { body { BackGroundColor transparent } }`
 *  (`plantuml.skin:279-281`), which `RoundedSouth#drawU` (`RoundedSouth.java:60-61`) does not draw. */
const BODY_TRANSPARENT = 'none';

/**
 * dss T3c, site 6: the colour of a composite's `body` zone, or `undefined` when the
 * jar draws nothing there. `InnerStateAutonom.java:107-117` and `Cluster.java:464-470`
 * read `STYLE.addSName(SName.body)`; `RoundedSouth.java:60-61` returns on a transparent
 * back colour. Replaces the cluster shape's old "`fill !== STATE_DEFAULT_BACKGROUND`"
 * signal, which could not see a `body`-only selector or a `body` equal to the box default.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/RoundedSouth.java
 */
export function resolveStateBodyFill(
  node: Pick<StateNodeGeo, 'color' | 'stereotype'>,
  theme: Theme,
): Paint | undefined {
  const fill = resolveStateFillBucketed(node, theme, BODY_TRANSPARENT, STATE_BODY_BUCKET);
  return fill === BODY_TRANSPARENT || isTransparentColor(fill) ? undefined : fill;
}

/**
 * `skinparam StateBorderColor<<X>> #color` -- `SkinParam#getColor(ColorParam,
 * Stereotype)`, a direct stereotype-qualified VALUE lookup (mission G4 S9,
 * mirrors the class engine's `classBorderThicknessByStereo` mechanism, G2
 * N51). Wins over the `state`-element bucket tier (mission G6 T4,
 * {@link resolveStateBucketBorder}) when `node`'s OWN stereotype (lowercased,
 * matching `core/skinparam.ts`'s own lowercased-key storage) has a matching
 * entry in `theme.colors.graph.stateBorderColorByStereo`. Jar-verified
 * `semala-31-joji042` (`skinparam StateBorderColor<<meblue>> blue`, `state
 * a<<meblue>>` -> box/divider `stroke="#0000FF"`; its plain, non-stereotyped
 * children keep the `#181818` default). The bucket tier itself falls back to
 * the plain `theme.colors.border` default, matching {@link
 * resolveStateFillBucketed}'s own precedence shape.
 */
/**
 * stdd T3a: the box's stroke attributes -- `Style.getStroke(colors)` (`Style.java:322-328`): the state's
 * own `Colors` line stroke (`LinkStyle.java:98-108`), else the style's `LineThickness` (`width`).
 */
export function stateBorderStrokeAttrs(
  node: Pick<StateNodeGeo, 'stateColors'>,
  theme: Pick<Theme, 'colors'>,
): { strokeWidth: number; strokeDasharray?: string } {
  const own = node.stateColors?.lineStroke;
  if (own === undefined) return { strokeWidth: stateLineThickness(theme) };
  return {
    strokeWidth: own.thickness,
    ...(own.dash !== undefined ? { strokeDasharray: `${own.dash[0]},${own.dash[1]}` } : {}),
  };
}

/** stdd T3b: the state style's `LineThickness` (`style-cascade-state.ts`), then `skinparam stateBorderThickness`,
 *  which upstream converts to that same `state { LineThickness }` (`FromSkinparamToStyle.java:208`) and ours keeps
 *  in the `state` element bucket (`skinparam-key-handlers.ts#tryElementLineThicknessBucket`), else the skin's
 *  `element` 0.5. */
export function stateLineThickness(theme: Pick<Theme, 'colors'>): number {
  return (
    theme.colors.graph.stateLineThickness ??
    theme.colors.elements?.['state']?.lineThickness ??
    STATE_BORDER_STROKE_WIDTH
  );
}

export function resolveStateBorder(node: Pick<StateNodeGeo, 'stereotype' | 'stateColors'>, theme: Theme): Paint {
  // stdd T3a: `EntityImageStateCommon.java:144-150` -- the state's own LINE colour first.
  if (node.stateColors?.lineColor !== undefined) return node.stateColors.lineColor;
  if (node.stereotype !== undefined) {
    const override = theme.colors.graph.stateBorderColorByStereo?.[node.stereotype.toLowerCase()];
    if (override !== undefined) return resolveColorToSvgHex(override);
  }
  return resolveStateBucketBorder(theme) ?? theme.colors.border;
}

/**
 * `skinparam StateFontColor<<X>> #color` -- mission G4 S15, the SAME
 * direct-value-lookup mechanism as {@link resolveStateBorder}, applied to
 * a state box's own label text color. Wins over the `state`-element bucket
 * tier (mission G6 T4, {@link resolveStateBucketFontColor}) when `node`'s
 * OWN stereotype (lowercased) has a matching entry in
 * `theme.colors.graph.stateFontColorByStereo`; the bucket tier itself wins
 * over `fallback` (the box's pre-existing hardcoded `#000000` text default),
 * matching {@link resolveStateFillBucketed}'s own precedence shape.
 */
export function resolveStateFontColor(
  node: Pick<StateNodeGeo, 'stereotype' | 'stateColors'>,
  theme: Theme,
  fallback: string,
  zoneBucket?: string,
): string {
  // stdd T3a: `Style.getFontConfiguration(set, colors)` (`Style.java:259-264`) takes the state's TEXT
  // colour for the name (`EntityImageStateCommon.java:73-76`), never for the description.
  if (zoneBucket === STATE_NAME_BUCKET && typeof node.stateColors?.textColor === 'string') {
    return node.stateColors.textColor;
  }
  if (node.stereotype !== undefined) {
    const override = theme.colors.graph.stateFontColorByStereo?.[node.stereotype.toLowerCase()];
    if (override !== undefined) return resolveColorToSvgHex(override);
  }
  // dss T3c: the `name`/`description` zone's own FontColor (`EntityImageStateCommon.java:75-82`)
  // sits above the `state` one, as in {@link resolveStateFillBucketed}.
  return (
    (zoneBucket !== undefined ? stateBucketColor(theme, zoneBucket, 'font') : undefined) ??
    resolveStateBucketFontColor(theme) ??
    fallback
  );
}

/**
 * `skinparam StateFontSize<<X>> N` -- mission G4 S16, the SAME direct-value-
 * lookup mechanism as {@link resolveStateBorder}/{@link resolveStateFontColor},
 * applied to a state box's own label TEXT SIZE. Wins over `fallback` (the
 * caller's own default -- `theme.fontSize` at every current call site) when
 * `node`'s OWN stereotype (lowercased) has a matching entry in
 * `theme.colors.graph.stateFontSizeByStereo`. Unlike its two color siblings,
 * this is read from BOTH `state-sizing.ts` (layout-time measurement, which
 * feeds the box's own DOT node width/height) and `renderer-box.ts`
 * (render-time `<text font-size>` + line-step formula) -- see
 * `theme.ts#stateFontSizeByStereo`'s own doc comment for the full mechanism.
 */
export function resolveStateFontSize(
  node: Pick<StateNodeGeo, 'stereotype'>,
  theme: Pick<Theme, 'colors'>,
  fallback: number,
): number {
  if (node.stereotype !== undefined) {
    const override = theme.colors.graph.stateFontSizeByStereo?.[node.stereotype.toLowerCase()];
    if (override !== undefined) return override;
  }
  return fallback;
}

/**
 * `<style> stateDiagram { arrow { LineColor ... } } }` -- mission G4 S16.
 * Wins over `fallback` (`theme.colors.arrow` at the ONE current call
 * site) when `theme.colors.graph.stateArrowLineColor` is set. See
 * `theme.ts#stateArrowLineColor`'s own doc comment for the full
 * derivation and the `style-map-theme.ts#applyStyleMap` injection point.
 */
export function resolveStateArrowLineColor(theme: Pick<Theme, 'colors'>, fallback: Paint): Paint {
  const override = theme.colors.graph.stateArrowLineColor;
  return override !== undefined ? resolveColorToSvgHex(override) : fallback;
}

/**
 * `<style> stateDiagram { arrow { HeadColor ... } } }` -- mission G4 S16,
 * the SAME cascade as {@link resolveStateArrowLineColor}, applied to the
 * arrowhead `<polygon>`'s OWN fill AND stroke (both, jar-verified
 * `nanozi-96-foda024` -- see `theme.ts#stateArrowHeadColor`'s own doc
 * comment). Mission G6 T4: when NO explicit HeadColor cascade is set, jar's
 * own default for the arrowhead is the transition's OWN `LineColor`
 * (`stateArrowLineColor`), not `fallback` directly -- jar-verified against
 * `decede-10-buvu414` (a lone `stateDiagram { LineColor green }`, no nested
 * `arrow { HeadColor ... } }`, tints the arrowhead polygon green too) and a
 * targeted probe (`stateDiagram { arrow { LineColor blue } } }` alone ->
 * polygon `fill="#0000FF" stroke="#0000FF"`). `fallback` is reached only
 * when NEITHER HeadColor nor LineColor cascade is set.
 */
export function resolveStateArrowHeadColor(theme: Pick<Theme, 'colors'>, fallback: Paint): Paint {
  const override = theme.colors.graph.stateArrowHeadColor;
  if (override !== undefined) return resolveColorToSvgHex(override);
  const lineOverride = theme.colors.graph.stateArrowLineColor;
  if (lineOverride !== undefined) return resolveColorToSvgHex(lineOverride);
  return fallback;
}

/**
 * `<style> stateDiagram { RoundCorner N } }` -- mission G6 T4 residual
 * closure. jar's `URectangle` halving convention: `rx`/`ry` = RoundCorner/2
 * (verified directly against the jar oracle: `RoundCorner 2` -> `rx="1"`,
 * `RoundCorner 10` -> `rx="5"`, no override -> `rx="12.5"` i.e. jar's own
 * default `RoundCorner 25` -- mirrors `theme.ts#classCascadeRoundCorner`'s
 * identical halving formula for the class engine). Applies uniformly to
 * EVERY state-diagram box shape (leaf box, composite/cluster outline, AND
 * the composite header's own half-rounded arc) since jar's bare
 * `stateDiagram { RoundCorner }` selector reaches all of them (mission G6
 * T4 diagnosis, `decede-10-buvu414`). `fallback` is the pre-existing
 * hardcoded `STATE_BOX_RX` (12.5) -- every call site passes it unchanged,
 * so the DEFAULT (no `<style>` RoundCorner) render stays byte-identical.
 */
export function resolveStateBoxRadius(theme: Pick<Theme, 'colors'>, fallback: number): number {
  const raw = stateRoundCornerOf(theme);
  return raw !== undefined ? raw / 2 : fallback;
}

/** stdd T5a: the state style's `RoundCorner` (`style-cascade-state.ts`), else the bare `stateDiagram` read. */
export function stateRoundCornerOf(theme: Pick<Theme, 'colors'>): number | undefined {
  return theme.colors.graph.stateRoundCorner ?? theme.colors.graph.stateCascadeRoundCorner;
}

/**
 * `<style> activityBar { .fork { BackGroundColor ... } } }` -- mission G4
 * S16. Returns `undefined` (not a fallback) when unset, so callers can
 * distinguish "no cascade override" from "resolved to a color" and fall
 * through to their OWN hardcoded default (`renderer-pseudostate.ts
 * #renderForkJoin`'s `SYNCHRO_BAR_COLOR`) -- mirrors `theme.ts
 * #activityBarForkColor`'s own doc comment for the full derivation.
 */
export function resolveActivityBarForkColor(theme: Pick<Theme, 'colors'>): string | undefined {
  const override = theme.colors.graph.activityBarForkColor;
  return override !== undefined ? resolveColorToSvgHex(override) : undefined;
}

/** Same mechanism as {@link resolveActivityBarForkColor}, the `.join`
 *  selector's own BackGroundColor. */
export function resolveActivityBarJoinColor(theme: Pick<Theme, 'colors'>): string | undefined {
  const override = theme.colors.graph.activityBarJoinColor;
  return override !== undefined ? resolveColorToSvgHex(override) : undefined;
}

/**
 * `fontSize - fontSize/4.5` — the SAME content-independent ascent-from-
 * line-top formula the class engine uses (`class-layout-helpers.ts`'s
 * `fontSpec.size - measurer.getDescent(fontSpec, '')`), reproduced
 * arithmetically here since the renderer has no `StringMeasurer` of its own
 * — every measurer in this codebase returns a content-independent descent
 * (`core/measurer.ts`'s own `getDescent` implementations all ignore their
 * `text` parameter), so this is exact, not an approximation.
 */
export function textAscent(fontSize: number): number {
  return fontSize - fontSize / 4.5;
}

/** `fontSize/4.5` — see {@link textAscent}'s own doc comment. */
export function textDescent(fontSize: number): number {
  return fontSize / 4.5;
}
