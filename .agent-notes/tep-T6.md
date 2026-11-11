# tep-T6: issue comments left unposted

`gh issue comment 127` was denied on 2026-11-10 (auto-mode classifier). Post these two by hand. `gh issue create` was
denied too, so the follow-on's body waits in `.agent-notes/tep-T4d.md`; once it is filed, #136 needs its "Blocked by"
line (D8).

## Comment for #127

The timing engine port (mission `timing-engine-port`) ran on `feature/parity-queue`. It is one unsigned commit, not
pushed; the per-task history is on the local tag `timing-engine-port/pre-squash`.

- `src/diagrams/timing/` ports `net/sourceforge/plantuml/timingdiagram/` file for file (minus `package-info.java` and
  the unreachable `CommandStopAt`), and `TimingDiagramFactory` is registered at `PSystemBuilder.java:187`.
  `@starttiming` stays unsupported, as upstream's is.
- **All 158 rows are conformant.** 145 in `timing` (139 byte-identical and pinned in `oracle/goldens/svg-timing`, 6 jar
  error pages where we also error, pinned by score) and the 13 drawn rows in `unknown`, pinned in `svg-timing`.
- Two shared fixes, each measured against every engine: the single-line title commands match the trimmed line
  (`SingleLineCommand2.java:94`), and `WithLinkType#applyStyle` resolves colours through `HColorSet#getColorOrWhite`
  (`WithLinkType.java:162`).
- 141 authored fixtures in `tests/fixtures/timing`: 131 at 0 diffs, 9 jar error pages where we also error, and
  `cov-embedded-state`, open (a `{{ }}` in a state note draws as text; see the follow-on).
- Overall: 5,514 → 5,666 conformant of 5,927. No row was lost in any engine, and no divergence was added.
- `dist/plantuml-ts.d.ts` gains one value, `FontParam.TIMING` (`FontParam.java:49`), which `Highlight#getCaption`
  reads.

## Comment for #136

Update from the timing engine port (#127, mission `timing-engine-port`, on `feature/parity-queue`, unsigned, not
pushed):

- **`timing`: 6 / 0 / 139 → 145 / 0 / 0.** 139 rows are byte-identical and pinned in `oracle/goldens/svg-timing`; 6 are
  jar error pages where we also error, pinned by score.
- **`unknown`: 932 → 945 conformant.** The 13 drawn timing rows now conform and are pinned in `svg-timing`.
- Overall: 5,514 → 5,666 conformant of 5,927 (diverged 300 → 148). No row was lost in any engine.
- One follow-on, not filed because `gh issue create` was denied: a `{{ }}` embedded diagram in a state note draws as
  text (`cov-embedded-state`; `state/xetase-70-zaza808` probably shares it). Body in `.agent-notes/tep-T4d.md`.
