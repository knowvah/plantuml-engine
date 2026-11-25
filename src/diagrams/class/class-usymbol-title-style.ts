/**
 * The `styleTitle` a class diagram's description leaf reads (cuts D1, #195). `GeneralImageBuilder` builds
 * `EntityImageDescription` for `CIRCLE`, `DESCRIPTION`, `USECASE` and `USECASE_BUSINESS` whatever the diagram, whose
 * line colour, fill, shadow and stroke (and so its size) come from `styleTitle`:
 * `{root, element, classDiagram, <symbol SNames>, title}` with the stereotype, merged on the entity's own builder. The
 * style is stamped on each classifier inside `layoutSync`, never kept in module state: a nested `{{ }}` class render
 * re-enters `layoutSync` (decisions.md D1, "Trap").
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GeneralImageBuilder.java:162-180
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageDescription.java:142-177
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Entity.java:760-772
 */
import { KEYWORD_TO_SYMBOL, type USymbol } from '../../core/descriptive-keywords.js';
import { symbolSNames } from '../../core/decoration/symbol/usymbol-resolve.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import type { SName } from '../../core/style/SName.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { Theme } from '../../core/theme.js';
import type { Classifier } from './ast.js';
import { rawStereotypeLabels } from './class-stereotype.js';

/** `DiagramType#getStyleName` for a class diagram. @see core/DiagramType.java */
const STYLE_NAME: SName = 'classDiagram';

/** What a classifier and its geometry share for the `EntityImageDescription` gate. */
type USymbolLeaf = Pick<Classifier, 'kind' | 'usymbol'>;

/**
 * Whether the class engine draws this leaf through `EntityImageDescription` (`GeneralImageBuilder.java:162-180`):
 * every usecase and circle, and every `descriptive` leaf but a port (`EntityImagePort`, `GeneralImageBuilder.java
 * :122-127`). `renderer-usymbol-entity.ts#usesClassUSymbolEntity` documents each widening.
 */
export function isClassUSymbolEntity(leaf: USymbolLeaf): boolean {
  if (leaf.kind === 'usecase' || leaf.kind === 'circle') return true;
  if (leaf.kind !== 'descriptive' || leaf.usymbol === undefined) return false;
  return KEYWORD_TO_SYMBOL.get(leaf.usymbol) !== 'port';
}

/**
 * The leaf's `USymbol` (`Entity#getUSymbol`, `Entity.java:413-423`); `renderer-usymbol-entity.ts
 * #resolveSymbolKeyword` documents the raw-keyword normalisation.
 */
export function classUSymbolKeyword(leaf: USymbolLeaf): USymbol {
  if (leaf.kind === 'usecase' && leaf.usymbol === undefined) return 'usecase';
  if (leaf.kind === 'circle') return 'circle';
  const raw = leaf.usymbol;
  if (raw === undefined) return 'actor';
  return KEYWORD_TO_SYMBOL.get(raw) ?? (raw as USymbol);
}

/**
 * `queryTitle` (`EntityImageDescription.java:142-147`): `ACTOR_BUSINESS_TITLE` for `actor/`
 * (`StyleQueries.java`: `{root, element, actor, business}` plus the diagram), else the symbol's SNames plus `title`.
 */
function titleSNames(symbol: USymbol, theme: Theme): readonly SName[] | undefined {
  if (symbol === 'actor-business') return ['actor', 'business', 'title'];
  const snames = symbolSNames(symbol, theme);
  return snames === undefined ? undefined : [...snames, 'title'];
}

/**
 * Stamps `styleTitle` (`EntityImageDescription.java:148-151`) on every classifier the class engine draws through
 * `EntityImageDescription`. `eventuallyOverride(colors)` is left to the readers, which put the inline colours first.
 * `builderAt(classifier.styleGeneration)` answers `getEntity().getCurrentStyleBuilder()` (`Entity.java:760-772`).
 */
export function annotateUSymbolTitleStyles(
  classifiers: readonly Classifier[],
  builderAt: (generation?: number) => StyleBuilder | undefined,
  theme: Theme,
): void {
  for (const classifier of classifiers) {
    if (!isClassUSymbolEntity(classifier)) continue;
    const snames = titleSNames(classUSymbolKeyword(classifier), theme);
    const builder = builderAt(classifier.styleGeneration);
    if (snames === undefined || builder === undefined) continue;
    const labels = classifier.stereotype === undefined ? [] : rawStereotypeLabels(classifier.stereotype);
    const stereotype = labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
    const style = StyleSignatureBasic.of('root', 'element', STYLE_NAME, ...snames)
      .withTOBECHANGED(stereotype)
      .getMergedStyle(builder);
    if (style !== undefined) classifier.usymbolTitleStyle = style;
  }
}

/**
 * The stamped `styleTitle` stroke as the leaf sizer's `entitySizing.thickness`: `EntityImageDescription` sizes and
 * draws through the `Fashion` built from `styleTitle.getStroke(colors)` (`EntityImageDescription.java:168,177`), so
 * the box and an actor's ink grow with `LineThickness`. Empty for an unstamped leaf (no builder).
 */
export function titleStrokeSizing(classifier: Pick<Classifier, 'usymbolTitleStyle'>): { thickness?: number } {
  const stroke = classifier.usymbolTitleStyle?.getStroke();
  return stroke === undefined ? {} : { thickness: stroke.getThickness() };
}
