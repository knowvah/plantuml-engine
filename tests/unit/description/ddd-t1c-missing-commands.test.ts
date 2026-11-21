/**
 * ddd-T1c: commands the corpus refused. Jar values: dot-cache unknown
 * sifagi-73-kexu776 (Cyrillic title), maxeme-36-rale224 (note url),
 * ceboti-36-tuza211 (archimate bracket body).
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (...lines: string[]): string =>
  renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });

describe('CommandTitle: %pLN admits any letter (CommandTitle.java:66)', () => {
  it('a Cyrillic title draws in the title group', () => {
    const svg = render('title Домашняя', 'usecase a');
    expect(svg).toContain('data-diagram-type="DESCRIPTION"');
    expect(/<g class="title"[^>]*><text[^>]*>Домашняя<\/text>/.exec(svg)).not.toBeNull();
  });
});

describe('CommandFactoryNoteOnEntity: the url slot (:142)', () => {
  it('wraps the note in its link', () => {
    const svg = render('actor toto', 'note left of toto [[http://note]] {', 'x', '}');
    expect(svg).toContain('data-diagram-type="DESCRIPTION"');
    expect(/<a [^>]*href="http:\/\/note"[^>]*><path/.exec(svg)).not.toBeNull();
  });
});

describe('CommandArchimateMultilines', () => {
  const svg = render('archimate #Technology VPN <<technology-device>> [', 'long description', 'on several lines', ']');

  it('draws the body lines, not the code', () => {
    expect(svg).not.toContain('>VPN</text>');
    expect(svg).toContain('>long description</text>');
    expect(svg).toContain('>on several lines</text>');
  });

  // e2659a157bf: getLazzy("COLOR") answers the first COLOR group in match order (RegexResult.java:128-149),
  // the leading one; the HashMap before kept the trailing, empty, leaf (jar a720bdd: ceboti-36 fills #C9FFC9).
  it('paints the leading colour, as the jar does', () => {
    expect(svg).toContain('fill="#C9FFC9"');
    expect(svg).not.toContain('#F1F1F1');
  });

  it('the leading colour also beats the one after the url slot (jar a720bdd: #C9FFC9)', () => {
    expect(render('archimate #Technology VPN #pink [', 'x', ']')).toContain('fill="#C9FFC9"');
  });

  it('honours the colour after the url slot when there is no leading one', () => {
    expect(render('archimate  VPN #pink [', 'x', ']')).toContain('fill="#FFC0CB"');
  });
});
