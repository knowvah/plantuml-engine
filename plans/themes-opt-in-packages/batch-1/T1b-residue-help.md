# T1b — residue from a package, and `help themes` (D3, D4)

## Context

- `buildTheme` resolves the residual summary by name: `resolveTheme(themeName)` (`src/core/build-theme.ts:99-100`) reads
  `BUILTIN_THEMES` (`src/core/theme.ts:475-490`). Once a theme moves (T2c), its residue lives only in its package
  (D4).
- `help themes` lists `Object.keys(THEME_SOURCES).sort()` (`src/diagrams/help/CommandHelpTheme.ts:24-26`). Upstream lists
  the jar's theme resources (`ThemeUtils.java:204-217`). D3 adds registered names.

## Task

1. **Residue (D4).** In `build-theme.ts`, or a new `src/core/packaged-theme-residue.ts` if the file would pass about
   450 lines, resolve the base theme like this:
   - a `string` `options.theme` keeps today's path;
   - otherwise, when `BUILTIN_THEMES` has no entry for the name and
     `options?.includeStore?.getPackagedTheme?.(name)?.residue` exists, use
     `deepMergeTheme(defaultTheme, residue)`, the same merge `resolveTheme` applies (`theme.ts:482-483`);
   - never edit `theme.ts` (501 lines).
2. **`ParseOptions` (D3).** Add `packagedThemeNames?: readonly string[] | undefined` (`dispatcher-types.ts:42-55`),
   documented with a `@see` to `ThemeUtils.java:204-217`. `parseOptionsOf` (`render-options.ts:153-160`) fills it from
   `options?.includeStore?.packagedThemeNames?.()`.
3. **Help.**
   - `parseHelp` (`HelpFactory.ts:66-80`) hands the names to `Help`.
   - `getAllThemeNames(packaged: readonly string[] = [])` returns core plus packaged, de-duplicated, sorted.
   - `CommandHelpTheme#executeArg` reads the names from the diagram.
   - Keep the comment's point that the IOException arm (java:79-84) is unreachable.

## Write-set

`src/core/build-theme.ts` (or a new helper module), `src/core/dispatcher-types.ts`, `src/core/render-options.ts`,
`src/diagrams/help/{CommandHelpTheme,HelpFactory,Help}.ts`, `tests/unit/factories/Help.test.ts`,
`tests/unit/core/packaged-theme-residue.test.ts` (new).

## Read-set

`src/core/build-theme.ts:85-130`, `src/core/theme.ts:460-495`, `src/core/themes-builtin-a-m.ts:14-36` (amiga's residue
shape), `src/diagrams/help/*.ts`, `src/core/render-options.ts:140-160`, `tests/unit/factories/Help.test.ts:70-85`.

## Acceptance (Given/When/Then)

- Given a registered synthetic theme `zz` with `residue: { colors: { graph: { json: { background: '#0B58A8' } } } }`,
  when a `@startjson` source with `!theme zz` renders, then the json box fill is `#0B58A8`. Without the residue it is
  the default.
- Given no registered packages, when `@startuml\nhelp themes\n@enduml` renders, then the list is exactly today's 44
  names. Core is unchanged in this batch.
- Given a registered `zz`, when `help themes` renders, then `zz` is listed in sorted position, once.
- Given `parseOptionsOf({ includeStore: withThemes(EMPTY_INCLUDE_STORE, themeStore(pkg)) })`, then
  `.packagedThemeNames` equals `['zz']`. Given `parseOptionsOf(undefined)`, it is `undefined`.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(theme): read residue and help names from registered packages` (`Refs: #180`).
