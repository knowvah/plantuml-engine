/**
 * `CommandLinkActivity#getEntity` and `#ubrexGetEntityForIfOnly`, split from `CommandLinkActivity.ts` (D11): which
 * `Entity` one end of a link names, creating the leaf (and, for `in <partition>`, the group) on the way.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/CommandLinkActivity.java:312-458
 */
import type { Entity } from '../../../core/abel/Entity.js';
import { GroupType } from '../../../core/abel/GroupType.js';
import { LeafType } from '../../../core/abel/LeafType.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import type { Quark } from '../../../core/plasma/Quark.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { eventuallyRemoveStartingAndEndingDoubleQuote } from '../../../core/url/Url.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';

/** `StringUtils.eventuallyRemoveStartingAndEndingDoubleQuote(String)`'s format. @see StringUtils.java:86-91 */
const DEFAULT_QUOTE_FORMAT = '"([:';

/** `StringUtils.eventuallyRemoveStartingAndEndingDoubleQuote(s)`, the one-argument overload. */
export function removeQuotes(s: string | undefined): string | undefined {
  return s === undefined
    ? undefined
    : (eventuallyRemoveStartingAndEndingDoubleQuote(s, DEFAULT_QUOTE_FORMAT) as string);
}

/** `diagram.quarkInContext(true, diagram.cleanId(id))`, in every branch of the Java. */
function quarkOf(diagram: ActivityDiagram, id: string): Quark<Entity> {
  return diagram.quarkInContext(true, diagram.cleanId(id) as string);
}

/** `getTypeIfExisting`: the body is commented out upstream, the answer is always `ACTIVITY`.
 *  @see CommandLinkActivity.java:450-458 */
function getTypeIfExisting(_system: ActivityDiagram, _code: Quark<Entity>): LeafType {
  return LeafType.ACTIVITY;
}

/** The `diagram.gotoGroup(location, quark, display, GroupType.PACKAGE)` of a `in <partition>` end. */
function gotoPartition(
  diagram: ActivityDiagram,
  location: LineLocation | undefined,
  partition: string,
  display: (quark: Quark<Entity>) => Display,
): void {
  const quark = quarkOf(diagram, partition);
  diagram.gotoGroup(location, quark, display(quark), GroupType.PACKAGE);
}

/** The partition wrapper the CODE, QUOTED and QUOTED_INVISIBLE branches share: open the group, build, close it. */
function inPartition(
  diagram: ActivityDiagram,
  location: LineLocation | undefined,
  partition: string | undefined,
  display: (quark: Quark<Entity>) => Display,
  build: () => Entity,
): Entity {
  if (partition !== undefined) gotoPartition(diagram, location, partition, display);
  const result = build();
  if (partition !== undefined) diagram.endGroup();

  return result;
}

/** `Display.getWithNewlines(quark)`, the group's display in the CODE and QUOTED_INVISIBLE branches. */
function quarkDisplay(quark: Quark<Entity>): Display {
  return Display.getWithNewlines(quark);
}

/** The existing entity of `quark`, or the new leaf `create` makes. */
function existingOrCreated(quark: Quark<Entity>, create: () => Entity): Entity {
  return quark.getData() ?? create();
}

/** @see CommandLinkActivity.java:332-349 (CODE) */
function getEntityFromCode(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  idShort: string,
  partition: string | undefined,
): Entity {
  return inPartition(diagram, location, partition, quarkDisplay, () => {
    const ident = quarkOf(diagram, idShort);
    const type = getTypeIfExisting(diagram, ident);
    return existingOrCreated(ident, () =>
      diagram.reallyCreateLeaf(location, ident, Display.getWithNewlines(diagram.getPragma(), idShort), type, undefined),
    );
  });
}

/** @see CommandLinkActivity.java:351-358 (BAR) */
function getEntityFromBar(location: LineLocation | undefined, diagram: ActivityDiagram, bar: string): Entity {
  const quark = quarkOf(diagram, bar);
  return existingOrCreated(quark, () =>
    diagram.reallyCreateLeaf(
      location,
      quark,
      Display.getWithNewlines(diagram.getPragma(), bar),
      LeafType.SYNCHRO_BAR,
      undefined,
    ),
  );
}

/** @see CommandLinkActivity.java:360-379 (QUOTED) */
function getEntityFromQuoted(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  display: string,
  as: string | undefined,
  partition: string | undefined,
): Entity {
  const quotedString = as ?? display;
  // This branch labels the group with the partition text, where CODE and QUOTED_INVISIBLE use the quark.
  const partitionDisplay = (): Display => Display.getWithNewlines(diagram.getPragma(), partition as string);
  return inPartition(diagram, location, partition, partitionDisplay, () => {
    const quark = quarkOf(diagram, quotedString);
    const type = getTypeIfExisting(diagram, quark);
    return existingOrCreated(quark, () =>
      diagram.reallyCreateLeaf(location, quark, Display.getWithNewlines(diagram.getPragma(), display), type, undefined),
    );
  });
}

/** @see CommandLinkActivity.java:381-398 (QUOTED_INVISIBLE) */
function getEntityFromQuotedInvisible(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  quoteInvisibleString: string,
  partition: string | undefined,
): Entity {
  return inPartition(diagram, location, partition, quarkDisplay, () => {
    const identInvisible = quarkOf(diagram, quoteInvisibleString);
    return existingOrCreated(identInvisible, () =>
      diagram.reallyCreateLeaf(
        location,
        identInvisible,
        Display.getWithNewlines(diagram.getPragma(), identInvisible.getName()),
        LeafType.ACTIVITY,
        undefined,
      ),
    );
  });
}

/** `(*)` or `(*top)` / `(*N)`: the start on the source side, the end (named by `suppId`) on the target side. */
function getEntityFromStar(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  arg: RegexResult,
  suf: string,
  start: boolean,
): Entity {
  const suppId = arg.get('STAR' + suf, 1);
  // if (suppId != null) diagram.getStart().setTop(true);  -- commented out upstream (java:321-324)
  if (start) return diagram.getStart(location);

  return diagram.getEnd(location, suppId);
}

/** The five name-bearing branches of `getEntity`, in Java's order; `undefined` when none of them is in `arg`. */
function getNamedEntity(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  arg: RegexResult,
  suf: string,
): Entity | undefined {
  const partition = removeQuotes(arg.get('PARTITION' + suf, 0));

  const idShort = arg.get('CODE' + suf, 0);
  if (idShort !== undefined) return getEntityFromCode(location, diagram, idShort, partition);

  const bar = arg.get('BAR' + suf, 0);
  if (bar !== undefined) return getEntityFromBar(location, diagram, bar);

  const quoted = arg.get('QUOTED' + suf)!;
  if (quoted.get(0) !== undefined)
    return getEntityFromQuoted(location, diagram, quoted.get(0)!, quoted.get(1), partition);

  const quoteInvisibleString = arg.get('QUOTED_INVISIBLE' + suf, 0);
  if (quoteInvisibleString !== undefined)
    return getEntityFromQuotedInvisible(location, diagram, quoteInvisibleString, partition);

  return undefined;
}

/**
 * The entity one end of the link names: `start` is the source end (`STAR`, `CODE`, ...), else the target end
 * (`STAR2`, `CODE2`, ...). `undefined` is Java `null`: the end matched a `FIRST` alternative this method does not
 * know. A missing source answers `getLastEntityConsulted()`.
 *
 * @see CommandLinkActivity.java:312-403
 */
export function getEntity(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  arg: RegexResult,
  start: boolean,
): Entity | undefined {
  const suf = start ? '' : '2';

  if (arg.get('OPENBRACKET' + suf, 0) !== undefined) return diagram.createInnerActivity(location);

  if (arg.get('STAR' + suf, 0) !== undefined) return getEntityFromStar(location, diagram, arg, suf, start);

  const named = getNamedEntity(location, diagram, arg, suf);
  if (named !== undefined) return named;

  const first = arg.get('FIRST' + suf, 0);
  if (first === undefined) return diagram.getLastEntityConsulted();

  return undefined;
}

/**
 * The source of `UBrexCommandIf`'s `if` line (names `QUOTED1`/`QUOTED2`, no partition, no `STAR2`).
 *
 * @see CommandLinkActivity.java:405-448
 */
export function ubrexGetEntityForIfOnly(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  arg: RegexResult,
): Entity | undefined {
  if (arg.get('STAR', 0) !== undefined) return diagram.getStart(location);

  const idShort = arg.get('CODE', 0);
  if (idShort !== undefined) return getEntityFromCode(location, diagram, idShort, undefined);

  const bar = arg.get('BAR', 0);
  if (bar !== undefined) return getEntityFromBar(location, diagram, bar);

  const quoted1 = arg.get('QUOTED1', 0);
  if (quoted1 !== undefined) return getEntityFromQuoted(location, diagram, quoted1, arg.get('QUOTED2', 0), undefined);

  return diagram.getLastEntityConsulted();
}
