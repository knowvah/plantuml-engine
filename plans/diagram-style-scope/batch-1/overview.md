# Batch 1 — document background

One task: the required parameter must land with all its callers.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-document-back-color.md) | `calculateBackColor` port, required `diagramType`, flat scan removed | typescript-pro (opus, effort high), dss-T1a | see spec | B0 close | [x] |
| [T1b](../decision-journal.md) | `CommandStyleSingleLineCSS`, found by probing past T1a (D8) | orchestrator, dss-T1b | `src/core/preprocessor-collector.ts`, its test, 7 rows | T1a | [x] |
| close | merge; gates `b1`; chain vs `b0-eng`; rows re-pin; `document-background` rows held | orchestrator | per close-procedure | T1a | [x] |

## Interface (→ batch 2)
`DiagramType` here is the engine union `plugin.type` already has (`src/core/block-extractor.ts:22`), not `TitledDiagram.ts`'s upstream-named one.
```ts
// src/core/document-back-color.ts
export function styleNameOf(diagramType: DiagramType): string;   // DiagramType.java:234-296
export function documentBackColor(pre: PreprocessorResult, diagramType: DiagramType):
  { background: string; backgroundGradient?: Gradient } | undefined;
// src/core/build-theme.ts
export function buildTheme(pre: PreprocessorResult, options: RenderOptions | undefined, diagramType: DiagramType): ResolvedThemeAndStyles;
```
