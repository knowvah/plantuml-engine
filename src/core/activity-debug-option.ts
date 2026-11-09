/**
 * `!option debug true` for an activity diagram: `FtileBox#drawU` draws a blue 2px `URectangle` of the tile's size
 * under every box (`FtileBox.java:201-206`), read off the preprocessing artifact's options
 * (`skinParam().options().getValue(OptionKey.DEBUG)`).
 *
 * The flag rides on the theme under a module-private symbol, not on the public `Theme` type (the `dist` declarations
 * stay unchanged), the way `activity-box-style.ts` carries its position-aware resolver; a `{ ...theme }` copy keeps it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBox.java:201-206
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/BoxStyle.java:141-145
 */
import type { Theme } from './theme.js';
import type { PreprocessorResult } from './preprocessor.js';
import { OptionKey } from './tim/EaterOption.js';

const ACTIVITY_DEBUG_KEY: unique symbol = Symbol('activity.debugOption');

type ThemeWithDebug = Theme & { readonly [ACTIVITY_DEBUG_KEY]?: boolean };

/** `Boolean.parseBoolean(options().getValue(OptionKey.DEBUG))` (`FtileBox.java:201`). */
export function withActivityDebugOption(theme: Theme, preprocessed: PreprocessorResult): Theme {
  const value = preprocessed.options?.get(OptionKey.DEBUG);
  return value?.toLowerCase() === 'true' ? ({ ...theme, [ACTIVITY_DEBUG_KEY]: true } as ThemeWithDebug) : theme;
}

/** True when `!option debug true` reached the theme. */
export function activityDebugOf(theme: Theme): boolean {
  return (theme as ThemeWithDebug)[ACTIVITY_DEBUG_KEY] === true;
}
