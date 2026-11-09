/**
 * The flat theme as the style builder at a document line reads it (aar-T6b).
 *
 * `InstructionIf` keeps `skinParam.getCurrentStyleBuilder()` from its creation (`InstructionIf.java:104`), `InstructionWhile`
 * the one `ActivityDiagram3#while` hands it (`ActivityDiagram3.java:398`) and `InstructionRepeat` that of its opener
 * (`InstructionRepeat.java:105`). Each passes it to its `FtileFactoryDelegator*` (`FtileFactoryDelegatorIf.java:78-80`,
 * `FtileFactoryDelegatorWhile.java:78-79`, `FtileFactoryDelegatorRepeat.java:94-95`), which merges the arrow and diamond styles
 * from it, so a `<style>` or skinparam declared after the opener never reaches its diamonds. The flat readers all read
 * `theme.colors`, so the theme at a position is the final theme with `colors` rebuilt from the declarations before it.
 */
import type { Theme } from './theme.js';

/** `buildTheme` over the declarations located before a document line. */
export type ThemeAtResolver = (position: number) => Theme;

const THEME_AT_KEY: unique symbol = Symbol('activity.themeAt');
const BASE_KEY: unique symbol = Symbol('activity.themeAt.base');

type ThemeWithThemeAt = Theme & {
  readonly [THEME_AT_KEY]?: ThemeAtResolver;
  readonly [BASE_KEY]?: Theme;
};

/** `theme` carrying `resolver`, the way `activity-box-style.ts` carries `boxStyleAt`. */
export function withThemeAt(theme: Theme, resolver: ThemeAtResolver): Theme {
  return { ...theme, [THEME_AT_KEY]: resolver } as ThemeWithThemeAt;
}

/**
 * `theme` as the builder current at `position` reads it; `theme` itself for a hand-built theme, an unlocated command or
 * one no later declaration can reach. The result remembers `theme` ({@link documentThemeOf}): the tiles inside the
 * construct are built from their own positions.
 */
export function themeAtPosition(theme: Theme, position: number | undefined): Theme {
  const resolver = (theme as ThemeWithThemeAt)[THEME_AT_KEY];
  if (resolver === undefined || position === undefined) return theme;
  const base = documentThemeOf(theme);
  return { ...theme, colors: resolver(position).colors, [BASE_KEY]: base } as ThemeWithThemeAt;
}

/** The theme a {@link themeAtPosition} result was derived from, else `theme`. */
export function documentThemeOf(theme: Theme): Theme {
  return (theme as ThemeWithThemeAt)[BASE_KEY] ?? theme;
}
