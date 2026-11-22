# Batch 1: diagnose

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-diagnose.md) | State why the jar's embed-only arrow-label block is 10 tall and ours 27.111 | orchestrator | `.agent-notes/aae-T1.md`, `measurements/java/` | T0 | [x] |

No `src/` change in this batch. It closes when the diagnosis artifact exists and the journal names the origin
`file:line` of each residual (the block height, the 31.5 origin shift, the 1-px width). Close gates: `npm run lint`
and `npm run format:check` only if T1 added files outside `plans/` and `.agent-notes/`; otherwise none.

If T1 cannot produce the artifact, stop (README stop condition 7). Do not start batch 2 on a guess.
