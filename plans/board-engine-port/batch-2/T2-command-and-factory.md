# T2 — Command and factory

**Read:** `CommandBoardPlus.java`, `BoardDiagramFactory.java`, `SingleLineCommand2.java:56-58` (`doTrim`), `PSystemCommandFactory.java` (command loop, empty diagram, `finalizeDiagram`), `packetdiag/PacketDiagramFactory.ts` and pep journal rows 12-13 and 17, D2, D10.

**Do:**

1. `command/CommandBoardPlus.ts`: the regex `^([+]*)\s*([^%s].*)$` with `%s` as `Pattern2.java:57` expands it (`PacketDiagramFactory.ts`'s `S`), matched on the trimmed line; `executeArg` calls `diagram.addLine(plus, label)`.
2. `BoardDiagramFactory.ts`: `CommonCommands.addCommonCommands1` first, then `CommandBoardPlus`, in `PacketDiagramFactory.ts`'s loop and refusal shape. Mirror the empty-diagram path the jar takes for `cov-grid-empty` (the Welcome page) and the throw `cov-grid-plus-first` reaches (D10).
3. The sprite registry takes `internalEmojiStoreFrom(options.assetStore)` as packet's does (pep journal row 23), so `cov-emoji` draws its outline.

**Tests:** gasaxu, jifeju, nuropa and rebire parse to the expected activity count and cell grid; `cov-grid-plus-alone` gives an activity labelled `+`; `cov-grid-whitespace` trims; `title`, `scale`, `skinparam`, `<style>` lines are consumed by the common commands; an unknown line refuses at its line number (compare the oracle's "Error line N").

## Acceptance
- Given `A` then a lone `+`, then the diagram has two activities, the second labelled `+`.
- Given `+B` first, then parsing throws or refuses, so the render is an error page.
- Given `@startboard` and `@endboard` only, then ours errors, as the jar does.
- Given `npm test`, then it passes.

Observability N/A. Rollback Reversible.
