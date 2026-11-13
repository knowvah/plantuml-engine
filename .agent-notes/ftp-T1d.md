# ftp-T1d

## Observation: PSystemBuilder's catch unmasks class/state ProtectedCommand gaps
- **Context**: Porting `PSystemBuilder.java:274-281` (catch a throwing factory, add a "Fatal crash error", go on to the next factory) into `dispatcher.ts#attempt`.
- **Finding**: The class engine runs commands without `ProtectedCommand`; `j : y` on a JSON entity throws `UnsupportedOperationException` out of `parse` (`src/diagrams/class/class-map-commands.ts:358`, via `parser.ts:276 dispatchCommand`). Upstream catches it inside the command and returns an execution error. The state engine never throws where `BodierJSon#addFieldOrMethod` does (`BodierJSon.java:94-96`), so it parses the same source. Without the catch the class throw aborts dispatch and lands on the jar's line by luck; with it, state wins (`tests/fixtures/odd-T4a/n-i`) or the page names the wrong line (`colon-add`).
- **Impact**: Re-landing the catch needs `ProtectedCommand` in the class and state dispatchers first. Any engine whose command throws instead of returning an error is a latent misroute once the catch exists; instrument candidates with a per-plugin parse loop (see the ftp journal row 7).
- **Confidence**: High

## Observation: the survey misses throw-path differences
- **Context**: Batch 1 close with T1d in place.
- **Finding**: `npm run svg:survey` + `verdict-diff` showed 0 lost, but `tests/unit/class/odd-t4a-probes.test.ts` (authored error-page probes) failed. The survey covers corpus rows; authored fixtures live in per-family tests.
- **Impact**: A dispatcher-level change needs the full `npm test`, not only the survey, before it is judged loss-free.
- **Confidence**: High
