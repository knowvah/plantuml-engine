# Re-pin to a720bdd, agent "misc" (License, unclosed style, class generic, files background)

## Observation: the activity engine's syntax refusal ties with sequence's one line early
- **Context**: probing an unclosed `<style>` in `@startuml\n:a;\n<style>...`, and the plain `@startuml\n:a;\nfoo bar baz\n@enduml`.
- **Finding**: the jar reports both at line 3, `(Assumed diagram type: activity)`. Ours reports line 2, `sequence`. `node-dispatch.ts#dispatchLine` refuses with `consumed = idx` (the lines before), while sequence's refusal at `:a;` also scores `consumed = 1`. The scores tie, so the earlier-registered sequence wins. Upstream's trace for activity includes the refused line (`it.next()` before `it.getTrace()`).
- **Impact**: every activity syntax error after the first body line is attributed to sequence. This was there before the re-pin and is not fixed.
- **Confidence**: High (jar render plus our render; the consumed values were read off `parseActivity`)

## Observation: the chart cov-err-style message needs RawStyleParser
- **Context**: upstream 96380842043 (style error line attribution) for chart `cov-err-style` (`foo { { }`).
- **Finding**: the jar's "Error in style definition: Unexpected character '{'" at line 3 comes from `RawStyleParser.java:148`, which arrived with the parser rewrite in c9d62097ff5. Our `StyleParser` is the old tokenizer, which says "Invalid open bracket". `StyleParsingException#getLine` and `CommandExecutionResult.errorAt` count lines inside RawStyleParser, so neither can be ported onto the old parser faithfully.
- **Impact**: the line attribution of style errors, the numeric checks (`checkNumericValue`) and the boolean `Shadowing` handling in 96380842043 all wait on a RawStyleParser port.
- **Confidence**: High

## Observation: an unclosed `<style>` used to be swallowed by the preprocessor collector
- **Context**: porting `getSyntaxErrorMessage`.
- **Finding**: `StyleAndSkinparamCollector` hoisted an unclosed block and every line after it. Most engines then drew "Empty description", and class, sequence and others silently dropped the rest of the diagram. The jar refuses the `<style>` line, or lets an engine whose commands take it (board, regex) do so. The collector now collects in two passes (`collectStylesAndSkinparams`). Salt with an unclosed style is still wrong (jar draws, ours raises IllegalArgumentException at the last line). `@startpacket` is "unknown diagram type" in ours.
- **Impact**: the timing (`TimingDiagramFactory.ts`), state (`state/parser.ts`) and chart (`ChartDiagramFactory.ts`) refusal sites still say "Syntax Error?" and should call `syntaxErrorMessageOf(lines[i]!)`.
- **Confidence**: High (25 probe sources rendered by jar and port)

## Observation: class golden eligibility fails on mugobo-34-fede498
- **Context**: running `class.golden.ratchet.test.ts` after the generic-box fix.
- **Finding**: "manifest entry is neither DOT-EQUAL nor an oracle-blind ELK row" for `class/mugobo-34-fede498`, which has no generic and no stereotype. The test reads manifest data, not our render.
- **Impact**: not caused by these ports. It is likely a re-pin manifest issue.
- **Confidence**: Medium
