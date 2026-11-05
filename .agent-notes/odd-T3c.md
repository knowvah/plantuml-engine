## Observation: `EntityImageState2` reads the diagram's style name, a plain state leaf does not
- **Context**: odd T3c, `state A <<sdlreceive>>` under `allow_mixing`.
- **Finding**: `EntityImageState` signs `stateDiagram, state`, corner 25; `EntityImageState2` signs `getStyleName()`, so `classDiagram`, corner 5, and it opens no `<g>`.
- **Impact**: the class engine calls the state draw through `class-state-leaf.ts`, whose theme overlay carries the corner it read. A layering allowlist entry holds the class-to-state import.
- **Confidence**: High
