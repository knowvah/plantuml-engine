# T2a — Elements, branches, events and `GridArray`

**Read:** D3, D8; `bpm/{BpmElementType,BpmElement,BpmBranch,BpmEvent,BpmEventAdd,BpmEventGoto,BpmEventResume,
GridArray}.java`; T1b's Ftiles; `klimt/shape/TextBlockMemoized` in this port.

**Write-set:** those 8 files as `src/diagrams/bpm/*.ts`; `tests/unit/bpm/**`.

**Do:**
1. `BpmElement`: `Display.getWithNewlines(Pragma.createEmpty(), label)` (`AbstractConnectorPuzzle#getPragma`);
   `toTextBlock` wraps the raw block and draws red stubs per `Where`, `NORTH, EAST, SOUTH, WEST` (D8);
   `toTextBlockInternal`'s four branches, START through `getSignatureCircle` (`root, element, activityDiagram, circle`),
   MERGE through the legacy colours (T1a), DOCKED_EVENT through `FtileBox.create`, and the unreachable END/default
   serif-14 red branch (D8). `getDimension` memoises.
2. `BpmBranch` ids `$branchA<uid>`/`$branchB<uid>`; the events are plain data.
3. `GridArray extends TextBlockMemoized`: `margin = 30`; `calculateDimensionSlow`; `drawU` draws
   `drawInternalGrid` first (black, no closing lines, D8), then each cell centred. Drop the four uncalled privates (D1).
4. Test against `bibuka-01` (one docked event: 146×83 document, grid lines at x=10/60, y=10), `zufefe-09` (a merge after
   a box), and `bogebu-46`'s first line of cells, by building `GridArray` directly.

## Acceptance
- Given a `GridArray` of `[START, DOCKED_EVENT("login")]` with START having EAST and login WEST, when drawn, then the
  SVG fragment equals `bibuka-01`'s body (`<g>` content) after the document translate of 10.
- Given a MERGE element, then it draws the diamond with `#FEFECE`/`#A80036` and its stubs in red.
- Given the END type (no command reaches it), then it is kept with a comment and one unit test.

Observability N/A. Rollback Reversible.
