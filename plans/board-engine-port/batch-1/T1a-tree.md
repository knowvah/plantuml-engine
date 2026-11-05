# T1a — The tree and its grid

**Read:** `BNode.java`, `BArray.java`, `PostIt.java`, `Activity.java` (constructor, `addRelease`, `getArray`, `getFullWidth`, `getMaxStage`), D3, D6, `src/core/java-hash-set.ts`.

**Do:**

1. `BNode.ts`: `name`, `stage`, `x = -1`, `parent`, `children`; `addChild` with both guards; `computeX(count)` over a `{ value }` box standing in for `AtomicInteger`; `initBarray`; `toString` as Java's.
2. `BArray.ts`: `put` (duplicate key throws, `maxX`/`maxY` tracked), `getCell`, `getKey`, and an iterator in `HashMap` order per D3. Keep the keys in `put` order and derive the order on iteration, so a later `put` reorders like Java's table does.
3. `PostIt.ts`: whole class; `getWidth()` 170 and `getHeight()` 90 are the constants the layout reads.
4. `Activity.ts`, tree half: constructor (root `BNode(0, name)`, cursor), `addRelease` with its `stage <= 0` guard and climb, the lazily built `BArray`, `getFullWidth`, `getMaxStage`. `getBox` and `drawMe` land in T1b.

**Tests:** `gasaxu-65-cipo396`'s tree built through `addRelease` gives the oracle's cell order (the `<rect>` x/y sequence of its `in.svg`, root twice excluded) and `getFullWidth` 1530; `cov-grid-deep-stage` (`probes/`) puts `C` and `D` under `A`; `cov-grid-hashmap-resize` (29 cells, table resized to 64) matches its oracle's rect order. Journal whether any probe reaches a tree bin (D3).

## Acceptance
- Given gasaxu's 15 lines, when the `BArray` is iterated, then the `(x, stage)` sequence equals the oracle's rect order after the first (header) card.
- Given `addRelease(0, ...)`, then it throws, as `Activity.java` does.
- Given `npm test`, then it passes with the new files covered at 90/90/90.

Observability N/A. Rollback Reversible.
