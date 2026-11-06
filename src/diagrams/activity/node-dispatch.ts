/**
 * Core recursive-descent line dispatch (mission G0b/T6: split out of
 * parser.ts to stay under the 500-line file cap; behavior change limited
 * to the annotation-matcher wiring in `tryAnnotation` below).
 *
 * Each `try*` function below handles exactly one line-shape from the
 * original single-function dispatch chain, in the SAME priority order as
 * before -- a mechanical extraction (no behavior change) forced by Lizard
 * 1.23.0's TypeScript reader misattributing this function's complexity
 * regardless of `#lizard forgives` placement (its "optimistic function"
 * push/pop heuristic for `identifier(` call sites loses track of the
 * enclosing function partway through a chain this long); splitting into
 * small named functions sidesteps the tool bug instead of fighting it.
 */

import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import type { ActivityAction, ActivityArrowLabel, ActivityNode, ActivityWhile } from './ast.js';
import {
  RE_ACTION,
  RE_ARROW_LABEL,
  RE_ENDWHILE,
  RE_SWIMLANE,
  RE_WHILE,
  isRefusal,
  matchesStopKeyword,
  setCurrentSwimlane,
  swimlaneSpread,
  tryAssumeTransparent,
  type DispatchResult,
  type LineHandler,
  type ParseContext,
  type ParseOutcome,
  type StopKeywords,
} from './dispatch-support.js';
import { tryIf } from './if-dispatch.js';
import { tryRepeat } from './repeat-dispatch.js';
import { tryFork, trySplit } from './parallel-dispatch.js';
import {
  tryActivityList,
  tryBackward,
  tryCircleSpot,
  tryGoto,
  tryLabel,
  pushParsedNode,
} from './list-backward-dispatch.js';
import { singleLineArrowLabel, tryArrowLong } from './dispatch-arrow-long.js';
import { displayWithNewlines } from './dispatch-newline-sentinels.js';
import { readMultilineActionBody } from './dispatch-multiline-body.js';
import { extractLeadingCaseNotes, tryOpenSwitch } from './switch-dispatch.js';
import { tryOpenGroup } from './group-dispatch.js';
import { enterSwimlane, isInstructionHandler, manageSwimlaneStrategy } from './swimlane-strategy.js';
import { redirectNoteOntoGroup, redirectNoteOntoWhile, tryNoteMulti, tryNoteSingle } from './note-dispatch.js';
import {
  tryAnnotation,
  tryIgnoredCommonCommand,
  tryLink3,
  tryPragma,
  trySprite,
  tryScale,
} from './dispatch-common-commands.js';
import {
  RE_TERMINAL,
  backColorSpread,
  stereogroupBackColor,
  stereogroupStereotype,
  stereotypesSpread,
} from './dispatch-stereogroup.js';

// ---------------------------------------------------------------------------
// Swimlane header: |name| or |[#color]name|
// ---------------------------------------------------------------------------
function trySwimlane(ctx: ParseContext, idx: number, line: string): DispatchResult | ParseRefusal | null {
  const m = RE_SWIMLANE.exec(line);
  if (m === null) return null;
  // aepp-T1c: `ActivityDiagram3.java:86-91`.
  const forbidden = enterSwimlane(ctx, idx);
  if (forbidden !== null) return forbidden;
  // `CommandSwimlane.java:63` `([^|]+)`, untrimmed: `Swimlanes#getOrCreate`
  // (`Swimlanes.java:168-176`) matches it by exact `equals`, and
  // `Swimlane.java:60` displays it verbatim.
  const name = m[2]!;
  setCurrentSwimlane(ctx, name, m[1]);
  recordSwimlaneDisplay(ctx, name, line);
  return { idx: idx + 1 };
}

/** Per-parse `|name|LABEL` displays, keyed by the parse's own context. */
const SWIMLANE_DISPLAYS = new WeakMap<ParseContext, Map<string, string>>();

/**
 * `LABEL ([^|]+)?` is everything after the closing `|` (it can hold no
 * `|`), passed raw -- leading space included -- to `Display.getWithNewlines`
 * and, when non-null, `setDisplay` on the lane; a later bare `|name|` leaves
 * the display unchanged.
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandSwimlane.java:65,97-98
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/Swimlanes.java:163-164
 */
function recordSwimlaneDisplay(ctx: ParseContext, name: string, line: string): void {
  const label = line.trimEnd().slice(line.trimEnd().lastIndexOf('|') + 1);
  if (label === '') return;
  let displays = SWIMLANE_DISPLAYS.get(ctx);
  if (displays === undefined) SWIMLANE_DISPLAYS.set(ctx, (displays = new Map<string, string>()));
  displays.set(name, label);
}

/** The `|name|LABEL` displays recorded during this parse (empty if none). */
export function swimlaneDisplaysOf(ctx: ParseContext): ReadonlyMap<string, string> {
  return SWIMLANE_DISPLAYS.get(ctx) ?? new Map<string, string>();
}

// ---------------------------------------------------------------------------
// start / stop / end / kill / detach / break
// ---------------------------------------------------------------------------
function trySimpleKeyword(ctx: ParseContext, idx: number, line: string, lc: string): DispatchResult | null {
  const terminal = RE_TERMINAL.exec(line);
  if (terminal !== null) {
    const kind = terminal[1]!.toLowerCase() as 'start' | 'stop' | 'end';
    return { idx: idx + 1, node: { kind, ...backColorSpread(terminal[2]), ...swimlaneSpread(ctx) } };
  }
  switch (lc) {
    case 'kill':
      return { idx: idx + 1, node: { kind: 'kill', ...swimlaneSpread(ctx) } };
    case 'detach':
      return { idx: idx + 1, node: { kind: 'detach', ...swimlaneSpread(ctx) } };
    case 'break':
      return { idx: idx + 1, node: { kind: 'break', ...swimlaneSpread(ctx) } };
    default:
      return null;
  }
}

/** `ActivityAction.position` for the command at `idx`, absent when the source carries no line positions. */
function positionSpread(ctx: ParseContext, idx: number): { position?: number } {
  const position = ctx.positions?.[idx];
  return position === undefined ? {} : { position };
}

// ---------------------------------------------------------------------------
// Action: :label; or :label; #color  or multiline :label\n...\n;
// ---------------------------------------------------------------------------
function tryAction(ctx: ParseContext, idx: number, line: string): DispatchResult | null {
  const actionMatch = RE_ACTION.exec(line);
  if (actionMatch === null) return null;
  const label = displayWithNewlines(ctx.pragma, actionMatch[1]!);
  const stereotype = stereogroupStereotype(actionMatch[2]);
  const color = stereogroupBackColor(actionMatch[2]);
  const node: ActivityAction = {
    kind: 'action',
    label,
    ...(stereotype !== undefined ? { stereotype } : {}),
    ...stereotypesSpread(actionMatch[2]),
    ...(color !== undefined ? { color } : {}),
    ...swimlaneSpread(ctx),
    ...positionSpread(ctx, idx),
  };
  return { idx: idx + 1, node };
}

export { readMultilineActionBody, type MultilineActionBody } from './dispatch-multiline-body.js';

/** Multiline action: any `:` line {@link tryAction} did not take.
 *  `CommandMultilines2#isValid` (`command/CommandMultilines2.java:98-107`)
 *  never tests the FIRST line against the END pattern, so a `;` on it --
 *  `:x; <<save>> #pink`, which matches no single-line command -- does not
 *  close the block (`CommandActivityLong3.java:79-82`). */
function tryMultilineAction(ctx: ParseContext, idx: number, line: string): DispatchResult | null {
  if (!line.startsWith(':')) return null;
  // isw-T2-act F2: `":" DATA(.*)` with no space leaf (`CommandActivityLong3
  // .java:81-82`), and `removeStartingAndEnding(DATA, 0)` (`:139`) keeps it
  // as the first line even when empty -- the jar draws that line.
  const labelParts: string[] = [line.slice(1)];
  const body = readMultilineActionBody(ctx, idx + 1, labelParts);
  const node: ActivityAction = {
    kind: 'action',
    // isw-T2-act F7: `lines.toDisplay()` is `Display.createFoo` (`BlocLines.java:
    // 124-128`, `Display.java:185-198`) -- no newline scan; a `%newline()`
    // sentinel reaches the creole parser, which splits a plain line on it
    // (`CreoleStripeSimpleParser.java:164`) and a table cell keeps it.
    label: body.labelParts.join('\n'),
    ...(body.multiStereo !== undefined ? { stereotype: body.multiStereo } : {}),
    ...stereotypesSpread(body.multiGroup),
    ...(body.multiColor !== undefined ? { color: body.multiColor } : {}),
    ...swimlaneSpread(ctx),
    ...positionSpread(ctx, idx),
  };
  return { idx: body.cursor, node };
}

// ---------------------------------------------------------------------------
// while / endwhile
// ---------------------------------------------------------------------------
/**
 * Captures the `while`'s swimlane at its opener, not its closer.
 * @see net/sourceforge/plantuml/activitydiagram3/ActivityDiagram3.java:397
 *   -- `new InstructionWhile(swimlanes.getCurrentSwimlane(), ...)`, taken
 *   when the `while` line itself is parsed, before the body.
 */
function tryWhile(ctx: ParseContext, idx: number, line: string): DispatchResult | ParseRefusal | null {
  const whileMatch = RE_WHILE.exec(line);
  if (whileMatch === null) return null;
  const { lines } = ctx;
  const condition = whileMatch[1]!;
  const yesLabel = whileMatch[2];
  // Mission `activity-lane-capture` D1/T4: read BEFORE the body parses, so
  // a lane switch inside the body never leaks into this node's own
  // `swimlane`.
  const openerSwimlane = swimlaneSpread(ctx);
  // `['end while', 'while end']` per RE_ENDWHILE's own doc: CommandWhileEnd3
  // is a RegexOr of both two-word spellings; matchesStopKeyword needs its
  // own entry for each (mission ubrr-T10 M5).
  const bodyResult = parseNodes(ctx, idx + 1, ['endwhile', 'end while', 'while end']);
  if (isRefusal(bodyResult)) return bodyResult;
  let cursor = bodyResult.nextIdx;
  let exitLabel: string | undefined;
  if (cursor < lines.length) {
    const endLine = lines[cursor]!.trim();
    const endwhileMatch = RE_ENDWHILE.exec(endLine);
    if (endwhileMatch !== null) exitLabel = endwhileMatch[1];
    cursor++;
  }
  // `InstructionWhile#addNote` (`InstructionWhile.java:162-167`): a note
  // while `repeatList` is still empty is the while's OWN note.
  const { body, notes } = extractLeadingCaseNotes(bodyResult.nodes);
  const node: ActivityWhile = {
    kind: 'while',
    condition,
    ...(yesLabel !== undefined && yesLabel !== '' ? { yesLabel } : {}),
    ...(exitLabel !== undefined && exitLabel !== '' ? { exitLabel } : {}),
    ...backColorSpread(whileMatch[3]),
    body,
    ...(notes.length > 0 ? { notes } : {}),
    ...openerSwimlane,
  };
  return { idx: cursor, node };
}

/** `CommandArrow3` (`CommandArrow3.java:61-71`): `-> label;`,
 *  `-[#red]-> label;`, bare `-[#red]->`. The label is `Display.
 *  getWithNewlines(pragma, label)` (`:110`): `\\n` becomes a line break
 *  here, once; `<back:>`/`<color:>` stay in the label for creole. */
function tryArrowLabel(ctx: ParseContext, idx: number, line: string): DispatchResult | null {
  if (!line.startsWith('-')) return null;
  const arrowMatch = RE_ARROW_LABEL.exec(line);
  if (arrowMatch === null) return null;
  const style = arrowMatch[1];
  const label = singleLineArrowLabel(ctx, arrowMatch[2] ?? '');
  const node: ActivityArrowLabel = {
    kind: 'arrow-label',
    label,
    ...(style !== undefined ? { style } : {}),
    ...swimlaneSpread(ctx),
  };
  return { idx: idx + 1, node };
}

// `tryAnnotation`/`trySprite`/`tryScale`/`tryPragma` (D12/T1p-b) moved to
// `dispatch-common-commands.ts` to keep this file under the 500-line cap
// (it was already at the exact limit) -- see that file's own doc comment.

const LINE_HANDLERS: readonly LineHandler[] = [
  trySwimlane,
  trySimpleKeyword,
  // `(X)` circled-spot connector: registered right after Start3/Stop3
  // upstream (`ActivityDiagramFactory3.java:144`) -- `trySimpleKeyword`
  // above covers start/stop/end/kill/detach/break together.
  tryCircleSpot,
  tryAction,
  tryMultilineAction,
  // `partition`/`group` (mission ubrr-T10 M6) registered upstream BEFORE
  // the if-family (`ActivityDiagramFactory3.java:110-113`, right after
  // the swimlane commands).
  tryOpenGroup,
  tryBackward,
  tryIf,
  tryOpenSwitch,
  tryWhile,
  tryRepeat,
  tryFork,
  trySplit,
  tryNoteSingle,
  tryNoteMulti,
  tryArrowLabel,
  tryArrowLong,
  tryAnnotation,
  // D12/T1p-b: `!pragma` registered BEFORE sprite within `addCommonCommands2`
  // (`CommonCommands.java:62-89`).
  tryPragma,
  trySprite,
  tryScale,
  tryIgnoredCommonCommand,
  tryLink3,
  tryAssumeTransparent,
  // Tried LAST, immediately before the unknown-line fallback: `[-*]` is a
  // broad prefix (mission ubrr-T10 M1) and upstream itself registers
  // `CommandActivityList` after every other body command
  // (`ActivityDiagramFactory3.java:160`, right before `CommandLabel`/
  // `CommandGoto`).
  tryActivityList,
  // `label NAME` / `goto NAME`: registered LAST upstream, after
  // ActivityList (`ActivityDiagramFactory3.java:160-161`).
  tryLabel,
  tryGoto,
];

/** Handlers whose upstream method calls `manageSwimlaneStrategy`
 *  (`swimlane-strategy.ts` header); `trySimpleKeyword` is gated by keyword. */
const INSTRUCTION_HANDLERS: ReadonlySet<LineHandler> = new Set<LineHandler>([
  tryCircleSpot,
  tryAction,
  tryMultilineAction,
  tryOpenGroup,
  tryBackward,
  tryIf,
  tryOpenSwitch,
  tryWhile,
  tryRepeat,
  tryFork,
  tryActivityList,
]);

/**
 * Dispatch one non-blank, pre-stripped line: the first handler in
 * {@link LINE_HANDLERS} that recognizes it wins (same priority order as
 * the original single-function dispatch chain).
 *
 * An unrecognized line now REFUSES (mission dispatch-by-parse-attempt/T6)
 * instead of being skipped silently. This mirrors upstream's `getCandidate`
 * returning `null` when no registered `Command` matches, at which point
 * `executeFewLines` builds `SYNTAX_ERROR "Syntax Error?"` and the factory
 * hands that back as the diagram
 * (`~/git/plantuml/.../command/PSystemCommandFactory.java:169-175`).
 *
 * `idx` doubles as upstream's `trace.size()` (lines consumed before the
 * failure): every line in `[0, idx)` was already accounted for by a prior
 * dispatch match or a blank-line skip, since `parseNodes`'s cursor only
 * ever advances forward. `consumed = idx` needs no separate counter.
 */
function dispatchLine(ctx: ParseContext, idx: number, line: string, lc: string): DispatchResult | ParseRefusal {
  for (const handler of LINE_HANDLERS) {
    // aepp-T1c: upstream's `manageSwimlaneStrategy()` runs when the command
    // executes, before any nested body -- so it is set ahead of the handler
    // (whose body may declare lanes) and undone if the handler declines.
    const before = ctx.swimlaneStrategy;
    if (isInstructionHandler(handler, lc, INSTRUCTION_HANDLERS, trySimpleKeyword)) manageSwimlaneStrategy(ctx);
    const result = handler(ctx, idx, line, lc);
    if (result !== null) return result;
    ctx.swimlaneStrategy = before;
  }
  return refuse('syntax', idx, idx, 'Syntax Error?');
}

/** {@link pushParsedNode} plus the closed-group note redirect (add4-T2g,
 *  `note-dispatch.ts#redirectNoteOntoGroup`); kept here because
 *  `list-backward-dispatch.ts` is not this task's file and a cycle through
 *  `note-dispatch.ts` is avoided. */
function pushNode(nodes: ActivityNode[], node: ActivityNode | undefined): void {
  if (
    node?.kind === 'note' &&
    (redirectNoteOntoGroup(nodes, node, pushNode) || redirectNoteOntoWhile(nodes, node, pushNode))
  )
    return;
  pushParsedNode(nodes, node); // WSPEC/RNOOUT, list-backward-dispatch.ts
}

/** Read nodes from `ctx.lines` from `idx` until a trimmed lowercase line
 *  matches one of `stops`, end-of-input, or a `ParseRefusal` surfaces from
 *  `dispatchLine` -- which this function propagates unchanged rather than
 *  swallowing (D0/D1: refusal is the real parse path, returned not thrown). */
export function parseNodes(ctx: ParseContext, idx: number, stops: StopKeywords): ParseOutcome {
  const nodes: ActivityNode[] = [];
  const { lines } = ctx;
  let cursor = idx;

  while (cursor < lines.length) {
    const raw = lines[cursor]!;
    let line = raw.trim();

    if (line === '') {
      cursor++;
      continue;
    }

    // Upstream has no ONE generic strip: a bare keyword's own regex ends
    // `";?"` (`CommandStart3.java:58-63`) -- emulated here, once, for
    // every bare keyword. `keyword:content;` pairs colon+`;` as ONE
    // mandatory unit instead (`CommandBackward3.java:75-79`,
    // `CommandRepeat3.java:68-73`'s inline form) -- stripping THAT `;`
    // corrupts it (`RE_BACKWARD`, `dispatch-support.ts:67`, then misses a
    // single-line `backward:LABEL;`, falling to its multiline reader,
    // swallowing following lines). A colon ANYWHERE means some command
    // owns that `;` -- bare keywords never contain one.
    // `CommandArrow3`'s `(.*);` owns its own `;` (`CommandArrow3.java:61-65`).
    if (!line.startsWith(':') && !line.includes(':') && line.endsWith(';') && !RE_ARROW_LABEL.test(line)) {
      line = line.slice(0, -1).trimEnd();
    }

    const lc = line.toLowerCase();

    // Check stop condition before dispatching.
    if (matchesStopKeyword(lc, stops)) break;

    const result = dispatchLine(ctx, cursor, line, lc);
    if (isRefusal(result)) return result;
    pushNode(nodes, result.node);
    cursor = result.idx;
  }

  return { nodes, nextIdx: cursor };
}
