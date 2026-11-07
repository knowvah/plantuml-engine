/**
 * aar-T1b: activity3 lines upstream accepts and this port refused, so we drew
 * our error page where the jar draws a diagram (issue #121 item 12).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandRepeat3.java:64-77
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandForkEnd3.java:57-81
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandActivityLong3.java:78-84,125-127
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandNote3.java:69-82
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandIf2.java:68-88
 */
import { describe, it, expect } from 'vitest';
import { parseActivity } from '../../../src/diagrams/activity/parser.js';
import type { ActivityDiagramAST } from '../../../src/diagrams/activity/ast.js';
import { activityWarnings } from '../../../src/diagrams/activity/activity-warnings.js';
import { wrapUrlRuns } from '../../../src/diagrams/activity/activity-node-urls.js';
import type { ActivityNodeGeo } from '../../../src/diagrams/activity/activity-geometry.types.js';
import type { Theme } from '../../../src/core/theme.js';

function parsed(lines: string[]): ActivityDiagramAST {
  const r = parseActivity({ lines, type: 'activity' });
  if ('refused' in r) throw new Error(`refused at ${String(r.line)}: ${r.message}`);
  return r;
}

describe('CommandRepeat3: `repeat` then spaceZeroOrMore', () => {
  it('votigi-61: `repeat:B; <<task>>` opens a repeat whose entry is B', () => {
    const ast = parsed([':A;', 'repeat:B; <<task>>', 'repeat while (C)']);
    expect(ast.nodes[1]).toMatchObject({ kind: 'repeat', entry: { kind: 'action', label: 'B' } });
  });

  it('zesoto-64: `repeat:B;<<task>>` (no space before the stereogroup) parses the same', () => {
    const ast = parsed([':A;', 'repeat:B;<<task>>', 'repeat while (C)']);
    expect(ast.nodes[1]).toMatchObject({ kind: 'repeat', entry: { kind: 'action', label: 'B' } });
  });

  it('ColorParser.exp4: `#red:repeat` parses and warns, the colour ignored', () => {
    const ast = parsed(['#red:repeat', ':x;', 'repeat while (C)']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'repeat' });
    expect(ast.nodes[0]).not.toHaveProperty('color');
    expect(activityWarnings(ast).map((w) => w.asSingleLine())).toEqual([
      "This syntax is deprecated, you must add <<#red>> at the end of the line, after the ';'",
    ]);
  });
});

describe('CommandForkEnd3: `fork` spaceZeroOrMore `end`', () => {
  it('munovo-17: `forkend` closes the fork', () => {
    const ast = parsed(['fork', ':a;', 'fork again', ':b;', 'forkend', ':c;']);
    expect(ast.nodes.map((n) => n.kind)).toEqual(['fork', 'action']);
  });

  it('`fork end` closes the fork', () => {
    const ast = parsed(['fork', ':a;', 'fork end']);
    expect(ast.nodes.map((n) => n.kind)).toEqual(['fork']);
  });
});

describe('CommandActivityLong3: the leading COLOR of a multi-line activity', () => {
  it('long3-colour: `#red:a` / `b;` is one box, colour ignored, one deprecation warning', () => {
    const ast = parsed(['start', '#red:a', 'b;', 'stop']);
    expect(ast.nodes[1]).toMatchObject({ kind: 'action', label: 'a\nb' });
    expect(ast.nodes[1]).not.toHaveProperty('color');
    expect(activityWarnings(ast).map((w) => w.asSingleLine())).toEqual([
      "This syntax is deprecated, you must add <<#red>> at the end of the line, after the ';'",
    ]);
  });

  it('fuficu-36: `#green:Activity 1;` opens a block the NEXT `;` line closes', () => {
    const ast = parsed(['#green:Activity 1;', ':Activity 2; <<redactivity>>', 'stop']);
    expect(ast.nodes[0]).toMatchObject({
      kind: 'action',
      label: 'Activity 1;\n:Activity 2',
      stereotype: 'redactivity',
    });
    expect(ast.nodes[1]).toMatchObject({ kind: 'stop' });
  });

  it('`#red:a;` alone is still refused (the first line is never tested against END)', () => {
    const r = parseActivity({ lines: ['start', '#red:a;', 'stop'], type: 'activity' });
    expect('refused' in r).toBe(true);
  });
});

describe('CommandNote3: NOTE is `(.*)`', () => {
  it('nabako-16: `floating note: ` with no text parses', () => {
    const ast = parsed(['start', 'floating note: ', ':x;']);
    expect(ast.nodes.map((n) => n.kind)).toContain('action');
  });
});

describe('CommandIf2: UrlBuilder.OPTIONAL then ColorParser.exp4', () => {
  it('mivipi-10: `[[url]] if (?) then (x) <<#ff8822>>` keeps the url, the fill and the then label', () => {
    const ast = parsed([
      '[[http://plantuml.com/sequence]] if (?) then (x) <<#ff8822>>',
      'stop',
      'else (y)',
      'stop',
      'endif',
    ]);
    expect(ast.nodes[0]).toMatchObject({
      kind: 'if',
      condition: '?',
      thenLabel: 'x',
      color: '#ff8822',
      url: '[[http://plantuml.com/sequence]]',
    });
  });

  it('`#red:if (c) then` parses, the colour ignored', () => {
    const ast = parsed(['#red:if (c) then', ':a;', 'endif']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'if', condition: 'c' });
    expect(ast.nodes[0]).not.toHaveProperty('color');
  });
});

describe('wrapUrlRuns: FtileWithUrl#drawU around consecutive marked nodes', () => {
  const theme = { topurl: undefined } as unknown as Theme;
  const node = (id: string, url?: string): ActivityNodeGeo => ({
    id,
    kind: 'x',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    ...(url === undefined ? {} : { url }),
  });

  it('one <a> around the run, the unmarked nodes outside it', () => {
    const out = wrapUrlRuns(
      [node('a'), node('b', '[[http://x]]'), node('c', '[[http://x]]'), node('d')],
      ['A', 'B', 'C', 'D'],
      theme,
    );
    expect(out).toHaveLength(3);
    expect(out[0]).toBe('A');
    expect(out[1]).toMatch(/^<a target="_top" href="http:\/\/x" [^>]*>BC<\/a>$/);
    expect(out[2]).toBe('D');
  });

  it('an unparsable link draws its run bare', () => {
    expect(wrapUrlRuns([node('a', 'nope')], ['A'], theme)).toEqual(['A']);
  });
});
