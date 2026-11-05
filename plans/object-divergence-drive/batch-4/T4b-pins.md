# T4b — Pin every conformant row in the `svg-object` ratchet

**Today:** 35 pinned of 65 conformant. `pin-object.mts` dry run: `pins 30`, `robitu-34-vupe367` among them, all 0 diffs.

**Do, per D9, in this order:**

1. `tests/oracle/svg-conformance/object.golden.ratchet.test.ts`: move all three ACs from `renderFixtureClass` to `renderClassFixture(markup, new DeterministicMeasurer(), censusClassFixtureOptions())`, with `await prepareElkOnce()` in a `beforeAll`, the way `class.golden.ratchet.test.ts:193-209` does. Run it: the existing 35 must stay green before any pin is added. A pin that fails under the new render is a finding, not a reason to revert.
2. AC3: accept `isElkRow(entry, source)` beside `dotEqual === true`, reading the source from the golden's `in.puml`. Add the positive and the negative case, as `class.golden.ratchet.test.ts:291` does.
3. `npm run svg:survey -- object --out /tmp/odd-T4b/parity-object.json`, then copy it over `tests/oracle/svg-conformance/parity-object.json`: AC3 and the tool read the committed file.
4. `npx jiti plans/object-divergence-drive/measurements/pin-object.mts`, read every `hold`, then rerun it with `--write`.
5. Update `oracle/goldens/svg-object/README.md`'s current state and Add rule. The doc comment at the top of the test still says "reuses `renderFixtureClass` VERBATIM": rewrite it.

## Acceptance
- Given the ratchet, when `npm test` runs, then it collects every manifest slug and passes.
- Given `parity-object.json`, then every conformant slug is in `ratchet.json`, or the journal names why not.
- Given `routing-baseline.json` and `refusal-baseline.json`, then each new pin has a `goldens` twin, and their gates pass.

Observability N/A. Rollback Reversible.
