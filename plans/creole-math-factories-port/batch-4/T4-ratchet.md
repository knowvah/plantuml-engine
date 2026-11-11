# T4 — the `svg-factories` ratchet

Read [D11](../decisions.md#d11--one-new-ratchet-family-svg-factories-copied-from-svg-utility) and [task-contract.md](../task-contract.md).

**Copy from the utility family** (`tests/oracle/svg-conformance/utility.golden.ratchet.test.ts`, `utility.diff-baseline.ratchet.test.ts`,
`render-fixture-utility.ts`, `plans/utility-factories-port/measurements/{pin-utility,repin-utility-baseline,repin-utility-routing}.mts`), adapting names and:

- `FACTORIES_SLUGS`: every in-scope row in the `unknown` tree, from `factory-rows.mjs --json`, in a stable order.
- `AUTHORED_ROOT`: `tests/fixtures/factories/`.
- Goldens at `oracle/goldens/svg-factories/`.
- Tools at `plans/creole-math-factories-port/measurements/{pin-factories,repin-factories-routing,repin-factories-baseline,build-authored-baseline}.mts`.

**Write:** `oracle/goldens/svg-factories/**`, `tests/oracle/svg-conformance/{factories.golden.ratchet.test.ts,factories.diff-baseline.ratchet.test.ts,render-fixture-factories.ts}`,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` (twin rows, `.claude/memory/new-corpus-tree-trips-two-gates.md`),
their count tests, `scripts/parity-dashboard-goldens.ts`, `tests/fixtures/factories/authored-baseline.json`.

Pin every conformant row (byte-identical to its oracle after normalisation), and record `diff-baseline.json` for the rest (every math and latex
row stays at its KaTeX-glyph score; a `<math>` creole row at its residual). Diff the baseline JSON after each repin: any pin that rose is an
adopted regression (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).

## Acceptance
- Given `npx jiti ...measurements/pin-factories.mts`, then it prints `pins 0` after pinning.
- Given `npm test -- tests/oracle/svg-conformance/factories`, then both ratchets pass (read the count).
- Given `verdict-diff`, then 0 conformant rows lost.

Observability: N/A — no new observable operations. Rollback: Reversible.
