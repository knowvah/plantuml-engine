# ftp-T3

## Observation: the factories authored gate did not know the jar's crash-report page
- **Context**: Pinning Crash fixtures whose jar oracle is the ReportLog page (`An error has occurred : …`, no `[From … (line N) ]`).
- **Finding**: `factories.diff-baseline.ratchet.test.ts` matched only `[From` as a jar error, so "we error exactly where the jar errors" failed for those rows. The bpm gate already records them as `jarError: { line: null, message }`; the factories gate now does the same.
- **Impact**: Any other family adopting authored fixtures with crash pages needs the same `JAR_ERROR_HEADER` alternation and the `line: null` skip.
- **Confidence**: High

## Observation: lsp's repin-factories-baseline re-stamps every unpinned row
- **Context**: Adding 4 rows to `oracle/goldens/svg-factories/diff-baseline.json`.
- **Finding**: The copied tool rewrote `measuredAt`/`measuredAgainstCommit` on every unpinned row. ftp's copy keeps a row whose score and diff count did not move (build-authored-baseline's rule), so the diff is only the new rows.
- **Impact**: Use `plans/factories-tail-port/measurements/repin-factories-baseline.mts` for the next factories re-pin.
- **Confidence**: High
