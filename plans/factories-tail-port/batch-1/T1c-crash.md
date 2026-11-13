# T1c: Crash and `@startcrash`

**Writes:**
- `src/diagrams/crash/{CrashType,CommandSelectCrash,CommandCrashAny,CrashDiagram,CrashDiagramFactory,index}.ts`
  (`crashPlugin` and the export in `index.ts`, or a `crash-export.ts` if `index.ts` passes 500 lines);
- `src/core/block-extractor.ts` (`'crash'` in `DiagramType`, `START_SUFFIX_MAP`, `PORT_TO_UPSTREAM`);
- `src/core/diagram-type-set.ts` (drop `CRASH` from the "no engine" comment at `:23`);
- `src/registered-plugins.ts` (`// java:200`, after `chenPlugin`), `tests/unit/utility-registration.test.ts`
  (`[crashPlugin, 200]`, plus an engine sample if the file keeps one per plugin);
- `tests/unit/crash/*.test.ts`.

**Read:**
- every file in `crash/` except the four crash-report classes (D1);
- `command/PSystemCommandFactory.java:100-175` (the empty error, the per-line loop, `checkFinalError` call site);
- `command/ProtectedCommand.java:54-77`, `TitledDiagram.java`, `core/DiagramType.java:113-114,234-296`;
- `src/core/klimt/sprite/ListSpriteDiagramFactory.ts` (commands, `ProtectedCommand`, plugin) and its export
  `listsprite-export.ts` (non-native root type);
- `src/core/UgDiagram.ts:15-30`; `decisions.md` D2, D6.

**Do:**
1. Red, from the planning oracles:
   - `cov-crash-banner`: the root carries `data-diagram-type="BPM"`, the page is 349×273, and there are 18 text runs.
     The first is `Crash Diagram`, bold, at x=10, y=20.889, textLength 94.15.
   - `title`, `skinparam` and `unknown-type` draw the same page.
   - `parsing` gives an execution error at line 2. Its message is `You should send a mail to plantuml@gmail.com with
     this log (V<version>) java.lang.IllegalStateException: This is a normal crash when PARSING`.
   - `drawing`, `upper` and `spaces` throw from the draw.
   - `empty` gives "Empty description (Assumed diagram type: crash)".
2. Port the classes. `CrashType` is a `const` object with a union type.
   - The exceptions' messages are Java's `toString()` (D6).
   - `checkFinalError` throws for FINALIZING. Until T1d lands, that throw reaches `index.ts`'s `errorSvg`, and the
     page is ours, which is fine for now.
   - Choose the export by the root type `BPM` and the style name `BPM` maps to (`DiagramType.java:234-296`). Check
     what `assemble-svg.ts` needs, as lsp T2a step 4 did.
3. Add the tag and register the plugin.
4. Measure `cov-crash-*` with `--dir`. Expected:
   - the 4 banners are at 0;
   - `empty`, `parsing`, `drawing`, `upper`, `spaces`, `finalizing-then-drawing` and `drawing-then-parsing` are error
     pairs;
   - `finalizing` is an error pair at the survey's level. In `fixtures.mts` it needs T1d.

## Acceptance
- Given `@startcrash\nanything goes\n@endcrash`, then the output equals `/tmp/ftp-plan/fx/cov-crash-banner.svg`.
- Given `@startcrash\ncrash when parsing\n@endcrash`, then `fixtures.mts` prints `error-pair`.
- Given `@startcrash\nCRASH   WHEN   DRAWING\n@endcrash`, then rendering throws in the draw, and the page is our error page.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
