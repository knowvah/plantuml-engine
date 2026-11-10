# Batch 3 — expression, diagram, commands

Serial (D11). Still unreachable from `renderSync` until T4a; T3b's tests drive the factory directly.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Tokens, shunting yard, engine, expression | typescript-pro or orchestrator | `src/diagrams/ebnf/{Symbol,Token,ShuntingYard,EbnfEngine,EbnfExpression}.ts`, `tests/unit/ebnf/**` | T2b | [x] |
| T3b | Diagram, commands, factory | typescript-pro or orchestrator | `src/diagrams/ebnf/{PSystemEbnf,PSystemEbnfFactory,CommandEBnfSingleLine,UBrexCommandEbnfMultilines,UBrexCommandComment,CommandCommentMultilines,CommandCommentMultilines2,CommandNoteMultilines,ebnf-skin-param}.ts`, tests | T3a, T1b | [x] |

## Interface contracts

T3a outputs, consumed by T3b:
- `EbnfExpression.create(it: CharInspector, isCompact: boolean, commentAbove: string | null, commentBelow: string | null)`,
  `isEmpty()`, and `getUDrawable(skinParam, preprocessing): TextBlock` (it `implements TextBlockable`).
- `EbnfEngine.syntaxError(fc, spriteContainer): TextBlock` (static), used by `PSystemEbnf#getTextBlock`.
- `enum Symbol` with `getPriority()`; `class Token { getSymbol(); getData() }`; `ShuntingYard(it).getOuputQueue()`
  (upstream's spelling).

T3b outputs, consumed by T4a: `parseEbnf(source, …)` returning the diagram or a refusal, the shape of
`parseNwdiag`/`parseBoard` (`src/diagrams/nwdiag/NwDiagramFactory.ts`), and `PSystemEbnf#getTextBlock(num,
fileFormatOption)`.

## Batch close

Per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4 (no survey yet).
