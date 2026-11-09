/**
 * aar-T6b: `<<icon>>` boxes, `- label [[url]]` list items, `!option debug true`, image-only edge labels.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBoxEmoji.java:62-176
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandActivityList.java:61-112
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBox.java:201-206
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/SlotFinder.java:84-109
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';

const assetStore = buildEmojiAssetsStore();
const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer(), { assetStore });

describe('CommandActivityList url', () => {
  it('dejuko-37: `- link [[url]]` is the box "link" inside an <a>, not the label "link [[url]]"', () => {
    const svg = render('@startuml\n- link [[https://plantuml.com/1]]\n@enduml');
    expect(svg).toMatch(/<a [^>]*href="https:\/\/plantuml\.com\/1"[^>]*><rect [^>]*width="38\.075"/);
    expect(svg).toContain('textLength="18.075">link</text>');
  });
});

describe('FtileBoxEmoji', () => {
  it('dejuko-37: `- <:link:><<icon>>[[url]]` draws no outline rect, only the emoji paths and a space', () => {
    const svg = render('@startuml\n- <:link:><<icon>>[[https://plantuml.com/2]]\n@enduml');
    expect(svg).not.toMatch(/<rect [^>]*rx="12\.5"/);
    expect(svg).toMatch(/<a [^>]*href="https:\/\/plantuml\.com\/2"[^>]*><path /);
  });

  it('jexavu-72: the `<:tada:*1>` row is 18px tall beside a 30pt name, its arrow ending 7.167 below the top', () => {
    const svg = render('@startuml\nstart\n:bug;\n:<:tada:*1> <size:30>Where to put the txt? ; <<icon>>\n@enduml');
    expect(svg).toMatch(/<line x1="[\d.]+" y1="87" x2="[\d.]+" y2="108\.167"/);
  });
});

describe('!option debug true', () => {
  it('povupi-07: every box gets a 2px blue unfilled rectangle first', () => {
    const svg = render('@startuml\n!option debug true\n:b;\n@enduml');
    expect(svg).toMatch(/<rect [^>]*height="32" fill="none"[^>]*stroke(?:="#00F"|:#00F)/);
  });

  it('without the option no debug rectangle is drawn', () => {
    expect(render('@startuml\n:b;\n@enduml')).not.toContain('#00F');
  });
});

describe('image-only if-label under compression', () => {
  it('pedulu-06: the `is (<latex>)` label image keeps the diamond bottom as its y', () => {
    const svg = render(
      '@startuml\nskinparam monochrome true\nstart\nwhile (<latex>j \\leq j_{\\max}</latex>) is (<latex>\\textrm{true}</latex>)\n:test;\nendwhile (<latex>\\textrm{false}</latex>)\nend\n@enduml',
    );
    expect(svg).toMatch(/<image width="44" height="21" x="117\.5" y="81"/);
    expect(svg).toMatch(/<rect [^>]*y="124" width="39\.275"/);
  });
});
