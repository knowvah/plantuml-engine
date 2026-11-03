# Document background selector scope

## Observation: resolveDocumentBackground ignores the diagram type
- **Context**: Checking `sequenceDiagram { document { BackgroundColor } }` against the jar (64 scratch renders via `oracle-render.sh`, 14 engines x 4 selector forms + 8 sequence variants).
- **Finding**: Upstream matches `StyleSignatureBasic.of(root, document, getDiagramType().getStyleName())` (`TitledDiagram.java:280-282`, `DiagramType.java:234-285`). Ours scans one flat list for every engine (`style-map-element.ts:462-469,482-489`). Results: sequence's own selector ignored; a foreign selector (`classDiagram { document }` on sequence) applied; `document { <x>Diagram { } }` ignored; `jsonDiagram`/`yamlDiagram { BackgroundColor }` ignored; `objectDiagram` and `usecaseDiagram` honoured where the jar ignores them (those render as CLASS and DESCRIPTION, and DESCRIPTION maps to `componentDiagram`). mindmap, wbs, gantt, salt: 0 diffs in all four forms.
- **Impact**: No surveyed corpus row of a ported engine depends on it; fixing it needs authored rows, the survey won't show it.
- **Confidence**: High for the jar output and the Java; `zojoja-28-geta515` had no survey verdict, so it is unchecked.
