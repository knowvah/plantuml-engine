/**
 * NServer — one element: its connections (network → address, in
 * `LinkedHashMap` order), its shape, description and colour, and the bar
 * that spans the stages it joins. Identity `equals`/`hashCode` (nwp D4).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/core/NServer.java
 */
import type { USymbol } from '../../../core/decoration/symbol/USymbol.js';
import { ComponentStyle, PackageStyle, USymbols } from '../../../core/decoration/symbol/USymbols.js';
import { NoSuchColorException } from '../../../core/klimt/color/NoSuchColorException.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../../core/klimt/shape/TextBlockUtils.js';
import { ActorStyle } from '../../../core/skin/ActorStyle.js';
import { BLOCK_E1_NEWLINE } from '../../../core/tim/builtin/jaws-constants.js';
import { NBar } from '../next/NBar.js';
import { NServerDraw } from '../next/NServerDraw.js';
import { createDisplay, nwdiagStyle, symbolContextOf, type NwdiagSName } from '../nwdiag-klimt.js';
import type { SkinParam } from '../nwdiag-skin-param.js';
import type { Network } from './Network.js';

/** `toTextBlock`'s separator, which becomes a line break. @see NServer.java:148 */
const ADDRESS_SEPARATOR = ', ';

/** @see NServer.java:65 */
export class NServer {
  /** @see NServer.java:67 */
  private readonly connections = new Map<Network, string>();
  /** @see NServer.java:69 */
  private shape: USymbol = USymbols.RECTANGLE;
  /** @see NServer.java:70 */
  private readonly name: string;
  /** @see NServer.java:71 */
  private description: string;
  /** @see NServer.java:72 */
  private backcolor: string | null = null;
  /** @see NServer.java:73 */
  private readonly bar: NBar;
  /** @see NServer.java:74 */
  private readonly skinParam: SkinParam;
  /** @see NServer.java:75 */
  private declaredAddress: string | null = null;
  /** @see NServer.java:77 */
  private printFirstLinkFlag = true;

  /** @see NServer.java:225-230 */
  constructor(name: string, bar: NBar, skinParam: SkinParam) {
    this.description = name;
    this.name = name;
    this.bar = bar;
    this.skinParam = skinParam;
  }

  /** @see NServer.java:221-223 */
  static create(name: string, skinParam: SkinParam): NServer {
    return new NServer(name, new NBar(), skinParam);
  }

  /** @see NServer.java:79-81 */
  doNotPrintFirstLink(): void {
    this.printFirstLinkFlag = false;
  }

  /** @see NServer.java:83-89 */
  connectMeIfAlone(network: Network): void {
    if (this.isAlone()) {
      this.connectTo(network, '');
      if (!network.isVisible()) this.doNotPrintFirstLink();
    }
  }

  /** @see NServer.java:91-93 */
  isAlone(): boolean {
    return this.connections.size === 0;
  }

  /** The first connection's address, else the declared one, else "". @see NServer.java:95-101 */
  someAddress(): string {
    const first = this.connections.values().next();
    if (first.done !== true && first.value.length > 0) return first.value;
    if (this.declaredAddress !== null) return this.declaredAddress;
    return '';
  }

  /** @see NServer.java:103-107 */
  someNetwork(): Network | null {
    const first = this.connections.keys().next();
    return first.done === true ? null : first.value;
  }

  /** @see NServer.java:109-114 */
  blankSomeAddress(): void {
    const first = this.connections.keys().next();
    if (first.done !== true) this.connections.set(first.value, '');
  }

  /** Fills the first blank address. @see NServer.java:116-126 */
  learnThisAddress(address: string | null | undefined): void {
    const value = address ?? '';
    for (const [key, current] of this.connections) {
      if (current.length === 0) {
        this.connections.set(key, value);
        return;
      }
    }
  }

  /** @see NServer.java:128-130 */
  printFirstLink(): boolean {
    return this.printFirstLinkFlag;
  }

  /** The first network joined; Java's `NoSuchElementException` when none. @see NServer.java:132-134 */
  getMainNetworkNext(): Network {
    const first = this.connections.keys().next();
    if (first.done === true) throw new Error('NoSuchElementException');
    return first.value;
  }

  /** @see NServer.java:136-138 */
  getAdress(network: Network): string | null {
    return this.connections.get(network) ?? null;
  }

  /**
   * `null` stays null, "" is an empty block, and `", "` becomes a
   * `BLOCK_E1_NEWLINE` (upstream's `@JawsStrange`).
   * @see NServer.java:140-151
   */
  toTextBlock(sname: NwdiagSName, s: string | null): TextBlock | null {
    if (s === null) return null;
    if (s.length === 0) return TextBlockUtils.empty(0, 0);
    s = s.replaceAll(ADDRESS_SEPARATOR, BLOCK_E1_NEWLINE);
    return createDisplay(
      Display.getWithNewlines(this.skinParam.getPragma(), s),
      nwdiagStyle(sname, this.skinParam),
      this.skinParam,
      HorizontalAlignment.LEFT,
    );
  }

  /**
   * The server's box: its shape's `asSmall` around the description, from the
   * `server` style with `color` as the back colour. An unknown colour is
   * swallowed (`catch (NoSuchColorException e) {}`).
   * @see NServer.java:163-179
   */
  getDraw(
    topMargin: number,
    conns: ReadonlyMap<Network, string>,
    networks: readonly Network[],
    skinParam: SkinParam,
  ): NServerDraw {
    let symbolContext = nwdiagStyle('server', skinParam).getSymbolContext(skinParam.getIHtmlColorSet());
    if (this.backcolor !== null)
      try {
        const back = skinParam.getIHtmlColorSet().getColor(this.backcolor);
        symbolContext = symbolContext.withBackColor(back);
      } catch (e) {
        if (!(e instanceof NoSuchColorException)) throw e;
      }

    const desc = this.toTextBlock('server', this.getDescription());
    const box = this.getShape().asSmall(
      TextBlockUtils.empty(0, 0),
      desc!,
      TextBlockUtils.empty(0, 0),
      symbolContextOf(symbolContext),
      HorizontalAlignment.CENTER,
    );
    return new NServerDraw(this, box, conns, networks, topMargin);
  }

  /**
   * Records the address; the first network sets the bar's stage, any other
   * than the main one adds the stage above it.
   * @see NServer.java:181-194
   */
  connectTo(network: Network | null, address: string | null | undefined): void {
    if (network === null) throw new Error('IllegalArgumentException');
    const value = address ?? '';
    if (value.length === 0 && this.connections.has(network)) return;

    this.connections.set(network, value);
    // `bar.getStart() == null`: the bar has no stage yet.
    if ((this.bar.getStart() as ReturnType<NBar['getStart']> | null) === null) this.bar.addStage(network.getNstage());
    else if (this.getMainNetworkNext() !== network) this.bar.addStage(network.getUp());
  }

  /** @see NServer.java:196-214 */
  updateProperties(props: ReadonlyMap<string, string>): void {
    const description = props.get('description');
    if (description !== undefined) this.description = description;
    const color = props.get('color');
    if (color !== undefined) this.backcolor = color;
    const address = props.get('address');
    if (address !== undefined) this.declaredAddress = address;

    const shape = props.get('shape');
    if (shape !== undefined) {
      const shapeFromString = USymbols.fromString(
        shape,
        ActorStyle.STICKMAN,
        ComponentStyle.RECTANGLE,
        PackageStyle.RECTANGLE,
      );
      if (shapeFromString !== null) this.shape = shapeFromString;
    }
  }

  /** @see NServer.java:216-219 */
  toString(): string {
    return this.name;
  }

  /** @see NServer.java:232-234 */
  getDescription(): string {
    return this.description;
  }

  /** @see NServer.java:236-238 */
  getName(): string {
    return this.name;
  }

  /** @see NServer.java:240-242 */
  getShape(): USymbol {
    return this.shape;
  }

  /** @see NServer.java:244-246 */
  getBar(): NBar {
    return this.bar;
  }

  /** @see NServer.java:248-250 */
  getSkinParam(): SkinParam {
    return this.skinParam;
  }
}
