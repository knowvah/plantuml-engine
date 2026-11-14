/**
 * cogr T4f3: `!pragma layout elk` over a class diagram whose groups carry a USymbol (`component c1 { ... }`).
 * `MyElkCluster.java:91-126` draws each group through `ClusterDecoration` with `group.getUSymbol()`, the group style
 * `Cluster.getDefaultStyleDefinition(classDiagram, uSymbol, PACKAGE)`, and `ClusterHeader`'s `(int)(title height +
 * uSymbol.suppHeightBecauseOfShape())` (`ClusterHeader.java:81-95`). Oracle: the ELK embed of
 * `test-results/dot-cache/class/potatu-55-pave291/in.svg` (221x270): each group is a `rx=2.5` rect with `fill="none"`,
 * stroke `#181818` width 1 and the component's two small tab rects, the title above, centred.
 */
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderSync, type ElkBackend } from '../../../src/index.js';
import { loadElk } from '../../../src/core/elk/load-elk.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
let elk: ElkBackend;

beforeAll(async () => {
  elk = await loadElk();
});

const SOURCE = `@startuml
!pragma layout elk
title With ELK
component c1 {
    component comp12 {
        component comp123 {
            component comp1234 {
	        }
        }
    }
}
@enduml`;

describe('class ELK layout with USymbol groups (cogr T4f3)', () => {
  it('draws each component group as the oracle does', () => {
    const svg = renderSync(SOURCE, { measurer, elk });
    expect(svg).not.toContain('not yet supported');
    expect(svg).toContain(
      '<rect x="12" y="47" width="195.363" height="209" fill="none" style="stroke:#181818;stroke-width:1;" rx="2.5" ry="2.5"/>',
    );
    expect(svg).toContain(
      '<rect x="187.363" y="52" width="15" height="10" fill="none" style="stroke:#181818;stroke-width:1;"/>',
    );
    expect(svg).toContain(
      '<text x="102.288" y="70.889" fill="#000" font-size="14" textLength="14.788" font-weight="700">c1</text>',
    );
  });

  it('sizes the page like the oracle embed (221x270)', () => {
    const svg = renderSync(SOURCE, { measurer, elk });
    expect(svg).toMatch(/width="221px" height="270px"/);
  });

  it('keeps refusing the features the ELK path does not reach', () => {
    const svg = renderSync('@startuml\n!pragma layout elk\nclass A\nnote right of A : n\n@enduml', { measurer, elk });
    expect(svg).toContain('notes not yet supported');
  });

  it('matches the nested ELK image of potatu', () => {
    const puml = readFileSync('test-results/dot-cache/class/potatu-55-pave291/in.puml', 'utf8');
    const svg = renderSync(puml, { measurer, elk });
    const images = [...svg.matchAll(/<image width="(\d+)" height="(\d+)"/g)].map((m) => `${m[1]}x${m[2]}`);
    expect(images).toEqual(['255x279', '255x279', '221x270']);
  });
});
