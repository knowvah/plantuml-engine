/**
 * `PSystemListFontsFactory` — `listfont`/`listfonts`, optionally followed by a
 * space and the sample text: the `@startuml` single-line factory for
 * {@link PSystemListFonts}, registered at `PSystemBuilder.java:148`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { singleLinePlugin } from '../../core/command/PSystemSingleLineFactory.js';
import type { SingleLineGeometry } from '../../core/command/PSystemSingleLineFactory.js';
import type { SyncPlugin } from '../../core/dispatcher.js';
import { trin } from '../../core/style/parser/StyleParser.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { PSystemListFonts } from './PSystemListFonts.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java:49 */
const LISTFONT = 'listfont';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java:49 */
const LISTFONTS = 'listfonts';

/** `line.indexOf(' ')`: a space, never a tab.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java:50,52 */
const SPACE = ' ';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java:53 */
const DEFAULT_TEXT = 'This is a test';

/** `StringUtils.goLowerCase` -- `toLowerCase(Locale.ENGLISH)`. */
function goLowerCase(s: string): string {
  return s.toLowerCase();
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java:44 */
export class PSystemListFontsFactory {
  /** `undefined` is upstream's `null`.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFontsFactory.java:46-56 */
  executeLine(source: UmlSource, line: string, preprocessing: PreprocessingArtifact): PSystemListFonts | undefined {
    const lineLower = goLowerCase(line);
    if (
      lineLower === LISTFONT ||
      lineLower === LISTFONTS ||
      lineLower.startsWith(LISTFONT + SPACE) ||
      lineLower.startsWith(LISTFONTS + SPACE)
    ) {
      const idx = line.indexOf(SPACE);
      return new PSystemListFonts(source, idx === -1 ? DEFAULT_TEXT : trin(line.substring(idx)), preprocessing);
    }
    return undefined;
  }
}

/** The factory at `PSystemBuilder.java:148`. */
export const listFontsPlugin: SyncPlugin<
  PSystemListFonts,
  SingleLineGeometry<PSystemListFonts>
> = singleLinePlugin<PSystemListFonts>({
  type: 'sequence',
  executeLine: (source, line, preprocessing) => new PSystemListFontsFactory().executeLine(source, line, preprocessing),
  render: (diagram, ctx) => ({ completeSvg: diagram.exportDiagram(0, ctx.measurer) }),
});
