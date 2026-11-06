# T4b — `skinparam guillemet`

Commit: `fix(description): honour the guillemet skinparam`.

## Context
`skinparam guillemet none` and `false`: `getSkinParam().guillemet()`, and `Stereotype#getLabels(guillemet)`. `EntityImageDescription.java:195` passes `Guillemet.DOUBLE_COMPARATOR` only to test presence, and `portionShower.getVisibleStereotypeLabels(entity)` (`:194`) builds what prints: read that method. `mogidu-85`'s canvas is 129 against 109, and `divani-97`, `gidike-19`, `gikizu-32` are 333 against 228 with `dotEqual` false, so the width reaches the DOT. Our parser reads the key (`parse-helpers.ts`, `command-table-directives.ts`), and the sizer may not: check `ast.ts`.

`@startuml` here uses `!definelong` and `!procedure`, which preprocess first.

## Rows
`mogidu-85`, `divani-97`, `gidike-19`, `gikizu-32`.

## Acceptance
- Given `mogidu-85`, when rendered, then the canvas is 109 wide and the row has zero diffs.
- Given `divani-97`, then `dotEqual` is true.

Observability: N/A — no new observable operations. Rollback: Reversible.
