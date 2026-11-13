# Decisions

Pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Location and names | upstream's packages and class names: `diagrams/eggs/`, `diagrams/font/`, `diagrams/crash/` |
| D2 | Routing | Welcome at java:133, ListFonts at java:148, Crash at java:200 with an `@startcrash` tag |
| D3 | Test family | extend `svg-factories`; the mission's own `fixtures.mts` copy, rename-fixed |
| D4 | ListFonts' font list | ruling #169 governs: the seam answers no names, hoisted into `src/core/` |
| D5 | Path | port nothing; the default-profile rows are error pairs; INSECURE goes on a `needs-ruling` issue |
| D6 | Crash behaviour | mirror the jar: `BPM` type, any line accepted, three throw sites |
| D7 | `PSystemBuilder`'s catch | port it in `dispatcher.ts#attempt`, separable and revertible |
| D8 | Welcome re-mirror | the plugin owns the page; `emptySvg`'s special case goes |
| D9 | How a fixture ends | zero, error pair, named divergence, or `needs-ruling` issue |
| D10 | Execution | serial, main checkout, no worktrees |
| D11 | Complexity hooks | split by upstream method, never by fitting |
| D12 | Jar stability | drawn pages stable; error and crash pages vary by design |

### D1: Location and names
- **Welcome:** `eggs/PSystemWelcomeFactory.java` → `src/diagrams/eggs/PSystemWelcomeFactory.ts`, exporting
  `welcomePlugin`, beside ufp's other eggs. `PSystemWelcome` stays in `src/core/error/PSystemWelcome.ts`, because
  error pages stack it (`error-renderer.ts:74`). Moving it would be a refactor.
- **ListFonts:** `font/PSystemListFonts{,Factory}.java` → `src/diagrams/font/PSystemListFonts{,Factory}.ts`
  (`listFontsPlugin`). `PSystemListFonts` extends `src/core/PlainStringsDiagram.ts`, as upstream extends
  `PlainStringsDiagram`.
- **Crash:** `crash/{CrashDiagramFactory,CrashDiagram,CommandSelectCrash,CommandCrashAny,CrashType}.java` →
  `src/diagrams/crash/` under the same names, plus `index.ts` for the plugin (`crashPlugin`) and the export.
  `CrashReportHandler`, `ReportLog`, `CrashImage` and `GraphvizCrash` are the crash-report page. They stay unported under
  the existing ruling (`src/core/UgDiagram.ts:22-24`: the crash report is our error page).

**Rejected:** putting Welcome in `src/core/error/` next to `PSystemWelcome`, because the factory belongs to
`eggs/`, as `PSystemColorsFactory` does.

### D2: Routing
| Plugin | Type | Registered | Gate |
|---|---|---|---|
| `welcomePlugin` | `'sequence'` (`PSystemWelcomeFactory.java:58-61`, the `@startuml` hack) | first, before `colorsPlugin` (java:133) | `source.getTotalLineCount() == 2` (`:52`) |
| `listFontsPlugin` | `'sequence'` via `singleLinePlugin` | between `skinparameterListPlugin` (java:147) and `listEmojiPlugin` (java:149) | `PSystemListFontsFactory.java:47-55` |
| `crashPlugin` | `'crash'`, new in `block-extractor.ts#DiagramType`; `START_SUFFIX_MAP` `crash: 'crash'`; `PORT_TO_UPSTREAM` `crash: CRASH` | after `chenPlugin` (java:200) | `DiagramType.java:113-114`; `diagram-type-set.ts:114` already maps `crash` |

`CRASH` is not in the `@startuml` candidate set (`DiagramType.java:198-200`), so Crash can never change a `@startuml`
error page. Welcome and ListFonts are `SEQUENCE` candidates. A candidate can change which refusal wins the error page
(`PSystemErrorUtils.java:140-147`), so the survey checks for that (stop 6). `utility-registration.test.ts#JAVA_LINE`
gains all three. The `Not registered by ufp` comment in `registered-plugins.ts:163-166` loses Welcome and ListFonts.

### D3: Test family: extend `svg-factories`
This follows lsp D3. `svg-factories` holds the `PSystemBuilder` factories whose rows live in the `unknown` bucket, and
all six corpus rows here are `unknown` rows:
- Welcome: `gujuga-46-vifa350`, `vesuzo-97-jelo022`. Both are conformant today and pinned in no ratchet golden.
- ListFonts: `jivufi-79-simi298`, `jodesa-24-lovo810`, `kubuju-35-neji041`, `vofomo-62-gure525`. All are diverged
  today (our error page).

`FACTORIES_SLUGS` 43 → 49. The authored fixtures go in `tests/fixtures/factories/` as `cov-welcome-*`, `cov-listfont*`,
`cov-crash-*` and `cov-path-*`.

**Tool:** `plans/factories-tail-port/measurements/fixtures.mts` is cmf's tool with two fixes:
- The banner regexes read `plantuml-engine`. Since the #177 rename, every earlier copy has missed our own error page,
  so it printed error pairs as diffs (planning measured 6 false diffs).
- `--dir <path>` replaces an env prefix.

T3 copies lsp's four pin tools and makes the same rename check in each.

**Rejected:** a new `svg-eggs` family (a fourth harness copy for 6 corpus rows).

### D4: ListFonts' font list: ruling #169 governs
`DIVERGENCES.md:2086` (maintainer ruling 2026-11-11, #169) says that a browser-safe library has no API that enumerates
the host's fonts. The ruling ends: "`listfonts` (`PSystemListFontsFactory`, #135) reads the same list, and this
ruling covers it when it is ported."
- T1b moves `availableFontFamilyNames()` out of `src/diagrams/help/CommandHelpFont.ts:25` into
  `src/core/available-font-family-names.ts`, and help re-points to it. Both upstream callers read
  `GraphicsEnvironment.getAvailableFontFamilyNames()` (`CommandHelpFont.java:73`, `PSystemListFonts.java:52`).
  Layering rule 2 (`tests/architecture/layering.test.ts`) forbids `diagrams/font` → `diagrams/help`.
- The page is the header `   <b><size:16>Fonts available:` and `" "`, with no font lines.
- T3 adds the 4 corpus rows and the drawn `cov-listfont*` fixtures to the #169 entry's row list, with no new entry.

**Rejected:** copying the oracle host's font list, which the ruling already rejects.

### D5: Path: port nothing; file the INSECURE question
- The pinned oracle runs as LEGACY. `scripts/oracle-render.sh` and `oracle-corpus.ts` set no
  `PLANTUML_SECURITY_PROFILE`, and `SecurityProfile.java:114-135` falls back to LEGACY. LEGACY skips the factory
  (`PSystemBuilder.java:178-179`).
- The library's default is LEGACY too (`src/core/security/SecurityProfile.ts#DEFAULT_SECURITY_PROFILE`), but
  `RenderOptions.securityProfile` can be `INSECURE`.
- Under the default both sides leave `path X` unclaimed, so it is an error pair. Planning measured
  `cov-path-valid` and `cov-path-invalid` as error pairs today.
- Under INSECURE, the jar writes `GraphicsPath`'s 50×50 PNG to the output stream whatever the format
  (`PSystemPath.java:58-63`, `GraphicsPath.java:66-89`, a `DirectOsDiagram`). Planning measured
  `PLANTUML_SECURITY_PROFILE=INSECURE` with `path ABCabc`: the `.svg` file is a 285-byte PNG. `path abc123` throws in
  `UMotif.convertFromChar` (`UMotif.java:93-101`, only `A-Z` and `a-w`), which gives the ReportLog crash page.
- `renderSync` returns an SVG string. What it should return under INSECURE is a new divergence, which is the
  maintainer's call. T0 files it as a `needs-ruling` issue (text in `batch-0/overview.md`).

**Rejected:**
- Registering under INSECURE and drawing the motif as SVG: a divergence decided by the agent.
- Leaving the factory unregistered and calling that "mirrored": that is true only under the default profile.

### D6: Crash mirrors the jar
| Behaviour | Java | Planning probe |
|---|---|---|
| The page is typed `BPM`, not `CRASH` | `CrashDiagram.java:59` (`super(source, DiagramType.BPM, …)`) | `cov-crash-banner`: `data-diagram-type="BPM"`, 349×273 |
| 18 `Display` lines, `blackBlueTrue(sansSerif(14))`, `LEFT` | `CrashDiagram.java:66-87` | `banner` |
| Commands: `CommandSelectCrash`, then `CommandCrashAny` (`〴.` zero or more, which is any line). There are no common commands, so `title`, `scale` and `skinparam` are swallowed | `CrashDiagramFactory.java:55-58`, `CommandCrashAny.java:55-57` | `title`, `skinparam`, `unknown-type` all draw the banner |
| `crash when parsing\|finalizing\|drawing`: the leaves match case-insensitively and across any run of spaces | `CommandSelectCrash.java:55-63` | `upper`, `spaces` crash in drawing |
| PARSING throws in `executeArg` → `ProtectedCommand`'s error | `CommandSelectCrash.java:84-85`, `ProtectedCommand.java:65-75` | `parsing`: error, line 2 |
| FINALIZING throws in `checkFinalError` → `PSystemBuilder`'s catch, "Fatal crash error, …" | `CrashDiagram.java:98-103`, `PSystemBuilder.java:273-281` | `finalizing`: error, line 3 |
| DRAWING throws in `getTextBlock` → ReportLog crash page | `CrashDiagram.java:63-64` | `drawing`: crash page |
| Later lines overwrite the type (`setCrashType`) | `CommandSelectCrash.java:82` | `finalizing-then-drawing` crashes in drawing |
| An empty diagram gives "Empty description (Assumed diagram type: crash)" | `PSystemCommandFactory.java:117-122` | `empty` |

The exception text is `Throwable#toString`: `java.lang.IllegalStateException: This is a normal crash when PARSING`.
The precedent is `src/core/real/AbstractReal.ts:5-17` and `creole-atoms-img.ts:78`.

### D7: Port `PSystemBuilder`'s catch in `dispatcher.ts#attempt`
`PSystemBuilder.java:262-281` wraps each factory's `createSystem` in `catch (Throwable t)`. That catch adds an
`EXECUTION_ERROR` "Fatal crash error, you should send a mail to plantuml@gmail.com with: " + t, built by
`PSystemErrorUtils.buildV2`, to `errors`, and **goes on to the next factory**. Today `dispatcher.ts:199`
(`attempt` → `plugin.parse`) has no catch, so a throw escapes to `src/index.ts`'s `errorSvg`.
- The crash factory exists to exercise this path, which is why T1d ports it.
- This is one cause with many call sites: every engine's parse runs through `attempt`.
- T1d is separable. If the survey shows a loss that T1d cannot explain and fix with a Java quote, revert T1d alone,
  journal the mechanism, and file it as a follow-on. The rest of the mission does not depend on it.

**Rejected:** a crash-only catch inside `crashPlugin`, which special-cases a shared mechanism.

### D8: Welcome re-mirror
Today `emptySvg` (`src/core/error/error-diagrams.ts:132-165`, `isWelcomeSource`) draws Welcome for a two-line
`@startuml`, before any factory runs. The output is right: both corpus rows are conformant. The structure is not,
because upstream reaches Welcome as the first factory. T1a moves the gate into `welcomePlugin` and deletes
`isWelcomeSource`. `welcomeSvg` (`error-diagrams.ts:119`, a document with no `@start` block) is a different path and stays.

Planning measured what `getTotalLineCount()` counts:
- comment and preprocessor lines vanish (`cov-welcome-comment`, `-preproc` draw Welcome);
- a blank line counts (`cov-welcome-blank` is "Empty description");
- `@startuml foo` draws Welcome (`cov-welcome-named`; the jar writes `foo.svg`).

T1a reads `UmlSource.getTotalLineCount` and the empty-description path (`dispatcher.ts:150-175`,
`src/index.ts:363,475`) before choosing where the plugin sits relative to `isEmptyDescription`.

### D9: How a fixture ends
1. Zero diffs.
2. An error pair (`.claude/memory/error-page-conformance-rule.md`; `fixtures.mts` prints `error-pair`).
3. Named in `DIVERGENCES.md` with a forcing library or a signed ruling (D4).
4. On a `needs-ruling` issue, with everything else finished (D5).

### D10: Execution
Serial, in the main checkout, with no worktrees. Serena agents write the main checkout
(`.claude/memory/agents-write-main-via-serena.md`), and every task writes `src/registered-plugins.ts`.

### D11: Complexity hooks
The hooks block 500-line files, 30-NLOC functions, CCN 10 and 5 parameters. Split along upstream's own methods (the 18
`Display` lines are data), never by inventing a structure the Java lacks.

### D12: Jar stability
Planning rendered all 27 probes 3 times (`/tmp/ftp-plan/r{1,2,3}/`).
- **Stable drawn pages:** 13. They are the 4 Crash banners, the 5 `listfont*` pages, the 4 Welcome pages and
  `cov-welcome-named` (`foo.svg`).
- **Error pages vary between renders:** the block on top alternates between Welcome and a 410-px variant.
- **Crash-report pages vary:** they print JVM facts.

Both kinds are error pairs under D9.2, so stability gates only the drawn pages. T2a reruns
`plans/listsprite-factory-port/measurements/jar-variants.mjs`, keyed on the drawn marker of each page. A drawn
fixture that is not `stable` is stop 5.

## Operational readiness (auto-confirmed, unattended)

- **Observability:** N/A. This is a browser-safe library with no service, SLI or trace. The measure is the
  conformance survey and the ratchets.
- **Rollback:** Reversible: revert the mission's one squashed commit. There is no data or schema.
- **Scalability:** every page here is static text. `listfonts` draws 2 lines.
- **On-call:** none. Failure modes are conformance diffs, which the ratchets catch.
- **Backwards compatibility:** `@startcrash` stops drawing "unknown diagram type"; `listfonts` stops drawing our
  refusal page. No public API change. `DiagramType` gains `'crash'`; T4 checks whether that union reaches
  `dist/*.d.ts` and journals it (an added member is additive).

## Auto-confirmed (unattended)

Phase 3 took the recommendation for each decision. The rejected options are under D1, D3, D4, D5 and D7.

**Evidence:**
- **D2:** `PSystemBuilder.java:132-200`, `DiagramType.java:113-114,198-200`, `src/registered-plugins.ts:100-166`.
- **D4:** `DIVERGENCES.md:2086`, `CommandHelpFont.ts:16-27`, `layering.test.ts:4-6`.
- **D5:** `SecurityProfile.java:114-135`, `oracle-render.sh:87-92`, and the INSECURE probe above.
- **D7:** `PSystemBuilder.java:262-281`, `dispatcher.ts:186-200`.
- **D8:** `error-diagrams.ts:132-165`, refusal-baseline rows for `gujuga`/`vesuzo` (stale `known-gap`, `weErrored`
  true).

Only Path needed a ruling, and only for its INSECURE branch (D5). The issue's own text anticipated this ("Either
mirror the condition, or file a `needs-ruling` issue").
