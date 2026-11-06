/**
 * `map` classifier sizing — `kind:'map'` leaves in the class diagram layout
 * engine (./layout.ts). Split out of ./class-object-map-sizing.ts (G3/O1,
 * same 500-line-per-file-cap motivation as that file's own module doc) —
 * `object`'s own sizing plus the header math SHARED by object/map/json stays
 * there; this file owns `map`'s data-row-table-specific math only.
 *
 * Faithful port of the dimension math:
 *   @see ~/git/plantuml/.../svek/image/EntityImageMap.java
 *   @see ~/git/plantuml/.../cucadiagram/TextBlockMap.java
 *   @see ~/git/plantuml/.../cucadiagram/BodierMap.java (getBody — HorizontalAlignment source)
 *   @see ~/git/plantuml/.../klimt/geom/HorizontalAlignment.java (getPosition — key centering)
 *
 * Verified byte-for-byte (WidthTableMeasurer, matching the jar's
 * `-DPLANTUML_DETERMINISTIC_TEXT=true` svek DOT dump) against:
 *   - test-results/dot-cache/object/bepafe-03-teda035 — map, 3 plain rows,
 *     no stereotype (full TextBlockMap width/height formula, exact match;
 *     G3/O1: data-row key-centering/value-flush-left/baseline).
 *   - test-results/dot-cache/object/diveje-52-xefe514 — map, 1 linked
 *     (Point) row + 2 plain rows (G3/O1: Point-row key centers against the
 *     FULL box width, not colA — `TextBlockMap#drawU`'s own `if (value
 *     instanceof Point)` branch uses a different denominator).
 * See this task's mission-brief return for the worked numbers.
 */

import type { Classifier, MapRow } from './ast.js';
import { MAP_POINT_SENTINEL } from './ast.js';
import type { Theme } from '../../core/theme.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { ClassifierGeo } from './layout.js';
import type { MeasuredClassifier } from './class-layout-helpers.js';
import { splitJsonCell, type JsonCellContext } from './class-json-sizing.js';
import { getEmbeddedType } from '../../core/EmbeddedDiagram.js';
import { parseWithNewlines } from '../../core/klimt/creole/DisplayNewlines.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { renderEmbed, wrapEmbeddedSource } from './class-body-enhanced-embeds.js';
import { scanEmbeddedElementBlock } from './class-embedded-block.js';
import { getClassNestedDiagramRenderer } from './class-nested-diagram-renderer.js';
import { resolveElementMaximumWidth } from '../../core/theme-element-resolve.js';
import type { Dim } from './class-object-map-sizing.js';
import { floorAtMinimumWidth } from './class-object-map-sizing.js';
import { headerFontSpec, resolveHeaderFontOverride, resolveObjectBodyFont } from './object-kind-style.js';
import { resolveStyleStereotypeTags } from './class-stereotype.js';
import {
  titleDimension,
  measureStereo,
  headerRows,
  baselineOffsetFor,
  measureNameBlock,
  nameRowCountFields,
  stereoInkField,
} from './class-object-map-sizing.js';
import type { MemberRenderAtom } from './class-member-creole.js';
import { buildMemberAtoms, memberBaseFont, resolveMemberAtoms } from './class-member-creole.js';
import { mapPortName } from './class-map-port-rows.js';

/** EntityImageMap: `withMargin(name, 2, 2)` — fixed, not style-driven
 *  (unlike object's Padding-based name margin, which happens to share the
 *  same numeric value). */
const MAP_NAME_MARGIN = 2;
/** TextBlockMap#getTextBlock: `withMargin(result, 5, 2)` per key/value cell. */
export const MAP_CELL_MARGIN_X = 5;
const MAP_CELL_MARGIN_Y = 2;
/** TextBlockMap.Point#getDiameter — the linked-row value-cell placeholder;
 *  never actually drawn (see buildMapRowGeo doc), only sized. */
const MAP_POINT_DIAMETER = 7;
/** EntityImageMap.xMarginCircle. */
const MAP_X_MARGIN_CIRCLE = 5;

interface MapRowMetrics {
  keyWidth: number;
  valueWidth: number;
  height: number;
  /** A `key *-> dest` linked row (or an unresolved one) — value == '' is
   *  this AST's placeholder for TextBlockMap's Point sentinel (ast.ts
   *  MapRow doc). */
  isPoint: boolean;
  /** Raw (unpadded) key text width, unrounded — reused for BOTH the key's
   *  own `textLength` AND its centering `indent` (G3/O1, same "measure
   *  once, reuse" precedent as headerRows' stereoWidth/nameWidth). Rounding
   *  happens once, at SVG emission (`core/svg.ts#attrs`, ADR-1) — not here,
   *  which would double-round (`svg.ts`'s own module doc comment). */
  rawKeyWidth: number;
  /** Raw (unpadded) value text width, unrounded, `0` (unused) for a Point
   *  row -- jar never draws Point-row value text at all. */
  rawValueWidth: number;
  /** M3(a): the key cell's `CreoleMode.FULL` lines. */
  keyLines: readonly MapCellLine[];
  /** M3(a): the value cell's lines — `undefined` for a Point row, the ONLY
   *  case `TextBlockMap#drawU` never draws a value cell for. */
  valueLines?: readonly MapCellLine[];
}

/** One drawn line of a cell: a `Fission` stripe when `MaximumWidth` wraps, else the cell's single line. */
interface MapCellLine {
  atoms: readonly MemberRenderAtom[];
  width: number;
  height: number;
}

/** A built cell: its widest line's raw width, its margined block, and its lines. */
interface MapCell {
  raw: number;
  dim: Dim;
  lines: readonly MapCellLine[];
}

/**
 * M3(a): a cell's `TextBlockMap#getTextBlock` build. Upstream runs EVERY
 * non-`Point` cell — key and value alike — through
 * `Display.getWithNewlines(pragma, key).create0(fontConfiguration, LEFT,
 * skinParam, wordWrap, CreoleMode.FULL, null, null)`
 * (`cucadiagram/TextBlockMap.java:176-178`), so `__…__` becomes a real
 * `text-decoration="underline"` run over the STRIPPED label and
 * `<font:…>text</font>` becomes a `font-family` run — not the literal
 * markup this port used to measure and draw. `CreoleMode.FULL` (not the
 * `SIMPLE_LINE` an object member row uses, `class-object-member-creole.ts`)
 * is what registers the underline command at all
 * (`CommandCreoleBuilder.java:85-86`), which is the whole difference:
 * `buildMemberAtoms` already defaults to FULL.
 *
 * An EMPTY cell is not a special case here — `StripeSimple#getAtoms`'s own
 * empty-stripe fallback (`StripeSimple.java:125-126`) yields one `" "`
 * atom, which is exactly the `<text> </text>` the jar draws for `key => `
 * (fusopu-05-loxo960) and for satuco-50-vusa163's empty KEY.
 */
function measureMapCell(text: string, ctx: JsonCellContext): MapCell {
  const lines = mapCellLines(text, ctx);
  const raw = Math.max(...lines.map((line) => line.width));
  const height = lines.reduce((sum, line) => sum + line.height, 0);
  return { raw, dim: { width: raw + MAP_CELL_MARGIN_X * 2, height: height + MAP_CELL_MARGIN_Y * 2 }, lines };
}

/**
 * `Display.getWithNewlines(pragma, key).create0(...)` (`TextBlockMap.java:176-178`): the cell splits on `\n` and
 * `%breakline()`, and `CreoleParser#createSheetSlow` (`CreoleParser.java:148-156`) takes a line opening `{{`, through its
 * `}}`, as one `EmbeddedDiagram` stripe; every other line is a `Fission` stripe.
 */
function mapCellLines(text: string, ctx: JsonCellContext): MapCellLine[] {
  const display = parseWithNewlines(Pragma.createEmpty(), text)!.lines;
  const out: MapCellLine[] = [];
  for (let i = 0; i < display.length; i++) {
    const line = display[i]!;
    const type = getEmbeddedType(line);
    if (type === null) {
      for (const atoms of splitJsonCell(buildMemberAtoms(line, ctx.font), ctx)) {
        const built = resolveMemberAtoms(atoms, ctx.font, ctx.measurer);
        out.push({ atoms: built.atoms, width: built.width, height: built.height });
      }
      continue;
    }
    const { block, consumed } = scanEmbeddedElementBlock(display, i);
    i += consumed - 1;
    out.push(embeddedCellLine(renderEmbed(wrapEmbeddedSource(type, block), getClassNestedDiagramRenderer())));
  }
  return out;
}

/** An `EmbeddedDiagram` stripe: the nested document's own size, `EmbeddedDiagram.java:129-133`. */
function embeddedCellLine(image: { width: number; height: number; href?: string }): MapCellLine {
  const { width, height, href } = image;
  return { atoms: href === undefined ? [] : [{ kind: 'image', href, width, height, exactSize: true }], width, height };
}

/** The drawn text of a built cell — the creole-STRIPPED label
 *  (`__method1__` -> `method1`), which is what `row.text` must carry so the
 *  renderer's "a Point row's value entry is the empty one" test stays
 *  exact. Never `''` for a real cell: `StripeSimple`'s empty-stripe
 *  fallback guarantees at least the `" "` atom (see {@link measureMapCell}),
 *  and the `?? ' '` only covers an image-only cell, which would otherwise
 *  be mistaken for a Point. */
function cellText(atoms: readonly MemberRenderAtom[]): string {
  const joined = atoms.map((a) => (a.kind === 'text' ? a.text : '')).join('');
  return joined === '' ? ' ' : joined;
}

/** One TextBlockMap row: getHeightOfRow = max(key, value) cell height; each
 *  cell (key always, value only for a non-point row) gets the 5,2 margin;
 *  a point row's value cell is the 7x7 Point diameter instead. */
function measureMapRow(row: MapRow, ctx: JsonCellContext): MapRowMetrics {
  // `TextBlockMap`'s CONSTRUCTOR strips a leading visibility character from
  // the KEY (and only the key) before `getTextBlock` ever sees it —
  // `if (VisibilityModifier.isVisibilityCharacter(key)) key = key.substring(1)`
  // (`cucadiagram/TextBlockMap.java:82-83`), the same `keys.add(key)` the
  // port band ids already go through (`class-map-port-rows.ts#mapPortName`).
  // Jar: vimavu-26-civo110 / guzojo-14-muxa584 draw `+__method1__` as an
  // underlined `method1`, with no `+` glyph and 8.225px less key width.
  const key = measureMapCell(mapPortName(row.key), ctx);
  const shared = { keyWidth: key.dim.width, rawKeyWidth: key.raw, keyLines: key.lines };
  if (row.value === MAP_POINT_SENTINEL)
    return {
      ...shared,
      valueWidth: MAP_POINT_DIAMETER,
      height: Math.max(key.dim.height, MAP_POINT_DIAMETER),
      isPoint: true,
      rawValueWidth: 0,
    };
  const value = measureMapCell(row.value, ctx);
  return {
    ...shared,
    valueWidth: value.dim.width,
    height: Math.max(key.dim.height, value.dim.height),
    isPoint: false,
    rawValueWidth: value.raw,
    valueLines: value.lines,
  };
}

/** The column widths + baseline every row in a table shares — bundled into
 *  one param object (rather than 4 positional numbers) to keep both
 *  {@link buildMapRowGeo} and {@link buildOneMapRow} under the repo's
 *  5-parameter cap. */
interface MapRowGeoContext {
  colAWidth: number;
  boxWidth: number;
  baselineOffset: number;
  /** The cell font's size less {@link baselineOffset}. */
  descent: number;
  /** `style.getHorizontalAlignment()`, centre by `plantuml.skin`'s `map` when no style moved it. */
  alignment: string | undefined;
}

/** `HorizontalAlignment#getPosition` (`HorizontalAlignment.java:92-98`). */
function keyPosition(alignment: string | undefined, width: number, total: number): number {
  if (alignment === 'left') return 0;
  if (alignment === 'right') return total - width;
  return (total - width) / 2;
}

/**
 * One row's key + value rows[] entries. `TextBlockMap#drawU` positions the
 * KEY via `style.getHorizontalAlignment().getPosition(keyWidth, ...)`
 * (`plantuml.skin`'s `map { HorizontalAlignment center }` —
 * `klimt/geom/HorizontalAlignment#getPosition`'s CENTER branch, `(fullWidth
 * - width) / 2`) against `widthColA` for a PLAIN row but against the
 * classifier's FULL final `boxWidth` for a POINT row (`if (value instanceof
 * Point) ... getPosition(keyWidth, trueWidth)` — jar-verified:
 * diveje-52-xefe514's Point row "UK" centers at `(151.425 - 19.5125) / 2 =
 * 65.95625`, NOT `(67.4875 - 19.5125) / 2` (colA-relative), because a Point
 * row has no value column to share the row with). The VALUE (non-Point
 * only) is drawn FLUSH-LEFT at a fixed `widthColA + MAP_CELL_MARGIN_X`
 * offset — `value.drawU(ug.apply(UTranslate.dx(widthColA)))`, and the value
 * TextBlock's OWN text is itself left-margined (`HorizontalAlignment.LEFT`,
 * `TextBlockMap#getTextBlock`), never centered/stretched against
 * `widthColB` — jar-verified: bepafe-03-teda035's "London"/"Washington"/
 * "Berlin" all share the SAME x despite different widths. Both key and
 * value share the SAME row baseline (`rowTop + MAP_CELL_MARGIN_Y +
 * baselineOffset`, the pre-O1 code used `rowTop + height/2`, correct only
 * for a zero-descent font). Pre-O1, indent used a flat `MAP_CELL_MARGIN_X`
 * for every key (never centered) and set no `width` on either cell (no
 * textLength).
 */
function buildOneMapRow(m: MapRowMetrics, rowTop: number, ctx: MapRowGeoContext): ClassifierGeo['rows'] {
  const firstY = rowTop + MAP_CELL_MARGIN_Y + ctx.baselineOffset;
  const keyCenterAgainst = m.isPoint ? ctx.boxWidth : ctx.colAWidth;
  // `horizontalAlignment.getPosition(keyWidth, trueWidth or widthColA)` (`TextBlockMap.java:141-147`), the cell's own
  // margin included in `keyWidth`.
  const keyIndent = keyPosition(ctx.alignment, m.keyWidth, keyCenterAgainst) + MAP_CELL_MARGIN_X;
  const valueIndent = ctx.colAWidth + MAP_CELL_MARGIN_X;
  const placeLines = (lines: readonly MapCellLine[], indent: number): ClassifierGeo['rows'] => {
    let lineTop = rowTop + MAP_CELL_MARGIN_Y;
    return lines.map((line) => {
      // An image atom is bottom-aligned to the row it draws on (`renderer-classifier-rows.ts#renderRowAtoms`).
      const hasImage = line.atoms.some((a) => a.kind === 'image');
      const y = lineTop + (hasImage ? line.height - ctx.descent : ctx.baselineOffset);
      lineTop += line.height;
      return { text: cellText(line.atoms), y, sortY: firstY, indent, width: line.width, atoms: line.atoms };
    });
  };
  const key = placeLines(m.keyLines, keyIndent);
  if (m.valueLines === undefined) return [...key, { text: '', y: firstY, indent: valueIndent, mapValueCell: true }];
  const [first, ...rest] = placeLines(m.valueLines, valueIndent);
  return [...key, { ...first!, mapValueCell: true }, ...rest];
}

/**
 * Build the per-row rendering rows[] + dividerYs[] for the map's data rows.
 *
 * Every row contributes exactly TWO rows[] entries (key, value) so the
 * renderer can reconstruct row/column geometry from rows[] + dividerYs alone
 * (no ClassifierGeo schema change needed — layout.ts is at the project's
 * 500-line cap). A point row's "value" entry carries empty text: the
 * renderer skips drawing it (TextBlockMap#drawU never calls `value.drawU`
 * for a Point cell — only the key, left-aligned same as any other row) and
 * skips that row's vertical column divider. Per-row geometry (key/value
 * centering + baseline) lives in {@link buildOneMapRow}'s own doc comment.
 */
function buildMapRowGeo(
  metrics: readonly MapRowMetrics[],
  titleHeight: number,
  ctx: MapRowGeoContext,
): { rows: ClassifierGeo['rows']; dividerYs: number[] } {
  const outRows: ClassifierGeo['rows'] = [];
  const dividerYs: number[] = [];
  let y = titleHeight;
  for (let i = 0; i < metrics.length; i++) {
    dividerYs.push(y);
    outRows.push(...buildOneMapRow(metrics[i]!, y, ctx));
    y += metrics[i]!.height;
  }
  return { rows: outRows, dividerYs };
}

/**
 * Measure a `map` leaf (EntityImageMap#calculateDimensionSlow +
 * TextBlockMap#calculateDimensionSlow). Unlike object, `showFields` is
 * irrelevant here — `BodierMap#getBody` ignores its showFields parameter
 * entirely and always returns the full row table (`hide members` / `hide
 * empty members` have no effect on a map's body, matching upstream).
 */
export function measureMapClassifier(
  classifier: Classifier,
  theme: Theme,
  measurer: StringMeasurer,
): MeasuredClassifier {
  const tags = resolveStyleStereotypeTags(classifier);
  const bodyFont = resolveObjectBodyFont(theme, 'map', tags, classifier.objectStyle);
  const fontSpec = { family: bodyFont.family, size: bodyFont.size };
  const nameFont = resolveHeaderFontOverride(theme, 'map', tags, classifier.objectStyle);
  const nameBlock = measureNameBlock(classifier.display, headerFontSpec(theme, nameFont), measurer);
  const nameDim: Dim = {
    width: nameBlock.width + MAP_NAME_MARGIN * 2,
    height: nameBlock.height + MAP_NAME_MARGIN * 2,
  };
  const stereoDim = measureStereo(classifier, theme, measurer);
  const title = titleDimension(nameDim, stereoDim);

  const rows = classifier.rows ?? [];
  // M3(a): every cell is a creole line upstream, so the base
  // `FontConfiguration` (not the bare `FontSpec` the header still uses) is
  // what `TextBlockMap#getTextBlock` hands `create0`. No `{abstract}`/
  // `{static}` modifiers exist on a map row, hence the empty member.
  // `BodierMap#getBody` hands `style.wrapWidth()` to every cell (`BodierMap.java:104`, `TextBlockMap.java:176-178`).
  const cellCtx = {
    font: memberBaseFont(bodyFont, {}),
    measurer,
    maxWidth: classifier.objectStyle?.box.maximumWidth ?? resolveElementMaximumWidth(theme, 'map') ?? 0,
  };
  const metrics = rows.map((r) => measureMapRow(r, cellCtx));
  const colA = metrics.length === 0 ? 0 : Math.max(...metrics.map((m) => m.keyWidth));
  const colB = metrics.length === 0 ? 0 : Math.max(...metrics.map((m) => m.valueWidth));
  const fieldsHeight = metrics.reduce((sum, m) => sum + m.height, 0);

  // B25/M27: `EntityImageMap.java:127-130` clamps here, identically to
  // object/json/class -- see `floorAtMinimumWidth`'s own doc comment.
  const width = floorAtMinimumWidth(
    Math.max(colA + colB, title.width + MAP_X_MARGIN_CIRCLE * 2),
    theme,
    'map',
    classifier.objectStyle?.box.minimumWidth,
  );
  // getMethodOrFieldHeight's empty-substitution never fires for MAP
  // (leafType === MAP is excluded in the upstream condition) — height is
  // titleHeight + the raw (possibly zero, for an empty map body) fields height.
  const height = title.height + fieldsHeight;

  const headerGeo = headerRows(classifier, theme, measurer, {
    nameFont,
    boxWidth: width,
    namePadding: MAP_NAME_MARGIN,
  });
  const baselineOffset = baselineOffsetFor(fontSpec, measurer);
  const { rows: rowGeo, dividerYs } = buildMapRowGeo(metrics, title.height, {
    colAWidth: colA,
    boxWidth: width,
    baselineOffset,
    descent: bodyFont.size - baselineOffset,
    alignment: classifier.objectStyle?.box.horizontalAlignment,
  });

  // `TextBlockMap#drawU`'s loop is what reaches `x + w` (`ULine.hline(trueWidth)`, `LimitFinder.java:179-182`). No row
  // draws no line, and the name stops `xMarginCircle` short (`EntityImageMap.java:128`), so an empty map's right ink is
  // its `URectangle`, `x + w - 1` (`LimitFinder.java:184-188`). Its bottom stays `y + h`: the name's `TextBlockMarged`
  // draws a `UEmpty` at the title's full height (`EntityImageMap.java:96-97`, `TextBlockMarged.java:79-86`).
  return {
    width,
    height,
    rows: [...headerGeo, ...rowGeo],
    dividerYs,
    bodyInkWidth: rows.length === 0 ? 0 : width,
    titleHeight: title.height,
    ...stereoInkField(classifier, theme, measurer),
    ...nameRowCountFields(headerGeo.length, nameBlock.lines.length),
  };
}
