# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Hash diff, docs, divergence, memory, issue comments; final gates | orchestrator | `DIVERGENCES.md`, `README.md`, `NOTICE`, `CHANGELOG.md`, `docs-site/guide/styling-data-diagrams.md`, `docs/catalog.md`, `.claude/memory/*`, `plans/themes-opt-in-packages/{README,decision-journal}.md`, `measurements/after.sha256` | batch 2 | [x] |

## T3

1. **Hash diff.** Rerun `measurements/render-moved-themes.ts` into `measurements/after.sha256`. Then
   `diff measurements/before.sha256 measurements/after.sha256` must print nothing. Any difference is stop condition 1.
2. **`DIVERGENCES.md`.** Add an entry under "Preprocessor (TIM)", beside "Sprite and `img` rasters — CC BY-ND artwork
   passes through (licence-forced)" (`:577`): "`!theme` on a theme moved to an opt-in package — licence-forced". Cite:
   - #180 and the ruling of 2026-11-13;
   - the 9 names and their two packages;
   - `EaterTheme.java:82-85` and `ThemeUtils.java:128-147` (the error the port gives);
   - `ThemeUtils.java:204-217` (the shorter `help themes` list);
   - `withThemes` as the fix, and the unit tests that pin both arms.
   The precedent is the CC BY-ND `stdlib-aws` split (`:557-577`).
3. **`README.md`.** Add a section after "Provenance and Attribution" (`:39`), titled "Themes that need a package". It
   lists which themes need which package and why, quoting the licence facts, and gives a registration example with
   `themeStore` and `withThemes`. The example must parse and render: run it.
4. **`NOTICE`.** Replace the "PlantUML themes" block (`:90-104`) with core's set: 31 MIT, 3 Apache-2.0 with the path to
   the licence text, and `_none_`. Add both packages to "Optional packages" (`:106-114`), with their licences.
5. **`CHANGELOG.md`.** Under `[Unreleased]`, add "Changed — nine themes move to opt-in packages (BREAKING for `!theme`
   users)": what moved, why, and how to register. `Refs: #180`.
6. **`docs-site/guide/styling-data-diagrams.md`.** Its `!theme amiga` example (`:111`): add one sentence that `amiga`
   needs `@knowvah/plantuml-themes-unlicensed`. The embedded fixture SVG is unchanged.
7. **Consistency check.** Check that `README.md`, `NOTICE`, both packages' `LICENSE` and `LICENSES.md`, and
   `packages/all/LICENSES.md` name the same 9 themes, packages and licences (done-when 4). Journal the check.
8. **`npm run catalog`**, then all README gates, `npm run build:stdlib` and `npm run format:check`.
9. **Memory.** Add `.claude/memory/top-status.md` and its `MEMORY.md` line: theme packages register through the
   `IncludeStore` (`withThemes`), the harness registers both in `tests/helpers/theme-packages-store.ts`, and
   `scripts/theme-packages.json` classifies themes.
10. **Issue comments.**
    - On #180: the summary, with a link to `plans/themes-opt-in-packages/decisions.md`.
    - On #179: the license page's "Themes" credit line now covers core's 35 themes only, and the two packages carry
      their own credits.
    - If posting is denied, put the text in the journal and continue.
11. **README.** Fill "Summary" and tick "Done when".
12. **Commit** `docs(top): close the themes-opt-in-packages mission` (`Refs: #180`).

## Acceptance

- Given the final tree, then all gates exit 0, and `before.sha256` equals `after.sha256`.
- Given `DIVERGENCES.md`, then the new entry cites #180, the ruling date, and the two Java locations.
- Given `NOTICE`, then it no longer says "All 44 themes are included".

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
