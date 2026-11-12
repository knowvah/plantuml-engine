## Observation: DIVERGENCES.md carries its first ~1100 lines three times
- **Context**: Adding the `@startgit` row table under the Smetana entry (gip T3c, 2026-11-11).
- **Finding**: `DIVERGENCES.md` repeats the block from `### Smetana-backed diagram types` through the LaTeX entry three times (headings at lines 17, 391 and 761 on `d136df2eb`); the duplication is already present at `318595707` and `6813e1536`. A blind `str.replace` on an anchor in that block edits all three copies.
- **Impact**: Edits must target the first copy only (gip did). A dedicated docs cleanup should drop copies 2 and 3 after checking no test greps the later line numbers.
- **Confidence**: High
