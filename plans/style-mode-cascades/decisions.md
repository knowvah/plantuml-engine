# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope: 93 open rows, 8 mechanism families
The issue names four dss follow-ons (1-4) and dated counts. Re-measured on `47346297c`: 13 dss rows in
`oracle/goldens/diagram-style-scope.json` (dark 8, malformed 2, skin cascades 3), two corpus rows, and 78 open rows
of 131 authored with `measurements/gen-rows.mjs`. The authored grid covers each family in every engine that draws it:
`mode-*` and `malformed-*` in activity, class, component, object, sequence, state and usecase; `casc-<property>-<order>`
for FontSize, LineThickness, RoundCorner and Shadowing under `skin rose`, `!theme cerulean` and a skinparam after
`<style>`, plus a control row per order, in activity, class, component, sequence and state. **Moved in:**
`activity/gigefo-15-cami497` (its one diff is the reverse-colour root background, M2) and `activity/finadu-74-duvi890`
(its 50 are the `!theme` cascade, M6, which #119's comment on #120 hands here). Both are listed on #121; T0 comments
there. **Left out:** `component__probe-cond-root` (#122 names it, item 18), #138's partition `LineThickness`, and dss
follow-ons 5-22. **Rejected:** surveying the corpus alone. Only three corpus sources use dark mode and all three are
conformant; 29 of 31 monochrome or reverse-colour sources are conformant. The families are visible only in authored
rows (CLAUDE.md: "the corpus is the work queue and not a ceiling").
**Evidence:** `/tmp/p120/grid-b.txt` at planning, reproduced by T0.

### D2 — Dark mode: builder colours through `DARK_MODE`, precomputed into the theme
Upstream switches the whole `UGraphic` to `ColorMapper.DARK_MODE` (`TitledDiagram.java:292-294`). That mapper swaps a
colour for its `@media` partner and leaves a colour with no partner unchanged (`ColorMapper.java:68-72`,
`HColorSimple#darkSchemeTheme`). Partners come only from style values parsed in an `@media` block. `plantuml.skin`
has one, and our parser reads it (`StyleParser.ts:188,241`, `ValueImpl.ts:138`). A skinparam converts to a regular
value, and so does a plain `<style>` value, so neither has a partner. That is why `sequence__scope-dark-skinparam-white`
stays white in the jar. **Decision:** when `SkinParam.isDark` holds (`SkinParam.java:114-116`), `buildTheme` resolves
every element colour from the builder at its signature (dss D4's table) and maps it with `DARK_MODE`, for every source
and not only under the dss D3 gate. A value with no partner keeps its own colour. `theme-dark.ts`'s five literals become
builder reads where a signature exists, and its stale header is corrected. **Rejected:** carrying `HColor` objects to
the output. `Theme` is in the public d.ts, and about 40 reader files take only `theme` (dss D2's measurement).
**Rejected:** widening the literal table per engine. It copies `plantuml.skin` values without the cascade, so a user
`@media` block or an explicit value cannot reach it, and every literal would lack a citation the merge gives for free.

### D3 — Malformed `<style>`: a command error at the `<style>` line
`CommandStyleMultilinesCSS.java:84-98` catches `StyleParsingException` and returns
`CommandExecutionResult.error("Error in style definition: " + message)`. The factory stops at that line and the jar
draws its error page. The stock jar does this for both dss rows and all seven authored rows (exit 200, 2026-11-05).
Our preprocessor hoists `<style>` blocks out of the body, so no engine sees the command. unwind2-S8 solved the same
problem for `skin` with `skinCutOf` (`skin-command.ts`), and `DiagramRegistry#resolve` stops each engine at the cut.
**Decision:** a style cut on the same seam, in source order with the skin cut; the earlier failing line wins. This
supersedes dss D6 and D6a. Keep the existing `StyleParsingException` catches until each is proven unreachable, then
delete the unreachable ones with a journal line. Upstream still catches in `JsonDiagramFactory.java:102` and
`FilesDiagram.java:68`, so those paths keep theirs. **Rejected:** leaving the row drawing as an accepted divergence,
which needs a signed ruling per row, while mirroring needs none (CLAUDE.md: mirror the jar). **Rejected:** throwing
from `buildTheme`, which some engines never call.

### D4 — A dark-only `@media` value with no dark mode: mirror the crash
`ValueImpl.java:100-101` throws `IllegalArgumentException(value.toString())` when `value1` is null, reached from
`TitledDiagram.calculateBackColor` (`:280-289`). The stock jar crashes on `sequence__scope-media-dark-only` (exit 200,
2026-11-05). Ours already throws at `ValueImpl.ts:134`, so T1c finds what catches it and lets it reach our crash page
(`src/index.ts`, `UgDiagram.ts` header). **Rejected:** keeping the catch, which draws where the jar errors.

### D5 — The dss ratchet applies the error-page rule
`docs/svg-conformance.md` "Error pages": stock errors and ours draws an error page means conformant. The dss harness
compares bytes only, so `sequence__scope-single-line-slash` sits pinned at 7 although both sides error. **Decision:**
the pin records `stockError: true` for a row the stock jar errors on, verified with `measurements/stock-check.mjs`.
The ratchet counts such a row as 0 diffs when our render fires the error-page observer
(`setErrorPageObserver`, `src/core/error/error-renderer.ts`), the hook the survey uses
(`scripts/lib/survey-error-verdict.ts`). A row the stock jar draws is compared exactly. **Rejected:** pinning the
non-zero count, which keeps the rows red under a ruling that calls them conformant.

### D6 — Monochrome and reverse colour: one mapper over the whole output, background included
`TitledDiagram#muteColorMapper` (`:292-313`) maps every colour the diagram draws, the root background too
(`SvgGraphics.java:181-182`). It checks dark mode first, so dark wins over monochrome. Board, chart, gantt and salt
already pass `calculateBackColor` through `toSvgPaint(…, muteColorMapper(diagram))`. Class and activity map their
fragment with `fragment-color-mapper.ts`. **Decision:** activity and sequence add the root background to the mapping
they have, and state gets the fragment mapper class and activity use. **Rejected:** threading a mapper through every
colour read, which misses literal colours (`fragment-color-mapper.ts` header, `class-badge.ts#badgeFill`).

### D7 — Cascades: read the merged style at the element's upstream signature
For each property, the sizer and the renderer read one merged `Style` at the signature upstream's element builds
(dss D1, ubt D3). The style comes from the builder that `skin`, `!theme` and a late skinparam all feed. Upstream folds a
skinparam into the builder (`SkinParam#setParam`, `SkinParam.java:227-234`), so a skinparam after `<style>` wins by
storage order. **Rejected:** per-property helpers. Each would repeat the star-priority merge and still miss padding,
shadow and corner (ubt D3).

### D8 — Pins
The authored rows join `tests/fixtures/diagram-style-scope/` and its shrink-only pin, under their generated names.
The dss ratchet requires a pin row per fixture. T0 pins every row at its measured count, so a later rise fails.
`gigefo-15` and `finadu-74` are pinned in the activity golden ratchet the way ubt T1a and T1b pinned their own-bucket
rows. **Rejected:** a new pin file. The dss pin already holds the dss rows of this family, and one file keeps the
row-to-family map in one place.

### D9 — Serial, main checkout, one commit per task
Batches 2 and 4 share `build-theme.ts` and the style readers. Worktrees need symlinked assets and skip git hooks.
**Rejected:** parallel worktrees (`.claude/memory/agents-write-main-via-serena.md`).

### D10 — What ends a row
In order: conformant; a named divergence with a forcing library or a signed ruling; a `needs-ruling` issue naming the
row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.**
`oracle/accepted-divergences.json` is never edited here.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The surveys, the dss pin and the ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated at T5. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Output only. T0 adds 131 dss rows; the dss ratchet renders each once (about 30 s more locally, measured at T0 and journaled). |
| Likely failures | A survey under load writes `timeout`: rerun it alone. D2 moves every source with `mode dark`, and D3 moves every source whose `<style>` fails to parse: `verdict-diff` names each row. The D3 cut changes which lines an engine parses, so read every moved row. |
| Compatibility | No public API change: `dist/*.d.ts` identical, checked at T5 (stop 4). SVG changes on purpose; `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
