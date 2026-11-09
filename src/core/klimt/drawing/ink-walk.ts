/**
 * The `LimitFinder` ink walk every svek engine's `SvekResult#calculateDimension`
 * runs (`TextBlockUtils.getMinMax`, klimt/shape/TextBlockUtils.java), with the
 * string-bounder adapters the real draw pass uses. Moved verbatim from
 * `diagrams/description/renderer-ink-extent.ts` (laep batch 2 close) so a
 * second svek engine (`activity-legacy`) reaches it without a
 * diagrams→diagrams import; description re-exports it unchanged.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockUtils.java
 */
import type { UGraphic } from '../UGraphic.js';
import type { UChange } from '../UChange.js';
import type { UShape } from '../UShape.js';
import type { UParam } from '../UParam.js';
import type { UGroup } from '../shape/UGroup.js';
import type { UTranslate } from '../UTranslate.js';
import type { StringBounder as KlimtStringBounder } from '../font/StringBounder.js';
import type { StringBounder as DriverStringBounder } from './svg/driver-text-svg.js';
import type { StringMeasurer } from '../../measurer.js';
import { LimitFinder } from './LimitFinder.js';
import type { MinMax } from '../geom/MinMax.js';
import { XDimension2D } from '../geom/XDimension2D.js';

/**
 * `UGraphicWithGroups`-shaped decorator (see `DecorateEntityImage.ts`'s own
 * doc comment for why this port's `UGraphic` interface omits
 * `startGroup`/`closeGroup`) around a `LimitFinder`. Upstream's own
 * `LimitFinder` needs no such wrapper: it `extends UGraphicNo`, whose
 * `startGroup`/`closeGroup` are no-ops declared directly on the Java
 * `UGraphic` interface (klimt/drawing/UGraphicNo.java:76,84) — every
 * `UGraphic` implementer gets them for free. This port's own `UGraphicNo`
 * intentionally does NOT (T2 mission brief scope reduction — see
 * `UGraphic.ts`'s doc comment) since `LimitFinder` had no caller needing
 * group support until now: `EntityImageDescription#drawU`
 * (`EntityImageDescriptionSupport.ts#requireGroups`) throws without it, and
 * this task's collect pass is the first LimitFinder caller that reaches
 * `EntityImageDescription`. Scoped HERE (not added to `UGraphicNo.ts`/
 * `LimitFinder.ts` — out of this task's write-set per D7) since no other
 * caller needs it. `apply()` re-wraps every derived instance so
 * `startGroup`/`closeGroup` stay available after any number of chained
 * `.apply()` calls, exactly as upstream's class-level no-ops do.
 */
class LimitFinderWithGroups implements UGraphic {
  constructor(private readonly inner: UGraphic) {}

  apply(change: UChange): UGraphic {
    return new LimitFinderWithGroups(this.inner.apply(change));
  }

  draw(shape: UShape): void {
    this.inner.draw(shape);
  }

  getParam(): UParam {
    return this.inner.getParam();
  }

  getTranslate(): UTranslate {
    return this.inner.getTranslate();
  }

  getStringBounder(): KlimtStringBounder {
    return this.inner.getStringBounder();
  }

  /** No-op — mirrors upstream `UGraphicNo#startGroup` (klimt/drawing/UGraphicNo.java:76). */
  startGroup(_group: UGroup): void {
    // Intentionally empty — ink measurement only, no real group emitted.
  }

  /** No-op — mirrors upstream `UGraphicNo#closeGroup` (klimt/drawing/UGraphicNo.java:84). */
  closeGroup(): void {
    // Intentionally empty — ink measurement only, no real group emitted.
  }
}

/**
 * Adapts a `driverBounder` (width-only, `driver-text-svg.ts`'s narrower
 * shape) + a `StringMeasurer` into the klimt-shaped `StringBounder`
 * `LimitFinder`/`TextBlock#calculateDimension` expect — the exact
 * computation `UGraphicSvg#getStringBounder` (`u-graphic-svg.ts`) performs
 * for the REAL draw pass, duplicated here as this module's own "local
 * adapter, not a new shared module" (`renderer.ts`'s own established
 * pattern for this exact seam, `driverBounderFor`) so the collect pass and
 * the real draw pass measure text identically without either module
 * reaching into the other's private state.
 */
export function klimtStringBounderFor(
  driverBounder: DriverStringBounder,
  measurer: StringMeasurer,
): KlimtStringBounder {
  return {
    calculateDimension(font, text) {
      const width = driverBounder.calculateDimension(font, text).width;
      const height = measurer.measure(text, font).height;
      return new XDimension2D(width, height);
    },
    getDescent(font, text) {
      return measurer.getDescent(font, text);
    },
  };
}

/**
 * G1b/J1 (mechanism C write-set expansion, journaled): the shared
 * `LimitFinder` ink-walk primitive both `computeDocumentDims` (below) and
 * `layout-ink-shift.ts#computeInkShift` (the `SvekResult#calculateDimension`
 * shift half of the SAME upstream recipe -- see that module's own doc
 * comment) need: run `draw` through a group-capable `LimitFinder` and hand
 * back the raw `MinMax` accumulator. Pure extraction of what
 * `computeDocumentDims` already did inline -- behavior-preserving, not a
 * new mechanism.
 */
export function runInkWalk(
  draw: (ug: UGraphic) => void,
  driverBounder: DriverStringBounder,
  measurer: StringMeasurer,
): MinMax {
  const bounder = klimtStringBounderFor(driverBounder, measurer);
  const rawLimitFinder = LimitFinder.create(bounder, false);
  draw(new LimitFinderWithGroups(rawLimitFinder));
  return rawLimitFinder.getMinMax();
}

/**
 * G1b/J1 write-set expansion (journaled): moved here from `renderer.ts`
 * (unchanged) so `layout-ink-shift.ts#computeInkShift` can share the exact
 * same `DriverStringBounder` adapter the real draw pass uses, without
 * `layout-ink-shift.ts` importing from `renderer.ts` (would create an
 * import-graph loop through `renderer.ts`'s own type-only `layout.js`
 * import -- see decision-journal.md G1b/J1). See this function's original
 * doc comment (still accurate, reproduced verbatim below).
 *
 * Passes `font` straight through to `measurer.measure` rather than
 * reconstructing a stripped `{family,size}` literal: `DriverStringBounder`'s
 * interface only declares `family`/`size`, but a caller reaching this
 * through `UGraphicSvg.getStringBounder()` (`buildTextBlock`,
 * `EntityImageDescriptionSupport.ts`) passes the FULL `FontConfiguration`
 * object (weight/style included) -- reconstructing here would silently drop
 * `jarMeasurer`'s bold-table lookup (D12/T4: bold uses a genuinely different
 * advance table, not a scaled copy) for every bold/italic entity
 * title/stereotype. Passing `font` through preserves those extra fields at
 * runtime; `FontSpec`'s `weight?`/`style?` are optional, so a bare
 * `{family,size}` caller (e.g. `DriverTextSvg`'s own textLength computation,
 * which already reconstructs the same stripped shape) still works
 * unchanged.
 */
export function driverBounderFor(measurer: StringMeasurer): DriverStringBounder {
  return {
    calculateDimension(font, text) {
      return { width: measurer.measure(text, font).width };
    },
  };
}
