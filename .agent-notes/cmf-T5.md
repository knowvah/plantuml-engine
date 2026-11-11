## Observation: the #129 and #136 comments are unposted
- **Context**: cmf T5 close-out.
- **Finding**: `gh issue comment 129` was denied by the session classifier. #136 was not attempted after that. The texts to post follow.
- **Impact**: a maintainer posts them, and adds `Blocked by #169.` and `Blocked by #170.` to #136.
- **Confidence**: High.

### For #129

creole-math-factories-port ran on `feature/parity-queue` (one unsigned commit on `c914bec36`; not pushed).

- The five factories are ported and registered at their `PSystemBuilder` lines, with `PSystemBasicFactory`, `LanguageDescriptor` and `DirectOsDiagram`: `PSystemDefinitionFactory`, `PSystemMathFactory`, `PSystemLatexFactory`, `PSystemCreoleFactory` and `HelpFactory`.
- Of the 41 rows, 17 are conformant and pinned in the new `svg-factories` ratchet: def 2/2, help 4/5, creole 11/21. Overall: 5,684 → 5,701 of 5,927 conformant, and 0 rows were lost in any engine.
- Math and latex write Batik's document byte for byte except the glyph group, where KaTeX's MathML stands in for JLaTeXMath's paths. Each row is named in `DIVERGENCES.md`.
- JLaTeXMath's rollback is mirrored, using a names-only vocabulary generated from the pinned jar.
- `latex-metrics/` now sizes accents, over/under lines and braces, stacks, `\\` newlines, negations, dots, and the kern/ligature loop. 503 of 510 creole `<math>` images now size as the jar.
- 68 authored fixtures were added.
- Rulings filed: #169 (`help font` lists host fonts) and #170 (the jar sizes creole rollbacks with host AWT fonts; JLaTeXMath's shared symbol state). The remaining KaTeX parse limits are named per row in `DIVERGENCES.md`.

### For #136

#129 (creole-math-factories-port) is on `feature/parity-queue`. 17 of its 41 rows are conformant. Overall: 5,701 of 5,927 conformant, up from 5,684.

Rows left, and where each one ends:
- 13 math/latex rows: named in `DIVERGENCES.md` (KaTeX glyph group).
- `mimumu-93`: named in `DIVERGENCES.md` (KaTeX whitespace in `\text`).
- `kebadi-11` and `rozesu-56`: KaTeX parse errors named in `DIVERGENCES.md`, plus #170.
- `cunotu-47`, `marese-34`, `pecafo-64`, `vocalo-20`, `xanuke-94`, `roxita-24` and `raxanu-33`: #170.
- `cikoge-60`: #169.

New `needs-ruling` issues, each of which needs a line here: `Blocked by #169.` and `Blocked by #170.`
