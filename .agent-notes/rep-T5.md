# rep-T5: issue comments left unposted

`gh issue comment` was denied on 2026-11-10 (auto-mode classifier, external system writes). Post these two by hand.
The second carries #136's "Blocked by #167" line, which the brief's D8 requires.

## Comment for #126

The regex engine port (mission `regex-engine-port`) ran on `feature/parity-queue`. It is one unsigned commit, not
pushed; the per-task history is on the local tag `regex-engine-port/pre-squash`.

- `src/diagrams/regex/` ports `net/sourceforge/plantuml/regexdiagram/` file for file (all nine classes) on the tiles in
  `src/diagrams/ebnf/`, and `PSystemRegexFactory` is registered at `PSystemBuilder.java:197`. `{{regex}}` reaches it
  through the existing embedded path.
- The tile style is frozen in the constructor, as upstream does it (`PSystemRegex.java:82-97`): the default skin, the
  `skin` line and every `<style>` block, before any `skinparam` runs. `StyleExtractor#applyStyles` now lives at its
  upstream home, `src/diagrams/json/StyleExtractor.ts`.
- **All 46 `@startregex` rows are conformant.** 44 are byte-identical and pinned in `oracle/goldens/svg-regex`.
  `bakuza-41-bulo451` and `tajefa-31-pefi801` are jar error pages where we now also error, pinned by score.
- `vokasi-57-zupa746` needed one shared fix: the preprocessor now passes its warnings to the diagram along with its
  options, so `No such !option foo` draws as the jar draws it.
- There are 94 authored fixtures in `tests/fixtures/regex`: 74 at 0 diffs, and 20 jar error pages where we also error.
- Overall: 5,468 → 5,514 conformant of 5,927. No row was lost in any engine, and no divergence was added.
- **#167 is new.** It asks you to confirm retiring the two signed "jar errors, we draw" acceptances for bakuza and
  tajefa, which no longer apply. It is `needs-ruling` and blocks no other row.

## Comment for #136

Update from the regex engine port (#126, mission `regex-engine-port`, on `feature/parity-queue`, unsigned, not
pushed):

- **`regex`: 0 / 0 / 46 → 46 / 0 / 0.** 44 rows are byte-identical and pinned in `oracle/goldens/svg-regex`. The other
  two, `bakuza-41-bulo451` and `tajefa-31-pefi801`, are jar error pages where we now error too, pinned by score.
- No other bucket moved. Overall: 5,468 → 5,514 conformant of 5,927. No row was lost in any engine.
- **#167 is new.** It asks the maintainer to confirm retiring the two signed "jar errors, we draw" acceptances, which
  no longer apply. It is `needs-ruling` and blocks no other row.

Blocked by #167.
