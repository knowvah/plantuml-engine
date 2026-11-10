# T1a — `CharInspector` and `I18n`

**Read:** `utils/CharInspector.java`, `utils/CharInspectorImpl.java`, `utils/BlocLines.java:399-405` (and the
`getTrimmed` each line goes through), `utils/I18n.java:61-82`, `src/main/resources/i18n*.properties` (8 files);
`src/core/utils/BlocLines.ts:1-60`; D3, D6.

**Do:**

1. `CharInspector.ts` (interface) and `CharInspectorImpl.ts`: `line`, `pos`, `insertNewlines`; `peek(ahead)` returns
   `'\0'` when `line == -1` or past the line; `getCurrentLine()` is the trimmed line, plus `"\n"` when
   `insertNewlines`; `jump()` throws when `line == -1`, advances, skips empty lines, and sets `line = -1` past the end.
   Java returns `char` 0 for the first case and `'\0'` for the second; both are `'\0'` in TS, with a comment.
2. `BlocLines#inspector()` and `#inspectorWithNewlines()`, and drop "`inspector` and `inspectorWithNewlines`
   (`CharInspectorImpl` has no port)" from `BlocLines.ts`'s header.
3. `i18n-bundles.ts`: the eight bundles as `Readonly<Record<string, Readonly<Record<string, string>>>>` keyed `''`
   (root), `de`, `en`, `fr`, `ja`, `ko`, `zh_CN`, `zh_TW`, values copied byte for byte from the `.properties` files
   (read them as ISO-8859-1 with `\uXXXX` escapes decoded, as `ResourceBundle` does; journal if any file has none).
   One `@see` per bundle.
4. `I18n.ts`: `getLocalizedValue` per D6. Throw on a null key or default with Java's messages. Resolve the bundle from
   the language tag the way `Locale.forLanguageTag` + `ResourceBundle.getBundle` do (language, then
   language + country, then the root); read `Locale.forLanguageTag`'s handling of `_` in the JDK docs before writing
   it, and journal what you found. A missing key returns `defaultValue`.

**Tests:** an inspector over `["  a = 'b' ;  ", "", "c"]` yields `a`, ` `, `=`, … with the empty line skipped and
`'\0'` after `c`; `jump()` after exhaustion throws; `inspectorWithNewlines` yields `\n` at each line end.
`getLocalizedValue(null, 'regex.anyChar', '.')` is `AnyChar`, `'fr'` gives `ToutCaractère`, `'xx'` gives `AnyChar`, a
missing key gives the default (probes `cov-descriptive-names{,-fr}`).

## Acceptance
- Given the bundles, when compared with the eight `.properties` files, then every key and value matches.
- Given `!option language fr` semantics, when `getLocalizedValue('fr', 'regex.digit', '\\d')`, then `Chiffre`.
- Given `npm test`, then it passes with the new files at 90/90/90.

Observability N/A. Rollback Reversible.
