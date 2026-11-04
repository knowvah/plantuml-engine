# T1b — border points open no entity group

Commit: `fix(state): draw border points without an entity group`.

## Context
`EntityImageState.java:117` opens a group with `UGroupType.CLASS, "entity"`. `EntityImageStateBorder#drawU` (`svek/image/EntityImageStateBorder.java:79-104`)
does not, and draws `desc` before `entityPosition.drawSymbol`. Ours wraps it (`renderer.ts:229-234`) and draws ellipse then text
(`renderer-border-point.ts`). 30 rows use a border stereotype, and all 30 diverge: `lulozu-10`'s `g[1]` has 3 children, the jar's 5. The missing
group also hid what sits below it, so re-read every row.

Jar-verified shape, `lulozu-10`: `<text …>en1</text><ellipse …/>` as direct children of the content `<g>`.

## Read
`renderer.ts:145-180` (`wrapClassFor`); `tests/unit/state/` for the pinned order; `abel/EntityPosition.java:82-128`.

## Acceptance
- Given `lulozu-10-bopu547`, when rendered, then it is conformant.
- Given `cinoni-00` and `jufevo-34`, then `g[1]` has 11 children, and each remaining diff has a journal line.
- Given an `EXIT_POINT` and an `INPUT_PIN`, then label precedes symbol, and `entity` wraps neither.

Observability: N/A — no new observable operations. Rollback: Reversible.
