# T1a — the style origin recovers the gradient (D1)

Agent: typescript-pro (opus, effort high), worktree `dbp-T1a`. Include
[../task-contract.md](../task-contract.md). Commit: `fix(core): recover the
document gradient from <style> like skinparam (T1a)`.

## Context
`resolveDocumentBackground` (`src/core/style-map-element.ts:479-489`) returns
`resolveColor(bg)` — for `red/blue` the raw string — and `style-map-theme.ts`
writes it to `theme.colors.background` (`:115`, `:207`). Upstream reads the
same property through `HColorSet` (`TitledDiagram.java:280-289` →
`style.value(PName.BackGroundColor).asColor(...)`, `HColorSet.java:78-119`),
which yields an `HColorGradient`. The skinparam path already does the
equivalent (`skinparam-key-handlers-table-a.ts:50-57`: `acc.background = color`,
`acc.backgroundGradient = paint` when not a string; parse = `parseColor`,
`src/core/paint.ts:134`).

## Task
Make the style path produce the same theme pair the skinparam handler
produces for the same value: find how the handler's `color` (flattened) and
`paint` arguments are computed (its caller in `skinparam-key-handlers.ts` /
`skinparam-accumulator.ts`) and reuse THAT computation — do not write a second
parse. Carry the `Gradient` to `theme.colors.backgroundGradient` through
`style-map-theme.ts`'s partial theme (merge rules: `theme.ts:491` `deepMergeTheme`).
Precedence with a skinparam: keep today's style-vs-skinparam order for
`background`, and give `backgroundGradient` the same winner (a later solid
must clear an earlier gradient — test both orders).

Tests first (`tests/unit/style-map-theme.test.ts`, or a new `tests/unit/core/style-map-document-background.test.ts`): style `red/blue`, `red|blue`,
`red-blue` → theme equals the skinparam theme for the same value; solid
unchanged; `transparent` unchanged; style-then-skinparam and the reverse.

## Measure
`npx tsx plans/document-background-paint/tools/diff-row.mts --all` before and after.
Expected: `sequence-gradient`, `activity-gradient` conformant (or reduced to a
named non-background residue); every other mover named with its mechanism.

## Write-set
`src/core/style-map-element.ts`, `src/core/style-map-theme.ts`,
`tests/unit/style-map-theme.test.ts`, new `tests/unit/core/style-map-document-background.test.ts`. If the flattened-colour computation
lives only inside the skinparam module and must be exported to be reused, that
module is outside the write-set: stop and report the exact symbol.

## Read-set
`src/core/style-map-element.ts:440-500`, `src/core/style-map-theme.ts:75-215`,
`src/core/skinparam-key-handlers-table-a.ts:40-60`, `src/core/skinparam-key-handlers.ts`
(the handler call), `src/core/paint.ts:100-150,300-315`, `src/core/theme.ts` (`colors.backgroundGradient` doc),
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289`,
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/HColorSet.java:78-119`.

## Acceptance
- Given `<style> document { BackgroundColor red/blue }`, then `theme.colors.backgroundGradient` deep-equals the skinparam result and `theme.colors.background` equals the skinparam's flattened value.
- Given a solid or absent document background, then the theme is unchanged (every non-gradient dbg row and every corpus row byte-identical).
- Given `sequence-gradient` and `activity-gradient`, then `diff-row.mts` reports conformant (or a named residue that is not the background).
- Given the json/class/state/description `-gradient` rows, then their remaining diffs are the unconsumed gradient only (T2's work) — no new invalid output.

Observability: N/A. Rollback: Reversible.
