// SPDX-License-Identifier: MIT
/**
 * The playground's render path for `!include <bundle/…>` (issue #172).
 *
 * `renderSync` cannot await a chunk, so each render first resolves its
 * includes with `prepareIncludeStore` against a lazy `stdlibRegistry`, then
 * renders synchronously from the filled store (`src/core/include-resolver.ts`,
 * `prepareIncludeStore`'s doc comment). Decisions live here, testable under
 * vitest; `Playground.vue` stays a thin shell (plans/playground-stdlib D3).
 *
 * The stdlib subpaths are typed by `./stdlib-packages.d.ts` (listed in
 * tsconfig.json's `include`) so typecheck does not need `generated/` built.
 */
import {
  prepareIncludeStore,
  remoteStdlib,
  StdlibChunkLoadError,
  stdlibRegistry,
  type StdlibRegistry,
} from '@knowvah/plantuml-engine';

/** What `prepareIncludeStore` hands back, without widening the library's exports. */
export type PlaygroundIncludeStore = Awaited<ReturnType<typeof prepareIncludeStore>>;

/** The folder under the site root that `docs-site/copy-stdlib-assets.mjs` fills. */
export const STDLIB_ASSET_DIR = 'stdlib';
// Remote bundles' folder names, as each package's `assets/` lays them out.
const AWSLIB14_FOLDER = 'awslib14';
const TUPADR3_FOLDER = 'tupadr3';

function assetUrl(baseUrl: string, folder: string): string {
  return `${baseUrl}${STDLIB_ASSET_DIR}/${folder}/`;
}

/**
 * One entry per bundle the workspace packages ship (plans/playground-stdlib
 * D1; `scripts/build-stdlib-packages/package-specs.ts`). Every specifier is
 * static so the bundler splits each into its own chunk (si8 ADR-3,
 * `src/core/tim/StdlibRegistry.ts`'s doc comment).
 *
 * `baseUrl` is the site's base (`import.meta.env.BASE_URL`), ending in `/`.
 */
export function playgroundRegistry(baseUrl: string): StdlibRegistry {
  const awslib14Url = assetUrl(baseUrl, AWSLIB14_FOLDER);
  return stdlibRegistry({
    // Eager `BundleData`: the registry harvests a module namespace by each
    // export's `name`, so the bootstrap module serves both of its bundles.
    c4: () => import('@knowvah/plantuml-stdlib/c4'),
    archimate: () => import('@knowvah/plantuml-stdlib/archimate'),
    cloudinsight: () => import('@knowvah/plantuml-stdlib/cloudinsight'),
    cloudogu: () => import('@knowvah/plantuml-stdlib/cloudogu'),
    bootstrap: () => import('@knowvah/plantuml-stdlib/bootstrap'),
    'bootstrap1.13.1': () => import('@knowvah/plantuml-stdlib/bootstrap'),
    // Remote manifests need a `baseUrl` serving the package's `assets/` (D2).
    awslib14: () =>
      import('@knowvah/plantuml-stdlib-aws/awslib14.remote').then((m) =>
        remoteStdlib({ manifest: m.awslib14Remote, baseUrl: awslib14Url }),
      ),
    // An alias with an empty `files`: its target resolves through `awslib14`.
    awslib: () =>
      import('@knowvah/plantuml-stdlib-aws/awslib.remote').then((m) =>
        remoteStdlib({ manifest: m.awslibRemote, baseUrl: awslib14Url }),
      ),
    tupadr3: () =>
      import('@knowvah/plantuml-stdlib-tupadr3/tupadr3.remote').then((m) =>
        remoteStdlib({ manifest: m.tupadr3Remote, baseUrl: assetUrl(baseUrl, TUPADR3_FOLDER) }),
      ),
  });
}

/** A settled render: the SVG to show, or the text for the error pane. */
export type PlaygroundResult = { svg: string; error: '' } | { svg: ''; error: string };

export interface RenderSequencerDeps {
  /** Resolve `src`'s includes (`prepareIncludeStore` with the registry). */
  prepare: (src: string) => Promise<PlaygroundIncludeStore>;
  /** Render from a filled store (`renderSync` with `includeStore`). */
  renderSync: (src: string, store: PlaygroundIncludeStore) => string;
  /** The library's async path, whose own error page covers every other failure (`render`). */
  renderAsync: (src: string) => Promise<string>;
}

/**
 * Returns a render function whose results are dropped (`undefined`) once a
 * newer call has started, so a slow earlier render never overwrites a newer
 * one. The id is re-checked after every `await` (state read before an await
 * can be stale after it).
 *
 * - `StdlibChunkLoadError` becomes error text: `render()` would draw it as an
 *   error page, and the playground reports it in the error pane instead.
 * - Any other rejection from `prepare` goes to `renderAsync`, whose catch draws
 *   the library's own error page (`src/index.ts`, `render`).
 */
export function createRenderSequencer(
  deps: RenderSequencerDeps,
): (src: string) => Promise<PlaygroundResult | undefined> {
  let latest = 0;
  return async (src) => {
    const id = ++latest;
    let store: PlaygroundIncludeStore;
    try {
      store = await deps.prepare(src);
    } catch (err) {
      if (id !== latest) return undefined;
      if (err instanceof StdlibChunkLoadError) return { svg: '', error: err.message };
      const svg = await deps.renderAsync(src);
      return id === latest ? { svg, error: '' } : undefined;
    }
    if (id !== latest) return undefined;
    return { svg: deps.renderSync(src, store), error: '' };
  };
}
