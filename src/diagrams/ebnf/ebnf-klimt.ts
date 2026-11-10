/**
 * PORT-ONLY: the `HColor` → paint casts the EBNF tiles need where Java applies a colour straight to a `UGraphic`
 * (`ug.apply(color)`, `ug.apply(color.bg())`). The same seam as `nwdiag/nwdiag-klimt.ts#fore`/`back`.
 */
import { Back } from '../../core/klimt/Back.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { Fore } from '../../core/klimt/Fore.js';
import type { HColor } from '../../core/style/Value.js';

/** `(HColorSimple) color`: Java's cast where the port's driver needs a paint. */
export function paintOf(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: ebnf colour is not an HColorSimple');
}

/** `ug.apply(color)`. */
export function fore(color: HColor): Fore {
  return new Fore(paintOf(color));
}

/** `ug.apply(color.bg())`. */
export function back(color: HColor): Back {
  return new Back(paintOf(color));
}
