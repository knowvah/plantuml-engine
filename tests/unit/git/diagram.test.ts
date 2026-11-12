import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseGit } from '../../../src/diagrams/git/GitDiagramFactory.js';
import { renderGit } from '../../../src/diagrams/git/git-export.js';
import { stringBounderOf } from '../bpm/helpers/string-bounder.js';

const measurer = new DeterministicMeasurer();

/** The `UmlSource` of `@startgit` … `@endgit` around `lines`, with no preprocessing artifact. */
function sourceOf(lines: readonly string[]): UmlSource {
  return { type: 'git', lines } as unknown as UmlSource;
}

/** juzane-95-fose365's body. */
const JUZANE = [
  '* a0f65180 (origin/cds/issue700) Layered: Clarified code. #700',
  '* 23a9f435 Layered: Fix wrong hierarchy handling. #700',
  '| * 9037d534 (HEAD -> master, origin/master) Build: Properly sign Maven artifacts. #722',
  '|/  ',
  '* 91fc1c7b Build: Mount Jenkins home. #722',
  '* 4fe6df1e Build: Add HOME env var to maven container. #722',
];

/** Every element's tag and its non-geometric attributes, in document order. */
function shape(body: string): string[] {
  const GEOMETRY = /\s(?:x|y|width|height|d|textLength|points)="[^"]*"/g;
  return [...body.matchAll(/<(rect|text|path|polygon)\b([^>]*)>([^<]*)/g)].map(
    ([, tag, attrs, text]) => `${tag}${attrs!.replace(GEOMETRY, '')}|${text}`,
  );
}

describe('GitDiagramFactory (GitDiagramFactory.java:55-70)', () => {
  it('adds every line between the tags, never the end tag: an empty body has no node and a 0x0 block', () => {
    const diagram = parseGit(sourceOf([]));
    expect(diagram.getDescription()).toBe('(Git)');
    const dim = diagram.getTextBlock().calculateDimension(stringBounderOf(measurer));
    expect([dim.getWidth(), dim.getHeight()]).toEqual([0, 0]);
  });
});

describe('GitDiagram export (gip T2b)', () => {
  it('draws juzane-95 as the jar: 5 boxes with their texts, then 4 curve + arrow pairs', () => {
    const { body, diagramType, background } = renderGit(parseGit(sourceOf(JUZANE)), measurer);
    expect(diagramType).toBe('GIT');
    expect(background).toBe('#FFFFFF');
    const rect = 'rect fill="none" style="stroke:#181818;stroke-width:1.5;" rx="4" ry="4"/|';
    const name = (t: string) => `text fill="#000" font-size="15" font-weight="700" font-family="monospace"|${t}`;
    const comment = (t: string) => `text fill="#000" font-size="13"|${t}`;
    const curve = 'path style="stroke:#181818;stroke-width:1;stroke-dasharray:2,2;" fill="none"/|';
    const arrow = 'path fill="#181818"/|';
    expect(shape(body)).toEqual([
      rect,
      comment('origin/cds/issue700'),
      name('a0f65180'),
      rect,
      name('23a9f435'),
      rect,
      comment('HEAD -> master, origin/master'),
      name('9037d534'),
      rect,
      name('91fc1c7b'),
      rect,
      name('4fe6df1e'),
      ...Array.from({ length: 4 }, () => [curve, arrow]).flat(),
    ]);
  });

  it('ignores <style> and skinparam lines: cov-style draws like cov-preproc-var (gip D4)', () => {
    const plain = renderGit(parseGit(sourceOf(['* a1 msg', '* r0 root'])), measurer).body;
    const styled = renderGit(
      parseGit(
        sourceOf([
          '<style>',
          'gitDiagram { LineColor red }',
          '</style>',
          'skinparam linecolor blue',
          '* a1 msg',
          '* r0 root',
        ]),
      ),
      measurer,
    ).body;
    expect(styled).toBe(plain);
  });
});
