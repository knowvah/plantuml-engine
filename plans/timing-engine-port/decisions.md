# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Port file for file at `src/diagrams/timing/`, with `command/` and `graphic/` beside it
`CLAUDE.md`: "Upstream architecture is authoritative" and "Preserve upstream names". `timingdiagram/` has 68 files
(8,011 lines): 27 at the top level, 24 in `command/`, 17 in `graphic/`. The port mirrors the three directories:
`src/diagrams/timing/`, `src/diagrams/timing/command/`, `src/diagrams/timing/graphic/`, one `.ts` per `.java`, upstream
names (`TimeAxisStategy`, `getOuputQueue`-style misspellings included). Not ported: `package-info.java`, and
`command/CommandStopAt.java`, whose registration is commented out (`TimingDiagramFactory.java:108`
`// cmds.add(new CommandStopAt());`) so no source reaches it; the factory carries that line as a comment. The methods it
would have called (`TimingDiagram#setStopAt`, `TimingRuler#setStopAt`) are ported with their classes and unit-tested
directly, because "do not refactor while porting" keeps them.
The planning deep dive `planning/timing-deepdive.md` predates the file-for-file rule (it proposes `ast.ts`,
`parser.ts`, `panels/*.ts`): it is context, not the layout. T6 marks it superseded.
**Evidence:** `find timingdiagram -name '*.java' | xargs wc -l`; `TimingDiagramFactory.java:83-109`.
**Rejected:** the deep dive's AST/parser/renderer split (a structural divergence, which `CLAUDE.md` calls the bug);
porting `CommandStopAt` (unreachable).

### D2 — Substrate: the nwdiag/packet plugin shape, with per-engine helper copies
`TimingDiagram extends TitledDiagram implements Clocks` (`TimingDiagram.java:74`) and exports one `TextBlock`
(`getTextBlock`, java:98-114, `TextBlockUtils.withMargin(result, 10, 10)`), as `NwDiagram` and `PacketDiagram` do:
`src/diagrams/nwdiag/index.ts` is the plugin shape (canvas from `calculateDimension`, chrome around `BODY_ANCHOR`,
`TextBlockExporter`). `DiagramType.TIMING`'s style name is `timingDiagram` (`DiagramType.java:274-275`).
The factory is `CommonCommands.addCommonCommands1`, then `CommandFootboxIgnored`, then the 22 timing commands in the
order of `TimingDiagramFactory.java:85-107`, each inside `ProtectedCommand` (`AbstractDiagram.java:173-180`). Every
engine here keeps its own copies of the dispatch helpers (`grep -rln addCommonCommands1 src`): copy the closest
(`regex-common-commands.ts` or nwdiag's) as `timing-common-commands.ts`, and `nwdiag-skin-param.ts` as
`timing-skin-param.ts`, widened only by members a timing class reaches (`TimeArrow`, `TimingNote`, the creole sheets);
members it never reaches throw `unported:`. `CommandFootboxIgnored` (regex form, `command/CommandFootboxIgnored.java`)
has only a `UBrex` port today (`src/core/command/UBrexCommandFootboxIgnored.ts`): port the regex form beside it in
`src/core/command/`, upstream's package.
**Rejected:** importing another engine's helpers (they are typed on that engine's diagram), or extracting a shared
`CommonCommands`: "do not refactor while porting".

### D3 — `java.math.BigDecimal`: a subset at `src/core/decimal/BigDecimal.ts`
`TimeTick` holds a `BigDecimal` (`TimeTick.java:41`), and so do clock periods, pulses and offsets
(`PlayerClock.java:49-51`). Its semantics decide output: `compareTo` ignores scale, so `@1` and `@1.0` are one tick in
a `TreeSet` (D6); `toPlainString` prints the scale (`@2.50` labels `2.50`, `TimingFormat.java:65`); `longValueExact`
throws `ArithmeticException` on a fraction (java:63) and `longValue` truncates (`TimingRuler.java:153,165,285,302`).
A JS `number` gets all three wrong. Port the members timing calls and nothing else, as `src/core/time/` ports a
`java.time` subset with a README naming each: a `bigint` unscaled value and an `int` scale; `new BigDecimal(String)`
with Java's grammar (sign, `.5`, `5.`, exponent) and its `NumberFormatException` (`"-."`, `""`), `valueOf(long)`,
`ZERO`, `add`, `multiply`, `compareTo`, `signum`, `abs`, `max`, `min`, `negate` if reached, `doubleValue` (correctly
rounded: `Number()` of the plain string), `longValue`, `longValueExact`, `toPlainString`, `toString` (Java's
scientific form where the exponent rule applies, `BigDecimal.java#layoutChars`). Each member cites the JDK method in
JSDoc. T1a enumerates the call sites with `grep -rn 'BigDecimal\|getTime()\.' timingdiagram/` first.
`src/core/math/` is taken by `net.sourceforge.plantuml.math` (AsciiMath), hence `decimal/`.
**Rejected:** `number` with ad-hoc formatting (loses scale and exactness, the `TreeSet` equality and the exceptions);
a third-party decimal library (a dependency for six methods, and its `toString` is not Java's).

### D4 — Time formats: integer GMT arithmetic, and the clock zone for `use date format`
Three formats (`TimingFormat.java:46-48`) and one user format:
- `DECIMAL`: `time.toPlainString()` (java:65).
- `HOUR`: `String.format("%d:%02d:%02d", h, m, s)` on `longValueExact()` seconds (java:72-77); note `(int) time % 60`
  casts before the modulo.
- `DATE`: the month and day of `time * 1000` ms in a `GregorianCalendar(GMT)` as `%02d/%02d` (java:79-92);
  `createDate(yyyy, mm, dd)` sets the same calendar **leniently** (`gc.set(yyyy, mm - 1, dd)` after
  `setTimeInMillis(0)`, java:95-101). Probe `cov-date-lenient`: `@2020/13/45` draws `02/14`. `GregorianCalendar` keeps
  the Julian calendar before 1582-10-15: probe `cov-date-julian` (`@1500/01/01`) is a jar crash page,
  `IllegalStateException`, whose throw site T1a finds and mirrors. Implement on `src/core/time/` (`LocalDate`
  epoch-day arithmetic) plus the Julian rule; no `Date` object (`CLAUDE.md`: no host clock in rendering paths).
- `use date format "<p>"`: `new SimpleDateFormat(p, Locale.US)` (`TimingDiagram.java:409-415`), which formats in the
  **JVM default time zone**. Probe `cov-date-format` (`YY-MM-dd`, ticks `2020/07/04`, `2020/07/10`) draws `20-07-03`
  and `20-07-09` on the planning host (America/Chicago), and corpus row `mekivo-95-xafe506` (`use date format "yyyy"`)
  draws `1991` for `1992/01/01`. The zone is the injected `Clock.zone` (`src/core/clock.ts`, `renderClock`), exactly as
  gantt reads "local" (gep D3): `isClockDependentSource` (`tests/oracle/svg-conformance/capture-clock.ts:114`) learns
  `use date format`, and `oracle/capture-clock.json` gains a row for every such source (`scripts/record-capture-clock.ts`;
  `scripts/oracle-render.sh` records authored ones itself). Patterns go through
  `src/core/tim/builtin/date-format.ts#formatDate`, extended at its home with any letter a timing source needs; Java's
  constructor throws `IllegalArgumentException` on an unquoted letter outside `GyMdkHmsSEDFwWahKzZYuXL`, which
  `useDateFormat` turns into `Bad date format` (java:413): add that check as a separate export so `%date`'s
  behaviour does not move.
**Rejected:** formatting in UTC (`cov-date-format` and `mekivo` diverge by a day or a year); the host zone (the library
is browser-safe and deterministic).

### D5 — `DecimalFormat`: the subset `DeduceFormat` builds, and upstream's two tests
Analog players label values through `DeduceFormat#getDecimalFormat` (`DeduceFormat.java:85-111`: a `0`/`#` pattern,
`DecimalFormatSymbols(Locale.US)`), merged in `TimeSeries` (java:102). `DecimalFormat` rounds `HALF_EVEN` and has its
own grouping and exponent rules: port only the pattern shapes `DeduceFormat` can build, in `DeduceFormat.ts` or a
`decimal-format.ts` beside it, each rule citing the JDK. Upstream ships `DeduceFormatTest.java` (93 lines) and
`TimeSeriesTest.java` (133 lines) in `src/test/java/net/sourceforge/plantuml/timingdiagram/`: port both, case for
case, under `tests/unit/timing/`.
**Rejected:** `toFixed` (rounds half away from zero on binary values; `0.125` differs).

### D6 — Collections and ordering
- `players`: `LinkedHashMap` (`TimingDiagram.java:80`) → `Map`; re-`put` of an existing code keeps its first position
  in both.
- `codes`, `clocks`: `HashMap` (java:79, 81). `codes` is iterated by `TimingRuler#getLabel` (java:265-271) for the
  manual time axis; its order is observable when two codes hold the same `TimeTick` object. Use
  `src/core/java-hash-set.ts#javaHashSetOrder` where order is read.
- `TimeTick` has no `equals` (`TimeTick.java`): `getLabel`'s `tick.equals(ent.getValue())` is identity.
- `TreeSet<TimeTick>` (`TimingRuler.java:65`), `TreeSet<ChangeState>` (`AbstractStatePlayer.java:53`),
  `TreeMap<TimeTick, …>` (`PlayerBinary.java:57`, `TimeSeries.java:46`): ordered by `compareTo`, and an equal element
  is **not** added (set) or keeps its first key with the new value (map). A second `X is …` at one tick is dropped from
  a state player but replaces a binary or analog value. Port as sorted arrays with a binary search on `compareTo`;
  never key a JS `Map` by tick.
- `ArrayList` everywhere else.

### D7 — Mirror upstream's quirks
Port each as the jar does it, with a one-line comment quoting the Java. Planning found:
- `createPlayerClock`, `createPlayerAnalog`, `createPlayerBinary` pass `compactByDefault`, not the command's `compact`
  (`TimingDiagram.java:320, 330, 336`), and do not set `lastPlayer`; robust, concise and rectangle do both.
- `createPlayerClock` adds the period as a ruler tick (java:324-325).
- `drawMessages` returns silently when either projection is `null` (java:246-247); `getUTranslateForPlayer` and
  `getUTranslateForPlayerFrame` throw `IllegalArgumentException` for a player not in the map (java:270, 288).
- The commented-out highlight-height lines (java:262-264, 279-281) stay comments.
- `TimingRuler`'s constructor runs in a field initializer with the diagram's skin param at construction time
  (`TimingDiagram.java:84`), before any `skinparam` command.
- `TimeTickBuilder`'s `CODE` delta, `([-+][.\d]+)`, reaches `new BigDecimal(delta)`, which throws on `+.` (D3).
Each later task adds what it finds to this list in the journal, not here.
**Rejected:** tidying any of them: no forcing library, so an unruled divergence.

### D8 — What ends a row
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named
divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a
"Blocked by" line added to #136. **No row ends unnamed.** Planning found no forcing library: timing never reaches
graphviz, Smetana, KaTeX or the `{{ }}` oracle seam, and the zone is an injected input (D4).
**The six conformant jar-error rows** in `timing` (`fuseva-46-zare084`, `lamera-74-sago807`, `pebecu-20-deci596`,
`pefana-89-modi000`, `sezuvo-55-nose464`, `vufija-57-xoda292`) are error pairs today because no engine accepts them.
Once timing registers they must still error: four are timing command errors at a line (`fuseva` line 10, `pebecu`
11, `sezuvo` 20, `vufija` 11), two are other engines' best errors (`lamera`, `pefana`: "Syntax Error?"). A port that
draws any of them is a loss under the 0-loss bar: find the Java branch that errors and mirror it.
`oracle/accepted-divergences.json`: planning grepped it for all 158 slugs and found none; this mission adds or changes
none.

### D9 — Errors mirror the jar's, not its page
1. Empty `@startuml`: the Welcome page through the dispatcher's empty-description path (`cov-empty`, 532 × 227).
2. A command error at its line: `Unknown "X"` for an undeclared player (`cov-unknown-player`), `Bad date format`
   (`cov-bad-date-format`, where the jar's page names `sequence`, the best-scored error).
3. Any other throw inside a command is `ProtectedCommand`'s message.
4. A throw outside commands (`cov-date-julian`'s `IllegalStateException`, `longValueExact` on a fractional
   `HOUR`/`DATE` tick if a probe reaches it): a crash page in the jar, our error page here.
Per `.claude/memory/error-page-conformance-rule.md`, an error page's text and geometry are not targets;
`fixtures.mts` counts a jar error page against ours as `error-pair`.

### D10 — Routing: `java:187`, and `@starttiming` stays unsupported
Upstream has no `@starttiming`: `findStartTypes` returns TIMING only inside `@startuml`'s set (`DiagramType.java:197-200`),
and `TimingDiagramFactory` runs at `PSystemBuilder.java:187`, after the UML run and gantt, before json. Register
`timingPlugin` in `registerFromSalt` between `dedicationPlugin // java:186` and `jsonPlugin // java:190`.
`src/core/block-extractor.ts` maps `timing: 'timing'` in `START_SUFFIX_MAP`, one of eight port-only tags its own
comment calls a pre-existing divergence (`PSystemBuilder.java:283-284`, `PSystemUnsupported`). Today it is harmless (no plugin, so an
error page either way); once the plugin exists it would **draw** where the jar prints "Diagram not supported by this
release of PlantUML" (probe `cov-starttiming-tag`, 556 × 191). Drawing where the jar errors is a new divergence the
agent may not decide (`CLAUDE.md`), so T4a removes `timing` from `START_SUFFIX_MAP` (keeping `'timing'` in the
`DiagramType` union and `PORT_TO_UPSTREAM`), and amends that comment to seven tags. No test or fixture uses
`@starttiming` (`git grep -l @starttiming`: only `block-extractor.ts`).
Joining `@startuml`'s candidate set can change which engine's error a refused source shows (`PSystemErrorUtils`
scoring); error text is not a target, so that is not a loss, but the full survey at batch close is the check.
**Rejected:** keeping the tag (a new unsigned "we draw, jar errors" divergence).

### D11 — Fixtures: rows, planning probes, upstream vega, authored probes
46 planning probes are in `probes/`, rendered with `scripts/oracle-render.sh` on 2026-11-10 into `/tmp/tdp-plan/oracle`:
40 draw `TIMING`, `cov-embedded` draws a `SEQUENCE` (276 × 223), `cov-empty` is the Welcome page, and
`cov-bad-date-format`, `cov-unknown-player`, `cov-date-julian` and `cov-starttiming-tag` are jar error pages. Three of
the 40 are upstream's `src/test/resources/vega/timing/*.puml` (`vega-*`), the only upstream timing fixtures. T4b copies
them all into `tests/fixtures/timing/`, then authors what neither rows nor probes reach: each player kind with
`compact` and a stereotype; every `CommandChangeState` alternative on every player kind; `@clk*N` with two clocks; a
message to and from a clock and an analog player; a constraint without a `PART1`; `scale` with every unit
(`s m h d D y Y`, `CommandScalePixel.java`); `ticks every`; `is N pixels height` on each kind; notes on each kind with
a stereotag; a highlight with no caption and with `;line:`; `hide time-axis` and `manual time-axis` with codes;
a negative-only timeline; `title`/`legend`/`caption`/`header`/`footer` alone and with `scale 2`; `mainframe`;
`!theme` (two stdlib themes); `skinparam monochrome true`, `skinparam handwritten true`; `<style>` on each SName of D13;
creole in a state name and a message label; a `{{ … }}` timing in a class note.
**Rejected:** stopping at the 158 rows: no row uses `header`, `footer`, `newpage`, `!theme`, `pixel height` or an
embedded diagram (planning census of the 152 drawn sources).

### D12 — Ratchet: `svg-timing`, flat, rows from two buckets
Goldens go flat under `oracle/goldens/svg-timing/<slug>/` with `ratchet.json` entries
`{ slug, bucket, addedAt, source: 'dot-cache' }` (`measurements/pin-timing.mts`), since 13 drawn rows sit in the
`unknown` bucket (ubt's unknown-tree pins are the precedent, `.claude/memory/ubt-status.md`). Copy
`regex.golden.ratchet.test.ts`, `regex.diff-baseline.ratchet.test.ts` and `render-fixture-regex.ts` with `timing`
substituted; `render-fixture-timing.ts` passes the capture-clock zone (D4) the way `render-fixture-gantt.ts` does.
No DOT eligibility: timing has no svek stage. T5 re-pins the routing and refusal rows that now draw `TIMING`, moving
count assertions by exactly the rows moved; the six jar-error rows are pinned by score in `diff-baseline.json`.

### D13 — Style: the real style engine, read where Java reads it
Every timing class reads `StyleSignatureBasic.of(SName.root, SName.element, SName.timingDiagram, <sname>)`, most with
`.withTOBECHANGED(stereotype)`, through `getSkinParam().getCurrentStyleBuilder()` at draw time (`Player.java:77-79,
98-100, 131`; `TimingDiagram.java:117-124`). `SName.ts` has every name timing uses (`timingDiagram`, `robust`,
`concise`, `clock`, `binary`, `analog`, `rectangle`, `highlight`, `timeline`, `constraintArrow`, `note`). Skinparams
reach the builder through `FromSkinparamToStyle` as for the other klimt engines (dss). Probes `cov-style`,
`cov-stereotype`, `cov-skinparam`, `cov-mode-dark` are the oracles. Unlike regex (rep D3), nothing is frozen in a
constructor except the ruler's skin param (D7).

### D14 — `{{ … }}` goes through the existing embedded path
An embedded block is a `@startuml` diagram, so TIMING is among its candidates once registered. `cov-embedded` (a
timing diagram in a sequence note, 276 × 223) is the oracle; a difference there is T4d's.

### D15 — Serial, main checkout, one commit per task
The batches build one engine upward; worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until
T4a, so `npm test` stays green through batches 1 to 3, and the 90/90/90 coverage gate holds only if each task's unit
tests cover its files. **Rejected:** parallel worktrees (tasks in a batch share `Player.ts` and `Panels.ts` types), and
one big commit (the journal cites per-task commits through `pre-squash`).

### D16 — Hooks: split by upstream method, keep names
Files cap at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. `PanelsRobust` (344 lines), `TimingRuler` (342)
and `TimingDiagram` (430) fit as files; long methods (`PanelsRobust#drawU`-family, `TimingRuler#drawTimeAxis*`,
`CommandChangeState#getChangeState`) split into named helpers keeping the Java method name on the entry point, `@see`
on each. Constructors with more than five Java parameters (`PlayerClock`, 8; `Panels` subclasses) take one args object
named for the class, as `ETileBoxArgs` did (eep). Files written through the shell skip the hook: run `lizard` by hand
(`.claude/memory/cep-status.md`).

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; the `timing` note in `scripts/parity-dashboard-notes.ts` is rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration, no data format. |
| Scale | Layout is arithmetic over players × ticks; the widest probe (`cov-hour-time`) is 1,651 px. A huge `scale` or a 1500 AD date makes the jar crash or draw very wide; mirror, do not cap. The ratchet grows by up to 152 rows plus authored ones; routing and refusal gain a golden twin each. T6 names the CI risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. The zone missing from a render path (D4): `mekivo` and `cov-date-format` shift by a day. A `TreeSet` ported as a `Map` keyed by number (D6). One of the six jar-error rows starts drawing (D8). |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T6. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |

## Baseline

Measured on `fea72e951`, 2026-11-10, at planning. Committed `parity-*.json`: `timing` 6 conformant / 0 / 139
diverged (135 first diff `svg/@background`, 4 `svg/g[1]/text[1]/@fill`), plus 13 drawn TIMING rows in `unknown`
(diverged, `svg/@background`). Local `dot -V`: `16.1.0 (20260904.0139)`.

**Phase 8, 2026-11-10 17:08-17:20, on `fea72e951`, load average 12-139 (outside node processes from other sessions):
green.** `npm test -- --maxWorkers=4` **exit 0**: 44,712 passed, 0 failed, 4 expected fail, 7 skipped, 6 todo, in
2,121 files (2,120 passed, 1 skipped), 562.50 s; coverage 97.14 / 92.84 / 97.86 / 98.14 (statements / branches /
functions / lines). `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` exit 0, and
`npx prettier --check plans/timing-engine-port` passes on the finished brief. **This green run is the baseline.** The
working tree held only this brief and the planning progress file.
