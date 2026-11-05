# T3c — Authored probes past vega

**Read:** D4, the cep T4c-e fixture list (`ls tests/fixtures/chart | sed -n 's/^cov-\(.*\)\.puml$/\1/p'`) as a checklist of cross-cutting seams, `TitledDiagram.java`, `UgDiagram.java:117-131`.

**Author** `tests/fixtures/packet/cov-<topic>.puml`, each with its oracle from `scripts/oracle-render.sh`, at least one per topic:

- Chrome: `title`, `caption`, `legend`, `header`, `footer`, `mainframe`, all together, and each with `scale 2`.
- Style: `<style> packetdiagDiagram { FontSize 20 }` (moves `bitWidth` through `adjustBitWidth`), `rectangle { BackGroundColor; LineColor; LineThickness; RoundCorner; Shadowing; FontColor }`, a `<style>` on `root` and on `element`.
- Skin and themes: `skin rose` past vega's two, `!theme` on two stdlib themes, `skinparam monochrome true`, `skinparam handwritten true`, `!option handwritten`, `skinparam backgroundColor` (the `document-background` pair already covers black and gradient).
- Labels: creole bold and colour, `\n`, a long label cut to `...` at widths 1, 2 and 8, an emoji, a sprite reference, an empty description.
- Embedding: `{{packetdiag ... }}` inside a note of a sequence or class diagram (`core/EmbeddedDiagram.ts:296`).
- Errors and edges: an unknown line, an unclosed `{`, a range start beyond 9999999, `colwidth = 999`, an RTL `same_height` grid.

Fix what the probes expose, Java first. Under `!option handwritten`, cep journal row 13 records the fix through `TitledDiagram.java:114-118`: confirm packet reaches it.

## Acceptance
- Given `probe-dir` over `tests/fixtures/packet`, then every authored fixture where the jar draws is at 0 diffs, or journaled with its D7 end; every jar error is an error in ours.
- Given the batch close's all-engine `verdict-diff`, then lost is 0, and a shared-seam fix names any other bucket it moved.

Observability N/A. Rollback Reversible.
