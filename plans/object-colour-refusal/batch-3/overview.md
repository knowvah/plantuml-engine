# Batch 3: multi-line refusal line

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | State and description report a multi-line `json` refusal on its closing line | orchestrator or `typescript-pro` | `description/parser.ts`, `state-json-commands.ts` (or a new module), `state/parser.ts` (minimal), tests, gate | T2 | [x] |
| T3b | A refused `json` body closes where the JSON completes (fix under push-forward, or file) | orchestrator | `class/parser.ts` or `class-json-commands.ts`, the state equivalent, gate | T3 | [x] |

Specs: [T3-refusal-line.md](T3-refusal-line.md), [T3b-nested-close.md](T3b-nested-close.md). T3 and T3b run
serially: both touch the refused-body path. Close with the task contract's "Batch close".
