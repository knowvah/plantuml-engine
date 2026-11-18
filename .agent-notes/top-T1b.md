## Observation: the json theme residue has no reader
- **Context**: #180 T1b, moving `BUILTIN_THEMES` residue for moved themes into their packages.
- **Finding**: `Theme.colors.graph.json` (the whole `BUILTIN_THEMES` residue that `scripts/compile-themes.py` emits) is read only by `theme-merge.ts:69-70`. The json family paints from its jar styles (`src/diagrams/json/layout.ts:68-73`, `:198-204`). A residue with every json field set to `#ABCDEF` left `@startjson`, `@startyaml` and an embedded `json` entity byte-identical.
- **Impact**: `BUILTIN_THEMES`, `themes-builtin-{a-m,p-v}.ts`, `PackagedTheme.residue` and the residue half of `compile-themes.py` are dead data. A dedicated cleanup could delete them; until then they cost bundle bytes only.
- **Confidence**: High (grep of `src/` plus a render probe on three surfaces).
