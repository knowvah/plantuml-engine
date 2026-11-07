# Batch 1 — the four open families

Serial in the main checkout (D8). The tasks touch different engines and can run in any order. The `Depends On`
column says T0 only, but no two run at once.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-kermor-group-note.md) | Kermor group note: NOTE signature and its own colour (F1) | typescript-pro | `src/diagrams/description/renderer-cluster-note.ts`, its parser/geo carrier, tests | T0 | [x] |
| [T1b](T1b-state-head-colour.md) | State arrow heads read `HeadColor` from the merged arrow style (F2) | typescript-pro | `src/diagrams/state/state-link-style.ts`, `state-render-colors.ts`, tests | T0 | [x] |
| [T1c](T1c-state-note-skinparam.md) | State notes take `skinparam noteBackgroundColor` (F3) | typescript-pro | `src/diagrams/state/` note readers, tests | T0 | [x] |
| [T1d](T1d-sequence-transparent-font.md) | Sequence `FontColor transparent`: measure, draw nothing (F4) | typescript-pro | `src/diagrams/sequence/sequence-note-width.ts`, sequence text readers, tests | T0 | [x] |

Close the batch with the task contract's "Batch close" list.

## Acceptance
- Given the 15 open rows of the README table, when batch 1 closes, then each is at 0 or has a journal row that names
  its end per D9.
- Given every engine's survey, then 0 conformant rows lost against `/tmp/scr-b0/` and `<base>`.
