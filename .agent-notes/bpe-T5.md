# bpm-engine-port (bpe) — observations

## Observation: jar crash pages are not byte-stable
- **Context**: rendering `tests/fixtures/bpm/*.puml` three times to check D4 determinism (T3b).
- **Finding**: every `ReportLog` crash page ("An error has occurred") prints a random quote line ("The time is out of joint.", "Ca c'est du lourd..."), so its text and the document width change from run to run. Drawn diagrams were byte-identical across runs.
- **Impact**: a three-render determinism check must exempt crash pages; they pair with our error page regardless of text (ruling 2026-10-10), so they can still be fixtures.
- **Confidence**: High

## Observation: name-substituted repin tools assume their source's golden slug shape
- **Context**: T4, `plans/bpm-engine-port/measurements/repin-routing-refusal.mts` (adapted from wrp's).
- **Finding**: wire's golden twins are slugged `<slug>` (own bucket), but a family pinned inside `unknown` (nwdiag, bpm) slugs them `unknown/<slug>`. The adapted tool silently skipped the 7 golden twins; the dry run's "7 rows changed" instead of 14 exposed it.
- **Impact**: when adapting a repin tool between a flat family and an `unknown`-bucket family, check the golden-twin lookup; compare the dry run's row count with 2x the pins.
- **Confidence**: High

## Observation: error-page line comparison must find the banner by pattern
- **Context**: T3b, `plans/bpm-engine-port/measurements/fixtures.mts`.
- **Finding**: the tool dropped the first two `<text>` lines (version banner, `[From ...]`) before comparing error pages, but on a Welcome-plus-error page those two lines are 18-19. Dropping them by pattern turned 10 false "open" fixtures into error pairs.
- **Impact**: reuse the pattern version in any future `fixtures.mts` copy.
- **Confidence**: High

## Observation: a task reorder can pull a layering ALLOWLIST entry forward
- **Context**: B1 close; `BpmElement` moved from T2a into T1c because the grid's casts need it.
- **Finding**: `tests/architecture/layering.test.ts` scans every file, so `BpmElement`'s activity/ftile imports failed the gate before the planned T3a entry.
- **Impact**: when a brief plans an ALLOWLIST entry for a late task, land it with the first file that makes the import.
- **Confidence**: High

## Unposted issue comments (gh issue comment denied by the session classifier, 2026-11-11)

### #130

bpm-engine-port (bpe) finished on `feature/parity-queue` (not pushed; one unsigned commit for review and signing).

- `net/sourceforge/plantuml/bpm/` ported file for file into `src/diagrams/bpm/`, registered at `PSystemBuilder.java:141`,
  drawing through activity's `FtileCircleStart`, `FtileDiamond` and `FtileBox` (ported at their upstream paths).
- All 7 `@startbpm` corpus rows: diverged -> conformant, zero diffs, pinned in the new `svg-bpm` ratchet.
- 77 authored fixtures in `tests/fixtures/bpm/`: 57 zero-diff, 20 jar error pages where we also error (2026-10-10 ruling).
- Full survey against the base: 0 conformant rows lost in any engine. No divergence added;
  `oracle/accepted-divergences.json` unchanged; `dist/*.d.ts` unchanged.
- No row needs a ruling, so no new issue.

### #136

#130 (bpm-engine-port) done: `unknown` 962/14/72 -> 969/14/65 (the 7 `@startbpm` rows conformant), 0 rows lost in any
engine, `svg-bpm` ratchet added (7 pins + 77 authored). No new issues.
