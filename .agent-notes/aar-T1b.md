# aar-T1b — activity3 parser gaps (issue #121 item 12)

## Observation: "Assumed diagram type: class" hid activity3 parser refusals
- **Context**: T1a planned a skinparam-block routing fix for kizofi-56, fuficu-36, nabako-16, zugoco-10.
- **Finding**: The preprocessor hoists `skinparam X { Key<<st>> v }` and `/' '/` lines correctly. Activity3 refused a LATER line (`repeat:B;`, `#green:` long activity, `floating note: `), class refused earlier, and the dispatcher's refusal merge named class. Probe: preprocess, then `activityPlugin.parse` and read `refusal.line`.
- **Impact**: An error page naming class is no evidence of a routing defect. Probe each candidate's refusal line before touching the router or the skinparam collector.
- **Confidence**: High

## Observation: a lenient head regex broke a conformant error page
- **Context**: Adding `ColorParser.exp4` to `RE_REPEAT_HEAD` while keeping its old `\s+(.*)` arm.
- **Finding**: `unknown/zicejo-69` (`#red:repeat` / `#blue:repeat while (ok)`) went conformant → diverged: the lenient arm opened a nested repeat on `#blue:repeat while (ok)`, so we drew where the jar errors. Mirroring `CommandRepeat3`'s regex exactly (rest = optional `:LABEL;` + optional stereogroup) restored it.
- **Impact**: When widening a dispatch regex, mirror upstream's whole regex, not one leaf: leniency the old regex never exercised surfaces once a new prefix reaches it. The unknown survey is the place this shows.
- **Confidence**: High

## Observation: `FtileDiamondInside2` ignores conditionStyle
- **Context**: nabako-16 residual after it parsed.
- **Finding**: `FtileDiamondInside2#drawU` always draws `Hexagon.asPolygon` (`FtileDiamondInside2.java:84`); our long-horizontal/vertical walkers left `diamondShape` unset, so `renderIfSplitShape` used `conditionStyle diamond`'s square.
- **Impact**: Every elseif/vertical-if diamond under `conditionStyle diamond`/`InsideDiamond` was a 4-point rhombus where the jar draws a hexagon.
- **Confidence**: High

## Observation: stale routing/refusal pins are logged, never failed
- **Context**: `pin-goldens.mts` refused rows whose twin was still `known-misroute`/`known-gap`.
- **Finding**: The routing/refusal gates only log `[FIXED] ... pin is STALE`. `plans/activity-authored-rows/measurements/flip-twins.mjs` re-pins named rows; then six count constants (`activity.{style,text}-baseline`, `routing-conformance`, `refusal-coverage`) move. Unrelated stale `[FIXED]` lines from earlier missions (unknown/FILES rows, c4 favasu/xizifu) are still in the log.
- **Impact**: Each parser fix that makes an errored row render needs flip-twins before pinning.
- **Confidence**: High
