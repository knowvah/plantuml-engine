# T6a — Composite rows and every row still open

**State at planning:** 16 corpus rows, Σ 7,517, whose sources combine labels, rainbows, stereotypes and groups:

| Row | Diffs | What it combines |
|---|---|---|
| `tovuka-43-kere263` | 2 | `-[hidden]->` at the head of every split branch: ours strokes `#181818`, the jar writes `stroke="none"` |
| `nevavo-98-cenu680` | 12 | `-[#00000000]->` and `-[#transparent]->` under `scale 1.5` |
| `bitugi-14-kico572` | 32 | `(-[#blue]->inc) backward:...; (-[#green,dashed]->out)` in a `while` |
| `radute-87-nize199` | 89 | `Plan -right-> Collect`, `-down[hidden]->`, `hide Integrate`: what does the jar type this as? |
| `renefi-68-safo849` | 140 | `(-[#c]->inc) elseif (B) then (-[#c,dashed]->out)` (T3a's `takupu-75` without the inner arrows) |
| `cidibe-55-gavi744` | 179 | `if (a) equals (1) then` / `elseif (a) equals (2) then` |
| `denono-78-vaje778` | 185 | `partition #CadetBlue;header:red "..." { }` with a `[[url]]` and `----` in the title |
| `nuluji-89-xebu820` | 266 | deep `if` nesting with `stop` in branches |
| `bosada-42`, `bofaxe-86` | 380, 523 | `skinparam activity { /'…'/ }` (T1a's construct), a long real diagram |
| `lidumi-54-moza355` | 556 | multi-line `->t;` labels in if, fork, merge, split, while, repeat (T2a-T2c in one source) |
| `zuseke-31`, `labuxo-17`, `panuna-76` | 626, 679, 1,132 | real diagrams with skinparam/`<style>` blocks for activity, diamond, partition |
| `rejala-47`, `nijezu-72` | 1,351, 1,365 | `<<continuous>>`, `<<procedure>> <<#lightblue>>`, coloured labelled arrows, deep nesting |

**Do:**

1. Re-measure every in-scope row still open (`row-diffs.mts` with no slug list, then filter by
   `planning-corpus.tsv`; `rows.mts` for the authored and dss rows). Journal the table: row, diffs now, diffs at
   planning, first diffs.
2. For each row, read its first diffs and its source, find the mechanism with `file:line`, and fix it here, or in
   a new task if it is a separate mechanism (push-forward). Start with `tovuka-43` and `nevavo-98` (small), then
   `cidibe-55` (`equals` in an `if`, a parse question), `radute-87` (routing), `lidumi-54` (it should fall with
   batch 2).
3. Any row still open ends by D10. A mechanism that is genuinely large and separable gets a `queue:ready` issue with
   its rows, its mechanism quote and the measurement, and #136's body gains "Blocked by #<new>".

## Acceptance
- Given every in-scope row (D1), then the journal names it conformant (pinned), a named divergence, a
  `needs-ruling` issue, or a separable issue. None is unnamed.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
