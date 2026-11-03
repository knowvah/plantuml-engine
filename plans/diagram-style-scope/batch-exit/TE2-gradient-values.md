# TE2 — gradient values on the element cascade

Agent: typescript-pro, worktree `dss-TE2`, after TE1's merge. Include [../task-contract.md](../task-contract.md). Found by the exit probe (D8: fixed, with a row each).
Commit: `fix(diagrams): gradient values on the element cascade (TE2)`.

## Evidence
A style value `#0A0-#00A` is an `HColorGradient`. Upstream splits it at the driver by shape kind: rect, polygon, path and ellipse drivers write a real def and `stroke="url(#…)"` / `fill="url(#…)"` (`klimt/drawing/svg/DriverRectangleSvg.java:97-111`, `DriverDotPathSvg`), a `ULine` takes the first colour (`DriverLineSvg.java:76-82`), and text takes the first colour (read the text driver and quote it). Ours already does this for classifier boxes and edges: `src/core/paint.ts#noGradient`, `src/diagrams/class/renderer-classifier-colors.ts#classBorderLine`, `src/diagrams/class/renderer-edge-extras.ts#renderEdgeDotPath`, ids renumbered by `svg-defs-seeded.ts`. Everywhere else it is dropped, flattened, written raw or dangling.

Probe: `<sel> { <prop> #0A0-#00A }` for engine ∈ class, object, state, component, usecase, activity; prop ∈ LineColor, BackgroundColor, FontColor; sel ∈ the engine's own, root, element, arrow, note. Sources and jar output in `/private/tmp/claude-501/-Users-scottseely-git-knowvah-plantuml-ts/4337da08-dafe-4c34-8d56-dab9c6298e26/scratchpad/fin3/src/gr-*` and `/private/tmp/claude-501/-Users-scottseely-git-knowvah-plantuml-ts/4337da08-dafe-4c34-8d56-dab9c6298e26/scratchpad/fin3/out/`, results in `/private/tmp/claude-501/-Users-scottseely-git-knowvah-plantuml-ts/4337da08-dafe-4c34-8d56-dab9c6298e26/scratchpad/fin3/res.tsv` (read only). 45 of 90 differ:
- **FontColor, every engine that differs:** ours `#000` or the default, jar `#0A0`. Two are invalid SVG: `root` on activity writes `fill="#0A0-#00A"` on text; `root`/`element` on class writes `path fill="url(#gynbcc)"` with no def, jar `#0A0`.
- **LineColor:** activity boxes, diamonds, notes and arrows; state boxes and notes; `arrow` and `element` on class, object, state, component, usecase edges (ours `#181818`, jar `url(#…)` plus the def). `root`/`element` on activity write a dangling `url(#gynbcc)` with no def.
- **BackgroundColor:** state boxes (a canvas height differs too, 196 vs 197: diagnose it), state notes, object (`childCount` 3 vs 4).

## Task
Diagnosis first (mechanism, origin, chain, ruled out) for each family; the fix belongs at the origin, the helpers above reused, not a site at a time where one seam serves. Each arrowhead, line and fill follows the driver rule of its shape kind. Find where `gynbcc` comes from, since a `url()` with no def is invalid SVG. Add rows `tests/fixtures/diagram-style-scope/<engine>__gradient-<prop>-<sel>.{puml,svg}` for all 90 sources, oracles from `scripts/oracle-render.sh`; the orchestrator pins them, so do not edit the pin file or `ROW_COUNT`.

Stays out: FontSize, LineThickness, RoundCorner, Shadowing (filed). A family whose fix proves large and separable: stop and report it with the measurement and the mechanism, leaving the rest committed. Do not fit, and do not add a `Theme` field (stop 7).

## Write-set
`src/**` per D8 (name every file outside `src/diagrams/{activity,state,class,description}` in the hand-back), their unit tests, `tests/fixtures/diagram-style-scope/*__gradient-*`.

## Acceptance
- Given all 90 probes, then 0 diffs against the jar, or each remainder a named mechanism in the hand-back.
- Given every conformant row in the 28 engines and every authored row, then held, and no pinned row rises.
- Given a source with no gradient value, then byte-identical: prove it by the byte check, and report every mover with its mechanism and before and after counts. The corpus has 18 `BackgroundColor` gradient sources.
- Given `dist/plantuml-ts.d.ts`, unchanged: `npm run build`, then `cmp` with `plans/diagram-style-scope/measurements/b0-plantuml-ts.d.ts.txt`. A doc comment on a public type counts.
