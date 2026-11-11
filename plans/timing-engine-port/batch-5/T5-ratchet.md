# T5 — The `svg-timing` ratchet

**Read:** D12; `tests/oracle/svg-conformance/regex.golden.ratchet.test.ts`, `regex.diff-baseline.ratchet.test.ts`,
`render-fixture-regex.ts`, `render-fixture-gantt.ts` (the clock), `oracle/goldens/svg-regex/README.md`;
`scripts/parity-dashboard-goldens.ts`; rep's T4 and ubt's journal rows (unknown-bucket pins,
`.claude/memory/ubt-status.md`).

**Write-set:** `oracle/goldens/svg-timing/**`, `tests/oracle/svg-conformance/{timing.golden.ratchet.test.ts,timing.diff-baseline.ratchet.test.ts,render-fixture-timing.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the routing and refusal count tests,
`scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Do:**

1. `render-fixture-timing.ts` (if T4a did not), `timing.golden.ratchet.test.ts`, `timing.diff-baseline.ratchet.test.ts`
   and `oracle/goldens/svg-timing/README.md`, copied from regex's with `timing` substituted. `render-fixture-timing.ts`
   exports `renderFixtureTiming`, `listAuthoredTimingSlugs` and `readAuthoredTimingFixture` (the measurement tools
   import those names), defaults to the sprite + Twemoji + utility asset store, and passes the capture-clock zone.
2. `npx jiti plans/timing-engine-port/measurements/pin-timing.mts`, read the holds, then `--write`: goldens under
   `svg-timing/<slug>/`, `ratchet.json` (with `bucket`), and the `goldens` twins in the routing and refusal baselines.
3. `npx jiti plans/timing-engine-port/measurements/build-diff-baseline.mts <HEAD sha> --write` for the six jar-error
   rows and any other row that stays nonzero with a D8 end.
4. Re-pin the `dot-cache` routing rows `agree`, `ourType: TIMING`, and the refusal rows' `engine`, for every row we now
   draw, in both buckets; move the count assertions by exactly the rows moved (`git grep -n "rendering\|agree"
   tests/oracle/svg-conformance/`), and say so in each baseline's `$comment`. Diff each baseline JSON afterwards: a pin
   that rose is a stop (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).
5. `npx jiti plans/timing-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write`. The tool throws on a
   fixture where the jar draws and diffs remain: name its mechanism first (T4d owns those).
6. `scripts/parity-dashboard-goldens.ts` maps `timing: ['svg-timing']` in both tables with a `tep D12` comment;
   regenerate `docs/parity-report.md` so the drift gate stays green between T5 and T6.

## Acceptance
- Given `pin-timing.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately
  broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
