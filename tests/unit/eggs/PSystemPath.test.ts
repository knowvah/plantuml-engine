/** `PSystemPath` (eggs/PSystemPath.java): a `DirectOsDiagram` exporting `GraphicsPath`. */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { PSystemPath } from '../../../src/diagrams/eggs/PSystemPath.js';
import { sourceOf } from './plugin-harness.js';

const SOURCE = sourceOf('@startuml\npath AB\n@enduml\n');

describe('PSystemPath', () => {
  it('describes itself as (Path) (java:65-67)', () => {
    expect(new PSystemPath(SOURCE, 'AB', new PreprocessingArtifact()).getDescription()).toBe('(Path)');
  });

  it("exports GraphicsPath's page (java:59-63)", () => {
    const svg = new PSystemPath(SOURCE, 'AB', new PreprocessingArtifact()).exportDiagram(
      0,
      new DeterministicMeasurer(),
    );
    expect(svg).toContain('<path d="M20,20 C20,20 17,17 17,17 C17,17 15,14 15,14"');
  });
});
