# T2c — Class edge dash rounded; class root keeps the jar's size and link comment

**Row:** `rosoga-84`, `svg/g[1]/g[4]/path[1]/@stroke-dasharray`, ours `7.291666666666667,7.291666666666667`, jar `7.292,7.292`.

**Two byte-level residuals `compareSvg` does not flag**, on the same row under `skinparam dpi 100`:
- Root `width="171px" height="134px"` against the jar's `width="171.875px" height="134.375px"`. The description engine already writes the fractional form (`vakasu-51`, `209.375px`). **Lead:** `basicSvgOption` in `description/renderer.ts:303` against the class root path.
- `<!--link 2.13 to 0-->` against `<!--link 13 to 0-->`. **Lead:** the jar's comment reads the entity's short name.

**Read:** `SvgGraphics.java`'s `format` and its `stroke-dasharray` writer, `UStroke`, `class-edge-group-inheritance.ts:61`, `class-edge-geo.ts`, and the class root assembly. Read why `compare.ts` passes the fractional root before calling it blind. If the comparator is blind, say so in the journal and leave it; do not retune the comparator here.

**Do:** round where the jar rounds. Prefer the shared formatter over a local one. Fix the root and the comment at their origin if each is a small change; otherwise journal it and file a `queue:ready` issue with a "Blocked by" line on #136 (D7).

**Red:** `rosoga-84`'s dash. An authored class row with `skinparam dpi 100`, a dashed link and a package member, compared by bytes for the root and the comment.

**Measure:** `c4`, `class`, `unknown`.

## Acceptance
- Given `rosoga-84`, when surveyed, then `verdict` is `conformant`.
- Given the authored row, then the root's `width`, `height` and the link comment equal the jar's bytes, or the journal names the issue filed.
- Given `class` and `unknown` surveys, then 0 conformant lost.

Observability N/A. Rollback Reversible.
