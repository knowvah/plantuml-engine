# T4b — Pin the `c4` rows in the ratchets that own them

**Read:** D6; `description-eligibility.ts`, `description.golden.ratchet.test.ts:60-75,139,200`, `class.golden.ratchet.test.ts:60-75,122-135,254-290`, `render-fixture.ts` and `render-fixture-class.ts` (`prepareElkOnce`), `plans/description-divergence-drive/measurements/pin-description.mts:40-110`, `oracle/goldens/svg-class/README.md` "Add rule", `scripts/parity-dashboard.ts`.

**Do:**
1. `tree: 'c4'` in the class ratchet, with `fixtureDir` and its unit test, as `'unknown'` was added. Eligibility reads `parity-c4.json`, and `routing-baseline.json` says `ourType: CLASS`. Pin `rosoga-84` and `xetego-25`, by its Add rule: zero diff through the ratchet's own path.
2. `dotEligibility`: an `oracleBlind` row with an active `!pragma layout elk` is eligible, as `class.golden.ratchet.test.ts:260-267`. Check `render-fixture.ts` renders ELK; if it does not, add what `render-fixture-class.ts` has. Pin `biluko-70` and `vakasu-51` with `pin-description.mts`.
3. `kipive-74`: journal why it stays out (D6). `gikaju-64`: journal that its ledger entry stands.
4. `scripts/parity-dashboard.ts`: the `c4` ratchet cell counts both ratchets instead of `n/a (no ratchet yet)`. Add a diff-baseline cell only if the row needs one.

Diff the baselines: a pin that rose is stop 2.

## Acceptance
- Given the ratchets, when run alone, then they pass with the collected counts raised by the pins: read the counts.
- Given the routing and refusal gates, when run, then they pass.
- Given `npm run parity:dashboard`, then the `c4` row prints a real pin count, and `tests/oracle/svg-conformance/` tests of the dashboard pass.

Observability N/A. Rollback Reversible.
