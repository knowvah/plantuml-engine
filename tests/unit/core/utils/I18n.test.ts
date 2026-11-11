import { describe, expect, it } from 'vitest';
import { forLanguageTag, getCandidateLocales, getLocalizedValue, I18n } from '../../../../src/core/utils/I18n.js';
import { I18N_BUNDLES } from '../../../../src/core/utils/i18n-bundles.js';

const ANY = 'regex.anyChar';

// Expected values: the oracle jar's own I18n.getLocalizedValue, run on its JVM (JDK 21, en_US) on 2026-11-10.
const JAR_ANYCHAR: ReadonlyArray<readonly [string, string]> = [
  ['fr', 'ToutCaractère'],
  ['FR', 'ToutCaractère'],
  ['fr-FR', 'ToutCaractère'],
  ['fr_FR', 'AnyChar'],
  ['zh-CN', '任意字符'],
  ['zh_CN', 'AnyChar'],
  ['zh-TW', '任意字元'],
  ['zh_TW', 'AnyChar'],
  ['zh', 'AnyChar'],
  ['zh-Hant', '任意字元'],
  ['zh-Hant-TW', '任意字元'],
  ['zh-Hans', '任意字符'],
  ['zh-HK', 'AnyChar'],
  ['zh-SG', 'AnyChar'],
  ['ja', '任意文字'],
  ['ko-KR', '임의문자'],
  ['de-AT', 'BeliebigesZeichen'],
  ['xx', 'AnyChar'],
  ['', 'AnyChar'],
  ['en', 'AnyChar'],
  ['und', 'AnyChar'],
  ['cn', 'AnyChar'],
  ['EN-us', 'AnyChar'],
  ['x-fr', 'AnyChar'],
  ['123', 'AnyChar'],
];

describe('I18n.getLocalizedValue (I18n.java:61-82)', () => {
  it.each(JAR_ANYCHAR)('language %j resolves regex.anyChar as the jar does', (tag, expected) => {
    expect(getLocalizedValue(tag, ANY, '.')).toBe(expected);
  });

  it('null language uses the default (English) bundle', () => {
    expect(I18n.getLocalizedValue(null, ANY, '.')).toBe('AnyChar');
  });

  it('fr digit is Chiffre (cov-descriptive-names-fr)', () => {
    expect(getLocalizedValue('fr', 'regex.digit', '\\d')).toBe('Chiffre');
  });

  it('a missing key returns the default', () => {
    expect(getLocalizedValue('fr', 'nope', 'DEF')).toBe('DEF');
    expect(getLocalizedValue(null, 'nope', 'DEF')).toBe('DEF');
  });

  it('null key or default throws with Java messages', () => {
    expect(() => getLocalizedValue('fr', null, 'x')).toThrow('Key must not be null.');
    expect(() => getLocalizedValue('fr', ANY, null)).toThrow('defaultValue must not be null.');
  });
});

describe('forLanguageTag / getCandidateLocales', () => {
  it('parses extlang, script and a numeric region', () => {
    expect(forLanguageTag('zh-yue-Hant-419')).toEqual({ language: 'zh', script: 'Hant', region: '419' });
    expect(getCandidateLocales({ language: 'zh', script: 'Hans', region: '' })).toEqual([
      'zh_#Hans',
      'zh_CN',
      'zh',
      '',
    ]);
    expect(getCandidateLocales({ language: 'sr', script: 'Latn', region: '' })).toEqual(['sr_#Latn', 'sr', '']);
    expect(getCandidateLocales({ language: 'zh', script: 'Cyrl', region: '' })).toEqual(['zh_#Cyrl', 'zh', '']);
  });
});

describe('i18n-bundles', () => {
  it('holds eight bundles of nine regex keys each', () => {
    expect(Object.keys(I18N_BUNDLES).sort()).toEqual(['', 'de', 'en', 'fr', 'ja', 'ko', 'zh_CN', 'zh_TW']);
    for (const bundle of Object.values(I18N_BUNDLES)) expect(Object.keys(bundle)).toHaveLength(9);
    expect(I18N_BUNDLES['']).toEqual(I18N_BUNDLES['en']);
    expect(I18N_BUNDLES['ko']!['regex.nonWhitespace']).toBe('비공백문자');
  });
});
