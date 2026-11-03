# pdg-T4 — re-measuring every bucket (2026-11-03)

## Observation: the old committed census files were not just stale, they were pre-ratchet
- **Context**: parity-dashboard-repair T4 regenerated all 28 `census-<type>.json`.
- **Finding**: the 2026-09-20 files read activity 0 zero-diff of 372 rows and sequence 0 of 1141; the fresh census reads 434/449 and 1143/1143, agreeing with the ratchets (`pins-vs-census.mjs`: 0 pinned rows nonzero). Their `type` field was `activity+tests/oracle/svg-conformance/census-activity.json` (the `--json` path kept as a type, fixed in T2).
- **Impact**: any analysis that read the census column before this mission read numbers from a different measurer and a different tree. Treat census dates as the authority, and `check-fresh.mjs` as the gate.
- **Confidence**: High (both files diffed).

## Observation: mindmap has 2 zero-diff rows not pinned
- **Context**: `pins-vs-census.mjs` after T4.
- **Finding**: svg-mindmap pins 137, census zero-diff 139. Same shape as object (35 pins / 64 zero-diff, issue #115).
- **Impact**: two mindmap rows could be pinned by a later mission; not done here (D5/D6: pins are not re-measured in this mission).
- **Confidence**: High.

## Observation: the survey drives load1 past 50 by itself and still reports no faults
- **Context**: `npm run svg:survey` started at load1 8 on an otherwise idle box; `uptime` at exit read 51.87.
- **Finding**: 0 `timeout`, 0 `errored` across 28 buckets (`verdict-diff.mjs`). The "run below load ~10" rule is about load *before* start, from other processes; the survey's own workers are the expected load.
- **Impact**: do not abort a survey because `uptime` climbs during it; judge by the verdicts.
- **Confidence**: Medium (one run).
