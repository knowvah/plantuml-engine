/**
 * stdd T5a: a `json Name { ... }` leaf's drawn grid, measured where the measurer is (layout) --
 * `TextBlockCucaJSon` (`TextBlockCucaJSon.java:163-224`) at `dy(dimTitle.getHeight())` under the name
 * (`EntityImageJson.java:203-208`): a vertical rule at `width1`, a horizontal rule over the total width
 * before every member, the key cell and the value cell (`TextBlockUtils.withMargin(result, 5, 2)`,
 * `:185`), each member stacked by `max(dim1.height, dim2.height)`; an array stacks its items with a rule
 * between (`:214-224`). Positions are relative to the leaf's top-left; `renderer-json.ts` emits them.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cucadiagram/TextBlockCucaJSon.java:163-224
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageJson.java:153-213
 */
import type { JsonNode } from '../../core/command/JsonNode.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import { JSON_CELL_MARGIN_X, JSON_CELL_MARGIN_Y, JSON_NAME_MARGIN } from '../../core/svek/image/EntityImageJson.js';
import { measureJsonCell, measureJsonNode, scalarText } from './state-json-sizing.js';

export interface JsonLeafText {
  readonly x: number;
  /** The baseline's offset from the cell top is the ascent: stored as the cell top here. */
  readonly top: number;
  readonly text: string;
  readonly width: number;
}

export interface JsonLeafRule {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface JsonLeafLayout {
  /** `dimTitle.getHeight()`: the name's height plus `JSON_NAME_MARGIN` twice. */
  readonly titleHeight: number;
  readonly nameWidth: number;
  readonly texts: readonly JsonLeafText[];
  readonly rules: readonly JsonLeafRule[];
}

interface Acc {
  readonly font: FontSpec;
  readonly measurer: StringMeasurer;
  readonly texts: JsonLeafText[];
  readonly rules: JsonLeafRule[];
}

function cell(acc: Acc, label: string, x: number, y: number): void {
  acc.texts.push({
    x: x + JSON_CELL_MARGIN_X,
    top: y + JSON_CELL_MARGIN_Y,
    text: label,
    width: acc.measurer.measure(label, acc.font).width,
  });
}

/** `TextBlockJson#drawU` / `TextBlockArray#drawU` / a scalar cell at `(x, y)` over `totalWidth`. */
function place(acc: Acc, node: JsonNode, x: number, y: number, totalWidth: number): void {
  if (node.kind === 'scalar') {
    cell(acc, scalarText(node), x, y);
    return;
  }
  if (node.kind === 'array') {
    let cy = y;
    node.items.forEach((item, i) => {
      if (i > 0) acc.rules.push({ x1: x, y1: cy, x2: x + totalWidth, y2: cy });
      place(acc, item, x, cy, totalWidth);
      cy += measureJsonNode(item, acc.font, acc.measurer).height;
    });
    return;
  }
  const dims = node.entries.map((e) => ({
    key: measureJsonCell(e.key, acc.font, acc.measurer),
    value: measureJsonNode(e.value, acc.font, acc.measurer),
  }));
  const width1 = dims.length === 0 ? 0 : Math.max(...dims.map((d) => d.key.width));
  const height = dims.reduce((sum, d) => sum + Math.max(d.key.height, d.value.height), 0);
  acc.rules.push({ x1: x + width1, y1: y, x2: x + width1, y2: y + height });
  let cy = y;
  node.entries.forEach((e, i) => {
    acc.rules.push({ x1: x, y1: cy, x2: x + totalWidth, y2: cy });
    cell(acc, e.key, x, cy);
    place(acc, e.value, x + width1, cy, totalWidth - width1);
    const d = dims[i]!;
    cy += Math.max(d.key.height, d.value.height);
  });
}

/** The leaf's grid for a box `width` wide, name and value as parsed. */
export function layoutJsonLeaf(
  display: string,
  value: JsonNode | undefined,
  width: number,
  font: FontSpec,
  measurer: StringMeasurer,
): JsonLeafLayout {
  const name = measurer.measure(display, font);
  const titleHeight = name.height + JSON_NAME_MARGIN * 2;
  const acc: Acc = { font, measurer, texts: [], rules: [] };
  if (value !== undefined) place(acc, value, 0, titleHeight, width);
  return { titleHeight, nameWidth: name.width, texts: acc.texts, rules: acc.rules };
}
