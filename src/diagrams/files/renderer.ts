import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { TextBlockMemoized } from '../../core/klimt/shape/TextBlockMemoized.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { FEntry } from './ast.js';
import type { FilesIcons } from './files-icons.js';
import { BOX_MARGIN, CONNECTOR_GAP, FilesRow, INDENT, ROW_SPACING } from './files-row.js';
import type { SkinParam } from './files-skin-param.js';

/** One walk of the tree: measuring (no graphic) or drawing, and the widest right edge met. */
interface Pass {
  readonly ug: UGraphic | null;
  readonly stringBounder: StringBounder;
  maxWidth: number;
}

/**
 * `FilesListing` -- the text block of one `@startfiles` diagram: a row per entry of the tree, indented by folder,
 * with the connector lines from each folder to its children.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesListing.java:58-276
 */
export class FilesListing extends TextBlockMemoized {
  private readonly rows = new Map<FEntry, FilesRow>();

  /** @see FilesListing.java:76-80 */
  constructor(
    private readonly skinParam: SkinParam,
    private readonly root: FEntry,
    private readonly icons: FilesIcons,
  ) {
    super();
  }

  /** The unnamed root folder. */
  getRoot(): FEntry {
    return this.root;
  }

  /** @see FilesListing.java:82-87 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const pass: Pass = { ug: null, stringBounder, maxWidth: 0 };
    const height = this.walk(pass, this.root, -INDENT, 0);
    return new XDimension2D(pass.maxWidth + BOX_MARGIN, height);
  }

  /** @see FilesListing.java:89-92 */
  drawU(ug: UGraphic): void {
    this.walk({ ug, stringBounder: ug.getStringBounder(), maxWidth: 0 }, this.root, -INDENT, 0);
  }

  /**
   * Lays out (and draws, if the pass has a graphic) an entry and its descendants; answers the y position under the
   * last row.
   * @see FilesListing.java:94-130
   */
  private walk(pass: Pass, entry: FEntry, x: number, startOfEntry: number): number {
    let y = startOfEntry;
    let iconCenter = 0;
    if (!entry.isRoot()) {
      const row = this.getRow(entry);
      const dim = row.calculateDimension(pass.stringBounder);
      if (pass.ug !== null) row.drawU(pass.ug.apply(new UTranslate(x, y)));
      pass.maxWidth = Math.max(pass.maxWidth, x + dim.getWidth());
      iconCenter = x + row.getIconCenter(pass.stringBounder);
      y += dim.getHeight() + ROW_SPACING;
    }
    return this.walkChildren(pass, entry, x + INDENT, y, iconCenter);
  }

  /** The children of `entry`, each with its horizontal connector, and the vertical one that joins them. */
  private walkChildren(pass: Pass, entry: FEntry, childX: number, startY: number, iconCenter: number): number {
    const connected = pass.ug !== null && !entry.isRoot();
    let y = startY;
    let lastCenter = -1;
    const last = entry.getLastEntryChild();
    for (const child of entry) {
      const childHeight = this.getRow(child).calculateDimension(pass.stringBounder).getHeight();
      const center = y + childHeight / 2;
      if (!child.isNote() && connected) this.drawConnectorH(pass.ug, iconCenter, childX - CONNECTOR_GAP, center);
      if (child === last) lastCenter = center;
      y = this.walk(pass, child, childX, y);
    }
    if (lastCenter !== -1 && connected)
      this.drawConnector(
        pass.ug.apply(new UTranslate(iconCenter, startY - ROW_SPACING)),
        ULine.vline(lastCenter - startY + ROW_SPACING),
      );
    return y;
  }

  /** @see FilesListing.java:132-135 */
  private drawConnectorH(ug: UGraphic, x1: number, x2: number, y: number): void {
    if (x2 > x1) this.drawConnector(ug.apply(new UTranslate(x1, y)), ULine.hline(x2 - x1));
  }

  /** @see FilesListing.java:137-142 */
  private drawConnector(ug: UGraphic, line: ULine): void {
    const style = StyleSignatureBasic.of('root', 'element', 'filesDiagram').getMergedStyle(
      this.skinParam.getCurrentStyleBuilder(),
    ) as Style;
    if (style.getStroke().getThickness() <= 0) return;
    style.applyStrokeAndLineColor(ug, this.skinParam.getIHtmlColorSet()).draw(line);
  }

  /** @see FilesListing.java:144-151 */
  private getRow(entry: FEntry): FilesRow {
    let result = this.rows.get(entry);
    if (result === undefined) {
      result = new FilesRow(this.skinParam, this.icons, entry);
      this.rows.set(entry, result);
    }
    return result;
  }
}
