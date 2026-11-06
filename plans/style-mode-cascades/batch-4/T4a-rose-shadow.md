# T4a — `skin rose`'s shadow survives a `<style>` block

**State at planning:** `skin rose` plus a `<style>` that sets only `note { FontSize 12 }` loses the rose shadow. The
note `path` and the class `rect` have no `filter`, and the jar's `defs` holds one filter (`class__casc-control-rose` 1,
`component__casc-control-rose` 1, dss `class__d3-skin-rose-element` 1 and `component__probe-skin-rose` 1).
`activity__casc-control-rose` is 9: the start ellipse's filter, the `defs` child, and a height 6 px short, which is
the shadow's margin. Sequence is conformant under the same rows.

**Read:** `src/main/resources/skin/rose.skin` (its `Shadowing` entries); `StyleLoader.java` and `TitledDiagram#loadSkin`
(`:159-182`), for how a skin and a later `<style>` combine in one builder; `Style#getShadowing`; the element builders'
`getShadowing` reads in `EntityImageClass`, `EntityImageNote` and activity's circle tiles. Ours: where each engine
decides to emit a shadow filter, and what dss D3's gate writes under `preprocessed.skin`. Start from
`grep -rn "Shadowing" src/core src/diagrams`.

**Do:** per D7. Red with the control-rose rows' oracle values. Find why a `<style>` block takes the rose `Shadowing`
away, which is probably the gate writing a snapshot that drops it, and fix it at that origin. Then measure the four
`casc-shadow-*` rows per engine.

**Measure:** `rows.mts` prefixes `*__casc-control-rose`, `*__casc-shadow-`, `class__d3-skin-rose`,
`component__probe-skin-rose`; surveys of class, component, activity, and every bucket with a `skin rose` corpus
source (`grep -l "skin rose"` over `test-results/dot-cache/*/*/in.puml`).

## Acceptance
- Given the four control-rose rows of activity, class, component and state, then each is at 0, or only the diffs
  another task owns remain (state: T4d), journaled.
- Given `class__d3-skin-rose-element` and `component__probe-skin-rose`, then each is conformant.
- Given every `skin rose` corpus row, then 0 lost.

Observability N/A. Rollback Reversible.
