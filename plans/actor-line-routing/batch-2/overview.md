# Batch 2: refuse the capture, route a bare create

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | The sequence participant refuses a non-bare colour capture with badColor and its score | orchestrator or `typescript-pro` | `command-participant.ts`, `sequence-parse-helpers.ts`, `parser.ts`, gate, unit test, `DIVERGENCES.md` | T1 | [x] |
| T3 | A bare `create` follows `CommandActivate` or `CommandParticipantA`, as upstream registers them | orchestrator or `typescript-pro` | `command-lifeline.ts`, `command-participant.ts`, `sequence-command-registry.ts`, gate, unit test | T2 | [x] |

T2 and T3 both write `command-participant.ts` and the gate, so they run **serially**: one commit each. Close the batch
once, after T3 (task contract "Batch close"). Specs: [T2-refuse.md](T2-refuse.md), [T3-create-route.md](T3-create-route.md).
