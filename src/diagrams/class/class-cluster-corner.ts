/**
 * The merged-style values the class engine's flat tiers have no read for (c4dd D4): a group's `RoundCorner`, and the
 * stroke of an ELK link (`MyElkEdge.java:140-145,170`).
 *
 * A group draws with `Cluster#getStyle` (`Cluster.java:385-390`), and one with nothing in it with
 * `EntityImageEmptyPackage#getStyle` (`EntityImageEmptyPackage.java:86-94`): two signatures, both on the diagram's last
 * builder. Written onto the AST once per render, so the ink finder and the renderer read one value.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:286-296
 */
import { Stereotype } from '../../core/stereo/Stereotype.js';
import type { SName } from '../../core/style/SName.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { usymbolSNames } from '../../core/style-element-scope.js';
import { linkStylesOf } from '../../core/style/style-reads.js';
import type { ClassDiagramAST } from './ast.js';
import { PACKAGE_SYMBOL } from './class-package-style.js';
import { rawStereotypeLabels } from './class-stereotype.js';

/** `ClassDiagram`'s `DiagramType.CLASS`, objects included (`DiagramType.java:241-245`; jar: `data-diagram-type="CLASS"`). */
const STYLE_NAME: SName = 'classDiagram';

function stereotypeOf(raw: string | undefined): Stereotype | undefined {
  const labels = raw === undefined ? [] : rawStereotypeLabels(raw);
  return labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
}

function corner(
  builder: StyleBuilder,
  signature: StyleSignatureBasic,
  stereotype: string | undefined,
): number | undefined {
  return signature.withTOBECHANGED(stereotypeOf(stereotype)).getMergedStyle(builder)?.value('RoundCorner').asDouble();
}

/** `Cluster.java:291,387`: `group.getUSymbol() == null ? USymbols.PACKAGE : group.getUSymbol()`. */
function clusterSignature(usymbol: string | undefined): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'group', ...usymbolSNames(usymbol ?? PACKAGE_SYMBOL));
}

/** `EntityImageEmptyPackage.java:88`. */
const EMPTY_PACKAGE_SIGNATURE = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'package_', 'title');

/**
 * `ClusterHeader#getSignature` (`ClusterHeader.java:151-163`) for a class group: `COMPOSITE_TITLE.add(sname)
 * .addSNames(uSymbol.getSNames())` with a USymbol, else `PACKAGE_TITLE.add(sname)` (every class group is a
 * `GroupType.PACKAGE`).
 */
function titleSignature(usymbol: string | undefined): StyleSignatureBasic {
  if (usymbol === undefined) return EMPTY_PACKAGE_SIGNATURE;
  return StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'composite', 'title', ...usymbolSNames(usymbol));
}

/** `style.wrapWidth()`'s width (`Style.java:330-333`), `undefined` when none is set or no style merges. */
function wrapWidth(
  builder: StyleBuilder,
  signature: StyleSignatureBasic,
  stereotype: string | undefined,
): number | undefined {
  const width = signature.withTOBECHANGED(stereotypeOf(stereotype)).getMergedStyle(builder)?.wrapWidth().getMaxWidth();
  return width === 0 ? undefined : width;
}

/**
 * The title wrap widths of 927f7531ddf (`ClusterHeader.java:129`, a cluster title) and f29aa9bd058
 * (`EntityImageEmptyPackage.java:118-119`, the leaf an empty group mutes to): both `create9(..., style.wrapWidth())`.
 */
function annotateTitleWrapWidths(ast: ClassDiagramAST, builder: StyleBuilder): void {
  for (const ns of ast.namespaces) {
    const title = wrapWidth(builder, titleSignature(ns.usymbol), ns.stereotype);
    if (title !== undefined) ns.titleWrapWidth = title;
    const leaf = wrapWidth(builder, EMPTY_PACKAGE_SIGNATURE, ns.stereotype);
    if (leaf !== undefined) ns.emptyLeafTitleWrapWidth = leaf;
  }
  for (const classifier of ast.classifiers) {
    if (classifier.collapsedGroup !== true) continue;
    const leaf = wrapWidth(builder, EMPTY_PACKAGE_SIGNATURE, classifier.stereotype);
    if (leaf !== undefined) classifier.emptyLeafTitleWrapWidth = leaf;
  }
}

/** `MyElkEdge#getStyle` (`MyElkEdge.java:140-145`), with the link's own stereotype. */
function annotateArrowStrokes(ast: ClassDiagramAST, builder: StyleBuilder): void {
  const signature = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow');
  for (const rel of ast.relationships) {
    const tags = rel.stereotypeTags ?? [];
    const stereotype = tags.length === 0 ? undefined : Stereotype.build(tags.map((tag) => `<<${tag}>>`).join(''));
    const stroke = signature.withTOBECHANGED(stereotype).getMergedStyle(builder)?.getStroke();
    if (stroke !== undefined) rel.arrowStroke = stroke;
  }
}

/**
 * `Link#getStyleBuilder` (`Link.java:93,130`): the builder current at the link's own command (`CommandLinkClass.java:355`
 * hands `getCurrentStyleBuilder()` to `new Link(...)`), read by `SvekEdge.java:816-821,874-876` for the arrow's line
 * colour, thickness and label font. Stored on a link only where a declaration lies AFTER it (`builderAt` answers
 * `undefined` otherwise): every other link reads the diagram's last builder, which the flat theme tiers already hold.
 */
export function annotateLinkStyles(
  ast: ClassDiagramAST,
  builderAt: (position: number) => StyleBuilder | undefined,
): void {
  for (const rel of ast.relationships) {
    if (rel.sourceLine === undefined) continue;
    const builder = builderAt(rel.sourceLine);
    if (builder === undefined) continue;
    const tags = rel.stereotypeTags ?? [];
    const stereotype = tags.length === 0 ? undefined : Stereotype.build(tags.map((tag) => `<<${tag}>>`).join(''));
    const { arrowStyle } = linkStylesOf(builder, stereotype, STYLE_NAME);
    if (arrowStyle !== undefined) rel.arrowStyle = arrowStyle;
  }
}

/** Stores each group's corners and title wrap widths on the AST; a group that collapses later copies its leaf's (`copyMutedEntityFields`). */
export function annotateClassStyles(ast: ClassDiagramAST, builder: StyleBuilder): void {
  annotateArrowStrokes(ast, builder);
  annotateTitleWrapWidths(ast, builder);
  for (const ns of ast.namespaces) {
    const cluster = corner(builder, clusterSignature(ns.usymbol), ns.stereotype);
    if (cluster !== undefined) ns.roundCorner = cluster;
    const leaf = corner(builder, EMPTY_PACKAGE_SIGNATURE, ns.stereotype);
    if (leaf !== undefined) ns.emptyLeafRoundCorner = leaf;
  }
  for (const classifier of ast.classifiers) {
    if (classifier.collapsedGroup !== true) continue;
    const leaf = corner(builder, EMPTY_PACKAGE_SIGNATURE, classifier.stereotype);
    if (leaf !== undefined) classifier.emptyLeafRoundCorner = leaf;
  }
}
