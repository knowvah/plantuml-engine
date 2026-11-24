# Batch 1: gate

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1 | Move the 17 probes into an authored gate, every row pinned at today's numbers | orchestrator or `typescript-pro` | `tests/fixtures/package-title-wrap/`, `tests/oracle/svg-conformance/package-title-wrap.authored.test.ts` | T0 | [x] |

Spec: [T1-gate.md](T1-gate.md). Close with the task contract's "Batch close" (no `src/` change, so the survey is
expected to be identical to the base; still run it).
