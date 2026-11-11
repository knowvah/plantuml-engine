## Observation: TimingChrome needed isHandwritten
- **Context**: first renderSync of a timing diagram produced a crash page "diagram.isHandwritten is not a function".
- **Finding**: `TitledDiagram.java:114-118` isHandwritten is held by NwDiagram/PSystemRegex themselves; the port's TitledDiagram lacks it. Added to `TimingChrome` (TimingDiagram.ts stays at 500 lines).
- **Impact**: the plugin's render path calls `diagram.isHandwritten()`; any new klimt diagram class must supply it.
- **Confidence**: High

## Observation: full-SVG parity of six probes after registration
- **Context**: comparing renderSync output with /tmp/tdp-plan/oracle for cov-concise-basic, chrome-all, mode-dark, scale-2, skinparam, style.
- **Finding**: all six compareSvg 0 diffs through the plugin; no chrome fix was needed. `measurements/probe-diffs.mts` reproduces it.
- **Impact**: plugin chrome (back colour, scale, header/footer, warnings) is conformant on these; remaining diffs are drawing mechanisms for T4c/T4d.
- **Confidence**: High

## Observation: lamera-74-sago807 error body differs before and after registration
- **Context**: D8 check of the six jar-error rows.
- **Finding**: five rows match the jar's error-page body lines; `lamera-74-sago807` prints an extra `concise "identificatin-app" as idapp` source line (jar stops at `scale 100 as 0 pixels`, line 3). The output is identical with the plugin unregistered (git stash check), so registration did not cause it.
- **Impact**: not a T4a regression; the survey verdict-diff decides whether the row was conformant before.
- **Confidence**: Medium
