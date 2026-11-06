/**
 * Graphviz messages from `@knowvah/dot-engine` stay off the host's console, as the jar's merged `dot` stream keeps them
 * out of a rendered diagram (`src/core/dot-engine-messages.ts`; docs/graphviz-issues/42-console-warn-with-no-sink.md).
 */
import { readFileSync } from 'node:fs';

import { agseterrf, parse, render, renderSvg, type AgUserErrF } from '@knowvah/dot-engine';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { withEngineMessagesCollected, withEngineMessagesDropped } from '../../../src/core/dot-engine-messages.js';
import { renderSync } from '../../../src/index.js';

const FIXTURE = 'test-results/dot-cache/state/bemena-23-zebu249';
const TITLED_CLUSTER_WARNING = 'Warning: table size too small for content\nin label of graph cluster6\n';
/** Authored `@startdot` with an unknown shape, and the jar's output for it (`scripts/oracle-render.sh`). */
const UNKNOWN_SHAPE = 'tests/fixtures/dot-engine-messages/unknown-shape';

/** Every message the engine sends to `sink` while `call` runs. */
function messagesOf(call: () => unknown): string {
  const pieces: string[] = [];
  const previous = agseterrf((message) => {
    pieces.push(message);
  });
  try {
    call();
  } finally {
    agseterrf(previous);
  }
  return pieces.join('');
}

describe('engine messages', () => {
  let warn: MockInstance<typeof console.warn>;
  let error: MockInstance<typeof console.error>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    agseterrf(null);
  });

  it('the engine warns on the jar DOT of a titled cluster', () => {
    const dot = readFileSync(`${FIXTURE}/svek-2.dot`, 'utf8');
    expect(messagesOf(() => render(parse(dot), 'svg'))).toBe(TITLED_CLUSTER_WARNING);
  });

  it('a titled state cluster renders without the warning, on the console or in the SVG', () => {
    const svg = renderSync(readFileSync(`${FIXTURE}/in.puml`, 'utf8'));
    expect(svg).toContain('>NewValuePreview<');
    expect(svg).not.toContain('Warning');
    expect(warn).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
  });

  it("@startdot puts the warning before the SVG, as the jar's merged dot stream does", () => {
    const jar = readFileSync(`${UNKNOWN_SHAPE}.svg`, 'utf8');
    const ours = renderSync(readFileSync(`${UNKNOWN_SHAPE}.puml`, 'utf8'));
    const before = (svg: string): string => svg.slice(0, svg.indexOf('<'));
    expect(before(jar)).toBe('Warning: using box for unknown shape nosuchshape\n');
    expect(before(ours)).toBe(before(jar));
    expect(ours).toContain('<title>a</title>');
    expect(warn).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
  });

  it("puts the host's own sink back and sends it nothing from a render", () => {
    const host = vi.fn<AgUserErrF>();
    agseterrf(host);
    renderSync(readFileSync(`${FIXTURE}/in.puml`, 'utf8'));
    expect(agseterrf(null)).toBe(host);
    expect(host).toHaveBeenCalledTimes(0);
  });

  it('restores the previous sink when the call throws', () => {
    const host = vi.fn<AgUserErrF>();
    agseterrf(host);
    expect(() =>
      withEngineMessagesDropped(() => {
        throw new RangeError('engine failed');
      }),
    ).toThrow(RangeError);
    expect(agseterrf(null)).toBe(host);
  });

  it('returns the value of the call', () => {
    expect(withEngineMessagesDropped(() => 42)).toBe(42);
  });

  it('collects the messages of one call and nothing after it', () => {
    const shape = (name: string): string => `digraph {\n  a [shape=${name}]\n}`;
    expect(withEngineMessagesCollected(() => renderSvg(shape('nosuchshape'), 'dot')).messages).toBe(
      'Warning: using box for unknown shape nosuchshape\n',
    );
    expect(withEngineMessagesCollected(() => renderSvg(shape('box'), 'dot')).messages).toBe('');
  });
});
