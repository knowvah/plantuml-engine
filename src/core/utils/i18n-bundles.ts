/**
 * The eight `i18n*.properties` bundles `I18n.getLocalizedValue` reads through `ResourceBundle.getBundle("i18n", …)`,
 * keyed by bundle suffix (`''` is the root bundle `i18n.properties`). Values are copied byte for byte with the
 * `\uXXXX` escapes decoded, as `ResourceBundle` reads an ISO-8859-1 `.properties` file. Every file is plain ASCII.
 *
 * @see ~/git/plantuml/src/main/resources/i18n.properties
 */
export const I18N_BUNDLES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  /** @see ~/git/plantuml/src/main/resources/i18n.properties */
  '': {
    'regex.wordBoundary': 'WordBoundary',
    'regex.nonWordBoundary': 'NonWordBoundary',
    'regex.digit': 'Digit',
    'regex.nonDigit': 'NonDigit',
    'regex.word': 'Word',
    'regex.nonWord': 'NonWord',
    'regex.whitespace': 'Whitespace',
    'regex.nonWhitespace': 'NonWhitespace',
    'regex.anyChar': 'AnyChar',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_de.properties */
  de: {
    'regex.wordBoundary': 'WortGrenze',
    'regex.nonWordBoundary': 'NichtWortGrenze',
    'regex.digit': 'Ziffer',
    'regex.nonDigit': 'KeineZiffer',
    'regex.word': 'Wort',
    'regex.nonWord': 'NichtWort',
    'regex.whitespace': 'Leerzeichen',
    'regex.nonWhitespace': 'KeinLeerzeichen',
    'regex.anyChar': 'BeliebigesZeichen',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_en.properties */
  en: {
    'regex.wordBoundary': 'WordBoundary',
    'regex.nonWordBoundary': 'NonWordBoundary',
    'regex.digit': 'Digit',
    'regex.nonDigit': 'NonDigit',
    'regex.word': 'Word',
    'regex.nonWord': 'NonWord',
    'regex.whitespace': 'Whitespace',
    'regex.nonWhitespace': 'NonWhitespace',
    'regex.anyChar': 'AnyChar',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_fr.properties */
  fr: {
    'regex.wordBoundary': 'LimiteMot',
    'regex.nonWordBoundary': 'NonLimiteMot',
    'regex.digit': 'Chiffre',
    'regex.nonDigit': 'NonChiffre',
    'regex.word': 'Mot',
    'regex.nonWord': 'NonMot',
    'regex.whitespace': 'EspaceBlanc',
    'regex.nonWhitespace': 'NonEspaceBlanc',
    'regex.anyChar': 'ToutCaractère',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_ja.properties */
  ja: {
    'regex.wordBoundary': '単語境界',
    'regex.nonWordBoundary': '非単語境界',
    'regex.digit': '数字',
    'regex.nonDigit': '非数字',
    'regex.word': '単語',
    'regex.nonWord': '非単語',
    'regex.whitespace': '空白文字',
    'regex.nonWhitespace': '非空白文字',
    'regex.anyChar': '任意文字',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_ko.properties */
  ko: {
    'regex.wordBoundary': '단어경계',
    'regex.nonWordBoundary': '비단어경계',
    'regex.digit': '숫자',
    'regex.nonDigit': '비숫자',
    'regex.word': '단어',
    'regex.nonWord': '비단어',
    'regex.whitespace': '공백문자',
    'regex.nonWhitespace': '비공백문자',
    'regex.anyChar': '임의문자',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_zh_CN.properties */
  zh_CN: {
    'regex.wordBoundary': '单词边界',
    'regex.nonWordBoundary': '非单词边界',
    'regex.digit': '数字',
    'regex.nonDigit': '非数字',
    'regex.word': '单词',
    'regex.nonWord': '非单词',
    'regex.whitespace': '空白字符',
    'regex.nonWhitespace': '非空白字符',
    'regex.anyChar': '任意字符',
  },
  /** @see ~/git/plantuml/src/main/resources/i18n_zh_TW.properties */
  zh_TW: {
    'regex.wordBoundary': '單詞邊界',
    'regex.nonWordBoundary': '非單詞邊界',
    'regex.digit': '數字',
    'regex.nonDigit': '非數字',
    'regex.word': '單詞',
    'regex.nonWord': '非單詞',
    'regex.whitespace': '空白字元',
    'regex.nonWhitespace': '非空白字元',
    'regex.anyChar': '任意字元',
  },
};
