# T7b — internal and current-state docs, D2 notes

**Context.** Docs that describe the repo as it is now. Dated records stay (D2); they get one pointer note each.

**Task.**
1. `docs/stdlib-remote.md`, `docs/svg-conformance.md`.
2. `docs/architecture/{architecture,components,data-flow,inventory,overview,tech-health}.md`. `overview.md:160-161`
   says plantuml-plugins clones `sseely/plantuml-ts` and the repo "now lives at `knowvah/plantuml-ts`" → update the
   second half to `knowvah/plantuml-engine`. Every PlantUML block you touch must still render: run it through
   `renderSync` (or the repo's docs diagram check if one exists) and journal the check.
3. `oracle/README.md`.
4. `planning/roadmap.md`, `planning/conformance.md`, `planning/adr/ADR-001-text-measurement.md`,
   `planning/adr/ADR-002-mit-with-epl-dependency.md` (dist filenames).
5. D2 notes:
   - `docs/graphviz-issues/TRACKER.md`: one dated blockquote under the title — "**Rename, 2026-11-12.** The library
     is now `plantuml-engine` (`@knowvah/plantuml-engine`, issue #173). Rows below name it `plantuml-ts` and are left
     as written."
   - `planning/mission-index.md:18-26`: append to the existing 2026-08-01 note — "**2026-11-12:** the library
     itself became `@knowvah/plantuml-engine` (issue #173); read `plantuml-ts` in older rows the same way."

**Write-set.** The files above, `PENDING`. The two D2 files get the note only.

**Acceptance criteria.**
- Given `git diff -- docs/graphviz-issues/TRACKER.md planning/mission-index.md`, then each diff is the added note
  only; no dated row changed.
- Given `docs/architecture/overview.md`, then its PlantUML block still renders without an error page.
- Given `git grep -nI plantuml-ts -- docs/stdlib-remote.md docs/svg-conformance.md docs/architecture oracle/README.md
  planning/roadmap.md planning/conformance.md planning/adr`, then it is empty.

Observability: N/A — no new observable operations. Rollback: Reversible.
