/**
 * Network — one horizontal bus: its stage, its name or description, its own
 * address, its colour and the x range the grid fills in at draw time.
 * Identity `equals`/`hashCode`, so JS `Map`s keyed by it match (nwp D4).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/core/Network.java
 */
import type { HColor } from '../../../core/style/Value.js';
import type { NStage } from '../next/NStage.js';
import type { NStackable } from './NStackable.js';

/** `magicDelta`'s offset of a link from the bus centre. @see Network.java:67,69 */
const MAGIC_DELTA = 2;

/** @see Network.java:40 */
export class Network implements NStackable {
  /** `null` for a nameless `network {` (`CommandNetwork`'s optional `NAME`). @see Network.java:43 */
  private readonly name: string | null;
  /** @see Network.java:44 */
  private description: string | null = null;
  /** @see Network.java:45 */
  private color: HColor | null = null;
  /** @see Network.java:46 */
  private visible = true;
  /** @see Network.java:47 */
  private ownAdress: string | null = null;
  /** @see Network.java:48 */
  private y = 0;
  /** @see Network.java:49 */
  private fullWidth = false;
  /** The stage before this one; `null` for the first network. @see Network.java:50 */
  private readonly up: NStage | null;
  /** @see Network.java:52 */
  private readonly nstage: NStage;
  /** @see Network.java:139 */
  private xmin = 0;
  /** @see Network.java:140 */
  private xmax = 0;

  /** @see Network.java:76-80 */
  constructor(up: NStage | null, nstage: NStage, name: string | null) {
    this.up = up;
    this.name = name;
    this.nstage = nstage;
  }

  /** @see Network.java:54-57 */
  toString(): string {
    return `${String(this.name)} visible=${String(this.visible)}`;
  }

  /** @see Network.java:59-61 */
  private isEven(): boolean {
    return this.nstage.getNumber() % 2 === 0;
  }

  /** @see Network.java:63-70 */
  magicDelta(): number {
    if (!this.isVisible()) return 0;
    if (this.isEven()) return MAGIC_DELTA;
    return -MAGIC_DELTA;
  }

  /** @see Network.java:72-74 */
  getUp(): NStage | null {
    return this.up;
  }

  /** @see Network.java:82-84 */
  getOwnAdress(): string | null {
    return this.ownAdress;
  }

  /** @see Network.java:86-88 */
  setOwnAdress(ownAdress: string | null): void {
    this.ownAdress = ownAdress;
  }

  /** @see Network.java:90-95 */
  getDisplayName(): string | null {
    if (this.description === null) return this.name;
    return this.description;
  }

  /** @see Network.java:97-100 */
  setDescription(description: string | null): void {
    this.description = description;
  }

  /** @see Network.java:102-104 */
  getColor(): HColor | null {
    return this.color;
  }

  /** @see Network.java:106-109 */
  setColor(color: HColor | null): void {
    this.color = color;
  }

  /** @see Network.java:111-113 */
  goInvisible(): void {
    this.visible = false;
  }

  /** @see Network.java:115-117 */
  isVisible(): boolean {
    return this.visible;
  }

  /** @see Network.java:119-121 */
  getY(): number {
    return this.y;
  }

  /** @see Network.java:123-125 */
  setY(y: number): void {
    this.y = y;
  }

  /** @see Network.java:127-129 */
  setFullWidth(fullWidth: boolean): void {
    this.fullWidth = fullWidth;
  }

  /** @see Network.java:131-133 */
  isFullWidth(): boolean {
    return this.fullWidth;
  }

  /** @see Network.java:135-137 */
  getNstage(): NStage {
    return this.nstage;
  }

  /** @see Network.java:142-145 */
  setMinMax(xmin: number, xmax: number): void {
    this.xmin = xmin;
    this.xmax = xmax;
  }

  /** @see Network.java:147-149 */
  getXmin(): number {
    return this.xmin;
  }

  /** @see Network.java:151-153 */
  getXmax(): number {
    return this.xmax;
  }
}
