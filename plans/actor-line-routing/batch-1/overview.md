# Batch 1: gate

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1 | Promote the 44 probes to fixtures and pin them in an authored gate at today's numbers | orchestrator or `typescript-pro` | `tests/fixtures/actor-line-routing/`, `tests/oracle/svg-conformance/actor-line-routing.authored.test.ts` | T0 | [x] |

Spec: [T1-gate.md](T1-gate.md). Close with the task contract's "Batch close". There is no `src/` change, so verdict-diff
must show no verdict moved.
