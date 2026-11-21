## Observation: upstream changes in 97a5992..a720bdd with no port and no issue
- **Context**: re-pinning json/yaml, refusal/routing, state DOT and dot goldens to the a720bdd jar (2026-11-20).
- **Finding**: four upstream behaviours are unported and uncovered by any issue, so their rows were left failing:
  (1) `0537b558644` rewrote `yaml/parser/YamlParser.java`, `YamlLine.java`, `Monomorph.java`: flow mappings `{...}`
  throw "flow mappings {...} are not supported", a repeated key throws "duplicate key 'a'", a block scalar keeps
  deeper indentation and stops at a less-indented line (`getBlockStyleString`, YamlParser.java:243-266); the jar
  then draws "Your data does not sound like YAML data". Rows: yaml/bafemu-96-luji978, jozapu-14-datu953,
  ketunu-15-poli031, authored yaml/flow-sequence, unwind2-S2b/yaml-dup-key. Independent of the Python interpreter.
  (2) `592901f0c42` (#3006): `Entity.muteToType` CLASS_LIKE_TYPES adds STRUCT/PROTOCOL/EXCEPTION/METACLASS/
  STEREOTYPE/ENTITY (Entity.java:208-226); unknown/petiku-70-fogu777 now renders CLASS, we error.
  (3) `CommandNumericPlayer` (1a8b87e2baa, 3cdc46b2092 #2502): `analog "Display" as CODE between a and b`;
  unknown/Timing-short-alias-7/8/9 now render TIMING, we error.
  (4) `a0a410773aa` (#2905): `<<junction>>` is its own pseudostate drawn as a circle; state/livuni-63-fira764
  sh0011 is now `shape=circle` 0.166667.
- **Impact**: each needs a port (or an issue) before its row can be re-pinned.
- **Confidence**: High (jar stderr / svek dumps and the upstream diffs read).

## Observation: oracle/goldens/svg-dot goldens are INSECURE captures
- **Context**: dot ratchet re-pin.
- **Finding**: the dot goldens are rendered with `PLANTUML_SECURITY_PROFILE=INSECURE scripts/oracle-render.sh`;
  the refusal/routing gates render that tree with `SecurityProfile.INSECURE` (`securityProfileOf`,
  corpus-gate-part.ts). `scripts/recapture-oracles.ts` / `scripts/lib/recapture-render.ts` do NOT set the profile,
  so a bulk re-capture would overwrite them with the LEGACY suppression page (the dot ratchet then fails loudly).
- **Impact**: re-capture svg-dot by hand under INSECURE, or teach the recapture tool the per-tree profile.
- **Confidence**: High

## Observation: preprocessor error pages count the wrong lines for the Welcome block
- **Context**: error-diagram test for the unclosed `!ifdef`.
- **Finding**: `PSystemErrorPreprocessor` gets `BlockUml#data`, the preprocessor's result list plus the error
  line (`BlockUml.java:156-161,195-196`, `TimLoader.java:79-85`), so `getTotalLineCountLessThan5` counts the
  OUTPUT lines. The port passes the raw block (`error-diagrams.ts:45`, `umlSourceOf(failure.input)`), so a
  5-line source whose `!define`/`!ifdef` lines vanish shows the Welcome block in the jar but not here
  (`@startuml / !define FOO / !ifdef FOO / Alice -> Bob / @enduml`).
- **Impact**: small faithful fix in src/core/error + preprocessor failure shape; not done in the re-pin.
- **Confidence**: High

## Observation: @startmath background colour after aa79d2d80ee
- **Context**: refusal-coverage colour check, unknown/caruta-83-deta919.
- **Finding**: the jar no longer writes a Batik document for `@startmath`; it draws on UGraphic and the
  background is `fill="#FF0"`. The port still reproduces Batik's envelope (`fill:yellow`), which the colour check
  flags now that the golden no longer carries `yellow`. The allowlist needs an issue number.
- **Impact**: either re-mirror the envelope to the UGraphic export or file an issue and allowlist it.
- **Confidence**: Medium (envelope vs glyph split of the accepted LaTeX divergence not ruled on)
