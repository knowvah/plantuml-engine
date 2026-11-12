/**
 * What the Chen commands repeat between Java files: the error text of a missing entity, the `NAME` leaf grammar of
 * `CommandAssociate`, `CommandSimpleSubclass` and `CommandMultiSubclass`, the entity lookup they each inline, and
 * `String#split(",")` (D9).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandAssociate.java:98-110
 */
import type { Entity } from '../../../core/abel/Entity.js';
import { Link } from '../../../core/abel/Link.js';
import type { LinkArg } from '../../../core/abel/LinkArg.js';
import { LinkDecor } from '../../../core/decoration/LinkDecor.js';
import { LinkType } from '../../../core/decoration/LinkType.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { ChenEerDiagram } from '../ChenEerDiagram.js';

/** The prefix of the error a missing entity answers. @see CommandAssociate.java:103, CommandMultiSubclass.java:126 */
export const NO_SUCH_ENTITY = 'No such entity: ';

/** An entity name: `NAME1`, `NAME2` and `SUPERCLASS`. @see CommandAssociate.java:68, 75 */
export const NAME_PATTERN = '([%pLN_.-]+)';

/** The `-` or `=` of a participation. @see CommandAssociate.java:70, 73 */
export const PARTICIPATION_PATTERN = '([-=])';

/** The `=` that makes a participation total, drawn as a double line. @see CommandAssociate.java:97 */
export const DOUBLE_PARTICIPATION = '=';

/** `new LinkType(LinkDecor.NONE, LinkDecor.NONE)`, the start of every Chen link. @see CommandAssociate.java:112 */
export function plainLinkType(): LinkType {
  return new LinkType(LinkDecor.NONE, LinkDecor.NONE);
}

/**
 * `diagram.quarkInContext(true, name).getData()`: the entity already created under `name`, if any.
 * @see CommandAssociate.java:100-101
 */
export function entityNamed(diagram: ChenEerDiagram, name: string): Entity | undefined {
  return diagram.quarkInContext(true, name).getData();
}

/**
 * `String#split(",")`: a trailing empty string is dropped, JS `split` keeps it, and no match answers the whole
 * string, even an empty one.
 * @see CommandMultiSubclass.java:108
 */
export function javaSplitComma(s: string): string[] {
  if (!s.includes(',')) return [s];
  const parts = s.split(',');
  while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

/** The two entities a link joins: its `entity1` then `entity2`. */
export type LinkEnds = readonly [Entity, Entity];

/**
 * `new Link(location, diagram, diagram.getCurrentStyleBuilder(), entity1, entity2, linkType, linkArg)`, the
 * constructor call every Chen command makes.
 * @see CommandAssociate.java:115-117
 */
export function newLink(
  diagram: ChenEerDiagram,
  location: LineLocation | undefined,
  ends: LinkEnds,
  linkType: LinkType,
  linkArg: LinkArg,
): Link {
  return new Link(
    location,
    diagram,
    diagram.getSkinParam().getCurrentStyleBuilder(),
    ends[0],
    ends[1],
    linkType,
    linkArg,
  );
}
