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
import { builderAtPosition, lastDeclarationPosition } from './activity-box-builder-at.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import type { PName } from './style/PName.js';
import type { Style } from './style/Style.js';
import type { StyleBuilder } from './style/StyleBuilder.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';
import { Stereotype } from './stereo/Stereotype.js';
import { ClockwiseTopRightBottomLeft } from './klimt/geom/ClockwiseTopRightBottomLeft.js';

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

/**
 * `plantuml.skin:360`'s `activity { Padding 10 }`, the one value the flat readers hold for `FtileBox`'s
 * `style.getPadding()` (`FtileBox.java:170`; `activity-box-theme.ts#boxPadding`). They have no padding tier, so a merged
 * style whose padding differs (a theme's `root { Padding 6 }` declared after the skin: `ValueImpl.java:51-55`, later
 * counter wins) must reach the box as its style.
 */
const SKIN_BOX_PADDING = ClockwiseTopRightBottomLeft.same(10);

/** Whether `style`'s padding is other than {@link SKIN_BOX_PADDING}. */
function paddingOtherThanSkin(style: Style): boolean {
  const padding = style.getPadding();
  const skin = SKIN_BOX_PADDING;
  return (
    padding.getTop() !== skin.getTop() ||
    padding.getRight() !== skin.getRight() ||
    padding.getBottom() !== skin.getBottom() ||
    padding.getLeft() !== skin.getLeft()
  );
}

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
  if (stereotype === undefined) {
    const plainMerged = ACTIVITY_BOX_SIGNATURE.getMergedStyle(builder);
    return plainMerged !== undefined && paddingOtherThanSkin(plainMerged) ? plainMerged : undefined;
  }
  const merged = ACTIVITY_BOX_SIGNATURE.withTOBECHANGED(stereotype).getMergedStyle(builder);
  if (merged === undefined) return undefined;
  const plain = ACTIVITY_BOX_SIGNATURE.getMergedStyle(builder);
  return plain !== undefined && readsAlike(plain, merged) && !paddingOtherThanSkin(merged) ? undefined : merged;
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

/** The box style of the command at `position`: {@link ActivityBoxStyleResolver} plus where the `:label;` stood. */
export type ActivityBoxStyleAtResolver = (labels: readonly string[], position: number | undefined) => Style | undefined;

const BOX_STYLE_AT_KEY: unique symbol = Symbol('activity.boxStyleAt');

type ThemeWithBoxStyleAt = Theme & { readonly [BOX_STYLE_AT_KEY]?: ActivityBoxStyleAtResolver };

/**
 * `FtileBox.create`'s style for a box built from `builder`, kept only where it reads other than the flat tiers (which
 * hold the final builder's plain `activity` style). `undefined` for none.
 */
function boxStyleFrom(builder: StyleBuilder, flat: Style | undefined, labels: readonly string[]): Style | undefined {
  const merged = ACTIVITY_BOX_SIGNATURE.withTOBECHANGED(stereotypeOf(labels)).getMergedStyle(builder);
  if (merged === undefined) return undefined;
  return flat !== undefined && readsAlike(flat, merged) && !paddingOtherThanSkin(merged) ? undefined : merged;
}

/** `theme` with `graph.activity.boxStyleOf` set from `pre` (unchanged when a `<style>` block does not parse, as
 *  `activity-circle-style.ts#resolveActivityCircleStyle`). */
export function withActivityBoxStyle(theme: Theme, pre: PreprocessorResult): Theme {
  // Built on the first stereotyped box: a diagram with none pays nothing.
  let builder: StyleBuilder | null | undefined;
  const finalBuilder = (): StyleBuilder | null => (builder === undefined ? (builder = builderOf(pre)) : builder);
  const boxStyleOf: ActivityBoxStyleResolver = (labels) => {
    const final = finalBuilder();
    return final === null ? undefined : resolveActivityBoxStyle(final, labels);
  };
  // `ActivityDiagram3#addActivity` (`ActivityDiagram3.java:114-117`): the box keeps the builder current at its
  // command. A declaration after it does not reach the box (`FtileBox.java:144-150`).
  const lastDeclaration = lastDeclarationPosition(pre);
  const boxStyleAt: ActivityBoxStyleAtResolver = (labels, position) => {
    const final = finalBuilder();
    if (final === null) return undefined;
    if (position === undefined || lastDeclaration === undefined || lastDeclaration < position)
      return resolveActivityBoxStyle(final, labels);
    const at = builderAtPosition(pre, position);
    return at === null ? undefined : boxStyleFrom(at, ACTIVITY_BOX_SIGNATURE.getMergedStyle(final), labels);
  };
  const graph = theme.colors.graph;
  const withResolver: Theme = {
    ...theme,
    colors: { ...theme.colors, graph: { ...graph, activity: { ...graph.activity, boxStyleOf } } },
  };
  return { ...withResolver, [BOX_STYLE_AT_KEY]: boxStyleAt } as ThemeWithBoxStyleAt;
}

/** The position-aware resolver of {@link withActivityBoxStyle}, absent on a hand-built theme. */
export function activityBoxStyleAtOf(theme: Theme): ActivityBoxStyleAtResolver | undefined {
  return (theme as ThemeWithBoxStyleAt)[BOX_STYLE_AT_KEY];
}
