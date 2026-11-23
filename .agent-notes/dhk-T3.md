## Observation: the dot survey has been blind to every drawn @startdot row since cfb9ecd55
- **Context**: dhk/T3 close-out. Follow-up to D3 of `plans/dot-host-font-kerning/decisions.md`.
- **Finding**: `parity-dot.json` surveys `test-results/dot-cache/dot/`, whose `in.svg` captures the a720bdd re-pin
  (cfb9ecd55) rewrote under the default LEGACY profile. There, `PSystemDot#exportDiagramNow` writes the fixed "This
  feature has been suppressed" page whenever `!allowDotSvg()` (`PSystemDot.java:77-84` at a720bdd), and so do we, so
  every drawn row reads `conformant` (62/62) whatever graphviz draws. Only `oracle/goldens/svg-dot/` (INSECURE captures,
  `dot.golden.ratchet.test.ts`) measures graphviz parity. `scripts/lib/golden-security-profile.ts:16-26` and
  `recapture-render.ts:66-69` keep every non-golden tree LEGACY on purpose. The #186 ledger entries need `surveyBlind`
  because of this.
- **Impact**: A harness mission could survey `dot` under INSECURE, as `golden-security-profile.ts` already does for
  `goldens`/`svg-dot`. Then the dot survey would see graphviz geometry again, and the #186 entries could drop
  `surveyBlind`. Until then, a regression in a `@startdot` row that is not pinned in the svg-dot ratchet reaches no gate.
- **Confidence**: High

## Observation: PARITY-SVG.md's ledger table never matches a ledger entry
- **Context**: dhk/T2 expected the two new entries in the `PARITY-SVG.md` ledger table after `npm run svg:dashboard`.
- **Finding**: `ledgerRows` (`scripts/svg-parity-dashboard.ts:161-171`) matches each ledger `match.id` against the
  bare slugs in `tests/oracle/svg-conformance/parity.json`, which surveys component/usecase only, while ledger ids
  look like `svg-<type>/<slug>`. The table reads "_(none matched)_" for all 51 in-force entries, as it did for the 49
  before dhk.
- **Impact**: Do not plan acceptance criteria on that table listing an entry. Making it list them is a
  `svg-parity-dashboard.ts` change, a separate harness task.
- **Confidence**: High
