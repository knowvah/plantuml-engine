# T3d — small reads

Commit: `fix(state): font, bar colour, hyperlink, url and alpha reads`.

## Context, each a *lead*
- `skinparam state { FontName Impact }` prints no `font-family` (`nuboca-13`, `fakali-52`).
- `skinparam ActivityBarColor<<fork>> green` (`kedibo-23`): `EntityImageSynchroBar` signature on the stereotype.
- `#RRGGBBAA` in `<color>` (`xeziki-47`, dss 19): jar `fill="#F00" fill-opacity="0.125"`, klimt's writer.
- `skinparam HyperlinkUnderline false` and `hyperlinkColor`, `hyperlinkUnderlineThickness 0` (`mujipe-99`, `feziva-71`, `nixoja-06`): `FontConfiguration` hyperlink, `SkinParam`.
- `[[{S}]]` on a composite and on a leaf (`kenuci-20`, `dajipi-09`, `dapunu-39`): `Cluster.java:341` `ug.startUrl` wraps inside the group, so jar `g` has fewer children. Ours wraps per element.
- `bemena-23`, `pajefo-95`, `xepafa-33`: `"This is not Shooting "` is 3.849 wider, a trailing space the jar drops. Find where.

## Acceptance
- Given each row named above, when rendered, then it is conformant, or a journal line names what remains.

Split it if it grows past about 15 minutes. Observability: N/A — no new observable operations. Rollback: Reversible.
