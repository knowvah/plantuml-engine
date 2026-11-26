/**
 * `CommandCreateJson` and `CommandCreateJsonSingleLine` in the description factory
 * (`DescriptionDiagramFactory.java:130-131`): a `json` leaf (`LeafType.JSON`, usymbol `null`) whose body is
 * `BodierJSon`'s value, drawn by `EntityImageJson` (`GeneralImageBuilder.java:186-187`).
 *
 * The header grammar and the JSON parser are the shared `core/command/CommandCreateJson.ts`, which class and state
 * already consume (decisions D3). The multiline form is a `CommandMultilines2` with `END = ^\s*\}\s*$`
 * (`CommandCreateJson.java:68-69`) whose `finalVerification` answers `OK_PARTIAL` until the gathered body parses
 * (`:155-162`), so a `}` inside the data does not end the block.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/objectdiagram/command/CommandCreateJson.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/objectdiagram/command/CommandCreateJsonSingleLine.java
 */
import {
  JSON_MULTILINE_DECL_RE,
  JSON_SINGLE_LINE_RE,
  applyJsonMultilineOpen,
  applyJsonSingleLine,
  finalizeJsonBody,
  parseJsonNode,
  type JsonCommandHost,
} from '../../core/command/CommandCreateJson.js';
import type { DescriptiveNode } from './ast.js';
import { gatherMultilineBlock } from './command-entity-image-block.js';
import { cleanId, finalizeDisplay, makeNode, stereotypeOfRun } from './parse-helpers.js';
import { emitNode, type ParseState } from './parse-state.js';

/** `CommandCreateJson#executeNow`'s duplicate refusal (`CommandCreateJson.java:142`). */
const JSON_ALREADY_EXISTS = 'JSON already exists: ';
/** `executeArg`'s refusal of data that does not parse (`CommandCreateJsonSingleLine.java:150-151`). */
const JSON_BAD_DATA = 'Bad data';

/** `finalVerification`: `OK_PARTIAL` until `getJsonValue` parses (`CommandCreateJson.java:155-162,164-185`). */
function jsonBodyComplete(body: readonly string[]): boolean {
  const joined = body.join('');
  return parseJsonNode(`{${joined}}`) !== null || parseJsonNode(joined) !== null;
}

/** `executeArg0`: `quarkInContext(true, idShort)` with data is a duplicate (`CommandCreateJson.java:197-222`). */
function host(state: ParseState, created: { node?: DescriptiveNode }): JsonCommandHost<DescriptiveNode> {
  return {
    resolve(rawId, rawDisplay, stereotype, color) {
      const id = cleanId(rawId);
      if (state.nodesById.has(id)) {
        state.executionError = JSON_ALREADY_EXISTS + rawId;
        return undefined;
      }
      const run = stereotype === undefined ? undefined : stereotypeOfRun(`<<${stereotype}>>`);
      const node = makeNode(id, finalizeDisplay(rawDisplay ?? id), 'rectangle', run?.stereotypes, color);
      node.leafType = 'json';
      emitNode(state, node);
      created.node = node;
      return node;
    },
    beginBody() {
      // The body is gathered by `tryJsonBlock` before the header runs; nothing to open.
    },
    setJsonValue(entity, value) {
      entity.jsonValue = value;
    },
    refuseExecution(message, score) {
      state.executionError = message;
      state.executionErrorScore = score;
    },
  };
}

/**
 * The multiline form: the header on `lines[i]`, the body up to the `}` line that completes the JSON. `null` when
 * the header does not match or the block never completes (`isValid` answers `NOT_OK`, a Syntax Error upstream).
 */
export function tryJsonBlock(state: ParseState, lines: readonly string[], i: number): number | null {
  const header = JSON_MULTILINE_DECL_RE.exec(lines[i]!.trim());
  if (header === null) return null;
  const block = gatherMultilineBlock(lines, i, jsonBodyComplete);
  if (block === null) return null;
  const created: { node?: DescriptiveNode } = {};
  applyJsonMultilineOpen(host(state, created), header);
  // The block's refusal lands on its last line (`PSystemCommandFactory.java:218-225`, ocr D4).
  if (state.executionError !== undefined) state.executionErrorSpan = block.consumed;
  // `executeNow` creates the leaf before validating the data and keeps it on "Bad data" (`:139-150`).
  if (created.node !== undefined) finalizeJsonBody(created.node, block.body);
  return block.consumed;
}

/** `CommandCreateJsonSingleLine`: one line, `null` when it does not match. */
export function tryJsonSingleLine(state: ParseState, line: string): number | null {
  const match = JSON_SINGLE_LINE_RE.exec(line);
  if (match === null) return null;
  const created: { node?: DescriptiveNode } = {};
  applyJsonSingleLine(host(state, created), match);
  // `executeArg`: a value that does not parse is `error("Bad data")` (`CommandCreateJsonSingleLine.java:150-151`).
  // A refused colour already ended the command (`executeArg0` throws before `getJsonValue`, `:138-145`).
  if (state.executionError !== undefined) return 1;
  if (created.node !== undefined && created.node.jsonValue === undefined) state.executionError = JSON_BAD_DATA;
  return 1;
}
