# Batch 1 — the profile gate and UMotif

The two tasks share no file, and either can go first. Run them serially in the main checkout.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `ParseOptions.securityProfile` and the registry's `registeredOnlyUnder` gate (D1) | typescript-pro | `src/core/dispatcher-types.ts`, `src/core/dispatcher.ts`, `src/core/render-options.ts`, `src/index.ts`, `tests/unit/core/dispatcher-security-gate.test.ts` | T0 | [x] |
| T1b | Port `UMotif`, plus `DotPath#addAfter` (D4) | typescript-pro | `src/core/klimt/UMotif.ts`, `src/core/klimt/shape/DotPath.ts`, `tests/unit/core/klimt/UMotif.test.ts`, `tests/unit/core/klimt/shape/DotPath.test.ts` | T0 | [x] |

- [T1a-gate.md](T1a-gate.md)
- [T1b-umotif.md](T1b-umotif.md)

## Interface outputs (consumed by T2a)

```ts
// src/core/dispatcher-types.ts
interface ParseOptions { readonly securityProfile?: SecurityProfile | undefined; /* existing fields */ }
interface SyncPlugin { readonly registeredOnlyUnder?: SecurityProfile; /* existing fields */ }
// src/core/klimt/UMotif.ts
class UMotif {
  constructor(s: string);                        // throws Error 'IllegalArgumentException' (UMotif.java:94-102)
  static fromInts(...data: number[]): UMotif;    // UMotif(int...)
  drawHorizontal(ug: UGraphic, x: number, y: number, nb: number): void;
}
// src/core/klimt/shape/DotPath.ts
addAfter(after: Bezier | DotPath): DotPath;
```

Close: follow `task-contract.md#batch-close`.
