# Batch 1: state (the corpus row)

The helper first (T1a), then state's DOT box (T1b), then state's drawing and the pins (T1c). Each task touches
files the next one reads, so they run serially.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-core-helper.md) | Core helper: CreoleParser's embed walk + SheetBlock1 stacking + the embed atom | typescript-pro | `src/core/svek/edge-label-embed.ts`, its unit test | T0 | [x] |
| [T1b](T1b-state-box.md) | State: the label's reserved DOT box from the stacked block | typescript-pro | `state-label-style.ts`, `state-dot-graph.ts`, `state-composite-edge-label.ts`, `state-geo-types.ts`, tests | T1a | [x] |
| [T1c](T1c-state-draw-pin.md) | State: draw the embed `<image>`, pin xetase, start the authored gate | typescript-pro | `state-renderer-transitions.ts`, `state-transition-label.ts`, `tests/fixtures/edge-label-embed/`, authored test, `svg-state` pin, backlog | T1b | [x] |

**Close:** the task-contract batch close. `state` must read 299/299 conformant in `parity-state.json`, and
`verdict-diff` must show 0 lost in every engine.
