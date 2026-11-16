# Decisions (ele)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next`, 2026-11-14). Each decision lists what was
rejected and the evidence, so the user can audit it.

### D1 — Scope: every svek engine whose edge label misses the embed atom

**Decision.** State (the corpus row plus probes), description (component, usecase), legacy activity, and the
class/object unterminated-label residual. Each engine is its own task and commit.

**Rejected.**
- *State only (the corpus row).* The issue's Fix names "each engine's label renderer", and the planning probes show
  the same missing atom in description and legacy activity (README table). CLAUDE.md: "The corpus is the work queue
  and not a ceiling".
- *All label pipelines, including sequence messages, activity-3 arrows and timing.* Those do not build labels in
  `SvekEdge`; a gap there is a separate mechanism. T4 probes them and files an issue per divergence instead.

**Separable residual.** If a probe's remaining diffs after the atom lands come from a different mechanism (for
example a DOT layout difference unrelated to the label block), measure it, file a `queue:ready` issue with
`file:line`, and keep going. "Hard" is not separable; a mechanism the task's own change exposes is the task's.

### D2 — Mechanism: walk the label's lines as `CreoleParser#createSheetSlow` does

**Decision.** Walk the label's display lines (after `Display.getWithNewlines` and the visibility strip) the way
`CreoleParser.java:146-170` does. A line where `EmbeddedDiagram.getEmbeddedType` hits starts
`EmbeddedDiagram.createAndSkip` over the same iterator. The resulting atom is one stripe, sized and drawn through
the registered `NestedDiagramRenderer` (`core/nested-diagram-registry.ts`, `core/EmbeddedDiagram.ts`). Text runs
between embeds stay on the engine's existing text path. The stripes stack per `SheetBlock1`: the block width is the
widest stripe, the height is the sum, and a narrower stripe shifts by `(widest - own) / coef`
(`SheetBlock1.java:104-171`, as cited in `class-edge-label-embed.ts`). A label with no embed line keeps today's code
path, byte for byte.

**Rejected.**
- *Re-plumb every edge label through `DisplayCreole#create0` → `SheetBlock2` in every engine.* This is the most
  literal mirror, but it puts every conformant edge-label row in four engines at risk (state alone has 298) when no
  failing row needs it. CLAUDE.md: "Do not refactor while porting".
- *Reserve 42x42 when a label starts with `{{`.* That is the exception arm (`EmbeddedDiagram.java:152`) and
  contradicts the oracle, which renders the Welcome page at 532x227 (seam #3).
  `.agent-notes/xetase-embedded-diagram-label.md` already rejected it.

**Evidence.** `class-edge-label-embed.ts` uses this shape, and the well-formed class probe is at 0 diffs. State's
embed-free labels are conformant on 298 of 299 rows, so the text path is already right wherever there is no embed.

### D3 — A core helper for the walk and the stacking; class stays as it is

**Decision.** Create `src/core/svek/edge-label-embed.ts` with:
- the walk (segments `text | embed`, reusing `EmbeddedDiagram.createAndSkip` and `getEmbeddedType`);
- the `SheetBlock1` stacking arithmetic;
- the embed atom built through `core/EmbeddedDiagram.ts` with the registered renderer.

Engines supply their own text-run measure and draw. `tests/architecture/layering.test.ts` rule 2 forbids importing
class's module from state or description.

`class-edge-label-embed.ts` is re-pointed to the helper only if every class and object pin stays byte-identical. That
is push-forward, not required.

**Rejected.** A per-engine copy in each of state, description and activity-legacy: three copies of a CreoleParser
branch.

### D4 — No new divergence

The payload is `UImageSvg` plus `SvgGraphics#svgImage` (DIVERGENCES.md:1361, retired; `core/klimt/shape/UImageSvg.ts`).
The slot size is the nested document's own size (DIVERGENCES.md:2115, retired). Nothing in this mission is
library-forced, so any residual is a bug or a separable issue (D1), never a divergence.

### D5 — Pin the corpus row in the state ratchet, and hold probes in an authored gate

- **The corpus row.** Pin xetase like any state row: `{ slug, addedAt, source: "dot-cache" }` in
  `oracle/goldens/svg-state/ratchet.json`, plus `in.puml` and `golden.svg`. Remove it from
  `oracle/goldens/state/label-size-backlog.json`, which is shrink-only.
- **The probes.** Move them to `tests/fixtures/edge-label-embed/<name>.puml` + `<name>.svg`, held by
  `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts`, modelled on
  `lengthadjust.authored.ratchet.test.ts`:
  - rows are the `.puml` files on disk, each with its jar `.svg`;
  - a row in the zero list asserts 0 diffs plus the jar's `<image>` count;
  - any other row asserts its diff count never rises and carries a `reason` naming its issue.
- **The render path.** The test renders with `renderSync` + `DeterministicMeasurer`, the survey's path
  (`scripts/svg-parity-survey.ts:302-315`).

### D6 — No public API change

`dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` must stay byte-identical to the T0 snapshot. The helper is
internal; it is never re-exported from `src/index.ts`.

## Operational readiness

- **Observability:** N/A. A pure library render path, with no new service calls or background work.
- **Rollback:** Reversible: revert the squash commit (or reset to `edge-label-embed/pre-squash`'s parent).
- **Scalability:** a label with an embed costs one nested render, memoized as body embeds are. A nested render is
  depth-guarded (`EmbeddedDiagramDepthError`, `class-nested-diagram-renderer.ts`). Embed-free labels cost nothing new.
- **Failure modes:**
  - The renderer is unregistered or throws: the jar's own catch arm, 42x42 (`EmbeddedDiagram.java:148-152`), logged.
  - A label embeds itself: the depth guard rethrows. Per #140 / `guardedRender`, the enclosing registration is
    restored in a `finally`. Check that state's path goes through the same slot, so a state embed cannot leak
    skinparams into the next one.
- **Backwards compatibility:** no API or data contract changes. Diagrams with a `{{` in an edge label now draw an
  image where they drew text, which is the jar's behaviour.
