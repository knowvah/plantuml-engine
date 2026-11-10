# Batch 1 — tokens and operator order

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `ReTokenType`, `ReToken`, `RegexParsingException`, `RegexExpression` | orchestrator or typescript-pro | `src/diagrams/regex/{ReTokenType,ReToken,RegexParsingException,RegexExpression}.ts`, tests | T0 | [x] |
| T1b | `ShuntingYard`, `GroupSplitter` | orchestrator or typescript-pro | `src/diagrams/regex/{ShuntingYard,GroupSplitter}.ts`, tests | T1a | [x] |

Serial (D10): T1b consumes T1a's `ReToken`. Nothing here is reachable from `renderSync`; the unit tests are the measure.

## Interface contract (T1a → T1b, T2a)

```ts
enum ReTokenType { SIMPLE_CHAR, ESCAPED_CHAR, CLASS, QUANTIFIER, ANCHOR, GROUP, NAMED_GROUP, LOOK_AHEAD, LOOK_BEHIND,
  ALTERNATIVE, PARENTHESIS_OPEN, PARENTHESIS_CLOSE, CONCATENATION_IMPLICIT }  // Java order, ReTokenType.java
isNamedGroupOrLookAheadOrLookBehind(t: ReTokenType): boolean
needImplicitConcatenation(t1: ReTokenType, t2: ReTokenType): boolean
class ReToken { constructor(type: ReTokenType, data: string); getType(); getData(); toString(): `${TYPE}[${data}]` }
class RegexParsingException extends Error {}
RegexExpression.parse(it: CharInspector): ReToken[]   // throws RegexParsingException or a plain Error
class ShuntingYard { constructor(it: Iterator<ReToken>); getOuputQueue(): readonly ReToken[] }  // upstream spelling
class GroupSplitter { split(group: string): readonly string[] }
```

`toString` must print the Java enum name (`PARENTHESIS_OPEN[(]`, `cov-unbalanced-open`), so a numeric TS enum needs a
name lookup.

## Batch close

The task contract's batch close, steps 1 and 4 (no survey: nothing is registered yet).
