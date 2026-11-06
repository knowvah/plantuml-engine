# T4 — The `svg-packet` ratchet

**Read:** D5, `tests/oracle/svg-conformance/chart.golden.ratchet.test.ts`, `chart.diff-baseline.ratchet.test.ts`, `render-fixture-chart.ts`, `oracle/goldens/svg-chart/README.md`, cep journal rows 16 and 17.

**Do:**

1. `render-fixture-packet.ts`, `packet.golden.ratchet.test.ts`, `packet.diff-baseline.ratchet.test.ts` and `oracle/goldens/svg-packet/README.md`, copied from chart's with `packet` substituted. `PACKET_CACHED_SLUG_COUNT = 6`. `render-fixture-packet.ts` exports `renderFixturePacket`, `listAuthoredPacketSlugs`, `readAuthoredPacketFixture` and `authoredPacketIncludeStore`: `build-authored-baseline.mts` imports those names. The routing and refusal gates are split into part files since `a1427cdf2`: find the count assertions with `git grep -n "rendering\|agree" tests/oracle/svg-conformance/`.
2. `npx jiti plans/packet-engine-port/measurements/pin-packet.mts --write`: goldens, `ratchet.json`, and the `goldens` twins in the routing and refusal baselines.
3. Re-pin the 6 `dot-cache` routing rows and their twins `agree`, `ourType: PACKET`; refusal rows `engine: packet`. Move the count assertions in `routing-conformance.test.ts` and the refusal count test by exactly the rows moved, and say so in each baseline's `$comment`.
4. `npx jiti plans/packet-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write` for `oracle/goldens/svg-packet/authored-baseline.json`. The tool throws on a fixture where the jar draws and diffs remain: name its mechanism first (T3b, T3c own those).
5. `scripts/parity-dashboard-goldens.ts` learns `svg-packet` if it lists roots; regenerate `docs/parity-report.md` here so the D9 drift gate stays green between T4 and T5 (cep journal row 17).

## Acceptance
- Given `pin-packet.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
