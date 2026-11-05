import type { HColor } from '../style/Value.js';
import { Back } from './Back.js';
import { HColorGradient } from './color/HColorGradient.js';
import { HColorSimple } from './color/HColorSimple.js';
import { HColors } from './color/HColors.js';
import { Fore } from './Fore.js';
import type { UGraphic } from './UGraphic.js';
import { UStroke } from './UStroke.js';

/**
 * Fashion — a back/fore colour pair plus stroke, shadow and corners: what
 * `Style#getSymbolContext` answers and a shape's `drawU` applies.
 *
 * Both constructors collapse into one with upstream's defaults on the
 * trailing parameters (`UStroke.simple()`, 0, 0, 0), the
 * `decoration/symbol/SymbolContext.ts` precedent: `new Fashion(back, fore)`
 * is java:90-92, the six-argument form the private one (java:52-60).
 * `HColor` stays `HColor` so a `@media dark` partner reaches the mapper.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/Fashion.java:43-145
 */
export class Fashion {
  /** @see Fashion.java:52-60, 90-92 */
  constructor(
    /** @see Fashion.java:45 */
    private readonly backColor: HColor | undefined,
    /** @see Fashion.java:46 */
    private readonly foreColor: HColor | undefined,
    /** @see Fashion.java:47 */
    private readonly stroke: UStroke = UStroke.simple(),
    /** @see Fashion.java:48 */
    private readonly deltaShadow = 0,
    /** @see Fashion.java:49 */
    private readonly roundCorner = 0,
    /** @see Fashion.java:50 */
    private readonly diagonalCorner = 0,
  ) {}

  /** @see Fashion.java:67-71 */
  apply(ug: UGraphic): UGraphic {
    ug = this.applyColors(ug);
    ug = this.applyStroke(ug);
    return ug;
  }

  /** @see Fashion.java:73-84 */
  applyColors(ug: UGraphic): UGraphic {
    if (this.foreColor === undefined) ug = ug.apply(new Fore(HColors.none()));
    else ug = ug.apply(new Fore(drawable(this.foreColor)));
    if (this.backColor === undefined) ug = ug.apply(new Back(HColors.none()));
    else ug = ug.apply(new Back(drawable(this.backColor)));
    return ug;
  }

  /** @see Fashion.java:86-88 */
  applyStroke(ug: UGraphic): UGraphic {
    return ug.apply(this.stroke);
  }

  /** @see Fashion.java:94-96 */
  withShadow(deltaShadow2: number): Fashion {
    return new Fashion(
      this.backColor,
      this.foreColor,
      this.stroke,
      deltaShadow2,
      this.roundCorner,
      this.diagonalCorner,
    );
  }

  /** Identical to {@link withShadow}, as upstream has both. @see Fashion.java:98-100 */
  withDeltaShadow(deltaShadow2: number): Fashion {
    return new Fashion(
      this.backColor,
      this.foreColor,
      this.stroke,
      deltaShadow2,
      this.roundCorner,
      this.diagonalCorner,
    );
  }

  /** @see Fashion.java:102-104 */
  withStroke(newStroke: UStroke): Fashion {
    return new Fashion(
      this.backColor,
      this.foreColor,
      newStroke,
      this.deltaShadow,
      this.roundCorner,
      this.diagonalCorner,
    );
  }

  /** @see Fashion.java:106-108 */
  withBackColor(backColor: HColor | undefined): Fashion {
    return new Fashion(backColor, this.foreColor, this.stroke, this.deltaShadow, this.roundCorner, this.diagonalCorner);
  }

  /** @see Fashion.java:110-112 */
  withForeColor(foreColor: HColor | undefined): Fashion {
    return new Fashion(this.backColor, foreColor, this.stroke, this.deltaShadow, this.roundCorner, this.diagonalCorner);
  }

  /** @see Fashion.java:114-116 */
  withCorner(roundCorner: number, diagonalCorner: number): Fashion {
    return new Fashion(this.backColor, this.foreColor, this.stroke, this.deltaShadow, roundCorner, diagonalCorner);
  }

  /** @see Fashion.java:118-120 */
  getBackColor(): HColor | undefined {
    return this.backColor;
  }

  /** @see Fashion.java:122-124 */
  getForeColor(): HColor | undefined {
    return this.foreColor;
  }

  /** @see Fashion.java:126-128 */
  getStroke(): UStroke {
    return this.stroke;
  }

  /** @see Fashion.java:130-132 */
  isShadowing(): boolean {
    return this.deltaShadow > 0;
  }

  /** @see Fashion.java:134-136 */
  getDeltaShadow(): number {
    return this.deltaShadow;
  }

  /** @see Fashion.java:138-140 */
  getRoundCorner(): number {
    return this.roundCorner;
  }

  /** @see Fashion.java:142-144 */
  getDiagonalCorner(): number {
    return this.diagonalCorner;
  }
}

/** `ug.apply(color)` / `color.bg()`: the port's driver paints a simple or gradient colour; any other is Java's checked cast. */
function drawable(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: a Fashion colour is not an HColorSimple');
}
