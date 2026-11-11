import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { createSystem, EMPTY_DESCRIPTION, SYNTAX_ERROR } from '../../../src/core/command/PSystemBasicFactory.js';
import type { BasicFactory } from '../../../src/core/command/PSystemBasicFactory.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';

/** A factory recording what it saw; `reject` makes `executeLine` return upstream's `null`. */
interface Seen {
  readonly start: string;
  readonly lines: readonly string[];
}

function recorder(reject?: string): BasicFactory<Seen> {
  return {
    initDiagram: (_source, startLine) => ({ start: startLine, lines: [] }),
    executeLine: (_source, system, line) =>
      line === reject ? undefined : { ...system, lines: [...system.lines, line] },
  };
}

function sourceOf(seed: readonly string[]): UmlSource {
  return { lines: seed.slice(1, -1), type: 'unknown', seedSourceLines: seed };
}

function run(seed: readonly string[], reject?: string) {
  return createSystem(recorder(reject), sourceOf(seed), new PreprocessingArtifact());
}

describe('PSystemBasicFactory#createSystem', () => {
  it('answers Empty description for a bare @startcreole (cov-creole-empty: the Welcome page)', () => {
    expect(run(['@startcreole', '@endcreole'])).toEqual({
      refused: true,
      kind: 'syntax',
      line: 1,
      consumed: 1,
      message: EMPTY_DESCRIPTION,
      commandScore: 0,
    });
  });

  it('counts lines after removeInitialNoise: blank and skinparam lines are dropped first', () => {
    const r = run(['@startmath', '', 'skinparam x y', '@endmath']);
    expect(r).toMatchObject({ refused: true, message: EMPTY_DESCRIPTION, line: 3 });
  });

  it('builds the diagram for an empty @startdef (cov-def-empty: isStartDef)', () => {
    expect(run(['@startdef(id=e)', '@enddef'])).toEqual({ start: '@startdef(id=e)', lines: [] });
  });

  it('skips whitespace-only lines directly after the start line, but not later ones', () => {
    expect(run(['@startcreole', '  ', '\t', 'hello', '', 'world', '@endcreole'])).toEqual({
      start: '@startcreole',
      lines: ['hello', '', 'world'],
    });
  });

  it('passes lines untrimmed (s.getString())', () => {
    expect(run(['@startcreole', '  a  ', '@endcreole'])).toEqual({ start: '@startcreole', lines: ['  a  '] });
  });

  it('a whitespace-only body is not empty: getTotalLineCount is 3', () => {
    expect(run(['@startcreole', '   ', '@endcreole'])).toEqual({ start: '@startcreole', lines: [] });
  });

  it('turns a null executeLine into Syntax Error? on that line', () => {
    expect(run(['@startcreole', 'ok', 'bad', 'never', '@endcreole'], 'bad')).toEqual({
      refused: true,
      kind: 'syntax',
      line: 2,
      consumed: 2,
      message: SYNTAX_ERROR,
      commandScore: 0,
    });
  });

  it('stops at the first end directive and returns the diagram with no @end line at all', () => {
    expect(run(['@startcreole', 'a', '@endcreole', 'b'])).toEqual({ start: '@startcreole', lines: ['a'] });
    expect(run(['@startcreole', 'x', 'y'])).toEqual({ start: '@startcreole', lines: ['x', 'y'] });
  });

  it('frames a hand-built source with its own tag when seedSourceLines is absent', () => {
    const src: UmlSource = { lines: [], type: 'dot' };
    expect(createSystem(recorder(), src, new PreprocessingArtifact())).toMatchObject({
      refused: true,
      message: EMPTY_DESCRIPTION,
    });
  });

  it('maps a refusal line through linePositions to the document line', () => {
    const src: UmlSource = {
      lines: ['a', 'bad'],
      linePositions: [4, 5],
      type: 'unknown',
      seedSourceLines: ['@startcreole', 'a', 'bad', '@endcreole'],
    };
    expect(createSystem(recorder('bad'), src, new PreprocessingArtifact())).toMatchObject({ line: 5, consumed: 2 });
  });
});
