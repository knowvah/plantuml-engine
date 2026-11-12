# Decisions

Pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Location and names | `src/core/klimt/sprite/`, upstream's package, upstream's class names |
| D2 | Routing | plugin `'sprites'`, `@startsprites` tag, registered at java:170 |
| D3 | Test family | extend `svg-factories`, not a new family |
| D4 | `Sprite#asTextBlock` | reach it through the existing creole sprite atom, wrapped as a `TextBlock` |
| D5 | `getAllSpriteNames` | sorted registry keys, in `sprite-registry.ts` |
| D6 | Errors | the error-page rule: error and Welcome pairs are conformant |
| D7 | Jar stability | all 29 probes stable; every fixture re-checked |
| D8 | Mirror the jar | `HELP` type, creole names, last definition wins |
| D9 | How a fixture ends | zero, error pair, named divergence, or `needs-ruling` issue |
| D10 | Execution | serial, main checkout, no worktrees |
| D11 | Complexity hooks | split by upstream method, never by fitting |

### D1: Location and names
`ListSpriteDiagramFactory.java`, `ListSpriteDiagram.java` and `CommandListSprite.java` live in `klimt/sprite/`, so the
port goes in `src/core/klimt/sprite/` beside `PSystemListArchimateSprites.ts` (ufp's precedent for this package). The
plugin object `listSpritePlugin` is exported from `ListSpriteDiagramFactory.ts`, as `listArchimateSpritesPlugin` is
from `PSystemListArchimateSpritesFactory.ts`. The export is `listsprite-export.ts` (help's `help-export.ts` shape, plus
regex's chrome and scale). The common commands are `listsprite-common-commands.ts`, a copy of
`src/diagrams/regex/regex-common-commands.ts` (rep D2: every engine keeps its own dispatch). The skin param is
`listsprite-skin-param.ts`, a copy of `src/diagrams/regex/regex-skin-param.ts` cut to what this diagram reads. Hoisting
the copies into `src/core/` is a separate refactor, listed as a follow-on at T4.

### D2: Routing
- Plugin type `'sprites'` in `block-extractor.ts#DiagramType`, `START_SUFFIX_MAP` `sprites: 'sprites'`, and
  `PORT_TO_UPSTREAM` `sprites: UpstreamDiagramType.SPRITES`. `diagram-type-set.ts` already has `SPRITES` in both the
  `sprites` and `uml` candidate sets (`:134`, `:147`).
- Registered at java:170, between `definitionPlugin` (java:169) and `mathPlugin` (java:172).
- `listsprite` alone on a one-line `@startuml` stays with `listArchimateSpritesPlugin` (java:152, the single-line
  gate), because it is tried first. `oracle/goldens/svg-utility/xucoma-93-jeko861` must stay pinned.
- A new `@startuml` candidate can change which refusal wins the error page (`PSystemErrorUtils.java:140-147`, first of
  the equal top scores). This factory is last among the UML candidates that accept common commands, so it wins only
  where it parses strictly further. That moves us toward the jar. The survey checks it (stop 6).

**Rejected:** registering at the end of `registerFromSalt` (breaks the upstream-order invariant that
`utility-registration.test.ts` pins); routing `@startsprites` through `'help'` (upstream's factory is distinct;
`ListSpriteDiagram` only borrows the `HELP` type).

### D3: Test family: extend `svg-factories`
`svg-factories` is the family for the `PSystemBuilder` factories whose rows live in the `unknown` bucket (Definition
:169, Math :172, Latex :173, Creole :174, Help :188). ListSprite is :170 and its two corpus rows are `unknown` rows, so
it joins: `FACTORIES_SLUGS` gains `folutu-01-xuzo995` and `nujapi-78-mota753` (41 → 43), and the authored fixtures go in
`tests/fixtures/factories/` as `cov-sprites-*`. The harness already passes the survey's asset store and the fixture
include store, which the stdlib rows need. cmf's tools fit: `fixtures.mts` as is; T3 copies `pin-factories.mts`,
`repin-factories-baseline.mts`, `repin-factories-routing.mts` and `build-authored-baseline.mts` into
`plans/listsprite-factory-port/measurements/`, keeping cmf's reason tables and adding the new rows'.

**Rejected:** a new `svg-sprites` family (a fourth copy of the harness, ratchet tests and README for 2 corpus rows, and
a new `RATCHET_FAMILY` entry); `svg-utility` (its harness and gates are the single-line factories').

### D4: `Sprite#asTextBlock` through the creole sprite atom
Upstream's `AtomSprite` draws a sprite by calling the same method ListSprite calls: `sprite.asTextBlock(fontColor,
forcedColor, scale, backColor)` (`AtomSprite.java:66,77`). Our creole sprite atom
(`creole-atoms-image-resolver.ts#makeAtomImageResolverFor` → `resolveSpriteAtom`, drawn by `drawAtom`) is that port for
every sprite kind. T1b wraps it as a `TextBlock` in `sprite-text-block.ts` with `fontColor` `HColors.BLACK`,
`forcedColor` null, scale 1 and `backColor` null.

Before relying on it, T1b reads each `Sprite*.asTextBlock` and confirms that the atom's arguments map:
- `SpriteMonochrome.java:211-219` takes the background from `ug.getParam().getBackcolor()`, not the argument;
- `SpriteColor`, `SpriteImage` and `SpriteSvg` may read `backColor`.

The PNG bytes are exempt in `compareSvg` (`.claude/memory/conformant-is-not-divergence-gone.md`), but `width`, `height`
and `x`/`y` are not. If a kind does not map, port that kind's `asTextBlock` (push-forward) and journal it.

**Rejected:** porting `asTextBlock` on every sprite class first (it duplicates the tint, PNG and SVG-sprite paths the
atom already owns, against "check the catalog before implementing").

### D5: `getAllSpriteNames`
`SkinParam.java:802-804`: `new TreeSet<>(sprites.keySet())`, the diagram's own sprites only (`getSprite`'s
`SpriteImage.fromInternal` fallback at `:810-816` is not listed). Port it as `getAllSpriteNames(registry)` in
`sprite-registry.ts`, returning `[...registry.byName.keys()].sort()`. JavaScript's default sort compares UTF-16 code
units, as `String.compareTo` does. Planning evidence: `cov-sprites-mixed-order` draws `9nine HD Zeta _under alpha foo1
mdiHeadset`.

### D6: Errors mirror the jar's text, not its page
Rule: `.claude/memory/error-page-conformance-rule.md`. A pair of error pages counts as conformant, and the cmf
`fixtures.mts` prints `error-pair` for it.

| Probe | Jar | Mechanism to quote |
|---|---|---|
| `cov-sprites-startsprites-empty`, `-blank` | Welcome page | empty diagram, `PSystemCommandFactory.java:117-122` |
| `cov-sprites-err-garbage` | "Syntax Error?" at line 14 | no command claims the line, `PSystemCommandFactory.java:168-172` |
| `cov-sprites-err-listsprite-arg` | error at line 14 (`listsprite please`) | `CommandListSprite`'s `RegexLeaf.end()` (`:57`) |
| `cov-sprites-uml-garbage-then-listsprite` | error at line 15 | sequence parses further than ListSprite and owns the page |

### D7: Jar stability
All 29 probes were byte-identical over 3 renders at planning. `getAllSpriteNames` sorts, so there is no `HashMap`
order (no flow D4 problem). T2b reruns `jar-variants.mjs` over every fixture, 3 runs each. A fixture that is not
`stable` is stop 5.

### D8: Mirror the jar
- The root says `data-diagram-type="HELP"` (`ListSpriteDiagram.java:60`), and the style name is `activityDiagram`
  (`help-export.ts#HELP_STYLE_NAME`, `DiagramType.java:234-296`).
- Names are creole: `foo__bar__` draws `foo` plus underlined `bar`, `x--y--z` strikes `y` (`cov-sprites-creole-name`).
- A redefined name draws the last definition (`cov-sprites-redefine`; `addSprite` is `byName.set`).
- `scale`, `skinparam backgroundColor`, `<style> document`, `!option handwritten` and `skinparam monochrome` all reach
  the page (probes `scale`, `scale-max`, `skinparam-bg`, `style-doc`, `handwritten`, `pragma-monochrome`).

### D9: How a fixture ends
1. Zero diffs.
2. An error pair (D6).
3. Named in `DIVERGENCES.md` with a forcing library (platform glyphs, KaTeX).
4. On a `needs-ruling` issue, with everything else finished.

### D10: Execution
Serial, in the main checkout, no worktrees: agents using Serena write the main checkout
(`.claude/memory/agents-write-main-via-serena.md`), and the write-sets chain through `ListSpriteDiagram.ts` and
`ListSpriteDiagramFactory.ts`.

### D11: Complexity hooks
The hooks block 500-line files, 30-NLOC functions, CCN 10 and 5 parameters. Split along upstream's own methods (the
`layout` loop, the command list), never by inventing a structure the Java lacks.

## Operational readiness (auto-confirmed, unattended)

- **Observability:** N/A. A browser-safe library with no service, no SLI, no trace; the measure is the conformance
  survey and the ratchets.
- **Rollback:** Reversible: revert the mission's one squashed commit. No data or schema.
- **Scalability:** a page draws every sprite once; stdlib-heavy sources (hundreds of sprites) cost one PNG encode
  each, the same work the creole atom already does.
- **On-call:** none. Failure modes are conformance diffs, caught by the ratchets.
- **Backwards compatibility:** sources that rendered our refusal page now draw the jar's page. No API or type change
  beyond the internal `DiagramType` union.

## Auto-confirmed (unattended)

Phase 3 took the recommendation for each decision; the rejected options are under D2, D3 and D4. Evidence:
- D2: `PSystemBuilder.java:170`, `DiagramType.java:193-200`, `src/registered-plugins.ts:95-125`.
- D3: `oracle/goldens/svg-factories/README.md` ("the creole, math, latex, definition and help factories ...
  `PSystemBuilder.java:169` ... `:188`"), the 29 probes measured through `measureAuthoredFactories`.
- D4: `AtomSprite.java:55-77`, `SpriteMonochrome.java:211-219`, `creole-atoms-image-resolver.ts:472-495`.
No decision needed a ruling: the issue's own done-when list covers rulings, and no probe showed jar nondeterminism.
