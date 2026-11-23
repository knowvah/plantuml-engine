## Observation: an issue's ruling can be overtaken by an upstream re-pin
- **Context**: Planning #185 (embedded-diagram-preprocess). The ruling (2026-11-16) said to record two rows as an accepted divergence, and to re-measure once upstream shipped the fix.
- **Finding**: Upstream `58b9b3d53ee` (#3016) is in the oracle pin `a720bdd` (re-pinned 2026-11-19, `oracle/pin.json` `previousPin.why`). The survey already has both rows conformant. The committed `census-class.json` is from 2026-11-10 and still says `diffCount: 42`, so a reader who trusts the census would plan the obsolete divergence.
- **Impact**: Before planning a ruled divergence, check `oracle/pin.json`'s `previousPin.why` and the latest `parity-<type>.json` verdict. The ledger gate (`emitter.golden.test.ts:132`) refuses an entry for a survey-conformant row.
- **Confidence**: High

## Observation: an embed's lines are labelled "block" upstream, "string" here
- **Context**: Comparing decoded nested payloads for a one-line embed with a bad directive.
- **Finding**: `EmbeddedDiagram.from` → `BlockUml.convert` → `new LineLocationImpl("block", null)` (`BlockUml.java:119-127`), so the jar's embedded error page prints `[From block (line 2) ]`. The port's nested `renderSync` prints `[From string (line 2) ]` (`ReadLineReader.ts:37`). `compareSvg` skips `data:` hrefs (`compare.ts:374`), so no survey can see it.
- **Impact**: Addressed by edp T1c. Any embed-content check has to decode the payload itself.
- **Confidence**: High (jar probe through `scripts/oracle-render.sh`, a720bdd)

## Observation: 41 files cite `EmbeddedDiagram.java:N` lines from older pins
- **Context**: Planning #185. Re-pins moved the file: #3016 alone inserted 29 lines after line 88.
- **Finding**: `git grep -l "EmbeddedDiagram.java:[0-9]" -- src tests` lists 41 files, for example `src/index.ts:320` (`:88-90`, now the constructor is at 89-103) and `src/core/EmbeddedDiagram.ts` (`from` at `:117-119`, now 146-147; `getEmbeddedType` at `:257-366`, now 294+).
- **Impact**: The citations point at the wrong lines. A dedicated re-citation PR is needed; edp fixes only the files it edits.
- **Confidence**: High

## Observation: embedded error-page probes need the capture clock
- **Context**: Rendering an error-page probe without an injected clock.
- **Finding**: The jar's error page drew a 92 px clock-dependent banner block at the top (date-selected banners, DIVERGENCES.md "The error diagram's clock-selected banners are not drawn"), which ours does not. A probe that doesn't set the clock measures the date, not the port.
- **Impact**: Render both sides on `oracle/capture-clock.json`'s clock, or compare only the lines being tested.
- **Confidence**: Medium (the mechanism is inferred from the DIVERGENCES entry; the 92 px offset was measured)
