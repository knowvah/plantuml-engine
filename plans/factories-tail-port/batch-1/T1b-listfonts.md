# T1b: ListFonts

**Writes:**
- `src/core/available-font-family-names.ts` (moved from `src/diagrams/help/CommandHelpFont.ts:16-27`, keeping its
  JSDoc, now citing both `CommandHelpFont.java:73` and `PSystemListFonts.java:52`, and ruling #169);
- `src/diagrams/help/CommandHelpFont.ts` (import from the new module);
- `src/diagrams/font/PSystemListFonts.ts`, `src/diagrams/font/PSystemListFontsFactory.ts` (`listFontsPlugin`);
- `src/registered-plugins.ts` (`// java:148`, between `skinparameterListPlugin` and `listEmojiPlugin`; trim the
  "Not registered by ufp" comment), `tests/unit/utility-registration.test.ts` (`[listFontsPlugin, 148]`);
- `tests/unit/font/PSystemListFonts.test.ts`; re-point the help test if it imports the seam.

**Read:**
- `font/PSystemListFontsFactory.java:44-57`, `font/PSystemListFonts.java:44-62`, `PlainStringsDiagram.java`;
- `command/PSystemSingleLineFactory.java`;
- `src/core/command/PSystemSingleLineFactory.ts`, `src/diagrams/eggs/PSystemColorsFactory.ts`,
  `src/core/PlainStringsDiagram.ts`;
- `DIVERGENCES.md:2086` (the #169 entry); `decisions.md` D2, D4.

**Do:**
1. Red: assert the drawn page for `cov-listfonts-bare`. Our page is the oracle's first two text runs only: the
   `   ` run, the 16-pt bold `Fonts available:`, and `" "`. Take their `x`/`y`/`textLength` from
   `/tmp/ftp-plan/fx/cov-listfonts-bare.svg`; the page size is ours.
   Assert the parse gate:
   - `listfont`, `listfonts`, `listfont <t>`, `listfonts <t>` match, case-insensitively on `lineLower`;
   - `listfontsX` and `listfonts\tX` do not (`startsWith("listfonts ")`, a space);
   - the text after the first space is trimmed with `StringUtils.trin`, and `This is a test` is the default
     (`:50-51`), even though no font line ever prints it.
2. Hoist the seam, re-point help, and port the two classes. Description: `(List fonts)`.
3. Measure `cov-listfont*` with `--dir`. Expected:
   - the 5 drawn probes stay nonzero: header only, against the host list. They are named divergences under #169
     (D4), and T3 records the rows.
   - `glued` and `two-lines` stay error pairs.
   - `tab` is T2b's.
   - `help font` rows (`cov-help-fonts`) are unchanged.

## Acceptance
- Given `@startuml\nlistfonts\n@enduml`, then the page draws the two header lines and no font line, with
  `data-diagram-type` as the oracle's (none).
- Given `@startuml\nlistfontsX\n@enduml`, then the page is an error pair with the oracle.
- Given `npm test -- tests/architecture/layering.test.ts`, then it passes with no new `ALLOWLIST` entry.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
