# T5c — inline gradient, shadow, interactive defs, transparent root

Commit: `fix(description): read inline gradients, shadow and root attributes`.

## Context
- `#red|green;line.dashed;line:blue` on a node in a frame: `titona-45`, `balomu-94`, `nasuge-48`. Ours is `#F1F1F1`/`#181818`; the jar's fill is `url(#g...)`, stroke `#00F`. `parseColorOverride` handles `red|green` (`renderer-color-override.ts`), so the frame or the order loses it. `FooDashed0_OK` outside the frame works, and the row names it: read why `_KO` is inside.
- `Shadowing<<webApp>> true`: `fesusa-40` lacks `defs` and `filter`, `resolveElementShadowing` takes no labels. D2 gives it. Also `jegure-48`.
- `!pragma svginteractive true`: `delagi-06` lacks 2 `defs` children (`SvgGraphics` *lead*; the grep at planning found nothing under `src/`). Mirror the MIT edition if it differs (`.claude/memory/mirror-mit-edition.md`).
- `skinparam backgroundColor transparent`: `jecici-56` has `height` and `width` we write and the jar does not. Read `SvgGraphics` and the option that omits them.

## Rows
`titona-45`, `balomu-94`, `nasuge-48`, `fesusa-40`, `delagi-06`, `jecici-56`.

## Acceptance
- Given `titona-45`, when rendered, then the gradient `defs`, fill and stroke match.
- Given `delagi-06`, then `defs` holds the jar's two children.
- Given `jecici-56`, then the root attributes match.

Observability: N/A — no new observable operations. Rollback: Reversible.
