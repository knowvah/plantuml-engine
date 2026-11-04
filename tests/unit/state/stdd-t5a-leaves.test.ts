import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T5a, against the jar's `in.svg`:
 * - `hide <<x>>` / `hide X` (`CommandHideShow2`, `CucaDiagram#hideOrShow2`): the entity stays in the
 *   layout and keeps its uid (`GraphvizImageBuilder` skips only `isRemoved`), and `SvekResult.java:85,98`
 *   draw it and every link touching it (`Link.java:458-460`) through `UHidden`, which drops every shape
 *   but the `UComment` (`AbstractUGraphic.java:128-141`).
 * - a `|= header |` table in a note: the real creole grid (`StripeTable`), as a state body already draws.
 * - `json Name { }` in a state diagram: `EntityImageJson#drawU` (`EntityImageJson.java:153-213`) and
 *   `TextBlockCucaJSon` (`TextBlockCucaJSon.java:163-224`): the rounded box (`objectDiagram { element
 *   { RoundCorner 5 } }`, `plantuml.skin:204-210`), the centred name, the key/value grid.
 * - `skin debug`: a skin sheet is the base style for the chrome too (`TitledDiagram.java:161`), and the
 *   state box reads `RoundCorner` over `{root, element, stateDiagram, state}` (`Style#value`).
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function diffs(slug: string): unknown[] {
  return compareSvg(render(slug), readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8'), 'deterministic').diffs;
}

describe('stdd T5a: hidden entities, skins, json leaves, table notes', () => {
  it('kocago-20: a `hide <<hidden>>` entity keeps its uid and draws nothing; its links keep only the comment', () => {
    const svg = render('kocago-20-nari612');
    expect(svg).not.toContain('id="ent0002"');
    expect(svg).toContain('<!--link manager to model-->');
    expect(svg).not.toMatch(/<g class="link" data-entity-1="ent0001" data-entity-2="ent0002"/);
    expect(diffs('kocago-20-nari612')).toEqual([]);
    expect(diffs('sagica-63-godi019')).toEqual([]);
  });

  it('fatupo-62: a `|= header |` table in a note is drawn as a grid', () => {
    const svg = render('fatupo-62-bemu777');
    expect(svg).toMatch(/<text x="159.864" y="23.111" [^>]*font-weight="700"[^>]*>header 2<\/text>/);
    expect(diffs('fatupo-62-bemu777')).toEqual([]);
  });

  it('maruju-55: a json leaf draws its name and key/value grid', () => {
    const svg = render('maruju-55-soko478');
    expect(svg).toContain(
      '<rect x="221" y="38.5" width="74.425" height="36" fill="#F1F1F1" stroke="#181818" stroke-width="0.5" rx="2.5" ry="2.5"/>',
    );
    expect(svg).toContain('<line x1="258.212" y1="56.5" x2="258.212" y2="74.5" stroke="#181818" stroke-width="1"/>');
    expect(diffs('maruju-55-soko478')).toEqual([]);
  });

  it('sumiri-68 / niveno-60: `skin debug` reaches the title chrome and the state box corners', () => {
    const svg = render('sumiri-68-suvo696');
    expect(svg).toMatch(/<g class="title"[^>]*><rect [^>]*stroke="#3600A8" stroke-width="4" rx="7.5" ry="7.5"/);
    expect(diffs('sumiri-68-suvo696')).toEqual([]);
    expect(diffs('niveno-60-tiro789')).toEqual([]);
  });
});
