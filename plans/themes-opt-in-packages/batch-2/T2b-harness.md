# T2b — register both packages on every surface that renders a moved theme

## Context

- 56 `.puml` files under `tests/corpus` and `tests/fixtures` use a moved theme. At planning: corpus `sequence` 8,
  `class` 6, `component` 2, `activity` 1; `tests/fixtures/unwind2-S5` 25; one each in `activity-legacy`,
  `activity/add4-T3f`, `board`, `chart`, `diagram-style-scope`, `extensions`, `files`, `json`, `packet`, `unwind-U1`,
  `unwind2-S2` and `wire`; `factories` 2.
- `cov-help-theme` and `cov-help-two` list theme names.
- 13 test files hold an inline moved-theme source or a `theme: '<moved>'` option: `tests/unit/{preprocessor,theme}.test.ts`,
  `tests/unit/core/theme-routing/{collected-stream,declaration-order}.test.ts`, `tests/unit/core/tim/EaterTheme.test.ts`,
  `tests/unit/activity/activity-style-defaults.test.ts`, `tests/unit/state/stdd-t3b-line-thickness.test.ts`,
  `tests/unit/json/{json-family-style-input,renderer}.test.ts`,
  `tests/unit/sequence/{participant-background,renderer}.test.ts`, `tests/integration/{index,sequence}.test.ts`.
- `fixtureIncludeStore()` (`tests/helpers/fixture-include-store.ts:73-76`) is the seam most conformance surfaces share.
  Several `tests/oracle/svg-conformance/render-fixture-*.ts` surfaces pass no store at all.

## Task

1. **`tests/helpers/theme-packages-store.ts` (new):** `themePackagesStore()` returns
   `themeStore(unlicensedThemes, gplThemes)`, imported from `packages/themes-*/index.js` by relative path.
   `themedIncludeStore(base = EMPTY_INCLUDE_STORE)` returns `withThemes(base, themePackagesStore())`.
2. **`fixtureIncludeStore`:** wrap it with `withThemes`, keeping the lazy stdlib walk lazy. Update its header comment.
3. **Surfaces with no store.** Give them `themedIncludeStore()` (D-harness). It is themes-only, so stdlib resolution on
   those surfaces does not change. Never switch such a surface to `fixtureIncludeStore()` in this mission: that would
   change which `<bundle/…>` includes resolve and move rows for an unrelated reason.
4. **Inline tests.** Pass `includeStore: themedIncludeStore()`, or wrap the store they already pass.
5. **Find the missed sites.** Do this before committing:
   - Run `npx jiti scripts/build-theme-sources.ts` in core-only mode and `python3 scripts/compile-themes.py` in
     core-only mode, uncommitted.
   - Run `npm test -- --maxWorkers=4`. Fix every failure that a missing registration causes.
   - Restore core with `git checkout src/core/themes-source.ts src/core/themes-builtin*.ts`.
   - Journal the failing files you found and fixed.
   - A failure with any other cause is a finding: journal it and halt (stop condition 1).
6. **Scripts.** Scripts that render fixtures through `fixtureIncludeStore()` inherit the registration: `svg-parity-survey.ts`,
   `svg-conformance-census.ts`, `render-manifest.ts` and the rest in `grep -l fixtureIncludeStore scripts/*.ts`. For the
   other `scripts/*.ts` that call `renderSync` on fixtures, `grep -L fixtureIncludeStore`, journal the ones that can
   reach a moved theme and register them the same way.

## Write-set

`tests/helpers/theme-packages-store.ts` (new), `tests/helpers/fixture-include-store.ts`,
`tests/helpers/fixture-include-store.test.ts`, the surfaces and scripts step 5 and step 6 find, and the 13 inline-source
test files.

## Read-set

`tests/helpers/fixture-include-store.ts`, `tests/oracle/svg-conformance/render-fixture*.ts`, the 13 files above,
`grep -rlE '!theme\s+(amiga|blueprint|crt-amber|crt-green|mimeograph|plain|mono|carbon-gray|sunlust)\b' tests`.

## Acceptance (Given/When/Then)

- Given T2b's commit, when `npm test -- --maxWorkers=4` runs on the committed tree (core still holds 44), then it passes
  with no expected SVG changed.
- Given the uncommitted core-only regeneration of step 5, when the full suite runs, then it passes. Journal the count.
- Given `fixtureIncludeStore().packagedThemeNames?.()`, then it returns the 9 moved names, and the stdlib walk has not
  run yet. Extend `fixture-include-store.test.ts`'s deferral test.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `test(themes): register the theme packages on every render surface` (`Refs: #180`).
