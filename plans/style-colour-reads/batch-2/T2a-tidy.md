# T2a — tidying and the ruling

Three small items from #122 item 20 and 22. No rendered output moves.

1. **Stale citations (item 22).** `src/diagrams/state/renderer-box-zones.ts:5-7,44,121` cite
   `EntityImageState.java:131-135`/`134-142`. Upstream now reads `northBackcolor` at `:138`, `southBackcolor` at `:139`,
   the `equals` test at `:141` and builds the `RoundedContainer` at `:147-148` (grep, 2026-11-06). Open the file,
   re-read each cited line and correct every citation in that header and its doc comments. Grep `src` for any other
   `EntityImageState.java:1[2-4][0-9]` citation and check each one the same way.
2. **Nested class glyph (item 20b).** `DIVERGENCES.md`, the retired entry "Embedded `{{ }}` sub-diagrams", ends: "the
   `<text>` spot letter in nested class diagrams is unverified since." Replace that sentence with the finding verified
   at planning, re-checked here: render `tests/fixtures/diagram-style-scope/class__nested-classonly.puml` through the
   stock jar (`plans/style-mode-cascades/measurements/stock-check.mjs` writes to a temp dir; read the `.svg` it leaves,
   or extend the script to keep it) and decode the embedded image. The stock jar draws the spot as a glyph `<path>`
   that is identical to ours. The oracle's `<text>` comes from the seam: `EmbeddedDiagram.java:130,171` export with
   `stringBounder.getFileFormat()`, which the seam bounder reports as `SVG_DETERMINISTIC` (`FileFormat.java:185-192`),
   and `DriverCenteredCharacterSvg.java:65-69` writes `<text>` for that format. Strike dss follow-on 20's second half in
   `planning/next-missions.md` at T3.
3. **Unread `Theme` fields (item 22, D7).** File a GitHub issue labelled `needs-ruling` and `parity`, titled
   `Ruling: drop the unread businessActorFill and businessUsecaseFill Theme fields (public d.ts)`. The body names
   `dist/plantuml-ts.d.ts:4618-4619` (re-read the line numbers after the batch 1 build), the writers
   (`style-map-simple-fields.ts:37,51`, `theme.ts:306-307,357`), the tests that assert them (`tests/unit/theme.test.ts`),
   and the reader that replaced them (`renderer-entity.ts:201`, the `actor-business`/`usecase-business` buckets). Point
   to dss follow-on 8, the other public d.ts question. Put the choice to the user plainly: delete both fields and their
   writers (a d.ts change), or keep them. If `gh` is denied, put the issue text in the journal and the README summary.

Commit `chore(scr): correct stale citations and record the nested glyph`.

## Acceptance
- Given `grep -rn "EntityImageState.java:13[1-5]" src`, then every hit cites the line it names.
- Given `DIVERGENCES.md`, then the nested-glyph sentence states the stock-jar result with its three citations.
- Given the batch close, then `npm run build` leaves `dist/*.d.ts` identical to the base build, and the issue number is
  in the journal.

Observability N/A. Rollback Reversible.
