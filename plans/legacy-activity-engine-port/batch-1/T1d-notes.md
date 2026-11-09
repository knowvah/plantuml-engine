# T1d — note commands

**Java:** `command/note/CommandFactoryNoteActivity.java` (227), `command/note/CommandFactoryNoteOnLink.java` (222),
both with `ParserPass.ONE` as the factory builds them (`ActivityDiagramFactory.java:84-90`).

**Writes:** the two note command factories, in core or in the engine per D2 (check `docs/catalog.md` and
`src/diagrams/{state,description}/` for an existing port first), `ActivityDiagramFactory.ts`,
`tests/unit/activity-legacy/notes.test.ts`.

## Acceptance
- Given `lap-note-activity`, then two `NOTE` leaves linked to `A` and `B` on the sides the oracle draws, and
  `getLastEntityConsulted()` is unchanged by them (`ActivityDiagram.java:101-103`).
- Given `lap-note-on-link`, then both notes attach to the preceding link.
- Given `lap-lone-note` and `unknown/coruvi-63-vuzu133`, then the factory accepts the source and the note attaches
  as the jar's oracle shows (it draws a `start_entity`; find which call creates it and quote it).

Observability: N/A — no new observable operations. Rollback: Reversible.
