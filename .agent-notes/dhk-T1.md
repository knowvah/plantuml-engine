## Observation: oracle/accepted-divergences.json does not survive a JSON round trip
- **Context**: Appending the two #186 ledger entries with a Python script (dhk/T1).
- **Finding**: The file mixes `\uXXXX` escapes (for example `「〴an_」`) and raw UTF-8 (`Δ1`).
  `json.dumps(indent=2)` with `ensure_ascii` set either way rewrites other entries. `ratchet.json` and the routing and
  refusal baselines do round-trip byte for byte.
- **Impact**: Add ledger entries by splicing text before the `entries` closing bracket, then assert that the parsed
  result equals the intended entries. Never re-dump the whole file.
- **Confidence**: High

## Observation: a ratchet.json pin count change turns the parity-report drift gate red at once
- **Context**: dhk/T1 added 2 rows to `oracle/goldens/svg-dot/ratchet.json`.
- **Finding**: `tests/unit/scripts/parity-dashboard.test.ts` ("D9 drift gate") failed until `npm run parity:dashboard`
  regenerated `docs/parity-report.md` (the svg-dot pinned column and its date). That holds for any task that changes a
  ratchet's pin count, not only at batch close.
- **Impact**: Run `npm run parity:dashboard` in the same commit as any ratchet pin change, or that commit is red.
- **Confidence**: High
