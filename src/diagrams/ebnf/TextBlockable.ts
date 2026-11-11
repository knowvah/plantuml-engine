/**
 * `TextBlockable`: what `PSystemEbnf` draws one entry through — a rule (`EbnfExpression`) or a note.
 * `ISkinParam` is the EBNF engine's skin slice.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/TextBlockable.java:42-46
 */
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { SkinParam } from './ebnf-skin-param.js';

export interface TextBlockable {
  /** @see TextBlockable.java:44 */
  getUDrawable(skinParam: SkinParam, preprocessing: PreprocessingArtifact): TextBlock;
}
