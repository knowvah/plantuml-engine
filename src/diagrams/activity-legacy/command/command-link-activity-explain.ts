/**
 * `CommandLinkActivity#explainArg` and the `describe*` helpers it calls, split from `CommandLinkActivity.ts` (D11).
 * The text is what `Command#explain` answers; nothing in the render path reads it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/CommandLinkActivity.java:122-244
 */
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { URL_KEY } from '../../../core/url/UrlBuilder.js';
import { removeQuotes } from './command-link-activity-entity.js';

/** `CommandLinkClass.notNull`: `null` is the empty string. @see CommandLinkClass.java (notNull) */
export function notNull(s: string | undefined): string {
  return s ?? '';
}

/** `describeSource`. @see CommandLinkActivity.java:178-201 */
export function describeSource(arg: RegexResult): string {
  if (arg.get('STAR', 0) !== undefined) {
    if (arg.get('STAR', 1) !== undefined) return "the start node (the 'top' flag is currently ignored)";
    return 'the start node';
  }

  const code = arg.get('CODE', 0);
  if (code !== undefined) return "'" + code + "'";

  const bar = arg.get('BAR', 0);
  if (bar !== undefined) return "the synchronization bar '" + bar + "'";

  const quoted = arg.get('QUOTED', 0);
  if (quoted !== undefined) {
    if (arg.get('QUOTED', 1) !== undefined) return "'" + arg.get('QUOTED', 1)! + '\' displayed as "' + quoted + '"';
    return '"' + quoted + '"';
  }

  return 'the last activity';
}

/** `describeTarget`. @see CommandLinkActivity.java:203-230 */
export function describeTarget(arg: RegexResult): string {
  if (arg.get('STAR2', 0) !== undefined) {
    const suppId = arg.get('STAR2', 1);
    if (suppId !== undefined) return "the end node '" + suppId + "'";
    return 'the end node';
  }

  if (arg.get('OPENBRACKET2', 0) !== undefined) return 'a new inner activity block';

  const code = arg.get('CODE2', 0);
  if (code !== undefined) return "'" + code + "'";

  const bar = arg.get('BAR2', 0);
  if (bar !== undefined) return "the synchronization bar '" + bar + "'";

  const quoted = arg.get('QUOTED2', 0);
  if (quoted !== undefined) {
    if (arg.get('QUOTED2', 1) !== undefined) return "'" + arg.get('QUOTED2', 1)! + '\' displayed as "' + quoted + '"';
    return '"' + quoted + '"';
  }

  return "'" + String(arg.get('QUOTED_INVISIBLE2', 0)) + "'";
}

/** `describeDirection`: `Character.toLowerCase(direction.charAt(0))`. @see CommandLinkActivity.java:232-244 */
export function describeDirection(direction: string): string {
  switch (direction.charAt(0).toLowerCase()) {
    case 'l':
      return 'to the left';
    case 'r':
      return 'to the right';
    case 'u':
      return 'upwards';
    default:
      return 'downwards';
  }
}

/** The `, dotted` / `, without layout constraint` / `, oriented ...` clauses. @see CommandLinkActivity.java:140-153 */
function describeArrow(arg: RegexResult): string {
  let sb = '';
  const bodies = notNull(arg.get('ARROW_BODY1', 0)) + notNull(arg.get('ARROW_BODY2', 0));
  if (bodies.includes('.')) sb += ', dotted';

  // A '*' in the arrow removes the layout constraint of the link.
  const direction = arg.get('ARROW_DIRECTION', 0);
  if (direction === '*') sb += ', without layout constraint';
  else if (direction !== undefined && direction.length > 0) sb += ', oriented ' + describeDirection(direction);

  return sb;
}

/** The stereotypes and colors written next to an endpoint are applied to that endpoint, not to the link.
 *  @see CommandLinkActivity.java:162-173 */
function describeEndpoints(arg: RegexResult): string {
  let sb = '';
  const clauses: readonly (readonly [string, string])[] = [
    ['STEREOTYPE', ', setting the stereotype of the source to '],
    ['BACKCOLOR', ', setting the background color of the source to '],
    ['STEREOTYPE2', ', setting the stereotype of the target to '],
    ['BACKCOLOR2', ', setting the background color of the target to '],
  ];
  for (const [key, text] of clauses) {
    const value = arg.get(key, 0);
    if (value !== undefined) sb += text + value;
  }
  return sb;
}

/**
 * Legacy activity diagram link: 'Source --> Target'. The endpoints are decoded like in `getEntity`: '(*)' is the
 * start or the end node depending on its side, '==name==' a synchronization bar, '{' opens an inner activity block,
 * and a missing source means the last activity.
 *
 * @see CommandLinkActivity.java:122-176
 */
export function explainArg(arg: RegexResult): string {
  let sb = 'Drawing a link from ' + describeSource(arg) + ' to ' + describeTarget(arg);

  const partition = arg.get('PARTITION2', 0);
  if (partition !== undefined) sb += ", placed in the partition '" + removeQuotes(partition)! + "'";

  const bracket = arg.get('BRACKET', 0);
  if (bracket !== undefined) sb += ', labelled "' + bracket + '"';

  sb += describeArrow(arg);

  const style = arg.getLazzy('ARROW_STYLE', 0);
  if (style !== undefined) sb += ", with style '" + style + "'";

  if (arg.get(URL_KEY, 0) !== undefined) sb += ', with a URL link';

  return sb + describeEndpoints(arg);
}
