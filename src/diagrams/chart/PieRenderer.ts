/**
 * PieRenderer — a pie (or a donut). The slices go clockwise from 12 o'clock in
 * the order of the values; their names are written around the pie, or in the
 * legend when there is one; `labels` and `percent` write each slice's value and
 * share inside it (e8ef39dd55c).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/PieRenderer.java
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import { ChartLegendBlock } from './ChartLegendBlock.js';
import { LegendPosition } from './chart-modes.js';
import type { SkinParam } from './chart-skin-param.js';
import {
  asNullable,
  back,
  displayBlock,
  fore,
  getDefaultColor,
  getPieStyleSignature,
  lineColorOf,
  lineThicknessOf,
  stereotypedStyle,
  type StyleFontConfiguration,
} from './ChartStyles.js';
import type { PieChart, Slice as PieSlice } from './PieChart.js';

/** @see PieRenderer.java:63 */
export const POLAR_RADIUS = 140;
/** @see PieRenderer.java:64 */
export const POLAR_MARGIN = 20;
/** @see PieRenderer.java:65 */
const NAME_GAP = 10;
/** @see PieRenderer.java:66 */
export const POLAR_LEGEND_MARGIN = 20;
/** A label's distance from the centre, as a share of the radius, in a plain pie. @see PieRenderer.java:290 */
const LABEL_RADIUS_RATIO = 0.65;
/** A whole turn, less this, is not a whole slice. @see PieRenderer.java:258 */
const WHOLE_TOLERANCE = 1e-9;

/** A slice with its colour and angles. @see PieRenderer.java:77-92 */
interface Slice {
  readonly source: PieSlice;
  readonly name: string | undefined;
  readonly color: HColor;
  start: number;
  end: number;
}

function middle(slice: Slice): number {
  return (slice.start + slice.end) / 2;
}

/** The point at `r` from the centre, `angle` clockwise from 12 o'clock. @see PieRenderer.java:117-119 */
export function polar(r: number, angle: number): XPoint2D {
  return new XPoint2D(r * Math.sin(angle), -r * Math.cos(angle));
}

/**
 * Where a text of the given size goes next to the point at `r` and `angle`, on
 * the far side of that point.
 * @see PieRenderer.java:145-150
 */
export function outside(r: number, angle: number, dim: XDimension2D): UTranslate {
  const anchor = polar(r, angle);
  const left = anchor.x - (dim.getWidth() / 2) * (1 - Math.sin(angle));
  const top = anchor.y - (dim.getHeight() / 2) * (1 + Math.cos(angle));
  return new UTranslate(left, top);
}

/** `{ minX, minY, maxX, maxY }` around the centre. */
export type Bounds = [number, number, number, number];

/** Grows `bounds` to hold a text of `dim` at `pos`. @see PieRenderer.java:162-165 */
export function include(bounds: Bounds, pos: UTranslate, dim: XDimension2D): void {
  bounds[0] = Math.min(bounds[0], pos.getDx());
  bounds[1] = Math.min(bounds[1], pos.getDy());
  bounds[2] = Math.max(bounds[2], pos.getDx() + dim.getWidth());
  bounds[3] = Math.max(bounds[3], pos.getDy() + dim.getHeight());
}

/**
 * The chart's size: its box plus the legend on one side. The same body in
 * `PieRenderer` and `RadarRenderer`.
 * @see PieRenderer.java:170-185
 */
export function polarDimension(
  bounds: Bounds,
  legend: XDimension2D | undefined,
  position: LegendPosition,
): XDimension2D {
  let width = bounds[2] - bounds[0] + 2 * POLAR_MARGIN;
  let height = bounds[3] - bounds[1] + 2 * POLAR_MARGIN;
  if (legend !== undefined) {
    if (position === LegendPosition.LEFT || position === LegendPosition.RIGHT) {
      width += legend.getWidth() + POLAR_LEGEND_MARGIN;
      height = Math.max(height, legend.getHeight() + 2 * POLAR_MARGIN);
    } else {
      height += legend.getHeight() + POLAR_LEGEND_MARGIN;
      width = Math.max(width, legend.getWidth() + 2 * POLAR_MARGIN);
    }
  }
  return new XDimension2D(width, height);
}

/**
 * Draws the legend on its side and answers the graphic at the chart's centre.
 * The same body in `PieRenderer#drawU` and `RadarRenderer#drawU`.
 * @see PieRenderer.java:187-231
 */
export function drawPolarFrame(
  ug: UGraphic,
  layout: { bounds: Bounds; dim: XDimension2D; position: LegendPosition },
  legend: ChartLegendBlock | undefined,
): UGraphic {
  const { bounds, dim, position } = layout;
  const boxWidth = bounds[2] - bounds[0] + 2 * POLAR_MARGIN;
  const boxHeight = bounds[3] - bounds[1] + 2 * POLAR_MARGIN;
  let boxX = (dim.getWidth() - boxWidth) / 2;
  let boxY = (dim.getHeight() - boxHeight) / 2;
  if (legend !== undefined) {
    const legendDim = legend.calculateDimension(ug.getStringBounder());
    const centredY = (dim.getHeight() - legendDim.getHeight()) / 2;
    const centredX = (dim.getWidth() - legendDim.getWidth()) / 2;
    let at: UTranslate;
    if (position === LegendPosition.LEFT) {
      boxX = legendDim.getWidth() + POLAR_LEGEND_MARGIN;
      at = new UTranslate(POLAR_MARGIN, centredY);
    } else if (position === LegendPosition.RIGHT) {
      boxX = 0;
      at = new UTranslate(boxWidth - POLAR_MARGIN + POLAR_LEGEND_MARGIN, centredY);
    } else if (position === LegendPosition.TOP) {
      boxY = legendDim.getHeight() + POLAR_LEGEND_MARGIN;
      at = new UTranslate(centredX, POLAR_MARGIN);
    } else {
      boxY = 0;
      at = new UTranslate(centredX, boxHeight - POLAR_MARGIN + POLAR_LEGEND_MARGIN);
    }
    legend.drawU(ug.apply(at));
  }
  return ug.apply(new UTranslate(boxX + POLAR_MARGIN - bounds[0], boxY + POLAR_MARGIN - bounds[1]));
}

export class PieRenderer {
  private readonly series;
  private readonly legendPosition: LegendPosition;
  private readonly style: Style;
  private readonly fontConfig: StyleFontConfiguration;
  private readonly slices: Slice[] = [];

  /** @see PieRenderer.java:94-114 */
  constructor(
    private readonly skinParam: SkinParam,
    private readonly pie: PieChart,
  ) {
    this.series = pie.getSeries();
    this.legendPosition = pie.getLegendPosition();
    this.style = stereotypedStyle(getPieStyleSignature(), this.series, skinParam);
    this.fontConfig = this.style.getFontConfiguration(skinParam.getIHtmlColorSet());
    for (const source of pie.getSlices()) {
      const color = this.series.getItemColor(source.index) ?? getDefaultColor(source.index, skinParam);
      this.slices.push({ source, name: source.name, color, start: 0, end: 0 });
    }
    let angle = 0;
    for (const slice of this.slices) {
      slice.start = angle;
      angle += (2 * Math.PI * slice.source.value) / pie.getTotal();
      slice.end = angle;
    }
  }

  /** @see PieRenderer.java:121-123 */
  private hasLegend(): boolean {
    return this.legendPosition !== LegendPosition.NONE;
  }

  /** @see PieRenderer.java:125-131 */
  private getLegend(): ChartLegendBlock {
    const legend = new ChartLegendBlock(this.skinParam, this.legendPosition);
    for (const slice of this.slices) if (slice.name !== undefined) legend.add(slice.name, slice.color);
    return legend;
  }

  /** @see PieRenderer.java:133-136 */
  private text(s: string): TextBlock {
    return displayBlock(this.skinParam, s, this.fontConfig, HorizontalAlignment.CENTER);
  }

  /** Outside the pie, away from it in the direction of the slice's middle. @see PieRenderer.java:138-142 */
  private namePosition(slice: Slice, dim: XDimension2D): UTranslate {
    return outside(POLAR_RADIUS + NAME_GAP, middle(slice), dim);
  }

  /** The box around the pie and the names around it. @see PieRenderer.java:152-168 */
  private getBounds(stringBounder: StringBounder): Bounds {
    const bounds: Bounds = [-POLAR_RADIUS, -POLAR_RADIUS, POLAR_RADIUS, POLAR_RADIUS];
    if (this.hasLegend()) return bounds;
    for (const slice of this.slices) {
      if (slice.name === undefined) continue;
      const dim = this.text(slice.name).calculateDimension(stringBounder);
      include(bounds, this.namePosition(slice, dim), dim);
    }
    return bounds;
  }

  /** @see PieRenderer.java:170-185 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const legend = this.hasLegend() ? this.getLegend().calculateDimension(stringBounder) : undefined;
    return polarDimension(this.getBounds(stringBounder), legend, this.legendPosition);
  }

  /** @see PieRenderer.java:187-241 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const layout = {
      bounds: this.getBounds(stringBounder),
      dim: this.calculateDimension(stringBounder),
      position: this.legendPosition,
    };
    const ugCenter = drawPolarFrame(ug, layout, this.hasLegend() ? this.getLegend() : undefined);
    this.drawSlices(ugCenter);
    this.drawLabels(ugCenter);
    if (this.hasLegend()) return;
    for (const slice of this.slices) {
      if (slice.name === undefined) continue;
      const text = this.text(slice.name);
      text.drawU(ugCenter.apply(this.namePosition(slice, text.calculateDimension(stringBounder))));
    }
  }

  /** @see PieRenderer.java:243-252 */
  private drawSlices(ug: UGraphic): void {
    const lineColor = asNullable(lineColorOf(this.style, this.skinParam));
    const thickness = lineThicknessOf(this.style);
    const inner = POLAR_RADIUS * this.series.getDonutHole();
    for (const slice of this.slices)
      ug.apply(back(slice.color))
        .apply(fore(lineColor ?? slice.color))
        .apply(UStroke.withThickness(thickness))
        .draw(slicePath(slice.start, slice.end, inner));
  }

  /** @see PieRenderer.java:286-298 */
  private drawLabels(ug: UGraphic): void {
    if (!this.series.isShowLabels() && !this.series.isShowPercent()) return;
    const hole = this.series.getDonutHole();
    const r = hole > 0 ? (POLAR_RADIUS * (1 + hole)) / 2 : POLAR_RADIUS * LABEL_RADIUS_RATIO;
    for (const slice of this.slices) {
      const text = this.text(this.pie.getLabel(slice.source)!);
      const dim = text.calculateDimension(ug.getStringBounder());
      const center = this.slices.length === 1 && hole === 0 ? new XPoint2D(0, 0) : polar(r, middle(slice));
      text.drawU(ug.apply(new UTranslate(center.x - dim.getWidth() / 2, center.y - dim.getHeight() / 2)));
    }
  }
}

/**
 * Along the outer circle, then back along a donut's inner one, or to the centre.
 * Arcs are split at most a half turn, so a whole-turn slice is drawn too.
 * @see PieRenderer.java:257-273
 */
function slicePath(start: number, end: number, inner: number): UPath {
  const path = UPath.none();
  const first = polar(POLAR_RADIUS, start);
  path.moveTo(first);
  addArc(path, POLAR_RADIUS, [start, end], true);
  const whole = end - start > 2 * Math.PI - WHOLE_TOLERANCE;
  if (inner > 0) {
    path.lineTo(polar(inner, end));
    addArc(path, inner, [end, start], false);
  } else if (!whole) {
    path.lineTo(0, 0);
  }
  path.lineTo(first);
  return path;
}

/** @see PieRenderer.java:275-281 */
function addArc(path: UPath, r: number, [from, to]: readonly [number, number], clockwise: boolean): void {
  const count = Math.ceil(Math.abs(to - from) / Math.PI - WHOLE_TOLERANCE);
  for (let i = 1; i <= count; i++) {
    const pt = polar(r, from + ((to - from) * i) / count);
    path.arcTo(r, r, 0, 0, clockwise ? 1 : 0, pt.x, pt.y);
  }
}
