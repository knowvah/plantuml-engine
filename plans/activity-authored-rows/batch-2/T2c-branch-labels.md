# T2c — Labels in `if`, `elseif`, `switch`; `skinparam arrow { MessageAlign }`

**State at planning:** 8 corpus rows, Σ 321.

| Row | Diffs | Source |
|---|---|---|
| `vovemi-32-cobo474` | 7 | `switch` / `case` branches ending `->this is invisible1;`; jar width 372, ours 376 |
| `bucoru-71-gapi371` | 22 | a three-line `->t;` at the end of each `if` branch |
| `bixece-33-baja570`, `gelizi-30-kole759`, `zifaza-86-tigo119` | 31, 35, 35 | `skinparam arrow { MessageAlign left/center/right }`, labels across swimlanes |
| `lunusi-20-nate529` | 56 | a multi-line label in an `if` branch |
| `filize-93-riju662`, `fokopi-22-mife166` | 60, 75 | a label between boxes in a branch, beside a tall multi-line box |

**Read (leads):** `FtileFactoryDelegatorIf.java` and `ConditionalBuilder.java` (each branch's in and out
`LinkRendering`, and where its label takes room), `FtileFactoryDelegatorSwitch.java` and
`FtileSwitchWithOneLink.java` (a case's out label: does upstream draw it at all? `vovemi-32`'s source calls them
"invisible"), and where `MessageAlign` is read for an activity arrow label (grep `MessageAlign` under
`activitydiagram3/`). Ours: the if and switch tiles and the label text block.

**Do:** red with `vovemi-32` (the smallest), then the `MessageAlign` triple.

**Measure:** the 8 rows; activity survey.

## Acceptance
- Given the 8 rows, then each is conformant and pinned, or journaled with its remaining mechanism and owner.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
