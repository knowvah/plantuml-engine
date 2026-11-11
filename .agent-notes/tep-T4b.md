## Observation: the jar decorates error pages by wall-clock minute
- **Context**: rendering cov-unknown-player / cov-bad-date-format oracles at minute :30 of the hour.
- **Finding**: `PSystemError#getTextBlock` (PSystemError.java:216-232) prepends a Patreon banner at minute 1/8/13/55, Liberapay at 15 and the
  "Add your own dedication" banner at 30/39/48 (`System.currentTimeMillis() / 60000 % 60`). The first render of the two error probes
  carried the dedication banner, which made `compareSvg` report 18-20 diffs against our page.
- **Impact**: render error-page oracles outside those minutes; grep new `.svg` for `dedication|atreon|iberapay` before committing.
- **Confidence**: High (re-render at :50 removed the banner)

## Observation: oracle-render.sh records the capture clock only when the jar exits 0
- **Context**: cov-date-format / cov-bad-date-format rendered in a batch with error pages.
- **Finding**: `set -e` aborts the script when the jar exits non-zero (some inputs are error pages), so the `record-capture-clock.ts` loop never ran.
- **Impact**: render zone-dependent fixtures alone, or run `TZ=America/Chicago npx jiti scripts/record-capture-clock.ts <abs puml> <epochMillis>`.
- **Confidence**: High

## Observation: case-insensitive filesystem collides scale-unit d/D and y/Y
- **Context**: authoring `cov-scale-unit-<u>` for `s m h d D y Y`.
- **Finding**: `cov-scale-unit-d.puml` and `-D.puml` are one file on macOS; suffixes `-lower` / `-upper` keep them apart.
- **Impact**: never rely on case to distinguish fixture slugs.
- **Confidence**: High

## Observation: open probes, jar outcomes
- `-[#red-blue]>` in a timing message: the jar refuses the line (`CommandTimeMessage` ARROW_STYLE has no gradient); we refuse too (error pair).
- `analog "A" between 5 and 5`: the jar crashes (`IllegalArgumentException`), we crash too (pair); not NaN.
- A lone `@-5` / `@-20`..`@-5`: the jar crashes with `IllegalStateException` (`TimingRuler#getFirstPositiveOrZeroValue`), pair.
- `compact`/`is N pixels height` etc. render as authored.
- `clock` takes no `X is state` change: the jar refuses at the line (cov-states-clock).
- **Confidence**: High (oracle SVGs)
