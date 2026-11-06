/**
 * The merged state style's `Shadowing` (smc T4c).
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
import { currentStyleBuilderOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';

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
