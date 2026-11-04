/**
 * stdd T5b: `B --> N` where `N` is a `note as N`. Upstream creates the link to the note leaf like any other
 * (`CommandLinkStateCommon`, `getOrCreateLeaf`), and `GraphvizImageBuilder#isOpalisable`
 * (`GraphvizImageBuilder.java:134-147`) makes a note with ONE link whose other end is not a note an `Opale`:
 * the link is the note's own connector (`EntityImageNote#drawU`'s `opaleLink`), drawn as the notch, never as
 * a `<g class="link">`; the DOT edge stays the link's. Here that is an attached note whose position follows
 * the link's direction, and the transition itself is dropped.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:134-147
 */
import type { NotePosition, State, StateDiagramAST, StateNote, Transition, TransitionDirection } from './ast.js';

/** `A --> N` ranks the note below `A`; `-left->`/`-right->`/`-up->` place it on that side. */
function positionFor(direction: TransitionDirection | undefined, noteIsSource: boolean): NotePosition {
  const dir = direction ?? 'down';
  if (noteIsSource) return dir === 'down' ? 'top' : dir === 'up' ? 'bottom' : dir === 'left' ? 'right' : 'left';
  return dir === 'down' ? 'bottom' : dir === 'up' ? 'top' : dir;
}

function attachIn(
  transitions: readonly Transition[],
  notes: Map<string, StateNote>,
  isState: (id: string) => boolean,
): Transition[] {
  const kept: Transition[] = [];
  for (const t of transitions) {
    const toNote = notes.get(t.to);
    const fromNote = notes.get(t.from);
    if (toNote !== undefined && toNote.target === undefined && isState(t.from)) {
      toNote.target = t.from;
      toNote.position = positionFor(t.direction, false);
      continue;
    }
    if (fromNote !== undefined && fromNote.target === undefined && isState(t.to)) {
      fromNote.target = t.to;
      fromNote.position = positionFor(t.direction, true);
      continue;
    }
    kept.push(t);
  }
  return kept;
}

function collectStateIds(states: readonly State[], out: Set<string>): void {
  for (const s of states) {
    out.add(s.id);
    collectStateIds(s.children, out);
    for (const region of s.concurrentRegions) collectStateIds(region, out);
  }
}

function attachInStates(
  states: readonly State[],
  notes: Map<string, StateNote>,
  isState: (id: string) => boolean,
): State[] {
  return states.map((s) => ({
    ...s,
    transitions: attachIn(s.transitions, notes, isState),
    children: attachInStates(s.children, notes, isState),
  }));
}

/** The AST with every single link to a freestanding note folded into that note's attachment. */
export function attachLinkedNotes(ast: StateDiagramAST): StateDiagramAST {
  const notes = new Map<string, StateNote>();
  for (const n of ast.notes ?? []) if (n.target === undefined) notes.set(n.id, n);
  if (notes.size === 0) return ast;
  const stateIds = new Set<string>();
  collectStateIds(ast.states, stateIds);
  const isState = (id: string): boolean => stateIds.has(id) && !notes.has(id);
  return {
    ...ast,
    states: attachInStates(ast.states, notes, isState),
    transitions: attachIn(ast.transitions, notes, isState),
  };
}
