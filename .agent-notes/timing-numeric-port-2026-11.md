## Observation: the timing commits of the a720bdd range, and which need no port
- **Context**: `git -C ~/git/plantuml log --oneline 97a5992201a..a720bdd -- '*timing*'` while porting the timing
  engine for the a720bdd re-pin.
- **Finding**: Ported: 3cdc46b2092 + 1a8b87e2baa (digital, numeric/state split), baf98040f42 (`break`) and
  db06d70e18e (`time-axis unit`). No timing behaviour: aa79d2d80ee (a math Vega fixture named timing),
  bcbd1bfdf0f (`DeduceFormat` symbols `Locale.US` -> `ROOT`, same symbols for the separators it sets),
  331a6e77470 (SJPP comments), ab400188ab0 (`MyCollections.unmodifiableList`), 3d555d85eb5 (imports),
  8a92b93099e and c9d62097ff5 (style-query API). 0c54c010cdf adds `mandatoryFirstTokensFast` to every timing
  command and drops `CommandStopAt`: the first-token dispatch index is core (`PSystemCommandFactory`), unported in
  this repo, and meant to be behaviour-preserving; it also makes `StringUtils.trin`/`trim2` treat U+00A0 as blank.
- **Impact**: The U+00A0 trim change is a core behaviour change no timing port covers; check it with the core agent.
- **Confidence**: Medium (the core-index equivalence is upstream's claim, asserted there, not measured here)

## Observation: committed parity-timing.json lags HEAD by two rows
- **Context**: Re-surveying the timing tree after the numeric-player port.
- **Finding**: `mekivo-95-xafe506` and `ruzusi-11-maka311` (concise + `use date format`, no analog/digital) are
  `diverged` in `tests/oracle/svg-conformance/parity-timing.json` (generated 2026-11-19) but `conformant` in a fresh
  survey; the port does not touch their path, so the file predates a later fix.
- **Impact**: Regenerate parity-timing.json when the branch's reports are refreshed; both rows only improve.
- **Confidence**: Medium (cause of the earlier divergence not traced)
