# flp-T3b — flow fixtures

## Observation: fixtures.mts's error-pair test is stricter than the 2026-10-10 ruling
- **Context**: Running `plans/flow-engine-port/measurements/fixtures.mts` (adapted from bpm's) over 69 flow fixtures.
- **Finding**: `sameErrorPage` counts a pair only if the jar page is a ReportLog crash page or its body lines equal
  ours. Upstream turns a command's throw into an execution error (`ProtectedCommand.java:54-76`, "You should send a mail
  … java.lang.IllegalArgumentException"), which is neither, so 6 jar-error fixtures print nonzero diffs although both
  sides error. The ruling (jar errors + we error = conformant) and the authored baseline count them as pairs.
- **Impact**: Read a nonzero `fixtures.mts` row whose oracle has no `data-diagram-type` as a likely error pair before
  chasing it.
- **Confidence**: High

## Observation: short sources get the Welcome page wrapped around any error
- **Context**: `cov-link-unknown` crashed in the jar but drew "Welcome to PlantUML!".
- **Finding**: `PSystemError.java:218-219` adds the Welcome block whenever `getTotalLineCountLessThan5()`, for every error
  kind, so a crash page on a 3-line source looks like a Welcome page.
- **Impact**: A Welcome-looking oracle is not evidence of an empty diagram; read the red line under it.
- **Confidence**: High
