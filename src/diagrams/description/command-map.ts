/**
 * `CommandCreateMap` in the description factory (`DescriptionDiagramFactory.java:129`, the first of the three
 * leaf-type commands): a `map` leaf (`LeafType.MAP`, usymbol `null`) whose body is `BodierMap`'s table, drawn by
 * `EntityImageMap` (`GeneralImageBuilder.java:183-184`). A `key *-> Target` row also adds a link from that row's port
 * to `Target`, which must already exist.
 *
 * The block is a `CommandMultilines2` ending at the first `^\s*\}\s*$` line (no `finalVerification`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/objectdiagram/command/CommandCreateMap.java
 */
import { BodierMap } from '../../core/cucadiagram/BodierMap.js';
import { compileUpstream, optionalStereotype } from '../../core/command/CommandCreateElementFull.js';
import { COLORS_REGEXP } from '../../core/klimt/color/ColorParser.js';
import { getRegexp } from '../../core/url/UrlBuilder.js';
import type { DescriptiveLink, DescriptiveNode } from './ast.js';
import { gatherMultilineBlock } from './command-entity-image-block.js';
import { cleanId, finalizeDisplay, makeNode, stereotypeOfRun } from './parse-helpers.js';
import { addLink, emitNode, nextCreationIndex, type ParseState } from './parse-state.js';

/**
 * `^map NAME [<<stereo>>] [[[url]]] [#color] [##[style]linecolor] {$` (`CommandCreateMap.java:76-90`), NAME being
 * `(?:"display" as )?code` with code `[%pLN_.]+`.
 */
const MAP_DECL_RE = compileUpstream(
  String.raw`^map[%s]+(?:[%g](?<DISPLAY>[^%g]+)[%g][%s]+as[%s]+)?(?<NAME>[%pLN_.]+)` +
    `${optionalStereotype('STEREO')}(?<URL>${getRegexp()})?[%s]*(?<COLOR>${COLORS_REGEXP})?[%s]*` +
    String.raw`(?:##(?:\[(?<LINESTYLE>dotted|dashed|bold)\])?(?<LINECOLOR>\w+)?)?[%s]*\{$`,
);

/** The link `executeNow` adds for a body line holding a linked entry. */
export interface MapLink {
  /** `line.substring(0, x).trim()`: the row the link leaves from (`link.setPortMembers(key, null)`). */
  readonly key: string;
  /** `line.substring(x + linkStr.length()).trim()`: the entity it reaches. */
  readonly target: string;
  /** `linkStr.length() - 2`, handed to `LinkArg.noDisplay(length)`. */
  readonly length: number;
}

/**
 * The link a body line adds, read off the WHOLE line whichever branch stored its row, exactly as `executeNow` tests
 * `BodierMap.getLinkedEntry(line)` after `addFieldOrMethod` (a `k => a *-> B` line stores `k`, and links `k => a`).
 */
export function mapLinkOf(line: string): MapLink | undefined {
  const link = BodierMap.getLinkedEntry(line);
  if (link === undefined) return undefined;
  const x = line.indexOf(link);
  return { key: line.substring(0, x).trim(), target: line.substring(x + link.length).trim(), length: link.length - 2 };
}

/** `executeNow`'s refusals (`CommandCreateMap.java`). */
const MAP_ALREADY_EXISTS = 'Map already exists: ';
const MAP_BAD_ROW = 'Map definition should contains key => value';
const NO_SUCH_ENTITY = 'No such entity ';

/** `colors`: the `#colour`, then `##colour` as `LINE` and `##[style]` as the legacy stroke (`executeArg0`). */
function mapColorSpec(g: Record<string, string | undefined>): string | undefined {
  const parts: string[] = [];
  if (g['COLOR'] !== undefined) parts.push(g['COLOR']);
  if (g['LINECOLOR'] !== undefined) parts.push(`#line:${g['LINECOLOR']}`);
  if (g['LINESTYLE'] !== undefined) parts.push(`#line.${g['LINESTYLE']}`);
  return parts.length === 0 ? undefined : parts.join(';').replace(/;#/g, ';');
}

/** `executeArg0` (`CommandCreateMap.java`): `null` when the quark already holds an entity. */
function createMapLeaf(state: ParseState, g: Record<string, string | undefined>): DescriptiveNode | undefined {
  const name = g['NAME']!;
  const id = cleanId(name);
  if (state.nodesById.has(id)) return undefined;
  const run = g['STEREO'] === undefined ? undefined : stereotypeOfRun(g['STEREO']);
  const node = makeNode(id, finalizeDisplay(g['DISPLAY'] ?? name), 'rectangle', run?.stereotypes, mapColorSpec(g));
  node.leafType = 'map';
  node.mapBodier = new BodierMap();
  emitNode(state, node);
  return node;
}

/** The link a `*->` row adds: `new LinkType(LinkDecor.ARROW, LinkDecor.NONE)`, `LinkArg.noDisplay(length)`. */
function rowLink(
  state: ParseState,
  map: DescriptiveNode,
  key: string,
  target: string,
  length: number,
): DescriptiveLink {
  return {
    from: map.id,
    to: target,
    style: 'solid',
    arrowHead: 'open',
    headDecor: '>',
    length,
    tailPortMember: key,
    creationIndex: nextCreationIndex(state),
  };
}

/** `executeNow`'s body loop: one row per line, and a link per linked entry. `undefined` on success. */
function readBody(state: ParseState, map: DescriptiveNode, body: readonly string[]): string | undefined {
  const bodier = map.mapBodier!;
  for (const line of body) {
    if (!bodier.addFieldOrMethod(line)) return MAP_BAD_ROW;
    const link = mapLinkOf(line);
    if (link === undefined) continue;
    // `quarkInContext(true, dest)` must already hold an entity (`ident2.getData() == null` is an error).
    const target = cleanId(link.target);
    if (!state.nodesById.has(target)) return NO_SUCH_ENTITY + target;
    addLink(state, rowLink(state, map, link.key, target, link.length));
  }
  return undefined;
}

/** The `map` block on `lines[i]`, or `null` when the header does not match or the block never closes. */
export function tryMapBlock(state: ParseState, lines: readonly string[], i: number): number | null {
  const header = MAP_DECL_RE.exec(lines[i]!.trim());
  if (header === null) return null;
  const block = gatherMultilineBlock(lines, i);
  if (block === null) return null;
  const g = header.groups!;
  const map = createMapLeaf(state, g);
  if (map === undefined) {
    state.executionError = MAP_ALREADY_EXISTS + g['NAME']!;
    return block.consumed;
  }
  const error = readBody(state, map, block.body);
  if (error !== undefined) state.executionError = error;
  return block.consumed;
}
