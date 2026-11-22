# empty-block-ink planning (2026-11-21, #187)

## Observation: authored json-family rows outside the positional pin are ungated
- **Context**: Planning the #187 ruling, which says to raise `authored:json/empty-nested`'s dw ceiling 0 → 1.
- **Finding**: `json-family-positional.test.ts` checks only `authored:` keys present in
  `oracle/goldens/json-family-positional.json`. `authored:json/empty-nested` and `authored:json/nested-arrays` have
  no entry, so their residue (9.375 / 9.901 / 0 / 9 and 3.262 / 2.933 / 3 / 1 at `177d1d9e8`) is held only by the
  structural pin. `residue.mts --all` prints them, but nothing fails if they grow.
- **Impact**: "Raise / tighten a ceiling" on an authored row is a no-op unless the row is added to the pin first.
- **Confidence**: High

## Observation: the K probe reproduces #187 exactly on a later tree
- **Context**: Re-measuring #187's fix K (a rowless node's ink max at `x + w - 1`) at `177d1d9e8`, 1f154d2e4 + many
  commits.
- **Finding**: `residue.mts --all` takes about 3 s and moved exactly the 11 rows #187 lists, to the same values.
- **Impact**: The residue tool is cheap enough to re-run after every json-family edit.
- **Confidence**: High
