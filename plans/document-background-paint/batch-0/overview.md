# Batch 0 — baseline, authored fixtures, ratchet

Serial: T0a (branch + tooling + b0 baseline), then T0b in a worktree. The close
seeds the document-background pin at the PRE-fix values and journals the probe
matrix. Pin files are orchestrator-owned except the new one T0b creates.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T0a](T0a-branch-and-tooling.md) | branch, brief commit, tooling copied from jff, b0 gates + chain + d.ts snapshot + extended baseline | orchestrator | `plans/document-background-paint/{measurements,tools}/*` (copies), `.claude/settings.autonomous.json` | — | [x] |
| [T0b](T0b-fixtures-and-ratchet.md) | 42 authored rows + jar oracles; document-background ratchet + pin seeded pre-fix; `diff-row.mts` | typescript-pro (sonnet, effort high), dbp-T0b | `tests/fixtures/document-background/*`, `tests/oracle/svg-conformance/document-background{.ratchet.test.ts,.ts}`, `oracle/goldens/document-background.json`, `tools/diff-row.mts` | T0a | [x] |
| close | merge T0b; gates `b0close`; `fixtures.md` probe results + b0 row; stop 7 check | orchestrator | per close-procedure | T0b | [x] |

## Interface (T0b → B1, B2, exit)
```ts
// tests/oracle/svg-conformance/document-background.ts
export const DOCUMENT_BACKGROUND_ROOT: string;            // tests/fixtures/document-background
export interface DbgRow { readonly conformant: boolean; readonly diffCount: number }
export function listDbgRows(): string[];                    // '<engine>-<case>', sorted
export function measureDbgRow(row: string): DbgRow;         // renderSync + withJarCompatibleStyleInput + compareSvg
// oracle/goldens/document-background.json: { rows: Record<string, DbgRow> }
```
Shrink-only: `diffCount` may only fall; `conformant: true` may never flip back.
