# T5c — LaTeX rows: verify, then name (D5)

**State at planning:** 6 corpus rows, Σ 145: `rekefe-90-baju604` 5, `bigobe-53-denu394` 16, `xexuxu-81-kuni702` 16
(`skinparam dpi 300`), `xuzovi-55-doze473` 16 (`scale 4`), `pedulu-06-xomo122` 28 (`skinparam monochrome true`,
LaTeX in `while` labels), `cepivu-60-lobe416` 64 (inline `<latex>` beside text). Five are structural-match.
`DIVERGENCES.md` "LaTeX rendering engine — KaTeX, not JLaTeXMath (permanent)" names the library.

**Read:** that entry in full (including the 2026-10-11 correction: the oracles are JLaTeXMath now), and
`src/core/latex.ts#renderLatexAsImage`. For each row, its diffs from `row-diffs.mts`.

**Do:** for each row, classify every diff: it follows from the image's width or height (an image attribute, a box
sized around it, a canvas, every coordinate below or right of it), or it does not. A diff that does not follow is a
port defect: fix it, or hand it to the task that owns it. When a row's remaining diffs all follow, add it to the
entry's row list with that sentence, the forcing library and the row's diff count.

**Measure:** the 6 rows.

## Acceptance
- Given each of the 6 rows, then every diff is classified in the journal, and the row is named under the KaTeX
  entry or conformant.
- Given `oracle/accepted-divergences.json`, then it is unchanged.

Observability N/A. Rollback Reversible.
