# T1a: Welcome as a factory

**Writes:**
- `src/diagrams/eggs/PSystemWelcomeFactory.ts` (`welcomePlugin`);
- `src/core/error/error-diagrams.ts` (delete `isWelcomeSource`, `WELCOME_SOURCE_LINES` and the branch in `emptySvg`);
- `src/index.ts` (only if the empty-description path at `:363`/`:475` must yield to the plugin);
- `src/core/dispatcher.ts` (only if `isEmptyDescription` needs the plugin's base);
- `src/registered-plugins.ts` (first registration, `// java:133`), `tests/unit/utility-registration.test.ts`
  (`JAVA_LINE` `[welcomePlugin, 133]`);
- `tests/unit/eggs/PSystemWelcomeFactory.test.ts`.

**Read:**
- `eggs/PSystemWelcomeFactory.java:47-63`, `eggs/PSystemWelcome.java`, `core/UmlSource.java#getTotalLineCount`;
- `PSystemBuilder.java:242-284`: what `null` from `createSystem` does to `errors`, and how `PSystemErrorUtils.merge`
  treats it;
- `src/core/error/error-diagrams.ts:115-170`, `src/core/dispatcher.ts:140-200`, `src/index.ts:355-370,470-480`;
- `decisions.md` D2, D8.

**Do:**
1. Red: assert that `renderSync` of `cov-welcome-empty`, `-comment`, `-preproc` and `-named` equals the planning oracle
   (0 diffs), and that `cov-welcome-blank` is the "Empty description" error. These already pass, so they pin the move.
   Add a unit test proving that the page now comes from `welcomePlugin`: the plugin's `parse` on a two-line source
   returns the diagram, and on a three-line source it returns upstream's `null` equivalent.
2. Port the factory. The plugin's `parse` returns a `PSystemWelcome('BACKGROUND_CORNER_BOTTOM_RIGHT')` when the line
   count is 2 (`PSystemWelcomeFactory.java:52-53`); otherwise it returns what `null` means to the dispatcher.
   - Read how `getTotalLineCount` counts. The current `block.seedSource.length` measure matches all four planning
     probes, so keep it unless the Java says otherwise.
   - Description: `(Empty)` (`PSystemWelcome.java:83-85`).
3. Register `welcomePlugin` first. Make the empty-description path reach it: upstream has no pre-dispatch empty test
   for the Welcome case. Then delete `isWelcomeSource`.
4. Measure `cov-welcome-*` with `--dir /tmp/ftp-plan/fx`, plus the routing and refusal gates.
   - `gujuga-46-vifa350` and `vesuzo-97-jelo022` must stay conformant.
   - Their refusal-baseline rows will report the stale `known-gap` as fixed. T3 re-pins them. If the gate is red now,
     move that re-pin here (lsp journal row 5 precedent) and journal it.

## Acceptance
- Given `@startuml\n@enduml`, when rendered, then the output equals `/tmp/ftp-plan/fx/cov-welcome-empty.svg`, and
  `welcomePlugin` produced it.
- Given `@startuml\n\n@enduml`, then the page is "Empty description (Assumed diagram type: sequence)".
- Given `grep -n isWelcomeSource src`, then nothing matches.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
