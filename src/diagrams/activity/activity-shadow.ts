/**
 * activity-shadow.ts -- the drop-shadow `<filter>` a shadowed action box references.
 *
 * `FtileBox`'s `style.getShadowing()` (`FtileBox.java:173`) reaches `boxStyle.drawMe(ug, w, h, shadowing, roundCorner)`
 * (`:222`), whose shape calls `setDeltaShadow(shadowing)` (`BoxStyle.java:163,182,212,...`); `SvgGraphics#manageShadow`
 * then appends ONE fixed filter per document -- `stdDeviation` 2, `dx` = `dy` = 4 whatever the delta -- and gives the shape
 * `filter="url(#...)"` (`SvgGraphics.java:1070-1090`, `:889-893`). The delta only gates WHETHER the shape is shadowed.
 * The same string `sequence/sequence-shadow.ts`, `class/class-shadow.ts` and `state/state-shadow.ts` each keep for their
 * engine; `svg-defs-seeded.ts` renames the id to the jar's seeded `f<seed>`, and `TextBlockExporter` scales it.
 */
import { attrs } from '../../core/svg.js';
import type { ActivityNodeGeo } from './activity-geometry.types.js';
import type { Theme } from '../../core/theme.js';
import { noteStyleFactsOf } from '../../core/note-style-facts.js';
import { activityDocumentStyleOf, type ActivityShadowing } from '../../core/activity-document-style.js';

/** The pre-seed id; `svg-defs-seeded.ts#applySeededDefIds` renames it. */
const ACTIVITY_SHADOW_FILTER_ID = 'activityShadow';

/** `SvgGraphics`'s alpha-only colour matrix for the blurred copy (`:1082`). */
const SHADOW_COLOR_MATRIX_VALUES = '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .4 0';

/** The shadow `<filter>` def (`SvgGraphics.java:1074-1085`). */
export function activityShadowFilterDef(): string {
  return (
    '<filter' +
    attrs([
      ['id', ACTIVITY_SHADOW_FILTER_ID],
      ['x', -1],
      ['y', -1],
      ['width', '300%'],
      ['height', '300%'],
    ]) +
    '><feGaussianBlur result="blurOut" stdDeviation="2"/>' +
    '<feColorMatrix' +
    attrs([
      ['type', 'matrix'],
      ['in', 'blurOut'],
      ['result', 'blurOut2'],
      ['values', SHADOW_COLOR_MATRIX_VALUES],
    ]) +
    '/><feOffset result="blurOut3" in="blurOut2" dx="4" dy="4"/>' +
    '<feBlend in="SourceGraphic" in2="blurOut3" mode="normal"/></filter>'
  );
}

/** `addFilterShadowId` (`SvgGraphics.java:889-893`): a shape with `deltaShadow > 0` references the filter. */
export function activityShadowFilter(deltaShadow: number): { readonly filter?: string } {
  return deltaShadow > 0 ? { filter: `url(#${ACTIVITY_SHADOW_FILTER_ID})` } : {};
}

/** The document's plain-element shadows (`core/activity-document-style.ts`), all 0 for a theme that has none. */
const NO_SHADOWING: ActivityShadowing = { start: 0, stop: 0, end: 0, box: 0 };

export function activityShadowingOf(theme: Theme): ActivityShadowing {
  return activityDocumentStyleOf(theme)?.shadowing ?? NO_SHADOWING;
}

/** The ONE shadow `<filter>` is written once a drawn shape carries a positive shadow (`SvgGraphics#manageShadow`). */
export function anyShadowed(nodes: readonly ActivityNodeGeo[], theme: Theme): boolean {
  const shadowing = activityShadowingOf(theme);
  return nodes.some((n) => shadowOfNode(n, shadowing, theme) > 0);
}

function shadowOfNode(node: ActivityNodeGeo, shadowing: ActivityShadowing, theme: Theme): number {
  switch (node.kind) {
    case 'start':
      return shadowing.start;
    case 'stop':
      return shadowing.stop;
    case 'end':
      return shadowing.end;
    case 'action':
      return node.boxStyle?.getShadowing() ?? shadowing.box;
    case 'note':
      return noteStyleFactsOf(theme)?.shadowing ?? 0;
    default:
      return node.boxStyle?.getShadowing() ?? 0;
  }
}

/** The note's merged-style shadow (`note-style-facts.ts`), the filter its body path carries (`Opale.java:122`). */
export function noteShadowFilter(theme: Theme): { readonly filter?: string } {
  return activityShadowFilter(noteStyleFactsOf(theme)?.shadowing ?? 0);
}
