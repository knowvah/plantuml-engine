# Batch 2 — shared element cascade

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-element-scope.md) | signature table, precompute into `elements`, foreign prefix stopped | typescript-pro (opus, effort high), dss-T2a | see spec | B1 close | [x] |
| close | merge; gates `b2`; chain vs `b1-eng`; re-pin; update T3/T4 specs from the remaining rows | orchestrator | per close-procedure | T2a | [x] |

## Interface (→ batch 3)
```ts
// src/core/style-element-scope.ts
export interface ElementSignature { readonly bucket: string; readonly snames: readonly string[] }
export const ELEMENT_SIGNATURES: Readonly<Record<string /* styleName */, readonly ElementSignature[]>>;
export function elementScopeColors(pre: PreprocessorResult, diagramType: DiagramType):
  Partial<Record<string, Pick<ElementColors, 'background' | 'border' | 'font'>>>;
// theme.colors.elements[bucket].{background,border,font}: read as today via resolveElement*
```
