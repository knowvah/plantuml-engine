/**
 * `PSystemListFonts` — `listfonts`: a 16-pt bold header, a blank line, then one
 * line per host font family, each naming the family and drawing `text` in it.
 * The host list is {@link availableFontFamilyNames} (ruling #169: none in a
 * browser-safe library), so the page is the two header lines.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java
 */
import { availableFontFamilyNames } from '../../core/available-font-family-names.js';
import type { UmlSource } from '../../core/block-extractor.js';
import { PlainStringsDiagram } from '../../core/PlainStringsDiagram.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:50 */
const HEADER = '   <b><size:16>Fonts available:';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:51 */
const BLANK = ' ';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:60 */
const DESCRIPTION = '(List fonts)';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:46 */
export class PSystemListFonts extends PlainStringsDiagram {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:47-56 */
  constructor(source: UmlSource, text: string, preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
    this.strings.push(HEADER);
    this.strings.push(BLANK);
    const name = availableFontFamilyNames();
    for (const n of name) this.strings.push(`${n} : <font:${n}>${text}`);
  }

  /** `DiagramDescription` reduced to its text.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:59-61 */
  getDescription(): string {
    return DESCRIPTION;
  }
}
