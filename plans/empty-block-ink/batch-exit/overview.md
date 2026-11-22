# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Every-engine survey, verdict-diff, dashboard, d.ts check, summary | orchestrator | survey outputs, `docs/parity-report.md`, README summary | T2 | [x] |

## T3

1. `uptime` below ~10. Run `npm run svg:survey` **alone** (about 30 min), then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must print 0 lost in every
   engine; exit 1 is stop 1 unless the mechanism is stated with `file:line`.
2. List every census attribute that moved, toward or away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`). Moves are expected only in json, yaml, hcl
   and engines that embed json/yaml images (`grep -l "{{json\|{{yaml" tests/corpus -r` narrows it). An
   `oracle/accepted-divergences.json` entry whose row turned conformant is retired (README push-forward).
3. `npm run parity:dashboard`; commit the survey files and `docs/parity-report.md` together.
4. `npm run build`, then `cmp` each `dist/*.d.ts` with `/tmp/ebi-base-dts/` (D6).
5. Run the README gates.
6. Write a `## Summary (<date>)` section in the README: tasks, gates, the 11 rows before → after, per-engine verdicts,
   d.ts, follow-ons (and add them to `planning/next-missions.md`). Comment the result on #136 in the pattern of its
   existing comments.
7. Commit: `docs(ebi): close out empty-block-ink`, footer `Refs: #187`.

## Acceptance

- Given the final survey, when `verdict-diff` runs against `<base>`, then it reports 0 lost in every engine.
- Given the build, when the d.ts files are compared, then they are byte-identical to T0's.
- Given the README, when read, then every "Done when" box is ticked or names the issue that holds it.

Observability is N/A. Rollback is Reversible.
