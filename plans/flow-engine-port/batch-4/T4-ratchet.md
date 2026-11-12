# T4 — The `svg-flow` ratchet

**Read:** D7; `tests/oracle/svg-conformance/bpm.golden.ratchet.test.ts`, `bpm.diff-baseline.ratchet.test.ts`,
`render-fixture-bpm.ts`, `oracle/goldens/svg-bpm/README.md`; `scripts/parity-dashboard-goldens.ts`; bpe's T4 journal
rows (`plans/bpm-engine-port/decision-journal.md`).

**Write-set:** `oracle/goldens/svg-flow/**`;
`tests/oracle/svg-conformance/{flow.golden.ratchet.test.ts,flow.diff-baseline.ratchet.test.ts,flow.multiset.ratchet.test.ts,render-fixture-flow.ts,svg-multiset.ts}`;
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`; the routing and refusal count tests;
`scripts/parity-dashboard-goldens.ts`; `docs/parity-report.md`.

**Do:**
1. Copy bpm's ratchet pair, renderer and README with `flow` substituted. `render-fixture-flow.ts` exports
   `renderFixtureFlow`, `listAuthoredFlowSlugs` and `readAuthoredFlowFixture`, the names the measurement tools import;
   it reads `tests/fixtures/flow`.
2. `svg-multiset.ts` is a pure `multisetDiff(ours, theirs)` with the same tag split as `multiset.mjs`, and a unit test
   of its own.
3. `flow.multiset.ratchet.test.ts`:
   - Inputs: every multi-box authored fixture, by box count from the source, plus `bemixo-79-xulu250` from its golden.
   - Assertion: our render is multiset-equal to the oracle or to one of its `.vN.svg` variants.
   - Its header names D4 and says this tier is not a conformance verdict.
4. `npx jiti plans/flow-engine-port/measurements/pin-flow.mts`, read the holds, then `--write`.
5. `npx jiti plans/flow-engine-port/measurements/repin-routing-refusal.mts <HEAD sha> --write`:
   - Read it before `--write`, because it was adapted by substitution.
   - `bemixo` becomes `agree`, `ourType: FLOW`, and its refusal row's `engine` moves.
   - Move the count assertions by exactly the rows moved, and say so in each baseline's `$comment`.
   - Diff each baseline JSON: a pin that rose is a stop (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).
6. `build-diff-baseline.mts <HEAD sha> --write` only if a row ends nonzero for a reason other than order.
   `build-authored-baseline.mts <HEAD sha> --write`.
7. `scripts/parity-dashboard-goldens.ts`: add `'svg-flow'` to `unknown`'s list, with a `flp D7` comment. Regenerate
   `docs/parity-report.md`.

## Acceptance
- Given `pin-flow.mts` without `--write` after this task, then it prints `pins 0`.
- Given the three ratchet tests, then every pinned, authored and multiset row passes, and a deliberately broken label
  (local, not committed) fails both the equality tier and the multiset tier.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
