import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createRenderSequencer,
  playgroundRegistry,
  type PlaygroundIncludeStore,
  type RenderSequencerDeps,
} from '../../../docs-site/.vitepress/theme/playground-render.js';
import { MapIncludeStore } from '../../../src/core/tim/IncludeStore.js';
import { StdlibChunkLoadError } from '../../../src/index.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const STDLIB_ASSETS = join(REPO_ROOT, 'assets', 'stdlib');
const SITE_BASE = '/';
const SVG_SYNC = '<svg>sync</svg>';
const SVG_ASYNC = '<svg>async</svg>';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Deps whose `prepare` returns the next queued promise, in call order. */
function depsWith(prepared: Promise<PlaygroundIncludeStore>[], renderAsync = vi.fn(() => Promise.resolve(SVG_ASYNC))) {
  const queue = [...prepared];
  const deps: RenderSequencerDeps = {
    prepare: vi.fn(() => queue.shift()!),
    renderSync: vi.fn((src: string) => `${SVG_SYNC}:${src}`),
    renderAsync,
  };
  return deps;
}

describe('createRenderSequencer', () => {
  it('renders from the prepared store', async () => {
    const store = new MapIncludeStore();
    const deps = depsWith([Promise.resolve(store)]);
    const result = await createRenderSequencer(deps)('A');
    expect(result).toEqual({ svg: `${SVG_SYNC}:A`, error: '' });
    expect(deps.renderSync).toHaveBeenCalledWith('A', store);
  });

  it('drops an earlier render that settles after a newer one', async () => {
    const first = deferred<PlaygroundIncludeStore>();
    const second = deferred<PlaygroundIncludeStore>();
    const run = createRenderSequencer(depsWith([first.promise, second.promise]));
    const older = run('old');
    const newer = run('new');
    second.resolve(new MapIncludeStore());
    expect(await newer).toEqual({ svg: `${SVG_SYNC}:new`, error: '' });
    first.resolve(new MapIncludeStore());
    expect(await older).toBeUndefined();
  });

  it('drops an earlier render whose prepare rejects after a newer one started', async () => {
    const first = deferred<PlaygroundIncludeStore>();
    const deps = depsWith([first.promise, Promise.resolve(new MapIncludeStore())]);
    const run = createRenderSequencer(deps);
    const older = run('old');
    expect(await run('new')).toEqual({ svg: `${SVG_SYNC}:new`, error: '' });
    first.reject(new StdlibChunkLoadError('C4', new Error('offline')));
    expect(await older).toBeUndefined();
    expect(deps.renderAsync).not.toHaveBeenCalled();
  });

  it('reports StdlibChunkLoadError as error text', async () => {
    const run = createRenderSequencer(depsWith([Promise.reject(new StdlibChunkLoadError('C4', new Error('404')))]));
    const result = await run('A');
    expect(result?.svg).toBe('');
    expect(result?.error).toContain("Failed to load the 'C4' stdlib bundle");
    expect(result?.error).toContain('Cause: 404');
  });

  it("falls back to the library's error page for any other rejection", async () => {
    const renderAsync = vi.fn(() => Promise.resolve(SVG_ASYNC));
    const run = createRenderSequencer(depsWith([Promise.reject(new Error('circular'))], renderAsync));
    expect(await run('A')).toEqual({ svg: SVG_ASYNC, error: '' });
    expect(renderAsync).toHaveBeenCalledTimes(1);
    expect(renderAsync).toHaveBeenCalledWith('A');
  });

  it('drops a fallback render that a newer render overtook', async () => {
    const page = deferred<string>();
    const deps = depsWith(
      [Promise.reject(new Error('circular')), Promise.resolve(new MapIncludeStore())],
      vi.fn(() => page.promise),
    );
    const run = createRenderSequencer(deps);
    const older = run('old');
    await vi.waitFor(() => expect(deps.renderAsync).toHaveBeenCalledTimes(1));
    expect(await run('new')).toEqual({ svg: `${SVG_SYNC}:new`, error: '' });
    page.resolve(SVG_ASYNC);
    expect(await older).toBeUndefined();
  });
});

describe('playgroundRegistry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serves the vendored C4 file from the eager package', async () => {
    const text = await playgroundRegistry(SITE_BASE).resolveResource('C4', 'c4_container');
    expect(text).toBe(readFileSync(join(STDLIB_ASSETS, 'C4', 'C4_Container.puml'), 'utf8'));
  });

  // Drift guard for stdlib-packages.d.ts: every key loads its real package.
  it.each([
    ['c4', 'C4'],
    ['archimate', 'archimate'],
    ['cloudinsight', 'cloudinsight'],
    ['cloudogu', 'cloudogu'],
    ['bootstrap', 'bootstrap'],
    ['bootstrap1.13.1', 'bootstrap1.13.1'],
    ['awslib14', 'awslib14'],
    ['tupadr3', 'tupadr3'],
  ])('registers %s', async (key, name) => {
    const bundle = await playgroundRegistry(SITE_BASE).resolve(key);
    expect(bundle?.name).toBe(name);
  });

  it('registers awslib as an alias of awslib14', async () => {
    const bundle = await playgroundRegistry(SITE_BASE).resolve('awslib');
    expect(bundle).toEqual({ name: 'awslib', aliasOf: 'awslib14', files: {} });
  });

  it('registers no bundle outside the packaged set', async () => {
    expect(await playgroundRegistry(SITE_BASE).resolve('aws')).toBeUndefined();
  });

  it.each([
    ['awslib14', 'storage/simplestorageservice', '/docs/stdlib/awslib14/Storage/SimpleStorageService.puml'],
    ['tupadr3', 'font-awesome-5/ban', '/docs/stdlib/tupadr3/font-awesome-5/ban.puml'],
  ])('fetches %s resources from the site stdlib folder', async (bundle, key, url) => {
    const fetchStub = vi.fn((_url: string) => Promise.resolve(new Response('@startuml\n@enduml')));
    vi.stubGlobal('fetch', fetchStub);
    const text = await playgroundRegistry('/docs/').resolveResource(bundle, key);
    expect(text).toBe('@startuml\n@enduml');
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub.mock.calls[0]?.[0]).toBe(url);
  });
});
