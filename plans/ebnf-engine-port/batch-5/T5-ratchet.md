# T5 — The `svg-ebnf` ratchet

**Read:** D9; `tests/oracle/svg-conformance/nwdiag.golden.ratchet.test.ts`, `nwdiag.diff-baseline.ratchet.test.ts`,
`render-fixture-nwdiag.ts`, `oracle/goldens/svg-nwdiag/README.md`; `board.golden.ratchet.test.ts` and
`oracle/goldens/svg-board/README.md` for the flat layout; `plans/nwdiag-engine-port/decision-journal.md` for its T4
rows.

**Write-set:** `oracle/goldens/svg-ebnf/**`, `tests/oracle/svg-conformance/{ebnf.golden.ratchet.test.ts,ebnf.diff-baseline.ratchet.test.ts,render-fixture-ebnf.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the routing and refusal count tests,
`scripts/parity-dashboard-goldens.ts`, `docs/parity-report.md`.

**Do:**

1. `render-fixture-ebnf.ts`, `ebnf.golden.ratchet.test.ts`, `ebnf.diff-baseline.ratchet.test.ts` and
   `oracle/goldens/svg-ebnf/README.md`, copied from nwdiag's with `ebnf` substituted and the `<bucket>/` level dropped
   (D9). `render-fixture-ebnf.ts` exports `renderFixtureEbnf`, `listAuthoredEbnfSlugs` and `readAuthoredEbnfFixture`
   (the measurement tools import those names) and defaults to the sprite + Twemoji + utility asset store.
2. `npx jiti plans/ebnf-engine-port/measurements/pin-ebnf.mts`, read the holds, then `--write`: goldens under
   `svg-ebnf/<slug>/`, `ratchet.json`, and the `goldens` twins in the routing and refusal baselines.
3. `npx jiti plans/ebnf-engine-port/measurements/build-diff-baseline.mts <HEAD sha> --write` for `ladifa`'s error pair
   (and any other jar-error row), only if it prints a row.
4. Re-pin the 43 `dot-cache` routing rows `agree`, `ourType: EBNF`, and the refusal rows' `engine`, for every row we
   now draw; `ladifa` follows the gate's own rule. Move the count assertions by exactly the rows moved (find them with
   `git grep -n "rendering\|agree" tests/oracle/svg-conformance/`), and say so in each baseline's `$comment`.
5. `npx jiti plans/ebnf-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write`. The tool throws on a
   fixture where the jar draws and diffs remain: name its mechanism first (T4b owns those).
6. `scripts/parity-dashboard-goldens.ts` gains `svg-ebnf` for the `ebnf` bucket the way `svg-board` is mapped;
   regenerate `docs/parity-report.md` here so the drift gate stays green between T5 and T6.

## Acceptance
- Given `pin-ebnf.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately
  broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
