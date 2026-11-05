## Observation: wbs, mindmap, salt and gantt read handwritten from the skin param only
- **Context**: cep T4d probed `!option handwritten true` on chart and found the jar draws by hand where the port did not.
- **Finding**: `TitledDiagram.java:114-118` falls through to `UgDiagram.java:117-121`, which reads the option. The `isHandwritten` in `wbs/index.ts`, `salt/index.ts`, `gantt/index.ts` (and mindmap's) reads only `getValue('handwritten')`, and each parse builds a fresh `PreprocessingArtifact`. Chart now passes `source.styleSource.options` through (`chart/index.ts#preprocessingArtifactOf`). The other engines were read, not probed against the jar.
- **Impact**: `!option handwritten true` is likely ignored on those four engines. `styleSource` now carries `options`, so the fix per engine is small.
- **Confidence**: Medium (read the code; no jar probe on those four)

## Observation: the lengthadjust baseline tool loosens hand-tightened rows
- **Context**: cep T4a ran `build-authored-baseline.mts --write` to shrink the chart rows.
- **Finding**: It also rewrote `files-*` from `textLength: exact` to `baseline` with a stale reason, because its classifier does not know ddc's later fix. Their scores did not move, so a score-only review misses it.
- **Impact**: Patch rows by hand, or diff every field after `--write`.
- **Confidence**: High

## Observation: creole text spaces are NBSP
- **Context**: A warning-banner assertion failed against text that looked identical.
- **Finding**: Spaces inside some rendered `<text>` are U+00A0, in the jar and the port alike.
- **Impact**: Match rendered text with `\s` in a JS regex, not a literal space.
- **Confidence**: High
