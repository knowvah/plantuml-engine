# T4a — Authored C4 and DomainStory probes against the jar

Eleven corpus rows are a thin sample of a large stdlib. Green rows have hidden defects before: `.claude/memory/probe-past-authored-rows.md`. The issue's done-when is the corpus, and CLAUDE.md says the corpus is not a ceiling.

**Do:** author about 12 `.puml` from `assets/stdlib/C4/_examples_/` shapes and the DomainStory README, covering what the corpus misses: `C4_Context`, `C4_Container`, `C4_Deployment`, `C4_Dynamic`, `C4_Sequence`; `SHOW_LEGEND()` with custom tags; `LAYOUT_LEFT_RIGHT`, `UpdateElementStyle`, `AddBoundaryTag`; one C4 theme other than `C4_united`; DomainStory with shapes and notes. Render with `scripts/oracle-render.sh`, compare with `compareSvg`, and classify each diff.

A probe may reach a mechanism T1a to T3b fixed or a new one. Fix it here with its Java quote, split into a further task if it grows past about 15 minutes, or end it per D7. Do not pin a fixture as a corpus row: these are test fixtures with oracles under `tests/fixtures/c4dd-T4a/`, driven by one test.

## Acceptance
- Given each probe, when compared, then 0 diffs, or the journal names the row, the mechanism and how it ended (D7).
- Given the probe test, when `npm test` runs, then it collects every probe and passes.

Observability N/A. Rollback Reversible.
