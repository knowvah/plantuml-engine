## Observation: `end <<#c>>` colours nothing
- **Context**: authoring the `end-colour` oracle for ubt-T1a.
- **Finding**: `FtileCircleEndCross.java:79-80,105-114` reads BACK into `backColor` but the ring and both cross lines draw with `lineColor`; the oracle SVG is byte-identical to a bare `end`. We parse it (AST `color`) and draw nothing.
- **Impact**: do not look for an `end` fill; `<<##c>>` (LINE) would colour it and stays unported.
- **Confidence**: High

## Observation: endif colour reaches only the closing diamond of down/with-links ifs
- **Context**: oracles `elseif-colour`, `elseif-inherits-if`, `if-down-colours`.
- **Finding**: with an `elseif` (`thens.size() > 1`) there is no closing diamond to colour (`FtileIfLongHorizontal`), and long-vertical's `lastDiamond` uses the `if` colour (`FtileIfLongVertical.java:168`); `endif <<#c>>` is read and unused. When `createDown` swaps branches the closing diamond takes the `if` colour (`ConditionalBuilder.java:157-173,300`). A one-`case` switch paints BOTH diamonds with `endswitch`'s colour (`InstructionSwitch.java:179-183`, `FtileFactoryDelegatorSwitch.java:137-139,155-157`).
- **Impact**: `layout/diamond-colors.ts` encodes each; oracles pin them.
- **Confidence**: High (jar oracles)

## Observation: parser gaps closed move activity ratchet pins
- **Context**: `start`/`stop`/`end` and `while`/`repeat while` accepted a stereogroup for the first time.
- **Finding**: dadelu-44, gigefo-15, tusaxu-17 (recorded `error`) now render (5/1/2 diffs); gexufa-76, totave-53 text census 2 -> 5 (the jar's 5); cajodu-78 census moved and conformant. Activity ratchets are red until the orchestrator's one re-pin (`scripts/repin-activity-baselines.ts`, orchestrator-only).
- **Impact**: re-pin at close; diff the baseline JSON for any score that ROSE.
- **Confidence**: High

## Observation: repeat inline terminator took one stereogroup only
- **Context**: `repeat :x; <<#c>> <<input>>` put the groups in the label.
- **Finding**: `RE_REPEAT_INLINE_TERMINATOR` allowed one `<<..>>`; `Stereogroup.optionalStereogroup()` takes several. Widened.
- **Confidence**: High
