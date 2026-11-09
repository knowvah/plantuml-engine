# T2a — Labels in `while`, `repeat`, `backward`

**State at planning:** 25 corpus rows, Σ 1,400. The smallest show the mechanism in isolation:

| Row | Diffs | Source | First diffs (ours / jar) |
|---|---|---|---|
| `ximelo-07-kusu416` | 10 | `repeat` / `:taskA;` / `-> dataaaa;` / `if ... break` / `repeat while` | width 136 / 142 |
| `bunefa-86-juna432` | 14 | `while (test)` / `:task;` / `->label;` / `endwhile` | height 134 / 145 |
| `loriki-95-kavi777` | 19 | `repeat :Text 1;` / `-> visible;` / `:Text 2;` / `-> not visible;` | height 169 / 162 |
| `liteta-29-zufa478` | 22 | a three-line `->t1;` before `endwhile` | height 252 / 284 |
| `mojacu-63-fade855` | 37 | `endwhile ([iteration done1])` / `-> match found in loop?;` | height 194 / 134 |

The rest pair labels with `backward` (`xemaxo-17`, `cajore-10`, `vujufe-00`, `zejogu-00`, `jomobo-52`, `cepizi-90`),
swimlanes (`jazuco-34`, `fukobu-92`, `tirixa-64`, `votidu-40`, `tetesi-04`, `zejido-43`), `repeat while (...) ->
label` (`linene-56`, `kuxigo-12`, `laguja-32`, `jeseke-77`), and `break` (`mapuru-01`). `sezizo-64` also sets
`ActivityDiamondFontSize`: check whether its residue is T4a's.

**Read (leads):** `FtileFactoryDelegatorWhile.java` and `FtileFactoryDelegatorRepeat.java` (where the in, out,
back and special-out labels are read off each `LinkRendering` and handed to the tile), `FtileWhile.java` and
`FtileRepeat.java` (`calculateDimension`, the label's place in it, and the connections that draw it),
`InstructionWhile`/`InstructionRepeat` (`setOutRendering`, `incoming`/`outcoming` of `backward`), and
`LinkRendering.java`. Ours: the while and repeat tiles and their connectors under `src/diagrams/activity/`
(`docs/catalog.md`).

**Do:** start from `bunefa-86` (the label before `endwhile`) and `loriki-95` (a label after the last box of a
repeat with no `repeat while`). Red with the jar's height and label `y`.

**Measure:** the 25 rows; activity survey. Re-read the T2b and T6a rows that carry loops: their counts move.

## Acceptance
- Given `bunefa-86`, `loriki-95` and `ximelo-07`, then each is conformant and pinned.
- Given the other 22 rows, then each is conformant and pinned, or journaled with its remaining mechanism and owner.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
