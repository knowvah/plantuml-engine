# T5 — Pin every conformant row

**Read:** `tests/oracle/svg-conformance/utility.golden.ratchet.test.ts`, `utility.diff-baseline.ratchet.test.ts` (its authored blocks), `render-fixture-wbs.ts`, `oracle/goldens/svg-utility/README.md`, `plans/description-divergence-drive/measurements/flip-gate-rows.mjs`, `routing-conformance.test.ts:567`, D7.

**Do, in this order:**

1. `tests/oracle/svg-conformance/render-fixture-chart.ts` (`renderFixtureChart`, `AUTHORED_CHART_ROOT`), `chart.golden.ratchet.test.ts` with AC1 and AC2, and `chart.diff-baseline.ratchet.test.ts` holding the authored root. Seed `oracle/goldens/svg-chart/ratchet.json` with `{ "fixtures": [] }` and `README.md` from the utility one.
2. `npm run svg:survey -- chart --out /tmp/cep-T5/parity-chart.json`, then copy it over `tests/oracle/svg-conformance/parity-chart.json`: the tool reads the committed file.
3. `npx jiti plans/chart-engine-port/measurements/pin-chart.mts`, read every `hold`, then rerun with `--write`.
4. Re-pin the 29 `dot-cache` routing rows to `agree`, `ourType: CHART`, `reason` removed, stamped today at this sha, and their `goldens` twins with them, then move the split count assertions in `routing-conformance.test.ts:567` and its neighbours, with a comment in that file's style. Refusal rows: `engine` becomes `chart` if that gate reads it, by the gate's own message.
5. Write `oracle/goldens/svg-chart/authored-baseline.json` from T4c to T4e: row, topic, `status`, score, diff count, sha.
6. `scripts/parity-dashboard-goldens.ts`: `chart: ['svg-chart']` in `RATCHET_FAMILY`, and in `DIFF_BASELINE_FAMILY` only if a `diff-baseline.json` exists per D7.
7. `oracle-freshness.test.ts:128` already names `babadu-29`: leave it.

## Acceptance
- Given the ratchet, when `npm test` runs, then it collects every manifest slug and passes.
- Given `parity-chart.json`, then every conformant slug is in `ratchet.json`, or the journal names why not.
- Given `routing-baseline.json` and `refusal-baseline.json`, then each new pin has a `goldens` twin, no chart row reads `known-misroute`, and their gates pass.
- Given a mutated golden in memory, then AC2 fails naming the slug and diff path.

Observability N/A. Rollback Reversible.
