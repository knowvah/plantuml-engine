/**
 * `LicenseInfo` (version/LicenseInfo.java): the value class with an injected
 * clock, and the retrievals, which resolve to NONE in a build with no
 * distributor resource, `Preferences` key or classpath `license.txt` — what
 * the oracle jar resolves to (every jar `license` probe prints the free
 * edition's header, License.java:114-119).
 */
import { describe, expect, it } from 'vitest';
import {
  LicenseInfo,
  retrieveDistributor,
  retrieveDistributorImage,
  retrieveNamedOrDistributorQuickIsValid,
  retrieveNamedSlow,
  retrieveQuick,
} from '../../../src/diagrams/version/LicenseInfo.js';
import type { LicenseInfoFields } from '../../../src/diagrams/version/LicenseInfo.js';
import { LicenseType } from '../../../src/diagrams/version/LicenseType.js';

const EXPIRY = 1_800_000_000_000;

function named(now: number, overrides: Partial<LicenseInfoFields> = {}): LicenseInfo {
  return new LicenseInfo({
    type: LicenseType.NAMED,
    generationDate: 1_700_000_000_000,
    expirationDate: EXPIRY,
    owner: 'ACME',
    context: 'ctx',
    sha: undefined,
    key: 'abcdef0123456789',
    currentTimeMillis: () => now,
    ...overrides,
  });
}

describe('LicenseInfo.NONE (java:74)', () => {
  it('is NONE-typed, ownerless, never valid and never expired', () => {
    const none = LicenseInfo.NONE;
    expect(none.getLicenseType()).toBe(LicenseType.NONE);
    expect(none.isNone()).toBe(true);
    expect(none.isValid()).toBe(false);
    expect(none.hasExpired()).toBe(false);
    expect(none.getOwner()).toBeUndefined();
    expect(none.getContext()).toBeUndefined();
    expect(none.getGenerationDate()).toBe(0);
    expect(none.getExpirationDate()).toBe(0);
    expect(none.getKeyStart()).toBeUndefined();
    expect(none.getShaStart()).toBeUndefined();
  });
});

describe('LicenseInfo#getKeyStart / #getShaStart (java:94, :285-295)', () => {
  it('keeps the first KEY_START_LENGTH = 8 characters of the key', () => {
    expect(named(0).getKeyStart()).toBe('abcdef01');
  });

  it('keeps a key shorter than 8 characters whole', () => {
    expect(named(0, { key: 'abc' }).getKeyStart()).toBe('abc');
  });

  it('reads the first 8 hexadecimal digits of the stored SHA', () => {
    const sha = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
    expect(named(0, { sha }).getShaStart()).toBe('01234567');
    expect(named(0).getShaStart()).toBeUndefined();
  });
});

describe('LicenseInfo#isValid / #hasExpired (java:67-69, :301-303)', () => {
  it('is valid up to and including the expiration instant', () => {
    expect(named(EXPIRY).isValid()).toBe(true);
    expect(named(EXPIRY).hasExpired()).toBe(false);
  });

  it('has expired one millisecond later', () => {
    expect(named(EXPIRY + 1).isValid()).toBe(false);
    expect(named(EXPIRY + 1).hasExpired()).toBe(true);
  });

  it('carries its stored fields', () => {
    const info = named(0);
    expect(info.isNone()).toBe(false);
    expect(info.getOwner()).toBe('ACME');
    expect(info.getContext()).toBe('ctx');
    expect(info.getGenerationDate()).toBe(1_700_000_000_000);
    expect(info.getExpirationDate()).toBe(EXPIRY);
    expect(info.getLicenseType()).toBe(LicenseType.NAMED);
  });
});

describe('the retrievals (java:58-65, :106-136, :168-217)', () => {
  it('finds no distributor resource', () => {
    expect(retrieveDistributor()).toBeUndefined();
  });

  it('finds no named licence: NONE', () => {
    expect(retrieveNamedSlow()).toBe(LicenseInfo.NONE);
  });

  it('retrieveQuick is NONE, the same object on every call', () => {
    expect(retrieveQuick()).toBe(LicenseInfo.NONE);
    expect(retrieveQuick()).toBe(retrieveQuick());
    expect(retrieveNamedOrDistributorQuickIsValid()).toBe(false);
  });

  it('has no distributor logo, for a DISTRIBUTOR licence either', () => {
    expect(retrieveDistributorImage(LicenseInfo.NONE)).toBeUndefined();
    expect(retrieveDistributorImage(named(0, { type: LicenseType.DISTRIBUTOR }))).toBeUndefined();
  });
});
