/**
 * `I18n`: a localized value from the `i18n*.properties` bundles (`i18n-bundles.ts`).
 *
 * Ported branch: the JVM one (`ResourceBundle.getBundle("i18n", Locale.forLanguageTag(language))`), since the oracle
 * is the JVM jar; the TeaVM branch (`return defaultValue`) is not taken there. `language == null` reads
 * `Locale.getDefault().getLanguage()`; this port has no default locale, so it uses the root bundle, which is
 * byte-identical to `i18n_en.properties` and so equals the oracle machine's `en_US` default.
 *
 * Resolution mirrors the JDK 21 `Locale.forLanguageTag` (BCP 47 subtags split on `-`, parsing stops at the first
 * ill-formed subtag, so `zh_CN` is the root locale) and `ResourceBundle.Control#getCandidateLocales` (the Chinese
 * script/region inference included), then the fallback to the default locale when only the base bundle matched.
 * Variants and the Norwegian special case are not modelled: no bundle carries a variant or a Norwegian language.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/I18n.java:61-82
 */
import { I18N_BUNDLES } from './i18n-bundles.js';

/** The language the oracle JVM runs in (`Locale.getDefault()` is `en_US`); `en` and the root bundle are identical. */
const DEFAULT_LANGUAGE = 'en';

interface ParsedTag {
  readonly language: string;
  readonly script: string;
  readonly region: string;
}

const ALPHA_2_8 = /^[A-Za-z]{2,8}$/;
const ALPHA_4 = /^[A-Za-z]{4}$/;
const REGION = /^(?:[A-Za-z]{2}|[0-9]{3})$/;
const EXTLANG = /^[A-Za-z]{3}$/;

/** `LanguageTag.parse`'s language subtag: 2-8 letters, lower-cased; `und` is the root. */
function parseLanguage(subtag: string): string {
  const language = subtag.toLowerCase();
  return language === 'und' ? '' : language;
}

/** Up to three extlang subtags after a 2-3 letter language (`LanguageTag.parseExtlangs`); skipped, the index moved. */
function skipExtlangs(subtags: readonly string[], language: string, from: number): number {
  let i = from;
  if (language.length > 3) return i;
  while (i - from < 3 && EXTLANG.test(subtags[i] ?? '')) i++;
  return i;
}

/** A 4-letter script subtag, title-cased, or `''`. */
function parseScript(subtag: string): string {
  if (!ALPHA_4.test(subtag)) return '';
  return subtag.charAt(0).toUpperCase() + subtag.substring(1).toLowerCase();
}

/** `Locale.forLanguageTag`, reduced to the language, script and region subtags a bundle name can use. */
export function forLanguageTag(tag: string): ParsedTag {
  const subtags = tag.split('-');
  const first = subtags[0]!;
  if (!ALPHA_2_8.test(first)) return { language: '', script: '', region: '' };
  let i = skipExtlangs(subtags, first, 1);
  const script = parseScript(subtags[i] ?? '');
  if (script !== '') i++;
  const regionTag = subtags[i] ?? '';
  const region = REGION.test(regionTag) ? regionTag.toUpperCase() : '';
  return { language: parseLanguage(first), script, region };
}

/** `getCandidateLocales`'s Chinese case: the script a `zh` region implies (ResourceBundle.java:2927-2935). */
const ZH_SCRIPT_FOR_REGION: Readonly<Record<string, string>> = {
  TW: 'Hant',
  HK: 'Hant',
  MO: 'Hant',
  CN: 'Hans',
  SG: 'Hans',
};

/** `getDefaultList`'s Chinese case: the old-convention region a `zh` script implies (ResourceBundle.java:2966-2974). */
const ZH_REGION_FOR_SCRIPT: Readonly<Record<string, string>> = { Hans: 'CN', Hant: 'TW' };

/** `getDefaultList`'s script entries: `language_script`, then the region without the script. */
function scriptCandidates(language: string, script: string, region: string): string[] {
  if (script === '') return [];
  const plainRegion = language === 'zh' && region === '' ? (ZH_REGION_FOR_SCRIPT[script] ?? '') : region;
  return plainRegion === ''
    ? [join(language, script, '')]
    : [join(language, script, ''), join(language, '', plainRegion)];
}

/** `Control#getCandidateLocales` → `getDefaultList`, as bundle suffixes, the root `''` last. */
export function getCandidateLocales(parsed: ParsedTag): string[] {
  const { language, region } = parsed;
  const script = language === 'zh' && parsed.script === '' ? (ZH_SCRIPT_FOR_REGION[region] ?? '') : parsed.script;
  const list: string[] = region === '' ? [] : [join(language, script, region)];
  list.push(...scriptCandidates(language, script, region));
  if (language !== '') list.push(language);
  list.push('');
  return list;
}

/** `Locale#toString`-style bundle suffix: `language_region`, with the script as `language_#Script` never matching. */
function join(language: string, script: string, region: string): string {
  const scriptPart = script === '' ? '' : `#${script}`;
  return [language, region, scriptPart].filter((p) => p !== '').join('_');
}

/** The value of `key` in the first candidate bundle that has one, as `ResourceBundle#getString` walks parents. */
function lookup(candidates: readonly string[], key: string): string | undefined {
  for (const name of candidates) {
    const value = I18N_BUNDLES[name]?.[key];
    if (value !== undefined) return value;
  }
  return undefined;
}

/**
 * `getLocalizedValue`. `null` arguments are Java's `null`.
 * @see I18n.java:61-82
 */
export function getLocalizedValue(language: string | null, key: string | null, defaultValue: string | null): string {
  if (key === null) throw new Error('Key must not be null.');
  if (defaultValue === null) throw new Error('defaultValue must not be null.');
  const candidates = getCandidateLocales(forLanguageTag(language ?? DEFAULT_LANGUAGE));
  const specific = candidates.filter((c) => c !== '' && I18N_BUNDLES[c] !== undefined);
  // Only the base bundle matched: ResourceBundle consults the default locale before settling on the root.
  const chain = specific.length > 0 ? candidates : [...getCandidateLocales(forLanguageTag(DEFAULT_LANGUAGE))];
  return lookup(chain, key) ?? defaultValue;
}

/** Java's static-method holder, for callers that read `I18n.getLocalizedValue`. */
export const I18n = { getLocalizedValue } as const;
