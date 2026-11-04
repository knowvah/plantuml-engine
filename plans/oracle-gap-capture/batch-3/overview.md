# Batch 3 — measure and record

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T8](T8-measure.md) | Survey, census and report for the 10 buckets | orchestrator | survey and census JSON, reports, notes | T5–T7 | [x] |
| [T9](T9-record.md) | Record counts on each owner, file the missing issues | orchestrator | GitHub issues, `.agent-notes/ogc-T9.md` | T8 | [x] |

The orchestrator runs T8 alone: no subagents, tests or builds alongside it. **Close:** the four gates, then
`chore(ogc-b3): close batch 3`.
