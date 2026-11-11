/**
 * NwDiagram — one `@startnwdiag` block: networks (one stage each), servers
 * joined to them, groups of servers, and the stack of open `network`/`group`
 * blocks the commands push and pop. Drawn as one `TextBlock`: the network
 * names right-aligned in a column, then the grid of server cells beside them.
 * `annotations` holds the chrome, as every klimt diagram's does.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/NwDiagram.java
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { UEmpty } from '../../core/klimt/shape/UEmpty.js';
import { SpriteContainerEmpty } from '../../core/klimt/sprite/SpriteContainerEmpty.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { TitledDiagram, type UmlSource } from '../../core/TitledDiagram.js';
import { BLOCK_E1_NEWLINE } from '../../core/tim/builtin/jaws-constants.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { Network } from './core/Network.js';
import { NServer } from './core/NServer.js';
import { NwGroup } from './core/NwGroup.js';
import type { NStackable } from './core/NStackable.js';
import { GridTextBlockDecorated, NETWORK_THIN } from './next/GridTextBlockDecorated.js';
import { NPlayField } from './next/NPlayField.js';
import { NServerDraw } from './next/NServerDraw.js';
import { nwdiagStyle } from './nwdiag-klimt.js';
import type { SkinParam } from './nwdiag-skin-param.js';

/**
 * `\s*(\w+)\s*=\s*("([^"]*)"|[^\s,]+)`, found repeatedly (`Matcher.find`).
 * Java's `\s` and `\w` without `UNICODE_CHARACTER_CLASS` are ASCII, as JS's are,
 * except JS `\s` also matches Unicode spaces.
 * @see NwDiagram.java:288
 */
const p = /[ \t\n\x0B\f\r]*(\w+)[ \t\n\x0B\f\r]*=[ \t\n\x0B\f\r]*("([^"]*)"|[^ \t\n\x0B\f\r,]+)/g;

/** `drawMe`'s outer margin, and the gap after the names column. @see NwDiagram.java:342, 374 */
const MARGIN = 5;
/** The gap between the names column and the grid. @see NwDiagram.java:374 */
const NAMES_GAP = 5;

/** @see NwDiagram.java:80 */
export class NwDiagram extends TitledDiagram {
  /** `LinkedHashMap`: insertion order. @see NwDiagram.java:82 */
  private readonly servers = new Map<string, NServer>();
  /** @see NwDiagram.java:83 */
  private readonly networks: Network[] = [];
  /** @see NwDiagram.java:84 */
  private readonly groups: NwGroup[] = [];
  /** The open blocks; index 0 is the innermost. @see NwDiagram.java:85 */
  private readonly stack: NStackable[] = [];
  /** @see NwDiagram.java:87 */
  private readonly playField = new NPlayField();
  private readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`), as `PacketDiagram.ts` has it. */
  scale: ScaleSpec | undefined = undefined;

  /** The skin param is built by the factory, as packet's is (nwp D2). @see NwDiagram.java:93-95 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'NWDIAG', undefined, preprocessing);
    this.skinParam = skinParam;
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()`, else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    if (this.skinParam.getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /** `new DiagramDescription("(Nwdiag)")`. @see NwDiagram.java:89-91 */
  getDescription(): string {
    return '(Nwdiag)';
  }

  /** The networks in creation order, for the tests. */
  getNetworks(): readonly Network[] {
    return this.networks;
  }

  /** The servers in insertion order, for the tests. */
  getServers(): ReadonlyMap<string, NServer> {
    return this.servers;
  }

  /** The first network on the stack. @see NwDiagram.java:97-103 */
  private currentNetwork(): Network | null {
    for (const element of this.stack) if (element instanceof Network) return element;
    return null;
  }

  /** The top of the stack when it is a group. @see NwDiagram.java:105-109 */
  private currentGroup(): NwGroup | null {
    const top = this.stack[0];
    return top instanceof NwGroup ? top : null;
  }

  /**
   * No network: an invisible one. Every lone server joins the first network,
   * then every server's bar enters the play field.
   * @see NwDiagram.java:111-120
   */
  makeDiagramReady(): void {
    if (this.networks.length === 0) this.createNetwork('').goInvisible();
    for (const server of this.servers.values()) {
      server.connectMeIfAlone(this.networks[0]!);
      this.playField.addInPlayfield(server.getBar());
    }
  }

  /** @see NwDiagram.java:122-131 */
  openGroup(name: string | null): CommandExecutionResult {
    for (const element of this.stack)
      if (element instanceof NwGroup) return CommandExecutionResult.error('Cannot nest group');

    const newGroup = new NwGroup(name);
    this.stack.unshift(newGroup);
    this.groups.push(newGroup);
    return CommandExecutionResult.ok();
  }

  /** @see NwDiagram.java:133-147 */
  openNetwork(name: string | null): CommandExecutionResult {
    if (this.currentGroup() !== null) return CommandExecutionResult.error('Cannot open network in a group');

    for (const element of this.stack)
      if (element instanceof Network) return CommandExecutionResult.error('Cannot nest network');

    if (this.networks.length === 0 && this.groups.length === 0)
      this.eventuallyConnectAllStandaloneServersToHiddenNetwork();

    const network = this.createNetwork(name);
    this.stack.unshift(network);
    return CommandExecutionResult.ok();
  }

  /** @see NwDiagram.java:149-159 */
  private eventuallyConnectAllStandaloneServersToHiddenNetwork(): void {
    let first: Network | null = null;
    for (const server of this.servers.values())
      if (server.isAlone()) {
        if (first === null) {
          first = this.createNetwork('');
          first.goInvisible();
        }
        server.connectMeIfAlone(first);
      }
  }

  /** @see NwDiagram.java:161-166 */
  closeSomething(): CommandExecutionResult {
    if (this.stack.length > 0) this.stack.shift();
    return CommandExecutionResult.ok();
  }

  /** `getLast()` is read before `createNewStage()`, as Java evaluates them. @see NwDiagram.java:168-172 */
  private createNetwork(name: string | null): Network {
    const up = this.playField.getLast();
    const network = new Network(up, this.playField.createNewStage(), name);
    this.networks.push(network);
    return network;
  }

  /**
   * `a -- b`: an unknown `a` is the very first link with no network yet, else
   * an error; otherwise both join an invisible network just after `a`'s.
   * @see NwDiagram.java:174-214
   */
  link(name1: string, name2: string): CommandExecutionResult {
    const server1 = this.servers.get(name1);
    if (server1 === undefined) {
      if (this.networks.length === 0) return this.veryFirstLink(name1, name2);
      return CommandExecutionResult.error(`what about ${name1}`);
    }

    if (server1.isAlone()) {
      if (this.networks.length === 0) this.createNetwork('').goInvisible();
      server1.connectMeIfAlone(this.networks[0]!);
    }

    const tmp1 = server1.getMainNetworkNext();
    const justAfter = this.justAfter(tmp1);

    const network = justAfter !== null && !justAfter.isVisible() ? justAfter : this.createNetwork('');

    let server2 = this.servers.get(name2);

    network.goInvisible();
    if (server2 === undefined) {
      server2 = new NServer(name2, server1.getBar(), this.getSkinParam());
      this.servers.set(name2, server2);
      server1.connectTo(network, '');
      server2.connectTo(network, '');
    } else {
      server1.blankSomeAddress();
      server1.connectTo(network, server1.someAddress());
      server2.connectTo(network, server2.someAddress());
    }
    this.playField.addInPlayfield(server2.getBar());

    return CommandExecutionResult.ok();
  }

  /** @see NwDiagram.java:216-221 */
  private justAfter(n: Network): Network | null {
    const x = this.networks.indexOf(n);
    if (x !== -1 && x < this.networks.length - 1) return this.networks[x + 1]!;
    return null;
  }

  /** @see NwDiagram.java:223-230 */
  private veryFirstLink(name1: string, name2: string): CommandExecutionResult {
    const network = this.createNetwork(name1);
    const server2 = NServer.create(name2, this.getSkinParam());
    this.servers.set(name2, server2);
    server2.connectTo(network, '');
    this.playField.addInPlayfield(server2.getBar());
    return CommandExecutionResult.ok();
  }

  /** @see NwDiagram.java:232-278 */
  addElement(name: string, definition: string | undefined): CommandExecutionResult {
    const props = NwDiagram.toSet(definition);
    let server = this.servers.get(name);
    if (server === undefined) {
      server = NServer.create(name, this.getSkinParam());
      this.servers.set(name, server);
    }

    const group = this.currentGroup();
    if (group !== null) {
      if (this.alreadyInSomeGroup(name)) return CommandExecutionResult.error('Element already in another group.');

      group.addName(name);
      if (this.currentNetwork() === null) {
        server.updateProperties(props);
        return CommandExecutionResult.ok();
      }
    }

    if (this.networks.length === 0 || this.currentNetwork() === null) {
      server.updateProperties(props);
      server.learnThisAddress(props.get('address'));
      return CommandExecutionResult.ok();
    }

    this.addElementToNetwork(server, props);
    server.updateProperties(props);
    return CommandExecutionResult.ok();
  }

  /**
   * `addElement`'s tail. Its first arm is unreachable (the guard above returned
   * on zero networks) and kept as Java has it; the commented-out
   * `networks.size() == 1` branch is not ported (nwp D8).
   * @see NwDiagram.java:258-275
   */
  private addElementToNetwork(server: NServer, props: ReadonlyMap<string, string>): void {
    if (this.networks.length === 0) {
      const network = this.createNetwork('');
      network.goInvisible();
      server.connectTo(network, props.get('address'));
      this.playField.addInPlayfield(server.getBar());
      server.doNotPrintFirstLink();
    } else {
      const current = this.currentNetwork();
      if (current !== null) {
        server.connectTo(current, props.get('address'));
        this.playField.addInPlayfield(server.getBar());
      } else {
        server.learnThisAddress(props.get('address'));
      }
    }
  }

  /** @see NwDiagram.java:280-286 */
  private alreadyInSomeGroup(name: string): boolean {
    for (const g of this.groups) if (g.names().has(name)) return true;
    return false;
  }

  /**
   * Every `name = value` pair in `definition`; a quoted value loses its
   * quotes. A repeated name keeps the last value (`HashMap.put`).
   * @see NwDiagram.java:290-303
   */
  static toSet(definition: string | undefined): Map<string, string> {
    const result = new Map<string, string>();
    if (definition === undefined) return result;
    for (const m of definition.matchAll(p)) {
      const name = m[1]!;
      const value = m[3] ?? m[2]!;
      result.set(name, value);
    }
    return result;
  }

  /** Upstream's anonymous `TextBlock`. @see NwDiagram.java:305-317 */
  getTextBlock(): TextBlock {
    return {
      drawU: (ug: UGraphic): void => {
        this.drawMe(ug);
      },
      calculateDimension: (stringBounder: StringBounder): XDimension2D => this.getTotalDimension(stringBounder),
    };
  }

  /**
   * The network's name, then a `BLOCK_E1_NEWLINE` and its address, right
   * aligned in the `network` style, against an EMPTY sprite container.
   * A null name concatenates as Java's `"null"`.
   * @see NwDiagram.java:323-332
   */
  private toTextBlockForNetworkName(name: string | null, s: string | null): TextBlock {
    let text = name;
    if (s !== null) text = `${String(name)}${BLOCK_E1_NEWLINE}${s}`;

    const style = nwdiagStyle('network', this.getSkinParam());
    const fontConfiguration = bridgeFontConfiguration(
      style.getFontConfiguration(this.getSkinParam().getIHtmlColorSet()),
    );
    const sprites = this.getSkinParam().getSprites();
    const spriteContainer = new SpriteContainerEmpty(sprites.internal, sprites.emoji);
    return Display.getWithNewlines(this.getPragma(), text).create(
      { fontConfiguration, spriteContainer, atomOps: spriteContainer.atomOps(fontConfiguration) },
      HorizontalAlignment.RIGHT,
    );
  }

  /** The drawing's own ink from (0, 0). @see NwDiagram.java:334-340 */
  private getTotalDimension(stringBounder: StringBounder): XDimension2D {
    return TextBlockUtils.getMinMax({ drawU: (ug: UGraphic) => this.drawMe(ug) }, stringBounder, true).getDimension();
  }

  /**
   * The names column (right-aligned, each at its line's y), the grid beside
   * it lifted by half the first name's excess height, and a 1×1 `UEmpty`
   * past the grid's far corner.
   * @see NwDiagram.java:344-382
   */
  private drawMe(ug: UGraphic): void {
    ug = ug.apply(new UTranslate(MARGIN, MARGIN));
    const stringBounder = ug.getStringBounder();
    const grid = this.buildGrid(stringBounder);

    let deltaX = 0;
    let deltaY = 0;
    for (let i = 0; i < this.networks.length; i++) {
      const dim = this.networkName(i).calculateDimension(stringBounder);
      if (i === 0) deltaY = (dim.getHeight() - NETWORK_THIN) / 2;
      deltaX = Math.max(deltaX, dim.getWidth());
    }
    let y = 0;
    for (let i = 0; i < this.networks.length; i++) {
      const desc = this.networkName(i);
      const dim = desc.calculateDimension(stringBounder);
      desc.drawU(ug.apply(new UTranslate(deltaX - dim.getWidth(), y)));
      y += grid.lineHeight(stringBounder, i);
    }
    deltaX += NAMES_GAP;

    grid.drawU(ug.apply(new UTranslate(deltaX, deltaY)));
    const dimGrid = grid.calculateDimension(stringBounder);

    ug.apply(new UTranslate(dimGrid.getWidth() + deltaX + MARGIN, dimGrid.getHeight() + deltaY + MARGIN)).draw(
      new UEmpty(1, 1),
    );
  }

  /** `toTextBlockForNetworkName(current.getDisplayName(), current.getOwnAdress())`. @see NwDiagram.java:355-357 */
  private networkName(i: number): TextBlock {
    const current = this.networks[i]!;
    return this.toTextBlockForNetworkName(current.getDisplayName(), current.getOwnAdress());
  }

  /** The networks the server has an address on, in network order. @see NwDiagram.java:384-393 */
  private getLinks(element: NServer): Map<Network, string> {
    const result = new Map<Network, string>();
    for (const network of this.networks) {
      const s = element.getAdress(network);
      if (s !== null) result.set(network, s);
    }
    return result;
  }

  /**
   * Fixes the groups into the play field, lays it out, and puts each server
   * in its main network's line at its bar's column; a group member's top
   * margin grows by the group header.
   * @see NwDiagram.java:395-422
   */
  private buildGrid(stringBounder: StringBounder): GridTextBlockDecorated {
    this.playField.fixGroups(this.groups, this.servers.values());

    const grid = new GridTextBlockDecorated(
      this.networks.length,
      this.servers.size,
      this.groups,
      this.networks,
      this.getSkinParam(),
    );

    const layout = this.playField.doLayout();
    for (let i = 0; i < this.networks.length; i++) {
      const current = this.networks[i]!;
      for (const server of this.servers.values()) {
        if (server.getMainNetworkNext() !== current) continue;
        const conns = this.getLinks(server);
        const col = layout.get(server.getBar());
        if (col === undefined) continue;
        let topMargin = NServerDraw.MAGIC;
        const group = this.getGroupOf(server);
        if (group !== null) topMargin += group.getTopHeaderHeight(stringBounder, this.getSkinParam());
        grid.add(i, col, server.getDraw(topMargin, conns, this.networks, this.getSkinParam()));
      }
    }
    return grid;
  }

  /** @see NwDiagram.java:424-430 */
  private getGroupOf(server: NServer): NwGroup | null {
    for (const group of this.groups) if (group.contains(server)) return group;
    return null;
  }

  /**
   * `address`/`width` set the current network's; `color` the current
   * group's, else network's; `description` the current group's, else the
   * current network's, which is a Java `NullPointerException` outside any
   * network (nwp D8, D11).
   * @see NwDiagram.java:432-454
   */
  setProperty(property: string, value: string): CommandExecutionResult {
    const lower = property.toLowerCase();
    const network = this.currentNetwork();
    if (lower === 'address' && network !== null) network.setOwnAdress(value);
    if (lower === 'width' && network !== null) network.setFullWidth(value.toLowerCase() === 'full');
    if (lower === 'color') {
      const color = this.getSkinParam().getIHtmlColorSet().getColorOrWhite(value);
      const target: NStackable | null = this.currentGroup() ?? network;
      target?.setColor(color);
    }
    if (lower === 'description') {
      const group = this.currentGroup();
      if (group !== null) group.setDescription(value);
      else if (network !== null) network.setDescription(value);
      else throw new Error('NullPointerException: nwdiag description outside any network or group');
    }
    return CommandExecutionResult.ok();
  }

  /** @see NwDiagram.java:456-459 */
  getDefaultMargins(): ClockwiseTopRightBottomLeft {
    return ClockwiseTopRightBottomLeft.none();
  }
}
