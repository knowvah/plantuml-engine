# T3c — composite header

Commit: `fix(state): draw a composite's description and zones`.

## Context
`Cluster#drawUState` (`svek/Cluster.java:450-510`), `RoundedContainer.java`. `state comp1 { comp1: entry / do_entry() … }` (`kacifo-58`): the jar draws a
`stroke:#F1F1F1;stroke-width:1` rect for the description zone, a second `line`, and the text at `(minX + MARGIN, minY + nameHeight + MARGIN/2)`; ours sizes the width
(`state-composite-cluster.ts:319`) and draws none of it. `descriptionHeight` and `nameHeight` set the zones. `sosoxe-55`'s three-line title puts the line at 54, ours 26.
`#green` on a composite (`mivelu-58`, `rufosi-58`): `north`, `center` and `south` all take `ColorType.BACK`, and the south path is drawn, so 5 children against 4.

Autonom composites go through `InnerStateAutonom.java`, so check both paths. `dapuko-98`'s `x` (33.6, jar 29) is a multi-line title alignment: `getTitleHorizontalAlignment`.

## Read
`svek/ClusterHeader.java:74-100`; `svek/RoundedContainer.java`; `renderer-composite-box.ts:58`; `state-composite-description-block.ts`; `state-composite-header.ts`.

## Acceptance
- Given `kacifo-58-dale036`, `mivelu-58-julo307`, `sosoxe-55-demi451`, when rendered, then each is conformant.
- Given `zaloga-87`, `giniti-22`, `tilili-10`, `pesita-10`, then header diffs are gone and what remains is journaled.

Observability: N/A — no new observable operations. Rollback: Reversible.
