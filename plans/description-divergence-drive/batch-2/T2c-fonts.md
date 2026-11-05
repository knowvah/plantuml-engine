# T2c — fonts

Commit: `fix(description): read entity fonts from the merged style`.

## Context
`fcTitle`, `fc`, `fcStereo` and `defaultAlign` (`EntityImageDescription.java:172-175`), and `stereotypeAlignment` (`:207`). A body with its own display uses `fc` and `style`, one equal to the code name uses `fcTitle` and `styleTitle` (`:186-192`). Width changes, so sizer and renderer must read the same font (`planning/sizer-renderer-parity.md`).

- `@font-family` missing: `gogamo-72` (`skinparam actorFontName Courier`), `fexeci-32`, `kekeli-82` (`skinparam card { FontName "Inconsolata" }`), `seguci-13` (`root { FontName "Hack", ... }`, a comma list).
- `<style> Stereotype { FontColor Green }`, `.s { stereotype { ... } }`: `lunexo-59`, `beguta-99`, `xupiko-87`. Note `.forStereotypeItself(stereotype)` differs from `.withTOBECHANGED`: read both in `StyleSignatureBasic.java`.
- `HorizontalAlignment`: `kijipu-30`, `beguta-99`, `xupiko-87`, `barobi-40`.
- `kuciku-99`, `mavicu-17`, `bixofa-44` are T4a's sizing: fix them there unless this fix already does.

## Rows
`gogamo-72`, `fexeci-32`, `kekeli-82`, `seguci-13`, `lunexo-59`, `beguta-99`, `xupiko-87`, `kijipu-30`, `barobi-40`, `jobuje-80`.

## Acceptance
- Given `gogamo-72`, when rendered, then `font-family="Courier"` is on both actor text elements, with the width the deterministic measurer gives.
- Given `lunexo-59`, then the three stereotype labels are `#008000`.
- Given `kijipu-30`, then both lines of `rect1` sit at the jar's `x`.

Observability: N/A — no new observable operations. Rollback: Reversible.
