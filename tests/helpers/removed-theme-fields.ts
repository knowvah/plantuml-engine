/**
 * `Theme['colors']['graph']` members deleted by the maintainer's ruling on
 * #156 (option #1: "delete both fields and their writers"). Upstream has no
 * such field: a business actor/use case fills from its own
 * `{…, actor, business, title}` signature's `BackGroundColor`
 * (`svek/image/EntityImageDescription.java:143-152,164-166`). Absence pins in
 * `tests/unit/theme.test.ts` and `tests/unit/core/style-map-simple-fields.test.ts`
 * import this so the names appear once.
 */
export const REMOVED_BUSINESS_FILL_FIELDS = ['businessActorFill', 'businessUsecaseFill'] as const;
