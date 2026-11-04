# T6d — name every row left

Commit: `docs(stdd): name the rows left open`.

## Context
D9. Re-run the three commands in the overview. For each row still open, in `measurements/final-rows.md`: its first diff, its mechanism with `file:line`, and its end. Rows already fixed-adjacent may fall to a small fix here, which is welcome.

- A forcing library: an entry in `DIVERGENCES.md` with the library.
- No library: a `needs-ruling` issue naming the rows and options, `gh issue create --label parity --label needs-ruling`. `oracle/accepted-divergences.json` stays untouched.
- Genuinely large and separable: `queue:ready`, `parity`, with the measurement and a "Blocked by #136" line.

## Acceptance
- Given `measurements/final-rows.md`, when compared to the survey, then every non-conformant row appears with a mechanism and an end.
- Given a row that has only "hard" against it, then the task is not closed.

Observability: N/A — no new observable operations. Rollback: Reversible.
