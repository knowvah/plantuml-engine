# T1a: the colour-validity gates

**Writes:** `tests/helpers/svg-colour-validity.ts` + `.test.ts` (Create);
`tests/oracle/svg-conformance/refusal-coverage-gate.ts`, `refusal-coverage.test.ts` (Modify);
`tests/fixtures/unresolved-colour/` (Create, by `git mv` from `measurements/probes/`);
`tests/oracle/svg-conformance/unresolved-colour.authored.test.ts` (Create);
`plans/unresolved-colour/measurements/measure-colours.mts` (import the helper instead of its own copy).

**Reads:** `edge-label-embed.authored.test.ts` (the model), `refusal-coverage-gate.ts:180-225` (`measure`, `live`),
`corpus-gate-part.ts`.

## Steps

1. **Helper.** `invalidColours(svg)` returns the distinct `attr=value` strings whose value is not `#hex` (3, 4, 6 or 8
   digits), `none`, `black`, `white` or `url(#…)`, scanning `fill`, `stroke` and `stop-color` attributes (D3). Write
   the test first, with specific inputs and outputs: `fill="zzblue"` → `['fill=zzblue']`; `stroke="#line"` →
   `['stroke=#line']`; `fill="#ABCDEF80"`, `fill="url(#g1)"`, `fill="none"` → `[]`. Also check what the cached oracles
   carry inside `style="stroke:…"`: if the jar emits a colour there, scan it too and say so in the doc comment.
2. **Every-row assertion.** Add `invalidColours: readonly string[]` to `LiveRefusal`, filled from the `ours` that
   `measure` already renders (no second render). Add a pure `checkNoInvalidColour(key, now, allow)` beside the other
   checks, with branch tests on fabricated inputs in `refusal-coverage.test.ts`. The allowlist starts empty, and every
   entry must name an issue (`#N`). Each `refusal-coverage.part-N.test.ts` asserts it through `defineRefusalGatePart`.
   - If a fixture fails here at T1a, it is a row the planning scan missed: the gate's wiring has the include store and
     jar-compatible input, the scan did not. Measure it. If the jar draws, the row is in scope: add it to the README
     table and the right batch. If the jar errors, file an issue, add the allowlist entry, and journal it.
   - The gate file is at 472 lines. If the change would pass 500, move the pure check into its own module first.
3. **Authored gate.** `git mv` the 27 in-scope probes (the README table plus the 10 zero guards) and their `jar/*.svg`
   to `tests/fixtures/unresolved-colour/`. Leave the 6 out-of-scope probes in `measurements/probes/`. Write the gate
   per D5: `ZERO` lists the 10 guards; `OPEN` lists the 17 with `maxDiffs` from the README table, `invalid: true`, and
   a `reason` of `#145 T2a` (or `T2b`, `T2c`, `T3a`, `T3b`, the task that owns the row).
4. **Measure** both modes. The probe counts must be unchanged: the same 33 rows, now read from two directories.

## Acceptance
- Given `fill="zzblue"`, when `invalidColours` runs, then it returns `['fill=zzblue']`; given `fill="#FFF"`, it returns
  `[]`.
- Given the base `src/`, when the refusal gate runs, then every part passes with an empty allowlist (or each entry
  names an issue the journal records).
- Given the 27 fixtures, when the authored gate runs, then the 10 `ZERO` rows are at 0 diffs with no invalid colour,
  and each of the 17 `OPEN` rows is at or under its `maxDiffs`.
- Given a fixture whose `.svg` is missing, when the manifest-shape test runs, then it fails and names the row.
