## Observation: a `print` table's geometry is frozen on the AWT bounder
- **Context**: wrp T3c, `tests/fixtures/wire/cov-print-table`.
- **Finding**: `SkinParam#sheet` (`SkinParam.java:1291-1303`) caches a `CreoleParser` and `CreoleParser#createSheet` (`:129-139`) a `Sheet` per `Display`, so `AtomTable#initMap` memoizes the bounder that measured first. In wire that is `FileFormat.PNG`'s AWT bounder. Only `wire-skin-param.ts` ports the cache.
- **Impact**: any engine that measures with one bounder and draws with another shares this; other engines' skin params still build a fresh parser per call, so a table measured under a non-draw bounder would differ there.
- **Confidence**: High

## Observation: `jarMeasurer` never sees bold on the creole atom path
- **Context**: same fixture, ` b ` measured 12.622, the jar 13.218.
- **Finding**: `blocks-creole-atoms.ts#measuringFont` passes the structural `FontConfiguration`; its `styles` set is not `FontSpec.weight`, which is all `JarMeasurer#metricsFor` reads. `UText.ts#getFont` is not on that path. Wire's AWT bounder translates locally.
- **Impact**: production rendering (`jarMeasurer` by default) measures every bold creole run as plain. The deterministic survey cannot see it.
- **Confidence**: High

## Observation: `iu` regex compile is wider than Java on names and indents
- **Context**: `cov-indent-nbsp`, `cov-name-long-s`, `cov-name-kelvin`.
- **Finding**: `Pattern2.ts`'s `iu` makes `\s` hold NBSP and the Unicode spaces and folds U+017F into `s` and U+212A into `k`, including inside `\w`. Java does none of this. `Pattern2.ts`'s header already notes the `\s` half.
- **Impact**: any grammar with a `\w` name or a literal `s`/`k` accepts those characters where the jar answers `Syntax Error?`. Wire guards at the command; other engines do not.
- **Confidence**: High
