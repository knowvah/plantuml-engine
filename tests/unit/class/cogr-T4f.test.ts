/**
 * cogr T4f: two `{{ }}` bodies opened on a `label x [{{` line, each with its own `skinparam` and `<style>`.
 * Oracle: `test-results/dot-cache/class/moxeku-98-gufi234/in.svg`: the first embed is 75x217 (a stickman: the
 * `<style>` applies, `actorStyle` is the default), the second 77x218 (`skinparam actorStyle awesome`).
 *
 * Two mechanisms, each with its own case below:
 *  - the preprocessor collector hoisted the embed's `skinparam` / `<style>` lines to the outer diagram because
 *    only a line starting `{{` opened an embed, not an opener whose `DESC` tail is one
 *    (`CommandCreateElementMultilines.java:200-202`);
 *  - the nested render registered its own diagram's renderer, so the NEXT embed of the enclosing diagram
 *    inherited the first embed's skinparams (`EmbeddedDiagram.java:88-90` keeps the enclosing `skinParam`).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
const moxeku = readFileSync('test-results/dot-cache/class/moxeku-98-gufi234/in.puml', 'utf8');

function imageBoxes(svg: string): string[] {
  return [...svg.matchAll(/<image width="(\d+)" height="(\d+)"/g)].map((m) => `${m[1]}x${m[2]}`);
}

describe('{{ }} opened on a label line (cogr T4f)', () => {
  it('keeps the embed skinparam and style out of the outer diagram', () => {
    const block = buildBlockUmls(
      '@startuml\nlabel b [{{\nskinparam actorStyle awesome\n<style>\nactor {\n}\n</style>\nactor a\n}}]\n@enduml',
    )[0];
    if (block === undefined || !block.ok) throw new Error('block did not preprocess');
    expect([...block.preprocessed.skinparam.keys()]).toEqual([]);
    expect(block.preprocessed.lines).toContain('skinparam actorStyle awesome');
  });

  it('sizes each embed from its own styles', () => {
    expect(imageBoxes(renderSync(moxeku, { measurer }))).toEqual(['75x217', '77x218']);
  });

  it('does not hand the first embed skinparam to the second', () => {
    const source =
      '@startuml\nlabel b [{{\nskinparam actorStyle awesome\nactor a\n}}]\nlabel a [{{\nactor a\n}}]\n@enduml';
    const [first, second] = imageBoxes(renderSync(source, { measurer }));
    const alone = imageBoxes(renderSync('@startuml\nlabel a [{{\nactor a\n}}]\n@enduml', { measurer }))[0];
    expect(second).toBe(alone);
    expect(first).not.toBe(second);
  });
});
