/**
 * state-node-label (snl, #235, D5): `CucaDiagram#isOrphanedTransitionLabel`. A `STATE_TRANSITION_LABEL` leaf
 * (`'transitionLabel'`) is hidden, and removed, once the entity at the other end of one of its links is removed or
 * hidden: both `isHidden(leaf)` and `isRemoved(leaf)` consult it after their own fold (`CucaDiagram.java:790-791`,
 * `:808-809`), and it asks `other.isRemoved() || other.isHidden()` (`:827`), where `Entity#isHidden`/`#isRemoved` also
 * hold for an entity whose parent container is hidden or removed (`abel/Entity.java:434-460`).
 *
 * The cross matters: a hidden host makes its label REMOVED, so the label's two links leave the graph as a removed
 * entity's links do, and the jar writes neither them nor their comments (`snl-hide-label-host`).
 *
 * @see ~/git/knowvah/plantuml/src/main/java/net/atmp/CucaDiagram.java:778-831
 */
import type { State, StateDiagramAST, Transition } from './ast.js';

/** Every state's parent (`undefined` at the top), walking children and concurrent regions. */
function parentsOf(states: readonly State[], parent: State | undefined, out: Map<string, State | undefined>): void {
  for (const s of states) {
    out.set(s.id, parent);
    parentsOf(s.children, s, out);
    for (const region of s.concurrentRegions) parentsOf(region, s, out);
  }
}

/** Every transition label leaf, and every transition of the diagram, at any depth. */
function collect(states: readonly State[], labels: string[], links: Transition[]): void {
  for (const s of states) {
    if (s.kind === 'transitionLabel') labels.push(s.id);
    links.push(...s.transitions);
    collect(s.children, labels, links);
    for (const region of s.concurrentRegions) collect(region, labels, links);
  }
}

/** `Entity#isHidden() || Entity#isRemoved()` over the diagram's own folds: the entity or any parent container. */
function goneWithParents(
  id: string,
  gone: ReadonlySet<string>,
  parents: ReadonlyMap<string, State | undefined>,
): boolean {
  for (let cur: string | undefined = id; cur !== undefined; cur = parents.get(cur)?.id) {
    if (gone.has(cur)) return true;
  }
  return false;
}

/**
 * The transition-label leaves `isOrphanedTransitionLabel` holds for, given the ids the `hide` and `remove` folds
 * already reach. The caller adds the result to both its hidden and its removed set.
 */
export function orphanedTransitionLabels(
  ast: StateDiagramAST,
  hidden: ReadonlySet<string>,
  removed: ReadonlySet<string>,
): Set<string> {
  const labels: string[] = [];
  const links: Transition[] = [...ast.transitions];
  collect(ast.states, labels, links);
  const result = new Set<string>();
  if (labels.length === 0) return result;
  const parents = new Map<string, State | undefined>();
  parentsOf(ast.states, undefined, parents);
  const gone = new Set([...hidden, ...removed]);
  for (const label of labels) {
    for (const l of links) {
      const other = l.from === label ? l.to : l.to === label ? l.from : undefined;
      if (other === undefined || other === label) continue;
      if (goneWithParents(other, gone, parents)) {
        result.add(label);
        break;
      }
    }
  }
  return result;
}
