# Batch 2 — finalizers, producers, klimt carriers

Parallel: T2a, T2b, T2c own disjoint files; merged together, measured
together in T2d. T2a's finalizers read `fragment.backgroundGradient`, which
T2b's producers set — a gradient row goes conformant only with both merged.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-finalizers.md) | json-family, state, class, description finalizers through `backcolorPaint` | typescript-pro (opus, effort high), dbp-T2a | `src/core/assemble-svg.ts` (+ split `src/core/assemble-svg-*.ts`), `tests/unit/core/assemble-svg*.test.ts` | B1 close | [x] |
| [T2b](T2b-producers.md) | json/state/class/description renderers forward `backgroundGradient`; follow-on (b) | typescript-pro (sonnet, effort high), dbp-T2b | `src/diagrams/{json,state,class,description}/renderer*.ts`, their unit tests, `tests/unit/json/renderer.test.ts`, `tests/unit/yaml/highlight-styleclass.test.ts` | B1 close | [x] |
| [T2c](T2c-klimt-carriers.md) | mindmap `calculateBackColor` + carrier; salt carrier (D3) | typescript-pro (sonnet, effort high), dbp-T2c | `src/diagrams/mindmap/{MindMapDiagram,index}.ts`, `src/diagrams/salt/index.ts`, their unit tests | B1 close | [x] |
| [T2d](T2d-close.md) | close: merge all three, measure, shrink-only re-pin, journal every mover | orchestrator | per close-procedure | T2a, T2b, T2c | [x] |

## Interface (T2b → T2a)
```ts
// RenderFragment (existing fields only — stop 6)
fragment.background?: string;          // solid / flattened, as today
fragment.backgroundGradient?: Gradient; // set by the producer when theme.colors.backgroundGradient is set
```
T2a must treat a fragment with only `background` exactly as today except the
`#000000` skip (json-family, state). Description's klimt path is T2b's: if its
klimt body already paints the gradient rect + def itself (`description/renderer.ts:289`
`backcolor`, split at `:354-382`), T2b carries that and T2a only sizes it — the
two agents must not both draw it; T2a reads T2b's spec.
