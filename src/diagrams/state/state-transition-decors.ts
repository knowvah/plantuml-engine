/**
 * A transition's extremities -- split out of ./state-renderer-transitions.ts when that file passed the repo's
 * 500-line cap (stdd T6c). `SvekEdge#getExtremitySimplier` (`SvekEdge.java:536-562`) places each extremity and
 * moves the path by its decoration length; `drawRainbow` (`:1108-1142`) draws them.
 */

import type { Theme } from '../../core/theme.js';
import type { Point2D } from '../../core/klimt/UTranslate.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import type { TransitionGeo } from './state-geo-types.js';
import type { TransitionLink, TransitionPaint } from './state-link-style.js';
import {
  buildTransitionArrowhead,
  buildCircleEndMarkup,
  buildCrossStartMarkup,
  decorationTrim,
  pullTipBack,
  DEFAULT_DECORATION_LENGTH,
  CIRCLE_END_RADIUS,
  type DecorSide,
  type TransitionArrowhead,
} from './renderer-arrowhead.js';

export interface TransitionDecors {
  readonly headSide: DecorSide;
  readonly tailSide: DecorSide;
  readonly arrowhead: TransitionArrowhead;
  /** The head extremity's `getDecorationLength()` move; `ExtremityArrowAndCircle` keeps the default 8. */
  readonly headTrim: Point2D | undefined;
  /** `ExtremityCircleCross`'s default 8 at the tail of an `x-->` link; `undefined` without a tail decor. */
  readonly tailTrim: Point2D | undefined;
  readonly circleEnd: string;
  readonly crossStart: string;
}

/**
 * The extremities (stdd T2b, split from {@link buildTransitionInnerMarkup} for the NLOC cap).
 * `SvekEdge.java:680-684`: `decor2` is drawn at the path start, `decor1` at its end; an inverted link
 * (`LinkType#getInversed`) carries its ARROW in `decor2`, so the head moves to the start.
 */
export function buildTransitionDecors(
  transition: TransitionGeo,
  link: TransitionLink,
  paint: TransitionPaint,
  theme: Theme,
): TransitionDecors {
  const headColor = paint.headColor ?? paint.color;
  const headSide: DecorSide = link.looksLikeRevertedForSvg() ? 'start' : 'end';
  const tailSide: DecorSide = headSide === 'start' ? 'end' : 'start';
  const background = resolveColorToSvgHex(theme.colors.background);
  // stdd T6c: `ExtremityArrowAndCircle` draws its arrow `radius` (5) behind the end and takes the default
  // decoration length (`Extremity.java:83-85`); the plain `ExtremityArrow` sits on the end with length 5.
  const circleEnd = transition.circleEnd === true;
  const arrowOn = circleEnd
    ? { ...transition, points: pullTipBack(transition.points, headSide, CIRCLE_END_RADIUS) }
    : transition;
  const arrowhead = buildTransitionArrowhead(arrowOn, paint, paint.stroke.getThickness(), headSide);
  return {
    headSide,
    tailSide,
    arrowhead,
    headTrim: circleEnd ? decorationTrim(transition.points, headSide, DEFAULT_DECORATION_LENGTH) : arrowhead.trim,
    tailTrim:
      transition.crossStart === true
        ? decorationTrim(transition.points, tailSide, DEFAULT_DECORATION_LENGTH)
        : undefined,
    circleEnd: circleEnd ? buildCircleEndMarkup(transition, headColor, background, headSide) : '',
    crossStart:
      transition.crossStart === true ? buildCrossStartMarkup(transition, headColor, background, tailSide) : '',
  };
}
