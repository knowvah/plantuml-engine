/**
 * auc-T2b (#189): a swimlane colour the jar cannot resolve paints the #143 neutral.
 *
 * `CommandSwimlane#executeArg` reads the `COLOR` group with the throwing `getColor` (`CommandSwimlane.java:96-98`), so
 * `|#zzblue|L1|` draws a `No such color` page; by the 2026-11-04 ruling we draw, and the lane background is
 * `UNKNOWN_COLOR_NEUTRAL`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandSwimlane.java:96-98
 */
import { describe, it, expect } from 'vitest';
import { activityPlugin } from '../../../src/diagrams/activity/index.js';
import { UNKNOWN_COLOR_NEUTRAL } from '../../../src/core/klimt/color/HColorSet.js';
import type { ActivityDiagramAST } from '../../../src/diagrams/activity/ast.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseAst } from '../../helpers/parse-ast.js';

function parse(lines: readonly string[]): ActivityDiagramAST {
  const block: UmlSource = { lines, type: 'activity' };
  return parseAst(activityPlugin, block);
}

describe('auc-T2b: an unresolved swimlane colour paints the neutral', () => {
  it('|#zzblue|L1| stores the neutral for L1', () => {
    expect(parse(['|#zzblue|L1|', ':a;']).swimlaneColors).toEqual({ L1: UNKNOWN_COLOR_NEUTRAL });
  });

  it('|#red|L1| stores the token as before', () => {
    expect(parse(['|#red|L1|', ':a;']).swimlaneColors).toEqual({ L1: '#red' });
  });

  it('a later unresolved colour on the same lane replaces an earlier valid one, as setSpecificColor does', () => {
    expect(parse(['|#red|L1|', ':a;', '|#zzblue|L1|', ':b;']).swimlaneColors).toEqual({ L1: UNKNOWN_COLOR_NEUTRAL });
  });
});
