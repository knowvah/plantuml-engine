# T1 — the coverage function

Commit: `test(oracle): add the oracle coverage function and reasons file`.

## Context
Repo `plantuml-ts`, a TypeScript port of PlantUML. #109 requires a test that fails on a manifest
fixture with neither a jar oracle nor a recorded reason. See [D3](../decisions.md). The real-tree
assertion cannot go green until T5, so this task ships the pure function and its unit test only.

## Task (TDD: write the unit test first)

`scripts/lib/oracle-coverage.ts`:

```ts
export interface ManifestRow { readonly bucket: string; readonly slug: string }
export interface OracleCoverage {
  readonly missing: readonly ManifestRow[];   // neither an oracle nor a reason, manifest order
  readonly staleReasons: readonly string[];   // key has no row, or its row has an oracle
  readonly oracled: number;
  readonly reasoned: number;
}
/** Pure. Reason keys are `<manifest bucket>/<slug>`; an oracle wins by slug in any bucket. */
export function oracleCoverage(
  rows: readonly ManifestRow[],
  oracleSlugs: ReadonlySet<string>,
  reasons: Readonly<Record<string, string>>,
): OracleCoverage;
export function loadManifestRows(dataDir: string): ManifestRow[];   // tests/visual/data/*.json, sorted by file
export function cachedOracleSlugs(cacheDir: string): Set<string>;   // dirs with .done, in.puml AND in.svg
export function loadNoOracleReasons(path: string): Record<string, string>;   // the `reasons` object
```

`oracle/no-oracle-reasons.json`: `{ "$comment": "...", "reasons": {} }`. The comment states the key
format, that a reason names what the jar did, and that `tests/oracle/svg-conformance/oracle-coverage.test.ts`
gates it. Use `assertJsonObjectShape` (`scripts/lib/assert-json-shape.ts`) on load.

## Write-set
`scripts/lib/oracle-coverage.ts`, `tests/unit/scripts/oracle-coverage.test.ts`,
`oracle/no-oracle-reasons.json`, `docs/catalog.md` if the drift gate asks.

## Read-set
[D3](../decisions.md), `scripts/svg-parity-survey.ts:232-246` (the same three-file oracle rule),
`scripts/lib/assert-json-shape.ts`.

## Interface contracts
Output, consumed by T2 and T5: the signatures above.

## Acceptance
- Given a row whose slug is in another bucket's oracle set, when `oracleCoverage` runs, then it counts
  in `oracled` and not in `missing`.
- Given a row with no oracle and no reason, then `missing` equals `[{bucket, slug}]` and `oracled` is 0.
- Given a reason for a row with no oracle, then `reasoned` is 1 and `missing` is empty.
- Given a reason whose key has no row, or whose row has an oracle, then `staleReasons` names the key.
- Given a temp cache dir lacking `.done`, then `cachedOracleSlugs` omits that slug.

Observability: N/A — no new observable operations. Rollback: Reversible.
