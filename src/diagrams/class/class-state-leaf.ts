/**
 * A `state` leaf in a class document (`allow_mixing`). `CommandCreateElementFull2.java:239-241` gives `LeafType.STATE`,
 * and `GeneralImageBuilder.java:130-143` returns the image the state engine draws, so this hands the leaf to that
 * engine's sizer and draw instead of keeping a second formula (D7).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GeneralImageBuilder.java:130-143
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageState.java:84-125
 */
import type { StringMeasurer } from '../../core/measurer.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { withDeferredFormat } from '../../core/svg-format.js';
import type { Theme } from '../../core/theme.js';
import { scaleActivityBody } from '../../core/TextBlockExporter.js';
import { stateShadowFilterUrl } from '../state/state-shadow.js';
import { renderNormal, renderSdlReceive } from '../state/renderer-box.js';
import type { State } from '../state/ast.js';
import type { StateNodeGeo } from '../state/state-geo-types.js';
import { buildStateGeoTextFields, measureState, type StateGeoTextFields } from '../state/state-sizing.js';
import type { Classifier } from './ast.js';
import { rawStereotypeLabels, splitStereotypeLabels } from './class-stereotype.js';
import type { ScaledTheme } from './class-scale-geo.js';
import { classShadowFilterUrl } from './class-shadow.js';
import { formatMemberText, type MeasuredClassifier } from './class-layout-helpers.js';
import type { ClassifierGeo } from './layout.js';

/** `EntityImageState2` is taken on this exact label (`GeneralImageBuilder.java:138-140`). */
const SDL_RECEIVE = 'sdlreceive';

function stateOf(classifier: Classifier): State {
  const description = classifier.members.map((member) => formatMemberText(member, true));
  const [stereotype] = classifier.stereotype === undefined ? [] : splitStereotypeLabels(classifier.stereotype);
  return {
    id: classifier.id,
    display: classifier.display,
    kind: 'normal',
    children: [],
    concurrentRegions: [],
    transitions: [],
    ...(description.length > 0 ? { description } : {}),
    ...(stereotype !== undefined ? { stereotype } : {}),
    ...(classifier.color !== undefined ? { color: classifier.color } : {}),
  };
}

/** `EntityImageState#calculateDimensionSlow` through the state sizer. Its `ULine.hline(width)` reaches `x + w`
 *  (`EntityImageState.java:162`, `LimitFinder.java:179-182`); the rect stops at `y + h - 1`. */
export function measureStateLeaf(classifier: Classifier, theme: Theme, measurer: StringMeasurer): MeasuredClassifier {
  const state = stateOf(classifier);
  const measured = measureState(state, false, theme, measurer, 'TB');
  return {
    width: measured.width,
    height: measured.height,
    rows: [],
    dividerYs: [],
    bodyInkWidth: measured.width,
    bodyInkHeight: 0,
    stateLeaf: buildStateGeoTextFields(state, theme, measurer),
  };
}

/** `EntityImageState2` opens no group (`EntityImageState2.java:88-105`), so its shapes sit in the document's. */
export function stateLeafDrawsNoGroup(fields: StateGeoTextFields): boolean {
  return fields.stereotype?.toLowerCase() === SDL_RECEIVE;
}

/**
 * The state engine's draw of a leaf this engine laid out. It reads a document that scales once at export
 * (`withDeferredFormat`), so a class document's scale goes through that same pass, on this one fragment. Its style is
 * `EntityImageStateCommon`'s (`STYLE`), never the class diagram's: {@link annotateStateLeafStyles}.
 */
export function renderStateLeaf(geo: ClassifierGeo, fields: StateGeoTextFields, theme: ScaledTheme): string {
  const k = theme.scaleK;
  const roundCorner = geo.stateRoundCorner;
  const unscaled: Theme = {
    ...theme,
    fontSize: theme.fontSize / k,
    colors:
      roundCorner === undefined
        ? theme.colors
        : { ...theme.colors, graph: { ...theme.colors.graph, stateRoundCorner: roundCorner } },
  };
  const node: StateNodeGeo = {
    id: geo.id,
    kind: 'normal',
    display: fields.headerLines?.map((line) => line.text).join('\n') ?? geo.id,
    x: geo.x / k,
    y: geo.y / k,
    width: geo.width / k,
    height: geo.height / k,
    children: [],
    transitions: [],
    ...fields,
    ...(geo.shadowing !== undefined ? { shadowing: geo.shadowing / k } : {}),
  };
  const draw = (): string =>
    stateLeafDrawsNoGroup(fields) ? renderSdlReceive(node, unscaled) : renderNormal(node, unscaled);
  const body = k === 1 ? draw() : scaleActivityBody(withDeferredFormat(true, draw), k);
  return body.replaceAll(stateShadowFilterUrl(), classShadowFilterUrl());
}

/** `EntityImageStateCommon.java:61-62`: `root, element, stateDiagram, state`, with the leaf's stereotype. */
const STATE_STYLE = StyleSignatureBasic.of('root', 'element', 'stateDiagram', 'state');
const SDL_STYLE = StyleSignatureBasic.of('root', 'element', 'classDiagram', 'state');

/** The two merged values the state draw reads off its theme: the corner, and the shadow its `getShape` sets. */
export function annotateStateLeafStyles(classifiers: readonly Classifier[], builder: StyleBuilder): void {
  for (const classifier of classifiers) {
    if (classifier.kind !== 'state') continue;
    const labels = classifier.stereotype === undefined ? [] : rawStereotypeLabels(classifier.stereotype);
    const stereotype = labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
    // `EntityImageState2` reads `getStyleName()`'s diagram (`EntityImageState2.java:83-90`), with no stereotype.
    const sdl = labels.join('').toLowerCase() === `<<${SDL_RECEIVE}>>`;
    const style = sdl
      ? SDL_STYLE.getMergedStyle(builder)
      : STATE_STYLE.withTOBECHANGED(stereotype).getMergedStyle(builder);
    if (style === undefined) continue;
    classifier.stateRoundCorner = style.value('RoundCorner').asDouble();
    classifier.stateShadowing = style.getShadowing();
  }
}
