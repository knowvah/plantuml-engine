# T2a — leaf images

**Java:** `svek/image/EntityImageActivity.java` (168), `EntityImageBranch.java` (101), `EntityImageCircleStart.java`
(88), `EntityImageCircleEnd.java` (89), `EntityImageSynchroBar.java` (91), `CircleStart.java` (85), `CircleEnd.java`
(105); their dispatch in `svek/GeneralImageBuilder.java:118-189`; each image's style signature and skinparam reads.

**Writes:** those seven files under `src/core/svek/image/`, `tests/unit/core/svek/image/<name>.test.ts`.
**Reads:** `src/diagrams/state/` (its own start, end, choice and bar drawings: compare, do not change, D2),
`src/core/svek/image/Opale.ts` and `EntityImageDescription.ts` for the image shape used here (`calculateDimension`,
`drawU`, `getShapeType`).

## Acceptance
- Given `bokuba-91-poda774`'s oracle, then `EntityImageCircleStart` draws `<ellipse cx cy rx=10 ry=10 fill="#222">`
  in a `start_entity` group, `EntityImageCircleEnd` the 11/6 pair in `end_entity`, `EntityImageSynchroBar` an 80×8
  `#555` rect, and `EntityImageActivity` a `rx=12.5` rect with its text outside any group (D9), all at the oracle's
  numbers once translated.
- Given `lap-if-else`, then `EntityImageBranch` draws the jar's diamond in an `entity` group.
- Given each image, then its dimension equals the oracle DOT's `width`/`height` × 72 (`bokuba-91`: start 20×20,
  `VerifyReservation` 114.725×32, bar 80×8, end 22×22).
- Given `lap-skinparam` and `lap-style`, then the colours each image reads equal the oracle's.

Observability: N/A — no new observable operations. Rollback: Reversible.
