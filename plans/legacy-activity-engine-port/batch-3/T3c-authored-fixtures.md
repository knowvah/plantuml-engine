# T3c — authored fixtures

D6 lists what to author beyond the 28 probes, plus `!pragma layout elk` and `!pragma layout smetana` on a legacy
source (read `net/atmp/CucaDiagram.java:478-479` for which file maker each picks; a Smetana path records its delta per
`CLAUDE.md` and is not chased).

1. Copy each probe and new source to `tests/fixtures/activity-legacy/<slug>.puml`; render each into its own `/tmp`
   directory with `scripts/oracle-render.sh`, then copy `<slug>.svg` beside it, and keep its `svek-N.dot` for T4.
2. Run `probe.mts` on each. Fix what is the engine's, in the task's commit or a new T3b sub-task; a jar error page
   where we also error is conformant (ruling 2026-10-10).
3. Journal the count at 0, the error-page pairs, and each remaining fixture with its D8 end.

**Writes:** `tests/fixtures/activity-legacy/**`, engine files for the defects found.

## Acceptance
- Given every fixture, then it is at 0 diffs, an error-page pair, or named by D8 in the journal.
- Given `lap-url` (a jar error page), then we draw an error page too.

Observability: N/A — no new observable operations. Rollback: Reversible.
