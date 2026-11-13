# ftp-T1a

## Observation: a bare PSystemFactory needs the dispatcher's empty test to see its null
- **Context**: Registering `PSystemWelcomeFactory` (no base class, no empty test) ahead of the `@startuml` command factories.
- **Finding**: `isEmptyDescription` returned false for every empty `@startuml` block once a non-command-factory candidate existed, so a blank-line block lost its *Empty description* page. It now treats a `'PSystemFactory'`-based plugin whose parse is `NULL_SYSTEM` as no claim. Its `source` must carry `seedSourceLines` (the two `index.ts` call sites pass `umlSourceOfBlock(block)`), because Welcome counts upstream's lines, blank ones included.
- **Impact**: A future bare factory must return `NULL_SYSTEM` (identity) for "not mine", not a fresh refusal.
- **Confidence**: High
