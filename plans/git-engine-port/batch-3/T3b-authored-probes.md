# T3b — Authored probes

**Read:** D5, D7; T1a's rule-coverage table in the journal; `plans/bpm-engine-port/batch-3/T3b-authored-probes.md` (the
precedent's file layout).

**Write-set:** `tests/fixtures/git/**` (`<slug>.puml` + `<slug>.svg` pairs).

**Do:**
1. Copy the 38 planning probes and their oracles from `/tmp/gip-plan/oracle` (T0 restores them) into
   `tests/fixtures/git/`.
2. Author the D7 list. Each walk rule that T1a found unreached gets its own fixture, named `cov-rule-<java line>`.
   Render each with `scripts/oracle-render.sh /tmp/gip-t3b/oracle <puml>`, and keep a fixture only when the jar
   renders it as intended (`GIT` drawn, or the intended crash). A probe that renders something other than intended gets
   rewritten, never dropped: record what the jar did.
3. Generate the ~200-commit scale probe as a committed `.puml` (no generator in `src/`). Record its render time
   against `figagi-40`.
4. Run `fixtures.mts`. Journal each fixture's verdict, and hand every non-zero, non-error-pair fixture to T3c with its
   first diff.

## Acceptance
- Given `tests/fixtures/git/`, then every `getDownFromInternal` rule is reached by at least one fixture or row, and the
  journal's coverage table says which.
- Given `fixtures.mts`, then every fixture has a verdict line, and the 4 crash probes pair with our error page.

Observability N/A. Rollback Reversible.
