/**
 * `json` declaration commands for the state diagram parser — thin adapter
 * over the shared port in `core/command/CommandCreateJson.ts` (mission
 * shared-seam-extraction T9; formerly a 74%-line-identical clone of
 * `class/class-json-commands.ts`, D7).
 *
 * `StateDiagramFactory` registers these VERBATIM from the shared
 * `objectdiagram.command` package — the SAME classes `ClassDiagramFactory`
 * registers, not a state-specific reimplementation (mirrors this project's
 * `CommandRemoveRestore` precedent, `.agent-notes/A4-phase-L-iter13-
 * transition-grammar-singles.md`). Only the entity-creation plumbing differs
 * (state's scope-stack `declareState`/`makeState` in place of class's flat
 * `Classifier` index) — expressed here as a {@link JsonCommandHost} adapter,
 * NOT a state-specific reimplementation of the grammar/JSON parser.
 *
 * Multiline body lines are collected via `ps.pendingJson`
 * (state-parse-state.ts) — parser.ts's per-line loop intercepts them BEFORE
 * `dispatchCommand`, the same architecture `pendingNote` already uses for
 * multi-line note blocks. This is load-bearing, not a style choice: a json
 * body line (a quoted key, colon, quoted value) also happens to match rule
 * 15's generic CODE-colon-text standalone-description-line pattern
 * (state-commands.ts) — without the pre-dispatch interception, that line
 * silently auto-creates a BOGUS state from the key text instead of becoming
 * this json leaf's own field.
 *
 * This file contains ZERO raw double-quote glyphs (code OR comments) — see
 * `state-commands-declarations.ts`'s `DQUOTE` doc for why (the project's
 * lizard complexity hook desyncs on an unescaped double-quote character,
 * mis-scoping this file's own trailing `Command[]`-array-of-methods span).
 *
 * @see ~/git/plantuml/.../objectdiagram/command/CommandCreateJson.java
 * @see ~/git/plantuml/.../objectdiagram/command/CommandCreateJsonSingleLine.java
 * @see ~/git/plantuml/.../cucadiagram/BodierJSon.java
 * @see ~/git/plantuml/.../statediagram/StateDiagramFactory.java:115-116 (registration)
 * @see ../../core/command/CommandCreateJson.ts (the shared port)
 * @see src/diagrams/class/class-json-commands.ts (the class engine's own adapter)
 */

import type { State } from './ast.js';
import type { Command } from './state-commands.js';
import { type ParseState, type Pass, makeState, currentScope } from './state-parse-state.js';
import { declareState } from './state-parse-resolve.js';
import {
  JSON_MULTILINE_DECL_RE,
  JSON_SINGLE_LINE_RE,
  applyJsonMultilineOpen,
  applyJsonSingleLine,
  finalizeJsonBody,
  isJsonBodyComplete,
  type JsonCommandHost,
} from '../../core/command/CommandCreateJson.js';

// ---------------------------------------------------------------------------
// Pending multi-line body (parser.ts's per-line pre-dispatch interception —
// mirrors PendingNote/state-notes.ts's own precedent). Engine-specific: NOT
// part of the shared core port (the accumulation loop lives in parser.ts).
// ---------------------------------------------------------------------------

/** Non-null while inside a `json Name { ... }` multi-line body. Holds the
 *  CANONICAL target State object directly (not just its id) — the target
 *  may already have existed (global by-name reuse / pass-TWO replay of the
 *  SAME declaration), so re-resolving by id at the closer would be
 *  redundant at best and a fresh lookup risk at worst; `declareState`'s
 *  return value IS the single source of truth. */
export type PendingJson =
  | { target: State; lines: string[]; refusal?: undefined }
  | { target?: undefined; lines: string[]; refusal: JsonBlockRefusal };

/** A refused multi-line json block (ocr D4): the failed result, held until the block's closing line, where upstream
 *  reports a multi-line command's EXECUTION_ERROR (`PSystemCommandFactory.java:218-225`). */
export interface JsonBlockRefusal {
  readonly message: string;
  readonly score: number;
}

/**
 * One line of an open multi-line json body (`ps.pendingJson`): `false` when no body is open, `true` when the line was
 * consumed, and on the line that closes a refused block, its {@link JsonBlockRefusal}. The body is swallowed on every
 * pass, so no body line reaches `dispatchCommand`; the `jsonValue` write fires on pass ONE only.
 */
export function stepPendingJson(ps: ParseState, line: string, pass: Pass): boolean | JsonBlockRefusal {
  const pending = ps.pendingJson;
  if (pending === null) return false;
  // The block ends where its JSON completes, not on an inner `}` (`CommandCreateJson.java:155-162`, ocr T3b).
  if (!isJsonCloser(line) || !isJsonBodyComplete(pending.lines)) {
    pending.lines.push(line);
    return true;
  }
  ps.pendingJson = null;
  if (pending.refusal !== undefined) return pending.refusal;
  if (pass === 'one') finalizeJsonBody(pending.target, pending.lines);
  return true;
}

/** `CommandCreateJson#END` — one or more whitespace, closing brace, one or
 *  more whitespace, anchored on both ends. */
export function isJsonCloser(line: string): boolean {
  return /^\s*\}\s*$/.test(line);
}

/** Upstream's own wording, verbatim, from the duplicate-detection site
 *  (`CommandCreateJson#executeNow`, "JSON already exists: " +
 *  line0.getLazzy("CODE", 0), `CommandCreateJson.java:141-142`) — the SAME
 *  string `class-json-commands.ts`'s own `JSON_ALREADY_EXISTS` carries. */
const JSON_ALREADY_EXISTS = 'JSON already exists: ';

/**
 * Peek-only mirror of `state-parse-resolve.ts#resolveExistingState`'s TWO
 * lookup branches (diagram-wide `globalByName` when the id is globally
 * unique, else the CURRENT scope's own index) -- returns a boolean instead
 * of the `State`, so the duplicate check below can run BEFORE `makeState`/
 * `declareState` ever mutate anything, mirroring
 * `class-json-commands.ts#adapt`'s own pre-creation `state.classifierIndex
 * .has(id)` check. Duplicated here (not imported from
 * `state-parse-resolve.ts`) per this project's own "duplicated here rather
 * than imported across engine boundaries" convention
 * (`description/index.ts#annotationLines`'s doc) -- this file already owns
 * the ONE call site that needs a peek rather than a resolve-or-create.
 * Dotted (namespace-separator) ids are out of scope: no fixture in the
 * corpus declares a `json` leaf with a dotted id, duplicate or otherwise, so
 * `declareState`'s existing dotted-path branch is left untouched -- this
 * check only guards the flat-id branch it shares with everything else.
 * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java#quarkInContextSafe
 */
function stateAlreadyExists(ps: ParseState, id: string): boolean {
  const globalMatches = ps.globalByName.get(id);
  if (globalMatches !== undefined && globalMatches.length === 1) return true;
  return currentScope(ps).stateIndex.has(id);
}

// ---------------------------------------------------------------------------
// Host adapter — state's scope-stack `declareState`/`makeState` in place of
// class's flat `Classifier` index. Bound to ONE pass, unlike class (which has
// no pass concept): stereotype/color are baked into `makeState`'s opts BEFORE
// `declareState` (its pass-gated `applyDeclaredContent` merge reads them off
// the state object handed in, so they must already be there — see
// `JsonCommandHost.resolve`'s doc in the shared port), and the actual
// `jsonValue` write is gated to pass ONE (mirrors `declareState`'s own
// `applyDeclaredContent` pass gate — every other single-line state
// declaration in this parser follows the same convention, so a pass-TWO
// replay is a safe no-op re-resolve rather than a double-apply).
//
// D6/T1c (kokofa-47-deni140): state now DOES reject a duplicate id, like
// class (`class-json-commands.ts`'s own `resolve`) — but the check only runs
// on pass 'one'. `parseState` never reaches pass 'two' once pass 'one'
// refuses (`parser.ts`'s `if (refusalOne !== null) return refusalOne;`), and
// `ParseState.globalByName` starts EMPTY at the top of every fresh parse
// (`initParseState`) and is never reset between passes -- so every hit this
// check finds during pass 'one' was necessarily created by an EARLIER
// command in this SAME pass 'one' walk, never a legitimate pass-TWO replay
// of the SAME source line. Skipping the check on pass 'two' therefore loses
// no genuine duplicate: pass 'two' only ever runs once pass 'one' already
// approved every `json` declaration in the document.
// ---------------------------------------------------------------------------

function adapt(ps: ParseState, pass: Pass): JsonCommandHost<State> {
  // A multi-line block's refusal, held for `beginBody` to park on `ps.pendingJson` until the closing line (D4).
  let blockRefusal: JsonBlockRefusal | undefined;
  return {
    resolve(rawId, rawDisplay, stereotype, color, reuseExisting) {
      if (pass === 'one' && stateAlreadyExists(ps, rawId)) {
        // CommandCreateJson.java:141-142 / CommandCreateJsonSingleLine.java
        // :134-135 -- entity1 is null (a duplicate quark,
        // CommandCreateJson.java:199-203), so executeNow/executeArg return
        // an EXECUTION error that aborts the whole parse
        // (parser.ts#dispatchCommand's `ps.executionError` check), not a
        // silent no-op that keeps the first declaration.
        // `reuseExisting` is the multi-line opener (`quarkInContext(true, ...)`): its refusal waits for the closer.
        if (reuseExisting) blockRefusal = { message: JSON_ALREADY_EXISTS + rawId, score: 0 };
        else ps.executionError = JSON_ALREADY_EXISTS + rawId;
        return undefined;
      }
      const s = makeState(rawId, rawDisplay ?? rawId, 'json', {
        ...(color !== undefined ? { color } : {}),
        ...(stereotype !== undefined ? { stereotype } : {}),
      });
      return declareState(ps, s, pass);
    },
    beginBody(entity) {
      // A refused block still consumes its body (to its closing line), so no body line reaches the dispatcher;
      // its refusal is raised there (`stepPendingJson`).
      if (blockRefusal !== undefined) ps.pendingJson = { lines: [], refusal: blockRefusal };
      else ps.pendingJson = entity !== undefined ? { target: entity, lines: [] } : null;
    },
    setJsonValue(entity, value) {
      if (pass === 'one') entity.jsonValue = value;
    },
    refuseExecution(message, score, block) {
      if (block) {
        blockRefusal = { message, score };
        return;
      }
      ps.executionError = message;
      ps.executionErrorScore = score;
    },
  };
}

/**
 * JSON commands — spread into `COMMANDS` (state-commands.ts) right after
 * `NOTE_COMMANDS`, mirroring upstream `StateDiagramFactory.initCommandsList`'s
 * registration order (`CommandCreateJson`/`CommandCreateJsonSingleLine` sit
 * right before `CommonCommands.addCommonCommands1`, well after the note
 * family). `passes: ['one', 'two']` on both entries mirrors the
 * composite/frame opener precedent (state-commands-declarations.ts): the
 * pattern must match — and the body/entity resolution must run — on BOTH
 * passes so a multiline body is swallowed regardless of pass; the actual
 * `jsonValue` write is gated to pass ONE inside {@link adapt}.
 */
export const JSON_COMMANDS: readonly Command[] = [
  {
    pattern: JSON_MULTILINE_DECL_RE,
    passes: ['one', 'two', 'three'],
    execute: (ps, match, pass) => applyJsonMultilineOpen(adapt(ps, pass), match),
  },
  {
    pattern: JSON_SINGLE_LINE_RE,
    passes: ['one', 'two', 'three'],
    execute: (ps, match, pass) => applyJsonSingleLine(adapt(ps, pass), match),
  },
];
