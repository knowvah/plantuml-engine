# T1a — document background through the StyleBuilder (D1, D3, D4, D5, D6)

Agent: typescript-pro (opus, effort high), worktree `dss-T1a`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(core): read the document background through the style engine (T1a)`.

## Context
`resolveDocumentBackground` (`src/core/style-map-element.ts:482-489`) scans a flat list with no diagram type.
Upstream: `TitledDiagram.java:280-289`. `plugin` is resolved before `buildTheme` (`src/index.ts:315-323`). The
mindmap port already does this read (`src/diagrams/mindmap/MindMapDiagram.ts:105-116`).

## Task
1. New `src/core/document-back-color.ts`: `styleNameOf` (every branch of `DiagramType.java:234-296`, including the final
   `return SName.activityDiagram`), and `documentBackColor` applying D3's gate and exception, returning the pair the
   skinparam handler stores (`resolveColor`/`resolveColorPaint` as today). Transparent maps as the flat path did; read it.
2. `buildTheme` gains the required parameter and applies the pair after segments and before Stage 4 (caller `theme` wins).
3. `src/index.ts` passes `plugin.type`. Harnesses and test callers pass their type.
4. D5's removal. Re-point `tests/unit/style-map-theme.test.ts` and `tests/unit/core/style-map-element.test.ts`, reason in the body.
5. D6: catch exactly `StyleParsingException`; anything else propagates.
6. D1a: build from only the skinparam keys in `declarationOrder.skinparam`, so a `withPrevious` key never converts (`SkinParam.java:217-218`); no order keeps today's reading. T2a reuses this builder. Unit-test it: outer `skinparam noteBackgroundColor`, nested `<style>`.

## Measure
`diff-row.mts --all` before and after. Expected: `selector`, `variant`, `order` rows conformant except each stuck row's named
reason (board's body; dark's other diffs). `cascade-bg-*` rows lose only their root-background diffs. Every other mover
named. Also `document-background.ratchet.test.ts`: all 85 held, including `sequence-style-gradient-then-skinparam-black`.

## Write-set
`src/core/document-back-color.ts`, `src/core/build-theme.ts`, `src/core/style-map-element.ts`, `src/core/style-map-theme.ts`,
`src/core/style-map-global.ts` and `src/core/style-map-tag-cascade.ts` (doc comments naming the removed function only), `src/index.ts`,
`tests/oracle/svg-conformance/render-fixture-{class,state,sequence,json,activity}.ts`, `tests/unit/theme.test.ts`,
`tests/unit/style-map-theme.test.ts`, `tests/unit/core/style-map-element.test.ts`, `tests/unit/core/style-map-buckets-cdd6.test.ts`,
`tests/unit/core/style-map-document-background.test.ts`, `tests/unit/core/element-stereotype-paint-codd-t1c.test.ts`,
`tests/unit/core/option-handwritten.test.ts`, `tests/unit/core/theme-routing/declaration-order.test.ts`,
`tests/unit/class/class-default-font-size-r2j.test.ts`, `tests/integration/index.test.ts`,
new `tests/unit/core/document-back-color.test.ts`, `docs/catalog.md`.

## Read-set
[../decisions.md](../decisions.md) D1, D1a, D3–D6, D3b, `src/core/style/mindmap-style-builder.ts:215-235`, `src/core/build-theme.ts:50-125`, `src/core/nested-previous.ts:66-74`,
`src/core/theme-dark.ts`, `src/core/style-map-theme.ts:190-265`, `~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:234-296`,
`.../TitledDiagram.java:280-289`, `.../style/StyleStorage.java:102-116`.

## Acceptance
- Given sequence's own, reversed and bare selectors, then the root background matches the jar.
- Given a foreign selector, then the jar's white.
- Given the `order` rows, then the last declared wins, including `skin-then-white`.
- Given a source with empty `preprocessed.styles` and unset `preprocessed.skin`, then bytes are identical (byte check). A `!theme`-only source passes the gate (D3b): name any mover.
- Given `sequence__scope-malformed-brace`, then output is byte-identical to before; given `sequence__scope-dark-unrelated-style`, then the root stays `#1B1B1B`.

Observability: N/A. Rollback: Reversible.
