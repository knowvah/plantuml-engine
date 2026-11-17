# T1a: delete `businessActorFill` and `businessUsecaseFill`

Follow `task-contract.md`. Decisions D1, D2.

## Context

The maintainer ruled option #1 on #156: delete both fields and their writers. Since dss T3a the business symbols read
their own signature's `BackGroundColor` (`EntityImageDescription.java:163-165`; ours `renderer-entity.ts:204-206`),
so the fields have no reader. Their old defaults (`none`, `#FFFFFF`) were never the jar's `#F1F1F1`.

## Write-set (plan, base `1689e015e`)

| File | Change |
|---|---|
| `src/core/theme-graph-colors-b.ts:386-391` | delete both members and their two comment pairs |
| `src/core/theme.ts:306-307` | delete both defaults (default theme) |
| `src/core/theme.ts:357` | delete `businessUsecaseFill` (dark theme) |
| `src/core/style-map-simple-fields.ts:33-39,47-53` | delete the `actor.business` and `usecase.business` entries |
| `src/diagrams/description/renderer-entity.ts:201-203` | reword: drop the field names, keep the jar citation and `#F1F1F1` |
| `tests/unit/theme.test.ts` | per D2 (issue lines 50-51, 95-104, 133-134, 150-159, 171-172, 184-185, 252-253, 280-281, 300-301, 383-384, 418-419, 452-453) |
| `tests/diagrams/activity/tiles/gtile-text-tiles.test.ts:43-44` | delete the two literal members |
| `tests/unit/description/dss-t3a-readers.test.ts:75` | retitle, e.g. "reads the business signature BackGroundColor" |
| `tests/unit/core/style-map-simple-fields.test.ts` | create (D2) |

If `style-map-simple-fields.ts`'s header or the theme modules' headers change, run `npm run catalog`.

## Steps

1. Red: add the D2 absence tests (four themes × two fields; `computeSimpleSelectorOverrides` with
   `new Map([['actor.business', new Map([['backgroundcolor', '#123']])], ['usecase.business', …], ['actor', …]])`).
   Run them alone, read the count, and confirm the absence cases fail.
2. Green: the D1 deletions, then the test edits. Run `npm run typecheck` until clean.
3. Run the README's description pins and `tests/unit/core/style-map-simple-fields.test.ts`; read the counts.
4. `git grep -nE "businessActorFill|businessUsecaseFill" -- src tests scripts docs-site` must print only the new
   absence tests' constant.
5. Commit, e.g. `refactor(theme): drop the unread business actor/usecase fills`, footer `Refs: #156`.

## Acceptance
- Given any built-in theme, when its `colors.graph` is inspected, then neither `businessActorFill` nor
  `businessUsecaseFill` is an own property.
- Given a style map with `actor.business { backgroundcolor }` and `usecase.business { backgroundcolor }`, when
  `computeSimpleSelectorOverrides` runs, then the result has neither key; and `actor { backgroundcolor: #123 }` still
  yields `actorFill: '#123'`.
- Given `component__probe-business` and the `actor/` render in `dss-t3a-readers.test.ts`, when they run, then they still
  draw `#AAA, #AAA, #CCC, #CCC` and `#F1F1F1`.
- Given `tests/integration/index.test.ts`'s `actor.business { BackGroundColor }` test, when it runs, then it still
  finds `#F00`.

Observability is N/A. Rollback is Reversible: revert the commit.
