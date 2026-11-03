# Batch 3 — engine readers

Parallel: disjoint files, each in its own worktree. Each task's site list comes from
`measurements/reader-audit.md` and the rows left after B2. The orchestrator updates each spec's "Rows" line at the B2 close.
A signature missing from `style-element-scope.ts`: report it; the orchestrator adds it between merges. Merge order: T3b, T3a, T3c, T3d, then T3e, which starts only after T3c is merged (same files).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-description.md) | component, usecase: entities, clusters, notes | typescript-pro (sonnet, effort high), dss-T3a | `src/diagrams/description/*`, `tests/unit/description/*` | B2 close | [ ] |
| [T3b](T3b-class-object.md) | class, object: notes, frames, object's own signature | typescript-pro (sonnet, effort high), dss-T3b | `src/diagrams/class/*`, `src/core/style-cascade-class*.ts`, `tests/unit/class/*` | B2 close | [x] |
| [T3c](T3c-state.md) | state: composite notes (D7), audit sites 1–12 | typescript-pro (sonnet, effort high), dss-T3c | `src/diagrams/state/*`, `tests/unit/state/*` | B2 close | [ ] |
| [T3d](T3d-activity-fills.md) | activity: fills and fonts | typescript-pro (opus, effort high), dss-T3d | `src/diagrams/activity/*`, `src/core/activity-circle-style.ts`, `tests/unit/activity/*` | B2 close | [x] |
| [T3e](T3e-state-probes.md) | state: audit sites 13–19 | typescript-pro (sonnet, effort high), dss-T3e | `src/diagrams/state/*`, `tests/unit/state/*` | T3c merged | [ ] |
| [T3f](T3f-state-scoped-notes.md) | state: notes scoped to a composite, and document `Margin`, added under D8 | typescript-pro (opus, effort high), dss-T3f | `src/diagrams/state/*`, `tests/unit/state/*` | T3e merged | [ ] |
| [T3g](T3g-probe-defects.md) | class visibility icon, mindmap `document { Margin }`, from the probe pass (D8) | typescript-pro (sonnet, effort high), dss-T3g | see spec | T3b merged | [ ] |
| close | merge all; gates `b3`; chain combined with b4's, vs `b2-eng`; re-pin | orchestrator | per close-procedure | T3a–T3g | [x] |
