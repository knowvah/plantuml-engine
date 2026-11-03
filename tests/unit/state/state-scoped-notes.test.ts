/**
 * dss T3f: a note is a leaf of the pass its scope belongs to
 * (`GroupMakerState.java:113-136`, `SvekResult.java:82-90`). Expected values are
 * the jar's (`scripts/oracle-render.sh`; rows `state__probe-note-in-*`).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseState } from '../../../src/diagrams/state/parser.js';
import { layoutState } from '../../../src/diagrams/state/layout.js';
import { classifyDiagram } from '../../../src/diagrams/state/state-composite-classify.js';
import { noteFlatLinks, noteScopesOf, hasLocalContent } from '../../../src/diagrams/state/state-composite-detect.js';
import type { NoteEdgeCandidate, NoteSpec } from '../../../src/diagrams/state/state-note-layout.js';
import { moveNotesToCreationOrder, noteLineGeo, noteLinesOf } from '../../../src/diagrams/state/state-note-lines.js';
import type { StateDiagramAST, StateNote } from '../../../src/diagrams/state/ast.js';
import type { StateNodeGeo } from '../../../src/diagrams/state/state-geo-types.js';
import { defaultTheme } from '../../../src/core/theme.js';

function block(...lines: string[]): UmlSource {
  return { lines, type: 'state' };
}

function ast(...lines: string[]): StateDiagramAST {
  const parsed = parseState(block(...lines));
  if ('refused' in parsed) throw new Error(parsed.message);
  return parsed;
}

function geometry(...lines: string[]): ReturnType<typeof layoutState> {
  return layoutState(ast(...lines), defaultTheme, new DeterministicMeasurer());
}

function kinds(nodes: readonly StateNodeGeo[]): string[] {
  return nodes.map((n) => `${n.kind}:${n.creationIndex ?? ''}`);
}

describe('parser passes (`StateDiagramFactory.java:97-105`)', () => {
  it('creates an attached note after every link of the document', () => {
    // jar: `state B`, `note left of B : k`, `C --> D` is B ent1, C ent2, D ent3,
    // lnk4, GMN5, note ent6.
    const parsed = ast('state B', 'note left of B : k', 'C --> D');
    expect(parsed.notes?.[0]?.creationIndex).toBe(6);
    expect(parsed.transitions[0]?.creationIndex).toBe(4);
  });

  it('skips the note Link ctor tick before the next note (`Link.java:135`)', () => {
    // jar twonotes: B ent1, GMN2, note ent3, lnk4, GMN5, note ent6.
    const parsed = ast('state B', 'note left of B : a', 'note left of B : bb');
    expect(parsed.notes?.map((n) => n.creationIndex)).toEqual([3, 6]);
  });

  it('counts the multi-line form the same way', () => {
    const parsed = ast('state B', 'note left of B', 'a', 'end note', 'note left of B', 'bb', 'end note');
    expect(parsed.notes?.map((n) => n.creationIndex)).toEqual([3, 6]);
  });

  it('does not make a group the last entity (`CucaDiagram.java:349-365`)', () => {
    const refused = parseState(block('state A {', 'note left : k', '}')) as ParseRefusal;
    expect(refused.message).toBe('Nothing to note to');
  });
});

describe('note target refusal (`CucaDiagram.java:266-274`)', () => {
  it('refuses the current group as its own target', () => {
    const refused = parseState(block('state A {', 'state B', 'note left of A : k', '}')) as ParseRefusal;
    expect(refused.message).toBe('Not known: A');
  });

  it('accepts a state outside the current group', () => {
    const parsed = ast('state Z', 'state A {', 'state B', 'note left of Z : k', '}');
    expect(parsed.notes?.[0]).toMatchObject({ target: 'Z', scopeId: 'A' });
  });

  it('accepts another note as the target', () => {
    const parsed = ast('note as N', 'k', 'end note', 'note left of N : j');
    expect(parsed.notes?.[1]?.target).toBe('N');
  });

  it('leaves a dotted name to the paths the by-name index cannot answer', () => {
    const parsed = ast('state A.B', 'note left of A.B : k');
    expect(parsed.notes?.[0]?.target).toBe('A.B');
  });

  it('refuses a note linked across a concurrent region (`StateDiagram.java:232-241`)', () => {
    const refused = parseState(
      block('state A {', 'state B', '--', 'state C', 'note left of B : k', '}'),
    ) as ParseRefusal;
    expect(refused.refused).toBe(true);
    expect(refused.message).toContain('cannot be linked out of this concurrent state');
  });

  it('accepts a note linked inside its region', () => {
    const parsed = ast('state A {', 'state B', '--', 'state C', 'note left of C : k', '}');
    expect(parsed.notes?.[0]?.scopeId).toBe('A::CONC1');
  });
});

describe('note body lines (`BlocLines#removeEmptyColumns`, `BlocLines.java:234-263`)', () => {
  it('strips only the common columns, keeps blank lines and trailing spaces', () => {
    const parsed = ast('state B', 'note as N', '  aaa  ', '', '    bbb', 'end note');
    expect(parsed.notes?.[0]?.text).toBe('aaa  \n\n  bbb');
  });

  it('applies to a link note, keeping its relative indent', () => {
    const parsed = ast('A --> B', 'note on link', ' aaa', '  bbb', 'end note');
    expect(parsed.transitions[0]?.linkNote).toBe('aaa\n bbb');
  });

  it('trims a one-line link note', () => {
    const parsed = ast('A --> B', 'note on link :   aaa  ');
    expect(parsed.transitions[0]?.linkNote).toBe('aaa');
  });
});

describe('classification reads note links (`Entity.java:706-708`)', () => {
  const scoped = (scopeId: string, target?: string): StateNote => ({
    id: 'n',
    text: 'k',
    scopeId,
    ...(target !== undefined ? { target, position: 'left' as const } : {}),
  });

  it('gives a note link its scope as the container, a region its owner', () => {
    expect(noteFlatLinks([scoped('A', 'B')])).toEqual([{ from: '[*]', to: 'B', scopeId: 'A' }]);
    expect(noteFlatLinks([scoped('A::CONC2', 'B')])).toEqual([{ from: '[*]', to: 'B', scopeId: 'A' }]);
    expect(noteFlatLinks([scoped('', 'B')])).toEqual([{ from: '[*]', to: 'B' }]);
    expect(noteFlatLinks([scoped('A')])).toEqual([]);
    expect(noteFlatLinks(undefined)).toEqual([]);
  });

  it('a note inside a composite linked out makes the composite a cluster', () => {
    const parsed = ast('state Z', 'state A {', 'state B', 'note left of Z : k', '}');
    expect(classifyDiagram(parsed.states, parsed.transitions, parsed.notes).kindOf.get('A')).toBe('cluster');
    expect(classifyDiagram(parsed.states, parsed.transitions).kindOf.get('A')).toBe('autonom');
  });

  it('a note outside linked to a composite inside it leaves the composite autonom', () => {
    const parsed = ast('state A {', 'state B', '}', 'note left of A : k');
    expect(classifyDiagram(parsed.states, parsed.transitions, parsed.notes).kindOf.get('A')).toBe('autonom');
  });

  it('a composite holding only a note has local content (`GroupMakerState.java:113`)', () => {
    const parsed = ast('state A {', 'note as N', 'k', 'end note', '}');
    const a = parsed.states[0]!;
    expect(hasLocalContent(a)).toBe(false);
    expect(hasLocalContent(a, noteScopesOf(parsed.notes))).toBe(true);
    expect(classifyDiagram(parsed.states, parsed.transitions, parsed.notes).kindOf.get('A')).toBe('autonom');
  });
});

describe('notes in the geometry tree (rows `state__probe-note-in-*`)', () => {
  it('draws a note in an autonom composite as its child, at the jar position', () => {
    const geo = geometry('state A {', 'state B', 'note as N', 'k', 'end note', '}');
    const a = geo.states[0]!;
    expect(kinds(a.children)).toEqual(['normal:2', 'note:3']);
    // jar: A 7,7 131.75x99; note box x 87.25, y 56.5, 27.5x23.
    expect(a.width).toBeCloseTo(131.75, 2);
    expect(a.height).toBeCloseTo(99, 2);
    const note = a.children[1]!;
    expect(note.x).toBeCloseTo(87.25, 2);
    expect(note.y).toBeCloseTo(56.5, 2);
    expect(note.width).toBeCloseTo(27.5, 2);
  });

  it('resolves an attached note to its Opale in its own pass', () => {
    const geo = geometry('state A {', 'state B', 'note left of B : k', '}');
    const note = geo.states[0]!.children.find((c) => c.kind === 'note')!;
    expect(note.noteOpale?.direction).toBe('right');
  });

  it('keeps each concurrent region its own notes, with their Opale', () => {
    const geo = geometry('state A {', 'state B', 'note left of B : k', '--', 'state C', 'note right of C : j', '}');
    const regions = geo.states[0]!.concurrentRegions!;
    const noteOf = (i: number) => regions[i]!.children.find((c) => c.kind === 'note')!;
    expect(noteOf(0).noteOpale?.direction).toBe('right');
    expect(noteOf(1).noteOpale?.direction).toBe('left');
  });

  it('draws a region-0 holding only a note (`GroupMakerState.java:125`)', () => {
    const geo = geometry('state A {', 'note as N', 'k', 'end note', '--', 'state B', '}');
    expect(geo.states[0]!.concurrentRegions).toHaveLength(2);
    expect(kinds(geo.states[0]!.concurrentRegions![0]!.children)).toEqual(['note:2']);
  });

  it('draws a cluster composite note as a child of the shared pass', () => {
    const geo = geometry('state A {', 'state B', 'note left of B : k', '}', 'C --> B');
    const a = geo.states.find((s) => s.id === 'A')!;
    expect(a.clusterHeaderHeight).toBeDefined();
    expect(a.children.map((c) => c.kind)).toEqual(['normal', 'note']);
    expect(a.children[1]!.noteOpale?.direction).toBe('right');
  });

  it('a note on a cluster composite has no node to notch, so it keeps a dashed line', () => {
    const geo = geometry('state A {', 'state B', '}', 'note left of A : k', 'C --> B');
    const note = geo.states.find((s) => s.kind === 'note')!;
    expect(note.noteOpale).toBeUndefined();
    const line = geo.transitions.find((t) => t.noteLinkId !== undefined)!;
    expect(line.noteLinkId).toBe('GMN5-A');
    expect(line.creationIndex).toBe(7);
  });

  it('a composite inks a `||` separator past its own box (`LimitFinder.java:179-182`)', () => {
    // jar conc-vert: separator y2 109, document height 124.
    const geo = geometry('state A {', 'state B', '||', 'state C', '}');
    expect(geo.states[0]!.separators?.[0]?.y2).toBeCloseTo(109, 2);
    expect(geo.totalHeight).toBe(124);
  });
});

describe('moveNotesToCreationOrder (`GraphvizImageBuilder.java:348-355`)', () => {
  const spec = (id: string, creationIndex?: number): NoteSpec => ({
    kind: 'note',
    id,
    lines: [],
    opalisable: false,
    ...(creationIndex !== undefined ? { creationIndex } : {}),
  });
  const ids = (x: string): string => x;

  it('moves a note ahead of the first sibling created after it', () => {
    const list = ['B', 'C', 'N'];
    moveNotesToCreationOrder(
      list,
      ids,
      [spec('N', 2)],
      [
        { id: 'B', creationIndex: 3 },
        { id: 'C', creationIndex: 4 },
      ],
    );
    expect(list).toEqual(['N', 'B', 'C']);
  });

  it('keeps two notes in their own order', () => {
    const list = ['B', 'N1', 'N2'];
    moveNotesToCreationOrder(list, ids, [spec('N1', 1), spec('N2', 2)], [{ id: 'B', creationIndex: 3 }]);
    expect(list).toEqual(['N1', 'N2', 'B']);
  });

  it('leaves a later note last, and one with no tick where it is', () => {
    const list = ['B', 'N', 'M'];
    moveNotesToCreationOrder(list, ids, [spec('N', 9), spec('M')], [{ id: 'B', creationIndex: 3 }]);
    expect(list).toEqual(['B', 'N', 'M']);
  });

  it('passes over a node no sibling names', () => {
    const list = ['clusterMember', 'B', 'N'];
    moveNotesToCreationOrder(list, ids, [spec('N', 2)], [{ id: 'B', creationIndex: 3 }]);
    expect(list).toEqual(['clusterMember', 'N', 'B']);
  });
});

describe('noteLinesOf (`SvekEdge.java:769-770,833-834`)', () => {
  const link = (over: Partial<NoteEdgeCandidate> = {}): NoteEdgeCandidate => ({
    id: 'e',
    noteId: 'n',
    target: 'B',
    fromNote: true,
    minLen: 0,
    opalisable: true,
    gmnName: 'GMN2',
    creationIndex: 4,
    ...over,
  });
  const p = (n: number) => Array.from({ length: n }, (_, i) => ({ x: i, y: i }));
  const ends = () => ({ from: 'n', to: 'B' });

  it('draws nothing for one bezier on an opalisable note', () => {
    expect(noteLinesOf([link()], () => ({ points: p(4) }), ends)).toEqual([]);
  });

  it('draws a line for more than one bezier', () => {
    const [line] = noteLinesOf([link()], () => ({ points: p(7) }), ends);
    expect(line).toMatchObject({ key: 'e', from: 'n', to: 'B', svgId: 'GMN2-B', creationIndex: 4 });
    expect(noteLineGeo(line!, line!.points)).toMatchObject({ noteLinkId: 'GMN2-B', creationIndex: 4, from: 'n' });
  });

  it('draws a line for a note that is not opalisable, host first when the host leads', () => {
    const [line] = noteLinesOf([link({ opalisable: false, fromNote: false })], () => ({ points: p(4) }), ends);
    expect(line?.svgId).toBe('B-GMN2');
  });

  it('skips a link whose edge or endpoints the pass did not lay out', () => {
    expect(noteLinesOf([link()], () => undefined, ends)).toEqual([]);
    expect(
      noteLinesOf(
        [link({ opalisable: false })],
        () => ({ points: p(4) }),
        () => undefined,
      ),
    ).toEqual([]);
  });

  it('omits the tick when the note had none', () => {
    const noTick: NoteEdgeCandidate = {
      id: 'e',
      noteId: 'n',
      target: 'B',
      fromNote: true,
      minLen: 0,
      opalisable: false,
      gmnName: 'GMN0',
    };
    const [line] = noteLinesOf([noTick], () => ({ points: p(4) }), ends);
    expect(line?.creationIndex).toBeUndefined();
    expect(noteLineGeo(line!, line!.points).creationIndex).toBeUndefined();
  });
});
