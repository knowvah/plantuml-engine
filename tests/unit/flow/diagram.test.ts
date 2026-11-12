/**
 * `FlowDiagramFactory`/`FlowDiagram`'s model against the planning probes
 * (`plans/flow-engine-port/probes/`, rendered by the jar on 2026-11-11).
 * Boxes are compared as sets or by label, never in the jar's draw order
 * (flp D4).
 */
import { describe, expect, it } from 'vitest';
import { TileGeometry } from '../../../src/core/golem/TileGeometry.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { FlowDiagram } from '../../../src/diagrams/flow/FlowDiagram.js';
import { initCommandsList, parseFlow } from '../../../src/diagrams/flow/FlowDiagramFactory.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

const { NORTH, SOUTH, EAST, WEST } = TileGeometry;

function flow(body: string): FlowDiagram {
  const parsed = parseFlow(sourceOf(`@startflow\n${body}\n@endflow`));
  if (!(parsed instanceof FlowDiagram)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed;
}

/** `label -> [xmin, ymin]` of every box. */
function layout(diagram: FlowDiagram): Record<string, readonly number[]> {
  const field = diagram.getField()!;
  return Object.fromEntries(
    diagram.getBoxes().map((b) => {
      const p = field.getPosition(b.getTile());
      return [b.getLabel(), [p.getXmin(), p.getYmin()]];
    }),
  );
}

const BEMIXO = [
  '10 "START"',
  's 20 "FINDHW()"',
  's 30 "GetTable()"',
  's 40 "i=0"',
  's 50 "is i==TopologySize?"',
  's 60 "return result"',
  'e 70 "is dynamic data for this C?"',
  'e 80 "Find Data on the heap for C"',
  'n 90 "Can the buffer accommodate?"',
  'w 50',
].join('\n');

describe('FlowDiagramFactory', () => {
  it('has the two commands, CommandLineSimple first', () => {
    expect(initCommandsList().map((c) => c.constructor.name)).toEqual(['CommandLineSimple', 'CommandLink']);
  });

  it.each([
    ['cov-blank-line', '10 "A"\n\ns 20 "B"', 2],
    ['cov-title', 'title T\n10 "A"', 1],
    ['cov-title-after', '10 "A"\ntitle T', 2],
    ['cov-skinparam', '10 "A"\nskinparam backgroundColor red', 2],
    ['cov-scale', 'scale 2\n10 "A"', 1],
    ['cov-no-space', '10"A"', 1],
    ['cov-label-guillemets', '10 «A»', 1],
  ])('%s is Syntax Error? on its line', (_slug, body, line) => {
    const refusal = parseRefusalOf(parseFlow(sourceOf(`@startflow\n${body}\n@endflow`)));
    expect(refusal?.message).toBe('Syntax Error?');
    expect(refusal?.consumed).toBe(line);
  });
});

describe('the jar crashes, so the port throws (flp D5)', () => {
  it.each([
    ['cov-link-unknown', '10 "A"\ns 99', 'IllegalArgumentException: 99'],
    ['cov-link-first', '10', 'IllegalArgumentException: 10'],
    ['cov-collision-vertical', '10 "A"\ns 20 "B"\nn 30 "C"', 'IllegalArgumentException'],
    ['cov-link-nonadjoining', '10 "A"\ns 20 "B"\ns 30 "C"\nn 10', 'IllegalArgumentException'],
    ['cov-duplicate-id', '10 "A"\ns 10 "B"\ns 30 "C"\ne 10', 'IllegalArgumentException'],
  ])('%s throws %s', (_slug, body, name) => {
    expect(() => flow(body)).toThrow(name);
  });
});

describe('FlowDiagram model', () => {
  it('describes itself as upstream does', () => {
    expect(flow('10 "A"').getDescription()).toBe('(Flow Diagram)');
  });

  it('builds bemixo-79-xulu250: 9 boxes, 9 paths in source order', () => {
    const d = flow(BEMIXO);
    expect(d.getBoxes().map((b) => b.getId())).toEqual(['10', '20', '30', '40', '50', '60', '70', '80', '90']);
    expect(layout(d)).toEqual({
      START: [0, 0],
      'FINDHW()': [0, 2],
      'GetTable()': [0, 4],
      'i=0': [0, 6],
      'is i==TopologySize?': [0, 8],
      'return result': [0, 10],
      'is dynamic data for this C?': [2, 10],
      'Find Data on the heap for C': [4, 10],
      'Can the buffer accommodate?': [4, 8],
    });
    const paths = d.getField()!.getPaths();
    expect(paths.map((p) => p.getStart().getGeometry())).toEqual([
      SOUTH,
      SOUTH,
      SOUTH,
      SOUTH,
      SOUTH,
      EAST,
      EAST,
      NORTH,
      WEST,
    ]);
  });

  it('parses an upper-case orientation, a bare label line and leading blanks as the jar did', () => {
    // cov-upper-orientation: `S 20 "B"` goes south.
    expect(layout(flow('10 "A"\nS 20 "B"'))).toEqual({ A: [0, 0], B: [0, 2] });
    // cov-orientation-only: `s "A"` is id `s`, the root.
    const only = flow('s "A"');
    expect(only.getBoxes().map((b) => [b.getId(), b.getLabel()])).toEqual([['s', 'A']]);
    // cov-leading-space: leading spaces and a tab are trimmed.
    expect(layout(flow('  10 "A"\n\ts 20 "B"'))).toEqual({ A: [0, 0], B: [0, 2] });
  });

  it('ignores the first line orientation and keeps inner quotes (flp D8)', () => {
    const d = flow('w 10 "say "hi""\ne 20 "B"');
    expect(layout(d)).toEqual({ 'say "hi"': [0, 0], B: [2, 0] });
  });

  it('a link adds a path and does not move lastTile', () => {
    // cov-link-self: `s 10` links the root to itself.
    const self = flow('10 "A"\ns 10');
    expect(self.getField()!.getPaths()).toHaveLength(1);
    // cov-link-back then a new box: the box goes under B, not under A.
    const d = flow('10 "A"\ns 20 "B"\nn 10\ns 30 "C"');
    expect(layout(d)).toEqual({ A: [0, 0], B: [0, 2], C: [0, 4] });
  });

  it('links a same-row WEST->EAST pair at any distance and trims trailing blanks', () => {
    // cov-link-same-row-far: `w 10` from C (x4) to A (x0), 2 cells apart.
    const far = flow('10 "A"\ne 20 "B"\ne 30 "C"\nw 10');
    const last = far.getField()!.getPaths().at(-1)!;
    expect([last.getStart().getTile().getNum(), last.getDest().getTile().getNum()]).toEqual([2, 0]);
    // cov-trailing-space.
    expect(layout(flow('10 "A" \ns 20 "B"  '))).toEqual({ A: [0, 0], B: [0, 2] });
  });
});
