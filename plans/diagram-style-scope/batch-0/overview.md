# Batch 0 — baseline, rows, audit

Serial: T0a, then T0b and T0c. T0b writes only rows and gates; T0c writes only its report, so they
may run together in separate worktrees. The close seeds the pin at pre-fix values and takes T0c's
findings against D1–D6 (a contradiction is stop 3).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T0a](T0a-branch-and-tooling.md) | branch, brief commit, tooling, b0 gates + chain + d.ts + extended baseline | orchestrator | `$M/*`, `$T/*` copies, `.claude/settings.autonomous.json` | — | [x] |
| [T0b](T0b-rows-and-ratchet.md) | 256 rows + jar oracles, ratchet + pin seeded pre-fix, `diff-row.mts` | typescript-pro (sonnet, effort high), dss-T0b | `tests/fixtures/diagram-style-scope/*`, `tests/oracle/svg-conformance/diagram-style-scope{.ts,.ratchet.test.ts}`, `tests/unit/oracle/diagram-style-scope.test.ts`, `oracle/goldens/diagram-style-scope.json`, `$T/diff-row.mts` | T0a | [x] |
| [T0c](T0c-reader-audit.md) | signature table, bucket-skipping readers, state width, nested order, timing | typescript-pro (opus, effort high), dss-T0c | `$M/reader-audit.md` | T0a | [x] |
| T0d | T0c's probes as authored rows + pre-fix pins (user ruling 2026-11-02) | orchestrator | `$T/gen-probe-rows.py`, `tests/fixtures/diagram-style-scope/*`, `oracle/goldens/diagram-style-scope.json`, `tests/unit/oracle/diagram-style-scope.test.ts` | stop 3 ruling | [x] |
| close | merge T0b, T0c; gates `b0close`; `fixtures.md` b0 row; audit vs D1–D6 | orchestrator | per close-procedure | T0b, T0c | [x] (stop 3 raised; see decisions.md) |

## Interface (T0b → later batches)
```ts
// tests/oracle/svg-conformance/diagram-style-scope.ts
export const DIAGRAM_STYLE_SCOPE_ROOT: string;              // tests/fixtures/diagram-style-scope
export interface ScopeRow { readonly conformant: boolean; readonly diffCount: number }
export function listScopeRows(): string[];                  // '<engine>__<group>-<case>', sorted
export function measureScopeRow(row: string): ScopeRow;     // renderSync + withJarCompatibleStyleInput + compareSvg
// oracle/goldens/diagram-style-scope.json: { rows: Record<string, ScopeRow> }
```
Shrink-only: `diffCount` may only fall; `conformant: true` may never flip back.
