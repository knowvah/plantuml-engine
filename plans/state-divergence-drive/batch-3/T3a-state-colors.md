# T3a — state `Colors`

Commit: `fix(state): read state colour specs through Colors`.

## Context
`CommandCreateState.java:216-228` builds `Colors` and merges the stereogroup's. `ast.ts:96-105` keeps `color` and `lineColor` as raw strings "unparsed". So `##[dashed]` draws no dasharray
(`puvaco-19`), `#line.dashed` the same (`sesafu-14`), `#pink;line:red;line.bold;text:red` no red and no thickness (`jotini-12`), and `##00FFFF` stays `#181818` (`fikuga-98`). The jar's dashed
state is `stroke-dasharray:7,7` at width 1, with the line going with it: `novolu-35`. `Cluster.java:452-456,480-484` reads the same `Colors` for a composite (D6, `core/abel/Colors.ts`).

## Read
`klimt/color/Colors.java`, `getSpecificLineStroke`; `EntityImageState.java`, `getStroke`; `CommandCreatePackageState.java`; `state-commands-declarations.ts:104-115,174,275`.

## Acceptance
- Given `puvaco-19-geka094`, `jotini-12-fuba072`, `novolu-35-fole223`, when rendered, then each is conformant.
- Given `vedapo-96` and `vagexa-37`, then stroke and dasharray diffs are gone, on leaves and composites both.
- Given `fikuga-98`, then `@stroke` equals `#0FF`.

Observability: N/A — no new observable operations. Rollback: Reversible.
