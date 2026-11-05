/**
 * The jar's `BlockUml#data` holds the compiled form of a stdlib sprite, because
 * its `.spm` channels were compiled from the stdlib source at build time. The
 * expected strings are the jar's own `-preproc` output
 * (`plans/c4-divergence-drive/measurements/stdlib-probes.mjs`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildBlockUmls } from '../../../../src/core/BlockUmlBuilder.js';
import { preprocess } from '../../../../src/core/preprocessor.js';
import { MapIncludeStore } from '../../../../src/core/tim/IncludeStore.js';
import { withStdlib } from '../../../../src/core/tim/StdlibStore.js';
import { compileStdlibSpriteLine, stdlibSpriteLineShapes } from '../../../../src/core/tim/stdlib-sprite-compile.js';
import { fixtureIncludeStore } from '../../../helpers/fixture-include-store.js';

const FIXTURE_DIR = 'tests/fixtures/c4dd-T1a';

/** A store serving `resources` through the `<bundle/thing>` seam only. */
function stdlibOf(resources: Readonly<Record<string, string>>) {
  return withStdlib(new MapIncludeStore(), { getPumlResource: (fullname) => resources[fullname] });
}

function preprocessed(lines: readonly string[], resources: Readonly<Record<string, string>>) {
  return preprocess(lines.join('\n'), undefined, { includeStore: stdlibOf(resources) });
}

describe('stdlibSpriteLineShapes — the raw-line rule', () => {
  it('folds a bitmap block, head through its closing brace', () => {
    expect(stdlibSpriteLineShapes(['before', 'sprite $x [2x2/16] {', '00', '00', '}', 'after'])).toEqual([
      undefined,
      'bitmap',
      'continuation',
      'continuation',
      'continuation',
      undefined,
    ]);
  });

  it('folds a compressed bitmap block the same way', () => {
    expect(stdlibSpriteLineShapes(['sprite $x [64x64/16z] {', 'xPD7', '}'])).toEqual([
      'bitmap',
      'continuation',
      'continuation',
    ]);
  });

  it('folds an svg block, head through its </svg>', () => {
    expect(stdlibSpriteLineShapes(['sprite x <svg width="1">', '<path/>', '</svg>', 'after'])).toEqual([
      'svg',
      'continuation',
      'continuation',
      undefined,
    ]);
  });

  it('takes a one-line svg sprite as a head with no continuation', () => {
    expect(stdlibSpriteLineShapes(['sprite x <svg width="1"></svg>', 'after'])).toEqual(['svg', undefined]);
  });

  it('leaves a one-line compressed sprite verbatim (eip, ibm)', () => {
    expect(stdlibSpriteLineShapes(['sprite $x [64x64/16z] Ow0VuC'])).toEqual([undefined]);
  });

  it('leaves a line a function builds verbatim (awslib20 !$header)', () => {
    expect(stdlibSpriteLineShapes(['!$header = "sprite Callout_" + $n + " <svg width=18>"'])).toEqual([undefined]);
  });
});

describe('compileStdlibSpriteLine — the name comes from the emitted line', () => {
  it('writes a bitmap sprite as #lib#path:name, dropping the $ from the name', () => {
    expect(compileStdlibSpriteLine('sprite $ma_x [48x48/16] {', 'bitmap', 'material2.1.19', 'x')).toBe(
      'sprite $ma_x #material2.1.19#x:ma_x',
    );
  });

  it('writes an svg sprite as :lib:path:name', () => {
    expect(compileStdlibSpriteLine('sprite mdiX <svg width="48">', 'svg', 'material7.4.47', 'a/b')).toBe(
      'sprite mdiX :material7.4.47:a/b:mdiX',
    );
  });

  it('reads a substituted procedure name off the emitted line, as edgy2 reaches the jar', () => {
    expect(compileStdlibSpriteLine('sprite $bActivityIcon <svg viewBox="0 0 160 26">', 'svg', 'edgy', 'edgy2')).toBe(
      'sprite $bActivityIcon :edgy:edgy2:bActivityIcon',
    );
  });
});

describe('dataLines — every stdlib read folds, and lines keeps the verbatim block', () => {
  const BLOCK = ['sprite $s [2x1/16] {', '00', '}'];
  const FOLDED = 'sprite $s #lib#sub/file:s';

  it('folds an !include, lower-casing the path and dropping .puml', () => {
    const r = preprocessed(['@startuml', '!include <Lib/Sub/File.puml>', '@enduml'], {
      'Lib/Sub/File.puml': BLOCK.join('\n'),
    });
    expect(r.dataLines).toEqual(['@startuml', FOLDED, '@enduml']);
    expect(r.lines).toEqual(['@startuml', ...BLOCK, '@enduml']);
  });

  it('names the bundle a link: alias lands on (Stdlib.java#retrieve)', () => {
    const r = preprocessed(['@startuml', '!include <material/a>', '@enduml'], { 'material/a': BLOCK.join('\n') });
    expect(r.dataLines).toEqual(['@startuml', 'sprite $s #material2.1.19#a:s', '@enduml']);
  });

  it('folds an !includesub', () => {
    const r = preprocessed(['@startuml', '!includesub <lib/sub/file>!PART', '@enduml'], {
      'lib/sub/file': ['!startsub PART', ...BLOCK, '!endsub'].join('\n'),
    });
    expect(r.dataLines).toEqual(['@startuml', FOLDED, '@enduml']);
  });

  it('folds an !includedef', () => {
    const r = preprocessed(['@startuml', '!includedef <lib/sub/file>', '@enduml'], {
      'lib/sub/file': BLOCK.join('\n'),
    });
    expect(r.dataLines).toEqual(['@startuml', FOLDED, '@enduml']);
  });

  it('folds a !theme read from a stdlib location, under the theme file name', () => {
    const r = preprocessed(['@startuml', '!theme t from <lib>', '@enduml'], {
      'lib/puml-theme-t.puml': BLOCK.join('\n'),
    });
    expect(r.dataLines).toEqual(['@startuml', 'sprite $s #lib#puml-theme-t:s', '@enduml']);
  });

  it('folds each emission of a sprite a stdlib procedure draws', () => {
    const procedure = [
      '!procedure $p($n)',
      'sprite $b##$n <svg viewBox="0 0 1 1">',
      '<path/>',
      '</svg>',
      '!endprocedure',
    ];
    const r = preprocessed(['@startuml', '!include <lib/f>', '$p(A)', '$p(B)', '@enduml'], {
      'lib/f': procedure.join('\n'),
    });
    expect(r.dataLines).toEqual(['@startuml', 'sprite $bA :lib:f:bA', 'sprite $bB :lib:f:bB', '@enduml']);
  });

  it('never folds a sprite the document itself defines', () => {
    const r = preprocessed(['@startuml', ...BLOCK, '@enduml'], {});
    expect(r.dataLines).toEqual(['@startuml', ...BLOCK, '@enduml']);
  });

  it('never folds a local !include, even of the same text', () => {
    const r = preprocess(['@startuml', '!include f.puml', '@enduml'].join('\n'), undefined, {
      includeStore: new MapIncludeStore({ 'f.puml': BLOCK.join('\n') }),
    });
    expect(r.dataLines).toEqual(['@startuml', ...BLOCK, '@enduml']);
  });
});

describe('seedSource against the jar', () => {
  it('equals the jar -preproc of a two-sprite stdlib fixture', () => {
    const source = readFileSync(join(FIXTURE_DIR, 'two-sprites.puml'), 'utf8');
    const block = buildBlockUmls(source, { includeStore: fixtureIncludeStore() })[0];
    if (block === undefined || !block.ok) throw new Error('no block');
    const jar = readFileSync(join(FIXTURE_DIR, 'two-sprites.preproc'), 'utf8').replace(/\n$/, '').split('\n');
    expect(block.seedSource).toEqual(jar);
  });
});
