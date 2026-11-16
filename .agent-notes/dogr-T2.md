## Observation: the oracle host's graphviz kerns labels; dot-engine's LUT does not
- **Context**: dogr T2, diagnosing `dot/quoted-labels` and `dot/skinparam-font-color` (node `a`, `Node A`, `rx` 40.09 vs the jar's 39.58).
- **Finding**: Native graphviz 16.1.0 here measures through pango (`dot -v`: `Times-Roman resolved to: (ps:pango Times New Roman, REGULAR) (PangoCairoCoreTextFont)`), and pango applies the font's kern pairs. dot-engine's `LutTextMeasurer` (2.12.0, `src/common/textmeasure.ts:292-296`) stores per-glyph advances quantized to the 96 dpi grid, with no kerning. Probe widths at Times 14 (native/LUT): ` A` 12.75/13.5, ` V` 12.75/13.5, `AV` 18/19.5, but ` X` 13.5/13.5 and ` B` 12.75/12.75. The delta appears exactly at kern pairs. Native `dot -Tsvg` on our parser's DOT text is byte-identical to the jar oracle apart from comments, so our DOT is the jar's.
- **Impact**: Any `@startdot` label containing a Times New Roman kern pair (space+A, space+V, AV, ...) will be 0.75 pt per pair wider in ours. Filed as #186 (needs-ruling). Do not "fix" with a per-label table (fitting). graphviz's own `estimate_textspan_size` is not an alternative: it gives `Node A` 43.93, further off.
- **Confidence**: High

## Observation: isolating graphviz's estimate path needs a GVBINDIR with only core + dot_layout
- **Context**: Comparing native pango widths with graphviz's built-in estimate.
- **Finding**: `GVBINDIR=<dir with symlinks to libgvplugin_core.8.dylib and libgvplugin_dot_layout.8.dylib from /opt/homebrew/Cellar/graphviz/16.1.0/lib/graphviz>` makes `dot -v` report `resolved to: [internal hard-coded]`, so `textspan_size` falls back to `estimate_textspan_size` (`lib/common/textspan.c:91-92`). `dot -Txdot` exposes the text width as the 5th field of `T x y j w n -text`.
- **Impact**: A reusable way to separate host-font effects from graphviz layout in any dot-engine comparison.
- **Confidence**: High
