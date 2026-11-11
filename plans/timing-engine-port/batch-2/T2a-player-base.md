# T2a — `Player`, `AbstractStatePlayer`, `ChangeState`, `TimingNote`, `PlayerFrame`, `IntricatedPoint`

**Write-set:** `src/diagrams/timing/{Player,AbstractStatePlayer,ChangeState,TimingNote}.ts`,
`src/diagrams/timing/graphic/{PlayerFrame,IntricatedPoint}.ts`, `tests/unit/timing/**`.

**Read:** D6, D7, D13, D16; `Player.java`, `AbstractStatePlayer.java`, `ChangeState.java`, `TimingNote.java`,
`graphic/PlayerFrame.java`, `graphic/IntricatedPoint.java`; `src/core/svek/image/Opale.ts` (the `Opale` class
`TimingNote#createOpale` builds, java:82-95) and one engine that already builds a note `Opale` from a creole sheet
(`src/diagrams/activity/ftile/vcompact/FloatingNote.ts`).

**Do:**

1. `Player.ts`: the abstract class above; `getStyle` and the note style at java:77-79 through
   `StyleSignatureBasic.of(...).withTOBECHANGED(stereotype).getMergedStyle(getCurrentStyleBuilder())`;
   `getGeneralBackgroundColor` at java:123-133; `panels()` memoized as the Java does.
2. `AbstractStatePlayer.ts`: `changes` as a `TreeSet<ChangeState>` sorted array where an equal element is not added
   (D6), `constraints`, `statesLabel` (`LinkedHashMap` → `Map`), `defineState`, `setState`, `createConstraint`.
3. `ChangeState.ts`: `compareTo` on the tick; `getStates`, `getComment`, `getColors`, `isBlank`, `isCompletelyHidden`
   and whatever the panels read, as the Java names them.
4. `TimingNote.ts`: the `Opale` around the note sheet, `getHeight` with `getMarginY`.
5. `graphic/PlayerFrame.ts`, `graphic/IntricatedPoint.ts`.

**Tests:** a second `setState` at an equal tick (`@1` then `@1.0`) is dropped; `defineState('LL', 'Long Label')` maps
the label; `TimingNote` of `cov-notes`'s "first note" has the oracle's `Opale` path and height; `PlayerFrame` draws the
title text at the oracle x/y of `cov-concise-basic` (`Web User`).

## Acceptance
- Given `cov-notes` and `cov-concise-basic` oracles, when these classes are built from their values, then the drawn
  title and note geometry equal the oracle's.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
