/**
 * `@startflow` box draw order, for `compareSvg` (ruling #174: option 2,
 * narrowed; docs/svg-conformance.md "Flow box order").
 *
 * `FlowDiagram#drawU` draws the boxes by iterating `tilesBoxes`, a
 * `HashMap<Tile, ActivityBox>` (`FlowDiagram.java:77`, `129-140`). `Tile` does
 * not override `hashCode`, so the jar's box order follows JVM identity hashes
 * and changes run to run. The connectors are drawn afterwards from
 * `field.getPaths()` in source order (`FlowDiagram.java:141-152`).
 *
 * So for a FLOW reference, both normalized trees get their leading run of box
 * groups sorted into one canonical order, and everything after it stays where
 * it is. A box group is one `ActivityBox.drawU` (`ActivityBox.java:88-100`):
 * the rounded rectangle, then every element of its text block. Groups move
 * whole, so a text can never pair with another box's shape.
 *
 * This is a compare rule, not an accepted divergence: our insertion order is
 * an order the jar can produce. It does NOT cover the jar's run-to-run LAYOUT
 * changes (`TilesField#moveAllToEast`, `TilesField.java:158-173`); reordering
 * cannot reconcile different coordinates.
 */
import type { NormalizedNode } from './normalize.js';

/**
 * The root's diagram type. `normalizeSvg` strips `data-*`, so this reads the
 * raw string; `[^>]*` keeps the match on the `<svg>` tag itself.
 */
const FLOW_ROOT = /^\s*(?:<\?[^>]*\?>\s*)*<svg\b[^>]*\sdata-diagram-type="FLOW"/;

/** `HColors.MY_YELLOW` (`HColors.java:95`): the box fill. */
const MY_YELLOW = '#FEFECE';
/** `HColors.MY_RED` (`HColors.java:96`): the box stroke and every connector. */
const MY_RED = '#A80036';
/** The box stroke, `UStroke.withThickness(1.5)` (`ActivityBox.java:97`). */
const BOX_STROKE_WIDTH = '1.5';
/** `SINGLE_SIZE_X` / `SINGLE_SIZE_Y` (`FlowDiagram.java:73-74`): one tile. */
const SINGLE_SIZE_X = 100;
const SINGLE_SIZE_Y = 35;

/** The reference is a jar `@startflow` document. */
export function isFlowDocument(svg: string): boolean {
  return FLOW_ROOT.test(svg);
}

function paint(node: NormalizedNode, name: string): string {
  return (node.attrs?.[name] ?? '').toUpperCase();
}

/** The rounded rectangle `ActivityBox.drawU` paints (a `polygon` under `!option handwritten`). */
function isBoxShape(node: NormalizedNode): boolean {
  return (
    node.type === 'element' &&
    paint(node, 'fill') === MY_YELLOW &&
    paint(node, 'stroke') === MY_RED &&
    node.attrs?.['stroke-width'] === BOX_STROKE_WIDTH
  );
}

/** A connector's line or arrow ellipse (`path`/`polygon` under handwritten). */
function isConnector(node: NormalizedNode): boolean {
  return (
    node.type === 'element' && !isBoxShape(node) && (paint(node, 'stroke') === MY_RED || paint(node, 'fill') === MY_RED)
  );
}

/** Every number in a `points` or `d` value, read as x,y pairs. */
function coordinatePairs(value: string): Array<[number, number]> {
  const nums = (value.match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) ?? []).map(Number);
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pairs.push([nums[i]!, nums[i + 1]!]);
  return pairs;
}

/** The centre of a box shape's bounding box. */
function centre(shape: NormalizedNode): [number, number] {
  const a = shape.attrs ?? {};
  if (a['width'] !== undefined) {
    return [Number(a['x'] ?? 0) + Number(a['width']) / 2, Number(a['y'] ?? 0) + Number(a['height'] ?? 0) / 2];
  }
  const pts = coordinatePairs(a['points'] ?? a['d'] ?? '');
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

interface BoxGroup {
  readonly row: number;
  readonly col: number;
  readonly key: string;
  readonly nodes: readonly NormalizedNode[];
}

/**
 * `drawU` centres each box in its tile (`FlowDiagram.java:136-139`: the
 * translate adds `(2 * SINGLE_SIZE - dim) / 2`), so the centre divided by the
 * tile size rounds to the tile index, whatever the label's size or the
 * handwritten jiggle. The serialized group breaks a tie.
 */
function toGroup(nodes: readonly NormalizedNode[]): BoxGroup {
  const [cx, cy] = centre(nodes[0]!);
  return {
    row: Math.round(cy / SINGLE_SIZE_Y),
    col: Math.round(cx / SINGLE_SIZE_X),
    key: JSON.stringify(nodes),
    nodes,
  };
}

function byTile(a: BoxGroup, b: BoxGroup): number {
  if (a.row !== b.row) return a.row - b.row;
  if (a.col !== b.col) return a.col - b.col;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/**
 * The drawing's children as box groups plus the positional tail, or
 * `undefined` when they do not have the shape `drawU` produces (a box first,
 * no box after the first connector). The caller then compares positionally.
 */
function splitBoxGroups(
  kids: readonly NormalizedNode[],
): { groups: BoxGroup[]; tail: readonly NormalizedNode[] } | undefined {
  if (kids.length === 0 || !isBoxShape(kids[0]!)) return undefined;
  const found = kids.findIndex(isConnector);
  const tailStart = found < 0 ? kids.length : found;
  const tail = kids.slice(tailStart);
  if (tail.some(isBoxShape)) return undefined;
  const groups: BoxGroup[] = [];
  let start = 0;
  for (let i = 1; i <= tailStart; i++) {
    if (i === tailStart || isBoxShape(kids[i]!)) {
      groups.push(toGroup(kids.slice(start, i)));
      start = i;
    }
  }
  return { groups, tail };
}

/**
 * `root` with its drawing `<g>`'s box groups in canonical tile order (row,
 * then column) and every other node untouched. Returns `root` itself when the
 * drawing does not have the shape `FlowDiagram#drawU` produces.
 */
export function canonicalizeFlowBoxOrder(root: NormalizedNode): NormalizedNode {
  const children = root.children ?? [];
  const gi = children.findIndex((c) => c.tag === 'g');
  if (gi < 0) return root;
  const g = children[gi]!;
  const split = splitBoxGroups(g.children ?? []);
  if (split === undefined) return root;
  const ordered = [...split.groups].sort(byTile).flatMap((group) => group.nodes);
  const canonicalG: NormalizedNode = { ...g, children: [...ordered, ...split.tail] };
  return { ...root, children: children.map((c, i) => (i === gi ? canonicalG : c)) };
}
