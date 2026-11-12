# T1b: the five commands, and upstream's unit test

**Java:**
- `cheneer/command/{CommandCreateEntity,CommandCreateAttribute,CommandAssociate,CommandSimpleSubclass,CommandMultiSubclass}.java`;
- `src/test/java/net/sourceforge/plantuml/cheneer/command/CommandCreateEntityTest.java`.

**Do:**
1. Port each regex leaf for leaf, keeping the group names (`TYPE`, `DISPLAY`, `CODE`, `STEREO`, `COMPOSITE`, `NAME1`,
   `PARTICIPATION`, `CARDINALITY`, `PARTICIPATION2`, `NAME2`, `DIRECTION`, `SUPERCLASS`, `SYMBOL`, `SUBCLASSES`) and
   each `ColorParser.simpleColor` `ColorType` (D8).
2. Port each `executeArg` in the Java's statement order. That includes `CommandMultiSubclass` creating the centre circle
   before checking the superclass (D7).
3. Port the error strings verbatim: "Bad name", "Attribute must be inside an entity, relationship or another attribute",
   "Attribute already exists", "No such entity: <name>".
4. `subclasses.split(",")` follows Java semantics (D9).
5. Port `CommandCreateEntityTest` as `tests/unit/cheneer/CommandCreateEntity.test.ts`, every case. The display assertion
   is `[display]`, upstream's `Display#toString`.
6. Replace T1a's stubs.

## Acceptance
- Given `vega-chen-movieextended.puml`, when parsed, then the leaf count is 30. That is upstream's
  `expected-description: (30 entities)`, the circles and attributes included. The links carry the `LinkType`s D8 lists:
  bold for `=`, `SUPERSET` for `->-`, `SUBSET` for `-<-`, and `U` versus `d` placement.
- Given `Born : DATE` inside `DIRECTOR`, then one attribute leaf exists whose quark name is `DIRECTOR/Born : DATE`, and
  its display is `Born : DATE`.
- Given the error probes of D7, then each returns its oracle's error text.
- Given `CommandCreateEntity.test.ts`, then all 8 upstream cases pass.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
