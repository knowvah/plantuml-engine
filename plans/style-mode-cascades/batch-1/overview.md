# Batch 1 — error pages

Where the jar errors on a `<style>`, ours must draw an error page too (D3, D4), and the dss ratchet must call that
conformant (D5). T1a comes first, because T1b and T1c measure through it.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-error-page-rule.md) | The dss ratchet applies the error-page rule | orchestrator or `typescript-pro` | `tests/oracle/svg-conformance/diagram-style-scope*.ts`, `document-background.ts` if shared, the pin | T0 | [x] |
| [T1b](T1b-style-cut.md) | A failing `<style>` block stops the parse at its line | orchestrator or `typescript-pro` | `src/core/skin-command.ts` or a sibling `style-command.ts`, `src/index.ts`, `src/core/dispatcher.ts`, tests | T1a | [x] |
| [T1c](T1c-dark-only-crash.md) | A dark-only `@media` value with no dark mode crashes, as upstream | orchestrator or `typescript-pro` | whichever catch swallows `ValueImpl.asColor`'s throw, tests | T1a | [x] |

Rows: `sequence__scope-malformed-brace`, `sequence__scope-malformed-colour`, the seven `*__malformed-novalue`,
`sequence__scope-media-dark-only`, and `sequence__scope-single-line-slash`, which T1a moves on its own.

Close: the task contract's batch close. Seams reach every bucket whose sources carry a `<style>` block, so the full
survey and `verdict-diff` are mandatory here.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
