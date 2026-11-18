# Decisions (utf)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-17). `next`
resolved to #156: no issue was `queue:planned`; #136 is blocked by open issues (#156 and #157 among them); #156 is the
lowest-numbered `queue:ready` issue with no "Blocked by" reference and no `needs-ruling` label. Its title begins
"Ruling:", but the maintainer answered in a comment (2026-11-09: "Use option #1, delete both fields and their
writers"), so it is not parked. The issue's public-d.ts change is the decision the ruling signed; the brief does not
decide it. Each decision lists what was rejected and the evidence, so the user can audit it.

### D1: Delete the two members, their three defaults and the two selector entries; nothing else in `src/`

**Upstream.** No theme field exists. `EntityImageDescription.java:163-165`: `backcolor = colors.getColor(BACK)`, else
`styleTitle.value(PName.BackGroundColor)`; `styleTitle` is built at `:150-152` from the signature that includes the
symbol's SNames (`business` for the business symbols).

**Ours.** `renderer-entity.ts:204-206` already reads `override.back ?? stylePaint(entityStyle?.title,
'BackGroundColor') ?? resolveElementPaint(…)`. The deleted fields have zero readers in `src/` on `1689e015e`.

**Decision.** Delete `businessActorFill`/`businessUsecaseFill` with their comments (`theme-graph-colors-b.ts:386-391`),
the defaults (`theme.ts:306-307`, `:357`) and the `actor.business`/`usecase.business` entries of
`SIMPLE_SELECTOR_MAPPINGS` (`style-map-simple-fields.ts:33-39`, `:47-53`). Those entries are the "writers" the ruling
names; with no field to write they would not type-check, and the table's header says each entry populates disjoint
fields, so no other entry depends on them.

**Rejected.**
- *Mark the fields `@deprecated` and keep them.* Option #2 in spirit; ruled against.
- *Make them optional (`?:`) instead of deleting.* Keeps an unread public member; not what was ruled.
- *Also touch `actorFill`/`usecaseFill` and their "divergence preserved" comments.* Out of the ruling's scope; those
  fields are read.

### D2: Tests: delete the assertions, keep the tests' other coverage, add an absence pin

`tests/unit/theme.test.ts` loses its assertions and literal members for the two fields (the issue lists the lines).
Where a test exists only for a deleted field (`graph.businessActorFill is none`, `graph.businessUsecaseFill equals
colors.background`, both themes), delete the test. Where a test also covers `actorFill`/`usecaseFill` ("has all four new
graph fill properties"), keep it for the remaining two and retitle it. `gtile-text-tiles.test.ts:43-44` loses its two
literal members (they become excess properties). The `dss-t3a-readers` test title stops naming the deleted default.

The red step for a deletion is an absence test: for each of `defaultTheme`, `darkTheme`, `sketchyTheme`,
`monochromeTheme`, assert `Object.hasOwn(theme.colors.graph, '<field>')` is `false`; and in a new
`tests/unit/core/style-map-simple-fields.test.ts`, that `computeSimpleSelectorOverrides` on a style map holding
`actor.business` and `usecase.business` with `backgroundcolor` returns an object with neither key (and, as a positive
control, that `actor`'s `backgroundcolor` still lands in `actorFill`). Name the field strings once in a module-level
constant.

**Rejected.** *Rely on `tsc` alone.* It proves the type lost the members, not that no runtime object still carries them.

### D3: The d.ts change is the ruled one, and nothing more

T0 snapshots `dist/*.d.ts` after `npm run build`. At exit the diff must be exactly the removal of the two members
(plus any comment lines the bundler attached to them). Anything else is stop 5. `CHANGELOG.md`'s `## [Unreleased]` →
`### Removed` gains one entry naming the members, `ThemeGraphColors` / `Theme['colors']['graph']`, ruling #156, and
that `<style> actor { business { BackGroundColor } }` still applies through the element style buckets.

**Rejected.** *A `BREAKING CHANGE:` footer on the squash commit.* The package has no consumers and the CHANGELOG already
carries the importer-facing breaks under `[Unreleased]`; the commit body names the type removal instead.

### D4: Historical records stay as written

`plans/style-blocks/*`, `plans/style-colour-reads/*`, `planning/usecase-deepdive.md`,
`planning/mission-svg-conformance-2/decision-journal.md` and the older `CHANGELOG.md` entry (`:305-306`) describe the
fields at the time. They are records of past missions, not live documentation; editing them rewrites history. Only
`planning/next-missions.md:302` (a live follow-on list) is updated, striking the item with the mission name.

## Operational readiness

- **Observability:** N/A. A pure library; no new operation, log or metric.
- **Rollback:** Reversible. Revert the squash commit; the type members, defaults and selector entries come back with it.
- **Scalability:** N/A.
- **On-call:** N/A. The only failure mode is a missed reader, caught by `npm run typecheck` (any read of a deleted
  member fails to compile) and by the every-engine survey (stop 1).
- **Backwards compatibility:** a public type loses two members (D3), signed on #156. No rendered output, data format
  or option changes.
