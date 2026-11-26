# T2a: authored rows (D7)

## Read first

- `oracle/goldens/svg-utility/README.md` ("Authored root").
- `plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts` (`SPECS`, the `cov-license` entry
  near `:59-70`; `cov-licence` and `cov-license-upper` reuse its reason).
- `tests/oracle/svg-conformance/utility.diff-baseline.ratchet.test.ts` (the "authored" blocks).
- `.agent-notes/vkt-T2a.md` (only the new rows were inserted there; the tool's stale pins on other rows).

## Do

1. Replace the `cov-license` `reason` in `SPECS`. The old text describes the D13 GPL/MIT experiment, which no longer
   accounts for the page. The new reason names: the ruling ("user ruling 2026-11-12, #179"), which blocks differ
   (items 1-7 by name), the MIT-vs-GPL paragraph that remains (D13: `License.java:63-68`, `:157-168` vs `addMit`
   `:243-263`), and that the GPL oracle still draws its 99x99 zxing QR row where our page now has no qrcode line.
2. Dry run against the T1 commit: `npx jiti plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts
   <T1 sha>`. Read every row. Only `cov-license`, `cov-licence` and `cov-license-upper` may change; any other row
   moving (including `cov-refuse-license`) is stop 1 unless the tool's known stale pins explain it (vkt journal row 12):
   then insert only the three rows, as vkt did, and journal it.
3. Write the three rows (`--write`, or a text edit limited to those three objects).
4. Run the authored ratchet and `utility.golden.ratchet.test.ts`; read the counts.

## Acceptance
- Given the T1 tree, when the authored ratchet runs, then it passes, and the three license rows carry the new
  numbers and a reason that names the ruling.
- Given every other authored row, when re-measured, then none changes its score.

Observability: N/A. Rollback: Reversible.
