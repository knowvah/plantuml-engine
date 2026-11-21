import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { orderWarning } from './CommandWBSItemOld.js';
import {
  applyMultilineItem,
  WBS_CODE_CHARS,
  type WbsItemTarget,
  type WbsMultilineBlock,
} from './CommandWBSItemMultilineNew.js';

/**
 * `CommandWBSItemMultilineOld` — the same block as `CommandWBSItemMultilineNew`
 * with colour/code BEFORE shape/direction; it warns about that order. END,
 * block collection and display building are identical (see
 * `collectWbsMultilineBlock`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wbs/CommandWBSItemMultilineOld.java:50-119
 */

/** @see CommandWBSItemMultilineOld.java:63-70 */
const COLOR_CODE =
  `(?:(?:\\[(?<BACKCOLOR_1>#\\w+)\\])?(?:\\((?<CODE_1>${WBS_CODE_CHARS}+)\\))?` +
  `|(?:\\((?<CODE_2>${WBS_CODE_CHARS}+)\\))?(?:\\[(?<BACKCOLOR_2>#\\w+)\\])?)`;

/** @see CommandWBSItemMultilineOld.java:71-77 */
const SHAPE_DIRECTION = '(?:(?<SHAPE_1>_)?(?<WBS_DIRECTION_1>[<>])?|(?<WBS_DIRECTION_2>[<>])?|(?<SHAPE_2>_)?)';

/** Matched against the TRIMMED first line. @see CommandWBSItemMultilineOld.java:58-80 */
export const WBS_MULTILINE_OLD_START_RE = new RegExp(
  `^(?<TYPE>[ \\t]*[*+-]+)${COLOR_CODE}${SHAPE_DIRECTION}:(?<DATA>.*)$`,
  'iu',
);

/** @see CommandWBSItemMultilineOld.java:101-128 */
export function applyWbsItemMultilineOld(diagram: WbsItemTarget, block: WbsMultilineBlock): CommandExecutionResult {
  // `CommandWBSItemOld.orderWarning(line0, true)` (java:124).
  return applyMultilineItem(diagram, block, WBS_MULTILINE_OLD_START_RE, (g) =>
    orderWarning(
      {
        type: g['TYPE']!,
        shape: g['SHAPE_1'] ?? g['SHAPE_2'],
        direction: g['WBS_DIRECTION_1'] ?? g['WBS_DIRECTION_2'],
        backColor: g['BACKCOLOR_1'] ?? g['BACKCOLOR_2'],
        code: g['CODE_1'] ?? g['CODE_2'],
      },
      true,
    ),
  );
}
