## Observation: the subclass links of `d`/`o` carry SUPERSET, not SUBSET
- **Context**: writing the cov-multi-d decor test.
- **Finding**: `CommandMultiSubclass.java:150-151` calls `withMiddleSuperset()` on every subclass link when the symbol
  is not `U`; `U` puts SUPERSET on the superclass link (`:133-134`). `->-` in `CommandSimpleSubclass` is also SUPERSET
  and `-<-` is SUBSET. The probe slug names (`cov-subclass-super`/`-sub`) match, the "subset on subclass links" reading
  of T2b's acceptance text does not.
- **Impact**: the decor test asserts `LinkMiddleDecor` per link from the parsed diagram, so T2d can rely on it.
- **Confidence**: High

## Observation: MiddleDecor gained two values, drawMiddleDecor became a thin dispatcher
- **Context**: `SvekEdge` input carries `MiddleDecor` (lowercase union), not `LinkMiddleDecor`.
- **Finding**: added `'subset' | 'superset'` to `MiddleDecor` (CIRCLE arms moved into `drawCircleMiddleDecor`, body
  unchanged). T2d must map `LinkMiddleDecor.SUBSET`/`SUPERSET` to those strings when building `SvekEdgeInput`.
  `labelShield = 7` already holds for any defined `middleDecor` (`SvekEdge.ts#drawLabelBlock`); the layout-side
  `hasMiddleDecor` flags are per engine and T2c must set it for Chen.
- **Confidence**: High
