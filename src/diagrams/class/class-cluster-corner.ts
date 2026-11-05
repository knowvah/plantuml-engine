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

/** Stores each group's corners on the AST; a group that collapses later copies its leaf's (`copyMutedEntityFields`). */
export function annotateClassStyles(ast: ClassDiagramAST, builder: StyleBuilder): void {
  annotateArrowStrokes(ast, builder);
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
