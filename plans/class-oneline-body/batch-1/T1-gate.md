# T1: the class-oneline-body authored gate

**Writes:** `tests/fixtures/class-oneline-body/<slug>.{puml,svg}` (18 rows, copied from
`plans/class-oneline-body/measurements/probes/` with each `jar/<slug>.svg` placed beside its `.puml`), and
`tests/oracle/svg-conformance/class-oneline-body.authored.test.ts`.
**Reads:** `nbsp-trim.authored.test.ts` (manifest shape), `hidden-note-host.authored.test.ts` (OPEN rows),
`src/core/error/error-renderer.ts:40-50` (`setErrorPageObserver`), decisions.md D3.

## What the gate holds

Three row lists, whose union is exactly the `.puml` files on disk, each listed once:

- `ZERO`: the six `ocb-ctl-*` rows. 0 diffs and 0 comment mismatches, rendered as the survey renders
  (`renderSync` + `DeterministicMeasurer`; follow `measure.mts`'s options if a row needs them).
- `ERROR_PAGE`: rows that pass D3. Empty at T1, because the port draws every one of them today.
- `OPEN`: every other row, with `maxDiffs` set to today's count (plan-baseline: 5, `ocb-long` 6), a `reason` true
  today, and the jar's expected `{ label, line, welcome }` read from its `.svg`. The reason for the issue rows today:
  "port draws: `extractBody` accepts a non-empty brace body (`class-declaration-extractors.ts:20`), rule 7 claims it
  (`class-command-declarations.ts:32`)".

Write the D3 check as a function the `ERROR_PAGE` loop calls. It returns the observed
`{ errorPage, label, line, welcome, nonFooterDiffs }`. The manifest test also asserts that every `ERROR_PAGE`/`OPEN`
jar svg contains `Syntax Error?`, and that every `ZERO` jar svg does not.

For each error row, run the README's stock check once and journal `status=ERROR lineNumber=N` (the issue rows and
`ocb-entity` were already checked at planning).

## Acceptance
- Given the fixtures dir, when the manifest test runs, then the three lists' union equals the `.puml` files and every
  row has its jar `.svg`.
- Given the base tree, when the gate runs, then it is green: `ZERO` rows at 0, `ERROR_PAGE` empty, each `OPEN` row at
  or under its `maxDiffs`.
- Given a deliberately broken D3 check (for example, comparing the label to a wrong string), when the gate runs
  locally, then an error row fails. Revert that before you commit, and journal that the check bites.

Observability N/A. Rollback Reversible. Commit: `test(class): add the class-oneline-body authored gate`, footer
`Refs: #223`.
