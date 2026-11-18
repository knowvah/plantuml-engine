# Batch 1 — seam #5 and verification

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-seam.md) | Commit seam #5 in the `/tmp` clone, build the jar, record patch and pin | orchestrator | `/tmp/plantuml-seam5`, `oracle/patches/0005-*`, `oracle/pin.json`, `oracle/README.md` | T0 | [x] |
| [T1b](T1b-verify.md) | Full `--verify` re-capture with the seam-5 jar; prove only PNG-bounder rows move | orchestrator | `plans/png-bounder-seam/measurements/{t1b-*.json,t1b-summary.md}` | T1a | [x] |

Serial: T1b needs T1a's jar. The batch writes no oracle bytes, so every gate stays green (D6).

## Close

Run the README gates. `verdict-diff` is not needed, because no port or oracle byte changed. Tick, journal, and commit
`chore(pbs): close batch 1`.
