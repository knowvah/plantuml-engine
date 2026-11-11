# T2b — `BpmDiagram`, commands, factory

**Read:** D3, D5, D9; `bpm/{BpmDiagram,BpmDiagramFactory,CommandDockedEvent,CommandMerge,CommandResume,CommandGoto,
CommandNewBranch,CommandElseBranch,CommandEndBranch}.java`; `command/PSystemCommandFactory.java`; this port's
`src/diagrams/wire/{WireDiagram,WireDiagramFactory}.ts` and `src/diagrams/help/HelpFactory.ts` (a factory with no
common commands).

**Write-set:** those 9 files as `src/diagrams/bpm/*.ts`; `tests/unit/bpm/**`.

**Do:**
1. `BpmDiagram extends TitledDiagram` with type `BPM`; `createGrid` replays the events exactly (`resume` inserts a line
   after the target's line, `goto` also connects `last` to the target); `cleanGrid` loops the three cleaners;
   `getTextBlock` builds `new SkinParamFresh(classpath, preprocessingArtifact options)` (T1a) and returns
   `grid.toArray(skin)`.
2. `branches`: `getLast`/`removeLast` throw on empty (D5, D9). `elseBranch`'s `counter == 2` path adds the exit merge.
3. Commands in factory order: DockedEvent, Merge, Resume, Goto, NewBranch, ElseBranch, EndBranch. Regexes verbatim:
   `:(.*);`, `([%pLN_.@]+):?\<\+\>`, `resume\s+ID`, `goto\s+ID`, `new\s+branch`, `else`, `end\s+branch`; case per the
   shared `RegexLeaf` translation (`cov-keywords-case` draws, so matching is case-insensitive).
4. No `CommonCommands`: a blank line, `title`, `skinparam`, `<style>`, `scale`, `sprite` are not commands (D5).
5. Test command parsing against each probe's shape, and `createGrid` + `cleanGrid` on `rikosu-08`, `zaxuce-77`,
   `loxeke-95` (line and column counts from their oracles), plus each D5 throw.

## Acceptance
- Given `cov-branch-no-else`, `cov-resume-unknown` or `cov-goto-unknown`, when `getTextBlock` runs, then it throws.
- Given `cov-else-orphan`, when `else` executes, then it throws (empty deque).
- Given `loxeke-95`, then the cleaned grid is 4 lines × 15 columns (its oracle's hlines and vlines); `zaxuce-77` and
  `rikosu-08` are 2 × 6.
- Given `cov-keywords-case`, then `New Branch`/`ELSE`/`End Branch` parse.

Observability N/A. Rollback Reversible.
