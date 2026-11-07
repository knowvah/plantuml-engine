# T5b — Creole, sprites, emoji, qrcode, `<back:>`; the lone-sprite group title

**State at planning:** 11 corpus rows, Σ 1,962, and one #119 residual.

| Row | Diffs | Source | First diff (ours / jar) |
|---|---|---|---|
| `tejere-86-nilu058` | 5 | `<back:red>` on four boxes | `defs` 0 / 3 children, `filter` `url(#b00)` / `url(#b12hf…0)` |
| `cedero-01-sutu624` | 7 | `<<#red\white>>` box gradient, `<back:#FF9999/white>` | `linearGradient` id and direction |
| `mugupa-02-mofa005`, `sacedo-05-lupi088` | 5 each | preprocessor `%retrieve_procedure` in a URL label; `!$` variables in a `root` style | canvas height 85 / 70, 59 / 44 |
| `dejuko-37-pida698` | 24 | `- link [[...]]` lines, `<:link:><<icon>>` | width 226 / 83 |
| `lugicu-06`, `sprite-SVG-fill-management-2` | 53 each | an SVG `sprite`, in a legend, a box and two arrow labels | height 270 / 265 |
| `nomave-73-kuro838` | 53 | `<qrcode:abcdef>` in a title and a box | height 232 / 346 |
| `povupi-07-zedu796` | 60 | `!option debug true`, `<<time-event>>`, `<<input>>`, `<<object-signal>>` boxes | height 328 / 329 |
| `vosede-84-jise753` | 78 | a `!define` macro of `[[...]]`, `<&arrow-thick-bottom>`, `<back:>` as an `if` label | line colours |
| `jexavu-72-bixa676` | 1,619 | `<:tada:*1>`, `<size:30>`, `<<icon>>` | height 333 / 282 |
| lone-sprite group title (#119) | — | a group title made of one SVG sprite with empty space | the jar compresses each sprite shape on its own (`UGraphicCompressOnXorY`): circle cx 80.923 → 39.038, canvas 170 |

`povupi-07`'s `<<time-event>>` and `<<object-signal>>` are box shapes, not creole: move it to T4a if that is all it
is. `dejuko-37` may not be an activity3 source at all: read what the jar draws.

**Read (leads):** the creole atoms that draw `<back:>` (`AtomText` and the SVG filter id: `SvgGraphics` filter
naming), `HColorGradient` and `SvgGraphics` gradient ids, `AtomSprite`/`SpriteSvg` and its placement on a text
line, `AtomImg`/qrcode (`QRCodeUtils` or the `<qrcode:` creole command), emoji (`AtomEmoji`), and
`klimt/compress/UGraphicCompressOnXorY.java` for the group title. Ours: `src/core/creole/` and the activity label
text block (`docs/catalog.md`). The rendered `{{ }}` and platform glyph outlines stay oracle seams (CLAUDE.md).

**Do:** red with `tejere-86` (filter ids) and `cedero-01` (gradient), then the sprite rows.

**Measure:** the rows; every bucket's survey (creole is shared).

## Acceptance
- Given `tejere-86`, `cedero-01`, `mugupa-02`, `sacedo-05`, then each is conformant and pinned.
- Given the other rows, then each is conformant and pinned, or journaled with its remaining mechanism and owner.
- Given every bucket's survey, then 0 lost.

Observability N/A. Rollback Reversible.
