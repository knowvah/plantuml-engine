## Observation: link anchors were not paginated
- **Context**: teoz-ng-001-5 page 1 was 275 high with a vertical line where the jar draws the newpage rule.
- **Finding**: `paginateSequence` clipped `geo.events` but not `geo.linkAnchors`; the page-2 `{start} <-> {end}` link was drawn unclipped on page 1 and stretched the canvas (`renderer.ts` maxY). The jar draws it through the clipped `ugBody` (`PlayingSpaceWithParticipants.java:218-221`, `PlayingSpace.java:129-134`).
- **Impact**: any newpage diagram with a link anchor. No UClip exists in the port; geometry-space clip carries the band on `LinkAnchorGeo.clip`, applied in `renderer-link-anchor.ts`.
- **Confidence**: High
