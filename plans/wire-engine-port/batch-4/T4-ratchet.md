# T4 — The `svg-wire` ratchet

**Read:** D7; `tests/oracle/svg-conformance/regex.golden.ratchet.test.ts`, `regex.diff-baseline.ratchet.test.ts`,
`render-fixture-regex.ts`, `oracle/goldens/svg-regex/README.md`; `scripts/parity-dashboard-goldens.ts`; rep's T4 journal
rows.

**Write-set:** `oracle/goldens/svg-wire/**`, `tests/oracle/svg-conformance/{wire.golden.ratchet.test.ts,wire.diff-baseline.ratchet.test.ts,render-fixture-wire.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the routing and refusal count tests,
`scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Do:**

1. `render-fixture-wire.ts`, `wire.golden.ratchet.test.ts`, `wire.diff-baseline.ratchet.test.ts` and
   `oracle/goldens/svg-wire/README.md`, copied from regex's with `wire` substituted. `render-fixture-wire.ts` exports
   `renderFixtureWire`, `listAuthoredWireSlugs` and `readAuthoredWireFixture`, the names the measurement tools import.
2. `npx jiti plans/wire-engine-port/measurements/pin-wire.mts`, read the holds, then `--write`: goldens under
   `svg-wire/<slug>/`, `ratchet.json`, and the `goldens` twins in the routing and refusal baselines.
3. `npx jiti plans/wire-engine-port/measurements/repin-routing-refusal.mts <HEAD sha> --write`: the 18 `dot-cache` rows
   become `agree`, `ourType: WIRE`, and their refusal rows' `engine` moves. Move the count assertions by exactly the rows
   moved (`git grep -n "rendering\|agree" tests/oracle/svg-conformance/`), and say so in each baseline's `$comment`. Diff
   each baseline JSON afterwards: a pin that rose is a stop (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).
4. `npx jiti plans/wire-engine-port/measurements/build-diff-baseline.mts <HEAD sha> --write` only if a row stays non-zero
   with a D8 end; `npx jiti plans/wire-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write`. The
   tool throws on a fixture where the jar draws and diffs remain: name its mechanism first (T3c owns those).
5. `scripts/parity-dashboard-goldens.ts` maps `wire: ['svg-wire']` in both tables with a `wrp D7` comment; regenerate
   `docs/parity-report.md` so the drift gate stays green between T4 and T5.

## Acceptance
- Given `pin-wire.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately
  broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
