# T4h: `sivoso`, the skinparam warning banner

**Row:** `sivoso-11-xabi195`.

A 155-line source: `Bob -> Alice : hello`, a long `<style>` block, `skinparam ParticipantPadding 10` among other
skinparams, and `Lars - Laura : gogogo`. The jar types it CLASS. Its page is 435×91. The jar's second `rect` is a
warning banner (`x=8 y=8`, height 15, fill `#FFC`, stroke `#FD8` width 3, `rx` 2.5), holding the monospace text
`Please use CSS style instead of skinparam ParticipantPadding`. The entities sit below it. We draw no banner, so our
page is 71 tall.

## Lead (verify before acting)

`CommandSkinParam.java:95-96` adds the warning: `if ("ParticipantPadding".equalsIgnoreCase(name))
diagram.addWarning(new Warning("Please use CSS style instead of skinparam ParticipantPadding"))`. `:92-93`
(`handwritten`) and `:98-99` (`padding`) add the others. `src/core/skinparam-warnings.ts` ports the warnings, and
description and ten other engines use it (`grep -rln skinparam-warnings src`). Class does not. Read where the jar
draws a diagram's warnings (the chrome around the diagram), how description threads them, and wire class through the
same seam.

`<style>` and `UseBetaStyle` may leave further diffs once the banner lands (step 6). Fix those here if they share this
mechanism; otherwise split the task.

## Acceptance
- Given `sivoso-11-xabi195`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4h.test.ts`, then a class source with `skinparam ParticipantPadding 10`
  draws the banner with the oracle's text, size and colours, and one without it draws none.

Observability is N/A. Rollback is Reversible.
