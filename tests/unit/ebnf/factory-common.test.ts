/**
 * The EBNF factory's copied halves — `CommonCommands.addCommonCommands1`, the style dispatch, the
 * `ProtectedCommand` wrapper — and the engine's `SkinParam`, as nwdiag's and files' tests cover the same copies.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/ProtectedCommand.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { OptionKey } from '../../../src/core/tim/EaterOption.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { PSystemEbnf } from '../../../src/diagrams/ebnf/PSystemEbnf.js';
import { parseEbnf } from '../../../src/diagrams/ebnf/PSystemEbnfFactory.js';
import { body, BOUNDER, ebnfSkinParam, newGraphic } from './helpers.js';

// `'ebnf'` joins `block-extractor.ts#DiagramType` at T4a.
const sourceOf = (lines: readonly string[], extra: Partial<UmlSource> = {}): UmlSource =>
  ({ type: 'ebnf', lines, ...extra }) as unknown as UmlSource;

function parse(...lines: string[]): PSystemEbnf | ParseRefusal {
  return parseEbnf(sourceOf(lines), new PreprocessingArtifact());
}

function diagram(...lines: string[]): PSystemEbnf {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${result.line}: ${result.message}`);
  return result;
}

function refusal(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

describe('PSystemEbnfFactory common commands', () => {
  it.each([
    'hide empty description',
    'show private,protected fields',
    'hide stereotypes',
    'set separator ::',
    'set separator none',
    '!assume transparent dark',
    'minwidth 10',
    'rotate',
    'page 2x2',
    '!pragma svgsize 10',
    '!pragma layout smetana',
    '!pragma layout elk',
    '',
  ])('accepts %j', (line) => {
    expect(diagram(line, 'a = "b";').getExpressions()).toHaveLength(1);
  });

  it.each(['hide ſtereotypes', 'ſet separator ::', 'hide everything else'])('refuses %j where Java does', (line) => {
    expect(refusal(line).kind).toBe('syntax');
  });

  it('page 0x1 and the renamed graphviz_dot pragma error; an int overflow is a ProtectedCommand error', () => {
    expect(refusal('page 0x1').message).toBe('Argument must be positive');
    expect(refusal('!pragma graphviz_dot jdot').message).toBe(
      "This directive has been renamed to '!pragma layout smetana'. Please update your diagram.",
    );
    expect(refusal('!pragma graphviz_dot smetana').message).toBe(
      "This directive has been renamed to '!pragma layout smetana'. Please update your diagram.",
    );
    const r = refusal('minwidth 2147483648');
    expect([r.kind, r.line]).toEqual(['execution', 0]);
    expect(r.message).toMatch(/^You should send a mail to plantuml@gmail\.com .* NumberFormatException/);
  });

  it('an unterminated string is a ProtectedCommand error, not a crash (cov-unterminated)', () => {
    const r = refusal('broken = "abc;');
    expect(r.kind).toBe('execution');
    expect(r.message).toMatch(/^You should send a mail to plantuml@gmail\.com .* IllegalStateException$/);
  });

  it('reads a sprite, a legend, a multi-line comment and a documentation comment', () => {
    const d = diagram(
      'sprite $s {',
      'FF',
      'end sprite',
      'legend',
      'body',
      'end legend',
      '(* a',
      'b *)',
      '(** c',
      'd **)',
    );
    expect(d.getSkinParam().getSprite('s')).not.toBeNull();
    expect(d.getExpressions()).toHaveLength(2);
    expect(d.sprites).toBe(d.getSkinParam().getSprites());
  });

  it('refusals name the document line through linePositions; @startebnf lines are skipped', () => {
    const result = parseEbnf(sourceOf(['@startebnf', 'x y z'], { linePositions: [0, 7] }), new PreprocessingArtifact());
    expect('refused' in result && result.line).toBe(7);
  });

  it('a style syntax error refuses with its message', () => {
    const r = parseEbnf(
      sourceOf(['a = "b";'], { styleSource: { skinparam: new Map(), styles: ['node { { }'] } }),
      new PreprocessingArtifact(),
    );
    expect(r).toMatchObject({ refused: true, kind: 'execution', line: 0 });
    expect('refused' in r && r.message.startsWith('Error in style definition: ')).toBe(true);
  });

  it('adds the skinparam deprecation warnings and reads handwritten from skinparam or !option', () => {
    const d = parseEbnf(
      sourceOf(['a = "b";'], { styleSource: { skinparam: new Map([['Padding', '2']]), styles: [] } }),
      new PreprocessingArtifact(),
    ) as PSystemEbnf;
    expect(d.getWarnings()).toHaveLength(1);
    expect(d.isHandwritten()).toBe(false);
    const hand = parseEbnf(
      sourceOf(['a = "b";'], { styleSource: { skinparam: new Map([['handwritten', 'true']]), styles: [] } }),
      new PreprocessingArtifact(),
    ) as PSystemEbnf;
    expect(hand.isHandwritten()).toBe(true);
    const artifact = new PreprocessingArtifact();
    artifact.getOption().define(OptionKey.HANDWRITTEN, 'true');
    expect((parseEbnf(sourceOf(['a = "b";']), artifact) as PSystemEbnf).isHandwritten()).toBe(true);
  });
});

describe('PSystemEbnf#getTextBlock (PSystemEbnf.java:96-112)', () => {
  it('stacks rules and notes left-aligned, a note with 5 above and 15 below', () => {
    const d = diagram('(* hi *)', 'a = "b";', 'c = "d";');
    const block = d.getTextBlock();
    // note 23 + 5 + 15; each rule: title 14 + 10 + railroad 24 + 15.
    expect(block.calculateDimension(BOUNDER).getHeight()).toBe(23 + 20 + 2 * (14 + 10 + 24 + 15));
    const ug = newGraphic();
    block.drawU(ug);
    expect(body(ug).match(/font-weight="700"/g)).toHaveLength(2);
  });
});

describe('the EBNF SkinParam (a copy of files-skin-param.ts)', () => {
  const skin = (skinparam: Record<string, string>) => ebnfSkinParam(skinparam);

  it('getDefaultTextAlignment answers the skinparam, else the default (SkinParam.java:731-738)', () => {
    expect(skin({}).getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(HorizontalAlignment.LEFT);
    expect(skin({ defaultTextAlignment: 'center' }).getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(
      HorizontalAlignment.CENTER,
    );
  });

  it('useUnderlineForHyperlink, getPadding, getDpi, getTabSize, getMonospacedFamily, getlengthAdjust', () => {
    expect(skin({}).useUnderlineForHyperlink().getThickness()).toBe(1);
    expect([skin({}).getPadding().getLeft(), skin({ padding: '3' }).getPadding().getLeft()]).toEqual([0, 3]);
    expect([skin({}).getDpi(), skin({}).getTabSize(), skin({}).getMonospacedFamily()]).toEqual([96, 8, 'monospaced']);
    expect([skin({ dpi: '300' }).getDpi(), skin({ dpi: '0' }).getDpi(), skin({ tabSize: '4' }).getTabSize()]).toEqual([
      300, 96, 4,
    ]);
    expect(skin({ defaultMonospacedFontName: 'Courier' }).getMonospacedFamily()).toBe('Courier');
    expect([skin({}).getlengthAdjust(), skin({ lengthAdjust: 'none' }).getlengthAdjust()]).toEqual([undefined, 'none']);
  });

  it('values/copyAllFrom hold the cleaned keys; md5, size hack, sprites and guillemets', () => {
    const param = skin({ Shadowing: ' true ' });
    expect(param.getValue('shadowing')).toBe('true');
    param.copyAllFrom(new Map([['other', 'x']]));
    expect(param.values().get('other')).toBe('x');
    expect(param.getValue('absent')).toBeNull();
    expect(param.getFromMd5('abc')).toBeNull();
    expect(param.transformStringForSizeHack('s')).toBe('s');
    expect(param.getSprite('nope')).toBeNull();
    expect(param.guillemet()).toEqual({ start: '«', end: '»' });
  });

  it('answers `unported` for the members the EBNF path never reaches', () => {
    const param = skin({});
    expect(() => param.getFontHtmlColor(undefined)).toThrow('unported: SkinParam#getFontHtmlColor');
    expect(() => param.getFont(undefined, false)).toThrow('unported: SkinParam#getFont');
    expect(() => param.getHyperlinkColor()).toThrow('unported: SkinParam#getHyperlinkColor');
    expect(() => param.strictUmlStyle()).toThrow('unported: SkinParam#strictUmlStyle');
  });
});
