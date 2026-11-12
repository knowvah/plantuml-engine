# T5 — scripts, D1 identifiers, generated reports

**Context.** 13 scripts still name the project, three carry the D1 identifiers, and three committed reports are
generator output that must agree with their generators.

**Task.**
1. D1 renames (use Serena `rename_symbol` or LSP rename, then grep): `isPlantumlTsOnly` → `isPlantumlEngineOnly`,
   `PLANTUML_TS_ONLY` → `PLANTUML_ENGINE_ONLY` (`scripts/parity-dashboard-matrix.ts`), `plantumlTsOnlyColumns` →
   `plantumlEngineOnlyColumns` (`scripts/parity-dashboard.ts`), label `n/a (plantuml-engine only)`; references in
   `scripts/parity-dashboard-inputs.ts` and `tests/unit/scripts/parity-dashboard{,-jar-unsupported}.test.ts`.
2. Prose/strings: `build-stdlib-packages.ts`, `build-stdlib-packages/build-lock.ts` (lock name),
   `measure-lock-contention.ts`, `oracle-corpus.ts`, `oracle-gap.ts`, `stdlib-assets-store.ts`,
   `svg-parity-dashboard.ts`, `svg-parity-survey.ts`, `vendor-sprites.ts`, `verify-deterministic-measurer.ts`.
3. Temp prefixes and their tests: `tests/helpers/coverage-reports-directory{,.test}.ts`,
   `tests/unit/build-stdlib-lock.test.ts:283`, `tests/unit/include-resolver-node.test.ts:141`,
   `tests/unit/stdlib-assets-store.test.ts:78,122`. Check `vitest.config.*` / `package.json` scripts for a
   hard-coded `plantuml-ts-coverage-` path.
4. Reports:
   - `docs/parity-report.md`: `npm run parity:dashboard`. Diff must be the label change only.
   - `tests/oracle/svg-conformance/PARITY-SVG.md`: `npm run svg:dashboard` if it runs from committed data; keep only
     the title-line change (restore a `Generated:` stamp-only change, lsp journal row 10 precedent).
   - `oracle/GAP.md`: `scripts/oracle-gap.ts` needs the oracle jar; if it cannot run offline, edit the generator
     strings and the same strings in `GAP.md` together, and journal that choice.

**Write-set.** The scripts and tests above, the 3 reports, `PENDING`.
**Read-set.** `scripts/parity-dashboard-matrix.ts:70-110`; `scripts/parity-dashboard.ts:180-200,315-320`.

**Acceptance criteria.**
- Given `npm run parity:dashboard`, then `docs/parity-report.md` shows `n/a (plantuml-engine only)` and has no other
  diff.
- Given `git grep -nIE "PlantumlTs|PLANTUML_TS|plantumlTs|plantuml-ts" -- scripts tests ':!tests/architecture/legacy-name.test.ts'`,
  then only T6's 15 comment files remain.
- Given the coverage helper tests, then they assert the `plantuml-engine-coverage-<pid>` shape.

Observability: N/A — no new observable operations. Rollback: Reversible.
