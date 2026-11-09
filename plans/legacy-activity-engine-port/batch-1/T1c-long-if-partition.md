# T1c — long activity, if/else/endif, partition

**Java:** `activitydiagram/command/CommandLinkLongActivity.java` (308), `UBrexCommandIf.java` (222),
`UBrexCommandElse.java` (86), `UBrexCommandEndif.java` (87), `UBrexCommandPartition.java` (128),
`UBrexCommandEndPartition.java` (85).

**Writes:** the six files under `src/diagrams/activity-legacy/command/`, `ActivityDiagramFactory.ts`,
`tests/unit/activity-legacy/{CommandLinkLongActivity,UBrexCommandIf,UBrexCommandElse,UBrexCommandEndif,UBrexCommandPartition}.test.ts`.
**Reads:** `src/core/ubrex/builder/*`, `src/core/command/UBrexSingleLineCommand2.ts`, a multi-line command port (for
example `src/diagrams/state/state-commands-notes.ts`) for how `BlocLines` commands are written here.

## Acceptance
- Given `lap-long-activity`, then one `ACTIVITY` leaf whose display has three lines.
- Given `lap-if-else`, `lap-if-nested` and `lap-if-as`, then the `BRANCH` leaves, the `[true]`/`[false]` labels and
  the `as T1` code equal the oracles.
- Given `lap-partition` and `lap-partition-end`, then `PACKAGE` groups named `Conductor`, `Audience` (with
  `#LightSkyBlue`) and `P1`, closed by `}` and by `end partition`.
- Given `else` with no open `if`, then the jar's result (read `UBrexCommandElse#executeArg`: error or ignore) is
  mirrored and pinned.

Observability: N/A — no new observable operations. Rollback: Reversible.
