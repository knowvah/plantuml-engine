# T4 — The `svg-regex` ratchet

**Read:** D7; `tests/oracle/svg-conformance/ebnf.golden.ratchet.test.ts`, `ebnf.diff-baseline.ratchet.test.ts`,
`render-fixture-ebnf.ts`, `oracle/goldens/svg-ebnf/README.md`; `scripts/parity-dashboard-goldens.ts:40-63`; eep's T5
journal rows.

**Write-set:** `oracle/goldens/svg-regex/**`, `tests/oracle/svg-conformance/{regex.golden.ratchet.test.ts,regex.diff-baseline.ratchet.test.ts,render-fixture-regex.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the routing and refusal count tests,
`scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Do:**

1. `render-fixture-regex.ts`, `regex.golden.ratchet.test.ts`, `regex.diff-baseline.ratchet.test.ts` and
   `oracle/goldens/svg-regex/README.md`, copied from ebnf's with `regex` substituted. `render-fixture-regex.ts` exports
   `renderFixtureRegex`, `listAuthoredRegexSlugs` and `readAuthoredRegexFixture` (the measurement tools import those
   names; check with `grep -n "import" plans/regex-engine-port/measurements/*.mts`) and defaults to the sprite +
   Twemoji + utility asset store, as the survey renders.
2. `npx jiti plans/regex-engine-port/measurements/pin-regex.mts`, read the holds, then `--write`: goldens under
   `svg-regex/<slug>/`, `ratchet.json`, and the `goldens` twins in the routing and refusal baselines.
3. `npx jiti plans/regex-engine-port/measurements/build-diff-baseline.mts <HEAD sha> --write` for bakuza's and
   tajefa's error pairs, and any other row that stays nonzero.
4. Re-pin the 44 `dot-cache` routing rows `agree`, `ourType: REGEX`, and the refusal rows' `engine`, for every row we
   now draw; bakuza and tajefa follow the gate's own rule. Move the count assertions by exactly the rows moved (find
   them with `git grep -n "rendering\|agree" tests/oracle/svg-conformance/`), and say so in each baseline's `$comment`.
5. `npx jiti plans/regex-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write`. The tool throws on a
   fixture where the jar draws and diffs remain: name its mechanism first (T3c owns those).
6. `scripts/parity-dashboard-goldens.ts` maps `regex: ['svg-regex']` in both tables, with a `rep D7` comment beside
   eep's; regenerate `docs/parity-report.md` so the drift gate stays green between T4 and T5.

## Acceptance
- Given `pin-regex.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately
  broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
