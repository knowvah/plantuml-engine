# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you say why a row differs. The spine:
   - `descdiagram/DescriptionDiagramFactory.java:129-137` (registration order);
   - `svek/GeneralImageBuilder.java:183-187` (map, json) and `:235-255` (domain, requirement dispatch);
   - `objectdiagram/command/CommandCreateJson.java`, `CommandCreateJsonSingleLine.java`, `CommandCreateMap.java`;
   - `svek/image/EntityImageJson.java`, `cucadiagram/TextBlockCucaJSon.java`, `svek/image/EntityImageMap.java`;
   - `descdiagram/CommandCreateDomain.java`, `BoxedCharacter.java`, `EntityImageDomain.java`,
     `EntityImageDesignedDomain.java`, `EntityImageMachine.java`, `EntityImageRequirement.java`;
   - `stereo/Stereotype.java:210-233` (`isBiddableOrUncertain` … `isMachineOrSpecification`).

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md` for the class name. Read `src/core/command/CommandCreateJson.ts`, `src/core/command/JsonNode.ts`,
     `src/core/svek/image/EntityImageJson.ts`, `src/core/spot-glyph-data.ts`,
     `src/core/klimt/drawing/svg/driver-centered-character-svg.ts`.
   - Read the class and state copies for what they learned (`class-json-sizing.ts`, `class-map-sizing.ts`,
     `state-json-sizing.ts`), but port from the Java (D1).
   - Run `ls .agent-notes | grep -iE "json|map|domain|descr|dei-"`.
3. **Red.** Before a code change, add a failing unit test that asserts the jar's value from a fixture's oracle: an
   exact coordinate, width, `fill` or path. Never assert only "renders" or "is not an error".
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
   - Description sources without the four keywords must not change: no pin may move.
5. **Measure, alone:** `npx tsx plans/description-entity-images/measurements/measure-dei.mts /tmp/dei-<task>.json`.
   No row's diff count may rise.
   - After any `src/diagrams/description/` change, also run
     `npx vitest run tests/oracle/svg-conformance/description.golden.ratchet.test.ts` and read the count.
   - Then run the `unknown` and `component` surveys with `--out`.
6. **Pin.** A row or `dei-*` fixture that reaches conformant and `dotEqual: true` is pinned at the exit (T5), not
   mid-mission, so one ratchet edit carries every pin. Record each in the journal when it first reaches zero.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #147`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/dei-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`, and commit `docs/parity-report.md` with the `parity-*.json` files.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
