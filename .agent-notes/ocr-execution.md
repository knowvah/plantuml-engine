## Observation: `npm run svg:survey` stalls into clustered `timeout` verdicts under external load
- **Context**: ocr batch 2 close, load 20–80 from other projects' processes (elk-engine-queue vitest, dot-engine, spore probes).
- **Finding**: with the default 60s per-fixture timeout and concurrency 6, 98 conformant rows came back `timeout` in alphabetical runs (a stalled worker), and the full run exceeded a 40-min background limit. Re-running with `SVG_PARITY_TIMEOUT_MS=240000 SVG_PARITY_CONCURRENCY=4` (`scripts/svg-parity-survey.ts:132-133`) gave 0 timeouts and the same verdicts as the base.
- **Impact**: under load, start the survey with those two env vars and a 2h background timeout; a `conformant -> timeout` verdict-diff line is not a loss until rerun.
- **Confidence**: High

## Observation: error pages list the raw source, including preprocessor-stripped lines
- **Context**: ocr T3, a `'` comment inside a refused json block.
- **Finding**: `errorSvg` builds its listing from `readLines(source)` (`src/core/error/error-diagrams.ts:127-135`), so a stripped comment line appears on our page and not the jar's (14px taller). The refusal's own line is right (document positions). Filed #287.
- **Impact**: any error-row probe with a comment before the refused line carries extra height diffs until #287 lands.
- **Confidence**: High

## Observation: an 8-digit `#00000000` fill is written as `#000` + `fill-opacity="0"`, not `none`
- **Context**: ocr exit, D6 `#transparent` control.
- **Finding**: `fillAttrsOf` (`src/core/svg-shapes.ts:56-63`) splits every 8-digit hex; upstream `fixColor` maps exactly `#00000000` to `none` first (`SvgGraphics.java:527`). `isTransparentColor` (`src/core/paint.ts:131-135`) does not strip `#`, so `#transparent` answers false. Filed #289.
- **Impact**: every `#transparent`/`#background` declaration colour differs by 2 attributes.
- **Confidence**: Medium (the emitting call path for the class body rect was not traced end to end)

## Observation: state and class each draw json leaves with their own copy, and only class's handles nested values
- **Context**: ocr T3b, state's accepted nested json now reaches the renderer.
- **Finding**: `state-json-sizing.ts` / `state-sizing.ts:483` vs `class-json-sizing.ts`; the same nested block is 0 diffs in class, 15 in state. Filed #288.
- **Impact**: nested json in state diagrams stays off the jar until #288.
- **Confidence**: High

## Observation: `state-json-commands.ts` header claims "zero raw double-quote glyphs" but already contains several
- **Context**: ocr T3 edit.
- **Finding**: the claim (lizard desync guard) is stale; lines ~100-113 carry `"` in comments, and the complexity hook passed.
- **Impact**: the claim need not constrain edits; a cleanup can drop it.
- **Confidence**: High
