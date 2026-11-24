## Observation: legacy CONCURRENT_ACTIVITY is unreachable; `--` in a braced activity is a jar syntax error
- **Context**: authoring `elk-inner-concurrent` for the ELK cluster half (lae T3b, #158).
- **Finding**: `ActivityDiagram#concurrentActivity` (`ActivityDiagram.java:157`) has no caller anywhere under `src/main/java/net/`, so no command opens a `CONCURRENT_ACTIVITY` group; the jar answers `--` inside `{ }` with "Syntax Error? (Assumed diagram type: activity)" at that line, and so do we.
- **Impact**: the `CONCURRENT_ACTIVITY` arm of any legacy group walk cannot be reached from source; do not author fixtures for it.
- **Confidence**: High

## Observation: under ELK a muted empty partition becomes an ELK node twice
- **Context**: porting `printAllSubgroups` for `elk-partition-empty`.
- **Finding**: `muteToType(EMPTY_PACKAGE)` nulls the group type, so `CucaDiagram#leafs()` lists the partition; `getTextBlock` then prints it again through `getUnpackagedEntities()` (`CucaDiagramFileMakerElk.java:488-489`). `nodes.put` keeps the second ELK node; the first stays in the graph unmapped and takes layout space. Our adapter reads `leafs()` live to mirror it, and the row is 0 diffs.
- **Impact**: caching `leafs()` at adapter construction would silently change the geometry of every diagram with an empty partition.
- **Confidence**: High

## Observation: the full survey times out rows when another vitest run shares the machine
- **Context**: batch 2 close survey while a scratch-copy vitest ran.
- **Finding**: 12 salt rows went `conformant -> timeout`; re-running `npm run svg:survey -- salt --out ...parity-salt.json` alone gave 51/51.
- **Impact**: run the survey alone; re-run a timed-out bucket before calling it a loss.
- **Confidence**: High
