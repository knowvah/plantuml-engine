# T4b: `BoxedCharacter` and `EntityImageDomain`

## Context

`EntityImageDomain` draws the name in a box with a `BoxedCharacter` tag in its corner: `X` lexical/given, `C` causal,
`B` biddable/uncertain, `P` plain (`GeneralImageBuilder.java:243-253`). The tag is
`new BoxedCharacter(typeLetter, 8, UFontFactory.byDefault(8), stereotype.getHtmlColor(), null, …)`
(`EntityImageDomain.java:84`); `BoxedCharacter.drawU` draws a `2r × 2r` rectangle then the centred glyph
(`BoxedCharacter.java:69-81`). `rukitu`'s oracle shows the `C` outline path at `rect x=91.515 y=122 width=16`.

## Steps
1. Capture the four size-8 outlines (D4) from `dei-domain-each`'s golden (and `rukitu` for `C`): record each `d` and
   the box centre it was captured at, in `src/core/descdiagram/boxed-glyph-data.ts`, following
   `src/core/spot-glyph-data.ts` (doc comment naming each source slug and coordinates).
2. Port `BoxedCharacter` and `EntityImageDomain` into `src/core/descdiagram/`, drawing the glyph through the existing
   `UCenteredCharacter` → `DriverCenteredCharacterSvg` path, fed by the capture.
3. Note what `stereotype.getHtmlColor()` is for an unspotted stereotype (the oracle shows `fill="none"` on the tag box).

## Write-set
`src/core/descdiagram/BoxedCharacter.ts`, `boxed-glyph-data.ts`, `EntityImageDomain.ts` (create), tests under
`tests/unit/core/descdiagram/`.

## Interface contract (consumed by T4c)

`EntityImageDomain`, `EntityImageMachine`, `EntityImageDesignedDomain` and `EntityImageRequirement` share one shape:
`constructor({ display, stereotype, style })`, `calculateDimension(stringBounder)`, `drawU(ug)`. T4c adds the dispatch.

## Acceptance
- Given `rukitu`'s `Google Map` (`<<Causal>>`), when drawn, then the box `rect x=38.19 y=94 w=69.325 h=44`, the text
  and the `C` path equal the oracle (relative to the node corner).
- Given each of `X`, `C`, `B`, `P`, when drawn, then the path `d` equals `dei-domain-each`'s, translated.
- Given a letter with no capture, when drawn, then no glyph is emitted and a unit test pins that.

Observability is N/A. Rollback is Reversible.
