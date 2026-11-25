# snl planning observations (2026-11-24)

## Observation: jar transition-label ids carry the wall clock
- **Context**: rendering #235 probes through scripts/oracle-render.sh
- **Finding**: `CommandLinkStateCommon.java:394` appends `System.currentTimeMillis()`; ids differ per run and per
  transition (`snl-duplicate`: …288 and …293). Equal millis would make `reallyCreateLeaf` throw
  (`CucaDiagram.java:223-224`).
- **Impact**: byte comparison needs a normaliser; a frozen port clock would merge identical transitions.
- **Confidence**: High

## Observation: Link.setWeight has no reader upstream
- **Context**: node-style links call `setWeight(10.0)`
- **Finding**: `grep -rn 'getWeight()' src/main/java/net/` finds only `abel/Link.java:320`; the jar DOT has no weight.
- **Impact**: do not emit weight for these links.
- **Confidence**: High

## Observation: state's arrow-style regex is a local copy
- **Context**: `-[nonode]->` refused by the port
- **Finding**: `src/diagrams/state/state-transitions.ts:57-58` re-declares the key list; upstream state imports
  `CommandLinkElement.LINE_STYLE`. The shared `src/core/link-style-regex.ts` also lacks `nonode`.
- **Impact**: grammar keywords added upstream silently miss state.
- **Confidence**: High

## Observation: `A --> B :  ` is a jar error, the port draws it
- **Context**: authoring a blank-label probe
- **Finding**: the jar reports `Error line 4` with or without node style; unrelated to #235.
- **Impact**: separate issue, filed at snl T0.
- **Confidence**: High
