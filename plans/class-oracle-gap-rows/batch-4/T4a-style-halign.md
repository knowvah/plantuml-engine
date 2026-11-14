# T4a: `HorizontalAlignment` from `<style>` on description bodies

**Rows:** `bupabi-53-xedu278`, `nexeno-07-pike819`.

- `bupabi`: `<style> component { HorizontalAlignment center } database { HorizontalAlignment right } </style>`, then
  `component c [ a / abc / a b c d ]` and `database d [ … ]`. Every body line is at our `x` 22 / 134, while the jar
  centres or right-aligns each line (39.062, 31.669, …).
- `nexeno`: the same for `rectangle` and `usecase`, plus `FontColor green`. The usecase ellipse is also wider in the
  jar (`rx` 36.589 / 33.537).

## Lead (verify before acting)

`EntityImageDescription.java:175`: `final HorizontalAlignment defaultAlign = styleTitle.getHorizontalAlignment();`.
Read where `defaultAlign` reaches the body's `BodyEnhanced` / `Display.create`, and which style signature `styleTitle`
is. Then find whether our svek `EntityImageDescription` port reads it (description routes may already be correct: check
a description-bucket row with the same style). For `nexeno`'s usecase, read `EntityImageUseCase` for how alignment
changes the ellipse's text block width. If the ellipse turns out to be another mechanism, split it.

## Acceptance
- Given each row, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4a.test.ts`, then the body line `x` values match the oracle for
  `center` and `right`.

Observability is N/A. Rollback is Reversible.
