/**
 * The merged state style's `Shadowing` (smc T4c), name `FontSize` and arrow `HeadColor` (scr T1b).
 *
 * `EntityImageStateCommon.java:124` (`getStyleState().getShadowing()`, then `rect.setDeltaShadow`), `EntityImageState
 * .java:145` and `Cluster.java:315` read it off the merged `{root, element, stateDiagram, state}` style
 * (`EntityImageStateCommon.java:62-63`), which the builder folds every `skinparam` and `<style>` into by counter
 * (`SkinParam.java:227-234`, `ValueImpl.java:51-55`). The state engine reads `theme.shadowing`, the root tier alone, so
 * a `<style> state { Shadowing N }` never reached the boxes, whatever came before it.
 *
 * The merged value replaces `theme.shadowing`, the one field every state box and cluster site already reads; no member
 * is added to `Theme`.
 */
import type { PreprocessorResult } from './preprocessor.js';
import type { Theme } from './theme.js';
import type { Paint } from './paint.js';
import { currentStyleBuilderOf, isDark } from './document-back-color.js';
import { paintOf } from './activity-circle-style.js';
import { HColorSet } from './klimt/color/HColorSet.js';
import { HColorSimple } from './klimt/color/HColorSimple.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';
import { ValueNull } from './style/ValueNull.js';

/** `EntityImageStateCommon.STYLE`. @see EntityImageStateCommon.java:62-63 */
const STATE_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'stateDiagram', 'state');

/**
 * `EntityImageStateCommon.getStyleStateName`: the `state` signature plus `name`.
 * @see EntityImageStateCommon.java:91-94
 */
const STATE_NAME_SIGNATURE = STATE_SIGNATURE.addSName('name');

const STATE_NAME_FONT_SIZE_KEY: unique symbol = Symbol('state.nameFontSize');

type ThemeWithStateNameFont = Theme & { readonly [STATE_NAME_FONT_SIZE_KEY]?: number };

/**
 * `theme` carrying the merged state-name style's `FontSize`, the size `EntityImageStateCommon.java:74-76` builds the
 * name font with (`getStyleStateName(...).getFontConfiguration(...)`). Carried under a symbol key, so the public `Theme`
 * type stays as it is. Unchanged when a `<style>` block does not parse.
 */
export function withStateNameFont(theme: Theme, pre: PreprocessorResult): Theme {
  try {
    const style = STATE_NAME_SIGNATURE.getMergedStyle(currentStyleBuilderOf(pre));
    if (style === undefined) return theme;
    return { ...theme, [STATE_NAME_FONT_SIZE_KEY]: style.getUFont().getSize() } as ThemeWithStateNameFont;
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
}

/** The state name's merged `FontSize`; `theme.fontSize` for a hand-built theme or an unparsable `<style>` block. */
export function stateNameFontSizeOf(theme: Pick<Theme, 'fontSize'>): number {
  return (theme as ThemeWithStateNameFont)[STATE_NAME_FONT_SIZE_KEY] ?? theme.fontSize;
}

/** `theme` with `shadowing` read off the merged state style, unchanged when a `<style>` block does not parse. */
export function withStateShadowing(theme: Theme, pre: PreprocessorResult): Theme {
  try {
    const shadowing = STATE_SIGNATURE.getMergedStyle(currentStyleBuilderOf(pre))?.getShadowing();
    return shadowing === undefined ? theme : { ...theme, shadowing };
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
}

/** `SvekEdge#getDefaultStyleDefinition` with no stereotype. @see SvekEdge.java:816-821 */
const STATE_ARROW_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'stateDiagram', 'arrow');

const STATE_ARROW_HEAD_KEY: unique symbol = Symbol('state.arrowHead');

/** The merged arrow style's `HeadColor`: a paint, `'transparent'`, or absent where the style declares none (`ValueNull`). */
export type StateArrowHead = { readonly paint: Paint } | 'transparent';

type ThemeWithStateArrowHead = Theme & { readonly [STATE_ARROW_HEAD_KEY]?: StateArrowHead };

/**
 * `theme` carrying `Rainbow.build(styleLine, set)`'s head colour (`Rainbow.java:84-95`) over the merged
 * `{root, element, stateDiagram, arrow}` style `SvekEdge#drawU` reads (`SvekEdge.java:874-876`), so `arrow`, `element`,
 * `stateDiagram` and `skinparam ArrowHeadColor` (`FromSkinparamToStyle.java:153`) all reach it. Carried under a symbol
 * key, so the public `Theme` type stays as it is (D7). Unchanged when no `HeadColor` is declared (the head takes the
 * line colour) or a `<style>` block does not parse.
 */
export function withStateArrowHead(theme: Theme, pre: PreprocessorResult): Theme {
  try {
    const style = STATE_ARROW_SIGNATURE.getMergedStyle(currentStyleBuilderOf(pre));
    const value = style?.value('HeadColor');
    if (style === undefined || value === undefined || value instanceof ValueNull) return theme;
    const color = value.asColor(HColorSet.instance());
    // `Rainbow.java:92-93`: no colour, or the transparent one, draws the head as a line (`SvekEdge.java:1113-1118`).
    const transparent = color === null || (color instanceof HColorSimple && color.isTransparent());
    const paint = transparent ? undefined : paintOf(style, 'HeadColor', isDark(pre));
    const head: StateArrowHead | undefined = transparent ? 'transparent' : paint === undefined ? undefined : { paint };
    return head === undefined ? theme : ({ ...theme, [STATE_ARROW_HEAD_KEY]: head } as ThemeWithStateArrowHead);
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
}

/** The merged arrow style's head colour, or `undefined` for a hand-built theme or a style with no `HeadColor`. */
export function stateArrowHeadOf(theme: Pick<Theme, 'colors'>): StateArrowHead | undefined {
  return (theme as ThemeWithStateArrowHead)[STATE_ARROW_HEAD_KEY];
}
