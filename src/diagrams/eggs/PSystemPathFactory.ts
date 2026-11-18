/**
 * `PSystemPathFactory` — `path <motif>`, registered only under
 * `SecurityProfile.INSECURE` (`PSystemBuilder.java:178-179`; ipe D1). Under
 * every other profile the registry skips it, so the source is a syntax error,
 * as when upstream never adds the factory.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPathFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { singleLinePlugin } from '../../core/command/PSystemSingleLineFactory.js';
import type { SingleLineGeometry } from '../../core/command/PSystemSingleLineFactory.js';
import type { SyncPlugin } from '../../core/dispatcher.js';
import { SecurityProfile } from '../../core/security/SecurityProfile.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { PSystemPath } from './PSystemPath.js';

/**
 * `Pattern2.cmpile("^path[%s]+([0-9A-Za-z]+)$")`, compiled `CASE_INSENSITIVE`
 * (`Pattern2.java:114`). `%s` is `\s` plus U+00A0 (`Pattern2.java:56`), and
 * Java's `\s` is `[ \t\n\x0B\f\r]`, spelled out. The `i` flag without `u` folds
 * ASCII only, as Java's `CASE_INSENSITIVE` without `UNICODE_CASE` does; the
 * port's `compileInternal` uses `iu`, which would also let `ſ` match `s`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPathFactory.java:49
 */
const PATTERN = /^path[ \t\n\x0B\f\r ]+([0-9A-Za-z]+)$/i;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPathFactory.java:45 */
export class PSystemPathFactory {
  /** `undefined` is upstream's `null`. The motif is checked at export, not here (`GraphicsPath.java:80`).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemPathFactory.java:51-58 */
  executeLine(source: UmlSource, line: string, preprocessing: PreprocessingArtifact): PSystemPath | undefined {
    const m = PATTERN.exec(line);
    if (m === null) return undefined;

    return new PSystemPath(source, m[1]!, preprocessing);
  }
}

/** The factory at `PSystemBuilder.java:178-179`, added only under INSECURE. */
export const pathPlugin: SyncPlugin<PSystemPath, SingleLineGeometry<PSystemPath>> = singleLinePlugin<PSystemPath>({
  type: 'sequence',
  registeredOnlyUnder: SecurityProfile.INSECURE,
  executeLine: (source, line, preprocessing) => new PSystemPathFactory().executeLine(source, line, preprocessing),
  render: (diagram, ctx) => ({ completeSvg: diagram.exportDiagram(0, ctx.measurer) }),
});
