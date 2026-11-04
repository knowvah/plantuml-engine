/**
 * state-parse-phantom.ts — the two moments upstream gives a dotted id's
 * data-less ancestor quark its entity (stdd T1d). `quarkInContext`
 * (`net/atmp/CucaDiagram.java`) creates every missing segment as a quark with
 * no data; this port marks such a `State` `autoPhantom` and burns no tick for
 * it (`state-parse-resolve.ts#registerStateInto`). Then either:
 *
 * - `StateDiagram#ensureParentState` (`statediagram/StateDiagram.java:268-280`),
 *   from `CommandCreateState.java:200` after the leaf exists, walks up making
 *   `GroupType.STATE` groups until a quark that already has data; or
 * - `CucaDiagram#eventuallyBuildPhantomGroups` (`:325-336`), from `getTextBlock`
 *   (`:464`) after every command, makes what is left `GroupType.PACKAGE`, in
 *   quark order (`Plasma#quarks`).
 */
import type { State } from './ast.js';
import { nextCreationIndex, type ParseState } from './state-parse-state.js';

/** `ensureParentState`: `ancestors` is the path above the leaf, root first. */
export function ensureParentState(ps: ParseState, ancestors: readonly State[]): void {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const parent = ancestors[i]!;
    if (parent.autoPhantom !== true) return;
    delete parent.autoPhantom;
    parent.creationIndex = nextCreationIndex(ps);
  }
}

/**
 * `eventuallyBuildPhantomGroups`: the flag stays, because a package is never
 * autarkic (`abel/Entity.java:691-692`) and its title is bold
 * (`svek/ClusterHeader.java:161-162`, `plantuml.skin:72-76`).
 */
export function buildPhantomGroups(ps: ParseState): void {
  for (const phantom of ps.phantoms) {
    if (phantom.autoPhantom === true && phantom.creationIndex === undefined) {
      phantom.creationIndex = nextCreationIndex(ps);
    }
  }
}
