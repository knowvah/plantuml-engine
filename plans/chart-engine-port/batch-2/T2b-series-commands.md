# T2b — Series and the small commands

**Read:** `command/CommandChart{Bar,Line,Area,Scatter,Annotation,Legend,StackMode,Orientation,Grid}.java`, `core/stereo/Stereotype.ts`, D6.

**Do:** one file per command, each transcribing its own `RegexConcat`. They differ, and that is the point:

- `bar`: `STEREO NAME DATA COLOR LABELS`, **no `V2`**. The planning probe: `bar [1,2] v2` is a syntax error.
- `line`, `area`: `... COLOR V2 LABELS`.
- `scatter`: `... COLOR V2 LABELS MARKER`, and **only** `MARKER` sets the shape. `scatter <<triangle>> [..]` is a stereotype named triangle, and draws a circle.
- `COLOR` is `#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|\w+)`, resolved by `getColor("#" + colorStr)`: an unknown name throws `NoSuchColorException`, which `SingleLineCommand2` reports as `CommandExecutionResult.badColor()` (`CommandWBSLink.ts` shows the catch).
- Default name is `bar` or `line` or `area` or `scatter` plus `diagram.getSeries().size()`.
- `bar` and `area` take `parseValues` only; `line` and `scatter` take coordinate pairs when `data.contains("(")`. So `bar [(1,2)]` reaches `parseValues` and fails with `Invalid number format in bar data`, and the `addSeries` coordinate-pair type check is unreachable from a registered command.
- `parseValues` of `` or blanks gives an empty list, not an error.
- `annotation`: `XPOS` tries `parseDouble` and falls back to the trimmed string; `YPOS` fails with `Y position must be a numeric value: <text>`. `<<arrow>>` is the arrow flag.
- `CommandChartGrid` is ported and tested, and T2c does not register it. Its file carries a comment saying so with the Java citation.

## Acceptance
- Given `bar <<primary>> "Revenue" [45, 62] #3498db labels`, then a BAR with stereotype `primary`, name `Revenue`, values, colour and `showLabels`.
- Given `bar [1,2] v2`, then the pattern does not match.
- Given `scatter <<triangle>> "S" [1,2]`, then marker CIRCLE and stereotype `triangle`; given `scatter [1,2] <<triangle>>`, then marker TRIANGLE and no stereotype.
- Given `line [(1,2), (3,4)]`, then `xValues` `[1,3]`, `values` `[2,4]`; given `line [(1,2,3)]`, then `Invalid coordinate pair format in line data`.
- Given `bar [1] #nosuchcolor`, then a bad-colour result.

Observability N/A. Rollback Reversible.
