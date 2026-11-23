# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Re-measure, record the sites, file the separable finding, comment on #189 | orchestrator | `DIVERGENCES.md`, journal, issues | T2c | [x] |

## T3

1. **Measure.** The measurer over the probes and over `tests/fixtures/unresolved-colour` (write the counts to the
   journal); `npm run svg:survey`; `verdict-diff.mjs <base>` (0 lost); `npm run build`, then
   `diff -r /tmp/auc-base-dts dist` restricted to `*.d.ts` (must be empty, D6).
2. **`DIVERGENCES.md`.** In "We draw where the jar errors", extend the unknown-bare-colour paragraph with the activity
   sites (D5): arrow colours (`HtmlColorAndStyle.java:100`), `link #c` (`CommandLink3.java:84`), swimlanes
   (`CommandSwimlane.java:98`, `CommandSwimlane2.java:105`), notes (`Colors.java:103` via `CommandNote3.java:127` and
   `CommandNoteLong3.java:129`). One sentence, no new heading. `oracle/accepted-divergences.json` stays as it is.
3. **File the separable finding** as a `queue:ready` + `parity` issue: "Activity: `swimlane L1` draws an error page
   where the jar draws a lane". Include the three probes (`swimlane L1`, `swimlane L1 #red`, `swimlane L1 #zzblue`),
   the 21-diff measurement, and the upstream command (`CommandSwimlane2.java`, regex and `executeArg`). Before filing,
   `gh issue list --search "swimlane L1"` for a duplicate. Add the new issue's "Blocked by" line to #136, as every
   other parity issue there has one.
4. **Comment on #189** with: the answer taken (D1) and the rulings it rests on (#143, #152's carve-out,
   `DIVERGENCES.md`); the jar measurements (stock and v1.2026.8 error on all 17); that v1.2026.10 was not measured and
   why (D4); that `duluve-89-mati167`'s arrows now paint `#D3D3D3` while its ledger entry is untouched; the reversal
   cost if the maintainer prefers the error (D1, "Rejected"); and the filed issue.
5. Run the gates, `npm run parity:dashboard`, tick the README, journal, commit
   (`docs(auc): record the activity unknown-colour sites`, footer `Refs: #189`).

## Acceptance
- Given the final tree, when the measurer runs over the fixtures, then all 17 `NEUTRAL` rows show `neutral true`,
  `ours draws`, no `invalid`, and every `ZERO` row is at 0.
- Given base and final surveys, when `verdict-diff.mjs` runs, then 0 rows are lost in every engine.
- Given `git diff <base> -- oracle/accepted-divergences.json`, then it is empty.
- Given #189, then its last comment holds the five items above.

Observability: N/A. Rollback: Reversible.
