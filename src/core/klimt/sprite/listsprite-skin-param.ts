/**
 * `ListSpriteDiagram`'s `SkinParam`: `TitledDiagram`'s `SkinParam.create(...)` (TitledDiagram.java:107), the slice
 * the sprite page and its export read — the sprites, the colour set, the current style builder, `handwritten`,
 * `monochrome`/`mode`/`reversecolor`, `dpi`, `lengthAdjust`, and the creole `sheet` the sprite names are set in.
 *
 * **The class is ebnf's**, re-exported as `regex/regex-skin-param.ts` re-exports it: upstream hands every
 * `TitledDiagram` the same `skin/SkinParam`, and ebnf's slice already answers every member this diagram reaches
 * (lsp D1, cut to what `ListSpriteDiagram` reads: no tile style is frozen here, upstream's constructor builds none).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:104-112
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java
 */
export { SkinParam, type SkinParamSource } from '../../../diagrams/ebnf/ebnf-skin-param.js';
