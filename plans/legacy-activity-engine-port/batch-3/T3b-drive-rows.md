# T3b — drive the 124 rows

Start from `row-diffs.mts` over all 124 rows, grouped by first diff. Expected families from the census and planning
probes: arrow labels and fonts (arrow font 11, `FontParam.java:158-160`), branch diamonds and `[true]`/`[false]`
labels, partitions (clusters, colours, stereotypes), notes (Opale, sides, on link), skinparam and `<style>` reads
(`activity*`, `activityDiagram { ... }`), creole and URLs in activities, `{{ }}` embeds (the oracle seam), arrow
direction words (`-left->` and friends as DOT constraints), chrome.

Each family is one sub-task and one commit: read the Java for the first diff, fix, re-run `row-diffs.mts`, journal
the rows that reached 0 and the mechanism left on the rest. A row ends only by D8.

**Writes:** whatever the family's Java lives in: `src/diagrams/activity-legacy/**`, the T2a images, shared core seams
when the Java is shared (journal each core change and survey the engines that use it).

## Acceptance
- Given the final `row-diffs.mts`, then every row is at 0 or has a D8 end recorded in the journal with `file:line`.
- Given each sub-task's survey, then `board-moves.mjs` loses nothing in `activity`, `unknown` or `network`.

Observability: N/A — no new observable operations. Rollback: Reversible.
