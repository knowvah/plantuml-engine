# T4f: `{{ }}` diagrams in notes, link labels and bodies

**Rows:** `nacave-78-dijo807`, `subdiagram-theme-1`, `dobefe-98-moji323`, `moxeku-98-gufi234`, `potatu-55-pave291`.

- `nacave` and `subdiagram-theme-1` (identical sources): `note top of a: \n==theme fail==\n{{\n!theme crt-amber\nUser->System: test\n}}\n`
  on an empty component. Page 194×293 against the jar's 559×441.
- `dobefe`: `B <-[dashed]-> A: API\nDetails:\n{{\na->b:req\nb-->>a:resp\n}}\n` between two empty components: an
  embedded sequence diagram in a link label. Height 297 / 396.
- `moxeku`: two `label x [{{ … }}]` holding description diagrams with `<style> actor { … }` and
  `skinparam actorStyle awesome`. Image 77×213 / 75×217.
- `potatu`: three `card X [{{ … }}]` with nested components, one with `!pragma layout elk`. Page 719 / 606 wide.
  (The second embed's smetana pragma was stripped at capture, so it is a graphviz graph.)

## Lead (verify before acting)

Treat each embed like T4e: render the inner source alone, through our engine and the jar, and compare. That splits
"the inner engine differs" from "the embed slot differs".
- `nacave`: `!theme crt-amber` inside an embed. Read how the jar's `EmbeddedDiagram` builds the nested diagram (its own
  `SkinParam`, the theme loader), and whether our embed path runs the preprocessor's `!theme` for the inner block.
- `dobefe`: the label's embed reaches the edge-label block. Read `Link` label `Display` creation with an embedded
  diagram.
- `moxeku`: the awesome actor's size under `LineThickness 4` (`ActorStickMan` / `ActorAwesome`) in the nested
  description diagram.
- `potatu`: the ELK embed runs through `ElkBackend`, which needs `prepareElkOnce()` before a sync render (the measurer
  already calls it). Check which of the three embeds differs.

T4f writes into the embed path T4e just changed, so it runs after it. If a row is a separate mechanism, split it
(push-forward). #144 and #168 are open for state `{{ }}`: comment there if a shared embed fix lands.

## Acceptance
- Given each of the 5 rows, when it is measured, then `n=0`.
- Given unit tests in `tests/unit/class/cogr-T4f.test.ts`, then each embed's image size matches the oracle.

Observability is N/A. Rollback is Reversible.
