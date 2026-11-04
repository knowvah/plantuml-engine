# Batch 2 — measure

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4](T4-measure.md) | Re-run survey, census and DOT parity; regenerate both reports | orchestrator | survey, census and DOT JSON, reports | T1, T2, T3 | [x] |

The orchestrator runs this alone: no subagents, tests or builds alongside it. **Close:**
the four gates, then `chore(pdg-b2): close batch 2`.
