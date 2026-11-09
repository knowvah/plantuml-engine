/**
 * The `data-diagram-type` a fragment prints when it differs from its routing key (`RenderFragment.diagramType`).
 *
 * laep D4: legacy activity prints `ACTIVITY`, as activitydiagram3 does, but is exported through the titled-diagram
 * tail (`TextBlockExporter`), so its routing key must be its own. The value rides on the fragment under a module
 * symbol, not a public `RenderFragment` field, so `dist/*.d.ts` does not change: the same internal-key shape as
 * `activity-box-theme.ts`. Object spread copies a symbol-keyed property, so a fragment rebuilt by `{ ...fragment }`
 * keeps it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:292-294
 */
import type { RenderFragment } from './dispatcher.js';

const PRINTED_DIAGRAM_TYPE_KEY: unique symbol = Symbol('render.printedDiagramType');

type WithPrintedType = { readonly [PRINTED_DIAGRAM_TYPE_KEY]?: string };

/** `fragment` carrying `printed` as the `data-diagram-type` to print. */
export function withPrintedDiagramType<T extends RenderFragment>(fragment: T, printed: string): T {
  return { ...fragment, [PRINTED_DIAGRAM_TYPE_KEY]: printed };
}

/** The value to print: the carried one, else the routing key. */
export function printedDiagramTypeOf(fragment: object, routingKey: string): string {
  return (fragment as WithPrintedType)[PRINTED_DIAGRAM_TYPE_KEY] ?? routingKey;
}
