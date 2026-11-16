## Observation: json/yaml cells run inline creole even though the mode is NO_CREOLE
- **Context**: cogr T4e (juxugu-89-beki062, mocatu-19-jivi646).
- **Finding**: `TextBlockJson.java:345-347` passes `CreoleMode.NO_CREOLE`, which only skips whole-line classes (`CreoleStripeSimpleParser.java:86-90`); `StripeSimple.java:112-115` still scans with the `OTHER` command map, so `<color>`, `<b>`, `""x""` in a cell are consumed. `json-cell-creole.ts` takes runs from `creoleTextLines` only for a cell with an effective tag; size changes, links, images, bullets and tabs stay on the plain path (row height / extra elements not drawn).
- **Impact**: any json/yaml/hcl row with a size-tagged or linked cell is still wrong; `creoleTextLines`'s `baseColor` option uses marker `#01020304` for "untagged".
- **Confidence**: High (mocatu, juxugu oracles zero diff).

## Observation: an embed's nested renderSync leaves its own renderer registered
- **Context**: cogr T4f (moxeku-98-gufi234).
- **Finding**: `prepareBlock` re-registers the nested-embed renderer with the CURRENT diagram's skinparams on every `renderSync`, including the nested one, so the next embed of the enclosing diagram inherited the previous embed's skinparams. `guardedRender` now restores the enclosing registration.
- **Impact**: other embed hosts (state, activity chrome) share the slot; a `{{ }}` after one with its own skinparam was wrong before.
- **Confidence**: High.

## Observation: the jar does not preprocess an embedded `{{ }}` source
- **Context**: cogr T4f (nacave-78-dijo807, subdiagram-theme-1).
- **Finding**: `EmbeddedDiagram.java:87-92` -> `BlockUml(definitions=null)` skips TIM (`BlockUml.java:158-160`), so `!theme` inside a one-line `\n` note embed is a syntax error and the jar draws a PSystemError page. Directive lines on their own source line are consumed by the OUTER preprocessor, which is why multi-line bodies (vanadi) still work.
- **Impact**: our nested render preprocesses; mirroring needs a no-TIM nested path plus the jar's error banner text.
- **Confidence**: High (jar probes `/tmp/t4f` variants a-e).
