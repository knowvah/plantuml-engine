# T4 — The `svg-git` ratchet, both tiers

**Read:** D8; `tests/oracle/svg-conformance/{bpm.golden.ratchet.test.ts,bpm.diff-baseline.ratchet.test.ts,render-fixture-bpm.ts}`,
`oracle/goldens/svg-bpm/README.md`; `tests/oracle/svg-conformance/json-family-positional.{ts,test.ts}` and
`oracle/goldens/json-family-positional.json` (the shrink-only ceiling shape); `scripts/svg-parity-survey.ts:201-220`
(the `structural-match` classifier); `scripts/parity-dashboard-goldens.ts`; bpe's T4 journal rows
(`plans/bpm-engine-port/decision-journal.md` rows 14-16).

**Write-set:** `oracle/goldens/svg-git/**`,
`tests/oracle/svg-conformance/{git.golden.ratchet.test.ts,git.diff-baseline.ratchet.test.ts,render-fixture-git.ts}`,
maybe `tests/oracle/svg-conformance/git-structural.{ts,test.ts}`, `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`,
the routing and refusal count tests, `scripts/parity-dashboard-goldens.ts` and its test, `docs/parity-report.md`,
`plans/git-engine-port/measurements/pin-git.mts`.

**Do:**
1. Copy bpm's ratchet pair, renderer and README with `git` substituted. `render-fixture-git.ts` exports
   `renderFixtureGit`, `listAuthoredGitSlugs` and `readAuthoredGitFixture`, the names the measurement tools import;
   it reads `tests/fixtures/git`.
2. Add the structural tier (D8). Each pinned row must classify `structural-match` or better under the survey's own
   classifier (import it; do not re-implement it), and its `maxDelta` must stay at or below its pinned ceiling. A row
   that becomes conformant fails the test with a message to promote it. Fold the tier into
   `git.golden.ratchet.test.ts`, or use a separate `git-structural` pair: journal which.
3. Extend `pin-git.mts` to list both tiers. Read its holds, then `--write`.
4. `repin-routing-refusal.mts <HEAD sha> --write`: the 4 `dot-cache` rows become `agree`, `ourType: GIT`, and their
   refusal rows' `engine` moves. Read the tool before `--write`, and fix anything that still assumes bpm. Move the count
   assertions by exactly the rows moved, and say so in each baseline's `$comment`. Diff each baseline JSON afterwards:
   a pin that rose is a stop (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).
5. `build-authored-baseline.mts <HEAD sha> --write`. Run `build-diff-baseline.mts` only if a conformant-tier row keeps
   a non-zero count.
6. `scripts/parity-dashboard-goldens.ts`: add `'svg-git'` to `unknown`'s list with a `gip D8` comment, and update its
   test's exact-family assertion (bpe's B4 close tripped on it). Regenerate `docs/parity-report.md`.
7. Check the new tests' time against `tests/helpers/ci-test-budgets.ts`. `figagi-40` is the slowest row.

## Acceptance
- Given `pin-git.mts` without `--write` after this task, then it prints `pins 0` for both tiers.
- Given the ratchet, then every pinned and authored row passes at its recorded tier and ceiling. A deliberately broken
  name `<text>` (local, not committed) fails the structural tier, and a deliberately moved box fails a conformant pin.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
