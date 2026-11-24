/**
 * `License` — the text the `license` page prints (`PSystemLicense`) and the
 * licence name `about`/`version` quote.
 *
 * Upstream's build pre-processes this file per edition (`// ::comment when
 * __MIT__ ...` / `// ::uncomment when __MIT__`). The port mirrors the MIT
 * edition (D13): `toString` is "MIT" (java:66-68), and `end3` drops the GPL
 * paragraph (java:156-169, `::comment when __MIT__`) for `addMit`
 * (java:171-173, :241-265). The oracle jar is the GPL edition, so its
 * `license`/`about` probes print the GPL name and paragraph where this port
 * prints MIT's. The other editions' paragraphs (`addEpl`, `addBsd`,
 * `addApache`, `addLgpl`, `addGplv2`, java:267-372) stay commented out in the
 * MIT edition and are not ported.
 *
 * The page text describes this distribution, plantuml-engine, not the jar's
 * (user ruling 2026-11-12, #179; `DIVERGENCES.md`): seven blocks of upstream's
 * `header1`/`header2`/`end3`/`addMit` print the ruling's lines, each table
 * cited to the ruling item and the upstream lines it replaces. Upstream's
 * structure stays: the four methods, the order of their additions, the
 * Professional Edition branch and the statistics branch.
 *
 * Long runs of `text.add(...)` are module-level line tables, each cited to its
 * java lines (the complexity hook's 30-NLOC cap); the order of additions is
 * upstream's.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java
 */
import type { LicenseInfo } from './LicenseInfo.js';
import { retrieveQuick } from './LicenseInfo.js';
import { LicenseType } from './LicenseType.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:67 */
const MIT = 'MIT';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:115 */
const RULE = '+=======================================================================';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:116 */
const BAR = '| ';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:132 */
const BLANK = ' ';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:380 */
const BAR_WIDE = '|  ';

/** The free header's name line. Ruling 2026-11-12 item 1; replaces
 *  `"| PlantUML : a free UML diagram generator"`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:117 */
const FREE_NAME = '|      plantuml-engine : a TypeScript port of PlantUML';

/** The copyright and project-info lines, blanks included. Ruling 2026-11-12
 *  item 1; replaces `(C) Copyright 2009-2027, Arnaud Roques` and
 *  `Project Info:  https://plantuml.com`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:132-136 */
const COPYRIGHT_AND_PROJECT = [
  BLANK,
  '(C) Copyright 2026, Scott Seely',
  'Ported from PlantUML, (C) Copyright 2009-2024, Arnaud Roques',
  BLANK,
  'Project Info:  https://github.com/knowvah/plantuml-engine',
  'PlantUML:      https://plantuml.com',
  BLANK,
] as const;

/** `addMit`'s paragraph, the MIT edition's `end3` opening (java:171-173).
 *  The first line names plantuml-engine (ruling 2026-11-12 item 3; replaces
 *  java:243); the rest is upstream's and matches our `LICENSE`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:243-263 */
const MIT_TEXT = [
  'plantuml-engine is free software; you can redistribute it and/or modify it',
  'under the terms of the MIT License.',
  BLANK,
  'See http://opensource.org/licenses/MIT',
  BLANK,
  'Permission is hereby granted, free of charge, to any person obtaining',
  'a copy of this software and associated documentation files (the "Software"),',
  'to deal in the Software without restriction, including without limitation',
  'the rights to use, copy, modify, merge, publish, distribute, sublicense,',
  'and/or sell copies of the Software, and to permit persons to whom the',
  'Software is furnished to do so, subject to the following conditions:',
  BLANK,
  'The above copyright notice and this permission notice shall be included',
  'in all copies or substantial portions of the Software.',
  BLANK,
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS',
  'OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
  'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
  'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,',
  'WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR',
  'IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
] as const;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:208-210 */
const EXCEPTION = [
  'There is an exception : if the textual description in PlantUML language is also covered',
  'by any license, then the generated images are logically covered',
  'by the very same license.',
] as const;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:213-215 */
const STATS = [
  BLANK,
  'This version of PlantUML records general local statistics about usage.',
  '(more info on https://plantuml.com/statistics-report)',
] as const;

/** Ruling 2026-11-12 item 6: neither upstream arm is true (we bundle and
 *  install no GraphViz). Replaces both `isThereArchive` arms and the
 *  `(see https://plantuml.com/graphviz-dot )` line; the second line keeps
 *  upstream's leading space (java:220).
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:218-225 */
const GRAPHVIZ = [
  'This distribution does not bundle or install GraphViz: layout uses',
  ' @knowvah/dot-engine, a TypeScript port of GraphViz dot (EPL-2.0).',
  '(see https://dot-engine.knowvah.com/ )',
] as const;

/** Ruling 2026-11-12 item 7: upstream's credits in its order, minus
 *  CafeUndZopfli and Brotli (java:233-234, not shipped), plus KaTeX, pako and
 *  xmldom after Twemoji. The ruling's elk-engine line is omitted until
 *  `@knowvah/elk-engine` replaces `elkjs` (the ruling's own condition; #282).
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:226-237 */
const CREDITS = [
  BLANK,
  'Icons provided by OpenIconic :  https://useiconic.com/open',
  'Archimate sprites provided by Archi :  http://www.archimatetool.com',
  'Stdlib AWS provided by https://github.com/milo-minderbinder/AWS-PlantUML',
  'Stdlib Icons provided https://github.com/tupadr3/plantuml-icon-font-sprites',
  'ASCIIMathML (c) Peter Jipsen http://www.chapman.edu/~jipsen',
  'ASCIIMathML (c) David Lippman http://www.pierce.ctc.edu/dlippman',
  'Themes (c) by Brett Schwarz https://github.com/bschwarz/puml-themes',
  'Twemoji (c) by Twitter at https://twemoji.twitter.com/',
  'KaTeX (c) by Khan Academy and other contributors https://katex.org/',
  'pako (c) by Vitaly Puzrin and Andrei Tuputcyn https://github.com/nodeca/pako',
  'xmldom (c) by Christopher J. Brody and other contributors https://github.com/xmldom/xmldom',
  BLANK,
] as const;

/**
 * The build/host switch `end3` reads (java:212). Upstream reads it from
 * process state; the port injects it, defaulting to what the oracle jar
 * answers ({@link ORACLE_BUILD}). Upstream's second switch,
 * `WindowsDotArchive.getInstance().isThereArchive()` (java:218), chose
 * between two GraphViz notices the ruling replaces with fixed lines
 * (ruling 2026-11-12 item 6), so nothing reads it.
 */
export interface LicenseBuild {
  /** `GlobalConfig.getInstance().boolValue(GlobalConfigKey.ENABLE_STATS)`. */
  readonly enableStats: boolean;
}

/**
 * The oracle jar's answer. `ENABLE_STATS` is `defaultForStats()`, the
 * `PLANTUML_STATS` system property / env var (GlobalConfigKey.java:68-70),
 * false when unset; `src/` reads no environment and this port records no
 * statistics (`UgDiagram.ts`).
 */
export const ORACLE_BUILD: LicenseBuild = { enableStats: false };

/** CLDR `en_US` MEDIUM date (`MMM d, y`), in UTC. */
const MEDIUM_DATE_EN_US = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * `DateFormat.getDateInstance().format(date)`: MEDIUM style in the JVM's
 * default locale and zone. Both are host settings; the oracle host is `en_US`
 * (the jar's `version` page prints `Language: en`, `Country: US`), so the port
 * formats `MMM d, y` in UTC, deterministically.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:393
 */
export function formatDateInstance(epochMillis: number): string {
  return MEDIUM_DATE_EN_US.format(new Date(epochMillis));
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:45 */
export class License {
  /** Upstream's implicit no-arg constructor; `build` is port-only (see {@link LicenseBuild}). */
  constructor(private readonly build: LicenseBuild = ORACLE_BUILD) {}

  /** The MIT edition's arm (java:66-68); the GPL arm (java:63-65) is
   *  `// ::comment`ed out in it, the others stay `// ::uncomment`-only.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:61-84 */
  toString(): string {
    return MIT;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:86-88 */
  static getCurrent(): License {
    return new License();
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:90-97 */
  getTextFull(): string[] {
    const text: string[] = [];
    const licenseInfo = retrieveQuick();
    this.header1(text, licenseInfo);
    this.header2(text, licenseInfo, false);
    this.end3(licenseInfo, text);
    return text;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:99-103 */
  getText1(licenseInfo: LicenseInfo): string[] {
    const text: string[] = [];
    this.header1(text, licenseInfo);
    return text;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:105-110 */
  getText2(licenseInfo: LicenseInfo): string[] {
    const text: string[] = [];
    this.header2(text, licenseInfo, true);
    this.end3(licenseInfo, text);
    return text;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:112-129 */
  private header1(text: string[], licenseInfo: LicenseInfo): void {
    if (licenseInfo.isNone()) {
      text.push(RULE, BAR, FREE_NAME, BAR, RULE);
    } else {
      text.push(RULE, BAR, '|      PlantUML Professional Edition', BAR, RULE);
      License.addLicenseInfo(text, licenseInfo);
      text.push(RULE);
    }
  }

  /** Upstream's signature is kept; its body no longer reads `licenseInfo`
   *  or `withQrcode`, because the support links, the QR-code line and the
   *  `""`/`" "` pair they gated (java:138-152) are dropped (ruling 2026-11-12
   *  item 2: those links fund upstream, not this port).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:131-153 */
  private header2(text: string[], _licenseInfo: LicenseInfo, _withQrcode: boolean): void {
    text.push(...COPYRIGHT_AND_PROJECT);
  }

  /** `addMit(licenseInfo, text)` (java:171-173) in place of the GPL lines.
   *  Ruling 2026-11-12: the advertising paragraph and its blank (java:191-197,
   *  the `isValid() == false` arm) are dropped (item 4: we draw no sponsored
   *  messages); the images paragraph names SVG and plantuml-engine (item 5,
   *  replaces java:199, :205-206); the GraphViz and credit lines are
   *  {@link GRAPHVIZ} and {@link CREDITS} (items 6 and 7).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:155-238 */
  private end3(licenseInfo: LicenseInfo, text: string[]): void {
    this.addMit(licenseInfo, text);
    text.push(BLANK);
    text.push(
      'Images (SVG) generated by running plantuml-engine',
      'are owned by the author of their corresponding sources code (that is, their',
      'textual description in PlantUML language). Those images are not covered by',
      `this ${this.toString()} license.`,
      BLANK,
      `The generated images can then be used without any reference to the ${this.toString()} license.`,
      'It is not even necessary to stipulate that they have been generated with plantuml-engine,',
      'although this will be appreciated.',
      BLANK,
      ...EXCEPTION,
    );
    if (this.build.enableStats) text.push(...STATS);
    text.push(BLANK);
    text.push(...GRAPHVIZ);
    text.push(...CREDITS);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:241-265 */
  private addMit(_licenseInfo: LicenseInfo, text: string[]): void {
    text.push(...MIT_TEXT);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:374-388 */
  static addLicenseInfo(text: string[], licenseInfo: LicenseInfo): void {
    if (licenseInfo.getLicenseType() === LicenseType.NAMED) {
      text.push(BAR, `|      LICENSED TO : ${licenseInfo.getOwner() ?? 'null'}`);
      License.addKeyAndExpiration(text, licenseInfo);
    } else if (licenseInfo.getLicenseType() === LicenseType.DISTRIBUTOR) {
      text.push(BAR_WIDE, `|      DISTRIBUTED BY : ${licenseInfo.getOwner() ?? 'null'}`);
      License.addKeyAndExpiration(text, licenseInfo);
    }
    if (licenseInfo.getLicenseType() !== LicenseType.UNKNOWN && licenseInfo.hasExpired())
      text.push('|      <i>Warning: Your license has expired.', BAR_WIDE);
  }

  /** Always displayed, whether the licence is still valid or not (java:390).
   *  A missing key prints `null...`, as Java string concatenation does.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/License.java:391-395 */
  private static addKeyAndExpiration(text: string[], licenseInfo: LicenseInfo): void {
    text.push(
      `|      LICENSE KEY : ${licenseInfo.getKeyStart() ?? 'null'}...`,
      `|      EXPIRATION DATE : ${formatDateInstance(licenseInfo.getExpirationDate())}`,
      BAR_WIDE,
    );
  }
}
