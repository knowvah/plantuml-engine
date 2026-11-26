## Observation: a module-level style-builder handle is overwritten by a `{{ }}` embed of the same engine
- **Context**: cuts planning experiment (#195), reading `services.styleBuilder` in the class renderer through a module variable set in `layoutSync`.
- **Finding**: a note's `{{ class X }}` embed re-enters the class plugin's `layoutSync`, which replaced the outer diagram's builder with the embed's. The outer leaf then drew the embed's `skinparam componentBorderColor teal` (corpus `razefo-71-pice114`: conformant → diverged). The same embed with a description-engine body did not leak, and `preprocess()` on the outer source lists no skinparam, which rules out the style seam.
- **Impact**: any per-render state an engine needs at draw time must be stamped on its AST/geometry inside `layoutSync`, never kept in module scope; nested renders of the same plugin share module scope.
- **Confidence**: High

## Observation: class-diagram descriptive leaves refuse a name:value colour in the jar
- **Context**: authoring a `usecase U #line:blue` probe for #195.
- **Finding**: `CommandCreateElementFull2.java:289-292` passes the `COLOR` capture to the throwing `getColor`, so the jar reports `No such color` for `#line:blue`, `#line.dashed`, `#pink;line:blue` and `##blue` on usecase/actor/component in a class diagram; bare `#pink` draws. The port draws all of them.
- **Impact**: the inline `line`/`lineStyle` tiers in `renderer-usymbol-entity-style.ts` cannot be reached from this command in the jar; filed at the cuts exit.
- **Confidence**: High
