# T1a: `ChenEerDiagram`, the factory, the skin param, `CommandEndGroup`

**Java:**
- `cheneer/ChenEerDiagram.java` and `ChenEerDiagramFactory.java`;
- `cheneer/command/CommandEndGroup.java`;
- `command/CommonCommands.java:55-127` and `command/PSystemCommandFactory.java`;
- `classdiagram/AbstractEntityDiagram.java:60-106` (D1: which members Chen never reaches).

**Read in the port:**
- `src/diagrams/activity-legacy/{ActivityDiagram,ActivityDiagramFactory,activity-legacy-skin-param,common-commands-1,index}.ts`;
- `src/core/command/UBrexCommandRankDir.ts`.

**Do:**
1. `ChenEerDiagram extends CucaDiagram`. Port the owner stack (`pushOwner`, `popOwner`, `peekOwner`), keeping upstream's
   JSDoc, plus the port-only members activity-legacy's diagram carries for the chrome step (`annotations`, `scale`).
   The header quotes the grep that shows `getDotStrings`, `getDescription` and `packSomePackage` unreached (D1).
2. `cheneer-skin-param.ts` is a copy of `activity-legacy-skin-param.ts` with the activity-only members dropped.
   Members that the Chen path has not reached yet throw `unported:`.
3. `common-commands-1.ts` is a copy of activity-legacy's, typed to `ChenEerDiagram` (D2). Journal the duplication as a
   follow-on.
4. `ChenEerDiagramFactory#initCommandsList` keeps upstream's order (`:58-69`). Commands T1b has not written yet are
   stubs that never match, each marked `T1b`.
5. Port `CommandEndGroup`: `^\}$`, and `popOwner() == false` returns "Unbalanced brackets".
6. `index.ts` exports a `chenPlugin: SyncPlugin`. It is not registered, which is T3a's job. Layout and render throw
   `unported:` until T2c and T2d.

## Acceptance
- Given `entity A {` followed by `}`, when parsed (once T1b lands; until then, a test that pushes an owner directly),
  then the owner stack is empty, and a second `}` gives "Unbalanced brackets", as `err-unbalanced` does.
- Given `left to right direction` as the first line, then the skin param's rankdir is `LEFT_TO_RIGHT`.
- Given `title X` with `header H`, then the annotations hold both, as activity-legacy's do.
- Given an empty diagram body, then the plugin returns the Welcome result that `cov-empty`'s oracle shows.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
