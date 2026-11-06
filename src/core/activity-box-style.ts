/**
 * A stereotyped activity box's ONE merged style (mission ubt, T1b, D3).
 *
 * `FtileBox.create` (`activitydiagram3/ftile/vertical/FtileBox.java:138-146`) builds
 * `getStyleSignature().withTOBECHANGED(stereotype).getMergedStyle(styleBuilder)` and the constructor reads every
 * property the box uses off it: colours, font configuration, padding, round corner, shadowing, wrap width, minimum width
 * (`:164-176`), and `drawU` its stroke (`:208`). `Stereogroup#buildStereotype` builds the stereotype from the WHOLE group
 * (`stereo/Stereogroup.java:~90-98`), so every label reaches `withTOBECHANGED`, which fans the signature out one label at a
 * time (`StyleSignatureBasic.java:119-132`).
 *
 * The resolver below is the style half of `FtileBox.create` for one box; `build-theme.ts` hangs it on
 * `graph.activity.boxStyleOf`, the way `activity-circle-style.ts` hangs the circles' style.
 */
import type { Theme } from './theme.js';
import type { PreprocessorResult } from './preprocessor.js';
import { currentStyleBuilderOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import type { PName } from './style/PName.js';
import type { Style } from './style/Style.js';
import type { StyleBuilder } from './style/StyleBuilder.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';
import { Stereotype } from './stereo/Stereotype.js';

/** `FtileBox.getStyleSignature`. @see FtileBox.java:97-99 */
const ACTIVITY_BOX_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity');

/** The `PName`s `FtileBox` reads off its style (`FtileBox.java:164-176,208`), and the ones `getStroke` and
 *  `getFontConfiguration` read through (`LineStyle`, `FontWeight`, `HyperLinkColor`). */
const READ_BY_FTILE_BOX: readonly PName[] = [
  'LineColor',
  'BackGroundColor',
  'LineThickness',
  'LineStyle',
  'FontColor',
  'FontName',
  'FontSize',
  'FontStyle',
  'FontWeight',
  'HyperLinkColor',
  'HorizontalAlignment',
  'Padding',
  'RoundCorner',
  'Shadowing',
  'MaximumWidth',
  'MinimumWidth',
];

/** The merged style of a box whose stereogroup holds `labels`, in `Stereogroup#getLabels` order. */
export type ActivityBoxStyleResolver = (labels: readonly string[]) => Style | undefined;

/** `Stereogroup#buildStereotype` over `labels`; `undefined` for none (`withTOBECHANGED`'s own "no change", :119-126). */
function stereotypeOf(labels: readonly string[]): Stereotype | undefined {
  return labels.length === 0 ? undefined : Stereotype.build(labels.map((label) => `<<${label}>>`).join(''));
}

/** Whether `a` and `b` hold the same value for every `PName` in {@link READ_BY_FTILE_BOX}. */
function readsAlike(a: Style, b: Style): boolean {
  return READ_BY_FTILE_BOX.every((name) => a.value(name).asString() === b.value(name).asString());
}

/**
 * `FtileBox.create`'s style for a box with `labels`. `undefined` where the stereotype changes nothing the box reads (a
 * `<<save>>` with no `.save` class: the flat readers already hold that box's values and stay its reader).
 */
export function resolveActivityBoxStyle(builder: StyleBuilder, labels: readonly string[]): Style | undefined {
  const stereotype = stereotypeOf(labels);
  if (stereotype === undefined) return undefined;
  const merged = ACTIVITY_BOX_SIGNATURE.withTOBECHANGED(stereotype).getMergedStyle(builder);
  if (merged === undefined) return undefined;
  const plain = ACTIVITY_BOX_SIGNATURE.getMergedStyle(builder);
  return plain !== undefined && readsAlike(plain, merged) ? undefined : merged;
}

/** The document's builder, `null` for a `<style>` block the parser rejects. */
function builderOf(pre: PreprocessorResult): StyleBuilder | null {
  try {
    return currentStyleBuilderOf(pre);
  } catch (e) {
    if (e instanceof StyleParsingException) return null;
    throw e;
  }
}

/** `theme` with `graph.activity.boxStyleOf` set from `pre` (unchanged when a `<style>` block does not parse, as
 *  `activity-circle-style.ts#resolveActivityCircleStyle`). */
export function withActivityBoxStyle(theme: Theme, pre: PreprocessorResult): Theme {
  // Built on the first stereotyped box: a diagram with none pays nothing.
  let builder: StyleBuilder | null | undefined;
  const boxStyleOf: ActivityBoxStyleResolver = (labels) => {
    if (builder === undefined) builder = builderOf(pre);
    return builder === null ? undefined : resolveActivityBoxStyle(builder, labels);
  };
  const graph = theme.colors.graph;
  return { ...theme, colors: { ...theme.colors, graph: { ...graph, activity: { ...graph.activity, boxStyleOf } } } };
}
