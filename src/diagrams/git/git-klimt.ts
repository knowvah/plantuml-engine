import { Back } from '../../core/klimt/Back.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { HColor } from '../../core/style/Value.js';

/** `(HColorSimple) color`: Java's cast where the port's driver needs a paint. */
function drawable(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: git colour is not an HColorSimple');
}

/** `ug.apply(color.bg())`. @see GitCurve.java:104 */
export function back(color: HColor): Back {
  return new Back(drawable(color));
}
