# Batch 1 — style origin, backcolor helper

Parallel: T1a and T1b share no file. T1b adds a module with no callers
(byte-neutral everywhere). T1a moves bytes only on rows that set a `<style>`
document gradient: expected sequence/activity `-gradient` rows go conformant
(their finalizers already read `backgroundGradient`); everything else that
moves needs a mechanism.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-style-origin.md) | style `document BackgroundColor` → `(background, backgroundGradient)` like skinparam (D1) | typescript-pro (opus, effort high), dbp-T1a | `src/core/style-map-element.ts`, `src/core/style-map-theme.ts`, `tests/unit/style-map-theme.test.ts`, `tests/unit/core/style-map-document-background.test.ts` | B0 close | [x] |
| [T1b](T1b-backcolor-helper.md) | `src/core/svg-backcolor.ts`: port of `SvgGraphics` constructor branches (D2), no callers | typescript-pro (sonnet, effort high), dbp-T1b | `src/core/svg-backcolor.ts`, `tests/unit/core/svg-backcolor.test.ts`, `docs/catalog.md` | B0 close | [x] |
| close | merge both; gates `b1`; chain `b1-eng` vs `b0-eng`; dbg re-measure; re-pin seq/act rows | orchestrator | per close-procedure | T1a, T1b | [x] |

## Interfaces (→ batch 2)
```ts
// T1a: theme shape (no new field — theme.colors.backgroundGradient already exists)
theme.colors.background: string;                 // flattened, exactly what the skinparam handler stores
theme.colors.backgroundGradient: Gradient | undefined;  // set when document BackgroundColor parses as c1<sep>c2

// T1b: src/core/svg-backcolor.ts
export interface Backcolor { readonly def?: string; readonly rect?: string; readonly rootBackground?: string }
/** SvgGraphics.java:176-192 + paintBackcolor :207-212, rect sized by the caller (:819-821). */
export function backcolorPaint(background: string | undefined, gradient: Gradient | undefined, width: number, height: number): Backcolor;
```
