# Decisions

## D1. Mirror the jar's routing; nothing to sign

**Context.** Issue #191: the jar draws `actor X #line:zzblue` and `actor X #line:red` as DESCRIPTION. The planning
oracles agree, and 22 more variants (every participant keyword the description grammar shares, every name form, a
stereotype, a URL, a later message, teoz) draw DESCRIPTION too. `entity` draws CLASS. The 6 rows where the jar errors
also error under the stock jar at the pin and under the latest release (`measurements/jar-error-check.txt`).

**Decision.** Mirror the jar. The sequence participant family refuses the capture as `CommandParticipant.java:183-185`
does. The factory chain the port already has then picks the next factory. No new divergence, no signed row.

**Rejected.** *Keep sequence and sign the rows.* No library forces it (CLAUDE.md: "no library forcing it ⇒ mirror"),
and the jar draws, so the 2026-10-10 "we draw where the jar errors" rule does not apply.

## D2. Refuse exactly what `refusesAsBareColor` refuses

**Decision.** Reuse `refusesAsBareColor` (`src/core/klimt/color/HColorSet.ts:392`, #190 D2). A capture that is an
unknown **bare** colour (`actor X #zzblue`) keeps the 2026-11-04 neutral ruling: today it draws `#D3D3D3`
(`alr-unknown-bare`), and it must not move, although the jar errors on it. The DIVERGENCES.md paragraph "We draw where
the jar errors" covers it.

- Test only the COLOR capture (`stripParticipantTail`'s `color`), never the line.
- Reuse `CommandExecutionResult.badColor()`'s message and score (`src/core/command/CommandExecutionResult.ts:76-77`).
  Do not retype `'No such color'` or `10`.

**Rejected.** *Refuse every capture `getColorOrNull` rejects.* That reverses the neutral ruling for `#zzblue`, which
is the maintainer's call.

## D3. Where the refusal is raised, and its score

- In `declareParticipant` (`command-participant.ts:38-54`), **after** the existing-CODE branch
  (`CommandParticipant.java:146-148` returns before `:183-185`) and **before** `ensureParticipant`, so a refused line
  creates nothing. `alr-existing`, `-existing-msg`, `-create-existing` and `-create-actor-existing` guard the order.
- Set `state.executionError` to badColor's message. Add **one** optional field beside it, `executionErrorScore?: number`,
  named and documented like description's (`src/diagrams/description/parse-state.ts:109-110`). Pass it at
  `parser.ts:294` as `refuse`'s `commandScore`, defaulting to 0. Every other sequence refusal keeps score 0.
- The score decides the error page when every factory refuses: `refusalScore` is `consumed * 10 + commandScore`
  (`src/core/parse-refusal.ts:123-126`, `PSystemError.java:417`; the port's JSDoc still cites the older `:382-384`). `alr-participant` needs it: sequence and the
  other factories refuse at the same line, and the jar's label is `Assumed diagram type: sequence`.

**Rejected.** *Throw `SequenceCommandRefusal`.* That signal means "this pattern did not match" and tries the next
command (`sequence-parse-helpers.ts:106-134`). Upstream's command matched and failed, so the whole factory fails.

## D4. The multi-line form never refuses

`CommandParticipantMultilines#executeNow` never reads COLOR (`:136-176`). `matchParticipantMultilineCommand`
(`command-participant.ts`) keeps its colour behaviour. `alr-multiline` guards it: the jar draws SEQUENCE, and the port
does today, at 0 diffs.

## D5. A bare `create` follows upstream's two commands

`CommandActivate` (`SequenceDiagramFactory.java:103`) is tried before `CommandParticipantA` (`:106`).

- **The `CommandActivate` grammar** (`CommandActivate.java:72-83`: `create`, WHO, optional `#\w+` BACK, optional
  ` #\w+` LINE, end) runs `getOrCreateParticipant` and `activate(p, CREATE, back, line)` (`:116-131`). It never
  colours the participant. The colours go to the CREATE `LifeEvent`'s `Fashion` (`SequenceDiagram.java:374`). Port it
  as the fourth TYPE of the lifeline family in `command-lifeline.ts` (the file already ports TYPE `activate`,
  `deactivate` and `destroy`). Register it in that group of `SEQUENCE_COMMANDS`. An existing CODE is never moved.
- **Anything else** after a bare `create` (for example `create X #line:red`) is `CommandParticipantA` with TYPE `create`.
  It moves an existing CODE last (`CommandParticipant.java:146-148`), and a new CODE refuses or stores the colour per
  D2/D3. In the port that is `createCommand` with `moveExisting = true`.
- A colour BACK/LINE that `getColor` would refuse inside `CommandActivate` (`create X #zzblue`) is an unknown bare
  colour. The neutral ruling applies: do not refuse it.
- `alr-create-move`, `-create-red` and `-create-red-msg` measure it. `alr-ctl-create-move` and the `create-existing`
  guards must stay at 0.

If the port's life-event model has no place for a CREATE colour, drop it and journal that, the same way
`activateCommand` drops its second colour (`command-lifeline.ts:43-45`), as long as no row moves away from the jar.

## D6. Separable residuals are filed or attributed, not fixed here

- `alr-order` → **#284** (description `KEYWORD_RE` catch-all over-accepts `X order 10`). The exit comments on #284 with
  the row.
- `alr-dashed` → **new issue** at the exit: a dashed or dotted `#line.` style on a description actor makes the canvas
  1px narrower than the jar's (planning probe `actor X #line.dashed` + `usecase U`: `svg/@width` 107 vs 108, usecase
  `cx` -0.5). Find our `file:line` first.
- `alr-seq-only` → **#283** (no-Welcome page width).
- Other sequence commands that hand a whole capture to `getColor` (`CommandArrow.java:441,509`,
  `CommandActivate2.java:105`, `CommandExoArrowAny.java:158`, `CommandReferenceOverSeveral.java:123`, and the
  multi-line form at `:135`) have their own regexes, and #191 does not report them. Leave them alone unless a
  push-forward probe shows a divergence. Then file it.

## D7. What "conformant" means for an error row

This is the #190 D5 bar, reused (`plans/object-colour-refusal/decisions.md#d5`). Assert all of these:

1. Ours is an error page (`setErrorPageObserver` fires once).
2. The label text equals the jar's.
3. The `(line N)` number equals the jar's.
4. The Welcome block is present exactly when it is present in the jar's.
5. Every `compareSvg` diff sits on the footer, found by content.

Rows with no Welcome block hold items 1 to 4 and stay OPEN with reason #283. `alr-unknown-bare` is held as drawn: not
an error page, at least one `fill="#D3D3D3"`, `maxDiffs` at today's 5, with the ruling as its reason.

**Template.** Copy the shape of `tests/oracle/svg-conformance/object-colour-refusal.authored.test.ts`. Test files do
not export, so copy rather than import. If you extract a shared helper to `tests/helpers/`, both gates must use it.
Journal it.

Measurement reuses `plans/hidden-note-host/measurements/measure.mts`. No new measurer.

## Operational readiness (auto-confirmed)

- **Observability:** N/A. This is a pure library parse change with no runtime operations.
- **Rollback:** Reversible. Revert the squash commit. There are no data or contract changes.
- **Scalability:** N/A. One extra regex test per declared participant colour.
- **On-call:** N/A (library). The likely failure is a sequence source that loses its participant colour, or one routed
  away from sequence. That shows up as a lost conformant row in verdict-diff (stop condition 1) or a control leaving 0.
- **Backwards compatibility:** a source that relied on the non-upstream sequence draw of `actor X #line:red` now gets
  the jar's description diagram or error page. That is the intended conformance change, not a published API change.
  `dist/*.d.ts` must not move (stop condition 5).

## Auto-confirmed (unattended)

| Phase | Decision | Rejected | Evidence |
|---|---|---|---|
| 0 | Fresh run. `#191` selected | `#136` (blocked by open `#191` and others) | `gh issue list`; #191 has no `Blocked by` |
| 1 | Lightweight scan | reuse `docs/architecture/overview.md` | overview 71 commits behind HEAD (>50) |
| 2 | Blast radius = sequence participant family + bare `create` | `CommandParticipantA` only | `alr-create-move`, `-create-red` diverge in the same family |
| 3 | D1 mirror | keep sequence and sign | jar draws DESCRIPTION; the release jar errors where the pin does |
| 3 | D2 reuse `refusesAsBareColor` | refuse every unresolvable capture | would reverse the 2026-11-04 ruling (`alr-unknown-bare`) |
| 3 | D3 refuse after the exists check, with score 10 | `SequenceCommandRefusal`; score 0 | `CommandParticipant.java:146-148,183-185`; `alr-participant` label |
| 3 | D4 the multi-line form never refuses | refuse there too | `CommandParticipantMultilines.java:136-176`; jar draws `alr-multiline` |
| 3 | D5 port `CommandActivate` TYPE `create` | patch `createCommand` alone | upstream registers two commands; `alr-create-red` colours differ |
| 3 | D6 attribute or file the residuals | fix in this mission | each has a mechanism outside the participant family |
| 4 | Reversible, observability N/A | none | library-only parse change |
| 5 | T0, T1, T2, T3, T4, T5 | one fix task | gate first so T2 goes red then green; T3 is a separate mechanism (M3) |
| 6 | README stop and push-forward lists | none | precedent `object-colour-refusal` |

No Irreversible change, so no acknowledgement is needed.

## Pre-flight (planning, 2026-11-24, `d7f8c3db4`)

- [x] Every Modify path in the write-sets exists; the parent of every Create path exists (`tests/fixtures/`,
      `tests/oracle/svg-conformance/`, `tests/unit/sequence/`).
- [x] `npm test -- --maxWorkers=4`: exit 0, 2372 files / 51374 tests passed, coverage gate met (lines 97.01,
      branches 92.61, functions 97.51). The first run, at load average ~31, timed out 3 tests at 5000ms
      (`legacy-name`, `factories.golden.ratchet` folutu-01, `nwdiag.diff-baseline.ratchet` cov-x-stdlib-sprite). Run
      alone, those 3 files passed (149 tests). The full rerun at load ~16 passed: load, not a red baseline.
- [x] `npm run lint`: exit 0.
- [x] `feature/parity-queue` is checked out (`--branch` mode; no new branch is created).
- [x] Working tree clean apart from this brief (and the planner's own progress file, deleted at hand-off).
- [x] Every task spec states observability (N/A) and rollback (Reversible).
- [x] No Irreversible change, so no acknowledgement is needed.
- [x] Both diagrams render through this port with no error page (ACTIVITY and DESCRIPTION).
