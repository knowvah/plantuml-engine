# T1a — `<<#color>>` colours the shape its command builds

**Rows:** `cubixe-14` (`if(foo) <<#green>>`, `endif <<#blue>>`), `lacifo-03` (`repeat <<#green>>`), `mazuxi-71`
(`elseif(bar) <<#red>>`): every diff is a diamond `fill` of `#F1F1F1` against the stereogroup's colour.

**Read:** `CommandIf2.java:136-151`, `CommandIf4.java:100-120`, `CommandElseIf2.java:142-151`,
`CommandEndif3.java:90-96`, `CommandRepeat3.java:115-126`, `CommandWhile3.java:115-125`,
`CommandSwitch.java:100-105`, `CommandEndSwitch.java:85-90`, `CommandFork3.java:85-90`, `CommandStart3.java:84-88`,
`CommandStop3.java:85-90`, `CommandEnd3.java:85-90`, `CommandRepeatWhile3.java:160-164`, then where
`ActivityDiagram3#startIf`, `#elseIf`, `#endif(Colors)`, `#startRepeat` and `#repeatWhile` put the colour, and the
`Ftile` that paints it. `stereo/Stereogroup.java:150-190` (`getInnerColors`). Ours: `dispatch-stereogroup.ts`
(`stereogroupBackColor`), `if-dispatch.ts`, `switch-dispatch.ts`, `parallel-dispatch.ts`, `node-dispatch.ts`,
`list-backward-dispatch.ts`, `ast.ts`, `tiles/gtile-if-*.ts`, `tiles/gtile-repeat*.ts`, `tiles/gtile-while.ts`,
`tiles/gtile-switch.ts`, `activity-renderer-if-shapes.ts`.

**Do:** per D2. List, in the journal, each of the 13 commands with its colour target upstream and whether we read
it today. Port every missing read with its `file:line`. `<<#c>>` only: `##`/`###` and `name:value` labels stay
unported unless a corpus row or authored oracle shows the jar using them on these commands (then add them, and
journal it). An unknown colour follows `colorOrNeutral` (ruling 2026-11-04, `DIVERGENCES.md`), not a throw.

**Red:** the three rows' jar values. Authored, with oracles: one fixture per command in the list that reads a
colour, plus `<<#a>> <<#b>>` (last wins) and a colour with a `BoxStyle` label in the same group.

**Measure:** `unknown`, `activity`.

## Acceptance
- Given `cubixe-14`, `lacifo-03` and `mazuxi-71`, when re-read, then 0 diffs.
- Given each authored fixture, when compared with its oracle, then 0 diffs, or a journal line naming the residual
  and its owner.
- Given `unknown` and `activity` surveys, then 0 conformant lost against T0.

Observability N/A. Rollback Reversible.
