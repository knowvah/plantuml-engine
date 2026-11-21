# a720bdd port, agent "smalls" (class-like types, junction, math export, welcome count, recapture profile, RegexResult)

## Observation: the creole rollback is drawn raw since aa79d2d80ee
- **Context**: porting ScientificEquationSafe's UGraphic drawing.
- **Finding**: `GraphicStrings.createBlackOnWhiteMonospaced` became `CreoleMode.NO_CREOLE` in aa79d2d80ee, so the
  rollback is a `TextBlockRaw` whose baseline is the font size (`SingleLine#maxDeltaY`): 5 + 14 = y 19, not the
  creole sheet's 15.889. The old jar put it at 15.889. Ported (`TextBlockRaw`, `SingleLine.rawText`, `TileText`).
- **Impact**: any NO_CREOLE GraphicStrings (crash banner too) now measures and draws; it used to throw.
- **Confidence**: High (jar renders of cov-math-unknown, cov-rollback-* now zero-diff)

## Observation: every creole engine now reaches the formula rollback (2026-11-21)
- **Context**: porting the rollback beyond `AtomMath` (cov-rollback-class-note).
- **Finding**: upstream reaches `ScientificEquationSafe` from every engine through `StripeLatex` -> `AtomMath`. The
  port's data-oriented paths now share `core/math/latex-atom.ts` (`latexAtomDimension`, `drawLatexAtom`,
  `rollbackLayout`, `rollbackSvgText`): description (`EntityImageDescriptionDelegates`/`TextBlock`/`TextMeasure`,
  `leaf-sizing-folder-title`), `creole-text-lines` (a `CreoleTextRun.rollback`, drawn by the state renderer; json
  treats it as not drawable), class members/notes (an `'image'` atom with `rollback`) and class link labels.
  The state box divider also moved to the name block's real height (`EntityImageState.java:136`), not
  `lines * fontSize`.
- **Impact**: class link labels used to show `<math>` creole as raw text; they now resolve formulas as atoms (KaTeX
  image or rollback), through `class-edge-label-sprite-runs.ts`.
- **Confidence**: High (tests/fixtures/rollback-engines, six jar probes, zero-diff)

## Observation: archimate's trailing colour leaf uses the wrong regexp
- **Context**: RegexResult port (e2659a157bf), `command-archimate.ts`.
- **Finding**: upstream's second colour leaf is `ColorParser.exp1()` = `(COLORS_REGEXP)?` named COLOR
  (`ColorParser.java:89-90`, `:74-75`); the port's `COLOR2` group uses `COLOR_REGEXP`, so `#red;line:blue` after
  the url slot is not matched the jar's way. Left unchanged (not reached by any corpus row checked).
- **Impact**: small faithful fix in `command-archimate.ts`, needs a jar probe for the downstream colour parse.
- **Confidence**: Medium

## Observation: failures present before this agent's work (not caused by it)
- **Context**: running the touched ratchets at the rebased base (adca562ab).
- **Finding**: utility authored `cov-licence`, `cov-license`, `cov-license-upper` score 146 against baseline 145;
  diagram-style-scope `class__generic-font-*`, `class__gradient-members-FontColor-root`,
  `class__x-generic-style-font` lost conformance (a `text[2]` fill `#000` vs `#00B`); the class and description
  golden ratchets' eligibility checks fail on `class/mugobo-34-fede498` and `c4/xizifu-87-siti076` parity entries.
  Each reproduces with this agent's changes stashed.
- **Impact**: owned by whoever re-pins those trees.
- **Confidence**: High
