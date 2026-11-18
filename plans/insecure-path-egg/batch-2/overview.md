# Batch 2 — the path egg

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | Port `PSystemPathFactory`, `PSystemPath` and `GraphicsPath`; register under INSECURE (D1-D3) | typescript-pro | `src/diagrams/eggs/{GraphicsPath,PSystemPath,PSystemPathFactory}.ts`, `src/registered-plugins.ts`, `tests/unit/eggs/{GraphicsPath,PSystemPath,PSystemPathFactory}.test.ts`, `tests/unit/utility-registration.test.ts` | T1a, T1b | [x] |

- [T2a-path-egg.md](T2a-path-egg.md)

Close: follow `task-contract.md#batch-close`. Also run `npm run catalog` (drift-gated, because there are new exports) and
the factories ratchet: `npm test -- tests/oracle/svg-conformance/factories`.
