/**
 * The store the async include prefetch fills and `render()` hands to the
 * interpreter (`include-resolver.ts`, `startPrefetchWalk`). Split out of
 * `include-resolver.ts` (500-line limit) when #180 added the packaged-theme
 * forwarding.
 */
import type { PackagedTheme } from './tim/ThemeStore.js';
import { MapIncludeStore, type IncludeStore } from './tim/IncludeStore.js';

/** A {@link MapIncludeStore} that falls back to a read-only base store on a miss. */
export class BackedIncludeStore extends MapIncludeStore {
  private readonly base: IncludeStore | undefined;

  constructor(base: IncludeStore | undefined) {
    super();
    this.base = base;
  }

  override get(path: string): string | undefined {
    return super.get(path) ?? this.base?.get(path);
  }

  override has(path: string): boolean {
    return this.get(path) !== undefined;
  }

  /**
   * Forward the `<bundle/thing>` seam to the base store.
   *
   * This store is not just prefetch's scratch space — it is the value `render()`
   * hands to the interpreter (`src/index.ts`, `prefetchIncludes` -> `buildBlockUmls`).
   * Without this delegation, a `withStdlib` base resolves during prefetch and
   * then `IncludeExecutor#load` throws `StdlibNotBundledError` anyway, because
   * `this.store.getPumlResource?.(...)` finds no such method on the wrapper.
   * Accepting in `prefetchInner` alone fixes nothing a caller can observe.
   */
  getPumlResource(fullname: string): string | undefined {
    return this.base?.getPumlResource?.(fullname);
  }

  /** #180 D1: forward the packaged-theme seam (`ThemeStore.ts#withThemes`), for
   *  the same reason as {@link getPumlResource}: this wrapper is what the
   *  interpreter reads. */
  getPackagedTheme(name: string): PackagedTheme | undefined {
    return this.base?.getPackagedTheme?.(name);
  }

  packagedThemeNames(): readonly string[] {
    return this.base?.packagedThemeNames?.() ?? [];
  }
}
