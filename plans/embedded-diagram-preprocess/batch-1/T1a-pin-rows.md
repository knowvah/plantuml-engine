# T1a: pin the two #185 rows (D1, D2)

## Context

Upstream's #3016 fix is in the pin, so the jar now embeds the themed 167×136 diagram that we already draw. The survey
reports both rows conformant; nothing holds them there. The svg-class ratchet is the gate that does.

## Steps

1. Copy `plans/class-oracle-gap-rows/tools/pin-goldens.mts` to `plans/embedded-diagram-preprocess/tools/` and set
   `MISSION = 'embedded-diagram-preprocess'`. Update the copy comment above it, as cogr did. Change nothing else.
2. **Zero-diff first.** The tool's doc promises "survey-conformant AND census-0-diff". The committed census is stale
   (`diffCount: 42`, 2026-11-10), so measure the ratchet's own way, without writing anything. Render each
   `test-results/dot-cache/class/<slug>/in.puml` with `renderClassFixture` (`render-fixture-class.ts:194`) and the
   options the ratchet uses (`censusClassFixtureOptions`, see the ratchet's imports). Then `compareSvg` it against
   `in.svg`. Both must give 0 diffs. Journal the numbers.
   - If either is non-zero, follow the README not-a-stop rule. Do not pin it.
3. Run `npx jiti plans/embedded-diagram-preprocess/tools/pin-goldens.mts edp-T1a <close-label> nacave-78-dijo807
   subdiagram-theme-1`. Read the tool's argv handling for `<close-label>`; use the label form its last caller used
   (see `ratchet.json`'s tail and the baselines' `$comment`).
4. Run the class pins (README). The count rises by exactly 2, and every test passes.
5. Commit, for example `test(class): pin the two #185 embed rows in the class ratchet`.

## Write-set
- `plans/embedded-diagram-preprocess/tools/pin-goldens.mts` (create)
- `oracle/goldens/svg-class/nacave-78-dijo807/`, `oracle/goldens/svg-class/subdiagram-theme-1/` (create, via the tool)
- `oracle/goldens/svg-class/ratchet.json` (append 2, via the tool)
- `oracle/goldens/svg-conformance/routing-baseline.json`, `refusal-baseline.json` (2 `goldens` rows each, via the
  tool)

## Read-set
- `plans/class-oracle-gap-rows/tools/pin-goldens.mts` (all 207 lines)
- `tests/oracle/svg-conformance/class.golden.ratchet.test.ts`, `render-fixture-class.ts:177-210`
- `tests/oracle/svg-conformance/parity-class.json` (the two records)

## Interface contracts
None consumed. Produces two ratchet entries `{ slug, addedAt: '2026-11-2x', source: 'edp-T1a' }`.

## Acceptance
- Given the two cached oracles, when rendered through `renderClassFixture` and compared, then each has 0 diffs.
- Given the tool ran, when `class.golden.ratchet.test.ts` runs, then it passes with both slugs pinned and
  `ratchet.json` has 1152 entries.
- Given `git diff <base> -- oracle/accepted-divergences.json DIVERGENCES.md`, then it is empty (D1).

Observability: N/A. Rollback: Reversible (revert the commit; the tool writes only the files above).
