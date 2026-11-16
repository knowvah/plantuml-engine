## Observation: the generation-count style thunk cannot answer "the builder at a line"
- **Context**: cogr T4h2 (sivoso-11-xabi195), class links made before a `<style>`/skinparam.
- **Finding**: `LayoutServices.styleBuilder(generation, positional)` counts only `<style>` blocks and keeps ALL skinparams in every generation, so description's `annotateLinkStyles` gives an early link the later skinparams (Verdana). Class needs `styleBuilderAt(position)` (`builderAtPosition`, which places each skinparam by document line) and stores `Relationship.arrowStyle` only where a declaration lies after the link.
- **Impact**: description links made before a skinparam still read the later skinparams (not measured, no row); the class path is position-exact. Label sizing in DOT (`resolveArrowLabelFont`) and the cardinality font still read the last theme for such a link.
- **Confidence**: High (sivoso oracle zero diff; Java `GraphvizImageBuilder.java:234-238`, `SvekEdge.java:874-876`).
