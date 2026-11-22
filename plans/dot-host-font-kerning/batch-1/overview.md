# Batch 1: pin, sign, record

T1 and T2 run serially, because T2's DIVERGENCES.md entry quotes the scores T1 pins.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1 | Pin both rows as `accepted` ratchet rows, add their gate twins, sign them in the ledger | orchestrator or typescript-pro | `oracle/goldens/svg-dot/{ratchet.json,quoted-labels/,skinparam-font-color/}`, `tests/oracle/svg-conformance/dot.golden.ratchet.test.ts`, `oracle/accepted-divergences.json`, `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, `tests/oracle/svg-conformance/{routing-conformance,refusal-coverage}.test.ts` | T0 | [x] |
| T2 | DIVERGENCES.md entry, the svg-dot README, dashboards | orchestrator | `DIVERGENCES.md`, `oracle/goldens/svg-dot/README.md`, `docs/parity-report.md`, `tests/oracle/svg-conformance/PARITY-SVG.md` | T1 | [x] |

The ledger entries and the ratchet's `accepted` field are written in one task (T1). The ratchet asserts that each
`accepted` id is in force in the ledger, so splitting them would leave a red commit.

Close with the task contract's batch close.
