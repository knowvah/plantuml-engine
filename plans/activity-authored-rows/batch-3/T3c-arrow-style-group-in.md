# T3c — Arrow `<style>`; a group's inner in-link colour (item 16)

**State at planning:**

- Arrow `<style>`, 4 corpus rows: `joxini-32-pube064` 17 (`arrow { LineColor red; HeadColor blue; FontColor gold;
  FontName arial; FontSize 15 }`), `nizifu-81-guse322` 17 (the same without `LineColor`), `kozete-82-voce373` 18
  (`HeadColor none`), `jigocu-99-bala189` 104 (`arrow { LineColor green; FontColor blue; LineThickness 2 }` with
  fork labels). The three small rows start at canvas height 139 / 144: the label font size, then the head colour.
- Item 16: a group whose body starts with an inline colour arrow. `FtileGroup.java:124-125`
  `getInLinkRendering()` returns `inner.getInLinkRendering()`, so the arrow into the group takes the inner arrow's
  colour; ours draws the default (dss TE1). Authored `activity__groupin-partition`, `-group`, `-merge`: 3 each
  (`line` stroke and arrowhead `#181818` / `#F00` or `#00F`).

**Read (leads):** where the activity arrow's merged style is built (`getDefaultStyleDefinitionArrow()` in
`FtileFactoryDelegator*`, `FtileFactoryDelegatorIf.java:78`), and how `HeadColor` reaches the arrowhead
(grep `HeadColor`/`PName.HeadColor` under `src/main/java/net/`); `FtileGroup.java` and `InstructionGroup.java` for
the in-link. Ours: activity arrow style reads and the group tile.

**Do:** red with `nizifu-81`, then `groupin-partition`.

**Measure:** the 4 corpus rows; `rows.mts ... activity__groupin`; activity survey.

## Acceptance
- Given `joxini-32`, `nizifu-81`, `kozete-82` and the three `groupin-*` rows, then each is 0 (corpus pinned).
- Given `jigocu-99`, then it is conformant and pinned, or journaled with its remaining mechanism and owner.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
