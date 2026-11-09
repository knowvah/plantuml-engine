# T1b — activity3 commands we refuse; `CommandActivityLong3`'s leading colour

**State at planning:** ours draws our error page on seven corpus rows and two authored rows:

Our error page names the line before the one it failed on (stdd follow-on 14 saw the same), so the "likely
construct" column is the next line, read at planning and unconfirmed:

| Row | Diffs | Likely construct |
|---|---|---|
| `munovo-17-voji978`, `rikegu-37-maze985` | 33 each | `forkend` (one word) closing a fork, after a `-> label;` |
| `mivipi-10-lebe104` | 33 | `[[http://...]] if (?) then (x) <<#ff8822>>`: a URL before `if` |
| `suxeji-23-soro189` | 71 | `repeat:Entering a password; <<input>>`: `repeat` with no space before `:` |
| `votigi-61-nite269`, `zesoto-64-xeda685` | 39 each | `repeat:B; <<task>>`, the same |
| `nadata-32-ruma325` | 28 | `@startuml package "entities" {` on one line, then `A1 -> A2 A3 -> A2 : b }`; the jar types it activity |
| authored `activity__long3-colour`, `-hex` | 36, 37 | `#red:a` / `b;` |

`CommandActivityLong3.java:126-128` adds a deprecation warning when `COLOR` is present and goes on to draw. Item 12
says the colour is parsed and not applied: confirm against the oracle's box fill before porting it.
`activity__long3-oneline-colour` (`#red:a;`) draws the jar's error page (T0 decides `stockError`).

**Read:** each row's source and the jar's `in.svg`, then the activity3 command that matches its failing line
(`activitydiagram3/command/`, e.g. `CommandArrow3`, `CommandFork3`, `CommandActivityLong3`, `CommandIf2`), and
`ActivityDiagramFactory3`'s command list for order. For `nadata-32`, why the jar picks activity
(`PSystemBuilder` factory order, and which command accepts `package "x" {`).

**Do:** one red test per command. Fix each command the way upstream parses it; a row may need more than one.

**Measure:** the rows above; activity survey, and the unknown survey (shared router).

## Acceptance
- Given each row above, then it renders a diagram, or the stock jar errors on it and ours errors (D4).
- Given `long3-colour`, then the box draws as the jar draws it, and the deprecation warning is recorded the way
  our port records warnings (journal where).
- Given the activity and unknown surveys, then 0 lost.

Observability N/A. Rollback Reversible.
