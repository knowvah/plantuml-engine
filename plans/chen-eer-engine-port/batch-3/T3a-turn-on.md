# T3a: register the plugin

**Java:** `PSystemBuilder.java:197-200`, `core/DiagramType.java:111-112`.

**Do:**
1. Add `registry.register(chenPlugin); // java:199` after `regexPlugin`. Update `registered-plugins.ts`'s comment if it
   lists unported factories.
2. Add `chen: 'chen'` to `block-extractor.ts#START_SUFFIX_MAP`, with a `ceep T3a` comment, and add `'chen'` to the
   `DiagramType` union. Update `diagram-type-set.ts:23`'s "no engine for" list.
3. Create `render-fixture-cheneer.ts` from `render-fixture-regex.ts` with `regex` substituted. It exports
   `renderFixtureCheneer`, `listAuthoredCheneerSlugs` and `readAuthoredCheneerFixture`, and reads
   `tests/fixtures/cheneer`.
4. Run the every-engine survey and `verdict-diff.mjs <base>`. No row may move (D3).

## Acceptance
- Given `renderSync` on `vega-chen-movie.puml`, then the root carries `data-diagram-type="CHEN_EER"`, not the
  unknown-type sentinel.
- Given the survey, then `verdict-diff.mjs <base>` exits 0, and the routing and refusal gates pass unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
