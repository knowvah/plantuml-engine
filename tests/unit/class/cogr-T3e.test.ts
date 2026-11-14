/**
 * cogr T3e: several stereotypes on a `node`/`rectangle`-style group opener. `CommandPackageWithUSymbol.java:126-129`
 * ends the regex `STEREOTYPE` (lazy `<<.+?>>`, `StereotypePattern.optional`), `TAGS2`, url, COLOR, `\{`: nothing may
 * follow COLOR, so `node foo5 <<A>><<B>> {` widens the lazy group to both labels, and the cluster header draws one
 * `«label»` row each (`ClusterHeader.java:173-220`). Oracle: `test-results/dot-cache/class/xupuzi-80-deri689/in.svg`
 * (foo5: «A» «B» above the name; foo6: «Foo» «Node» «Bar»).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (source: string): string => renderSync(source, { measurer: new DeterministicMeasurer() });

/** The `<text>` bodies of the cluster whose qualified name is `name`. */
function clusterTexts(svg: string, name: string): string[] {
  const group = new RegExp(`<g class="cluster" data-qualified-name="${name}"[^>]*>(.*?)</g>`).exec(svg)?.[1] ?? '';
  return [...group.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('several stereotypes on a USymbol group (cogr T3e)', () => {
  const svg = render(
    [
      '@startuml',
      'node foo5 <<A>><<B>> {',
      '  class Class2',
      '}',
      'node foo6 <<Foo>><<Node>><<Bar>> {',
      '  class Class3',
      '}',
      '@enduml',
    ].join('\n'),
  );

  it('draws one label per stereotype above the name (two)', () => {
    expect(clusterTexts(svg, 'foo5')).toEqual(['«A»', '«B»', 'foo5']);
  });

  it('draws one label per stereotype above the name (three)', () => {
    expect(clusterTexts(svg, 'foo6')).toEqual(['«Foo»', '«Node»', '«Bar»', 'foo6']);
  });

  it('still takes a single stereotype, and a colour after it', () => {
    const one = render('@startuml\nnode n1 <<X>> #red {\n  class C\n}\n@enduml');
    expect(clusterTexts(one, 'n1')).toEqual(['«X»', 'n1']);
  });
});
