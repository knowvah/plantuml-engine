# aar-T6a — observations (2026-11-06)

## Observation: the activity gates rendered without the survey's asset store
- **Context**: pin-goldens refused dejuko-37 (`<:link:>` emoji), which the survey called conformant.
- **Finding**: the golden ratchet, the diff/style/text/swimlane baselines, `pin-goldens.mts` and `repin-activity-baselines.ts` called `renderFixtureActivity` with only an include store; the survey uses sprites + emoji + utility (`SURVEY_ASSET_STORE`). Now all use `activityRatchetOptions()` (`tests/oracle/svg-conformance/render-fixture-activity.ts`). dovoda-34 had been conformant since b0 and unpinnable for the same reason.
- **Impact**: any new activity gate must render through `activityRatchetOptions()`, or emoji/sprite rows diverge between the survey and the ratchet.
- **Confidence**: High

## Observation: the activity harness duplicates `activityPlugin` composition
- **Context**: group 2 added `withActivityDocumentArrow` in `src/diagrams/activity/index.ts`; pin-goldens then refused jigocu-99.
- **Finding**: `render-fixture-activity.ts` re-implements `layoutSync`/`render`; a theme wrapper added to the plugin must be added there too.
- **Impact**: after any change to `activity/index.ts`, diff the harness.
- **Confidence**: High

## Observation: census-away compared width/height as digit maps
- **Context**: re-pin after group 2 flagged lidumi-54 height "8 -> 10".
- **Finding**: `style-baseline.json` pins `width`/`height` as strings; `distance()` iterated `Object.keys("1006")`. Fixed to compare numeric strings as numbers (`plans/activity-authored-rows/measurements/census-away.mjs`).
- **Impact**: earlier "away" reports on width/height were unreliable.
- **Confidence**: High

## Observation: detach/kill are not instructions in the jar's list model
- **Context**: botuge-46, zuseke-31, nuluji-89.
- **Finding**: `InstructionList.kill()` (`:169-174`) only marks the last instruction; a second `detach` adds nothing (`InstructionSimple.java:123-127`); `manageSpecialStopEndAfterEndWhile` runs only when `current()` is the root `InstructionList` (`ActivityDiagram3.java:178`).
- **Impact**: any "last instruction" lookup must skip kill/detach nodes and arrow labels.
- **Confidence**: High

## Observation: surveys time out under other sessions' load; the survey has a budget knob
- **Context**: every-engine survey at load 40-65 (a dot-engine test run and a worktree survey loop in other sessions).
- **Finding**: 26 timeouts (c4, regex, salt, sequence, wire) with the default 60 s; reruns alone still timed out at load ~58. `SVG_PARITY_TIMEOUT_MS=300000` (`scripts/svg-parity-survey.ts:132`) removed every timeout without changing verdict logic.
- **Impact**: under shared-machine load, rerun timed-out buckets with the knob before calling a loss.
- **Confidence**: High
