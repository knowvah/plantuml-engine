/**
 * The merged styles `EntityImageDescription` and `Cluster` read for one entity (D2 of description-divergence-drive):
 * the values the flat `theme.colors.elements` tiers have no surface for, per stereotype and per symbol. The sizer and
 * the renderer read the one result this stores on the node.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageDescription.java:142-160
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:286-296,384-390
 */
import { fromString } from '../../core/decoration/symbol/USymbols.js';
import {
  mapComponentStyle,
  resolveActorStyle,
  resolvePackageStyle,
  upstreamKeyword,
} from '../../core/decoration/symbol/usymbol-resolve.js';
import type { USymbol } from '../../core/descriptive-keywords.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { Paint } from '../../core/paint.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import type { PName } from '../../core/style/PName.js';
import type { SName } from '../../core/style/SName.js';
import type { Style } from '../../core/style/Style.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { ValueNull } from '../../core/style/ValueNull.js';
import type { EntitySizing } from '../../core/svek/image/LeafSizingSubject.js';
import type { Theme } from '../../core/theme.js';
import type { DescriptiveLink, DescriptiveNode } from './ast.js';
import { rawStereotypeLabels } from './parse-helpers.js';

/** `DiagramType#getStyleName` for a description diagram. @see core/DiagramType.java:250-251 */
const STYLE_NAME: SName = 'componentDiagram';

/** The styles one entity reads; a `group` also has `cluster`. Absent wherever the builder has no answer. */
export interface DescriptionEntityStyle {
  /** `styleTitle`, EntityImageDescription.java:152-153. */
  readonly title?: Style;
  /** `style`, EntityImageDescription.java:159-160. */
  readonly body?: Style;
  /** `styleStereo`, EntityImageDescription.java:155-157. */
  readonly stereo?: Style;
  /** `Cluster#getStyle`, Cluster.java:384-390. */
  readonly cluster?: Style;
  /** `EntityImageNote#getStyleSignature`, EntityImageNote.java:188-191. */
  readonly note?: Style;
  /** `ClusterHeader#getStyle`, ClusterHeader.java:142-147: the title. */
  readonly clusterTitle?: Style;
  /** `ClusterHeader.java:226-228`: the group's stereotype labels. */
  readonly clusterStereo?: Style;
}

/** `style.value(name).asColor(set)`, as this renderer's `Paint`; `undefined` where the style has no colour value. */
export function stylePaint(style: Style | undefined, name: PName): Paint | undefined {
  if (style === undefined) return undefined;
  const value = style.value(name);
  if (value.asString() === '') return undefined;
  const color = value.asColor(HColorSet.instance());
  return color instanceof HColorSimple || color instanceof HColorGradient ? color.asPaint() : undefined;
}

/** `Style#getFontConfiguration(set)` as the renderer's and the sizer's one `FontConfiguration`. */
export function styleFont(style: Style | undefined): FontConfiguration | undefined {
  return style === undefined ? undefined : bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
}

/** `Rainbow.build`'s `HeadColor` (`Rainbow.java:85-90`): absent on a `ValueNull`, which keeps the line colour. */
export function headPaint(style: Style): Paint | undefined {
  const head = style.value('HeadColor');
  return head instanceof ValueNull ? undefined : stylePaint(style, 'HeadColor');
}

function stereotypeOf(node: DescriptiveNode): Stereotype | undefined {
  const labels = node.stereotype === undefined ? undefined : rawStereotypeLabels(node.stereotype);
  return labels === undefined || labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
}

function isUsecase(symbol: USymbol): boolean {
  return symbol === 'usecase' || symbol === 'usecase-business';
}

function symbolSNames(symbol: USymbol, theme: Theme): readonly SName[] | undefined {
  if (symbol === 'usecase-business') return ['usecase', 'business'];
  // `actor/` is `ACTOR_STICKMAN_BUSINESS` whatever the style (`USymbols.java`), whose name is `business` alone.
  if (symbol === 'actor-business') return ['business'];
  const usymbol = fromString(
    upstreamKeyword(symbol),
    resolveActorStyle(theme.actorStyle),
    mapComponentStyle(theme.componentStyle),
    resolvePackageStyle(theme),
  );
  return usymbol?.getSNames() as readonly SName[] | undefined;
}

/** `EntityImageDescription.java:142-160`, with `eventuallyOverride(colors)` left to the reader. */
export function descriptionEntityStyle(
  builder: StyleBuilder,
  node: DescriptiveNode,
  theme: Theme,
): DescriptionEntityStyle {
  if (node.symbol === 'note') {
    // `EntityImageNote.java:102,188-191`: the note signature with its stereotype, on the diagram's last builder.
    const note = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'note')
      .withTOBECHANGED(stereotypeOf(node))
      .getMergedStyle(builder);
    return note === undefined ? {} : { note };
  }
  const snames = node.archimate === true ? (['archimate'] as const) : symbolSNames(node.symbol, theme);
  if (snames === undefined) return {};
  const stereotype = stereotypeOf(node);
  const merged = (signature: StyleSignatureBasic): Style | undefined =>
    signature.withTOBECHANGED(stereotype).getMergedStyle(builder);
  const titleSNames = node.symbol === 'actor-business' ? (['actor', 'business'] as const) : snames;
  const style = merged(StyleSignatureBasic.of('root', 'element', STYLE_NAME, ...snames));
  // `EntityImageUseCase#getStyleSignature` (`EntityImageUseCase.java:202-209`) has no `title` part.
  const title = isUsecase(node.symbol)
    ? style
    : merged(StyleSignatureBasic.of('root', 'element', STYLE_NAME, ...titleSNames, 'title'));
  const stereo = StyleSignatureBasic.of('root', 'element', STYLE_NAME, ...snames, 'stereotype')
    .forStereotypeItself(stereotype)
    .getMergedStyle(builder);
  const clusterSignature = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'group', ...snames);
  const cluster = merged(clusterSignature);
  const clusterTitle = merged(StyleSignatureBasic.of('root', 'element', STYLE_NAME, ...snames, 'composite', 'title'));
  const clusterStereo = clusterSignature.forStereotypeItself(stereotype).getMergedStyle(builder);
  return {
    ...(clusterTitle === undefined ? {} : { clusterTitle }),
    ...(clusterStereo === undefined ? {} : { clusterStereo }),
    ...(title === undefined ? {} : { title }),
    ...(style === undefined ? {} : { body: style }),
    ...(stereo === undefined ? {} : { stereo }),
    ...(cluster === undefined ? {} : { cluster }),
  };
}

/** What the leaf sizer reads off {@link DescriptionEntityStyle}, narrowed to `LeafSizingSubject`. */
function entitySizing(style: DescriptionEntityStyle): EntitySizing {
  const stroke = style.title?.getStroke();
  const fontTitle = styleFont(style.title);
  const fontBody = styleFont(style.body);
  const fontStereo = styleFont(style.stereo);
  const titleAlignment = style.title?.getHorizontalAlignment();
  const stereotypeAlignment = style.stereo?.getHorizontalAlignment();
  return {
    ...(fontTitle === undefined ? {} : { fontTitle }),
    ...(fontBody === undefined ? {} : { fontBody }),
    ...(fontStereo === undefined ? {} : { fontStereo }),
    ...(titleAlignment === undefined ? {} : { titleAlignment }),
    ...(stereotypeAlignment === undefined ? {} : { stereotypeAlignment }),
    ...(stroke === undefined ? {} : { thickness: stroke.getThickness() }),
    ...(style.body === undefined
      ? {}
      : { wrapWidth: style.body.wrapWidth().getMaxWidth(), minimumWidth: style.body.value('MinimumWidth').asDouble() }),
    ...(style.title === undefined ? {} : { minimumWidthTitle: style.title.value('MinimumWidth').asDouble() }),
  };
}

/** Stores {@link descriptionEntityStyle} on every node of the tree. The AST is this render's own. */
export function annotateEntityStyles(
  nodes: readonly DescriptiveNode[],
  builderAt: (generation?: number) => StyleBuilder | undefined,
  theme: Theme,
): void {
  for (const node of nodes) {
    annotateEntityStyles(node.children, builderAt, theme);
    // `EntityImageUseCase.java:198` reads `getSkinParam().getCurrentStyleBuilder()`, the diagram's last.
    const builder = builderAt(isUsecase(node.symbol) || node.symbol === 'note' ? undefined : node.styleGeneration);
    if (builder === undefined) continue;
    const style = descriptionEntityStyle(builder, node, theme);
    node.entityStyle = style;
    node.entitySizing = entitySizing(style);
  }
}

/**
 * `getDefaultStyleDefinition(stereotype).getMergedStyle(link.getStyleBuilder())` (`SvekEdge.java:816-821,874-875`) and
 * `getStyleArrowCardinality` (`GraphvizImageBuilder.java:124-130,237`), stored on every link. `link.getStyleBuilder()` is
 * the builder current at the link's command (`CommandLinkElement.java:322`): no `isSkinParamUsed` gate, unlike an entity.
 */
export function annotateLinkStyles(
  links: readonly DescriptiveLink[],
  builderAt: (generation?: number, positional?: boolean) => StyleBuilder | undefined,
): void {
  for (const link of links) {
    const builder = builderAt(link.styleGeneration, true);
    if (builder === undefined) continue;
    const run = link.stereotypeRun ?? (link.stereotype === undefined ? undefined : `<<${link.stereotype}>>`);
    const stereotype = run === undefined ? undefined : Stereotype.build(run);
    const arrow = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow');
    const arrowStyle = arrow.withTOBECHANGED(stereotype).getMergedStyle(builder);
    if (arrowStyle !== undefined) link.arrowStyle = arrowStyle;
    const cardinality = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow', 'cardinality');
    const cardinalityStyle = cardinality.withTOBECHANGED(stereotype).getMergedStyle(builder);
    if (cardinalityStyle !== undefined) link.cardinalityStyle = cardinalityStyle;
  }
}
