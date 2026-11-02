# T2b — producers forward the gradient; follow-on (b)

Agent: typescript-pro (sonnet, effort high), worktree `dbp-T2b`. Include
[../task-contract.md](../task-contract.md). Commit: `fix(diagrams): forward the
document gradient from json, state, class, description (T2b)`.

## Context
After T1a, `theme.colors.backgroundGradient` carries a `<style>` document
gradient. sequence and activity already forward it to the fragment
(`sequence/renderer-document.ts:141-150`, `activity/renderer.ts:441-446`); json
(`json/renderer.ts:407`), state (`state/renderer.ts:322`), class
(`class/renderer-document.ts:75-95`) and description do not. Description draws
through the klimt port with `backcolor: theme.colors.background`
(`description/renderer.ts:289`) and then lifts the leading rect out
(`splitLeadingBackgroundRect`, `:354-382`) for core to re-splice at the final size.

## Task
1. json, state, class: add `backgroundGradient` to the fragment exactly as
   sequence does (`...(g === undefined ? {} : { backgroundGradient: g })`).
   class: its `documentBackgroundRect` rule must not draw a solid rect for a
   gradient (the jar draws the gradient rect instead — T2a's finalizer).
2. description: hand the klimt `backcolor` the gradient when there is one (read
   how the klimt `SvgGraphics` port handles a gradient backcolor:
   `src/core/klimt/drawing/svg/svg-graphics-core.ts`), and make
   `splitLeadingBackgroundRect` lift a `url(#…)` rect and its def too, OR
   forward `backgroundGradient` and suppress klimt's rect — choose the one that
   keeps the def's document order (jar: def first, `SvgGraphics.java:393`) and
   report which. Coordinate through [T2a-finalizers.md](T2a-finalizers.md):
   T2a sizes/splices; T2b must not leave two rects.
3. Follow-on (b): `tests/unit/json/renderer.test.ts` and
   `tests/unit/yaml/highlight-styleclass.test.ts` call
   `assembleSvg(renderJson(geo))` without `diagramType`, so they skip
   `finalizeJsonFragment` and assert an unshifted, unformatted body production
   never emits. Stamp `diagramType` (as `json/index.ts:57` does) and re-point
   the expectations to production output, reason in the commit body.

## Write-set
`src/diagrams/json/renderer.ts`, `src/diagrams/state/renderer.ts`,
`src/diagrams/class/renderer-document.ts`, `src/diagrams/description/renderer.ts`,
their unit tests under `tests/unit/{json,state,class,description}/`,
`tests/unit/json/renderer.test.ts`, `tests/unit/yaml/highlight-styleclass.test.ts`.

## Read-set
`src/diagrams/sequence/renderer-document.ts:135-155`, `src/diagrams/activity/renderer.ts:435-450`,
`src/diagrams/description/renderer.ts:280-390`, `src/diagrams/class/renderer-document.ts:60-110`,
`src/core/klimt/drawing/svg/svg-graphics-core.ts` (backcolor handling),
`src/core/dispatcher-types.ts:60-80,150-160`.

## Acceptance
- Given a theme with `backgroundGradient`, then the json, state, class and description fragments carry it (unit tests on each renderer).
- Given a solid background, then each renderer's fragment is unchanged.
- Given the description gradient path, then exactly one gradient def and one `url` rect reach the document (asserted after `assembleSvg` with `diagramType`).
- Given the two follow-on (b) files, then every `assembleSvg` call passes `diagramType` and asserts production output.

Observability: N/A. Rollback: Reversible.
