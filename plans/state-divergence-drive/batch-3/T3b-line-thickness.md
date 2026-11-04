# T3b — `LineThickness`

Commit: `fix(state): read LineThickness from the state and circle styles`.

## Context
Hard-coded widths. `<style> start { LineThickness 2.5 }` draws `1` (`masofa-52`, `tacufe-37`); `state { LineThickness 5 }` draws `0.5` (`taluke-81`); `!theme plain` draws `0.5`, jar `1`
(`sugico-41`, `somuke-94`, `nimana-36`'s rose). `EntityImageStateCommon.getStyleState(...).getStroke()` is the read for a box and `Cluster.java:480-484` for a composite. The circle images read their own
signature (`EntityImageCircleStart`, `EntityImageCircleEnd`, *lead*). Compare what `dss` precomputed into the theme for colours (`state-bucket-colors.ts`).

## Read
`svek/image/EntityImageState*.java`, `EntityImageCircle*.java`, `EntityImageSynchroBar.java`; `style/Style.java#getStroke`; `.agent-notes/dss-T3*.md`.

## Acceptance
- Given `masofa-52-puli433`, `tacufe-37-fono831`, `taluke-81-noxa842`, `sugico-41-vase848`, `somuke-94-buzi673`, when rendered, then each is conformant.
- Given the default theme, then `0.5` stays, and no conformant row moves.

Observability: N/A — no new observable operations. Rollback: Reversible.
