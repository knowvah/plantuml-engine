# Batch 3: wiring and residuals

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-wiring.md) | `requiresElk`, `layout-elk.ts`, the renderer branch; pin every row that reaches 0 | orchestrator or `typescript-pro` | plugin, layout, geometry, renderer, ratchet, builder, baseline | T2b | [x] |
| [T3b](T3b-residuals.md) | Every row still open: diagnose to `file:line`, fix or name it, file separable issues | orchestrator | as the mechanism needs | T3a | [x] |

Close with the task contract's "Batch close"; the every-engine survey must show 0 lost, and every legacy row without
the pragma must be where `<base>` left it.
