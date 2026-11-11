# T3b — Copy and extend the probes

**Read:** D5, D6; `plans/regex-engine-port/batch-3/T3b-authored-probes.md`.

**Write-set:** `tests/fixtures/wire/**`.

**Do:** copy the 72 planning probes into `tests/fixtures/wire/`, then author what D6 lists. Render every `.puml` with
`scripts/oracle-render.sh <absolute-out-dir>`, and keep each `.svg` beside its source. `npx jiti
plans/wire-engine-port/measurements/fixtures.mts` measures them; each residual goes to T3c. Keep a fixture to one idea,
so a diff names its branch.

Check the jar agreed with the intent of each new fixture (an accidental syntax error tests nothing), the way planning's
`cov-monochrome` had to be rewritten once the jar rejected `* a #red [20x20]`.

## Acceptance
- Given `fixtures.mts`, then every fixture has a committed oracle `.svg` and prints a line.
- Given D6's list, then each item has a fixture, or a journal line saying why the jar's output makes it redundant.

Observability N/A. Rollback Reversible.
