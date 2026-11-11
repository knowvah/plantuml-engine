# Batch 2 — elements, grid array, diagram, commands

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | `BpmElement` and friends, `BpmBranch`, the events, `GridArray` | orchestrator or typescript-pro | `src/diagrams/bpm/` (8 files), tests | T1b, T1c | [x] |
| T2b | `BpmDiagram`, the seven commands, `BpmDiagramFactory` | orchestrator or typescript-pro | `src/diagrams/bpm/` (9 files), tests | T2a | [x] |

Interface outputs consumed by batch 3:
- T2b: `BpmDiagramFactory` (no `CommonCommands`, D3) exposing what the plugin shape in `src/diagrams/wire/index.ts`
  consumes, and `BpmDiagram#getTextBlock(num, fileFormatOption): TextBlock`.

## Batch close
Gates from the README. Still unreachable from `renderSync`; the unit tests are the measure.
