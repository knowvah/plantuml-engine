/**
 * The swimlane's `FontSize` and `LineThickness`, read off the document's ONE style builder: `Swimlanes#getStyle` merges
 * `{root, element, activityDiagram, swimlane}` (`Swimlanes.java:135-138`) and `getTitle` takes its font configuration
 * (`:287`); `LaneDivider#drawU` strokes the divider with the same signature's `getStroke()` (`LaneDivider.java:68-71,95`).
 * `plantuml.skin:309-314` declares `swimlane { FontSize 18, LineThickness 1.5 }`; a skin that replaces it (`skin debug`,
 * `debug.skin:175`, an empty `swimlane { }`) leaves both at that skin's `root { }` values.
 *
 * Carried on the theme under a symbol key rather than a `Theme` field, so the public `Theme` type stays as it is; a
 * spread of the theme keeps it (`activity-document-style.ts` does the same).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Swimlanes.java:135-138,287
 */
import type { PreprocessorResult } from './preprocessor.js';
import type { Theme } from './theme.js';
import { currentStyleBuilderOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';

/** `Swimlanes#getStyleSignature`. @see Swimlanes.java:128-133 */
const SWIMLANE = StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'swimlane');

/** What the merged swimlane style holds for the two properties. */
export interface ActivitySwimlaneStyle {
  readonly fontSize: number | undefined;
  readonly lineThickness: number | undefined;
}

const SWIMLANE_STYLE_KEY: unique symbol = Symbol('activity.swimlaneStyle');

type ThemeWithSwimlaneStyle = Theme & { readonly [SWIMLANE_STYLE_KEY]?: ActivitySwimlaneStyle };

const finiteOrUndefined = (n: number): number | undefined => (Number.isFinite(n) ? n : undefined);

/** `theme` carrying the merged swimlane style's facts, unchanged when a `<style>` block does not parse. */
export function withActivitySwimlaneStyle(theme: Theme, pre: PreprocessorResult): Theme {
  try {
    const style = SWIMLANE.getMergedStyle(currentStyleBuilderOf(pre));
    if (style === undefined) return theme;
    const facts: ActivitySwimlaneStyle = {
      fontSize: finiteOrUndefined(style.value('FontSize').asDouble()),
      lineThickness: finiteOrUndefined(style.getStroke().getThickness()),
    };
    return { ...theme, [SWIMLANE_STYLE_KEY]: facts } as ThemeWithSwimlaneStyle;
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
}

/** The merged swimlane style's facts, `undefined` for a hand-built theme or an unparsable `<style>` block. */
export function activitySwimlaneStyleOf(theme: Theme): ActivitySwimlaneStyle | undefined {
  return (theme as ThemeWithSwimlaneStyle)[SWIMLANE_STYLE_KEY];
}
