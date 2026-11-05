/**
 * The blocks `BodyEnhanced1#getArea` builds from a tree or table run (java:133-147), apart from the rows and dividers
 * `class-body-enhanced-layout.ts` lays out. A table reuses the class note's grid, `AtomTable`'s one measure here.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cucadiagram/BodyEnhanced1.java:133-147
 */
import type { ClassifierGeo } from './layout.js';
import type { EnhancedBodyBlock } from './class-body-enhanced.js';
import type { BlockLayoutResult, EnhancedBodyPart, EnhancedLayoutCtx } from './class-body-enhanced-layout.js';
import { measureTreeCells, computeTreeConnectors } from './class-body-tree.js';
import { memberBaseFont } from './class-member-creole.js';
import { buildTableRow } from './note-layout-measure-table.js';

/** `AtomWithMargin(tree, 2, 2)`'s top half (`StripeTree.java`). */
const TREE_BLOCK_MARGIN = 2;

/** One tree-block (`EnhancedBodyBlock` with `kind: 'tree'`) — the
 *  `AtomTree`/`Skeleton2` geometry (`class-body-tree.ts`), offset by
 *  `TREE_BLOCK_MARGIN` (`AtomWithMargin(tree, 2, 2)`'s top half) and
 *  `cursor`. Text `indent` is `level*8 + 10` (`xEndForLevel(level) +
 *  CELL_TEXT_MARGIN`, `class-body-tree.ts`'s own formula), baked per-row
 *  since level varies cell to cell. */
export function layoutTreeBlock(
  block: Extract<EnhancedBodyBlock, { kind: 'tree' }>,
  ctx: EnhancedLayoutCtx,
  cursor: number,
  parts: EnhancedBodyPart[],
): BlockLayoutResult {
  const { fontSpec, measurer, sprites, baselineOffset } = ctx;
  const left = block.margin?.left ?? 0;
  const tree = measureTreeCells(block.cells, fontSpec, measurer, sprites);
  const contentTop = cursor + TREE_BLOCK_MARGIN;
  const rows: ClassifierGeo['rows'] = tree.rows.map((r) => ({
    text: r.build.atoms.length === 1 && r.build.atoms[0]!.kind === 'text' ? r.build.atoms[0]!.text : '',
    y: contentTop + r.localTop + baselineOffset,
    indent: left + r.level * 8 + 10,
    width: r.build.width,
    atoms: r.build.atoms,
  }));
  const connectors = computeTreeConnectors(tree.rows).map((c) => ({
    bulletX: left + c.bulletX,
    bulletY: contentTop + c.bulletY,
    hx1: left + c.hx1,
    hx2: left + c.hx2,
    hy: contentTop + c.hy,
    vx: left + c.vx,
    vy1: contentTop + c.vy1,
    vy2: contentTop + c.vy2,
  }));
  parts.push({ kind: 'tree', rows, connectors });
  return {
    cursor: contentTop + tree.height + TREE_BLOCK_MARGIN + (block.margin?.bottom ?? 0),
    width: tree.width + left * 2,
  };
}

/** A table part of a run: `Display#create7` under the body's font, inside the run's margin. */
export function layoutTableBlock(
  block: Extract<EnhancedBodyBlock, { kind: 'table' }>,
  ctx: EnhancedLayoutCtx,
  cursor: number,
  parts: EnhancedBodyPart[],
): BlockLayoutResult {
  const { fontSpec, measurer, sprites, baselineOffset } = ctx;
  const row = buildTableRow(block.lines, {
    fontSize: fontSpec.size,
    font: memberBaseFont(fontSpec, {}),
    fontSpec,
    measurer,
    maxWidth: 0,
    sprites,
  });
  const { left, bottom } = block.margin;
  parts.push({ kind: 'table', x: left, y: cursor, baselineOffset, table: row.table! });
  return { cursor: cursor + row.height + bottom, width: row.width + left * 2 };
}
