/**
 * `PSystemKeycheck` — the `keycheck <sig> <key>` and `keycheck <key>` page: a
 * black-on-white `GraphicStrings` block under the header the key tools share.
 *
 * Upstream decodes the key (`PLSSignature.retrieveNamed(sig, key, false)` or
 * `LicenseInfo.retrieveDistributorOrNamed(key)`) and prints the licence it
 * finds. This port decodes no key (vkt D3: a PlantUML Professional Edition
 * licence means nothing for an MIT library, and a named key is bound to a host
 * name and MAC addresses a browser cannot read), so the licence is NONE for
 * both forms and line 5 says no key was checked (#182 ruling 1, vkt D5;
 * DIVERGENCES.md "Key tools and `testdot` describe plantuml-engine").
 *
 * Upstream's private no-argument `getTextBlock()` (java:99-116) would collide
 * with `UgDiagram#getTextBlock(num, stringBounder)`; it is the module function
 * {@link getTextBlock}, taking the signature and key it reads, as
 * `PSystemLicense.ts` does.
 *
 * Not ported, because no path in this build reaches it (vkt D3):
 * - `addDetails` (java:118-125): called only for a non-NONE licence;
 * - `drawFlash` (java:138-): private and never called upstream either.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { GraphicStrings } from '../../core/klimt/shape/GraphicStrings.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { UgSimpleDiagram } from '../../core/UgSimpleDiagram.js';
import { COMPILE_TIME_STRING, versionString } from '../../core/version.js';
import { License } from './License.js';
import { LicenseInfo } from './LicenseInfo.js';

/** `DiagramDescription("(Key)")`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:91 */
const DESCRIPTION = '(Key)';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:110 */
const BLANK = ' ';

/**
 * `<b>PlantUML version ` + `Version.versionString()` + `</b> (` +
 * `Version.compileTimeString()` + `)`, the licence line and a blank, with this
 * port's name as `getAuthorsStrings` writes it (user ruling 2026-10-08). A
 * copy of `PSystemKeygen`'s, as upstream's is.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:127-136
 */
function header(): string[] {
  return [
    `<b>plantuml-engine version ${versionString()}</b> (${COMPILE_TIME_STRING})`,
    `(${License.getCurrent().toString()} source distribution)`,
    BLANK,
  ];
}

/**
 * The header, the provided-licence title, `addLicenseInfo` (nothing for NONE,
 * kept where a licence source would put its fields), then line 5 and a blank.
 * `info` is NONE for both forms because no key is decoded (java:102-103, vkt
 * D3), so the `isNone()` arm (java:106-107) is the one taken; its jar text
 * names a machine-bound PlantUML licence, and this port says what is true
 * (vkt D5). The `try`/`catch` (java:101, :111-114) guards the decode this port
 * does not perform, so it has no counterpart.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:99-116
 */
export function getTextBlock(_sig: string | undefined, _key: string): TextBlock {
  const strings = header();
  const info = LicenseInfo.NONE;
  strings.push('<u>Provided license information</u>:');
  License.addLicenseInfo(strings, info);
  strings.push('No license key was checked: plantuml-engine reads none.');
  strings.push(BLANK);
  return GraphicStrings.createBlackOnWhite(strings);
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:61 */
export class PSystemKeycheck extends UgSimpleDiagram {
  /**
   * Upstream overloads the constructor by arity: `(source, sig, key, ...)`
   * (java:66-70) and the one-key `(source, key, ...)` (java:76-78), which
   * passes `sig = null`. TS cannot overload constructors by arity, so this is
   * the four-argument form and the one-key form passes `undefined`.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:66-78
   */
  constructor(
    source: UmlSource,
    private readonly sig: string | undefined,
    private readonly key: string,
    preprocessing: PreprocessingArtifact,
  ) {
    super(source, preprocessing);
  }

  /** The `try`/`catch` around the draw (java:82-86) guards the decode this
   *  port does not perform.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:80-88 */
  drawU(ug: UGraphic): void {
    getTextBlock(this.sig, this.key).drawU(ug);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:90-92 */
  getDescription(): string {
    return DESCRIPTION;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeycheck.java:94-97 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return getTextBlock(this.sig, this.key).calculateDimension(stringBounder);
  }
}
