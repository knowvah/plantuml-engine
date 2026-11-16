/**
 * The title alignment a usecase/actor leaf is SIZED with: the same `styleTitle.getHorizontalAlignment()` read the
 * draw makes, so the ellipse fit and the drawn lines agree.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageDescription.java:175
 */
import type { Classifier } from './ast.js';
import type { Theme } from '../../core/theme.js';
import type { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { USymbol } from '../../core/descriptive-keywords.js';
import { KEYWORD_TO_SYMBOL } from '../../core/descriptive-keywords.js';
import { titleAlignmentFor } from './renderer-usymbol-entity-style.js';

/** The `USymbol` a usecase/actor class leaf draws as (`renderer-usymbol-entity.ts#resolveSymbolKeyword`'s twin). */
function usecaseOrActorKeyword(classifier: Classifier): USymbol {
  if (classifier.kind === 'usecase' && classifier.usymbol === undefined) return 'usecase';
  const raw = classifier.usymbol;
  if (raw === undefined) return 'actor';
  return KEYWORD_TO_SYMBOL.get(raw) ?? (raw as USymbol);
}

/** `defaultAlign` of a usecase/actor leaf's `desc` (`EntityImageDescription.java:175`). */
export function usecaseOrActorAlignment(classifier: Classifier, theme: Pick<Theme, 'colors'>): HorizontalAlignment {
  return titleAlignmentFor(usecaseOrActorKeyword(classifier), theme);
}
