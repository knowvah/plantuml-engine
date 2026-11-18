## Observation: inline <math>/<latex> never reaches AtomMath
- **Context**: pbs T2c, sizing a creole math rollback by its PNG export.
- **Finding**: `CommandCreoleMath`/`CommandCreoleLatex` push a data-oriented `'latex'` `CreoleAtom` (with `rollback`);
  `AtomMath` is only the `StripeLatex` block path. The creole and sequence engines size that atom in
  `src/core/annotations/blocks-creole-atoms.ts#atomDim`; the class/description engines size it in six svek sites that
  ignore `rollback` entirely and typeset it with KaTeX (#210).
- **Impact**: a change to how a math atom is laid out must touch `atomDim` (and, after #210, the svek sites), not just
  `AtomMath`. Changing only `AtomMath` moves no corpus row.
- **Confidence**: High

## Observation: engine-local StringBounder literals drop every optional member
- **Context**: pbs T2c, reading the render's deterministic mode from a host bounder (`getFileFormat`).
- **Finding**: besides `UGraphicSvg#getStringBounder` and `MeasurerStringBounder`, about ten engine-local
  `{ calculateDimension, getDescent }` literals exist (sequence, class edge labels, activity, json, ink-walk, `AtomText`),
  and `tabStopMeasurer` wraps a measurer in a literal, so `instanceof DeterministicMeasurer` on an inner measurer is not
  reliable either. Each literal that can host a rollback must forward `getFileFormat` (sequence's does now).
- **Impact**: a bounder that omits `getFileFormat` silently takes PNG's AWT arm in conformance; only a fixture in that
  engine shows it.
- **Confidence**: High
