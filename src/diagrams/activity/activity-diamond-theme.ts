/**
 * The one merged `Style` of an `if`/`while`/`repeat` diamond (`FtileFactoryDelegatorIf.java:79-80`), as the theme its sizer
 * and its renderer both read (aar-T6b), the way `activity-box-theme.ts#withActivityBox` does it for a box.
 *
 * `ConditionalBuilder` takes the test label's whole `FontConfiguration` off it (`ConditionalBuilder.java:117-118`): colour and
 * size are tiers the readers already have in `theme.colors.elements.diamond`, the face and the font style ride on a symbol.
 */
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { ActivityDiamondStyle } from '../../core/activity-diamond-style.js';
import type { Style } from '../../core/style/Style.js';
import type { Theme } from '../../core/theme.js';
import { activityDiamondStyleAt } from '../../core/activity-diamond-style.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { PAINT_NONE } from '../../core/svg.js';
import { paintOf } from '../../core/activity-circle-style.js';
import { ValueNull } from '../../core/style/ValueNull.js';
import { activityBucketOf } from './activity-box-theme.js';
import { activityFontSize, activityLineThickness, bucketKey } from './activity-style-defaults.js';
import { activityFontFamily } from './activity-text-style.js';

const DIAMOND_FONT_KEY: unique symbol = Symbol('activity.diamondFont');
const ARROW_FONT_KEY: unique symbol = Symbol('activity.arrowFont');

/** `root { FontName SansSerif }`: the face the flat tiers already answer for. @see plantuml.skin:6 */
const SKIN_FONT_NAME = 'SansSerif';

type ThemeWithDiamondFont = Theme & {
  readonly [DIAMOND_FONT_KEY]?: FontConfiguration;
  readonly [ARROW_FONT_KEY]?: FontConfiguration;
};

/** `theme` as the diamond with merged style `style` reads it; `undefined` leaves `theme` as it is. */
export function withActivityDiamond(theme: Theme, diamond: ActivityDiamondStyle | undefined): Theme {
  if (diamond === undefined) return theme;
  const { style } = diamond;
  const font = bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
  const key = bucketKey('diamond');
  const elements = theme.colors.elements;
  const alignment = style.getHorizontalAlignment();
  const bucket = {
    ...elements?.[key],
    ...activityBucketOf(style, font),
    ...(alignment === undefined ? {} : { horizontalAlignment: alignment }),
  };
  const withElements: Theme = diamond.tiers
    ? { ...theme, colors: { ...theme.colors, elements: { ...elements, [key]: bucket } } }
    : theme;
  return withActivityArrow(
    { ...withElements, [DIAMOND_FONT_KEY]: font } as ThemeWithDiamondFont,
    diamond.arrow,
    diamond.arrowStroke,
  );
}

/**
 * The final builder's diamond stroke: the flat tiers hold no `LineThickness` of a skin's `root { }` (`skin debug`,
 * `debug.skin:1-12`, `LineThickness 4`), and the stroke `FtileDiamond` draws is `getStyle().getStroke()`, merged from the
 * current builder at draw time (`style-position.ts#themeAtOpener`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileDiamond.java:89
 */
function withDiamondStroke(theme: Theme, style: Style): Theme {
  const thickness = style.getStroke().getThickness();
  if (thickness === activityLineThickness(theme, 'diamond')) return theme;
  const key = bucketKey('diamond');
  const elements = theme.colors.elements;
  const bucket = { ...elements?.[key], lineThickness: thickness };
  return { ...theme, colors: { ...theme.colors, elements: { ...elements, [key]: bucket } } };
}

/** The diamond style's font configuration (`ConditionalBuilder.java:117`), absent for a diamond that reads the flat tiers. */
export function diamondFontConfiguration(theme: Theme): FontConfiguration | undefined {
  return (theme as ThemeWithDiamondFont)[DIAMOND_FONT_KEY];
}

/**
 * `theme` as the arrow with merged style `style` reads its label font (`FtileFactoryDelegator.java:91-112`,
 * `Branch.java:252-258`: `style.getFontConfiguration`). The size and the face go to the `arrow` bucket the readers already
 * have, only where they differ from what the flat tiers answer; the font style and face ride on a symbol.
 */
export function withActivityArrow(theme: Theme, style: Style | undefined, strokeStyle: Style | undefined): Theme {
  if (style === undefined) return theme;
  const font = bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
  const key = bucketKey('arrow');
  const sizeOverride = font.size !== activityFontSize(theme, 'arrow');
  const familyOverride = font.family !== SKIN_FONT_NAME && font.family !== activityFontFamily(theme, 'arrow');
  // `Snake.java:139-141`, `Worm.java:129`: the stroke is merged from `activityArrow()`, which nests `activity`.
  const thickness = strokeStyle?.getStroke().getThickness();
  const thicknessOverride = thickness !== undefined && thickness !== activityLineThickness(theme, 'arrow');
  const elements = theme.colors.elements;
  const bucket = {
    ...elements?.[key],
    ...(sizeOverride ? { fontSize: font.size } : {}),
    ...(familyOverride ? { fontFamily: font.family } : {}),
    ...(thicknessOverride ? { lineThickness: thickness } : {}),
  };
  const withFont: Theme =
    sizeOverride || familyOverride || thicknessOverride
      ? { ...theme, colors: { ...theme.colors, elements: { ...elements, [key]: bucket } } }
      : theme;
  const withElements = withHeadColor(withFont, style);
  const carried = font.styles.size > 0 || familyOverride;
  return carried ? ({ ...withElements, [ARROW_FONT_KEY]: font } as ThemeWithDiamondFont) : withElements;
}

/** The arrow style's font configuration, absent for an arrow that reads the flat tiers. */
export function arrowFontConfiguration(theme: Theme): FontConfiguration | undefined {
  return (theme as ThemeWithDiamondFont)[ARROW_FONT_KEY];
}

/** `theme` with the arrows of the document's final builder: what `->text;` and every non-opener label reads. */
export function withActivityDocumentArrow(theme: Theme): Theme {
  const final = activityDiamondStyleAt(theme, [], undefined);
  const arrows = withActivityArrow(theme, final?.arrow, final?.arrowStroke);
  return final === undefined ? arrows : withDiamondStroke(arrows, final.style);
}

/**
 * `Rainbow.build(style, set)`: the arrowhead takes the style's `HeadColor` where it declares one (a transparent one draws
 * nothing), the line colour where it does not.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/Rainbow.java:84-95
 */
function withHeadColor(theme: Theme, style: Style): Theme {
  if (style.value('HeadColor') instanceof ValueNull) return theme;
  const color = style.value('HeadColor').asColor(HColorSet.instance());
  // `Rainbow.java:92-93`: no colour is the transparent one, which the driver writes as `none`.
  const head = color instanceof HColorSimple && color.isTransparent() ? PAINT_NONE : paintOf(style, 'HeadColor', false);
  return head === undefined ? theme : { ...theme, colors: { ...theme.colors, arrowHead: head } };
}
