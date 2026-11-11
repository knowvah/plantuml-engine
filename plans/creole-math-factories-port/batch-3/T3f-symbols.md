# T3f — symbol metrics, ±1 rounding, the 8×8 cases

Read [D7](../decisions.md#d7--math-sizing-residuals-are-this-missions-work-in-the-existing-metrics-module) and
[task-contract.md](../task-contract.md).

**Evidence:**
- Negation and single glyphs: `\ne`/`\notin` (24×26 vs our 31×26, 22×26 vs 38×28), `\bowtie`, `\cdots`, `\vdots`, `\ldots`, `\mapsto`,
  `\models` (`rozesu-56`, `cunotu-47`, `vocalo-20`, `xanuke-94`, `sozeke-50`).
- ±1 on width or height, 17 images: `[(1,|,3,|,4),(5,|,7,|,8)]` (matrix with bars), `\frac` with `\cdot`, `f'` heights (`nurile-03`, `raxanu-33`,
  `jugepi-77`, `mimumu-93`, `vocalo-20`).
- Our 8×8 error box (23 images): `\hat{}`, `\overline{}`, `\csch`, `\sech`, `\boxempty`, `\stackrel{}{}`, `\underbrace{}`, `\vec{}`, `\ `, `^`,
  `_`, `a -lt b`. Establish for each whether **KaTeX throws** (`katex.renderToString` with `throwOnError: true`) or the sizing code gave up:
  8×8 is what our measuring path returns, not proof KaTeX refused.

**Write:** `src/core/latex-metrics/` (the symbol, `\not`, and rounding handling), `tests/unit/factories/symbol-sizing.test.ts`.

Port JLaTeXMath's rule for each, citing the 1.0.7 class. A KaTeX parse error, or a parse tree missing what the rule needs, goes to T3g
with the formula and the thrown message (D7). Never tune a width to a row.

## Acceptance
- Given the listed formulas, when `measureTeXIcon` runs, then each returns the oracle's size, or T3g's journal carries the formula and KaTeX's
  error message.
- Given `sozeke-50-rilu829`, then its canvas is 406×56.
- Given `verdict-diff`, then 0 conformant rows lost in any engine.

Observability: N/A — no new observable operations. Rollback: Reversible.
