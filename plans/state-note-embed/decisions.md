# Decisions (sne)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-17).
Each decision lists what was rejected and the evidence, so the user can audit it.

### D1 — Scope: every state note host that misses the embed atom

**Decision.** Entity notes (`note left/right/top/bottom of`, `note as N`, notes inside a composite: all built by
`state-note-layout.ts#measureNote` and materialized by `renderer-note.ts#materializeNoteSpec`), `note on link`, and
the unterminated-`{{` parse. Each is its own task and commit.

**Rejected.**
- *Entity notes only (the two held rows).* The planning probes show `note on link` missing the same atom (27 diffs,
  wrong canvas) and the unterminated `{{` drawing where the jar errors. CLAUDE.md: "The corpus is the work queue
  and not a ceiling", and "we draw where it errors" is not ours to accept (D4).
- *Notes in other engines.* The issue measured component, use case, object, sequence, activity and class notes as
  already embedding. T3 re-checks with one probe each only if the survey shows a note row moving.

**Separable residual.** If a probe's remaining diffs after the atom lands come from a different mechanism, measure
it, file a `queue:ready` issue with `file:line`, and keep going. "Hard" is not separable; a mechanism the task's own
change exposes is the task's.

### D2 — Mechanism: image stripes in the note geometry; sizing unchanged

**Decision.** When a note's display holds a line where `EmbeddedDiagram.getEmbeddedType` hits, `measureNote` also
builds the note's stripes:
- walk the lines with `core/svek/edge-label-embed.ts#splitEdgeLabelEmbeds` (`CreoleParser.java:146-170`);
- each text segment goes through the state creole block (`state-sizing-creole.ts#stateCreoleBlock`), as
  `buildRenderLines` does today;
- each embed is one atom from `edgeLabelEmbedAtom`;
- the stripes stack with `stackEdgeLabelStripes` (`SheetBlock1.java:115-171`), left-aligned
  (`EntityImageNote.java:111`, `root { HorizontalAlignment left }`).

The stripes ride `NoteSpec` → `StateNodeGeo`, and the note draws them at `(marginX1, marginY)` (`Opale.java:127`,
`EntityImageNote.java:288`). The note's box stays on `buildNoteBody`, which is already jar-exact on all 8 entity-note
rows (README table). A note with no embed line has no stripes and keeps today's path, byte for byte.

A separator (`--`, `==`) splits `BodyEnhanced2` into decorated blocks (`BodyEnhanced2.java:88-112`). The `sep` probe
holds that case: if its stripes do not reach the jar's offsets, port the block split for the stripe path from the
Java, do not fit a dy.

**Rejected.**
- *Draw the whole body through `buildNoteBody(...).drawU` in a `UGraphicSvg` when an embed is present.* This is the
  most literal mirror of `Opale.java:127`, but it moves the text runs of a mixed note onto the core text emitter,
  which no state row is verified on, while state's own emitter is conformant on 299/299 state rows.
- *An `image` kind on `StateStyledTextLine`.* Every header, body and label consumer of that type would need a branch
  for a case only notes and labels reach. ele (#144) took the separate-stripes shape and reached 0 on every state
  label probe, including `state-mixed`.

### D3 — One embed-stripe draw for labels and notes

**Decision.** Move the image branch of `state-renderer-transitions.ts#buildLabelStripesMarkup` (the `UGraphicSvg`
build, `drawU`, `extractFlatContent`) into one exported function in a new `src/diagrams/state/state-embed-draw.ts`;
labels and notes both call it. The stripe type for notes reuses `state-label-style.ts#StateLabelStripe` (or a type
both import), never a second copy. Every state label pin must stay byte-identical.

**Rejected.** A second copy of the image draw in `renderer-note.ts`.

### D4 — No new divergence

The payload is `UImageSvg` plus `SvgGraphics#svgImage` (DIVERGENCES.md:1361, retired); the slot is the nested
document's own size (DIVERGENCES.md:2115, retired). For `open`, mirror the jar's syntax error: both sides erroring is
conformant under the 2026-10-10 rule. Accepting "we draw where the jar errors" needs a signed ruling, which only the
maintainer gives (CLAUDE.md), so this mission never records one.

### D5 — Pin the held rows where they live; hold the probes in an authored gate

- **The held rows.** Re-measure `oracle/goldens/svg-timing/authored-baseline.json` and
  `oracle/goldens/svg-wire/authored-baseline.json` with their `build-authored-baseline.mts`; each row goes to 0 and
  loses its `reason`. Empty each gate's `OPEN_ROWS` (`timing.diff-baseline.ratchet.test.ts`,
  `wire.diff-baseline.ratchet.test.ts:40`) with a dated comment.
- **The probes.** Move them to `tests/fixtures/state-note-embed/<name>.puml` + `<name>.svg`, held by
  `tests/oracle/svg-conformance/state-note-embed.authored.test.ts`, a copy of `edge-label-embed.authored.test.ts`:
  - rows are the `.puml` files on disk, each with its jar `.svg`;
  - a ZERO row asserts 0 diffs plus the jar's `<image>` count;
  - an ERROR row (`open`) asserts both sides draw an error page, and the jar's error line;
  - any other row asserts its diff count never rises, with a `reason` naming its issue.

### D6 — No public API change

`dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` must stay byte-identical to the T0 snapshot.

### D7 — Each embed keeps the enclosing diagram's skinparams

Per #140 (`class-nested-diagram-renderer.ts#guardedRender`, `EmbeddedDiagram.java:88-90`), a nested render must not
leave its own registration behind. T1a checks that state's embeds go through the same restoring slot
(`core/nested-diagram-registry.ts`, `src/index.ts#prepareBlock`); the `two` probe (two embeds under an outer
`skinparam classBackgroundColor`) is the jar-side check. If the slot leaks on the state path, fix it at the slot,
not per caller.

## Operational readiness

- **Observability:** N/A. A pure library render path, with no new service calls or background work.
- **Rollback:** Reversible: revert the squash commit (or reset to `state-note-embed/pre-squash`'s parent).
- **Scalability:** a note with an embed already pays one nested render when sized; the stripes reuse that atom where
  the code allows (memoized on the atom), else pay one more. Embed-free notes cost nothing new.
- **Failure modes:**
  - The renderer is unregistered or throws: the jar's catch arm, 42x42 (`EmbeddedDiagram.java:148-152`), logged.
  - A note embeds itself: the depth guard (`EmbeddedDiagramDepthError`) rethrows, and the slot is restored (D7).
  - A harness that bypasses `renderSync` meets a note embed without registering the renderer: 42x42. Register as
    `render-fixture-state.ts` does (`.agent-notes/xetase-embedded-diagram-label.md`).
- **Backwards compatibility:** no API or data contract change. A state note with `{{ }}` now draws an image where it
  drew text, and an unterminated `{{` in a state note is now a syntax error: both are the jar's behaviour.
