## Observation: class engine drops a bracket body element's line colour
- **Context**: authoring a jar fixture for `CommandCreateElementMultilines` in T5c.
- **Finding**: `node B #red|green;line.dashed;line:blue [ ... ]` with no description-only element routes CLASS in the jar and in the port. Ours keeps the gradient and loses `stroke:#00F` and the dash.
- **Impact**: a class-queue defect with no corpus row; description is unaffected once an `actor` routes it there.
- **Confidence**: High

## Observation: `skinparam padding` on a Display block is unported
- **Context**: authored probe `skinparam padding 4` in description, T5a.
- **Finding**: the jar draws 40 px taller (`Display` creole blocks read `getPadding`); ours ignores it. No in-scope row sets it.
- **Impact**: a named gap for a later mission, not a row of #113.
- **Confidence**: Medium: the reader was not traced past `SheetBlock1` callers.

## Observation: a `<color:x>` inside chrome text is not mapped under monochrome
- **Context**: chrome colours now pass `colorMapperOf` at `resolveAnnotationStyles`, T5b.
- **Finding**: only the style's colours are mapped; a creole colour inside a title stays as written, where the jar maps every draw.
- **Impact**: no row shows it. Moving the mapper to the chrome blocks' `UGraphic` would close it.
- **Confidence**: Medium: inferred from `TextBlockExporter.java:172-177`, not measured.
