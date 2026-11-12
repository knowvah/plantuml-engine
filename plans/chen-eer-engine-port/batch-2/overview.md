# Batch 2: images, decor, DOT, renderer

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | The four `EntityImageChen*` images and their `GeneralImageBuilder` branches | typescript-pro | `src/core/svek/image/EntityImageChen*.ts`, `src/core/svek/GeneralImageBuilder.ts`, `tests/unit/core/svek/**` | T1b | [x] |
| T2b | `MiddleSubset`, `MiddleFactorySubset`, and the `SUBSET`/`SUPERSET` arm | typescript-pro | `src/core/svek/extremity/{MiddleSubset,MiddleFactorySubset}.ts`, `src/core/decoration/LinkMiddleDecor.ts`, `src/core/svek/{SvekEdge,extremity/MiddleCircleDecor}.ts`, `tests/unit/core/svek/**` | T1b | [x] |
| T2c | The DOT build and layout, including the one-leaf short-circuit | typescript-pro | `src/diagrams/cheneer/{cheneer-dot,layout}.ts`, `tests/unit/cheneer/**` | T2a | [x] |
| T2d | The renderer: leaves, edges, labels, decor, chrome, `assemble-svg` route | typescript-pro | `src/diagrams/cheneer/renderer*.ts`, `src/core/assemble-svg.ts`, `tests/unit/cheneer/**` | T2b, T2c | [x] |

The tasks run serially (D10). T2a and T2b are independent, but they share `tests/unit/core/svek/`, and the mission is single
writer.

**Interface contract (T2c → T2d):** `layoutChen(diagram, measurer)` returns what `renderChen` needs. That is the
`SvekResult`-shaped geometry activity-legacy's `layout.ts` returns: node positions by leaf, edge `DotPath`s and label
positions, and the canvas size. It is computed once and never recomputed in the renderer.

Close with [task-contract.md#batch-close](../task-contract.md#batch-close).
