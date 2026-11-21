/**
 * Node margins reserving room for association role labels.
 *
 * Graphviz only knows the size of the quantifier; the role is drawn on the
 * other side of the line, so upstream makes room for it around the entity
 * (`SvekEdge#reserveRoomForRoles`, called by `GraphvizImageBuilder` for every
 * link with a role BEFORE any `SvekEdge` is built). Same `Margins` channel as
 * the qualified-association `Kal` (`class-kal.ts#kalMarginsByEntity`): the
 * entity becomes shielded and is laid out as the `shape=plaintext` table.
 *
 * @see net/sourceforge/plantuml/svek/SvekEdge.java#reserveRoomForRoles,
 *      #marginsForRole (upstream a5731db447f)
 * @see net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:228-236
 */
import type { Relationship } from './ast.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import { measureLabelLines } from './class-edge-label-anchor.js';
import { createRoleBlock } from '../../core/svek/RoleLabels.js';
import { kalMarginsByEntity, type Kal, type KalMargins } from './class-kal.js';
import type { Theme } from '../../core/theme.js';
import { CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT } from '../../core/edge-label-box.js';

/** `Entity#ensureMargins` over every entity of both maps. */
export function mergeMarginMaps(
  a: ReadonlyMap<string, KalMargins>,
  b: ReadonlyMap<string, KalMargins>,
): Map<string, KalMargins> {
  const out = new Map(a);
  for (const [id, m] of b) {
    const prev = out.get(id);
    out.set(id, prev === undefined ? m : mergeMargins(prev, m));
  }
  return out;
}

/** `SvekEdge#marginsForRole`'s `+ 2`. */
const ROLE_MARGIN_PAD = 2;

/** `Margins#merge` (`svek/Margins.java:56-62`) — componentwise `max`. */
export function mergeMargins(a: KalMargins, b: KalMargins): KalMargins {
  return {
    x1: Math.max(a.x1, b.x1),
    x2: Math.max(a.x2, b.x2),
    y1: Math.max(a.y1, b.y1),
    y2: Math.max(a.y2, b.y2),
  };
}

/** `SvekEdge#marginsForRole` — `new Margins(w, w, 0, 0)`,
 *  `w = ceil(roleWidth) + 2`, the width of the whole block, icon included
 *  (`RoleLabels#create`, so a visibility icon widens it by `size + 2`). */
function marginsForRole(
  role: string,
  font: FontSpec,
  ctx: { measurer: StringMeasurer; classAttributeIconSize: number },
): KalMargins {
  const block = createRoleBlock(role, ctx.classAttributeIconSize);
  const textWidth = measureLabelLines(block.text, font, ctx.measurer).maxWidth;
  const width = Math.ceil(textWidth + (block.icon?.width ?? 0)) + ROLE_MARGIN_PAD;
  return { x1: width, x2: width, y1: 0, y2: 0 };
}

/**
 * One merged margin per entity carrying a role. A role stays with its own
 * endpoint (`rel.fromRole` with `rel.from`) however `dotEdgeRunsReversed`
 * orients the DOT edge: `Link#getInv` swaps entity and role together.
 */
export function roleMarginsByEntity(
  relationships: readonly Relationship[],
  cardinalityFont: FontSpec,
  ctx: { measurer: StringMeasurer; classAttributeIconSize: number },
): Map<string, KalMargins> {
  const out = new Map<string, KalMargins>();
  for (const rel of relationships) {
    for (const [entityId, role] of [
      [rel.from, rel.fromRole],
      [rel.to, rel.toRole],
    ] as const) {
      if (role === undefined) continue;
      const m = marginsForRole(role, cardinalityFont, ctx);
      const prev = out.get(entityId);
      out.set(entityId, prev === undefined ? m : mergeMargins(prev, m));
    }
  }
  return out;
}

/**
 * Every `Entity#ensureMargins` the class engine applies before the nodes are
 * sized: the qualified-association boxes (`Kal.java:106-121`) and, since
 * a5731db447f, the room reserved for role labels -- merged by `Margins#merge`
 * so a role and a `Kal` on one entity keep the componentwise max.
 */
export function entityMarginsByEntity(
  relationships: readonly Relationship[],
  kals: readonly Kal[],
  theme: Theme,
  measurer: StringMeasurer,
): Map<string, KalMargins> {
  const cardinalityFont = { family: theme.cardinalityFontFamily!, size: theme.cardinalityFontSize! };
  const classAttributeIconSize = theme.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT;
  return mergeMarginMaps(
    kalMarginsByEntity(kals),
    roleMarginsByEntity(relationships, cardinalityFont, { measurer, classAttributeIconSize }),
  );
}
