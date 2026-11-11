## Observation: oracle jar leaks symbol state between formulas of one run
- **Context**: raxanu[12]/roxita[33] (`x^2{{\mid}_2^4}`) were 6 px narrower in the corpus jar than JLaTeXMath's rules give.
- **Finding**: rendered ALONE (`scripts/oracle-render.sh`, one puml per JVM) the jar gives 46x31 / 155x57 = ours. Several pumls in ONE oracle-render call share a JVM; `TeXParser.parse`'s `{` case does `atom.type = 0` on a bare shared `SymbolAtom` (`mid`), so later formulas see `mid` as ORD.
- **Impact**: a corpus jar image can depend on earlier formulas in its file; confirm a size mismatch by rendering the formula alone before chasing it.
- **Confidence**: High

## Observation: imgs.mts labels shift (formula count != image count)
- **Finding**: the `overset`/`underset` rows were labelled 24x34/20x22 but the jar's are 24x26/24x34 (isolated oracle runs); `{\rbrace}`, `\sqrt[3]{x}` rows were label shifts too.
- **Impact**: size a formula in the oracle alone before trusting a row label.
- **Confidence**: High

## Observation: KaTeX tree distinguishes `'` from `^{\prime}` only by `loc`
- **Finding**: the parser-built `'` superscript is an `ordgroup` of `textord \prime` with NO `loc`; a written `^{\prime}` carries `loc`. JLaTeXMath builds `'` as `CumulativeScriptsAtom` (empty subscript row beside the primes), `^{\prime}` as a plain superscript.
- **Impact**: `convert.ts#isPrimes` depends on KaTeX leaving `loc` off synthesized nodes.
- **Confidence**: Medium (KaTeX 0.16 behaviour, observed)

## Observation: nested RowAtom inherits the outer previous atom
- **Finding**: `Dummy#setPreviousAtom` hands the outer row's previous atom to a nested `RowAtom`/`ColorAtom`/`PhantomAtom`, so a nested row that starts with a kern still glues its first non-kern to what precedes it (`{\stackrel..}{\quad\text{or}\quad}`: glue before `or`).
- **Impact**: `rowBox(..., inherited)`.
- **Confidence**: High
