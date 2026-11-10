# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Port file for file at `src/diagrams/ebnf/`, not a `src/core/railroad/` IR
`CLAUDE.md`: "Upstream architecture is authoritative" and "Preserve upstream names". Upstream keeps the whole engine,
tiles included, in one flat package: `ebnf/` has 33 files (3,967 lines), 32 to port (`package-info.java` is not).
`src/diagrams/ebnf/` mirrors it flat. `regexdiagram/PSystemRegex.java` imports 11 of its classes
(`ETile`, `ETileAlternation`, `ETileBox`, `ETileConcatenation`, `ETileLookAheadOrBehind`, `ETileNamedGroup`,
`ETileOneOrMore`, `ETileOptional`, `ETileRegexGroup`, `ETileRegexGroupAllBut`, `ETileZeroOrMore`, `Symbol`), so #126
will import them from `src/diagrams/ebnf/` with its own layering allowlist entry.
**Evidence:** `wc -l ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/*.java`; `grep -ho "ebnf\.[A-Za-z]*"
regexdiagram/*.java`. **Rejected:** `planning/mission-guide.md` Track SI-3 and Phase 5f, which ask for a shared
`src/core/railroad/` intermediate representation with an EBNF→IR and a regex→IR translation. Upstream has no such IR:
both engines build `ETile`s directly. The guide predates the "upstream architecture is authoritative" rule; a new IR
is a structural divergence. T6 corrects the guide's two sections.

### D2 — Substrate: the board/nwdiag plugin shape on klimt
`PSystemEbnf extends TitledDiagram` (`src/core/TitledDiagram.ts`), as `board/BoardDiagram.ts` and
`nwdiag/NwDiagram.ts` do; it overrides no margins, so it takes `TitledDiagram`'s. `index.ts` mirrors
`nwdiag/index.ts` with `EBNF` and the style name `ebnf` (`DiagramType.java:280-281`;
`src/core/svek/diagram-type-style-name.ts:26` already has `EBNF: 'ebnf'`). `ebnf-skin-param.ts` mirrors
`nwdiag-skin-param.ts`. Seams: `src/core/block-extractor.ts` gains `'ebnf'` in `DiagramType`, the start-tag map and
`PORT_TO_UPSTREAM` (`EBNF`); `src/core/document-back-color.ts` `STYLE_NAMES` gains `ebnf: 'ebnf', // java:280-281`
and its comment stops saying EBNF has no member; `src/registered-plugins.ts` registers `ebnfPlugin` after `hclPlugin`
with `// java:196`; `src/core/assemble-svg.ts` adds `EBNF` to the titled path beside `NWDIAG`. The factory follows
`board/BoardDiagramFactory.ts` and `nwdiag/NwDiagramFactory.ts`: its own `CommonCommands.addCommonCommands1`
dispatch, as every engine in this repo keeps (`grep -rln addCommonCommands1 src` lists 19 files), and
`activity-legacy/ActivityDiagramFactory.ts`'s `ubrex`/`singleLine`/`multiLine` wrappers, the one factory that already
drives UBrex single-line and multi-line commands. **Rejected:** extracting a shared `CommonCommands` into `src/core/`:
"do not refactor while porting".

### D3 — The four upstream seams go to their upstream homes
The engine imports four things this port lacks. Each is ported where upstream keeps it:
- `utils/CharInspector.java`, `CharInspectorImpl.java` and `BlocLines#inspector`/`inspectorWithNewlines` →
  `src/core/utils/` (`BlocLines.ts:8-9` already says "`CharInspectorImpl` has no port. A caller that needs one ports
  it here");
- `command/UBrexCommandMultilines2.java` (152 lines) → `src/core/command/UBrexCommandMultilines2.ts`, beside
  `CommandMultilines2.ts` and `UBrexSingleLineCommand2.ts`, implementing their `MultilineCommand<S>` contract;
- `utils/I18n.java` and the eight `src/main/resources/i18n*.properties` bundles (9 `regex.*` keys each) →
  `src/core/utils/I18n.ts` and `i18n-bundles.ts` (D6);
- `activitydiagram3/ftile/vcompact/FloatingNote.java` → `src/diagrams/activity/ftile/vcompact/FloatingNote.ts`, on the
  existing `Opale` (`src/core/svek/image/Opale.ts`), `SheetBlock1` and `SheetBlock2`. `tests/architecture/layering.test.ts`
  gains `{ from: 'src/diagrams/ebnf/', to: 'src/diagrams/activity/ftile/' }` with a `why` citing
  `EbnfExpression.java` and `PSystemEbnf.java`'s import, the way mindmap's and wbs's `FtileBoxOld` entries read. The
  activity engine keeps its own note drawing; T1c does not rewire it.
**Rejected:** EBNF-local copies of any of the four: a second copy drifts, and #126 needs `UBrexCommandMultilines2`
and `I18n` too.

### D4 — The whole package, including regex-only tiles and an unregistered command
`ETileOptional`, `ETileNamedGroup`, `ETileRegexGroup`, `ETileRegexGroupAllBut` and `ETileLookAheadOrBehind` are
unreachable from EBNF (no class in `ebnf/` names them) but live in this package and are what #126 consumes; the
issue's title says "and its railroad tiles". T2c ports them with unit tests whose expected geometry comes from the
`regex` bucket's cached jar SVGs (`test-results/dot-cache/regex/*/in.svg`). `CommandNoteMultilines` is in the package
but `PSystemEbnfFactory#initCommandsList` never adds it; T3b ports it and `PSystemEbnf#addNote`'s `colors` argument,
does **not** register it, and tests it directly. **Rejected:** leaving any of them for #126: "an external source
defines it — completeness IS that source", and splitting one Java package across two missions leaves `ETile`'s
consumers half-ported.

### D5 — Collection order: no Java hash replay
Planning read every collection in the package. `ETileBox.VALUE_MAP` is a `HashMap` read only through `containsKey`
and `get`; `EbnfEngine.stack` is an `ArrayDeque` used as a stack (`addFirst`/`removeFirst`/`peekFirst`);
`EbnfExpression.tokens`, `PSystemEbnf.expressions` and the tiles' child lists are `ArrayList`s; `ShuntingYard` uses
`ArrayList` and `ArrayDeque`. No output depends on hash iteration. T2a journals any collection this missed.

### D6 — `I18n`: the JVM branch, bundles as data, the root bundle for no language
`I18n.getLocalizedValue` has a TeaVM branch (returns `defaultValue`) and a JVM branch (`ResourceBundle.getBundle("i18n",
Locale.forLanguageTag(language))`, `language` defaulting to `Locale.getDefault()`). The oracle is the JVM jar: the
probe `cov-descriptive-names` draws `AnyChar` and `Digit`, and `cov-descriptive-names-fr` draws `ToutCaractère` and
`Chiffre`. Port the JVM branch with the eight bundles as a `Record` of `Record`s. With no `!option language`, and for
a language with no bundle, resolve to the root bundle: `i18n.properties` is byte-identical to `i18n_en.properties`
(`diff` at planning), so this equals the oracle machine's English default. Keep `IllegalArgumentException` for a null
key or default as thrown `Error`s. `zh_CN` and `zh_TW` resolve from `zh-CN`/`zh-TW` and `zh_CN`/`zh_TW` tags the way
`Locale.forLanguageTag` does; T1a reads `Locale.forLanguageTag`'s handling of `_` before writing that branch and
journals it. **Rejected:** the TeaVM branch: the jar never takes it, and the probe shows localisation.

### D7 — Fixtures: the 44 cached rows, then authored probes
Upstream ships no EBNF fixture beyond `DiagramTypeTest.java`, so `CLAUDE.md`'s "author `.puml` fixtures and generate
oracles" applies. The 23 planning probes in `probes/` are the floor; T4b adds what they miss: each chrome element alone
and with `scale 2`; a mainframe; `!theme` on two stdlib themes; `skinparam monochrome true`; `<style>` for `ebnf` and
`ebnf note` (font, colours, `LineThickness`, `Shadowing`, `RoundCorner`); `document { Margin 20 }`; every operator
alone and nested two deep; `}-` alone; `n * x` for 1, 2 and 10; `-` (except) inside a group; `(* *)` above and below
a name together; a multi-line rule with a comment on each line; `(**` … `**)` across three lines; creole and a sprite
inside a comment; `\n` in a comment; `{{ebnf}}` in a sequence note and in a class note; an unknown line; three rules
of different widths (the `mergeTB(…, LEFT)` stack). **Rejected:** stopping at the 44 rows: they reach no `-`, no note
style, no mainframe, two chrome rows and one `scale`.

### D8 — What ends a row, and `ladifa`
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named
divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a
"Blocked by" line added to #136. **No row ends unnamed.** Planning found no forcing library in EBNF: it never reaches
graphviz, Smetana, KaTeX or the `{{ }}` oracle seam on its own.

**`ladifa-97-keme950`.** Once T3b registers the commands, line 5 `?t? = 'chaud';` matches no command (the ID regex is
`[%pLN_][-%pLN_]*`, `CommandEBnfSingleLine.java`; the multi-line start is `「〴an_」`), so we refuse it with
`Syntax Error?` where the jar does, and the survey prints it conformant. That makes its signed "jar errors, we draw"
entry stale, and `tests/oracle/svg-conformance/emitter.golden.test.ts` ("no in-force entry names a fixture a fix has
since made conformant") goes red until the entry moves to `retired`. nwp met the same case at its T3a (nwp journal 22,
#165). Do what nwp did: move the one entry to `retired` with `retiredBy: "ebnf-engine-port T4a, unsigned: the maintainer
signs at review (#125)"`, and open a `needs-ruling` issue that names what the jar and the port now draw, links #165,
and says how to undo it. The issue asks for that `needs-ruling` issue and says "don't let them block it", so it is not
a stop. **Never add or change an acceptance.** **Rejected:** leaving the entry in force and the gate red (halts the
mission against the issue's instruction); re-signing it (reserved for the maintainer). `#165` is still open, so the
same review answers both.

### D9 — Ratchet: `svg-ebnf`, laid out like `svg-board`
EBNF has its own corpus bucket, as board and packet do, so goldens go flat under `oracle/goldens/svg-ebnf/<slug>/`
with `ratchet.json` entries `{ slug, addedAt, source: 'dot-cache' }` (`measurements/pin-ebnf.mts`). Copy
`nwdiag.golden.ratchet.test.ts`, `nwdiag.diff-baseline.ratchet.test.ts` and `render-fixture-nwdiag.ts` with `ebnf`
substituted and the bucket subdirectory dropped, reading `tests/fixtures/ebnf` for authored rows;
`render-fixture-ebnf.ts` defaults to the sprite + Twemoji + utility asset store, as the survey renders. No DOT
eligibility: EBNF has no svek stage. T5 re-pins the 43 `known-misroute` routing rows `agree`, `ourType: EBNF`, and the
refusal rows' `engine`, moving the count assertions by exactly the rows moved; `ladifa` stays `jar-error` unless the
gate's own rule says otherwise. `diff-baseline.json` is written **only if** a row stays nonzero (`ladifa`'s error pair
will). **Rejected:** nwdiag's `<bucket>/<slug>` layout: it exists because nwdiag rows live in `unknown`.

### D10 — Mirror upstream's quirks
Port each as the jar does it, with a one-line comment quoting the Java:
- `isCompact` stored by `EbnfExpression` and never read (`!pragma compact` changes nothing; `cov-compact`);
- `readString` reading to the separator with no end check, so an unterminated string reaches
  `CharInspectorImpl#jump`'s `IllegalStateException` (thrown `Error`, an error page; `cov-unterminated`);
- any other character clearing every token, then `Unparsable expression` (`cov-unparsable`);
- `protect("")` → `" "`, `}-` consuming its `-` with `it.jump()`, and `isLetterOrDigit` accepting `-` and `_`;
- `getUDrawable`'s catch-all returning `Syntax error!` (Java prints the stack trace; the port does not log);
- `ETile#addCommentAbove`/`addCommentBelow` defaults printing `Ignoring … comment` to `System.err`: a no-op here,
  since stderr is not output;
- `EbnfEngine#commentAbove`/`commentBelow` throwing `IllegalStateException` on an empty stack;
- `ETileBox`'s commented-out double rectangle is not ported.
**Rejected:** tidying any of them: no forcing library, so an unruled divergence.

### D11 — Serial, main checkout, one commit per task
The batches build one engine upward; worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until
T4a, so `npm test` stays green through batches 1 to 3. **Rejected:** parallel worktrees, and one big commit (the
journal cites per-task commits through `pre-squash`).

### D12 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. The longest Java files are
`EbnfExpression.java` (274) and `ETileBox.java` (266); the longest methods are `EbnfExpression`'s constructor (a
22-branch `if` chain), `ShuntingYard`'s constructor and `ETileAlternation#drawU`. Break long functions into named
helpers that keep the Java method's name on the entry point, with `@see` on each; a token table may replace the
single-character branches of the `if` chain only if every branch keeps its order and Java line in a comment.
`ETileBox`'s seven-argument constructor takes an options object. Files written through the shell skip the hook: run
`lizard` by hand (`.claude/memory/cep-status.md`).

### D13 — Errors mirror the jar's, not its page
An empty `@startebnf` is the jar's Welcome page (`cov-empty`): follow the factory's empty-diagram path the way
`BoardDiagramFactory.ts` and `NwDiagramFactory.ts` do. `Unparsable expression` and `Syntax Error?` carry Java's text.
`cov-unterminated`'s Java crash page gets a port message, mapped in a test the way `tests/unit/salt/factory/jar-rows.ts`
maps salt's; per `.claude/memory/error-page-conformance-rule.md`, matching the page's text or geometry is not a target
(`fixtures.mts` treats a jar crash page against our error page as `error-pair`).

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; the `ebnf` note in `scripts/parity-dashboard-notes.ts` is rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit; restore `ladifa`'s entry from `retired` if the maintainer says so (D8). No migration. |
| Scale | Each rule is a tile tree linear in its token count; the longest row is 46 lines. The ratchet grows by up to 44 golden rows plus the authored count; the routing and refusal gates gain 43 golden twins each. T6 names the CI risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-seam edit (`BlocLines`, `assemble-svg`, `Opale`) moves another row: `verdict-diff` names it. Coverage below 90 on the regex-only tiles (D4) if their tests are thin. Routing count assertions moved by the wrong number. |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T6. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |

## Baseline

Measured on `3deca6c92`, 2026-11-10, at planning. Committed `parity-*.json` (regenerated by nwp's T5 at 11:25 that
day): 5,423 conformant, 111 structural-match, 390 diverged, 3 oracle-error, of 5,927; `ebnf` 0 / 0 / 44; `class`
833 / 20 / 21; `regex` 0 / 0 / 46. Local `dot -V`: `16.1.0 (20260904.0139)`.

**Phase 8, 2026-11-10 12:02-12:14, on `3deca6c92`, load average 8-118 (outside processes): green.**
`npm test -- --maxWorkers=4` **exit 0**: 43,975 passed, 0 failed, 4 expected fail, 7 skipped, 6 todo, in 2,098 files
(2,097 passed, 1 skipped), 556.56 s; coverage 97.12 / 92.83 / 97.81 / 98.12 (statements / branches / functions /
lines). `npm run typecheck`, `npm run lint`, `npm run format:check` (with this brief in the tree) and `npm run build`
exit 0. **This green run is the baseline.** The working tree held only this brief and the planning progress file.
