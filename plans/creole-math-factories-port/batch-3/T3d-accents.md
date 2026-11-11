# T3d — accent and underline sizing

Read [D7](../decisions.md#d7--math-sizing-residuals-are-this-missions-work-in-the-existing-metrics-module) and
[task-contract.md](../task-contract.md).

**Evidence:** about 30 images, e.g. `\vec{x}` 20×23 vs our 20×17, `\hat{x}` 20×22, `\underline{x}` 20×21, `\overline{x}` 20×23; the jar is
consistently 4 to 6 px taller. Rows: `jugepi-77`, `xanuke-94`, `cunotu-47`, `kebadi-11`, `ziboza-73`.

**Java/JLaTeXMath:** `src/core/latex-metrics/` carries 1.0.7's rules (`DIVERGENCES.md`: `TeXIconBuilder.java:64-70`, `TeXIcon.java:141-157,
195, 210`). `AccentedAtom`, `UnderOverArrowAtom`, `OverUnderBox`, `UnderlineAtom`, `OverlinedAtom` are in the jar; decompile with `javap -c`
if no source is on disk (`~/.gradle/caches/modules-2/files-2.1/org.scilab.forge/jlatexmath`). The prior precedent for this is `MatrixAtom`
(`latex-metrics/matrix.ts`, "decompiled from the 1.0.7 jar").

**Write:** `src/core/latex-metrics/` (a `convert.ts`/`nodes.ts` node handler, or a new `accent.ts`), `tests/unit/factories/accent-sizing.test.ts`.

Port the rule that produces each height from the box tree; never fit an offset. Check the KaTeX parse tree carries what the rule needs
(`src/core/latex-metrics/convert.ts`).

## Acceptance
- Given the jugepi/xanuke accent formulas, when `measureTeXIcon` runs, then each returns the oracle's width and height.
- Given `verdict-diff`, then 0 conformant rows lost in any engine; a newly conformant `<latex>` row elsewhere gets re-pinned by its tool.

Observability: N/A — no new observable operations. Rollback: Reversible.
