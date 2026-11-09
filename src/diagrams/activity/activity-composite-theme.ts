/**
 * A group frame's ONE merged style (`CommandPartition3.executeArg`, `CommandPartition3.java:160-161`), as the theme its
 * sizer and its renderer both read.
 *
 * `FtileGroup`'s constructor takes the title's font configuration and the frame's stroke off that style
 * (`FtileGroup.java:95-107,111`). The activity readers take both from `theme.elements.composite`, so
 * {@link withCompositeStyle} writes the merged style's size, face and thickness there, for this frame alone.
 */
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { activityCompositeStyleOf } from '../../core/activity-box-style.js';
import type { Style } from '../../core/style/Style.js';
import type { Theme } from '../../core/theme.js';

/** `stylePartition` of the group `symbol` (`'group'`, `'partition'`, `'package'`, `'rectangle'` or `'card'`). */
export function compositeStyleOf(
  theme: Theme,
  symbol: string,
  stereotype: string | undefined,
  position: number | undefined,
): Style | undefined {
  return activityCompositeStyleOf(theme)?.(symbol, stereotype, position);
}

/** `theme` as the frame with merged style `style` reads it; unchanged for none. */
export function withCompositeStyle(theme: Theme, style: Style | undefined): Theme {
  if (style === undefined) return theme;
  const font = bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
  const elements = theme.colors.elements;
  const composite = {
    ...elements?.['composite'],
    fontSize: font.size,
    fontFamily: font.family,
    lineThickness: style.getStroke().getThickness(),
  };
  return { ...theme, colors: { ...theme.colors, elements: { ...elements, composite } } };
}
