# Batch 1 — grid parser, nodes, engine seam

Serial in the main checkout (D10). T1a and T1b are pure model code with no reachable output. T1c touches a shared core
seam, so this batch's close runs the full survey.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | [`GitTextArea`, `CursorPosition`, `Commit`](T1a-grid-parser.md) | orchestrator or typescript-pro | `src/diagrams/git/{GitTextArea,CursorPosition,Commit}.ts`, `tests/unit/git/**` | T0 | [x] |
| T1b | [`GNode`, `GNodeBuilder`](T1b-gnodes.md) | orchestrator or typescript-pro | `src/diagrams/git/{GNode,GNodeBuilder}.ts`, `tests/unit/git/**` | T1a | [x] |
| T1c | [The Smetana-shaped box in `core/graph-layout`](T1c-engine-seam.md) | orchestrator or typescript-pro | `src/core/graph-layout.types.ts`, `src/core/graph-layout-build*.ts`, `tests/unit/core/**` | T0 | [x] |

## Interface contracts

T1a → T1b:
```ts
class Commit { getName(): string; getComment(): string | null; getAncestors(): readonly Commit[]; }
class GitTextArea { add(s: string): void; getAllCommits(): readonly Commit[]; getLine(y: number): string; }
```
T1b → T2b:
```ts
class GNode { getDisplay(): Display; getComment(): string | null; isTop(): boolean; getDowns(): readonly GNode[]; }
class GNodeBuilder { constructor(allCommits: readonly Commit[]); getAllNodes(): readonly GNode[]; }
```
T1c → T2b: a `DotInputNode` kind (name it after the upstream concept, e.g. `shape: 'box'` with a doc comment citing
`SmetanaForGit.java:199-211`) laid out with caller `width`/`height` as minimums and no `fixedsize`/`label`. The
`DotInputGraph` option carries a raw `ranksep` in inches and omits `nodesep`. Engine nodes report graphviz's own size
(`ND_width`/`ND_height` × 72) and centre; edges report the bezier `list`, `sp` and `ep`, as json's engine frame does.

Observability: N/A — no new observable operations. Rollback: Reversible (each task is one revertible commit).
