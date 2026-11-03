# T4a — activity LineColor

Agent: typescript-pro (sonnet, effort high), worktree `dss-T4a`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): activity reads the scoped line colour (T4a)`.

## Context
Largest number in the plan: `LineColor` under `activityDiagram` adds 49 diffs, under `element` 40, under `root` 0, on rects, polygons,
paths, lines and arrowhead fills (`#181818` vs `#B00`). `root` reaches boxes and arrows through `colors.border`/`colors.arrow` (audit: `build-theme.ts:rootCascadeSkinparams`), but sites 14 and 15 fail under `root` too.
Arrow signature: `ftile/FtileFactoryDelegator.java:84`.

## Task
Audit sites 8–17, probe-only 13–17 included (user ruling 2026-11-02). Route them through the resolved line colour, inline `-[#color]->` staying above it. An arrowhead's fill follows its
line. Tests first, citing the row or the Java.

## Write-set
`src/diagrams/activity/*`, `tests/unit/activity/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (activity), `src/diagrams/activity/activity-style-defaults.ts`.

## Acceptance
- Given `activity__cascade-line-{diag,diag-element,element,root}` and `activity__{lanes,loops,sdl}-line-*`, then 0 extra diffs.
- Given activity's 449 conformant corpus rows, then held.
- Given an inline arrow colour under a `LineColor` style, then the inline colour wins (unit test citing the Java).

Observability: N/A. Rollback: Reversible.
