# T1d — entity uids and quark-made parents

Commit: `fix(state): create dotted parents when upstream does`.

## Context
`state A.X` / `state A.Y` / `A -> Y` (`matezo-28`): the jar has `X` as `ent0001`, cluster `A` as `ent0002`, `Y` as `ent0003`. Ours numbers `A` first.
`tuvugi-94` (`state S.I {`) gives leaf `I` `ent0001`, a link `lnk2`, and `S` `ent0003`, with **`S`'s title bold**: the parent appears to be made late,
as `GroupType.PACKAGE` (`net/atmp/CucaDiagram.java:333`, *lead*), and a package title draws differently. `ast.ts:131-143` notes part of this. Six rows
for certain (`fovafu-44`, `matezo-28`, `tubojo-49`, `zoxutu-11`, `cesifo-37`, `tuvugi-94`); the 46 in the family mostly follow from T1c, so re-measure first.

## Read
`net/atmp/CucaDiagram.java:320-360,846-860`; `Entity.java:171`; `Link.java:135`; `renderer-uid.ts`; `state-parse-state.ts` `creationCounter`.

## Acceptance
- Given `matezo-28-duka427`, when rendered, then uids equal the jar's and the row is conformant.
- Given `tuvugi-94-gapi519`, then the title has `font-weight="700"`, and `lnk2` is the link's id.
- Given the family after T1c, then every `ent` swap left has a journal line naming its cause.

Observability: N/A — no new observable operations. Rollback: Reversible.
