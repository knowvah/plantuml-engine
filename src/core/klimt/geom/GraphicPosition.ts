/**
 * `GraphicPosition` — where `GraphicStrings` places its image. An as-const
 * object rather than a TS `enum` (the project's convention for upstream enums).
 *
 * `core/error/graphic-strings.ts` keeps its own two-value string union for
 * the error pages; this is the full upstream enum the klimt port uses. `BOTTOM`
 * went with the easter eggs that used it (dadad87bba3).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/geom/GraphicPosition.java:38-41
 */
export const GraphicPosition = {
  BACKGROUND_CORNER_BOTTOM_RIGHT: 'BACKGROUND_CORNER_BOTTOM_RIGHT',
  BACKGROUND_CORNER_TOP_RIGHT: 'BACKGROUND_CORNER_TOP_RIGHT',
} as const;

export type GraphicPosition = (typeof GraphicPosition)[keyof typeof GraphicPosition];
