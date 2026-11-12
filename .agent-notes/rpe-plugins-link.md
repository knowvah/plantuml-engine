## Observation: plantuml-plugins still links the pre-rename package
- **Context**: rename-plantuml-engine T7b (issue #173), describing plantuml-plugins in `docs/architecture/components.md`.
- **Finding**: on 2026-11-12, `~/git/knowvah/plantuml-plugins` depends on `@knowvah/plantuml-ts` through a `link:` to the sibling checkout `../plantuml-ts` (`packages/core/package.json:11`; `README.md:4,58,63-68,94` clone `sseely/plantuml-ts` and require the sibling at `../plantuml-ts`). This repo now publishes `@knowvah/plantuml-engine` from `~/git/knowvah/plantuml-engine`.
- **Impact**: plantuml-plugins' install/build breaks against the renamed package until it changes its dependency name, link path and README. That repo is outside this one's write-set; the change belongs to a plantuml-plugins PR.
- **Confidence**: High (read from that repo's files on 2026-11-12)
