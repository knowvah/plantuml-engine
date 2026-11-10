# Batch 2 — diagram, command, factory

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | `PSystemRegex` with the constructor's style freeze, `regex-skin-param.ts`, `applyStyles` | orchestrator or typescript-pro | `src/diagrams/regex/{PSystemRegex,regex-skin-param}.ts`, `src/diagrams/json/StyleExtractor.ts` (only if `applyStyles` is missing), `tests/architecture/layering.test.ts`, tests | T1b | [x] |
| T2b | `CommandRegexfSingleLine`, `PSystemRegexFactory`, the common-commands and style-dispatch copies | orchestrator or typescript-pro | `src/diagrams/regex/{CommandRegexfSingleLine,PSystemRegexFactory,regex-common-commands,regex-style-dispatch}.ts`, tests | T2a | [x] |

Serial (D10): T2b executes commands on T2a's diagram. Still unreachable from `renderSync` until T3a.

## Interface contract (T2a → T2b, T3a)

```ts
class PSystemRegex extends TitledDiagram {
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam)  // style frozen here (D3)
  getDescription(): '(Regular Expression)'
  addBlocLines(from: BlocLines): CommandExecutionResult   // 'Error parsing: …' on RegexParsingException (D5)
  getTextBlock(): TextBlock                                // throws on an empty stack (D4, D5 kind 4)
}
```

`PSystemEbnf.ts`'s constructor shape is the model; the third parameter follows however `PSystemEbnfFactory.ts` hands
its `SkinParam` in, so match that rather than this sketch if they differ, and journal it.

## Batch close

The task contract's batch close, steps 1 and 4.
