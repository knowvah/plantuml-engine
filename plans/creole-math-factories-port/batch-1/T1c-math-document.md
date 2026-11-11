# T1c — the Batik-shaped math document

Read [D4](../decisions.md#d4--math-and-latex-a-batik-shaped-complete-document-with-a-katex-body) and
[task-contract.md](../task-contract.md).

**Java:** `math/ConverterSvg.java` (`getSvg`), `math/ScientificEquationSafe.java:91-115, :149`, `klimt/shape/UImageSvg.java:65-69`
(`getSvg(true)` is the raw string), `klimt/color/HColorSet.java` (`getColorOrWhite`), and Batik's colour naming as the jar
writes it. Oracle bytes: `test-results/dot-cache/unknown/caruta-83-deta919/in.svg` (yellow background, `@startmath`),
`fajagi-98-funo863`, and probes `cov-math-back`, `cov-latex-color`, `cov-math-color-bad`, `cov-math-back-transparent`
(`/tmp/cmf-plan/oracle/`). The whitespace inside the tags is Batik's own: copy it byte for byte.

**Write:** `src/core/math/math-document.ts`, `tests/unit/factories/math-document.test.ts`.

**Build:** `mathDocument(formula, fg, bg): string`, a pure function assembling the document: prolog, DOCTYPE, root `style`
attribute, `width`/`height` from `measureTeXIcon` (`src/core/latex-metrics.ts`) as integers (`ConverterSvg` uses
`icon.getIconWidth/Height`), the Batik comment, `<defs id="genericDefs" />`, the background group, then a body seam taking
the KaTeX `foreignObject` from `renderLatexMathML`. `color`/`backgroundcolor` semantics live in T2c; here `fg`/`bg` are already
resolved. Batik's paint name is a pure function: named colours Batik knows print as words (`white`, `yellow`), others as
`rgb(r,g,b)`; a transparent background writes no paint group at all (confirm against `cov-math-back-transparent` before you
rely on this).

**Interface output** (consumed by T2c): `mathDocument(tex: string, foreground: string, background: string | null): string`.

## Acceptance
- Given `caruta-83`'s formula and `yellow`, when the document is built, then `compareSvg` against its oracle reports no diff
  above the glyph `<g>` (root, comment, defs, background rect), and `width`/`height` are 319 and 44.
- Given a background of `#AABBCC`, then the paint is `rgb(170,187,204)` as in `cov-math-back`.
- Given `white`, then the paint is the word `white`.

Observability: N/A — no new observable operations. Rollback: Reversible.
