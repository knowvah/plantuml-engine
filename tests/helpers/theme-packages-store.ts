/**
 * The two theme packages #180 moved out of core, registered for the test
 * harness. Every surface that renders a fixture or an inline source using a
 * moved theme (amiga, blueprint, carbon-gray, crt-amber, crt-green,
 * mimeograph, mono, plain, sunlust) registers them through here, so with both
 * packages registered every render is byte-identical to the pre-#180 tree
 * (plans/themes-opt-in-packages/decisions.md D1, "Consequences").
 *
 * The packages are imported by relative path, as `tests/` imports `src/`.
 */
import { gplThemes } from '../../packages/themes-gpl/index.js';
import { unlicensedThemes } from '../../packages/themes-unlicensed/index.js';
import { EMPTY_INCLUDE_STORE, type IncludeStore } from '../../src/core/tim/IncludeStore.js';
import { themeStore, withThemes, type ThemeStore } from '../../src/core/tim/ThemeStore.js';

let cachedThemeStore: ThemeStore | undefined;

/** `themeStore(unlicensedThemes, gplThemes)`, built once per process. */
export function themePackagesStore(): ThemeStore {
  cachedThemeStore ??= themeStore(unlicensedThemes, gplThemes);
  return cachedThemeStore;
}

/**
 * `base` with both theme packages registered. Defaults to the empty store: a
 * themes-only store for surfaces that pass no include store, so their stdlib
 * resolution does not change (T2b, D-harness).
 */
export function themedIncludeStore(base: IncludeStore = EMPTY_INCLUDE_STORE): IncludeStore {
  return withThemes(base, themePackagesStore());
}
