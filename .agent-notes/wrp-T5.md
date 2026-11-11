# wrp-T5: issue comments left unposted

`gh issue comment` was denied on 2026-11-11 (auto-mode classifier, external system writes). Post these two by hand.
`gh issue create` succeeded for the follow-on, #168. The second comment carries #136's "Blocked by #168" line (D8).

## Comment for #128

The wire engine port (mission `wire-engine-port`) ran on `feature/parity-queue`. It is one unsigned commit, not pushed; the
per-task history is on the local tag `wire-engine-port/pre-squash`.

- `src/diagrams/wire/` ports `net/sourceforge/plantuml/wire/` file for file, and `WireDiagramFactory` is registered at
  `PSystemBuilder.java:189`. `Block.java` and `WCursor.java` stay unported: nothing upstream references them.
- **All 18 `@startwire` rows are conformant**, byte-identical on the first survey after registration, and pinned in
  `oracle/goldens/svg-wire`.
- 113 authored fixtures in `tests/fixtures/wire`: 112 at 0 diffs or jar error pairs. `cov-embedded-state-note` waits on a
  state-engine gap, #168.
- Overall: 5,666 -> 5,684 conformant of 5,927. No row was lost in any engine, and no divergence was added.
- `print` advances the cursor with AWT metrics in every render, because `FileFormat.PNG.getDefaultStringBounder()` is
  outside the deterministic seam; a table inside a `print` freezes on that bounder through `SkinParam#sheet`'s cache,
  which `wire-skin-param.ts` ports.
- `dist/*.d.ts` is unchanged against the base.

## Comment for #136

Update from the wire engine port (#128, mission `wire-engine-port`, on `feature/parity-queue`, unsigned, not pushed):

- **`wire`: 0 / 0 / 18 -> 18 / 0 / 0**, byte-identical and pinned in `oracle/goldens/svg-wire`.
- Overall: 5,666 -> 5,684 conformant of 5,927 (diverged 148 -> 130). No row was lost in any engine.
- One follow-on: #168, a `{{ }}` in a state note draws as text (authored fixtures `cov-embedded-state-note` and timing's
  `cov-embedded-state`).

Blocked by #168.
