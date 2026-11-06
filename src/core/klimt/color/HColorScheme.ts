import type { HColor } from '../../style/Value.js';

/**
 * HColorScheme: the `#?light:dark[:transparent]` colour, resolved per background where a text draws
 * (`FontConfiguration#adjustColorForBackground`, `FontConfiguration.java:350-357`). The port carries its source spelling
 * as the paint a `FontConfiguration` holds, and `DriverTextSvg` resolves that against the drawing `UParam`'s back
 * (`HColorSet.ts#resolveConditionalColor`, the same `getAppropriateColor`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/HColorScheme.java:36-62
 */
export class HColorScheme implements HColor {
  /** `spec` is the token after `?`: `light:dark[:transparent]`. */
  constructor(private readonly spec: string) {}

  /** The spelling `parseConditionalColor` reads. */
  asPaint(): string {
    return `#?${this.spec}`;
  }

  /** The inherited `"?" + getClass().getSimpleName()`. @see HColor.java:113-115 */
  asString(): string {
    return '?HColorScheme';
  }

  /** @see HColor.java:125-127 */
  withDark(_dark: HColor): HColor {
    throw new Error('UnsupportedOperationException');
  }
}
