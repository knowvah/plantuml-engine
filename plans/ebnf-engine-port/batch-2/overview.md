# Batch 2 — railroad tiles

Serial (D11). Every file is new under `src/diagrams/ebnf/` and unreachable from `renderSync` until T4a. Expected
geometry comes from oracle SVGs: the `ebnf` rows and planning probes for T2a/T2b, the `regex` rows for T2c (D4).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | `ETile` base, corners, zigzag, brace, `ETileEmpty`, `ETileBox`, `TitleBox`, `TextBlockable` | typescript-pro or orchestrator | `src/diagrams/ebnf/{ETile,CornerCurved,Zigzag,Brace,TextBlockable,ETileEmpty,ETileBox,TitleBox}.ts`, `tests/unit/ebnf/**` | T1a, T1c | [x] |
| T2b | Composite tiles used by EBNF | typescript-pro or orchestrator | `src/diagrams/ebnf/{ETileConcatenation,ETileAlternation,ETileOptional2,ETileOneOrMore,ETileZeroOrMore,ETileNot,ETileWithCircles}.ts`, tests | T2a | [x] |
| T2c | Regex-only tiles | typescript-pro or orchestrator | `src/diagrams/ebnf/{ETileOptional,ETileNamedGroup,ETileRegexGroup,ETileRegexGroupAllBut,ETileLookAheadOrBehind}.ts`, tests | T2b | [x] |

## Interface contracts

T2a outputs, consumed by T2b, T2c, T3a:
- `abstract class ETile extends TextBlockMemoized` with `static getStyleSignature()` (`root, element, ebnf`),
  abstract `push(tile)`, `getWidth(sb)`, `getH1(sb)`, `getH2(sb)`; `calculateDimensionSlow` = `(width, h1 + h2)`;
  protected `drawHline`, `drawHlineDirected`, `drawHlineAntiDirected`, `drawVline`, `drawVlineDirected`,
  `drawVlineAntiDirected`, `addCommentAbove`, `addCommentBelow`, `getRepetitionLabel()` (`"?"`); static
  `getArrowToLeft/Right/Bottom/Top()` (`ETile.java`).
- `CornerCurved.createSW/SE/NW/NE(delta)`, `Zigzag(width, …)`, `Brace(width, height)`: `UDrawable`s.
- `ETileBox` with `mergeWith(other)`, `getSymbol()`; `ETileEmpty`; `TitleBox(value, fc)`; `interface TextBlockable
  { getUDrawable(skinParam, preprocessing): TextBlock }`.

T2b outputs, consumed by T3a: each tile's constructor as in Java (`ETileOptional2(orig, skinParam)`,
`ETileOneOrMore(orig)` and `(orig, loopLabel, fc, skinParam)`, `ETileZeroOrMore(orig, skinParam)`,
`ETileNot(orig, fc, style, colorSet, skinParam)`, `ETileAlternation()`, `ETileConcatenation()` with `pushLast`,
`ETileWithCircles(orig, lineColor)`).

T2c outputs, consumed by #126 only: the five tiles' constructors as in Java.

## Batch close

Per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4 (no survey yet).
