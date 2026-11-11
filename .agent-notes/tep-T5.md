## Observation: timing tools rendered without the capture clock
- **Context**: T5 dry run of `pin-timing.mts`.
- **Finding**: `timing/mekivo-95-xafe506` (a `use date format` row) held at 1 diff because the T4 tools called `renderFixtureTiming(markup)` with no clock; `timingClockFor(slug)` fixes it. Pin, diff-baseline and authored tools, and both ratchet tests, now pass `timingClockFor(slug)`. (The routing/refusal gates render without a clock; they read only the root type.)
- **Impact**: any new timing tool or test must pass the clock, or date-format rows show a spurious text diff.
- **Confidence**: High

## Observation: cov-empty is a zero-diff jar error pair
- **Context**: copying regex's diff-baseline test.
- **Finding**: `cov-empty` (no diagram) is a jar "Welcome to PlantUML!" page that we match at 0 diffs, so regex's "a zero row is no jar error" assertion fails for timing; the test now pins the zero-diff jar-error set to exactly `['cov-empty']`.
- **Impact**: a second zero-diff jar-error fixture needs the test updated deliberately.
- **Confidence**: High

## Observation: routing/refusal re-pin has no generic tool
- **Context**: step 4.
- **Finding**: `plans/timing-engine-port/measurements/repin-routing-refusal.mts` re-measures only the planning-rows dot-cache rows and their svg-timing twins with the gates' own render and helpers. Diffed against HEAD: only ourType NONE->TIMING, status known-misroute->agree (routing); weErrored true->false, status known-gap->ok, engine -> timing (refusal); `reason` removed on 152 rows. The 6 jar-error rows keep status; their informational engine moved (class -> timing x5, class -> sequence x1: lamera-74-sago807). No pin rose.
- **Impact**: reuse for later engine ports that need the same rewrite.
- **Confidence**: High
