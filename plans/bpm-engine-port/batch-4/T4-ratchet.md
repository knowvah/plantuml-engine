# T4 — The `svg-bpm` ratchet

**Read:** D7; `tests/oracle/svg-conformance/nwdiag.golden.ratchet.test.ts`, `nwdiag.diff-baseline.ratchet.test.ts`,
`render-fixture-nwdiag.ts`, `oracle/goldens/svg-nwdiag/README.md`; `scripts/parity-dashboard-goldens.ts:49-51`; nwp's
and wrp's T4 journal rows (`plans/nwdiag-engine-port/decision-journal.md`, `plans/wire-engine-port/decision-journal.md`).

**Write-set:** `oracle/goldens/svg-bpm/**`,
`tests/oracle/svg-conformance/{bpm.golden.ratchet.test.ts,bpm.diff-baseline.ratchet.test.ts,render-fixture-bpm.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the routing and refusal count tests,
`scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Do:**
1. Copy nwdiag's ratchet pair, renderer and README with `bpm` substituted. `render-fixture-bpm.ts` exports
   `renderFixtureBpm`, `listAuthoredBpmSlugs` and `readAuthoredBpmFixture`, the names the measurement tools import;
   it reads `tests/fixtures/bpm`.
2. `npx jiti plans/bpm-engine-port/measurements/pin-bpm.mts`, read the holds, then `--write`: goldens under
   `svg-bpm/unknown/<slug>/`, `ratchet.json`, and the golden twins in the routing and refusal baselines.
3. `npx jiti plans/bpm-engine-port/measurements/repin-routing-refusal.mts <HEAD sha> --write`: the 7 `dot-cache` rows
   become `agree`, `ourType: BPM`, and their refusal rows' `engine` moves. The tool was adapted from wrp's by name
   substitution: read it before `--write` and fix anything that assumed a `wire` bucket (journal it). Move the count
   assertions by exactly the rows moved and say so in each baseline's `$comment`. Diff each baseline JSON afterwards:
   a pin that rose is a stop (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).
4. `build-diff-baseline.mts <HEAD sha> --write` only if a row stays non-zero with a D12 end;
   `build-authored-baseline.mts <HEAD sha> --write`.
5. `scripts/parity-dashboard-goldens.ts`: add `'svg-bpm'` to `unknown`'s list with a `bpe D7` comment; regenerate
   `docs/parity-report.md`.

## Acceptance
- Given `pin-bpm.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately
  broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
