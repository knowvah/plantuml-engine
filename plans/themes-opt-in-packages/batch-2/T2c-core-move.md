# T2c — core keeps 35 themes; Apache text in `dist/licenses/` (D2, D4, D7)

## Context

After T2b every surface registers both packages, so removing the moved themes from core changes no harness output.
What changes is a user's `renderSync` with no packages registered: `!theme amiga` becomes `Cannot load theme amiga`
(D2).

## Task

1. **Flip the generators to core-only:**
   - `src/core/themes-source.ts` holds the 35 core themes.
   - `src/core/themes-builtin{,-a-m,-p-v}.ts` hold the core residue only. Keep the file split, or let the generator
     merge the two halves if the 500-line cap allows.
   - Make core-only the generator default, and update the header comments: they say "44 themes" and "all".
2. **Apache-2.0 text (D7):**
   - Write `src/core/licenses/Apache-2.0-future-architect-puml-themes.txt` with
     `gh api repos/future-architect/puml-themes/contents/LICENSE --jq .content | base64 -d`.
   - Add a `closeBundle` copy in `vite.config.ts` that writes `dist/licenses/`.
   - Point to it from the `themes-source.ts` header, through the generator's `HEADER`.
3. **Tests:**
   - Update `themes-source.test.ts` (core count 35) and `tests/unit/factories/Help.test.ts:78-79`: 35 with no packages,
     44 with `themedIncludeStore()`.
   - New `tests/unit/core/theme-packages-unregistered.test.ts`. For each of the 9 moved names, `renderSync` with no
     store gives the `Cannot load theme <name>` error page, and with `themedIncludeStore()` gives the themed page.
     Assert the error text from the SVG.
   - Assert `dist/licenses/Apache-2.0-future-architect-puml-themes.txt` exists after `npm run build`. Put this in the
     batch-close journal, not a vitest test: tests run before the build.
4. **Grep check:** `grep -lE 'sunlust|crt-amber|mimeograph|carbon-gray' dist/*.js` prints nothing after `npm run build`.
   Journal the output.

## Write-set

`src/core/themes-source.ts`, `src/core/themes-builtin{,-a-m,-p-v}.ts` (all generated), `scripts/build-theme-sources.ts`,
`scripts/compile-themes.py`, `src/core/licenses/Apache-2.0-future-architect-puml-themes.txt` (new), `vite.config.ts`,
`tests/unit/core/themes-source.test.ts`, `tests/unit/factories/Help.test.ts`,
`tests/unit/core/theme-packages-unregistered.test.ts` (new).

## Read-set

`vite.config.ts`, `src/core/tim/EaterTheme.ts`, `tests/unit/factories/Help.test.ts:60-90`, `tests/helpers/error-diagram.ts`.

## Acceptance (Given/When/Then)

- Given `renderSync('@startuml\n!theme sunlust\na -> b\n@enduml')`, then the page is the error page with
  `Cannot load theme sunlust`.
- Given the same source with `includeStore: themedIncludeStore()`, then the SVG equals the `before.sha256` render for an
  equivalent fixture. The exit task's hash diff covers all 58.
- Given `npm run build`, then `dist/licenses/` holds the Apache text, and no moved theme name appears in `dist/*.js`.
- Given the full suite, then it passes with no expected SVG changed.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(themes): ship only mit, apache and _none_ themes in core` (`Refs: #180`).
