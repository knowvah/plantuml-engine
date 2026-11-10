# T4 — The `svg-nwdiag` ratchet

**Read:** D7; `tests/oracle/svg-conformance/activity-legacy.golden.ratchet.test.ts`,
`activity-legacy.diff-baseline.ratchet.test.ts`, `render-fixture-activity-legacy.ts`,
`oracle/goldens/svg-activity-legacy/README.md`; `plans/legacy-activity-engine-port/decision-journal.md` for its T4
rows; `.claude/memory/ubt-status.md` (tools that walk `ratchet.json` must allow `tree: 'unknown'`).

**Write-set:** `oracle/goldens/svg-nwdiag/**`, `tests/oracle/svg-conformance/{nwdiag.golden.ratchet.test.ts,nwdiag.diff-baseline.ratchet.test.ts,render-fixture-nwdiag.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the routing and refusal count tests,
`tests/oracle/svg-conformance/unknown-ledger/*.json` if a gate reads the 64 nwdiag entries there,
`scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Do:**

1. `render-fixture-nwdiag.ts`, `nwdiag.golden.ratchet.test.ts`, `nwdiag.diff-baseline.ratchet.test.ts` and
   `oracle/goldens/svg-nwdiag/README.md`, copied from activity-legacy's with `nwdiag` substituted. Drop the DOT-parity
   parts: nwdiag has no svek stage. `render-fixture-nwdiag.ts` exports `renderFixtureNwdiag`,
   `listAuthoredNwdiagSlugs` and `readAuthoredNwdiagFixture` (the measurement tools import those names) and defaults to
   the sprite + Twemoji + utility asset store (D7).
2. `npx jiti plans/nwdiag-engine-port/measurements/pin-nwdiag.mts`, read the holds, then `--write`: goldens under
   `svg-nwdiag/unknown/<slug>/`, `ratchet.json`, and the `goldens` twins in the routing and refusal baselines.
3. Re-pin the 64 `dot-cache` routing rows `agree`, `ourType: NWDIAG`, and the refusal rows' `engine`, for every row we
   now draw; the 4 `jar-error` rows follow the gate's own rule. Move the count assertions by exactly the rows moved
   (find them with `git grep -n "rendering\|agree" tests/oracle/svg-conformance/`), and say so in each baseline's
   `$comment`. If a gate reads `unknown-ledger/T1-settled.json`'s nwdiag entries ("no engine"), update them the way
   ubt did.
4. `npx jiti plans/nwdiag-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write`. The tool throws on a
   fixture where the jar draws and diffs remain: name its mechanism first (T3b owns those).
5. `scripts/parity-dashboard-goldens.ts` gains `svg-nwdiag` for the `unknown` bucket the way `svg-activity-legacy` is
   mapped; regenerate `docs/parity-report.md` here so the drift gate stays green between T4 and T5.

## Acceptance
- Given `pin-nwdiag.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately
  broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
