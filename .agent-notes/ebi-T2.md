# empty-block-ink T2 (2026-11-21)

## Observation: the DIVERGENCES Smetana row table drifts from the positional pin
- **Context**: Recounting the "Row-level table" for #187.
- **Finding**: `yaml/bafemu-96-luji978`, `yaml/jozapu-14-datu953` and `yaml/ketunu-15-poli031` read stale residue
  after `cfb9ecd55` (re-pin to upstream a720bdd) changed their pin entries; no gate compares the table with
  `oracle/goldens/json-family-positional.json`. bafemu and jozapu now measure 0 / 0 / 0 / 0 positional residue yet
  stay non-conformant, so their mechanism cells (U-NS etc.) likely no longer describe what is left.
- **Impact**: A table/pin consistency check (parse the table, compare with the pin) would catch this; the two rows'
  remaining diffs need a re-diagnosis before their mechanism cells can be trusted.
- **Confidence**: High (residue), Low (what the remaining diffs are; not measured)

## Observation: the L counterfactual needs an engine-side switch
- **Context**: D4 probe for `authored:json/empty-nested`.
- **Finding**: Smetana's empty-node size (15 in-rank × 17) cannot be reached through the record label: XPAD alone is
  16 on the in-rank axis. The probe used `fixedsize=true` on the empty record in `addRecordNode`. The engine's
  `width` is the in-rank axis (the node enters as width 15 = `MIN_HEIGHT`, height 0).
- **Impact**: Reuse that switch for any future empty-container counterfactual.
- **Confidence**: High
