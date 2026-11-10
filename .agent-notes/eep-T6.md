# eep-T6: issue comments left unposted

`gh issue comment` was denied on 2026-11-10 (auto-mode classifier, external system writes). Post these two by hand.
The second carries #136's "Blocked by #166" line, which the brief's D8 requires.

## Comment for #126

The EBNF port (#125, mission `ebnf-engine-port`) has landed the pieces this issue builds on, on `feature/parity-queue`
(unsigned, not yet pushed):

- **The railroad tiles** are in `src/diagrams/ebnf/`, one file per Java class, at the names
  `regexdiagram/PSystemRegex.java` imports: `ETile`, `ETileAlternation`, `ETileBox`, `ETileConcatenation`,
  `ETileLookAheadOrBehind`, `ETileNamedGroup`, `ETileOneOrMore`, `ETileOptional`, `ETileRegexGroup`,
  `ETileRegexGroupAllBut`, `ETileZeroOrMore`, and `Symbol`. Upstream has no railroad IR, so there is none here (the
  mission guide's Track SI-3 and Phase 5m are corrected).
- **The five regex-only tiles** are tested against cached `regex` rows: `ETileNamedGroup` against
  `tubepu-44-gigu535`, `ETileLookAheadOrBehind` against `cecave-79-napo327` and `vunumo-43-buli848`,
  `ETileRegexGroup` against `topamu-99-rasu015`, and `ETileRegexGroupAllBut` against `faporu-75-biso094`. All are
  byte-identical (`tests/unit/ebnf/regex-tiles.test.ts`). `ETileOptional` is `@Deprecated`, and no upstream class
  constructs it, so its tests assert the Java formulas.
- **`UBrexCommandMultilines2`** is at `src/core/command/UBrexCommandMultilines2.ts`, on the same
  `MultilineCommand<S>` contract as `CommandMultilines2`.
- **`I18n`** is at `src/core/utils/I18n.ts`, with the eight `i18n*.properties` bundles in `i18n-bundles.ts`. It ports
  the JVM branch, measured against the jar's own `I18n.getLocalizedValue` on 25 language tags. `ETileBox` already
  reads `!option useDescriptiveNames` and `!option language` through it.
- **`CharInspector`/`CharInspectorImpl`** and `BlocLines#inspector` are in `src/core/utils/`.

The regex engine needs its own layering allowlist entry for `src/diagrams/regex/` → `src/diagrams/ebnf/`, the way
`src/diagrams/ebnf/` → `src/diagrams/activity/ftile/` has one (for `FloatingNote`). Its `ETileBox`es take
`ETileBoxArgs`, an options object for the seven Java constructor arguments.

## Comment for #136

Update from the EBNF port (#125, mission `ebnf-engine-port`, on `feature/parity-queue`, unsigned, not pushed):

- **`ebnf`: 44 / 0 / 0.** 43 rows are byte-identical and pinned in `oracle/goldens/svg-ebnf`. The 44th,
  `ladifa-97-keme950`, is a jar error page where we now error too, pinned by score.
- **`class/vamero-64-fore412`** (a component holding `{{ebnf …}}`) moved from structural-match to conformant.
- Overall: 5,423 → 5,468 conformant of 5,927. No row was lost in any engine.
- **#166 is new.** It asks the maintainer to confirm retiring `ladifa`'s signed "jar errors, we draw" acceptance,
  which no longer applies. It is `needs-ruling`, and it blocks no other row.

Blocked by #166.
