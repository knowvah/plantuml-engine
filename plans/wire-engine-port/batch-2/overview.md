# Batch 2 — diagram, commands, factory

Still unreachable from `renderSync`; unit tests only. Serial (D10).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-diagram.md) | `WireDiagram` | orchestrator or `typescript-pro` | `src/diagrams/wire/WireDiagram.ts`, tests | T1b, T1c | [x] |
| [T2b](T2b-commands-factory.md) | Seven commands, factory, dispatch copies | orchestrator or `typescript-pro` | `src/diagrams/wire/{Command*,WireDiagramFactory,wire-common-commands,wire-skin-param,wire-style-dispatch}.ts`, tests | T2a | [x] |

Close: the README's gates and `chore(wrp): close batch 2`.
