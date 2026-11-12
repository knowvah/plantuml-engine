/**
 * FlowDiagram — `@startflow`: each `CommandLineSimple` adds an
 * `ActivityBox` on a golem `TilesField`, each `CommandLink` adds a path, and
 * the diagram is its own `TextBlock`.
 *
 * Insertion order (flp D4): upstream's `tilesBoxes` is a
 * `HashMap<Tile, ActivityBox>` and `Tile` has no `hashCode`, so the jar
 * draws the boxes, and `getTileById` finds a duplicate id, in identity-hash
 * order, which changes per run (`bemixo-79-xulu250`: 6 renders, 6 SVGs, 1
 * multiset). A JS `Map` iterates in insertion order, one order the jar can
 * produce.
 *
 * Not ported (flp D1): `getInnerPosition` and `getMinMax(StringBounder)`,
 * which only throw `UnsupportedOperationException` and which the port's
 * `TextBlock` does not declare; `getMagneticBorder` (`MagneticBorderNone`,
 * the port's default) and `getBackcolor` (`null`; the export reads
 * `TitledDiagram#calculateBackColor`, UgDiagram.java:130).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagram.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { MinMaxGolem } from '../../core/golem/MinMaxGolem.js';
import type { Tile } from '../../core/golem/Tile.js';
import type { TileArea } from '../../core/golem/TileArea.js';
import { TileGeometry } from '../../core/golem/TileGeometry.js';
import { TilesField } from '../../core/golem/TilesField.js';
import { Back } from '../../core/klimt/Back.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { Fore } from '../../core/klimt/Fore.js';
import { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { UEllipse } from '../../core/klimt/shape/UEllipse.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { SkinParamFresh } from '../../core/skin/SkinParamFresh.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { ActivityBox } from './ActivityBox.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagram.java:73 */
const SINGLE_SIZE_X = 100;
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagram.java:74 */
const SINGLE_SIZE_Y = 35;
/** `UEllipse.build(7, 7)`. @see FlowDiagram.java:143 */
const ARROW_SIZE = 7;
/** The dot's `- 3` shift. @see FlowDiagram.java:151 */
const ARROW_SHIFT = 3;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/FlowDiagram.java:71 */
export class FlowDiagram extends TitledDiagram implements TextBlock {
  /** `null` until the first `lineSimple`. @see FlowDiagram.java:76 */
  private field: TilesField | undefined;
  /** A `HashMap` upstream; insertion-ordered here (flp D4). @see FlowDiagram.java:77 */
  private readonly tilesBoxes = new Map<Tile, ActivityBox>();
  /** @see FlowDiagram.java:78 */
  private lastTile: Tile | undefined;
  /** `TitledDiagram`'s `SkinParam` (no command here can reach it). */
  private readonly skinParam: SkinParamFresh;

  /** `classpath` is port-only (ADR-2). @see FlowDiagram.java:89-91 */
  constructor(
    source: UmlSource,
    preprocessing: PreprocessingArtifact,
    private readonly classpath?: SkinParamClasspath,
  ) {
    super(source, 'FLOW', undefined, preprocessing);
    this.skinParam = new SkinParamFresh(classpath);
  }

  /** `new DiagramDescription("Flow Diagram")`. @see FlowDiagram.java:85-87 */
  getDescription(): string {
    return '(Flow Diagram)';
  }

  getSkinParam(): SkinParamFresh {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()` (always false: no `skinparam` can run), else
   * `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /**
   * The first line is always the root: the orientation is ignored while
   * `field == null` (flp D8).
   * @see FlowDiagram.java:93-106
   */
  lineSimple(orientation: TileGeometry, idDest: string, label: string): void {
    let newTile: Tile;
    if (this.field === undefined) {
      this.field = new TilesField();
      this.tilesBoxes.clear();
      newTile = this.field.getRoot();
    } else {
      // `lastTile` is set by every earlier `lineSimple`.
      newTile = this.field.createTile(this.lastTile!, orientation);
    }
    const box = new ActivityBox(newTile, idDest, label, this.classpath);
    this.tilesBoxes.set(newTile, box);
    this.lastTile = newTile;
  }

  /**
   * A path from `lastTile`, which does not move (flp D8). A link before any
   * box misses in `getTileById` before `field` is read (`cov-link-first`).
   * @see FlowDiagram.java:108-111
   */
  linkSimple(orientation: TileGeometry, idDest: string): void {
    const tile = this.getTileById(idDest);
    // `getTileById` found a box, so `lineSimple` has built `field` and set `lastTile`.
    this.field!.addPath(this.lastTile!, tile, orientation);
  }

  /** The first box with the id in map order (flp D4). @see FlowDiagram.java:113-120 */
  private getTileById(id: string): Tile {
    for (const [tile, box] of this.tilesBoxes) {
      if (box.getId() === id) return tile;
    }
    throw new Error(`IllegalArgumentException: ${id}`);
  }

  /** The boxes in map order, for the tests. */
  getBoxes(): readonly ActivityBox[] {
    return [...this.tilesBoxes.values()];
  }

  /** The field, for the tests; `undefined` before the first box. */
  getField(): TilesField | undefined {
    return this.field;
  }

  /** @see FlowDiagram.java:122-154 */
  drawU(ugIn: UGraphic): void {
    let x = 0;
    let y = 0;
    const minMax = this.getMinMax();
    x -= minMax.getMinX() * SINGLE_SIZE_X;
    y -= minMax.getMinY() * SINGLE_SIZE_Y;
    const stringBounder = ugIn.getStringBounder();
    this.drawBoxes(ugIn, x, y, stringBounder);
    let ug = ugIn.apply(new Fore(HColors.MY_RED));
    ug = ug.apply(new Back(HColors.MY_RED));
    this.drawPaths(ug, x, y, stringBounder);
  }

  /** The box loop, in map order (flp D4), each box centred in its 200x70 cell (flp D8, D10). @see FlowDiagram.java:129-140 */
  private drawBoxes(ug: UGraphic, x: number, y: number, stringBounder: StringBounder): void {
    for (const [tile, box] of this.tilesBoxes) {
      const pos = this.field!.getPosition(tile);
      const xmin = pos.getXmin();
      const ymin = pos.getYmin();
      const dimBox = box.calculateDimension(stringBounder);
      const deltaX = SINGLE_SIZE_X * 2 - dimBox.getWidth();
      const deltaY = SINGLE_SIZE_Y * 2 - dimBox.getHeight();
      box.drawU(ug.apply(new UTranslate(x + xmin * SINGLE_SIZE_X + deltaX / 2, y + ymin * SINGLE_SIZE_Y + deltaY / 2)));
    }
  }

  /** The path loop: a line between the moved centres, and a 7x7 dot at `dest - 3` (flp D8, D10). @see FlowDiagram.java:143-153 */
  private drawPaths(ug: UGraphic, x: number, y: number, stringBounder: StringBounder): void {
    const arrow = UEllipse.build(ARROW_SIZE, ARROW_SIZE);
    for (const p of this.field!.getPaths()) {
      const start = p.getStart();
      const dest = p.getDest();
      const pStart = this.movePoint(this.getCenter(start), start.getTile(), start.getGeometry(), stringBounder);
      const pDest = this.movePoint(this.getCenter(dest), dest.getTile(), dest.getGeometry(), stringBounder);
      const line = new ULine(pDest.getX() - pStart.getX(), pDest.getY() - pStart.getY());
      ug.apply(new UTranslate(x + pStart.getX(), y + pStart.getY())).draw(line);
      ug.apply(new UTranslate(x + pDest.getX() - ARROW_SHIFT, y + pDest.getY() - ARROW_SHIFT)).draw(arrow);
    }
  }

  /** @see FlowDiagram.java:156-162 */
  private getCenter(area: TileArea): XPoint2D {
    const tile = area.getTile();
    const position = this.field!.getPosition(tile);
    const x = position.getCenterX();
    const y = position.getCenterY();
    return new XPoint2D(x * SINGLE_SIZE_X, y * SINGLE_SIZE_Y);
  }

  /**
   * Half the box size toward the side. `CENTER` throws, kept though no
   * command reaches it (flp D5).
   * @see FlowDiagram.java:164-187
   */
  private movePoint(pt: XPoint2D, tile: Tile, tileGeometry: TileGeometry, stringBounder: StringBounder): XPoint2D {
    // Every path end is a tile some `lineSimple` put a box on.
    const dim = this.tilesBoxes.get(tile)!.calculateDimension(stringBounder);
    const width = dim.getWidth();
    const height = dim.getHeight();
    let x = pt.getX();
    let y = pt.getY();
    switch (tileGeometry) {
      case TileGeometry.SOUTH:
        y += height / 2;
        break;
      case TileGeometry.NORTH:
        y -= height / 2;
        break;
      case TileGeometry.EAST:
        x += width / 2;
        break;
      case TileGeometry.WEST:
        x -= width / 2;
        break;
      default:
        throw new Error('IllegalStateException: a path ends on a tile side');
    }
    return new XPoint2D(x, y);
  }

  /** @see FlowDiagram.java:189-195 */
  private getMinMax(): MinMaxGolem {
    const minMax = new MinMaxGolem();
    for (const tile of this.tilesBoxes.keys()) minMax.managePosition(this.field!.getPosition(tile));
    return minMax;
  }

  /** @see FlowDiagram.java:197-200 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    const minMax = this.getMinMax();
    return new XDimension2D(minMax.getWidth() * SINGLE_SIZE_X, minMax.getHeight() * SINGLE_SIZE_Y);
  }

  /** @see FlowDiagram.java:206-209 */
  override getDefaultMargins(): ClockwiseTopRightBottomLeft {
    return ClockwiseTopRightBottomLeft.same(0);
  }

  /** The diagram is its own block. @see FlowDiagram.java:211-214 */
  getTextBlock(): TextBlock {
    return this;
  }
}
