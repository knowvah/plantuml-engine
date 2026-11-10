# T1b — The `core/` model

**Read:** `core/NStackable.java`, `Network.java`, `NwGroup.java`, `NServer.java` (all but `getDraw` and
`toTextBlock`); D3, D4.

**Do:**

1. `NStackable.ts`: the interface (`setDescription`, `setColor`).
2. `Network.ts`: whole class. `magicDelta` is 0 when invisible, else +2 on an even stage number, −2 on odd.
   `toString` as Java's.
3. `NwGroup.ts`, model half: `names` a `Set<string>`, `getNboxInternal`, `getNbox(servers)` iterating the servers map
   in insertion order, `addName`, `names()` (read-only view), `contains`, colour and description accessors.
   `getTopHeaderHeight`, `drawGroup` and `buildHeaderName` land in T1c.
4. `NServer.ts`, model half: `connections` a `Map<Network, string>` in insertion order; `shape` defaults to
   `USymbols.RECTANGLE`; `connectTo` (throws on a null network, `""` for null address, the early return, then
   `bar.addStage(network.getNstage())` for the first stage else `network.getUp()` when not the main network);
   `connectMeIfAlone`, `isAlone`, `someAddress`, `someNetwork`, `blankSomeAddress`, `learnThisAddress`,
   `doNotPrintFirstLink`, `printFirstLink`, `getMainNetworkNext`, `getAdress`; `updateProperties` resolving `shape`
   through `USymbols.fromString` with the three styles of D3; `create`; the constructor (description defaults to the
   name). `getDraw` and `toTextBlock` land in T1c.
5. T1a's `NPlayField#fixGroups` test, now that groups and servers exist.

**Tests:** `connectTo` with an empty address on an already-connected network keeps the first address; a server's bar
spans the stages of every network it joins; `learnThisAddress` fills the first blank connection only; `magicDelta` on
stages 0, 1 and an invisible network; `updateProperties` with `shape = cloud`, `shape = actor` (the stickman) and
`shape = bogus` (stays rectangle).

## Acceptance
- Given a server connected to networks on stages 0 and 2, then its bar starts at stage 0 and ends at stage 2's `up`.
- Given `shape = bogus`, then `getShape()` is `USymbols.RECTANGLE`.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
