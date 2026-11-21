/**
 * StyleSignatureBasic#withTOBECHANGED after c9d62097ff5: every label of an element's stereotype
 * folds into ONE signature requiring all of them (`StyleQuery#withStereotype(Stereotype)`,
 * StyleQuery.java:93-105), so the json highlight signature (`TextBlockJson.java:141-146`) and
 * every other caller resolve a multi-label element by `Specificity` instead of first-label-wins.
 * The precedence cases are upstream's StyleSignatureStereotypeFanOutTest.java:75-116.
 */
import { describe, expect, it } from 'vitest';
import { Stereotype } from '../../../../src/core/stereo/Stereotype.js';
import { AutomaticCounterBasic } from '../../../../src/core/style/AutomaticCounterBasic.js';
import { parseStyles } from '../../../../src/core/style/parser/StyleParser.js';
import { StyleBuilder } from '../../../../src/core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../../../src/core/style/StyleSignatureBasic.js';

const HIGHLIGHT = StyleSignatureBasic.of('root', 'element', 'jsonDiagram', 'node', 'highlight');

/** `StyleLoader.parseStyleText(text, new AutomaticCounterBasic())` muted into an empty builder. */
function builderFrom(skin: string): StyleBuilder {
  return new StyleBuilder().muteStyle(parseStyles(skin, new AutomaticCounterBasic()));
}

function background(builder: StyleBuilder, stereotype: string): string | null | undefined {
  const query = StyleSignatureBasic.of('root').withTOBECHANGED(Stereotype.build(stereotype));
  return query.getMergedStyle(builder)?.value('BackGroundColor').asString();
}

describe('withTOBECHANGED on the json highlight signature', () => {
  it('no stereotype: the signature itself (StyleQuery.java:94-95)', () => {
    expect(HIGHLIGHT.withTOBECHANGED(undefined)).toBe(HIGHLIGHT);
  });

  it('one label: the signature plus the cleaned label', () => {
    expect(HIGHLIGHT.withTOBECHANGED(Stereotype.build('<<warn>>')).toString()).toBe(
      '[element, highlight, jsonDiagram, node, root]  [warn]',
    );
  });

  it('two labels: ONE signature requiring both', () => {
    expect(HIGHLIGHT.withTOBECHANGED(Stereotype.build('<<a>><<B_b>>')).toString()).toBe(
      '[element, highlight, jsonDiagram, node, root]  [a, bb]',
    );
  });
});

describe('a multi-label element resolves by Specificity (StyleSignatureStereotypeFanOutTest)', () => {
  it('two one-stereotype rules: the later declaration wins whatever the label order', () => {
    const builder = builderFrom('.foo {\n  BackGroundColor red\n}\n.bar {\n  BackGroundColor blue\n}\n');
    expect(background(builder, '<<foo>><<bar>>')).toBe('blue');
    expect(background(builder, '<<bar>><<foo>>')).toBe('blue');
  });

  it('a rule requiring both stereotypes wins over either single one, declared first or last', () => {
    const last = builderFrom(
      '.foo {\n  BackGroundColor red\n}\n.bar {\n  BackGroundColor blue\n}\n' +
        '.foo {\n  .bar {\n    BackGroundColor green\n  }\n}\n',
    );
    expect(background(last, '<<foo>><<bar>>')).toBe('green');
    expect(background(last, '<<bar>><<foo>>')).toBe('green');
    const first = builderFrom(
      '.foo {\n  .bar {\n    BackGroundColor green\n  }\n}\n' +
        '.foo {\n  BackGroundColor red\n}\n.bar {\n  BackGroundColor blue\n}\n',
    );
    expect(background(first, '<<foo>><<bar>>')).toBe('green');
    expect(background(first, '<<foo>>')).toBe('red');
  });
});
