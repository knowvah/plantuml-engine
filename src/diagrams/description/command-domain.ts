/**
 * `CommandCreateDomain` (`DescriptionDiagramFactory.java:137`, registered last): `domain` and `requirement`, as a leaf
 * (`LeafType.DOMAIN`/`REQUIREMENT`, drawn by the `descdiagram` images, `GeneralImageBuilder.java:235-255`) or, with a
 * trailing `{`, as a group (`GroupType.DOMAIN`/`REQUIREMENT`) through `gotoGroup`.
 *
 * `USymbols.fromString(typeString)` answers `null` for every string this command passes (`domain`, `requirement`,
 * `machine`, `causal`, `designed`, `lexical`, `biddable`; `USymbols.java:122-181`), so a group is a null-usymbol group:
 * `Cluster` styles it as `USymbols.PACKAGE` (`Cluster.java:387`) and decorates it with the skin's package style, the
 * `PACKAGE` folder by default (`Cluster.java:357-367`, `ClusterDecoration.java:66-71`, `PackageStyle.java:87-88`). The
 * group carries `symbol: 'package'` for that, and `groupType` for the title and stereotype styles that differ.
 *
 * `executeArg` reads `URL_KEY` and `COLOR`, which this regex never captures, so both are always null: no URL, no
 * colour (ported as-is).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/CommandCreateDomain.java
 */
import { compileUpstream, optionalStereotype } from '../../core/command/CommandCreateElementFull.js';
import { finalizeDisplay, makeNode, stereotypeOfRun } from './parse-helpers.js';
import { emitNode, type ParseState } from './parse-state.js';

/** `GenericRegexProducer#getGenericRegex` (`GenericRegexProducer.java:43-56`). */
function genericRegex(level: number): string {
  // Java's `\\<`/`\\>` are literal angle brackets; the `u` flag `compileUpstream` sets rejects those escapes.
  const part1 = '(?:[^<>/]|<';
  const part2 = '>)*';
  return level === 0 ? part1 + part2 : part1 + genericRegex(level - 1) + part2;
}

/** `GenericRegexProducer.PATTERN` (`GenericRegexProducer.java:40`). */
const GENERIC_PATTERN = '[^<>/]' + genericRegex(4);

/** `DISPLAY_WITH_GENERIC` (`CommandCreateDomain.java:58`). */
const DISPLAY_WITH_GENERIC = `[%g](?<DISPLAY>.+?)(?:<(?:${GENERIC_PATTERN})>)?[%g]`;

/** `getRegexConcat` (`CommandCreateDomain.java:65-77`). */
const DOMAIN_RE = compileUpstream(
  String.raw`^(?<TYPE>requirement|domain)[%s]+${DISPLAY_WITH_GENERIC}[%s]+as[%s]+(?<CODE>[a-zA-Z0-9]+)` +
    `${optionalStereotype('STEREO')}(?<GROUP>\\{)?$`,
);

/** `executeArg`'s duplicate refusal (`CommandCreateDomain.java`: "Object already exists : " + code). */
const OBJECT_ALREADY_EXISTS = 'Object already exists : ';

/** The `domain`/`requirement` line, or `null` when it does not match. */
export function tryDomainLine(state: ParseState, line: string): number | null {
  const match = DOMAIN_RE.exec(line);
  if (match === null) return null;
  const g = match.groups!;
  const kind = g['TYPE']!.toLowerCase() === 'domain' ? 'domain' : 'requirement';
  const code = g['CODE']!;
  // `quarkInContext(true, cleanId(code))`: an existing entity is an error, leaf or group.
  if (state.nodesById.has(code)) {
    state.executionError = OBJECT_ALREADY_EXISTS + code;
    return 1;
  }
  const run = g['STEREO'] === undefined ? undefined : stereotypeOfRun(g['STEREO']);
  const isGroup = g['GROUP'] !== undefined;
  const node = makeNode(code, finalizeDisplay(g['DISPLAY']!), isGroup ? 'package' : 'rectangle', run?.stereotypes);
  if (isGroup) {
    node.declaredAsGroup = true;
    node.groupType = kind;
    emitNode(state, node);
    state.containerStack.push(node);
  } else {
    node.leafType = kind;
    emitNode(state, node);
  }
  return 1;
}
