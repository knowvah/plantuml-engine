# T2b — A composite state's creole table takes the ambient stroke

**Row:** `lofabo-38`: `state X { }` with three `X: | … |` description lines. All 8 diffs are the table's rules,
`stroke-width` 1 against 0.5. The state's own border and header line already match (0.5).

**Read:** `Cluster.java:450-502` (`drawUState`: the `stroke` it builds at `:480-484`, `RoundedContainer`, then
`attribute.drawU(ug.apply(...))` at `:500-502`), the caller that hands `drawUState` its `ug` (`Cluster#drawU`,
`:340-365`), `AtomTable.java:102-156`, `EntityImageStateCommon#getStyleState`. Ours:
`renderer-box-runs.ts:150-187` (`renderStateTable`, `TABLE_RULE_WIDTH = 1`, jar-verified on `kinuca-03-nice683`),
`renderer-box.ts:100-135` (`tableRuleWidth`), `renderer-note.ts:231` (the note passes 0.5), and the composite state
renderer that draws the description.

**Do:** per D4. Find which `ug` carries 0.5 at `:500-502`, quote it, and pass that width from the composite path
only. A simple state (`kinuca-03`) stays 1 unless its Java says otherwise.

**Red:** `lofabo-38`'s jar values. Authored, with oracles: the same table in a simple state, a composite state with
children, a composite state with `skinparam state { BorderThickness 2 }` or a `<style>` `LineThickness`, and a
`##[bold]` specific line stroke (`getSpecificLineStroke`, `:480`).

**Measure:** `unknown`, `state`.

## Acceptance
- Given `lofabo-38`, when re-read, then 0 diffs.
- Given `kinuca-03-nice683` and each authored fixture, when compared with its oracle, then 0 diffs.
- Given `unknown` and `state` surveys, then 0 conformant lost against T0.

Observability N/A. Rollback Reversible.
