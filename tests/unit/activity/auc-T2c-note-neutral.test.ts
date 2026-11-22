/**
 * auc-T2c (#189): a note colour the jar cannot resolve paints the #143 neutral.
 *
 * `CommandNote3`/`CommandNoteLong3` build `Colors` from the colour capture (`CommandNote3.java:127`,
 * `CommandNoteLong3.java:129`), and a bare part goes through the throwing `set.getColor(s)` (`Colors.java:101-103`): the
 * jar draws a `No such color` page. By the 2026-11-04 ruling we draw, and the note carries `UNKNOWN_COLOR_NEUTRAL`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/Colors.java:95-115
 */
import { describe, it, expect } from 'vitest';
import { activityPlugin } from '../../../src/diagrams/activity/index.js';
import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';
import type { ActivityDiagramAST, ActivityNode } from '../../../src/diagrams/activity/ast.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseAst } from '../../helpers/parse-ast.js';

function parse(lines: readonly string[]): ActivityDiagramAST {
  const block: UmlSource = { lines, type: 'activity' };
  return parseAst(activityPlugin, block);
}

/** The colour of the diagram's only note, wherever the parser attached it. */
function noteColor(lines: readonly string[]): string | undefined {
  const found: ActivityNode[] = [];
  JSON.stringify(parse(lines).nodes, (_k, v: unknown) => {
    if (typeof v === 'object' && v !== null && (v as { kind?: unknown }).kind === 'note') found.push(v as ActivityNode);
    return v;
  });
  expect(found).toHaveLength(1);
  return (found[0] as { color?: string }).color;
}

describe('auc-T2c: an unresolved note colour paints the neutral', () => {
  it('single-line note left #zzblue: n carries the neutral', () => {
    expect(noteColor([':a;', 'note left #zzblue: n'])).toBe(UNKNOWN_COLOR_NEUTRAL);
  });

  it('multi-line note right #zzblue carries the neutral', () => {
    expect(noteColor([':a;', 'note right #zzblue', 'n', 'end note'])).toBe(UNKNOWN_COLOR_NEUTRAL);
  });

  it('single-line note left #red: n keeps the token', () => {
    expect(noteColor([':a;', 'note left #red: n'])).toBe('#red');
  });

  it('multi-line note right #red keeps the token', () => {
    expect(noteColor([':a;', 'note right #red', 'n', 'end note'])).toBe('#red');
  });

  it('a gradient note colour keeps the token (getColor accepts it, HColorSet.java:109-117)', () => {
    expect(noteColor([':a;', 'note right #red-blue', 'n', 'end note'])).toBe('#red-blue');
  });
});
