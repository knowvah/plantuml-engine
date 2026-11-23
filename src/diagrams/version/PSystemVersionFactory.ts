/**
 * `PSystemVersionFactory` — `about`/`authors`/`author`, `version`, bare
 * `stdlib`, `testdot`, `keydistributor`, `keygen`, `keyimport [key]` and both
 * `keycheck` forms (the one-argument one of upstream 3a4d1675141 among them)
 * as single-line `@startuml` pages, through the ported
 * `PSystemSingleLineFactory` gate (`singleLinePlugin`, decisions.md D2/D3):
 * every regex upstream's factory matches. Registration in `src/index.ts` is
 * T2a's (`PSystemBuilder.java:144-152` position). The key pages say what is
 * true for this port (#182, 2026-11-13; DIVERGENCES.md "Key tools and
 * `testdot` describe plantuml-engine").
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { singleLinePlugin } from '../../core/command/PSystemSingleLineFactory.js';
import type { RenderContext, SingleLineGeometry } from '../../core/command/PSystemSingleLineFactory.js';
import type { CompleteSvg, SyncPlugin } from '../../core/dispatcher.js';
import { javaTrim } from '../../core/java-number-format.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { PSystemKeycheck } from './PSystemKeycheck.js';
import { PSystemKeygen } from './PSystemKeygen.js';
import { PSystemVersion } from './PSystemVersion.js';

/** Java's `\s` without `UNICODE_CHARACTER_CLASS`; `matches` anchors the line,
 *  and `(?i)` folds ASCII only, as JS's non-unicode `i` does here. */
const JAVA_SPACES = '[ \\t\\n\\x0B\\f\\r]*$';

/** `(?i)^(authors?|about)\\s*$`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:52 */
const AUTHORS = new RegExp(`^(authors?|about)${JAVA_SPACES}`, 'i');

/** `(?i)^version\\s*$`: the page prints this port's own values (decisions.md D14).
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:55 */
const VERSION = new RegExp(`^version${JAVA_SPACES}`, 'i');

/** `(?i)^stdlib\\s*$`, inside `if (!TeaVM.isTeaVM())` (java:58): the port
 *  mirrors the JVM jar.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:59 */
const STDLIB = new RegExp(`^stdlib${JAVA_SPACES}`, 'i');

/** `(?i)^testdot\\s*$`: this port's engine and its version (#182 rulings 2-4).
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:62 */
const TESTDOT = new RegExp(`^testdot${JAVA_SPACES}`, 'i');

/** `(?i)^keydistributor\\s*$`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:65 */
const KEYDISTRIBUTOR = new RegExp(`^keydistributor${JAVA_SPACES}`, 'i');

/** Java's `\\s+` inside the key-tool groups. */
const JAVA_SPACES_1 = '[ \\t\\n\\x0B\\f\\r]+';

/** `(?i)^keygen\\s*$`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:68 */
const KEYGEN = new RegExp(`^keygen${JAVA_SPACES}`, 'i');

/** `(?i)^keyimport(\\s+[0-9a-z]+)?\\s*$`: Java's `\s` in the group too.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:72 */
const KEYIMPORT = new RegExp(`^keyimport(${JAVA_SPACES_1}[0-9a-z]+)?${JAVA_SPACES}`, 'i');

/** `"keyimport".length()`: the key is what follows the command word.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:74 */
const KEYIMPORT_WORD = 'keyimport';

/** `(?i)^keycheck\\s+([0-9a-z]+)\\s+([0-9a-z]+)\\s*$`: the signature, then the key.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:77-78 */
const KEYCHECK_SIG_KEY = new RegExp(
  `^keycheck${JAVA_SPACES_1}([0-9a-z]+)${JAVA_SPACES_1}([0-9a-z]+)${JAVA_SPACES}`,
  'i',
);

/** `(?i)^keycheck\\s+[0-9a-z]+\\s*$`: the key alone (upstream 3a4d1675141).
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:84 */
const KEYCHECK_KEY = new RegExp(`^keycheck${JAVA_SPACES_1}[0-9a-z]+${JAVA_SPACES}`, 'i');

/** `"keycheck".length()`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:85 */
const KEYCHECK_WORD = 'keycheck';

/** What the factory builds: the version pages and the key pages. */
export type VersionFamilyDiagram = PSystemVersion | PSystemKeygen | PSystemKeycheck;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:47 */
export class PSystemVersionFactory {
  /**
   * The line arrives untrimmed (`PSystemSingleLineFactory.java:95`). The
   * `catch (Exception e)` (java:89-92) guards factory methods that cannot
   * throw here.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:49-94
   */
  executeLine(source: UmlSource, line: string, preprocessing: PreprocessingArtifact): VersionFamilyDiagram | undefined {
    if (AUTHORS.test(line)) return PSystemVersion.createShowAuthors(source, preprocessing);
    if (VERSION.test(line)) return PSystemVersion.createShowVersion(source, preprocessing);
    if (STDLIB.test(line)) return PSystemVersion.createStdLib(source, preprocessing);
    if (TESTDOT.test(line)) return PSystemVersion.createTestDot(source, preprocessing);
    if (KEYDISTRIBUTOR.test(line)) return PSystemVersion.createKeyDistributor(source, preprocessing);
    return this.executeKeyLine(source, line, preprocessing);
  }

  /**
   * The key-tool arms, split from {@link executeLine} for the complexity cap.
   * `keygen`'s `line = line.trim()` (java:69) is never read again.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersionFactory.java:68-87
   */
  private executeKeyLine(
    source: UmlSource,
    line: string,
    preprocessing: PreprocessingArtifact,
  ): VersionFamilyDiagram | undefined {
    if (KEYGEN.test(line)) return new PSystemKeygen(source, '', preprocessing);
    if (KEYIMPORT.test(line)) {
      const key = javaTrim(javaTrim(line).substring(KEYIMPORT_WORD.length));
      return new PSystemKeygen(source, key, preprocessing);
    }
    // java:78-81 compiles the same pattern again and reads its groups;
    // `find()` on a matching line always succeeds.
    const sigKey = KEYCHECK_SIG_KEY.exec(line);
    if (sigKey !== null) {
      const [, sig = '', key = ''] = sigKey;
      return new PSystemKeycheck(source, sig, key, preprocessing);
    }
    if (KEYCHECK_KEY.test(line)) {
      const key = javaTrim(javaTrim(line).substring(KEYCHECK_WORD.length));
      return new PSystemKeycheck(source, undefined, key, preprocessing);
    }
    return undefined;
  }
}

const factory = new PSystemVersionFactory();

/** The version-family page plugin; `UgDiagram#exportDiagram` is the whole render. */
export const versionPlugin: SyncPlugin<
  VersionFamilyDiagram,
  SingleLineGeometry<VersionFamilyDiagram>
> = singleLinePlugin<VersionFamilyDiagram>({
  type: 'sequence',
  executeLine: (source, line, preprocessing) => factory.executeLine(source, line, preprocessing),
  render: (diagram: VersionFamilyDiagram, ctx: RenderContext): CompleteSvg => ({
    completeSvg: diagram.exportDiagram(0, ctx.measurer),
  }),
});
