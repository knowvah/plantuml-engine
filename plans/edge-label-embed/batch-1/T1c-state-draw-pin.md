# T1c — state: draw the embed, pin xetase, start the authored gate

## Context

The jar draws the label block at the DOT table corner plus `labelShield`, inside `marginLabel`
(`SvekEdge.java:951-954`). The embed stripe draws as `<image width height x y xlink:href="data:image/svg+xml;base64,…">`
(`EmbeddedDiagram.java:169-174`; `UImageSvg`, `SvgGraphics#svgImage`). State's renderer writes label markup as
strings (`state-renderer-transitions.ts:169-235`), and already builds a `UGraphicSvg` for the visibility icon
(`:244-251`). Draw the atom the same way.

## Task

1. In `buildInlineLabelMarkup`/`buildLabelBlockMarkup`, draw each stripe of T1b's label items:
   - text lines as today;
   - the image item through `block.drawU` on a `UGraphicSvg`, translated to the stripe's `(dx, dy)` from the block
     top-left.

   Read the oracle for the element order and for whether the jar wraps the image in a `<g>`.
2. Reach 0 diffs on xetase, `state` and `state-open` (`measure-probes.mts`).
3. **Pin xetase (D5).**
   - Run `npm run svg:survey -- state --out tests/oracle/svg-conformance/parity-state.json`.
   - Add `{ "slug": "xetase-70-zaza808", "addedAt": "<today>", "source": "dot-cache" }` to
     `oracle/goldens/svg-state/ratchet.json`.
   - Copy `in.puml` and `in.svg` (as `golden.svg`) into `oracle/goldens/svg-state/xetase-70-zaza808/`.
   - Empty the slug list in `oracle/goldens/state/label-size-backlog.json`.
   - Update any count assertions (`state.golden.ratchet.test.ts`, `state-dot-parity.test.ts`) with a dated comment.
4. **Start the authored gate (D5).**
   - Move the state probes (`state`, `state-open`) to `tests/fixtures/edge-label-embed/`, each with its jar `.svg`.
   - Add a self-loop well-formed probe and a `text\n{{\nclass X\n}}\nmore` mixed probe, with oracles from
     `scripts/oracle-render.sh`.
   - Create `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts`.
   - Repoint `measure-probes.mts`'s probe dir to include `tests/fixtures/edge-label-embed/`, keeping the planning
     probes not yet moved.

## Write-set
`src/diagrams/state/state-renderer-transitions.ts`, `state-transition-label.ts`, `tests/fixtures/edge-label-embed/*`,
`tests/oracle/svg-conformance/edge-label-embed.authored.test.ts`, `oracle/goldens/svg-state/ratchet.json`,
`oracle/goldens/svg-state/xetase-70-zaza808/{in.puml,golden.svg}`, `oracle/goldens/state/label-size-backlog.json`,
`tests/oracle/svg-conformance/parity-state.json`, `plans/edge-label-embed/measurements/measure-probes.mts`,
`.agent-notes/xetase-embedded-diagram-label.md` (rewrite or delete: stale).

## Read-set
`src/diagrams/state/state-renderer-transitions.ts:150-260`, `src/core/klimt/shape/UImageSvg.ts`,
`tests/oracle/svg-conformance/state.golden.ratchet.test.ts:1-140`,
`tests/oracle/svg-conformance/lengthadjust.authored.ratchet.test.ts`,
`test-results/dot-cache/state/xetase-70-zaza808/in.svg`.

## Acceptance
- Given xetase, when rendered on the ratchet path, then 0 diffs against `in.svg`, and its one `<image>` is 532x227.
- Given `parity-state.json` after the survey, then state is 299 conformant, 0 diverged.
- Given the authored gate, then every state probe asserts 0 diffs and the jar's `<image>` count.
- Given the full state ratchet, then all pins stay zero-diff.

Observability is N/A. Rollback is Reversible.
