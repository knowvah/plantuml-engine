# T4: lay out and draw the transition-label leaf

**Writes:**
- `src/core/svek/image/EntityImageTransitionLabel.ts` (Create; D4)
- `src/diagrams/state/state-leaf-node.ts` (size + DOT node for the kind)
- `src/diagrams/state/state-dot-graph.ts` (only if the edge or node attributes need it)
- the state node renderer and `renderer-group.ts` (no entity group; first link's `data-link-type`)
- `tests/unit/core/svek/image/EntityImageTransitionLabel.test.ts`, `tests/unit/state/state-node-label-render.test.ts`
- the gate

**Reads:** D4; `EntityImageTransitionLabel.java:55-139`; `GeneralImageBuilder.java:210-225`; `SvekResult.java:75-100`;
`Link.java:100-114` (`idCommentForSvg`); the jar svgs and `svek-1.dot` of `snl-issue` (re-render into `/tmp` with
`scripts/oracle-render.sh` to get the DOT; never overwrite the committed svg).

## Steps

1. **DOT first.** Compare the port's DOT for `snl-issue` with the jar's: label node `shape=rect`, no `style=rounded`,
   `width=0.311979,height=0.291667` (22.462 x 21 px = text 14.462 x 13 + 8), both edges `minlen=1`, no `weight`,
   no edge label.
2. **Red.** Assert: the image's dimension for `go` at the default font is 22.462 x 21; it draws one `<rect>` with
   `rx="2.5"`, `fill="none"`, `stroke:none`, and the `<text>` at the centred offset; no `<g class="entity">`; link 1
   is `data-link-type="association"` with path id `A-transition_A_B__go__0`; link 2 is `dependency` with
   `transition_A_B__go__0-to-B`; the comments read `link A to transition_…` / `link transition_… to B`.
3. **Green.** Port the image (D4). Size from the text block plus `MARGIN` 4 per side; the dimension fallback
   (`:94-97`) is for an exception only — keep it only if the port's text block can throw. Draw order: nodes, then
   edges (`SvekResult.java:81-99`), as the state renderer already does.
4. **Measure.** Expected to reach 0: `snl-issue`, `snl-arrow-node`, `-arrow-node-upper`, `-skinparam-lower`,
   `-style-red-dashed-node`, `-style-node-first`, `-unlabelled`, `-up`, `-left`, `-multiline`, `-self`, `-start-end`,
   `-composite`, `-duplicate`, `snl-vega-transition-label`, `snl-vega-nonode-override`. Any that does not: find the
   first diff's mechanism with `file:line` before you change code (diagnosis mode; `~/.claude/rules/diagnosis.md`).

## Acceptance
- Given the issue repro, when rendered, then it matches the jar (0 diffs, 0 comment mismatches).
- Given the label image, when sized for `go`, then it is 22.462 x 21, from text + 2 x 4.
- Given `-left->`, when rendered, then the path ids are `transition_…-A` and `B-backto-transition_…`.

Observability: N/A. Rollback: Reversible.
