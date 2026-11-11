# T3e — newline and stack sizing

Read [D7](../decisions.md#d7--math-sizing-residuals-are-this-missions-work-in-the-existing-metrics-module) and
[task-contract.md](../task-contract.md).

**Evidence:** `a^2 newline a^3` (`zoziko-62`, `kurugo-90`) jar 27×52 vs our 45×26; `a newline b` 19×40 vs 28×22; `\stackrel{def}{=}`,
`\overset{k}{=}`, `\underset{k}{=}`, `\stackrel{\sim}{=}`. `AsciiMath` writes `\\` for `newline` (`ASCIIMathTeXImg.ts`), and JLaTeXMath treats
`\\` at formula level as a line break in a vertical stack; KaTeX's parse tree has its own node for `\\`, so read what it gives before
building the rule.

**JLaTeXMath:** `OverUnderDelimiter`, `UnderOverAtom`, the `\stackrel`/`\overset`/`\underset` entries in `PredefinedCommands`, `TeXFormula`'s
newline handling. Decompile the class with `javap -c` if no source is on disk.

**Write:** `src/core/latex-metrics/` (the `\\` and stack handling in `nodes.ts`/`row.ts`, or a new `stack.ts`), `tests/unit/factories/stack-sizing.test.ts`.

## Acceptance
- Given `zoziko-62-toko934`, when rendered, then the canvas is 27×52.
- Given the `\stackrel`/`\overset`/`\underset` formulas in `xanuke-94`, `roxita-24`, `cunotu-47`, then each size matches its oracle image.
- Given `verdict-diff`, then 0 conformant rows lost in any engine.

Observability: N/A — no new observable operations. Rollback: Reversible.
