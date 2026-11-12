# T4 — the rest of `src/`

**Context.** After T2/T3, 15 `src/` files still name the project: JSDoc prose, two user-visible message prefixes, an
error text and one `Symbol` description.

**Task.**
1. Runtime strings:
   - `src/image-providers/browser.ts:79` → `plantuml-engine: image from …`;
   - `src/image-providers/network.ts:27` `WARNING_PREFIX` → `'plantuml-engine network image provider: '`;
   - `src/core/tim/IncludeStore.ts:205` → `plantuml-engine vendors no PlantUML stdlib, …`;
   - `src/core/sprite-split-stdlib.ts:112` → `Symbol('plantuml-engine:sprite-split-names')`.
2. Their tests: `tests/unit/image-providers/{browser,network}.test.ts`, `tests/unit/stdlib-resolution.test.ts:202`.
3. Prose and comments in: `BlockUmlBuilder.ts`, `dot-engine-measurer.ts`, `dot-engine-messages.ts`,
   `graph-layout.ts`, `include-resolver.ts`, `measurer.ts`, `skinparam.ts`, `svg.ts`, `theme.ts`,
   `tim/IncludeStore.ts:156`, `tim/StdlibRemote.ts`, `tim/TContext.ts`, `tim/TContextOptions.ts` (all under
   `src/core/`).
4. `npm run catalog` — `measurer.ts`, `skinparam.ts`, `theme.ts` module docs are quoted in `docs/catalog.md`
   (lines 108, 145, 218 at planning).

**Write-set.** The 15 `src` files above (incl. `sprite-split-stdlib.ts`'s Symbol), 3 tests, `docs/catalog.md`,
`PENDING`.
**Read-set.** Each line from `git grep -n plantuml-ts -- src` only.

**Acceptance criteria.**
- Given a CSP-blocked image in the browser provider test, then the warning starts `plantuml-engine: image from`.
- Given the network provider, then its warnings start `plantuml-engine network image provider: `.
- Given `git grep -nIE "plantuml-ts|PlantumlTs|PLANTUML_TS" -- src`, then it is empty.
- Given the catalog drift test, then it passes after `npm run catalog`.

Observability: N/A — no new observable operations. Rollback: Reversible.
