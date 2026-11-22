# Batch 1: the six commands

Serial: every task writes `src/diagrams/version/PSystemVersionFactory.ts`.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-testdot-keydistributor.md) | `DOT_ENGINE_VERSION`; `testdot` and `keydistributor` pages | orchestrator | `core/version.ts`, `PSystemVersion.ts`, factory, tests | T0 | [x] |
| [T1b](T1b-keygen-keyimport.md) | `PSystemKeygen`; `keygen`, `keyimport [key]` | orchestrator | `PSystemKeygen.ts`, factory, tests | T1a | [x] |
| [T1c](T1c-keycheck.md) | `PSystemKeycheck`; both `keycheck` forms | orchestrator | `PSystemKeycheck.ts`, factory, tests | T1b | [x] |
| [T1d](T1d-d8-comments.md) | D8 comments say what is true; catalog | orchestrator | `LicenseInfo.ts`, `SignatureUtils.ts`, `docs/catalog.md` | T1c | [x] |

Close with the batch close in [task-contract.md](../task-contract.md). Expected survey result: no verdict moves in
any engine, because no corpus row uses these commands.
