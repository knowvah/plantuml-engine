# T2c — mindmap and salt carry a gradient backcolor (D3)

Agent: typescript-pro (sonnet, effort high), worktree `dbp-T2c`. Include
[../task-contract.md](../task-contract.md). Commit: `fix(diagrams): mindmap and
salt carry a gradient document background (T2c)`.

## Context
Upstream `TitledDiagram#calculateBackColor` (`TitledDiagram.java:280-289`)
returns any `HColor` (gradient included; `transparent` when null). wbs, gantt
and files carry it: string → `background`, else `backgroundGradient`
(`wbs/index.ts:203-208`). mindmap's port throws for a non-`HColorSimple`
(`src/diagrams/mindmap/MindMapDiagram.ts:103-111`); salt keeps only a string
backcolor (`salt/index.ts:160-165`) so a gradient falls back to the shell's `#FFFFFF`.

## Task
mindmap: `calculateBackColor` returns what upstream returns (no cast; the null →
`HColors.transparent()` branch kept) and `mindmap/index.ts` carries it like
wbs (including the muted colour mapper path already there, `:132-161`). salt:
carry a gradient like wbs. Tests first: mindmap and salt fragments for a style
gradient (def + `backgroundGradient`, no root background) and a solid (unchanged).

## Write-set
`src/diagrams/mindmap/MindMapDiagram.ts`, `src/diagrams/mindmap/index.ts`,
`src/diagrams/salt/index.ts`, their unit tests under `tests/unit/{mindmap,salt}/`.

## Read-set
`src/diagrams/wbs/index.ts:180-210`, `src/diagrams/mindmap/index.ts:125-165`,
`src/diagrams/salt/index.ts:150-170`, `src/diagrams/mindmap/MindMapDiagram.ts:95-115`,
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289`.

## Acceptance
- Given `mindmap-gradient`, then no throw and `diff-row.mts` reports conformant.
- Given `salt-gradient`, then no root `background:` and conformant.
- Given every mindmap/salt corpus row, then byte-identical (mindmap 142, salt 51 conformant held).

Observability: N/A. Rollback: Reversible.
