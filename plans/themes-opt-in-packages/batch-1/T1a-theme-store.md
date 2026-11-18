# T1a — `ThemeStore`, `withThemes` and the lookup order (D1, D2)

## Context

`loadBundledOrLocalTheme` reads core `THEME_SOURCES`, then the local store key (`src/core/tim/EaterTheme.ts:132-138`),
mirroring `ThemeUtils.java:128-147`. This task adds the registered-package step between them, plus the public API that
fills it.

## Task

1. **`src/core/tim/ThemeStore.ts` (new):** the types, `themeStore(...packages)` and `withThemes(base, themes)`, exactly
   as D1 states. `@see` `ThemeUtils.java:128-139` and `StdlibStore.ts#withStdlib`. Cite D1 in the module JSDoc as the ADR.
   `ThemeOverride` is a type-only import from `../theme.js`.
2. **`src/core/tim/IncludeStore.ts`:** add the optional `getPackagedTheme?(name: string): PackagedTheme | undefined` and
   `packagedThemeNames?(): readonly string[]` to `IncludeStore`, with doc comments in the style of `getPumlResource?`
   (`:46-60`).
3. **Forwarding (D1):**
   - `withStdlib` (`StdlibStore.ts:89-95`) forwards `base.getPackagedTheme` and `base.packagedThemeNames`.
   - `withThemes` forwards `base.getPumlResource`.
   - The prefetch wrapper (`include-resolver.ts:482-494`) forwards both new methods. The file is at 495 lines; see the
     task contract.
4. **`EaterTheme.ts`:**
   - `loadBundledOrLocalTheme`: core, then `store.getPackagedTheme?.(name)?.source` with the bundled description
     `</themes/puml-theme-<name>.puml>`, then the local file (D2).
   - `themeStoreKey(args, store?)`: returns `undefined` for a registered name as well as a core one. Update its one
     caller, `themeTargetOf` (`include-resolver.ts:205-210`), to pass the walk's base store.
5. **`src/index.ts`:** export `themeStore`, `withThemes` and the four types beside the `withStdlib` export (`:49-50`).

## Write-set

`src/core/tim/ThemeStore.ts` (new), `src/core/tim/IncludeStore.ts`, `src/core/tim/StdlibStore.ts`,
`src/core/tim/EaterTheme.ts`, `src/core/include-resolver.ts`, `src/index.ts`, `tests/unit/core/tim/ThemeStore.test.ts`
(new), `tests/unit/core/tim/EaterTheme.test.ts`.

## Read-set

`src/core/tim/EaterTheme.ts`, `src/core/tim/StdlibStore.ts:80-125`, `src/core/tim/IncludeStore.ts:25-80`,
`src/core/include-resolver.ts:195-215, 400-495`, `src/core/asset-store.ts`, `src/core/tim/ThemeExecutor.ts`,
`tests/unit/core/tim/EaterTheme.test.ts`.

## Acceptance (Given/When/Then)

- Given `themeStore({ name: 'p', license: 'MIT', themes: { zz: { source: '---\nname: zz\n---\nskinparam backgroundColor #123456\n' } } })`
  wrapped by `withThemes(EMPTY_INCLUDE_STORE, …)`, when `renderSync('@startuml\n!theme zz\na -> b\n@enduml', { includeStore })`
  runs, then the SVG background is `#123456`. Without the wrapper, the page is the `Cannot load theme zz` error page.
- Given a package that also defines `amiga` with different text, when `!theme amiga` renders, then core's `amiga` wins
  (D2 order). Given two packages that both define `zz`, then the first package's wins.
- Given `withStdlib(withThemes(base, t), s)` and `withThemes(withStdlib(base, s), t)`, then both resolve a
  `<bundle/file>` include and the packaged theme `zz`.
- Given `prepareIncludeStore(source, { includeStore: withThemes(…) })`, then the returned store still answers
  `getPackagedTheme('zz')`, and the prefetch did not request `puml-theme-zz.puml`.
- Given `themeStore(…).getTheme('constructor')`, then the result is `undefined`.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(theme): register theme packages through the include store` (`Refs: #180`).
