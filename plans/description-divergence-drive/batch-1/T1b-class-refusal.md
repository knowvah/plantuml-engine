# T1b — a class refusal falls through to description

Commit: `fix(routing): let the class factory refuse what upstream's refuses`.

## Context
`PSystemBuilder.java:136-140` (*lead*) tries class, then description, then activity3. Two shapes the class factory refuses and ours accepts:

- `package {` and `package #green {`: `CommandPackage` (`:78`, registered `ClassDiagramFactory.java:127` before `CommandPackageWithUSymbol` at `:130`) matches an empty NAME and `executeArg` returns `error("Error in name")` (`:154-158`). An execution error, and the next factory runs. Rows `fubuja-64`, `minece-51`, `luzida-92`.
- `Person "1" *-- "*" Person : "parent" contains "children"`: the line starts with a keyword of `CommandCreateElementFull.ALL_TYPES` (`:76`, case-insensitive via `Pattern2.java:114`) and ends with a quote, so `CommandCreateElementFull2` swallows it in the class factory (`:197-198`) and refuses. Rows `gepuko-44`, `zuzura-28`.

D10: mirror the order and the refusal. No keyword heuristic in the router. `src/registered-plugins.ts:63` holds our order.

These sources may then expose description parser gaps: fix them here if the Java is the same command.

## Rows
`fubuja-64`, `minece-51`, `luzida-92`, `gepuko-44`, `zuzura-28`.

## Acceptance
- Given `fubuja-64`, when rendered, then `data-diagram-type` is `DESCRIPTION`.
- Given a class source with a named `package x {`, then it stays class: the routing gate's `agree` rows hold.
- Given `zuzura-28`, then `skinparam flashcode 1` is accepted (`CommonCommands.java:67`) and its links draw as description links.

Observability: N/A — no new observable operations. Rollback: Reversible.
