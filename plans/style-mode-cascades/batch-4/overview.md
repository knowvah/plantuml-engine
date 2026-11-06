# Batch 4 — cascades

Each property is read from the element's merged style, at its upstream signature, fed by `skin`, `!theme`, `<style>`
and late skinparams in storage order (D7). The four tasks are split by the scenario that breaks, not by property.
Each scenario has a control row, so a property row's own diffs are the ones above its control. M5, M6 and M8 may turn
out to share a mechanism: merge tasks if they do (push-forward).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4a](T4a-rose-shadow.md) | `skin rose`'s shadow survives a `<style>` block | orchestrator or `typescript-pro` | shadow readers in class, description, activity; tests | batch 3 | [x] |
| [T4b](T4b-skinparam-after-style.md) | A skinparam after `<style>` wins by storage order | orchestrator or `typescript-pro` | the skinparam-to-style seam (`FromSkinparamToStyle.ts`, the accumulator), readers; tests | T4a | [x] |
| [T4c](T4c-theme-with-style.md) | `!theme` with a `<style>` block keeps the theme's merged style | orchestrator or `typescript-pro` | the theme and style merge, activity, class and state readers; tests | T4b | [x] |
| [T4d](T4d-state-note-style.md) | State notes read `<style>` `FontSize`; state property residues | orchestrator or `typescript-pro` | state note sizer and renderer; tests | T4c | [x] |
| T4e (added, journal row 26) | State names read the merged `state` name style `FontSize` | `typescript-pro` | `state-style-facts.ts`, state name-font sites; tests | T4b | [x] |

Planning counts (`measurements/planning-rows.json`): each scenario's control, and the property rows above it.

| Engine | control plain / rose / theme | Rows above their control |
|---|---|---|
| activity | 0 / 9 / 72 | fontsize-after 64, thickness-after 24, shadow-after 2; thickness-, roundcorner-, shadow-theme 70-74 |
| class | 0 / 1 / 14 | fontsize-after 24, roundcorner-after 14; thickness-theme 20, shadow-theme 18 |
| component | 0 / 1 / 0 | fontsize-after 57, thickness-after 57 |
| sequence | 0 / 0 / 0 | none: every sequence `casc-*` row is conformant |
| state | 33 / 36 / 98 | fontsize-rose 46; fontsize-, thickness-, roundcorner-after 36-43; roundcorner-theme 60, shadow-theme 103 |

dss rows: `class__d3-skin-rose-element` 1 and `component__probe-skin-rose` 1 (T4a);
`component__probe-skinparam-after-style` 34 (T4b). Corpus: `activity/finadu-74-duvi890` 50 (T4c).

Close: the task contract's batch close, then pin `finadu-74` in the activity golden ratchet (D8).

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
