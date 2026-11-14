## Observation: #109's sequence rows cannot be pinned with the existing tools
- **Context**: planning #139 (sequence-oracle-gap-rows), 2026-11-13 on `a3840fb61`
- **Finding**: the 94 sequence rows #109 captured have no `oracle/goldens/svg-sequence/diff-baseline.json` row. `pin-goldens.mts` (sdd1-sdd3) refuses a slug without a `status: "baseline"` row (`pin-goldens.mts:104-112`), and `scripts/repin-sequence-baselines.ts` only updates existing rows, never adds one. Their routing and refusal twins do exist (93 `agree`/`ok`; `teoz-ng-001-11` is `known-misroute`/`known-gap`).
- **Impact**: any capture that adds sequence rows needs a seeding step before pinning. sogr T1 writes a mission-local seed tool.
- **Confidence**: High

## Observation: upstream draws every sequence diagram with teoz
- **Context**: checking whether `teoz-ng-001-11` (no `!pragma teoz`) goes through `PartitionTile`
- **Finding**: `SequenceDiagram.java:311-312` returns `SequenceDiagramFileMakerTeoz` unconditionally (the `modeTeoz()` check is commented out). So the `teoz/` tiles are the spec for every sequence row, pragma or not.
- **Impact**: a sequence fix reads `teoz/`, never puma's `graphic/` drawing code.
- **Confidence**: High

## Observation: AtomOpenIconic's url comment is true for only one caller
- **Context**: diagnosing `tupema-84-tako461` (an OpenIconic inside `[[url label]]`)
- **Finding**: `src/core/klimt/creole/atom/AtomOpenIconic.ts:100` says `url` is always `null` "from `addOpenIcon`". That matches `StripeSimple.java:242`, but `AtomTextUtils.java:117` passes the link's url, and `AtomOpenIconic.java:77-82` wraps the glyph in `startUrl`/`closeUrl`.
- **Impact**: an OpenIconic inside a link label loses its `<a>` wrapper. sogr T2d owns it.
- **Confidence**: High (Java read); which port creole path sequence labels use is unverified
