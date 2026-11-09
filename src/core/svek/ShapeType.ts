/**
 * `ShapeType` — the geometric family svek and the DOT emitter branch on.
 *
 * Upstream is a 12-value Java `enum`; ported as an as-const object (no `const enum`). It used to live as a
 * five-value subset in `svek/image/EntityImageDescriptionSupport.ts`; that module now re-exports this one.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ShapeType.java:38-51
 */
export const ShapeType = {
  RECTANGLE: 'RECTANGLE',
  RECTANGLE_PORT: 'RECTANGLE_PORT',
  RECTANGLE_WITH_CIRCLE_INSIDE: 'RECTANGLE_WITH_CIRCLE_INSIDE',
  RECTANGLE_HTML_FOR_PORTS: 'RECTANGLE_HTML_FOR_PORTS',
  ROUND_RECTANGLE: 'ROUND_RECTANGLE',
  CIRCLE: 'CIRCLE',
  OVAL: 'OVAL',
  DIAMOND: 'DIAMOND',
  OCTAGON: 'OCTAGON',
  FOLDER: 'FOLDER',
  HEXAGON: 'HEXAGON',
  PORT: 'PORT',
} as const;
export type ShapeType = (typeof ShapeType)[keyof typeof ShapeType];
