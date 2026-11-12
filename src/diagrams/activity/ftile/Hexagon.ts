import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { Stencil } from '../../../core/klimt/creole/Stencil.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import { UPolygon } from '../../../core/klimt/shape/UPolygon.js';

/**
 * Hexagon — the activity decision shape: the 24-px diamond of `FtileDiamond`
 * (`asPolygon(shadowing)`), the labelled hexagon, its stencil, and the
 * square diamond. Ported whole (the class is static helpers only).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Hexagon.java:44-120
 */
export const Hexagon = {
  /** @see Hexagon.java:46 */
  hexagonHalfSize: 12,

  /** @see Hexagon.java:48-63 */
  asPolygon(shadowing: number): UPolygon {
    const half = Hexagon.hexagonHalfSize;
    const diams = new UPolygon();
    diams.addPoint(half, 0);
    diams.addPoint(half * 2, half);
    diams.addPoint(half, half * 2);
    diams.addPoint(0, half);
    diams.addPoint(half, 0);
    diams.setDeltaShadow(shadowing);
    return diams;
  },

  /** `asPolygon(shadowing, width, height)`, renamed: TS cannot overload on arity here. @see Hexagon.java:65-82 */
  asPolygonSized(shadowing: number, width: number, height: number): UPolygon {
    const half = Hexagon.hexagonHalfSize;
    const diams = new UPolygon();
    diams.addPoint(half, 0);
    diams.addPoint(width - half, 0);
    diams.addPoint(width, height / 2);
    diams.addPoint(width - half, height);
    diams.addPoint(half, height);
    diams.addPoint(0, height / 2);
    diams.addPoint(half, 0);
    diams.setDeltaShadow(shadowing);
    return diams;
  },

  /** @see Hexagon.java:84-105 */
  asStencil(tb: TextBlock): Stencil {
    const getDeltaX = (height: number, y: number): number => {
      const p = (y / height) * 2;
      if (p <= 1) return Hexagon.hexagonHalfSize * p;
      return Hexagon.hexagonHalfSize * (2 - p);
    };
    return {
      getStartingX(stringBounder: StringBounder, y: number): number {
        const dim = tb.calculateDimension(stringBounder);
        return -getDeltaX(dim.getHeight(), y);
      },
      getEndingX(stringBounder: StringBounder, y: number): number {
        const dim = tb.calculateDimension(stringBounder);
        return dim.getWidth() + getDeltaX(dim.getHeight(), y);
      },
    };
  },

  /** @see Hexagon.java:107-118 */
  asPolygonSquare(shadowing: number, width: number, height: number): UPolygon {
    const diams = new UPolygon();
    diams.addPoint(width / 2, 0);
    diams.addPoint(width, height / 2);
    diams.addPoint(width / 2, height);
    diams.addPoint(0, height / 2);
    diams.setDeltaShadow(shadowing);
    return diams;
  },
} as const;
