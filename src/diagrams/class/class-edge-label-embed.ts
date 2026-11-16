/**
 * A class edge label that holds a `{{ }}` block: the embedded diagram is one image atom stacked with the label's
 * other lines.
 *
 * Upstream builds a link label through `Display#create0` -> `CreoleParser#createSheet`, whose loop hands a line that
 * opens an embed (`EmbeddedDiagram.getEmbeddedType`) and the iterator to `EmbeddedDiagram.createAndSkip`, and makes the
 * resulting atom its own stripe (`CreoleParser.java:150-170`). `SheetBlock1` stacks the stripes (`SheetBlock1.java
 * :104-130`) and shifts each narrower one by `(widest - own) / coef`, coef 2 for the sheet's CENTER (`:132-146,
 * 158-171`). Reuses `class-body-enhanced-embeds.ts`'s scan and nested render (`MethodsOrFieldsArea`'s embed loop) rather
 * than a second copy.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/CreoleParser.java:136-170
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/EmbeddedDiagram.java:97-114
 */
import { getEmbeddedType } from '../../core/EmbeddedDiagram.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import { renderEmbed, wrapEmbeddedSource } from './class-body-enhanced-embeds.js';
import { scanEmbeddedElementBlock } from './class-embedded-block.js';
import { rowFlags, rowOffset, wrappedLabelRows } from './class-edge-label-lines.js';
import { getClassNestedDiagramRenderer } from './class-nested-diagram-renderer.js';

/** One run of a label's display lines: plain text lines, or one embed's wrapped `@start...@end...` source. */
export type EmbedLabelSegment =
  | { readonly kind: 'text'; readonly lines: readonly string[] }
  | { readonly kind: 'embed'; readonly source: readonly string[] };

/**
 * `createSheetSlow`'s walk over the display lines (`CreoleParser.java:136-170`): a line opening an embed starts a
 * `createAndSkip` that consumes through its closer. `undefined` when no line opens one (the label stays text).
 */
export function splitEmbedLabelLines(lines: readonly string[]): readonly EmbedLabelSegment[] | undefined {
  const segments: EmbedLabelSegment[] = [];
  let text: string[] = [];
  let found = false;
  let i = 0;
  while (i < lines.length) {
    const type = getEmbeddedType(lines[i]!);
    if (type === null) {
      text.push(lines[i]!);
      i++;
      continue;
    }
    found = true;
    if (text.length > 0) segments.push({ kind: 'text', lines: text });
    text = [];
    const { block, consumed } = scanEmbeddedElementBlock(lines, i);
    segments.push({ kind: 'embed', source: wrapEmbeddedSource(type, block) });
    i += consumed;
  }
  if (!found) return undefined;
  if (text.length > 0) segments.push({ kind: 'text', lines: text });
  return segments;
}

type WrappedRows = ReturnType<typeof wrappedLabelRows>;

/** One stripe run, positioned from the block's top. */
export type EmbedLabelItem =
  | { readonly kind: 'text'; readonly rows: WrappedRows; readonly y: number }
  | {
      readonly kind: 'image';
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly href?: string | undefined;
    };

export interface EmbedLabelLayout {
  readonly width: number;
  readonly height: number;
  readonly lineHeight: number;
  readonly items: readonly EmbedLabelItem[];
}

/** {@link layoutEmbedLabel}'s inputs. */
export interface EmbedLabelOptions {
  readonly font: FontSpec;
  readonly measurer: StringMeasurer;
  /** The label wrap width (`SvekEdge.java:290-294`); absent/0 = no wrap. */
  readonly maxWidth?: number | undefined;
}

/**
 * `SheetBlock1#initMap`'s vertical stack: each text row is `lineHeight` high (the label's font line), each embed the
 * nested render's own size (`EmbeddedDiagram#calculateDimension`). The block is as wide as its widest stripe.
 */
export function layoutEmbedLabel(segments: readonly EmbedLabelSegment[], opts: EmbedLabelOptions): EmbedLabelLayout {
  const { font, measurer } = opts;
  const renderer = getClassNestedDiagramRenderer();
  const firstText = segments.find((s) => s.kind === 'text');
  const probe =
    firstText === undefined
      ? ''
      : (wrappedLabelRows(firstText.lines, font, opts.maxWidth ?? 0, measurer)[0]?.atoms.join('') ?? '');
  const lineHeight = measurer.measure(probe, font).height;
  const items: EmbedLabelItem[] = [];
  let y = 0;
  let width = 0;
  for (const segment of segments) {
    if (segment.kind === 'text') {
      const rows = wrappedLabelRows(segment.lines, font, opts.maxWidth ?? 0, measurer);
      items.push({ kind: 'text', rows, y });
      y += rows.length * lineHeight;
      for (const row of rows) width = Math.max(width, row.width);
    } else {
      const image = renderEmbed(segment.source, renderer);
      items.push({ kind: 'image', y, width: image.width, height: image.height, href: image.href });
      y += image.height;
      width = Math.max(width, image.width);
    }
  }
  return { width, height: y, lineHeight, items };
}

/** What {@link placeEmbedLabel} draws, in draw order (`before` = the text anchors that precede an image). */
export interface PlacedEmbedLabel {
  readonly lines: Array<{ text: string; x: number; y: number; width: number; bold?: boolean; italic?: boolean }>;
  readonly embeds: Array<{ x: number; y: number; width: number; height: number; href: string; before: number }>;
}

/**
 * Anchors for a laid-out embed label centred on `center`: the block's left is `center.x - floor(width) / 2` and its top
 * `center.y - height / 2`, as `multiLineLabelAnchor` places a text block; a narrower stripe is shifted by
 * `(width - own) / 2` for CENTER (`SheetBlock1.java:132-146`). An image whose render failed is reserved but not drawn
 * (`EmbeddedDiagram.java:148-152,191-193`).
 */
export function placeEmbedLabel(
  layout: EmbedLabelLayout,
  align: 'center' | 'left' | 'right',
  center: { x: number; y: number },
  opts: EmbedLabelOptions,
): PlacedEmbedLabel {
  const { font, measurer } = opts;
  const left = center.x - Math.floor(layout.width) / 2;
  const top = center.y - layout.height / 2;
  // `multiLineLabelAnchor`'s one baseline: `size - descent` of the label's first line.
  const firstText = layout.items.find((item) => item.kind === 'text');
  const baseline = font.size - measurer.getDescent(font, firstText?.rows[0]?.atoms.join('') ?? '');
  const lines: PlacedEmbedLabel['lines'] = [];
  const embeds: PlacedEmbedLabel['embeds'] = [];
  for (const item of layout.items) {
    if (item.kind === 'image') {
      if (item.href === undefined) continue;
      const x = left + rowOffset(align, layout.width, item.width);
      embeds.push({
        x,
        y: top + item.y,
        width: item.width,
        height: item.height,
        href: item.href,
        before: lines.length,
      });
      continue;
    }
    item.rows.forEach((row, r) => {
      let x = left + rowOffset(align, layout.width, row.width);
      row.atoms.forEach((text, i) => {
        const width = row.widths[i]!;
        lines.push({ text, x, y: top + item.y + r * layout.lineHeight + baseline, width, ...rowFlags(row) });
        x += width;
      });
    });
  }
  return { lines, embeds };
}
