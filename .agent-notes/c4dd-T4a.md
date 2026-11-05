## Observation: C4_Sequence reaches a sequence defect the sequence corpus cannot
- **Context**: Probing `C4_Sequence` beyond the 11 c4 rows.
- **Finding**: `Container_Boundary` writes `box "Box\n<size:12>[container]</size>"`. A box title is a `Display`, and the port drew it as one line. No row in `tests/corpus` carries a `\n` box title.
- **Impact**: Stdlib macros are combinatorial in a way the issue corpus is not; a probe of `_examples_` shapes finds what the corpus misses.
- **Confidence**: High.
