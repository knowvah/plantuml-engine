# Decisions — themes-opt-in-packages (top)

Source: issue #180, which carries the maintainer ruling of 2026-11-13. Planned unattended on 2026-11-18 at
`feature/parity-queue` `5aa2d33f5`.

> Ruling (#180): `src/core/themes-source.ts` embeds all 44 upstream themes, so the MIT `dist/` carries themes whose own
> headers state a non-MIT licence or none. Core keeps the 31 MIT themes, the three Apache-2.0 themes (with the licence
> text) and `_none_`. The eight themes with no stated licence go to one new package, `SEE LICENSE IN LICENSE`, not MIT.
> `sunlust` (GPL 3+) goes to a second package, kept out of `packages/all`. A moved theme without its package registered
> gives upstream's `Cannot load theme` error, named in `DIVERGENCES.md` as licence-forced.

The ruling settles the divergence and the package split. D1 to D7 are how to build it. D1 is the ADR the issue asks for
(the project keeps ADRs in mission `decisions.md` files, as `src/core/asset-store.ts` cites `plans/s1l-tail-fix`).

## D1 (ADR) — Theme packages register through the `IncludeStore`, as stdlib bundles do

- **Context:** a theme is read in `ThemeExecutor` → `EaterTheme#getTheme` → `loadTheme(store, …)`
  (`src/core/tim/ThemeExecutor.ts:60`, `src/core/tim/EaterTheme.ts:117-129`), with the `IncludeStore` that `TContext`
  receives as `options.includeStore` (`src/core/tim/TContext.ts:97`). Every preprocess entry, embedded `{{ }}`
  diagrams included, already forwards that store. Upstream reads bundled themes as jar resources
  (`ThemeUtils.java:128-139`, `Stdlib.class.getResourceAsStream`), the same resource channel as the stdlib, which the
  port reaches through `withStdlib` (`src/core/tim/StdlibStore.ts:89-95`).
- **Decision:**
  - New module `src/core/tim/ThemeStore.ts` exports:
    - `interface PackagedTheme { readonly source: string; readonly residue?: ThemeOverride }`;
    - `interface ThemePackage { readonly name: string; readonly license: string; readonly themes: Readonly<Record<string, PackagedTheme>> }`;
    - `interface ThemeStore { getTheme(name: string): PackagedTheme | undefined; themeNames(): readonly string[] }`;
    - `themeStore(...packages: readonly ThemePackage[]): ThemeStore`. Lookups use `Object.hasOwn`, so `constructor`
      misses. A name in two packages: the first package wins, as `combineAssetStores` does;
    - `withThemes(base: IncludeStore, themes: ThemeStore): IncludeStore`.
  - `IncludeStore` gains two optional methods, `getPackagedTheme?(name)` and `packagedThemeNames?()`.
  - `withThemes` forwards `base.getPumlResource`. `withStdlib` forwards `base.getPackagedTheme` and
    `base.packagedThemeNames`. The prefetch wrapper in `include-resolver.ts` (`:482-494`) forwards both, as it does
    `getPumlResource`. Composition then works in either order.
  - `src/index.ts` exports `themeStore`, `withThemes` and the types `ThemePackage`, `ThemeStore`, `PackagedTheme`,
    `ThemeOverride`.
- **Rejected:**
  - (B) A new `RenderOptions.themeStore`. Every preprocess entry (top level, `{{ }}` embeds, `buildTheme`'s re-entry at
    `build-theme.ts:230`) and every harness render site would need new plumbing. One missed site silently drops a
    theme.
  - (C) A module-level `registerThemes()`. It is shared mutable state across renders and tests, and it is not the
    `withStdlib` / `combineAssetStores` pattern the ruling names.
- **Consequences:**
  - The fixture harness registers both packages in one place, `tests/helpers/fixture-include-store.ts`. Surfaces with no
    store get a themes-only store (D-harness, in T2b).
  - Additive and non-breaking for `IncludeStore` implementers: both methods are optional.
  - Rollback: revert. Nothing is persisted.

## D2 — Lookup order: core, then registered packages, then a local file; a miss is `Cannot load theme`

- `loadBundledOrLocalTheme` (`EaterTheme.ts:132-138`) reads core `THEME_SOURCES` first, then
  `store.getPackagedTheme?.(name)`, then the local `puml-theme-<name>.puml` store key. Upstream has two steps: the
  bundled resource, then the local file (`ThemeUtils.java:128-147`). A registered package is this port's form of a
  bundled resource, so it sits with the first step. Its description stays the bundled one,
  `</themes/puml-theme-<name>.puml>` (`ThemeUtils.java:131-133`).
- A moved theme that is not registered and has no local file returns `undefined`. `EaterTheme#getTheme` then throws
  `Cannot load theme <name>`, exactly as the desktop jar does for an unknown name (`EaterTheme.java:82-85`). The TeaVM
  branch (`ThemeUtils.java:84-117`) is not mirrored. Its warn-and-render-unthemed arm covers a `themes.js` that cannot be
  fetched at all, and its own comment says "An unknown name in a loaded themes.js stays an error (null, below), like the
  desktop build". Core's themes are always present, so a missing package is the unknown-name case.
- `themeStoreKey` (`EaterTheme.ts:99-107`), used by the async prefetch, returns `undefined` for a registered name too, so
  `render()` does not try to fetch `puml-theme-sunlust.puml` when the package is registered.

## D3 — `help themes` lists core plus registered package themes

- Upstream lists the jar's `themes/puml-theme-*.puml` resources, sorted with `Collections.sort`
  (`ThemeUtils.java:204-217`). That is the set `loadBundledOrLocalTheme` resolves as bundled. Registered packages are
  this port's form of those resources (D2), so they are listed too: `getAllThemeNames(packaged)` returns
  `[...core, ...packaged]`, de-duplicated and sorted with the default JS sort, which matches `String#compareTo` for these
  ASCII names.
- `ParseOptions` gains `readonly packagedThemeNames?: readonly string[] | undefined`. `parseOptionsOf`
  (`render-options.ts:153-160`) fills it from `options?.includeStore?.packagedThemeNames?.()`. `parseHelp`
  (`HelpFactory.ts:66-80`) passes it to `Help`, and `CommandHelpTheme` reads it there.
- With both packages registered the list is upstream's 44 names, so `cov-help-theme` stays at weightedScore 0
  (`oracle/goldens/svg-factories/authored-baseline.json:616-622`). Without them it lists 35. That is part of D2's
  divergence entry.

## D4 — The residual summary moves with its theme

- `BUILTIN_THEMES` (`src/core/themes-builtin-{a-m,p-v}.ts`, generated by `scripts/compile-themes.py`) holds a residue
  per theme name: the json-family colours an executed `!theme` does not reach yet. `buildTheme` reads it through
  `resolveTheme(themeName)` (`build-theme.ts:99-100`, `theme.ts:475-490`). The issue does not name it, but it is derived
  from the moved theme files. Left in core, it would keep those themes' data in `dist/`.
- Moved themes' residue leaves core and ships in the package as `PackagedTheme.residue`. `buildTheme` uses
  `BUILTIN_THEMES[name]`, else the registered package's residue. `theme.ts` is at 501 lines, so the lookup goes in
  `build-theme.ts` or a new small module, never in `theme.ts`.
- `residue`'s doc comment says it is generated, in lockstep with core, and that its shape may change. The packages
  are generated by the same script and pin `peerDependencies` `^0.2.0`.
- **Finding, 2026-11-18 (T1b), not a contradiction:** the residue (`Theme.colors.graph.json`) has no renderer reader.
  The json family paints from its jar styles (`src/diagrams/json/layout.ts:68-73`, `:198-204`), and the only reads of
  `colors.graph.json` in `src/` are the merge in `theme-merge.ts:69-70`. A registered residue with every json field
  set to `#ABCDEF` left `@startjson`, `@startyaml` and an embedded `json` entity byte-identical. D4's decision stands
  (the data is derived from the moved files, so it leaves `dist/` with them, and `buildTheme` resolves it as stated),
  but T1b's render-level acceptance ("the json box fill is `#0B58A8`") cannot be observed in an SVG. T1b tests the
  resolved base `Theme` instead. Deleting the dead residue altogether is out of this mission's scope; noted in
  `.agent-notes/top-T1b.md`.

## D5 — One classification table drives both generators

- `scripts/theme-packages.json` maps each of the 44 theme names to `core`, `unlicensed` or `gpl`, exactly the ruling's
  table. `scripts/build-theme-sources.ts` and `scripts/compile-themes.py` both read it.
- The generator fails on an upstream theme the table does not classify. A new upstream theme then needs a person, not a
  default.
- A unit test checks that the table equals the ruling's sets, and that it agrees with each theme's `license:` header:
  `MIT` or `Apache License, Version 2.0` goes to core, an empty value to `unlicensed`, `GPL 3+` to `gpl`. `_none_` is
  the one exception, core by ruling. Headers checked at planning: 31 MIT, 3 Apache, 1 GPL, 9 empty, `_none_` included.

## D6 — Two packages, following `packages/stdlib-aws` and `packages/emoji`

| Dir | npm name | `license` | Themes | In `packages/all` |
|---|---|---|---|---|
| `packages/themes-unlicensed` | `@knowvah/plantuml-themes-unlicensed` | `SEE LICENSE IN LICENSE` | amiga, blueprint, crt-amber, crt-green, mimeograph, plain, mono, carbon-gray | yes |
| `packages/themes-gpl` | `@knowvah/plantuml-themes-gpl` | `GPL-3.0-or-later` | sunlust | **no** |

- Each package has `package.json`, `LICENSE`, `LICENSES.md`, `README.md`, `tsconfig.json`, a hand-written `index.js` and
  `index.d.ts`, and committed generator output under `generated/`. Each `index.js` exports one `ThemePackage`:
  `unlicensedThemes` or `gplThemes`.
- The unlicensed `LICENSE` says the authors stated no licence, that the package redistributes the files as PlantUML
  does, and that a theme moves back to core if its author grants MIT. Its README says that "unlicensed" does not mean
  "The Unlicense".
- The GPL `LICENSE` is the GPL-3.0 text. `LICENSES.md` credits Artem V. Ageev, from the theme header.
- `packages/all` depends on and re-exports `@knowvah/plantuml-themes-unlicensed`, and adds an `assetPackages` row for it.
  It never names the GPL package. Its existing "not uniformly MIT" warning gains a line for the unlicensed themes.

## D7 — The Apache-2.0 text ships in `dist/licenses/`

- The licence text is `src/core/licenses/Apache-2.0-future-architect-puml-themes.txt`, verbatim from
  `gh api repos/future-architect/puml-themes/contents/LICENSE`. That repo has no `NOTICE` file. At planning its root
  held `LICENSE`, `README.md`, `example` and `themes`, so Apache-2.0 §4(d) adds nothing.
- `vite.config.ts` copies `src/core/licenses/*` to `dist/licenses/` in a `closeBundle` hook, with no new dependency.
  `dist` is in `package.json` `files`, so the text ships.
- The theme headers' `author:` and `source:` lines, kept verbatim, carry the attribution, and `NOTICE` names it.

## Operational readiness

- **Observability:** N/A. A library with no runtime telemetry. The signal is the error page `Cannot load theme <name>`.
- **Rollback:** Reversible. Revert the squash commit. Nothing is published yet: `npm view @knowvah/plantuml-engine`
  returned 404 at planning, so no published contract changes.
- **Scale:** N/A. Lookups are map hits. `dist/` shrinks by the moved themes' text: 41,344 of upstream's 299,348 theme
  bytes, measured at planning.
- **On-call:** a user's `!theme amiga` now errors. The mitigation is to register `@knowvah/plantuml-themes-unlicensed`
  with `withThemes`. The README section and the `CHANGELOG.md` entry say so.
- **Backwards compatibility:** the `IncludeStore` and `ParseOptions` additions are optional. The behaviour change for
  moved themes is the ruling's and goes under "Changed" in `CHANGELOG.md`.

## Auto-confirmed (unattended)

| Decision | Taken | Rejected | Evidence |
|---|---|---|---|
| Work selection | #180 | #136: blocked by open #179 and others. #179: blocked by #158 (open, `needs-ruling`) | `gh issue view` at planning |
| D1 seam | IncludeStore composition | (B) RenderOptions field, (C) global registry | D1 Context |
| D2 unregistered branch | desktop `Cannot load theme` | TeaVM warn-and-ignore | `ThemeUtils.java:84-147`, `EaterTheme.java:82-85` |
| D3 help list | core plus registered | core only (would move `cov-help-theme` off 0) | `ThemeUtils.java:204-217` |
| D4 residue | moves with its theme | stays in core | `build-theme.ts:99-100`, `themes-builtin-p-v.ts:233` (`sunlust`) |
| D6 package names | `plantuml-themes-unlicensed`, `plantuml-themes-gpl` | `-extra`, `-community` (they hide the reason) | ruling table |
| D6 `all` membership | unlicensed in, GPL out | both out | the ruling excludes only GPL; `all` already carries CC BY-ND and CC BY |
| D7 licence location | `src/core/licenses/` copied to `dist/licenses/` | package-root `licenses/` | done-when: "`dist/` contains … Apache-2.0 (with its licence text)" |
| #179 coordination | comment on #179 at exit; #179 has not landed | edit the license page now | #179 open, blocked by #158 |
