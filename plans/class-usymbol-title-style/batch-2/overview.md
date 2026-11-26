# Batch 2: port `styleTitle`

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | Stamp `styleTitle` on every class `EntityImageDescription` leaf; the draw reads forecolor, stroke, backcolor from it | orchestrator or `typescript-pro` | `class-usymbol-title-style.ts` (new), `index.ts`, AST/geo field, `renderer-usymbol-entity-style.ts`, unit test, both gates | T1 | [x] |
| T3 | The leaf sizer and the actor ink walk read the same stroke thickness | orchestrator or `typescript-pro` | `class-layout-leaf-shapes.ts`, `class-layout-generic-classifier.ts`, unit test, both gates | T2 | [x] |

Serial: T3 reads T2's stamped field. Specs: [T2-draw.md](T2-draw.md), [T3-size.md](T3-size.md). The batch closes with
the README gates and the every-engine survey (task contract, "Batch close").
