/**
 * state-link-style.ts — what `SvekEdge#drawU` reads off a `Link` before it draws
 * (stdd T2a). `CommandLinkStateCommon.java:208-212` runs `link.applyStyle(ARROW_STYLE)`
 * (`WithLinkType.java:126-166`: `dashed`, `dotted`, `bold`, `hidden`, `thickness=`, a
 * colour) and `setStereotype`; `SvekEdge.java:874-905` then builds the line colour,
 * the head colour and the stroke. The `Link` itself is `core/decoration/WithLinkType`.
 */
import { LinkDecor } from '../../core/decoration/LinkDecor.js';
import { LinkType } from '../../core/decoration/LinkType.js';
import { WithLinkType } from '../../core/decoration/WithLinkType.js';
import { ColorMapper, toSvgPaint } from '../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { resolveColorToSvgHex, toSvgHex, type ResolvedColor } from '../../core/klimt/color/HColorSet.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import type { Paint } from '../../core/paint.js';
import { cleanStereotypeToken } from '../../core/style-map-tag-cascade.js';
import type { Theme } from '../../core/theme.js';
import { STATE_ARROW_BUCKET, stateBucketPaint } from './state-bucket-colors.js';
import { stateArrowHeadOf } from '../../core/state-style-facts.js';
import type { TransitionGeo } from './state-geo-types.js';
import { resolveStateArrowLineColor } from './state-render-colors.js';

/** `root { LineThickness 1.0 }` (`plantuml.skin:15`): `Style#getStroke` never returns null for an arrow. */
const ROOT_LINE_THICKNESS = 1;

/**
 * The transition as upstream's `Link` (`WithLinkType`): `CommandLinkStateCommon.java:186-188` builds
 * `LinkType(circleEnd ? ARROW_AND_CIRCLE : ARROW, crossStart ? CIRCLE_CROSS : NONE)`, then `:208`
 * applies the bracket style.
 */
export class TransitionLink extends WithLinkType {
  constructor(transition: Pick<TransitionGeo, 'arrowStyle' | 'crossStart' | 'circleEnd' | 'inverted'>) {
    super();
    const type = new LinkType(
      transition.circleEnd === true ? LinkDecor.ARROW_AND_CIRCLE : LinkDecor.ARROW,
      transition.crossStart === true ? LinkDecor.CIRCLE_CROSS : LinkDecor.NONE,
    );
    // stdd T2b: `Link#getInv` (`Link.java:145-146`) swaps the decors (`LinkType.java:131-133`).
    this.type = transition.inverted === true ? type.getInversed() : type;
    this.applyStyle(transition.arrowStyle);
  }

  /** `Link#idCommentForSvg` (`Link.java:106-114`) over the two decors; the names are the caller's. */
  idCommentForSvg(name1: string, name2: string): string {
    const decor1 = this.type.getDecor1();
    const decor2 = this.type.getDecor2();
    if (decor1 === LinkDecor.NONE && decor2 !== LinkDecor.NONE) return `${name1}-backto-${name2}`;
    if ((decor1 === LinkDecor.NONE) === (decor2 === LinkDecor.NONE)) return `${name1}-${name2}`;
    return `${name1}-to-${name2}`;
  }

  /** `LinkType#looksLikeRevertedForSvg` (`LinkType.java:55-60`): `Link#commentForSvg` writes `reverse link`. */
  looksLikeRevertedForSvg(): boolean {
    return this.type.getDecor1() === LinkDecor.NONE && this.type.getDecor2() !== LinkDecor.NONE;
  }

  /** `WithLinkType#isHidden` (`:81-83`); `SvekResult.java:95` draws a hidden edge under `UHidden`, which emits nothing. */
  isHidden(): boolean {
    return this.hidden;
  }

  /** `Link#goNorank` sets a DOT `constraint=false` flag (`Link.java`); the layout read it before this draw step. */
  goNorank(): void {
    // nothing to record at draw time
  }
}

/** What `drawRainbow` receives (`SvekEdge.java:946`): the line colour, the head colour (`undefined` = transparent) and the stroke. */
export interface TransitionPaint {
  readonly color: Paint;
  readonly headColor: Paint | undefined;
  readonly stroke: UStroke;
}

/** `WithLinkType#getSpecificColor`: the port's `getColorOrWhite` yields a `ResolvedColor` record or an `HColor`. */
function specificPaint(link: TransitionLink): Paint | undefined {
  const specific = link.getSpecificColor();
  if (specific === undefined) return undefined;
  if (specific instanceof HColorSimple || specific instanceof HColorGradient) {
    return toSvgPaint(specific, ColorMapper.IDENTITY);
  }
  return isResolvedColor(specific) ? toSvgHex(specific) : undefined;
}

function isResolvedColor(c: object): c is ResolvedColor {
  return 'r' in c && 'g' in c && 'b' in c && 'a' in c;
}

/** `Rainbow.build(styleLine, set)` (`Rainbow.java:84-95`): LineColor, and HeadColor falling back to it; `none` is transparent. */
function rainbow(transition: TransitionGeo, theme: Theme): { color: Paint; headColor: Paint | undefined } {
  const tag = tagStyle(transition, theme);
  const scopedLine = stateBucketPaint(theme, STATE_ARROW_BUCKET, 'border');
  const flatFallback = theme.colors.arrow;
  const color = tag?.color ?? scopedLine ?? resolveStateArrowLineColor(theme, flatFallback);
  // The merged `{root, element, stateDiagram, arrow}` HeadColor (`state-style-facts.ts#withStateArrowHead`).
  const merged = stateArrowHeadOf(theme);
  if (merged !== undefined) return { color, headColor: merged === 'transparent' ? undefined : merged.paint };
  // A hand-built theme's `stateArrowHeadColor`; `HeadColor` unset (`ValueNull`) -> the merged LineColor, tag tier
  // included (`Rainbow.java:88-89`).
  const headRaw = theme.colors.graph.stateArrowHeadColor;
  if (headRaw === undefined) return { color, headColor: color };
  const lower = headRaw.trim().toLowerCase();
  if (lower === 'none' || lower === 'transparent') return { color, headColor: undefined };
  return { color, headColor: resolveColorToSvgHex(headRaw) };
}

/** `getDefaultStyleDefinition(stereotype)` -- `.withTOBECHANGED(stereotype)` (`SvekEdge.java:816-821`). */
function tagStyle(transition: TransitionGeo, theme: Theme): { color?: string; thickness?: number } | undefined {
  const cascade = theme.colors.graph.stateArrowTagCascade;
  if (transition.stereotype === undefined || cascade === undefined) return undefined;
  return cascade[cleanStereotypeToken(transition.stereotype)];
}

/** `styleLine.getStroke()`: the arrow style's LineThickness and LineStyle (`Style.java:303-320`). */
function suggestedStroke(transition: TransitionGeo, theme: Theme): UStroke {
  const arrow = theme.colors.elements?.[STATE_ARROW_BUCKET];
  const thickness =
    tagStyle(transition, theme)?.thickness ??
    arrow?.lineThickness ??
    // stdd T5a: the merged `{root, element, stateDiagram, arrow}` LineThickness (a skin's root, niveno-60).
    theme.colors.graph.stateArrowLineThickness ??
    theme.colors.graph.arrowThickness ??
    ROOT_LINE_THICKNESS;
  const dash = arrow?.lineStyle;
  if (dash !== undefined && dash.dashVisible > 0) return new UStroke(dash.dashVisible, dash.dashSpace, thickness);
  return UStroke.withThickness(thickness);
}

/**
 * `SvekEdge#drawU` (`SvekEdge.java:874-905`): a specific colour paints both line and head; the stroke is
 * `linkType.getStroke3(suggestedStroke)` for a normal style, else `getStroke3(defaultThickness)` where
 * `defaultThickness` is `skinParam.getThickness(LineParam.arrow, null)` (`:265`), i.e. `skinparam ArrowThickness`.
 */
export function resolveTransitionPaint(transition: TransitionGeo, link: TransitionLink, theme: Theme): TransitionPaint {
  let { color, headColor } = rainbow(transition, theme);
  const specific = specificPaint(link);
  if (specific !== undefined) {
    color = specific;
    headColor = specific;
  }
  const linkType = link.getType();
  const arrowThickness = theme.colors.graph.arrowThickness;
  const defaultThickness = arrowThickness === undefined ? null : UStroke.withThickness(arrowThickness);
  const stroke = linkType.getStyle().isNormal()
    ? linkType.getStroke3(suggestedStroke(transition, theme))
    : linkType.getStroke3(defaultThickness);
  return { color, headColor, stroke };
}
