/**
 * `LicenseInfo` — the PlantUML licence the running build carries, as
 * `License` and `PSystemLicense` read it.
 *
 * Upstream retrieves it from three host sources, none of which exists in a
 * browser-safe `src/` (CLAUDE.md, Architecture): a `/distributor.txt` classpath
 * resource (`retrieveDistributor`, java:196-217), the `license` key of a
 * `java.util.prefs.Preferences` node and `license.txt` files next to the
 * classpath entries (`retrieveNamedSlow`, java:106-136). This build has none of
 * them, exactly like the stock (oracle) jar, which ships no distributor
 * resource and finds no key, so every retrieval resolves to {@link LicenseInfo.NONE}
 * as the oracle's does.
 *
 * The key tools (`keygen`/`keyimport`/`keycheck`/`keydistributor`) are ported
 * (#182) on the path this build reaches, where every licence is
 * {@link LicenseInfo.NONE}. Not ported, each because it only serves those host
 * sources or `PLSSignature` key decoding, which no reachable path in this build
 * calls (vkt D3): `persistMe` (java:97-100, a `Preferences` write), `retrieveNamed` and
 * `retrieve` (java:138-149, :244-259, `PLSSignature` decryption of a key read
 * from those sources), `retrieveDistributorOrNamed` (java:155-166, upstream
 * 3a4d1675141: `PLSSignature` decryption for the one-argument `keycheck`),
 * `setIfValid` (java:237-242, called only from the two skipped
 * `retrieveNamedSlow` branches), `fileCandidates` (java:219-235, the JVM
 * classpath) and `main` (java:261-266).
 *
 * `System.currentTimeMillis()` (`isValid`, `hasExpired`) is injected: `src/`
 * reads no clock (CLAUDE.md, Architecture).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java
 */
import type { RasterImage } from '../../core/error/raster-image.js';
import { SignatureUtils } from '../../core/utils/SignatureUtils.js';
import { LicenseType } from './LicenseType.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:76 */
const KEY_START_LENGTH = 8;

/** The constructor's seven parameters, one object for the
 *  complexity hook's 5-parameter cap, plus the injected clock.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:86-87 */
export interface LicenseInfoFields {
  readonly type: LicenseType;
  readonly generationDate: number;
  readonly expirationDate: number;
  readonly owner: string | undefined;
  readonly context: string | undefined;
  readonly sha: Uint8Array | undefined;
  /** The licence key; only its first {@link KEY_START_LENGTH} characters are kept (java:94). */
  readonly key: string | undefined;
  /** `System.currentTimeMillis()`. */
  readonly currentTimeMillis: () => number;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:55 */
export class LicenseInfo {
  /** The clock is never read for NONE: `owner == null` short-circuits
   *  `isValid` and `hasExpired` (java:68, :302).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:74 */
  static readonly NONE: LicenseInfo = new LicenseInfo({
    type: LicenseType.NONE,
    generationDate: 0,
    expirationDate: 0,
    owner: undefined,
    context: undefined,
    sha: undefined,
    key: undefined,
    currentTimeMillis: () => 0,
  });

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:84 */
  private readonly keyStart: string | undefined;

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:86-95 */
  constructor(private readonly fields: LicenseInfoFields) {
    const { key } = fields;
    this.keyStart = key === undefined ? undefined : key.substring(0, Math.min(KEY_START_LENGTH, key.length));
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:67-69 */
  isValid(): boolean {
    return this.fields.owner !== undefined && this.fields.currentTimeMillis() <= this.fields.expirationDate;
  }

  /** `new Date(generationDate)`, as epoch milliseconds.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:268-270 */
  getGenerationDate(): number {
    return this.fields.generationDate;
  }

  /** `new Date(expirationDate)`, as epoch milliseconds.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:272-274 */
  getExpirationDate(): number {
    return this.fields.expirationDate;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:276-278 */
  getOwner(): string | undefined {
    return this.fields.owner;
  }

  /** First characters of the licence key this information was read from,
   *  undefined when there is no licence (java:280-284).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:285-287 */
  getKeyStart(): string | undefined {
    return this.keyStart;
  }

  /** First hexadecimal digits of the SHA-512 stored in the key (java:289-292).
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:293-295 */
  getShaStart(): string | undefined {
    const { sha } = this.fields;
    return sha === undefined ? undefined : SignatureUtils.toHexString(sha).substring(0, KEY_START_LENGTH);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:297-299 */
  isNone(): boolean {
    return this.fields.owner === undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:301-303 */
  hasExpired(): boolean {
    return this.fields.owner !== undefined && this.fields.currentTimeMillis() > this.fields.expirationDate;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:305-307 */
  getLicenseType(): LicenseType {
    return this.fields.type;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:309-311 */
  getContext(): string | undefined {
    return this.fields.context;
  }
}

/**
 * `private static LicenseInfo cache` (java:71). Concurrency contract: written
 * once, by the first {@link retrieveQuick}/{@link retrieveNamedSlow} call; every
 * value it can take here is {@link LicenseInfo.NONE}, so a re-entrant or
 * repeated write stores the same object (upstream's `synchronized` guards a
 * slow read this port does not perform).
 */
let cache: LicenseInfo | undefined;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:58-65 */
export function retrieveQuick(): LicenseInfo {
  cache ??= retrieveDistributor();
  cache ??= retrieveNamedSlow();
  return cache;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:102-104 */
export function retrieveNamedOrDistributorQuickIsValid(): boolean {
  return retrieveQuick().isValid();
}

/**
 * `cache = NONE`, then the `Preferences` key (java:111-117) and the classpath
 * `license.txt` candidates (java:118-134). This build has no `Preferences`
 * store (`prefs.get("license", "")` is `""`, so java:112's `key.length() > 0`
 * is false) and no classpath (`fileCandidates()` is empty), so both branches
 * are skipped and the result is NONE — what the oracle jar, with neither,
 * returns.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:106-136
 */
export function retrieveNamedSlow(): LicenseInfo {
  cache = LicenseInfo.NONE;
  return cache;
}

/**
 * The distributor logo. Null for any licence but a DISTRIBUTOR one
 * (java:169-171); a DISTRIBUTOR one passes the `PLSSignature` check
 * (java:172-177) to read the `/distributor.png` classpath resource, which this
 * build does not bundle — `if (dis == null) return null;` (java:180-182). So
 * every licence answers null here.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:168-194
 */
export function retrieveDistributorImage(_licenseInfo: LicenseInfo): RasterImage | undefined {
  return undefined;
}

/**
 * `getResourceAsStream("/distributor.txt")` is null in this build, as in the
 * stock jar: `if (dis == null) return null;` (java:197-199).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/LicenseInfo.java:196-217
 */
export function retrieveDistributor(): LicenseInfo | undefined {
  return undefined;
}
