# T7 — json-family pins, the hcl rename, the stock record

Commit: `chore(oracle): pin the new json-family rows and refresh the stock record`.

## Task

1. **Rename the two colliding authored fixtures.** `tests/fixtures/hcl/array-values.{puml,svg}` and
   `function-call.{puml,svg}` hold different source from the manifest rows of the same slug, and
   `json-family-structural.test.ts:51` forbids the collision. Rename to `array-values-authored` and
   `function-call-authored`, and move their keys in `oracle/goldens/json-family-structural.json` (lines 92 and 98) and the
   positional pin. Grep `tests/` and `scripts/` for both names. The corpus rows keep the manifest slug.
2. **Pin the new rows.** The trial names 14 structural (`hcl/*` and `yaml/YAML-*-N`). Read
   `plans/json-family-followons/tools/residue.mts`'s usage, then add each new hcl and yaml row to
   `oracle/goldens/json-family-positional.json` with its measured residue, and each clean row to `json-family-structural.json`,
   sorted as the file is. Add rows only: never lower or raise an old ceiling. Those paths are Smetana, so the
   delta is recorded and never chased (`CLAUDE.md`, ruling 2026-08-09). If a measured row is not clean, leave it out of
   structural and journal it.
3. **Refresh the stock record:** `node plans/oracle-gap-capture/measurements/run-stock-verify.mjs /tmp/ogc-draws.txt`.
   `git diff --stat oracle/goldens/stock-error-pages.json`: the trial grew 114 to 214, dropping none. A dropped key is stop
   condition 3. `/tmp/ogc-draws.txt` listed only the existing `unknown/jadavu-33-cono513` in the trial; a new row there is a
   jar disagreement to journal.
4. `npx vitest run tests/oracle/svg-conformance/json-family tests/oracle/svg-conformance/stock-error-pages.test.ts` and read
   the collected count. `stock-error-pages.test.ts:73-74` holds activity to its known rows, which D2 keeps true by sending
   error rows to `unknown`.
5. Regenerate `docs/parity-report.md` with `npm run parity:dashboard` so the D9 drift gate passes at batch close.

## Write-set
`tests/fixtures/hcl/*`, `oracle/goldens/json-family-{structural,positional}.json`, `oracle/goldens/stock-error-pages.json`,
`docs/parity-report.md`.

## Read-set
[D6](../decisions.md), `tests/oracle/svg-conformance/json-family-structural.ts:114-160`,
`tests/oracle/svg-conformance/json-family-positional.ts`, `docs/svg-conformance.md:100-135`.

## Interface contracts
Input: T5's installed cache. Output to T8: the stock record, which decides error-page verdicts.

## Acceptance
- Given the rename, when `json-family-structural.test.ts` runs, then collisions are `[]` and both authored rows stay pinned.
- Given the new rows, when `json-family-positional.test.ts` runs, then it is green and no old ceiling changed.
- Given the refreshed record, then all 114 old keys remain, and the count of new keys is journaled.

Observability: N/A — no new observable operations. Rollback: Reversible.
