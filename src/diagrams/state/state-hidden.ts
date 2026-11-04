/**
 * stdd T5a: `hide X` / `hide <<x>>` on a laid-out geometry. Upstream lays a hidden entity out like
 * any other (`GraphvizImageBuilder` skips only `isRemoved`) and numbers it, then `SvekResult.java:85,98`
 * draw the node, and every link whose end is hidden (`Link.java:458-460`), through `UHidden`, which
 * emits nothing but a link's `UComment` (`AbstractUGraphic.java:128-141`). A hidden composite hides
 * its descendants (`Entity.java:433-438`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekResult.java:85,98
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Entity.java:429-441
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Link.java:458-460
 */
import type { StateGeometry, StateNodeGeo, TransitionGeo } from './state-geo-types.js';

/** Every node id under a hidden one, the hidden ones included (`Entity#isHidden` walks the parents). */
function collectHidden(
  nodes: readonly StateNodeGeo[],
  hidden: ReadonlySet<string>,
  out: Set<string>,
  under: boolean,
): void {
  for (const n of nodes) {
    const isHidden = under || hidden.has(n.id);
    if (isHidden) out.add(n.id);
    collectHidden(n.children, hidden, out, isHidden);
    for (const region of n.concurrentRegions ?? []) collectHidden(region.children, hidden, out, isHidden);
  }
}

function markTransition(t: TransitionGeo, all: ReadonlySet<string>): TransitionGeo {
  return all.has(t.from) || all.has(t.to) ? { ...t, hidden: true } : t;
}

function markNode(n: StateNodeGeo, all: ReadonlySet<string>): StateNodeGeo {
  const children = n.children.map((c) => markNode(c, all));
  const transitions = n.transitions.map((t) => markTransition(t, all));
  const regions = n.concurrentRegions?.map((r) => ({
    ...r,
    children: r.children.map((c) => markNode(c, all)),
    transitions: r.transitions.map((t) => markTransition(t, all)),
  }));
  return {
    ...n,
    children,
    transitions,
    ...(regions !== undefined ? { concurrentRegions: regions } : {}),
    ...(all.has(n.id) ? { hidden: true as const } : {}),
  };
}

/** The geometry with `hidden` set on every hidden node and every link touching one. */
export function markHidden(geo: StateGeometry, hidden: ReadonlySet<string>): StateGeometry {
  if (hidden.size === 0) return geo;
  const all = new Set<string>();
  collectHidden(geo.states, hidden, all, false);
  return {
    ...geo,
    states: geo.states.map((n) => markNode(n, all)),
    transitions: geo.transitions.map((t) => markTransition(t, all)),
  };
}
