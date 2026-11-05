# T4a — Authored object, map and json probes against the jar

81 rows are a thin sample. Green rows have hidden defects before (`.claude/memory/probe-past-authored-rows.md`), and CLAUDE.md says the corpus is not a ceiling.

**Do:** author about 15 `.puml` covering what the corpus misses, crossing the batch's seams:

- `map` and `object` with `#color`, `##[dashed]blue` and `#line:red` on the declaration (`CommandCreateMap.java` `executeArg0`, `EntityImageMap.java` `lineConfig`).
- `RoundCorner` with a differing header, so `halfRounded` draws (`EntityImageObject.java` `rect2`).
- `hide stereotype`, `hide empty fields` and `hide fields` on `object`, map and json.
- `strictuml` underlined names (`EntityImageObject.java` `getUnderlinedName`).
- Port edges both ways on maps, `-left->`, `-up->`, and `left to right direction`.
- `map` keys with a visibility char (`TextBlockMap` constructor's `isVisibilityCharacter`).
- `MinimumWidth` on object and map; `HorizontalAlignment` on a map with a `Point` row.
- `url` on a map, and in a cell.

Render with `scripts/oracle-render.sh`, compare with `probe.mts`, and classify each diff. A probe may reach a mechanism the batches fixed or a new one. Fix it here with its Java quote, split past about 15 minutes, or end it per D8. Do not pin a fixture as a corpus row: these are test fixtures with oracles under `tests/fixtures/odd-T4a/`, driven by one test.

## Acceptance
- Given each probe, when compared, then 0 diffs, or the journal names the row, the mechanism and how it ended (D8).
- Given the probe test, when `npm test` runs, then it collects every probe and passes.

Observability N/A. Rollback Reversible.
