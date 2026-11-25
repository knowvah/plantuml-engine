/**
 * state-node-label (snl, #235, D1/D3): `skinparam stateDiagramEdgeLabelStyle node` and the `node` / `nonode` arrow-style
 * keywords. Upstream decides node style in the command and, for a labelled transition, builds one
 * `STATE_TRANSITION_LABEL` leaf and two links in place of the one labelled link (`CommandLinkStateCommon.java:190-196`,
 * `:323-386`). This module is that branch: the transition handler calls {@link shouldUseNodeStyle} where `executeArg`
 * does, and {@link createTransitionWithIntermediateNode} builds the leaf and links.
 *
 * `Link.setWeight(10.0)` (`:345`, `:356`) is not carried: `grep -rn 'getWeight()' src/main/java/net/` finds only its
 * declaration (`abel/Link.java:320`), and the jar's DOT carries no `weight`.
 *
 * @see ~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/statediagram/command/CommandLinkStateCommon.java
 */
import { DEFAULT_CLOCK, type Clock } from '../../core/clock.js';
import { splitDisplayLines } from '../../core/klimt/creole/DisplayNewlines.js';
import type { SkinparamAssignment } from '../../core/preprocessor.js';
import { cleanForKeySlow } from '../../core/style/mindmap-style-builder.js';
import type { Transition } from './ast.js';
import { addLink } from './state-link-add.js';
import { makeState, nextCreationIndex, noteScopeId, type ParseState } from './state-parse-state.js';
import { registerNewState } from './state-parse-resolve.js';

/** The `[*]` endpoint token a transition keeps for the start and end pseudostates. */
const PSEUDOSTATE = '[*]';
/** The skinparam `shouldUseNodeStyle` reads (`CommandLinkStateCommon.java:305`). */
const EDGE_LABEL_STYLE_KEY = 'statediagramedgelabelstyle';
/** Its one value that turns node style on (`:306`, `equalsIgnoreCase`). */
const NODE = 'node';
/** The per-transition opt-out (`:297`). */
const NONODE = 'nonode';
/** The leaf's stereotype (`:338`, `Stereotype.build("<<transition>>")`). */
export const TRANSITION_LABEL_STEREOTYPE = 'transition';
/** `LinkArg.build(Display.NULL, 2, …)` for both links (`:343-344`, `:354-355`): minlen 1. */
const NODE_LINK_LENGTH = 2;

/** What the node-style branch needs from the parse: the skinparam value, the clock, and the leaf count (D1). */
export interface TransitionLabelState {
  /** The last `stateDiagramEdgeLabelStyle` skinparam value, or `undefined` (`SkinParam#getValue`). */
  readonly edgeLabelStyle: string | undefined;
  /** The injected clock standing in for `System.currentTimeMillis()` (D1). */
  readonly clock: Clock;
  /** Transition-label leaves synthesised so far; the id suffix is `clock.nowMillis() + count` (D1). */
  count: number;
}

/**
 * `SkinParam#getValue("statediagramedgelabelstyle")` over the block's skinparam assignments: every key is stored under
 * its `cleanForKey` forms and the last assignment wins (`SkinParam.java:346-356`).
 */
export function edgeLabelStyleOf(assignments: readonly SkinparamAssignment[] | undefined): string | undefined {
  let value: string | undefined;
  for (const a of assignments ?? []) if (cleanForKeySlow(a.key).includes(EDGE_LABEL_STYLE_KEY)) value = a.value;
  return value;
}

/**
 * `containsStyleKeyword`: an exact, case-insensitive token match over the style split on `,` and `;`, so `node` never
 * matches inside `nonode`. @see CommandLinkStateCommon.java:313-321
 */
export function containsStyleKeyword(arrowStyle: string | undefined, keyword: string): boolean {
  if (arrowStyle === undefined) return false;
  return arrowStyle.split(/[,;]/).some((part) => part.trim().toLowerCase() === keyword);
}

/**
 * `shouldUseNodeStyle`: `nonode` wins, then `node`, then the skinparam. @see CommandLinkStateCommon.java:292-311
 */
export function shouldUseNodeStyle(arrowStyle: string | undefined, edgeLabelStyle: string | undefined): boolean {
  if (containsStyleKeyword(arrowStyle, NONODE)) return false;
  if (containsStyleKeyword(arrowStyle, NODE)) return true;
  return edgeLabelStyle?.toLowerCase() === NODE;
}

/**
 * `Display#toString` of `Display.getWithNewlines(pragma, label)`: the line list's `AbstractCollection#toString`,
 * `[a, b]` (`Display.java:499-504`).
 */
function displayToString(rawLabel: string): string {
  return `[${splitDisplayLines(rawLabel).lines.join(', ')}]`;
}

/**
 * `generateTransitionNodeId`: `transition_<src>_<tgt>_<label sanitised>_<millis>` (`:388-395`), the millis read from
 * the injected clock plus the leaf count (D1). `cleanId` (`CucaDiagram.java:196-200`) only strips a surrounding
 * quote pair, which this string never has.
 */
export function generateTransitionNodeId(
  sourceName: string,
  targetName: string,
  rawLabel: string,
  millis: number,
): string {
  const labelText = displayToString(rawLabel).replace(/[^a-zA-Z0-9_]/g, '_');
  return `transition_${sourceName}_${targetName}_${labelText}_${String(millis)}`;
}

/** Upstream's three regexes, verbatim, that take `node` out of the style (`:369-375`). */
export function filterNodeKeyword(arrowStyle: string): string {
  return arrowStyle
    .replace(/,?node,?/gi, '')
    .replace(/,,/g, ',')
    .replace(/^,|,$/g, '');
}

/**
 * `Entity#getName()` of a transition endpoint, as the id reads it (`:390-391`). `[*]` resolves to
 * `StateDiagram#getStart`/`#getEnd`, named `*start*` / `*end*` at the root and `"*start*" + g.getName()` inside a group
 * (`StateDiagram.java:92-123`), where a concurrent region's name is its global `CONC<n>` (`StateDiagram.java:194-208`).
 * Every other endpoint's resolved id is already its entity name (history pseudostates included,
 * `state-parse-resolve.ts#historicalId`).
 */
export function endpointName(ps: ParseState, resolvedId: string, isFrom: boolean): string {
  if (resolvedId !== PSEUDOSTATE) return resolvedId;
  const scopeId = noteScopeId(ps);
  const region = ps.concurrentGlobalIds.get(scopeId);
  const group = region === undefined ? scopeId : `CONC${String(region)}`;
  return `${isFrom ? '*start*' : '*end*'}${group}`;
}

/** The resolved endpoints and the parsed transition the node-style branch rebuilds. */
export interface NodeStyleInput {
  /** `source.getName()` / `target.getName()`, the names the id uses (`:390-391`). */
  readonly sourceName: string;
  readonly targetName: string;
  /** The transition as the plain path would have added it (endpoints resolved, label parsed). */
  readonly transition: Transition;
  readonly rawLabel: string;
}

/**
 * The leaf: `quarkInContext(true, cleanId(id))` + `reallyCreateLeaf(…, STATE_TRANSITION_LABEL)` in the current group,
 * stereotype `<<transition>>`, and `lastEntity` (`:332-338`, `CucaDiagram.java:220-229`). Returns its id.
 */
function createTransitionLabelLeaf(ps: ParseState, input: NodeStyleInput): string {
  const labels = ps.transitionLabels;
  const millis = labels.clock.nowMillis() + labels.count;
  labels.count += 1;
  const id = generateTransitionNodeId(input.sourceName, input.targetName, input.rawLabel, millis);
  registerNewState(ps, makeState(id, input.rawLabel, 'transitionLabel', { stereotype: TRANSITION_LABEL_STEREOTYPE }));
  ps.lastEntity = id;
  return id;
}

/** What both links share: length 2 (`:343-344`, `:354-355`), the direction (inverted together, `:361-364`) and the
 *  style without `node` (`:367-380`). */
function sharedLinkFields(t: Transition): Partial<Transition> {
  const filtered = t.arrowStyle === undefined ? '' : filterNodeKeyword(t.arrowStyle);
  return {
    length: NODE_LINK_LENGTH,
    ...(t.direction !== undefined ? { direction: t.direction } : {}),
    ...(filtered !== '' ? { arrowStyle: filtered } : {}),
  };
}

/**
 * `createTransitionWithIntermediateNode`: the leaf (one entity uid), link 1 `source -> leaf` with no decors, link 2
 * `leaf -> target` with the original decors, both length 2 and unlabelled; `left`/`up` invert both (each `getInv()`
 * burns a `Link` ctor tick, after both ctors); the style without `node` on both; neither gets the transition's
 * stereotype. @see CommandLinkStateCommon.java:323-386
 */
export function createTransitionWithIntermediateNode(ps: ParseState, input: NodeStyleInput): void {
  const t = input.transition;
  const id = createTransitionLabelLeaf(ps, input);
  const shared = sharedLinkFields(t);
  const first: Transition = { from: t.from, to: id, decorsNone: true, ...shared, creationIndex: nextCreationIndex(ps) };
  const second: Transition = {
    from: id,
    to: t.to,
    ...shared,
    ...(t.crossStart === true ? { crossStart: true } : {}),
    ...(t.circleEnd === true ? { circleEnd: true } : {}),
    creationIndex: nextCreationIndex(ps),
  };
  if (t.direction === 'left' || t.direction === 'up') {
    first.creationIndex = nextCreationIndex(ps);
    second.creationIndex = nextCreationIndex(ps);
  }
  addLink(ps, first);
  addLink(ps, second);
}

/** `ParseState.transitionLabels` for a parse: the block's skinparam value and the render's clock (D1). */
export function initTransitionLabels(
  assignments: readonly SkinparamAssignment[] | undefined,
  clock: Clock | undefined,
): TransitionLabelState {
  return { edgeLabelStyle: edgeLabelStyleOf(assignments), clock: clock ?? DEFAULT_CLOCK, count: 0 };
}
