# Batch 4 — leaves, containers, notes

Most of these change a size, which moves everything after it: `dotEqual` is the first thing to read. `planning/usymbol-composition.md` and `planning/sizer-renderer-parity.md` before touching a sizer: the rendered box and the measured box must come from one call.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4a | Degenerate and leaf sizing | orchestrator | `layout.ts`, `layout-dot-tree.ts`, `core/svek/image/leaf-sizing*.ts` | T3e | [x] |
| T4b | `skinparam guillemet` | orchestrator | `parse-helpers.ts`, `command-table-directives.ts`, `core/svek/image/leaf-sizing*.ts` | T4a | [x] |
| T4c | Empty and anonymous containers | orchestrator | `command-table-containers.ts`, `layout-classify.ts`, `renderer-cluster.ts` | T4a | [x] |
| T4d | Sprites in a stereotype or a body | orchestrator | `core/svek/image/EntityImageDescriptionDelegates.ts`, `core/svek/image/leaf-sizing-entity.ts`, `core/creole-atoms-image-resolver.ts` | T4a | [x] |
| T4e | Notes | orchestrator | `note-grammar.ts`, `renderer-note*.ts`, `renderer-cluster-note.ts` | T4a | [x] |
| T4f | Archimate | orchestrator | `command-archimate.ts`, `core/svek/image/leaf-sizing*.ts` | T4d | [x] |
| T4g | Creole rules and underline stroke | orchestrator | `core` creole line draw | T4a | [x] |

Close: [task-contract.md](../task-contract.md).

T4h (json, map, domain, requirement images) moved to batch 5 as T5f, journal row 24.
