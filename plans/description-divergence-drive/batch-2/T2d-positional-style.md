# T2d — positional `<style>`

Commit: `fix(description): style an entity with the builder current at its line`.

## Context
`Entity#getCurrentStyleBuilder` (`abel/Entity.java:755-768`):

```java
if (diagram.isSkinParamUsed())
    return getSkinParam().getCurrentStyleBuilder();
return currentStyleBuilder;
```

An entity keeps the builder current when it was created, unless the diagram used `skinparam` anywhere. Then the last one wins. `pofali-42` shows it: `<style> .a {pink}`, `card red <<a>>`, `<style> .a {palegreen}`, `card green <<a>>`, and the jar paints `red` `#FFC0CB` where we paint `#98FB98`.

`Link.java` has its own builder (`link.getStyleBuilder()`, used by `CommandFactoryNoteOnLink`): arrow styles `cudazo-20`, `minulo-12` take that one. Read how `SvekEdge.java:816-821` reaches it.

The preprocessor collapses `<style>` into `pre.styles` (`.agent-notes/dss-T3d.md`: "positional in activity, a bucket is not"), so the seam needs each entity's position. Read how the activity engine holds it first (`ActivityDiagram3.java:398`; `core/preprocessor.ts`). Find `isSkinParamUsed` in the Java and mirror what sets it.

## Rows
`pofali-42`, `sakare-67`, `cudazo-20`, `minulo-12`.

## Acceptance
- Given `pofali-42`, when rendered, then `red` is `#FFC0CB` and `green` is `#98FB98`.
- Given a source with `skinparam` anywhere and two `<style>` blocks, then the last builder applies (authored fixture, jar oracle).

Observability: N/A — no new observable operations. Rollback: Reversible.
