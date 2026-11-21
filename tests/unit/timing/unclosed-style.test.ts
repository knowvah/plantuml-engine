/**
 * An unclosed `<style>` block in a timing diagram (upstream 96380842043): the
 * opening line stays in the body and no timing command accepts it, so the
 * engine's loop refuses it with `PSystemCommandFactory#getSyntaxErrorMessage`'s
 * wording (PSystemCommandFactory.java:249-259). Expectations are the a720bdd
 * jar's error page for this source (`scripts/oracle-render.sh`).
 */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { UNCLOSED_STYLE_MESSAGE } from '../../../src/core/parse-refusal.js';
import { renderSync } from '../../../src/index.js';

const SOURCE = [
  '@startuml',
  'robust "Web" as WB',
  '<style>',
  'timingDiagram {',
  '  LineColor red',
  '}',
  '@0',
  'WB is Idle',
  '@enduml',
];

describe('timing: unclosed <style> refusal', () => {
  it('words the refusal as the jar does, on the <style> line', () => {
    const svg = renderSync(SOURCE.join('\n'), { measurer: new DeterministicMeasurer() });
    const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => (m[1] ?? '').replaceAll('&lt;', '<'));
    expect(texts.find((t) => t.startsWith('[From'))).toBe('[From string (line 3) ]');
    expect(texts.at(-1)).toBe(`${UNCLOSED_STYLE_MESSAGE} (Assumed diagram type: timing)`);
  });
});
