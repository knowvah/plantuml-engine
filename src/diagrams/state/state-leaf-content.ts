/**
 * The content a leaf's kind carries beyond its text lines, measured at layout: a `kind:'json'` leaf's grid
 * (`EntityImageJson#drawU` lays it out over the box's own width, `setTotalWidth(dimTotal.getWidth())`) and a
 * `kind:'transitionLabel'` leaf's text block (snl T4, `EntityImageTransitionLabel.java:76-79`). Split out of
 * `state-sizing.ts#buildStateGeoTextFields` (500-line cap, CCN).
 */
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { Theme } from '../../core/theme.js';
import type { State } from './ast.js';
import { layoutJsonLeaf } from './state-json-layout.js';
import { measureJsonState } from './state-json-sizing.js';
import type { StateGeoTextFields } from './state-sizing.js';
import { transitionLabelBlock } from './state-transition-label-node.js';

/** The `jsonLayout` / `transitionLabel` field for `state`'s kind, or nothing. */
export function leafContentFields(
  state: State,
  theme: Theme,
  measurer: StringMeasurer,
  font: FontSpec,
): Pick<StateGeoTextFields, 'jsonLayout' | 'transitionLabel'> {
  if (state.kind === 'transitionLabel') return { transitionLabel: transitionLabelBlock(state, theme, measurer) };
  if (state.kind !== 'json') return {};
  const dim = measureJsonState(state, theme, measurer);
  return { jsonLayout: layoutJsonLeaf(state.display, state.jsonValue, dim.width, font, measurer) };
}
