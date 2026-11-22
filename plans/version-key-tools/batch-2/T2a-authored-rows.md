# T2a: authored rows

**Decisions:** D5, D6.

## Read first

- `oracle/goldens/svg-utility/README.md` ("Authored root"): the form, the one-file-per-run rule, absolute paths.
- `tests/oracle/svg-conformance/render-fixture-utility.ts:141-230` (`listAuthoredUtilitySlugs`,
  `measureAuthoredUtility`), `utility.diff-baseline.ratchet.test.ts` ("authored" blocks).
- `plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts` (`SPECS`, `:61-95` for the
  `cov-license`/`cov-version`/`cov-about` rows as the reason form).
- `.agent-notes/ufp-T3-cov.md`.

## Do

1. Author one `@startuml` / line / `@enduml` fixture per regex branch, at least:
   `cov-testdot`, `cov-testdot-upper-trailing` (`TESTDOT  `), `cov-keydistributor`, `cov-keygen`, `cov-keyimport`,
   `cov-keyimport-key` (`keyimport abc123`), `cov-keycheck` (`keycheck abc123 def456`), `cov-keycheck-one-arg`
   (`keycheck abc123`). Add refused near-misses if a regex boundary is untested (`keycheck a-b`): both sides draw
   the sequence `Syntax Error?` page, so it scores the error-page residual, as `cov-refuse-*` do.
2. Render each oracle with `scripts/oracle-render.sh <abs dir> <abs puml>`, **one file per run**, and place the
   `.svg` beside the `.puml`. Delete any `svek-N.dot`. Check the `keygen`-family heights are 282 (the planning probe):
   another height means the QR race; re-render.
3. Add a `SPECS` entry per new slug in `build-authored-baseline.mts`: a topic, and for every nonzero row a reason
   naming the mechanism with `file:line` on both sides (our `PSystemKeygen.ts`/`PSystemKeycheck.ts`/
   `PSystemVersion.ts` line vs the Java line, and the ruling: "#182 ruling 1, inspired by, not conformant").
   Reuse one reason across a family as the tool already does for `cov-licence`.
4. Dry run the tool against the current commit, read every row, then `--write`. Only the new rows may change; an
   existing row's score moving is stop 1.
5. Run `utility.diff-baseline.ratchet.test.ts` and `utility.golden.ratchet.test.ts`; read the counts.

## Acceptance
- Given every new `.puml`, when the authored ratchet runs, then each row is in `authored-baseline.json` and every
  nonzero row carries a reason.
- Given the existing 49 authored rows, when re-measured, then none changes its score.
- Given `cov-keydistributor`, when measured, then its score is journalled; 0 means conformant (D6).

Observability: N/A, no new observable operations. Rollback: Reversible.
