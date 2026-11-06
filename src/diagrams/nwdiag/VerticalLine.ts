/**
 * VerticalLine — a vertical `UPath` from `y1` to `y2` at x = 0, broken by an
 * arc around each `skip` ordinate (a network bus crossing it). `packetdiag`
 * draws its indicator ticks through it with an empty skip set
 * (`PacketIndicator.java:211`); #124 adds nwdiag's own callers.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/VerticalLine.java
 */
import { Back } from '../../core/klimt/Back.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UDrawable } from '../../core/klimt/shape/UDrawable.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';

/** The gap a skip leaves above its ordinate. @see VerticalLine.java:73 */
const SKIP_ABOVE = 3;
/** Where the line resumes below a skipped ordinate. @see VerticalLine.java:75,80 */
const SKIP_BELOW = 9;
/** The skip arc's radii. @see VerticalLine.java:75 */
const SKIP_ARC_RADIUS = 4;

/** @see VerticalLine.java:45 */
export class VerticalLine implements UDrawable {
  private readonly y1: number;
  private readonly y2: number;
  /**
   * Java's `Set<Double>`; iterated in the set's own order, which for a
   * `HashSet` is hash order, not ascending. Every packet caller passes an
   * empty set, so the order is not observable there.
   */
  private readonly skip: ReadonlySet<number>;

  /** @see VerticalLine.java:51-55 */
  constructor(y1: number, y2: number, skip: ReadonlySet<number>) {
    this.y1 = Math.min(y1, y2);
    this.y2 = Math.max(y1, y2);
    this.skip = skip;
  }

  /** @see VerticalLine.java:57-91 */
  drawU(ug: UGraphic): void {
    ug = ug.apply(new Back(HColors.none()));
    let drawn = false;
    let current = this.y1;
    let path = UPath.none();
    path.moveTo(0, current);
    for (const step of this.skip) {
      if (step < this.y1) continue;
      drawn = true;
      if (step === this.y2) {
        path.lineTo(0, this.y2);
      } else {
        path.lineTo(0, Math.min(this.y2, step - SKIP_ABOVE));
        if (this.y2 > step) {
          path.arcTo(SKIP_ARC_RADIUS, SKIP_ARC_RADIUS, 0, 0, 1, 0, step + SKIP_BELOW);
          continue;
        }
      }
      ug.draw(path);
      path = UPath.none();
      current = step + SKIP_BELOW;
      path.moveTo(0, current);
      if (current >= this.y2) break;
    }
    if (!drawn) {
      path.lineTo(0, this.y2);
      ug.draw(path);
    }
  }
}
