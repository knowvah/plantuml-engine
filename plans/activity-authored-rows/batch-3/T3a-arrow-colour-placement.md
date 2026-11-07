# T3a — Which edge a `-[#c]->` colours

**State at planning:** 11 corpus rows, Σ 418.

| Row | Diffs | Source | First diff (ours / jar) |
|---|---|---|---|
| `jozagi-52-ralo640` | 3 | `-[#black]->` before `repeatwhile` | `line[6]` stroke `#181818` / `#000` |
| `kixuja-22-fuce419`, `lejanu-37-jiva325` | 3 each | `-[#red]->;` after `label l` and a lane change in an `else` | `line[16]` `#181818` / `#F00` |
| `foxobi-84-kuka636` | 8 | `while ... is (no)` / `-[#green]->` / `endwhile (yes)` | `line[1]` `#181818` / `#008000` |
| `vejeba-98-zosi447` | 8 | `-[#Black]->` after an `endwhile` nested in an `if` | `line[6]` `#181818` / `#000` |
| `gopori-87-tese064` | 9 | `-[#red]->` ending a `case`; `-[#blue]-> Long text C;` as a case's only line | `line[8]` `#F00` / `#181818` (ours colours, the jar does not) |
| `metoco-66-kaxe903`, `petaku-66-pusa558` | 16 each | `-[#c]->` at every position of a `while` | `line[3]` `#181818` / `#000` |
| `pabope-47-pito596` | 55 | coloured, labelled arrows at nested `if` ends | canvas width 185 / 222 |
| `takupu-75-xego596` | 146 | `(-[#blue]->inc) elseif (B) then (-[#green,dashed]->out)` | width 526 / 357 |
| `zugeri-38-puri632` | 151 | nested `while` with `-[#c]->` at each end | height 306 / 265 |

`takupu-75` and its twin `renefi-68` (T6a) put a `LinkRendering` inside an `elseif`'s parentheses
(`(-[#c]->text)`): read how `CommandElseIf2`/`CommandIf2` parse it before treating it as a colour question; its width
delta says it is a parse first.

**Read (leads):** `InstructionWhile.java`, `InstructionRepeat.java`, `InstructionIf.java`, `InstructionSwitch.java`
(`setOutRendering`, `incoming`, `outcoming`, and which rendering each branch keeps), the `FtileFactoryDelegator*`
that turns them into connections, and `LinkRendering#getRainbow(Rainbow)` (`LinkRendering.java:77-82`, the default
when empty; dss TE1 found tiles that carry their own rainbow). Ours: the activity connectors' colour source.

**Do:** red with `jozagi-52` and `foxobi-84`, then `gopori-87` (ours colours where the jar does not).

**Measure:** the 11 rows; activity survey.

## Acceptance
- Given the 9 rows at or under 16 diffs, then each is conformant and pinned.
- Given `pabope-47`, `takupu-75`, `zugeri-38`, then each is conformant and pinned, or journaled with its remaining
  mechanism and owner.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
