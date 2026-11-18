## Observation: SvgGraphics root is minDim + 1
- **Context**: building GraphicsPath's fixed 50×50 SVG page on UGraphicSvg (insecure-path-egg T2a)
- **Finding**: `basicSvgOption({ minDim: { width: 50, height: 50 } })` yields a 51×51 root. `ensureVisible` is `maxX = (int)(x + 1)` (`SvgGraphics.java:129-135`, mirrored in `svg-graphics-core.ts`) and the constructor calls it with minDim. Ink past the canvas grows it further. For a truly fixed canvas use the port-only `SvgOption.fixedDim`.
- **Impact**: any port-only fixed-size SVG page (a PNG-only upstream export) needs `fixedDim`, not `minDim`.
- **Confidence**: High

## Observation: the port has no HColor arm in UGraphic#apply
- **Context**: porting `ug.apply((UChange) HColors.BLACK)` (`GraphicsPath.java:81`)
- **Finding**: `AbstractCommonUGraphic.ts#apply` handles `Fore`/`Back`, not a bare `HColor`; `ug.apply(HColors.BLACK)` typechecks but is a silent no-op, and the default colour draws nothing. Spell it `ug.apply(new Fore(color))`.
- **Impact**: a silent blank drawing when porting any `ug.apply(color)` call verbatim.
- **Confidence**: High

## Observation: Pattern2.compileInternal folds Unicode case
- **Context**: porting `Pattern2.cmpile("^path[%s]+([0-9A-Za-z]+)$")`
- **Finding**: `src/core/regex/Pattern2.ts#compileInternal` uses `iu`, so `[A-Za-z]` also matches `ſ` and the Kelvin sign; Java `CASE_INSENSITIVE` without `UNICODE_CASE` folds ASCII only. A JS `i` flag without `u` matches Java exactly.
- **Impact**: where a non-ASCII character in a matched group changes behaviour (here, a crash vs a syntax error), write the regex with `i` alone.
- **Confidence**: High

## Observation: `npm test -- <path>` fails on coverage for any subset
- **Context**: running the factories ratchet per the brief
- **Finding**: `npm test` runs `vitest run --coverage`, and the global 90% threshold fails a subset run even when every test passes (exit 1). Use `npx vitest run <path> --coverage.enabled=false` for subsets.
- **Impact**: a subset run's exit code is not a test result.
- **Confidence**: High
