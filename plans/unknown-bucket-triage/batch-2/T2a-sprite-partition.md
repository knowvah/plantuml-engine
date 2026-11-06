# T2a — A group named by an SVG sprite

**Rows:** `bezogu-47`, `jutesi-96`, `legoda-27`, `rurufo-83`, `tivado-46`. Each is
`sprite react <svg viewBox="0 0 230 230">…</svg>` then `rectangle <$react{scale=N}>` with no bracket. Both sides
draw `CommandPartition3`'s warning ("You should use a bracket ({) …"). Then:

- the group `rect` is 20×54 where the jar's is the sprite's size (267.692 at `scale=1`, 94.308 at 0.3, 490.615 at
  1.9), which also sets `svg/@height`;
- the sprite's `<circle>` has no `stroke-width`, and the jar draws it at 1.5, the group's stroke; we draw 1.

**Read:** `CommandPartition3.java:120-165` (name, `type`, the warning), the `Ftile` it builds for an empty
`rectangle` (`FtileGroup` and its title `TextBlock`), `SvgNanoParser.java:186-200` (`applyFillAndStroke`: a stroke
only when `stroke-width` is present), `UGraphicWithScale`, and the `ug` the group title is drawn with. Ours:
`group-dispatch.ts`, `activity-renderer-composite.ts`, `tiles/gtile-group.ts`, `tiles/gtile-partition.ts`,
`src/core/klimt/sprite/SvgNanoParser.ts`, `svg-nanoparser-shapes.ts`, `src/core/klimt/UGraphicWithScale.ts`.

**Do:** per D4 for the stroke: the sprite inherits the stroke the jar's `ug` carries at that call, passed at the
call site, not a new default. Size the group by the title the jar measures; the 267.692 for a 230 viewBox comes
from the Java, never from the rows. If the size and the stroke turn out to have separate origins, they stay
separate commits inside this task.

**Red:** the five rows' jar values. Authored, with oracles: the same sprite in `partition`, `group`, `package`,
`rectangle` and `card` (whatever `CommandPartition3` accepts), with and without a bracket, a sprite with an
explicit `stroke-width`, and `scale` 0.5 and 2.

**Measure:** `unknown`, `activity`; plus `class` and `description` if the nanoparser changes (sprites draw there too).

## Acceptance
- Given the five rows, when re-read, then 0 diffs.
- Given each authored fixture, when compared with its oracle, then 0 diffs, or a journal line naming the residual.
- Given every surveyed bucket, then 0 conformant lost against T0.

Observability N/A. Rollback Reversible.
