# T1b — Nodes and chain folding: `GNode`, `GNodeBuilder`

**Read:** D1, D6; `gitlog/{GNode,GNodeBuilder}.java` in full.

**Write-set:** `src/diagrams/git/{GNode,GNodeBuilder}.ts`; `tests/unit/git/**`.

**Do:**
1. `GNode`: `up`, `down` and `texts` lists, `comment`, `link`, `isTop`, `getDisplay` (`Display.create(texts)`, one line
   per text), `getDowns`, `canEatTheNextOne`, and `eatTheNextOne` with both `IllegalStateException` guards (D1).
   `eatTheNextOne` mutates in place: `down.set(0, newNext)`, remove the eaten node from `newNext.up` (it must be
   present), then append `this`. Mirror that order, because `up` order decides nothing visible but `down` order decides
   edge order.
2. `GNodeBuilder`: a `Map<string, GNode>` filled in commit order (D6: `set` on an existing key keeps its slot and
   replaces the value). Then link each commit to each ancestor by name, then `merge()`: restart the scan from the head
   after every eat, exactly as the Java `break`s (`GNodeBuilder.java:71-87`). Removal is `all.remove(removed)`, the
   first equal element; nodes compare by identity.
3. Tests, from source text through T1a's parser:
   - `cov-chain-four` → 3 nodes, the middle one with texts `[bbb, ccc]`.
   - `juzane-95` → 5 nodes, no folds (the oracle draws 5 boxes).
   - `lagapi-44` → 35 nodes, as its oracle draws 35 boxes.
   - `figagi-40` → 665 nodes, as its oracle draws 665. Time it, and journal the time.
   - `cov-duplicate-name` → 2 nodes and 2 parallel `down` links from `a1` to `r0` (D6).
   - `cov-long-chain-after-merge`: the fold stops at the merge.

## Acceptance
- Given each of the 4 rows, when `GNodeBuilder` runs, then the node count equals the oracle's `<rect>` count (5, 6
  for `mebafo` from its oracle, 35, 665), and every node's texts match the oracle's name lines in order.
- Given `cov-duplicate-name`, then the surviving `a1` node sits in the first slot and has two links to `r0`.
- Given a node with one parent whose child has two parents, then `canEatTheNextOne` is false.

Observability N/A. Rollback Reversible.
