/**
 * The merged class style's `Shadowing` (smc T4c).
 *
 * `EntityImageClass.java:197` reads `shadow = getStyle().getShadowing()` off the merged
 * `{root, element, classDiagram, class_}` style (`EntityImageClass.java` `getStyleSignature`), which the builder folds
 * every `skinparam` and `<style>` into by counter (`SkinParam.java:227-234`, `ValueImpl.java:51-55`). The flat
 * `theme.shadowing` holds only the root tier, so a `<style> class { Shadowing N }` declared after a theme's
 * `skinparam shadowing false` never reached the class box.
 *
 * Carried under a symbol key rather than a `Theme` field, so the public `Theme` type stays as it is (the way
 * `note-style-facts.ts` carries the note's).
 */
import type { PreprocessorResult } from './preprocessor.js';
import type { Theme } from './theme.js';
import { currentStyleBuilderOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';

const CLASS_SHADOWING_KEY: unique symbol = Symbol('class.shadowing');

type ThemeWithClassShadowing = Theme & { readonly [CLASS_SHADOWING_KEY]?: number };

/** `EntityImageClass#getStyleSignature`: `{root, element, classDiagram, class_}`. */
const CLASS_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'classDiagram', 'class_');

/** `theme` carrying the class style's `Shadowing`, unchanged when a `<style>` block does not parse. */
export function withClassShadowing(theme: Theme, pre: PreprocessorResult): Theme {
  try {
    const shadowing = CLASS_SIGNATURE.getMergedStyle(currentStyleBuilderOf(pre))?.getShadowing();
    return shadowing === undefined
      ? theme
      : ({ ...theme, [CLASS_SHADOWING_KEY]: shadowing } as ThemeWithClassShadowing);
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
}

/** The class style's `Shadowing` on `theme`; `undefined` for a hand-built theme or an unparsable `<style>` block. */
export function classShadowingOf(theme: Theme): number | undefined {
  return (theme as ThemeWithClassShadowing)[CLASS_SHADOWING_KEY];
}
