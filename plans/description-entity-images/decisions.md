# Decisions

Pre-made. A finding that contradicts one is stop 4: amend this file with the date, then halt.

## D1: the images are new core ports, consumed by description only

`EntityImageJson` + `TextBlockCucaJSon`, `EntityImageMap`, `BoxedCharacter` and the four domain images are ported from
the Java into `src/core/` (`svek/image/` for the two upstream `svek/image` classes, a new `src/core/descdiagram/` for the
five upstream `descdiagram` classes). Description consumes them. Class (`class-map-*`, `class-json-sizing.ts`) and state
(`state-json-*`, `renderer-json.ts`) keep their own copies, untouched.

- **Why:** upstream has one image per leaf type, outside any diagram package (`svek/image/EntityImageJson.java`,
  `EntityImageMap.java`); `tests/architecture/layering.test.ts` rule 2 forbids description importing class or state.
  State's copy is a documented partial port (`state-json-sizing.ts:15-26`: "Only the DIMENSION formula is ported"), and
  class's map is bound to class's `Classifier` AST (`class-map-sizing.ts:26-55`), so neither is a faithful seam to lift.
- **Rejected:** (a) relocating state's json to core and reusing it: it is not the full image, and every state pin would
  ride on the move. (b) Importing class's map: rule 2. (c) Re-pointing class and state at the new core ports in this
  mission: a refactor while porting (CLAUDE.md "Do not refactor while porting"); a later shared-seam mission may do it,
  noted in `planning/next-missions.md` at the exit.

## D2: the leaf kind is a new `DescriptiveNode` field, not new `USymbol` members

`DescriptiveNode` gains `leafType?: 'json' | 'map' | 'domain' | 'requirement'` (upstream `LeafType.JSON`, `MAP`, `DOMAIN`,
`REQUIREMENT`), plus the payload each needs (`jsonValue` reusing `core/command/JsonNode.ts`; map rows from D3). Absent
means today's `LeafType.DESCRIPTION` path, unchanged.

- **Why:** upstream dispatches these on `leaf.getLeafType()` (`GeneralImageBuilder.java:183,186,235-255`), not on
  `USymbol`. `CommandCreateDomain` passes `USymbols.fromString(typeString, …)` (`CommandCreateDomain.java`, `executeArg`),
  which answers `null` for `domain`, `requirement`, `machine`, `causal`, … (`USymbols.java:122-181`: no branch matches, so `usymbol` stays `null`; re-read it
  in T4a). `USymbol` (`src/core/descriptive-keywords.ts:31`) is the `ALL_TYPES` keyword table; widening it would let
  every `symbol` switch in description see shapes upstream never routes through `USymbol`.
- **Rejected:** extending the `USymbol` union (the `port`/`note` precedent); those are keywords upstream does route
  through the element grammar, these are not.

## D3: commands go in upstream's registration order, reusing the shared json port

Description's command table adds, in `DescriptionDiagramFactory.java:129-131,137` order: `CommandCreateMap`,
`CommandCreateJson`, `CommandCreateJsonSingleLine`, then (after the archimate commands) `CommandCreateDomain`.

- `json`: adapt `src/core/command/CommandCreateJson.ts` (already shared by class and state, `jsonCommands`) as those two
  engines do (`class-json-commands.ts`, `state-json-commands.ts`).
- `map`: port `CommandCreateMap` + `BodierMap` as a pure core body parser (`src/core/command/BodierMap.ts`) with a
  description adapter. Class's `class-map-commands.ts` stays (D1).
- `domain`/`requirement`: a description-only command (`command-domain.ts`); `GroupType.DOMAIN`/`REQUIREMENT` groups go
  through `gotoGroup` with the `null` usymbol, so the cluster takes whatever style a null-usymbol group takes upstream
  (`Cluster`, read it in T4a). The `rukitu` oracle draws both groups as package tabs.

## D4: boxed-character letters are captured jar outlines

`BoxedCharacter` draws `UCenteredCharacter(c, UFontFactory.byDefault(8))` (`EntityImageDomain.java:84`,
`BoxedCharacter.java:69-81`). The SVG driver writes the glyph's AWT outline, which cannot be computed in a browser. Follow
`src/core/spot-glyph-data.ts`: scrape each (size 8, letter) outline from an authored oracle, store it at its own centre,
translate at draw time. Letters needed: `X`, `C`, `B`, `P` (`GeneralImageBuilder.java:243-253`). A letter with no capture
draws nothing and fails its fixture; never substitute another size or letter.

- **Why:** this is the existing captured-outline mechanism (spot letters, class badges), byte-identical to the jar, so it
  is not a divergence (D5).

## D5: no new divergence

Every row and fixture is matched to the jar's bytes. `DIVERGENCES.md` and `oracle/accepted-divergences.json` stay
unchanged. A residual that only a library could force is a `needs-ruling` issue, not an entry.

## D6: separable residuals are filed, not chased

A row is separable when its last diffs come from a mechanism outside the commands and images listed in the README table,
measured by naming the first diff's producer at `file:line`. File a `queue:ready` + `parity` issue with the probe, both
outputs' attributes and the upstream `file:line`, then continue.

## D7: no public API change

`dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` stay byte-identical to the T0 snapshot. `DescriptiveNode` and
`USymbol` do not reach them today (grep of `dist/plantuml-engine.d.ts`, 2026-11-16: `USymbol` appears only in comments).

## Operational readiness (auto-confirmed, unattended)

- **Observability:** N/A. A browser-safe rendering library with no services; no new observable operations.
- **Rollback:** Reversible. Revert the squash commit; tag `description-entity-images/pre-squash` keeps the history.
- **Scalability:** four regex commands added to description's table; each is tried only on lines no earlier command
  took. The new tests render about ten small fixtures.
- **On-call:** N/A. The failure mode is a wrong SVG, caught by the ratchets.
- **Backwards compatibility:** no API, d.ts or data contract change (D7). Behaviour changes only for sources that
  were a Syntax Error page in description and that the jar draws.

## Auto-confirmed (unattended)

Phase 3 took the recommendation for each decision above. Evidence and rejected options are in each section:

- D1 (core ports, no relocation) over relocating state's json or importing class's map. Evidence: `state-json-sizing.ts:15-26`,
  `class-map-sizing.ts:26-55`, layering rule 2.
- D2 (`leafType` field) over widening `USymbol`. Evidence: `GeneralImageBuilder.java:183,186,235-255`.
- D3 (upstream order, shared json port) over a description-local json clone. Evidence: `DescriptionDiagramFactory.java:129-137`,
  `src/core/command/CommandCreateJson.ts` already shared.
- D4 (captured outlines) over drawing `<text>` letters. Evidence: `src/core/spot-glyph-data.ts` doc, `BoxedCharacter.java:69-81`.
- Scope: all three rows are planned. None needs a maintainer ruling; the issue states its done-when.

### D4 amendment, 2026-11-16 (execution)

The glyph font is not size 8. `UFontFactory.byDefault(int size)` ignores its argument and returns `sansSerif(12)`
(`UFontFactory.java:66-68`), so `BoxedCharacter` draws its letter in SansSerif plain 12. The decision itself stands:
captured jar outlines, stored at the capture's box centre and translated at draw time (`src/core/descdiagram/
boxed-glyph-data.ts`), keyed to that font (`isBoxedCharacterFont`) so the circled-character spot tables (Monospaced
bold) never answer for it. Judged a corrected premise, not a contradiction of the decision, so execution continued
(journal row 17).
