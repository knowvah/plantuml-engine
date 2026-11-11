/**
 * NServerDraw — one server in one grid cell: its box centred, the link up to
 * its main network with that link's address, and one link down to each
 * other network it joins, spaced `seven` apart.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NServerDraw.java
 */
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { MinMax } from '../../../core/klimt/geom/MinMax.js';
import { XDimension2D } from '../../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { Network } from '../core/Network.js';
import type { NServer } from '../core/NServer.js';
import { VerticalLine } from '../VerticalLine.js';
import { NETWORK_THIN } from './GridTextBlockDecorated.js';

/** `MathUtils.max` of three. */
function max3(a: number, b: number, c: number): number {
  return Math.max(a, Math.max(b, c));
}

/** The margin `getMinMax` adds round the box. @see NServerDraw.java:104 */
const MINMAX_MARGIN = 5;
/** The spacing of the links down to the other networks. @see NServerDraw.java:145 */
const SEVEN = 9.0;

/** @see NServerDraw.java:55 */
export class NServerDraw {
  /** @see NServerDraw.java:57 */
  static readonly MAGIC = 15;

  /** @see NServerDraw.java:59 */
  private readonly box: TextBlock;
  /** `server.getMainNetworkNext()` at construction. @see NServerDraw.java:60 */
  private readonly network: Network;
  /** @see NServerDraw.java:61 */
  private readonly server: NServer;
  /** @see NServerDraw.java:62 */
  private readonly conns: ReadonlyMap<Network, string>;
  /** @see NServerDraw.java:63 */
  private readonly networks: readonly Network[];
  /** @see NServerDraw.java:64 */
  private readonly topMargin: number;
  /** @see NServerDraw.java:85 */
  private readonly marginAd = 10;

  /** @see NServerDraw.java:71-79 */
  constructor(
    server: NServer,
    box: TextBlock,
    conns: ReadonlyMap<Network, string>,
    networks: readonly Network[],
    topMargin: number,
  ) {
    this.topMargin = topMargin;
    this.networks = networks;
    this.box = box;
    this.network = server.getMainNetworkNext();
    this.server = server;
    this.conns = conns;
  }

  /** Java prints the `LinkedHashMap`; debug output only. @see NServerDraw.java:66-69 */
  toString(): string {
    const entries = [...this.conns].map(([n, s]) => `${n.toString()}=${s}`).join(', ');
    return `${this.server.toString()} {${entries}}`;
  }

  /** @see NServerDraw.java:81-83 */
  isLinkedTo(some: Network): boolean {
    return this.conns.has(some);
  }

  /** @see NServerDraw.java:87-89 */
  private marginBoxW(): number {
    return 15;
  }

  /** @see NServerDraw.java:91-93 */
  private marginBoxH(): number {
    return this.topMargin;
  }

  /** The box centred in the cell, grown by 5 each way. @see NServerDraw.java:95-105 */
  getMinMax(stringBounder: StringBounder, width: number, height: number): MinMax {
    const xMiddle = width / 2;
    const yMiddle = height / 2;
    const dimBox = this.box.calculateDimension(stringBounder);

    const x1 = xMiddle - dimBox.getWidth() / 2;
    const y1 = yMiddle - dimBox.getHeight() / 2;
    const x2 = xMiddle + dimBox.getWidth() / 2;
    const y2 = yMiddle + dimBox.getHeight() / 2;
    return MinMax.getEmpty(false)
      .addPoint(x1 - MINMAX_MARGIN, y1 - MINMAX_MARGIN)
      .addPoint(x2 + MINMAX_MARGIN, y2 + MINMAX_MARGIN);
  }

  /** @see NServerDraw.java:107-111 */
  drawMe(ug: UGraphic, width: number, height: number): void {
    const xMiddle = width / 2;
    const yMiddle = height / 2;
    this.drawCenter(ug, this.box, xMiddle, yMiddle);
  }

  /**
   * The link up to the main network (skipping every bus it crosses), its
   * address, then the links down to every other network joined.
   * @see NServerDraw.java:113-170
   */
  drawLinks(ug: UGraphic, xstart: number, width: number, height: number): void {
    ug = ug.apply(UTranslate.dx(xstart));

    const ynet1 = this.network.getY();
    const yMiddle = height / 2;
    const dimBox = this.box.calculateDimension(ug.getStringBounder());

    const alpha = yMiddle - dimBox.getHeight() / 2;
    const posLink1 = (yMiddle - dimBox.getHeight() / 2 - this.topMargin + NServerDraw.MAGIC) / 2;

    const xMiddle = width / 2;
    const xLinkPos = width / 2;

    const skip = this.skipSet(xstart + xMiddle);
    const at = ug.apply(UTranslate.dx(xLinkPos + this.network.magicDelta()));
    if (this.server.printFirstLink())
      if (this.network.isVisible()) new VerticalLine(ynet1 + NETWORK_THIN, ynet1 + alpha, skip).drawU(at);
      else new VerticalLine(ynet1, ynet1 + alpha, new Set<number>()).drawU(at);

    const link = this.getTextBlockLink1();
    this.drawCenter(ug, link, xMiddle + this.network.magicDelta(), ynet1 + posLink1);

    this.drawOtherLinks(ug, { ynet1, yMiddle, dimBox, alpha, xLinkPos, skip });
  }

  /**
   * `TreeSet<Double>` of the y of every network the link's x falls strictly
   * inside: ascending and deduplicated, the order `VerticalLine` walks.
   * @see NServerDraw.java:128-132
   */
  private skipSet(x: number): ReadonlySet<number> {
    const ys: number[] = [];
    for (const n of this.networks) if (x > n.getXmin() && x < n.getXmax()) ys.push(n.getY());
    return new Set(ys.sort((a, b) => a - b));
  }

  /** `drawLinks`'s loop over the other networks. @see NServerDraw.java:145-168 */
  private drawOtherLinks(ug: UGraphic, at: OtherLinksFrame): void {
    const stringBounder = ug.getStringBounder();
    let x = at.xLinkPos - ((this.conns.size - 2) * SEVEN) / 2;
    let first = true;
    for (const [key, value] of this.conns) {
      if (key === this.network) continue;

      const ynet2 = key.getY();
      new VerticalLine(at.ynet1 + at.yMiddle + at.dimBox.getHeight() / 2, ynet2, at.skip).drawU(
        ug.apply(UTranslate.dx(x - key.magicDelta())),
      );

      // `toTextBlock` answers null only for a null address; a connection's is never null.
      const block = this.server.toTextBlock('arrow', value)!;

      let xtext: number;
      if (first && this.conns.size > 2) xtext = x - block.calculateDimension(stringBounder).getWidth() / 2;
      else xtext = x;

      this.drawCenter(ug, block, xtext - key.magicDelta(), ynet2 - at.alpha / 2);
      x += SEVEN;
      first = false;
    }
  }

  /** @see NServerDraw.java:172-174 */
  private getTextBlockLink1(): TextBlock | null {
    return this.server.toTextBlock('arrow', this.conns.get(this.network) ?? null);
  }

  /**
   * The NEXT network's address, read even when the server is not on it
   * (nwp D8); null on the last network.
   * @see NServerDraw.java:176-182
   */
  private link2(): TextBlock | null {
    const i = this.networks.indexOf(this.network);
    if (i === this.networks.length - 1) return null;
    return this.server.toTextBlock('arrow', this.conns.get(this.networks[i + 1]!) ?? null);
  }

  /** @see NServerDraw.java:184-191 */
  private drawCenter(ug: UGraphic, block: TextBlock | null, x: number, y: number): void {
    if (block === null) return;
    const dim = block.calculateDimension(ug.getStringBounder());
    block.drawU(ug.apply(new UTranslate(x - dim.getWidth() / 2, y - dim.getHeight() / 2)));
  }

  /**
   * Width: the widest of the two link labels plus 20 and the box plus 30.
   * Height: both link labels plus 20 each, the box, and twice `topMargin`.
   * @see NServerDraw.java:193-204
   */
  naturalDimension(stringBounder: StringBounder): XDimension2D {
    const link1 = this.getTextBlockLink1();
    const dimLink1 = link1 === null ? new XDimension2D(0, 0) : link1.calculateDimension(stringBounder);
    const dimBox = this.box.calculateDimension(stringBounder);
    const link2 = this.link2();
    const dimLink2 = link2 === null ? new XDimension2D(0, 0) : link2.calculateDimension(stringBounder);
    const width = max3(
      dimLink1.getWidth() + 2 * this.marginAd,
      dimBox.getWidth() + 2 * this.marginBoxW(),
      dimLink2.getWidth() + 2 * this.marginAd,
    );
    const height =
      dimLink1.getHeight() +
      2 * this.marginAd +
      2 * this.marginBoxH() +
      dimBox.getHeight() +
      dimLink2.getHeight() +
      2 * this.marginAd;
    return new XDimension2D(width, height);
  }

  /** @see NServerDraw.java:206-208 */
  getNetwork(): Network {
    return this.network;
  }

  /** @see NServerDraw.java:210-212 */
  getServer(): NServer {
    return this.server;
  }
}

/** `drawLinks`'s locals its loop reads (nwp D10). */
interface OtherLinksFrame {
  readonly ynet1: number;
  readonly yMiddle: number;
  readonly dimBox: XDimension2D;
  readonly alpha: number;
  readonly xLinkPos: number;
  readonly skip: ReadonlySet<number>;
}
