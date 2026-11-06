# T1a — A linked map row takes its uid when the map is built

**Rows:** `lisepi-64-mudo307` (`g[4]/@id` `ent0004` against `ent0005`, `g[5]/@id` `lnk5` against `lnk4`), `gubene-80-zume167` (`g[3]/@id`, `g[4]/@id`).

**Read:** `CommandCreateMap.java` `executeNow` (the row loop's `new Link`), `abel/Link.java:135`, `abel/Entity.java:171`, `net/atmp/CucaDiagram.java:747-755`; `class-map-commands.ts:340-362`, `renderer-uid.ts`, and the stamp in `class-command-relationships.ts` as the pattern.

**Do:** per D2. Stamp `creationIndex` on the linked row's `Relationship`. `CommandCreateMap` is a block command, so the jar builds the entity and its links when `}` closes the block. Our body lines arrive one at a time. A `map` with two linked rows, and a link row whose target is declared before the map, must both keep the jar's order. A target that does not exist is an error in the jar (`No such entity`): check the port's behaviour against an oracle and journal it.

**Red:** `tests/unit/class/class-map.test.ts` asserts the uids for `lisepi-64`'s shape and for two linked rows on one map, against oracles.

## Acceptance
- Given `lisepi-64`, when compared, then `lisepi-64` is conformant.
- Given a map with two linked rows then an object, when rendered, then `ent` and `lnk` numbers equal the oracle.
- Given `gubene-80`, then no `@id` diff remains.

Observability N/A. Rollback Reversible.
