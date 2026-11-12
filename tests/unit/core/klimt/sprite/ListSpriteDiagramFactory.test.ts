/**
 * `ListSpriteDiagramFactory`: the common commands, then `CommandListSprite`, over `createSystem`'s loop; a line no
 * command claims is `Syntax Error?` on that line.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/ListSpriteDiagramFactory.java:46-68
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isDisplayPositionedNull } from '../../../../../src/core/annotations/index.js';
import { preprocessingArtifactOf } from '../../../../../src/core/command/PSystemBasicFactory.js';
import type { ListSpriteDiagram } from '../../../../../src/core/klimt/sprite/ListSpriteDiagram.js';
import { initCommandsList, parseListSprite } from '../../../../../src/core/klimt/sprite/ListSpriteDiagramFactory.js';
import { SpriteImage } from '../../../../../src/core/klimt/sprite/SpriteImage.js';
import { SpriteMonochrome } from '../../../../../src/core/klimt/sprite/SpriteMonochrome.js';
import type { ParseRefusal } from '../../../../../src/core/parse-refusal.js';
import { sourceOf } from '../../../../helpers/utility-single-line.js';

const PROBES = 'tests/fixtures/factories';

function parseProbe(slug: string): ListSpriteDiagram | ParseRefusal {
  const source = sourceOf(readFileSync(`${PROBES}/${slug}.puml`, 'utf8'));
  return parseListSprite(source, preprocessingArtifactOf(source));
}

function diagramOf(slug: string): ListSpriteDiagram {
  const parsed = parseProbe(slug);
  if ('refused' in parsed) throw new Error(`refused: ${parsed.message}`);
  return parsed;
}

describe('ListSpriteDiagramFactory', () => {
  it('lists the common commands block, then CommandListSprite (java:52-58)', () => {
    expect(initCommandsList().map((c) => c.name)).toEqual(['CommonCommands.addCommonCommands1', 'CommandListSprite']);
  });

  it('cov-sprites-startsprites-mono: the registry holds foo1, a 15x10 monochrome sprite', () => {
    const diagram = diagramOf('cov-sprites-startsprites-mono');
    const sprite = diagram.sprites.byName.get('foo1');
    expect(sprite).toBeInstanceOf(SpriteMonochrome);
    expect([sprite?.width, sprite?.height]).toEqual([15, 10]);
    expect(diagram.getDescription()).toBe('(Sprites)');
    expect(diagram.getDiagramType()).toBe('HELP');
  });

  it('cov-sprites-base64: CommandSpriteBase64 (CommonCommands.java:79) registers a 16x16 SpriteImage', () => {
    const sprite = diagramOf('cov-sprites-base64').sprites.byName.get('b64');
    expect(sprite).toBeInstanceOf(SpriteImage);
  });

  it('cov-sprites-uml-listsprites: `listsprites` is claimed and the sprite kept', () => {
    expect([...diagramOf('cov-sprites-uml-listsprites').sprites.byName.keys()]).toEqual(['foo1']);
  });

  it('cov-sprites-err-garbage: Syntax Error? on `this is not a command`, the jar line 14', () => {
    const refusal = parseProbe('cov-sprites-err-garbage') as ParseRefusal;
    expect([refusal.kind, refusal.line, refusal.message]).toEqual(['syntax', 13, 'Syntax Error?']);
  });

  it('cov-sprites-err-listsprite-arg: `listsprite please` is refused, the jar line 14 (RegexLeaf.end, java:60)', () => {
    const refusal = parseProbe('cov-sprites-err-listsprite-arg') as ParseRefusal;
    expect([refusal.kind, refusal.line, refusal.message]).toEqual(['syntax', 13, 'Syntax Error?']);
  });

  it('cov-sprites-chrome: title, caption, header, footer and legend are set', () => {
    const { annotations } = diagramOf('cov-sprites-chrome');
    const set = ['title', 'caption', 'header', 'footer', 'legend'] as const;
    expect(set.map((k) => isDisplayPositionedNull(annotations[k]))).toEqual([false, false, false, false, false]);
    expect(isDisplayPositionedNull(annotations.mainFrame)).toBe(true);
  });

  it('cov-sprites-scale: `scale` reaches the diagram', () => {
    expect(diagramOf('cov-sprites-scale').scale).toBeDefined();
  });

  it('a hand-built source keeps its own start and end directives out of the dispatch', () => {
    const source = { lines: ['@startsprites', 'listsprite', '@endsprites'], type: 'unknown' } as never;
    expect('refused' in parseListSprite(source, preprocessingArtifactOf(source))).toBe(false);
  });

  it('a failing common command is an execution refusal (CommandPage: Argument must be positive)', () => {
    const source = { lines: ['page 0x1'], type: 'unknown' } as never;
    const refusal = parseListSprite(source, preprocessingArtifactOf(source)) as ParseRefusal;
    expect([refusal.kind, refusal.line, refusal.message]).toEqual(['execution', 0, 'Argument must be positive']);
  });

  it('a common command that throws is ProtectedCommand`s error (minwidth past int)', () => {
    const source = { lines: ['minwidth 99999999999'], type: 'unknown' } as never;
    const refusal = parseListSprite(source, preprocessingArtifactOf(source)) as ParseRefusal;
    expect(refusal.message).toMatch(/^You should send a mail to plantuml@gmail\.com .*NumberFormatException/);
  });
});
