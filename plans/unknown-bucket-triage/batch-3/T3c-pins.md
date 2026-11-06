# T3c — Pin the conformant `unknown` rows the activity, sequence and state engines draw

**State at planning:** `activity.golden.ratchet.test.ts`, `sequence.golden.ratchet.test.ts` and
`state.golden.ratchet.test.ts` read no `unknown` tree. Conformant `unknown` rows those engines draw
(`routing-baseline.json` `ourType`): activity 37, sequence 51, state 4. Some share a slug with a pin in their own
bucket's `ratchet.json` (activity 10, sequence 24).

**Read:** how `class.golden.ratchet.test.ts` reads `tree: 'class' | 'unknown'`, how `svg-description/ratchet.json`
carries `type: 'unknown'`, and each of the three tests' render helper (`render-fixture-activity.ts` and the
sequence and state ones). Pin tools to reuse: `plans/activity-divergence-drive/tools/pin-goldens.mts`,
`plans/sequence-divergence-drive-3/tools/pin-goldens.mts`, `plans/state-divergence-drive/measurements/pin-state.mjs`.

**Do:** per D6. Add the `unknown` source to each ratchet, test first (a pinned `unknown` row fails when its golden
differs). Pin every conformant `unknown` row the ratchet's own path renders with 0 diffs, including this mission's
new ones. For a slug pinned from its own bucket, `cmp` both `in.puml` and `in.svg`: identical means pinned already
(journal it), different means pin the `unknown` copy too. Journal every conformant row left unpinned with the
reason (error page, the ratchet path differs from `renderSync`, which `docs/parity-report.md:11` explains).
Update each test's doc comment, which today says "NO `unknown` tree".

**Measure:** the three ratchets and `npm test`; time each ratchet test before and after and journal it.

## Acceptance
- Given each of the three ratchets, when it runs, then every `unknown` pin passes, and a deliberately altered golden
  fails (red first).
- Given the journal, then every conformant `unknown` row those engines draw is pinned, already pinned through an
  identical copy, or listed with its reason.
- Given `docs/parity-report.md` regenerated at T4, then the `unknown` ratchet cell rises by the new pins.

Observability N/A. Rollback Reversible.
