# Batch 2: three mechanisms

Serial, in this order: T2a and T2b both write `leaf-sizing-folder.ts`, and T2c's `ptw-newline` row needs T2a's title
wrap to reach 0.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | M1: the `package` title wraps at `styleTitle.wrapWidth()`, sizer and renderer | orchestrator or `typescript-pro` | see [T2a](T2a-title-wrap.md) | T1 | [x] |
| T2b | M2: the folder label sizer reads the style's wrap first | orchestrator or `typescript-pro` | see [T2b](T2b-label-wrap.md) | T2a | [x] |
| T2c | M3: `equalsLike` over `getWithNewlines(code)` for the package's empty `desc` | orchestrator or `typescript-pro` | see [T2c](T2c-equals-like.md) | T2b | [x] |

Close with the task contract's "Batch close". The description engines (`component`, `usecase`, `unknown`, `c4`) are
the ones expected to move; every engine runs.
