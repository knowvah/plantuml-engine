/**
 * sdd2 T3c2: participants clear group frames -- `GroupingTile#addConstraints`
 * (`teoz/GroupingTile.java:367-666`) -- and top-level `&` tiles stay disjoint
 * (`PlayingSpace#addParallelSiblingDisjointConstraints`, `:162-266`).
 *
 * Expected lifeline x values are the jar's (`scripts/oracle-render.sh`
 * probes, source inlined; corpus slug named where one exists).
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { defaultTheme } from '../../../src/core/theme.js';
import type { SequenceGeometry } from '../../../src/diagrams/sequence/ast.js';
import { layoutSequence } from '../../../src/diagrams/sequence/layout.js';
import { parseSequence } from '../../../src/diagrams/sequence/parser.js';
import {
  scanMessageLabels,
  type SpanConstraint,
} from '../../../src/diagrams/sequence/sequence-layout-participant-constraints.js';
import { astOrThrow } from '../../helpers/parse-ast.js';
import { sequenceSource } from '../../helpers/sequence-source.js';

const measurer = new DeterministicMeasurer();

function centreOf(lines: readonly string[], id: string): number {
  const geo: SequenceGeometry = layoutSequence(
    astOrThrow(parseSequence(sequenceSource(lines)), 'sequence'),
    defaultTheme,
    measurer,
  );
  return geo.participants.find((p) => p.id === id)!.centerX;
}

/** Two groups, A/B then C/D, each `alt` with a self message in its `else`. */
function altPair(parallel: boolean): string[] {
  return [
    'alt',
    '    A->B: message',
    'else default',
    '    B->B: other',
    'end',
    `${parallel ? '& ' : ''}alt`,
    '    C->D: message',
    'else default',
    '    D->D: other',
    'end',
  ];
}

describe('ensureFollowingParticipantClearsFrame (GroupingTile.java:411-456)', () => {
  it("pushes the next participant's lifeline past a self loop's drawn extent + 25 (probe q1: b at 96)", () => {
    // stableMaxX: CommunicationTileSelf#getDrawnMaxX = posC2 + max(42, 7 + text)
    // (:303-307), plus MARGINX + EXTERNAL_MARGINX2.
    expect(centreOf(['group g', 'a -> a : self', 'end', 'a -> b : hi'], 'b')).toBeCloseTo(96, 3);
  });

  it('clears the frame of the group before it (caciga-47: C at 172.731)', () => {
    expect(centreOf(altPair(false), 'C')).toBeCloseTo(172.731, 3);
  });
});

describe('addParallelSiblingDisjointConstraints (PlayingSpace.java:188-266)', () => {
  it("pushes a `&` group past its sibling's whole footprint (codeti-52: C at 191.731)", () => {
    // bMin.ensureBiggerThan(aMax): posC(C) - 16 - 3 >= max(B's loop + 16, ...) + 9.
    expect(centreOf(altPair(true), 'C')).toBeCloseTo(191.731, 3);
  });

  it('does not compare across a `++` message: its LifeEventTile closes the run (rugeco-70: b at 137.344)', () => {
    const lines = [
      'participant a',
      'participant b',
      'participant c',
      'b ->> c ++: Outside Group',
      '&opt test',
      '  activate a',
      '  a ->> b --++ : Inside Group',
      'end',
      'deactivate a',
      'deactivate c',
      'deactivate b',
    ];
    expect(centreOf(lines, 'b')).toBeCloseTo(137.344, 3);
  });
});

/** Jar probes (`scripts/oracle-render.sh`): every lifeline x, in order. */
/** Four participants and an `opt`, closed and followed by a `& opt` on c/d. */
const SIBLINGS_HEAD = ['participant a', 'participant b', 'participant c', 'participant d', 'opt'];
const SIBLINGS_TAIL = ['end', '& opt', 'c -> d : y', 'end'];

const PROBES: readonly { name: string; lines: readonly string[]; lifelines: readonly number[] }[] = [
  {
    // ensurePrecedingParticipantClearsFrame: posC(a) >= posC(x) + 25 (:483).
    name: 'the participant before a group clears its frame',
    lines: ['participant x', 'participant a', 'participant b', 'group g', 'a -> b : hello there', 'end'],
    lifelines: [20.5, 51.894, 136.587],
  },
  {
    // stableMinX: a reverse loop's getDrawnMinX, posC - drawnWidth (:294-298).
    name: 'a reverse loop pushes its own participant clear of the previous one',
    lines: ['participant x', 'participant a', 'participant b', 'group g', 'a <- a : back', 'end', 'a -> b : z'],
    lifelines: [20.5, 87.5, 148.731],
  },
  {
    // stableMaxX: LifeEventTile#getMaxX, posC + level * 5 (LifeEventTile.java:151-158).
    name: "a group's life events reach the next participant",
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'group g',
      'a -> b ++ : on',
      'activate b',
      'end',
      'b -> c : q',
    ],
    lifelines: [29, 72.462, 107.462],
  },
  {
    // ensureClearsFrameOf recurses with the margin grown by 25 (:614).
    name: 'a nested group clears by its own frame too',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'group outer',
      'group inner',
      'a -> a : self',
      'end',
      'end',
      'a -> c : q',
    ],
    lifelines: [48, 155.925, 187.319],
  },
  {
    // The `**` CREATE LifeEventTile on the created lifeline (CommandArrow.java:397-398).
    name: 'a create inside a group',
    lines: ['participant a', 'participant b', 'participant c', 'group g', 'a -> b ** : make', 'end', 'b -> c : q'],
    lifelines: [29, 95.662, 127.056],
  },
  {
    // ensureDisjoint(a, b) of two `&` messages sharing no anchor (PlayingSpace.java:240-266).
    name: 'two `&` messages',
    lines: ['participant a', 'participant b', 'participant c', 'participant d', 'a -> b : one', '& c -> d : two'],
    lifelines: [20.894, 66.588, 97.981, 142.213],
  },
  {
    name: 'a `&` message sharing a participant',
    lines: ['participant a', 'participant b', 'participant c', 'a -> b : one', '& b -> c : two'],
    lifelines: [20.894, 66.588, 110.819],
  },
  {
    // CommunicationExoTile footprints, posC -/+ width (:206-240).
    name: 'exo messages in two `&` groups',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      '[-> b : x',
      'end',
      '& opt',
      'c ->] : y',
      'end',
    ],
    lifelines: [27.713, 59.5, 131.538, 203.575],
  },
  {
    name: 'an activate inside a group, after the participant before it',
    lines: [
      'participant x',
      'participant a',
      'participant b',
      'group g',
      'activate a',
      'a -> b : x',
      'end',
      'deactivate a',
    ],
    lifelines: [20.5, 51.894, 83.681],
  },
  {
    name: 'life events inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'a -> b ++ : x',
      'activate a',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [34, 69.5, 120.038, 151.431],
  },
  {
    // A nested group child reads as its getMinX/getMaxX (GroupingTile.java:984-990).
    name: 'a nested group inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'group inner',
      'a -> b : x',
      'end',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [48, 79.787, 174.925, 206.319],
  },
  {
    name: 'a reverse loop inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'b <- b : rev',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [20.894, 87.894, 159.931, 191.325],
  },
  {
    // ElseTile#getMaxX, the group's getMinX + else width (ElseTile.java:153-161).
    name: 'an else label inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'alt',
      'a -> b : x',
      'else a very long else label here',
      'a -> b : z',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [29, 60.787, 182.406, 213.8],
  },
  {
    name: 'a create inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'a -> c ** : x',
      'end',
      '& opt',
      'd -> d : y',
      'end',
    ],
    lifelines: [29, 60.787, 92.181, 136.181],
  },
  {
    name: 'a reverse message inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'b -> a : back',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [29, 80.462, 124.462, 155.856],
  },
  {
    // A NoteLeft wrapper keeps the inner tile's getMaxX (CommunicationTileNoteLeft.java:223-225).
    name: 'a left note on a message inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'a -> b : x',
      'note left : n',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [67.231, 99.019, 143.019, 174.412],
  },
  {
    name: 'a `&` message to the left of a self message',
    lines: ['participant a', 'participant b', 'participant c', 'c -> c : x', '& a -> b : y'],
    lifelines: [20.894, 52.681, 84.075],
  },
  {
    // stableMinX: ReferenceTile's first, its leftmost participant's posB (:163-171).
    name: 'a ref inside a group, after the participant before it',
    lines: ['participant x', 'participant a', 'participant b', 'group g', 'ref over a, b : r', 'end'],
    lifelines: [20.5, 56.394, 98.719],
  },
  {
    // A note on no participant touches all of them (GroupingTile.java:691-700).
    name: 'a note across every participant inside a group',
    lines: ['participant x', 'participant a', 'participant b', 'group g', 'note across : all', 'end', 'a -> b : q'],
    lifelines: [39.5, 70.894, 102.681],
  },
  {
    // The reverse loop's adjustment, 5 when live (CommunicationTileSelf.java:295-297).
    name: 'a live reverse loop inside a group',
    lines: [
      'participant x',
      'participant a',
      'participant b',
      'activate a',
      'group g',
      'a <- a : back',
      'end',
      'a -> b : z',
    ],
    lifelines: [20.5, 92.5, 153.731],
  },
  {
    name: 'an exo message with a right note inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      '[-> b : x',
      'note right : n',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [27.713, 59.5, 141.731, 173.125],
  },
  {
    // A ReferenceTile's first, posB, as a right sibling's min (ReferenceTile.java:163-171).
    name: 'a ref inside the right `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'a -> b : a long message here',
      'end',
      '& opt',
      'c -> d : y',
      'ref over c, d : r',
      'end',
    ],
    lifelines: [29, 174.306, 228.806, 271.525],
  },
  {
    name: 'a `&` exo message after a message',
    lines: ['participant a', 'participant b', 'participant c', 'a -> b : a long message here', '& [-> c : in'],
    lifelines: [20.894, 166.2, 200.356],
  },
  {
    name: 'a live reverse loop inside a `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'activate b',
      'opt',
      'b <- b : rev',
      'end',
      '& opt',
      'c -> d : y',
      'end',
    ],
    lifelines: [20.894, 92.894, 164.931, 196.325],
  },
  {
    // A reversed create's point2 is the head's posD (CommunicationTile.java:435-443).
    name: 'a reversed create inside the right `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'participant d',
      'opt',
      'a -> b : long message here',
      'end',
      '& opt',
      'd -> c ** : make',
      'end',
    ],
    lifelines: [29, 163.5, 207.5, 273.769],
  },
  {
    // An empty nested group touches nobody, so its title pushes nothing (:648-649).
    name: 'an empty nested group',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'group outer',
      'a -> b : x',
      'group inner',
      'end',
      'end',
      'b -> c : q',
    ],
    lifelines: [42.894, 74.681, 126.469],
  },
  // The note-on-message wrappers' footprints (`TileBuilder.java:86-133`), which
  // `ensureDisjoint` compares (`PlayingSpace.java:240-276`). Jar probes,
  // 1.2026.11beta1, 2026-11-19.
  {
    // CommunicationTileNoteRight#getMaxX: posC(ls) + level * 5 + width (:118-126,245-249).
    name: 'a right note on a message inside a `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'a -> b : x', 'note right : a wider note here', ...SIBLINGS_TAIL],
    lifelines: [29, 60.787, 236.131, 267.525],
  },
  {
    // CommunicationTileSelfNoteRight#getMaxX: the loop's getMaxX + width (:111-113,160-164).
    name: 'a self message with a right note inside a `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'b -> b : s', 'note right : a wider note here', ...SIBLINGS_TAIL],
    lifelines: [20.894, 52.681, 270.025, 301.419],
  },
  {
    // CommunicationTileSelfNoteLeft#getDrawnMinX: the loop's drawn min - width (:176-180).
    name: 'a self message with a left note inside the right `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'a -> b : x', 'end', '& opt', 'c -> c : s', 'note left : a wider note here', 'end'],
    lifelines: [29, 60.787, 251.381, 323.419],
  },
  {
    // CommunicationTileNoteBottomTopAbstract#getMaxX: max(inner max, inner min + width) (:147-154).
    name: 'a bottom note on a message inside a `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'a -> b : x', 'note bottom : a much wider bottom note here', ...SIBLINGS_TAIL],
    lifelines: [29, 60.787, 282.913, 314.306],
  },
  {
    // A right note on a create message hangs from posD (CommunicationTileNoteRight.java:121-123).
    name: 'a create with a right note inside the right `&` sibling group',
    lines: [
      'participant a',
      'participant b',
      'participant d',
      'opt',
      'a -> b : x',
      'end',
      '& opt',
      'create c',
      'a -> c : make',
      'note right : a wider note here',
      'end',
      'c -> d : y',
    ],
    lifelines: [29, 60.787, 101.038, 132.431],
  },
  {
    // MessageExo#overrideNotePosition: a left-border arrow takes its notes on the RIGHT (MessageExo.java:62-69).
    name: 'an exo message with a left note inside the right `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'a -> b : x', 'end', '& opt', '[-> c : e', 'note left : a wider note here', 'end'],
    lifelines: [29, 60.787, 151.269, 307.613],
  },
  {
    // One wrapper per note, each around the one before (TileBuilder.java:102-121).
    name: 'two notes on a message inside a `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'a -> b : x', 'note left : l', 'note right : a wider note here', ...SIBLINGS_TAIL],
    lifelines: [62.925, 94.712, 270.056, 301.45],
  },
  {
    // ...and a right-border arrow its notes on the LEFT, for the group's clearance too.
    name: 'an exo message to the right border with a right note inside a `&` sibling group',
    lines: [...SIBLINGS_HEAD, 'b ->] : e', 'note right : a wider note here', ...SIBLINGS_TAIL],
    lifelines: [20.894, 177.237, 252.469, 283.862],
  },
  {
    name: 'an exo message from the left border with a left note clears the following participant',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'group g',
      '[-> b : e',
      'note left : a wider note here',
      'end',
      'b -> c : z',
    ],
    lifelines: [28.444, 60.231, 216.575],
  },
  {
    name: 'an exo message to the right border with a right note clears the preceding participant',
    lines: [
      'participant a',
      'participant b',
      'participant c',
      'group g',
      'b ->] : e',
      'note right : a wider note here',
      'end',
      'a -> b : z',
    ],
    lifelines: [20.894, 177.237, 238.469],
  },
];

describe('jar probes', () => {
  for (const probe of PROBES) {
    it(probe.name, () => {
      const geo = layoutSequence(
        astOrThrow(parseSequence(sequenceSource(probe.lines)), 'sequence'),
        defaultTheme,
        measurer,
      );
      geo.participants.forEach((p, i) => expect(p.centerX).toBeCloseTo(probe.lifelines[i]!, 3));
    });
  }
});

describe('footprints the participant row cannot reach (hand-back)', () => {
  /** Every constraint the scan emits for `lines`, as comparable strings. */
  function constraintsOf(lines: readonly string[]): string[] {
    const ast = astOrThrow(parseSequence(sequenceSource(lines)), 'sequence');
    const sorted = [...ast.participants].sort((a, b) => a.order - b.order);
    const out: SpanConstraint[] = [];
    scanMessageLabels(ast.events, sorted, { measurer, levels: undefined, sprites: ast.sprites }, out);
    return out.map((c) => JSON.stringify(c)).sort();
  }

  const siblings = (first: readonly string[], parallel: boolean): string[] => [
    'participant a',
    'participant b',
    'participant c',
    'participant d',
    'opt',
    ...first,
    'end',
    `${parallel ? '& ' : ''}opt`,
    'c -> d : y',
    'end',
  ];

  for (const [name, first] of [
    ['a standalone note (its width)', ['a -> b : x', 'note over a : n']],
    ['a delay (its middle)', ['a -> b : x', '...']],
    ['a divider (the x origin)', ['a -> b : x', '== d ==']],
    ['a `&` note tile (no anchor)', ['note over a : n']],
  ] as const) {
    it(`adds no disjointness for ${name}`, () => {
      expect(constraintsOf(siblings(first, true))).toEqual(constraintsOf(siblings(first, false)));
    });
  }
});

describe('a hand-built AST naming a participant the row never placed', () => {
  it('builds no clearance or disjointness from it', () => {
    const ast = astOrThrow(
      parseSequence(
        sequenceSource(['participant a', 'participant b', 'group g', 'a -> a : x', 'a ->] : y', 'end', '& a -> b : z']),
      ),
      'sequence',
    );
    const frame = ast.events.find((e) => e.kind === 'frame')!;
    if (frame.kind !== 'frame') throw new Error('expected the group');
    frame.branches[0] = frame.branches[0]!.map((e) =>
      e.kind === 'message' ? { ...e, from: 'Z', to: 'Z' } : e.kind === 'messageExo' ? { ...e, participant: 'Z' } : e,
    );
    const sorted = [...ast.participants].sort((x, y) => x.order - y.order);
    const out: SpanConstraint[] = [];
    scanMessageLabels(ast.events, sorted, { measurer, levels: undefined, sprites: ast.sprites }, out);
    // Only the `a -> b` message's own span remains (CommunicationTile.java:404-427).
    expect(out.map((c) => [c.from, c.to])).toEqual([[0, 1]]);
  });

  it('compares no footprint whose message reaches an unplaced participant', () => {
    const ast = astOrThrow(
      parseSequence(
        sequenceSource(['participant a', 'participant b', 'participant c', 'a -> b : one', '& b -> c : two']),
      ),
      'sequence',
    );
    ast.events = ast.events.map((e) => (e.kind === 'message' && e.to === 'c' ? { ...e, to: 'Z' } : e));
    const sorted = [...ast.participants].sort((x, y) => x.order - y.order);
    const out: SpanConstraint[] = [];
    scanMessageLabels(ast.events, sorted, { measurer, levels: undefined, sprites: ast.sprites }, out);
    expect(out.map((c) => [c.from, c.to])).toEqual([[0, 1]]);
  });
});
