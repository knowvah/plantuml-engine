# T4d: coloured emoji in a card body

**Row:** `gecaxa-13-jedi612`.

Three `card` bodies with `<#0:swan:>`, `<#1:swan:>`, … `<#green:swan:>`, `<:swan:>`, the same for `grapes` and `star2`,
and `<color:…>` runs. The first diff is an emoji's text: ours has `font-size` 21 with a child node, and the jar has
`font-size` 14 with no child.

## Lead (verify before acting)

Read `AtomEmoji` (`klimt/creole/atom/`) for how a colour prefix (`#0`, `#F`, `#green`) changes the draw: a monochrome
artwork in that colour, or a text fallback. Read the `EmojiArtworkResolver` threading in the port. #150 is open for
emoji artwork on **edge labels** through `buildTextBlock`. This row is a body, so the seam may differ. If the same seam
fixes both, fix it here and comment on #150 with what landed. Do not take #150's fixture into this task.

## Acceptance
- Given `gecaxa-13-jedi612`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4d.test.ts`, then a coloured and an uncoloured emoji match the
  oracle's drawn elements.

Observability is N/A. Rollback is Reversible.
