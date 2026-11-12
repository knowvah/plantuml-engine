/**
 * Renders a Chen source through the PRODUCTION `renderSync` with the survey's options. `chenPlugin` is registered
 * at `PSystemBuilder.java:199` (`registered-plugins.ts`, ceep T3a).
 */
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

/** The name the survey gives every source; an error page prints it. */
const SURVEY_FILENAME = 'in.puml';

/** The SVG our engine draws for `puml`, through `chenPlugin`. */
export function renderChen(puml: string): string {
  return renderSync(
    puml,
    withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer(), filename: SURVEY_FILENAME }),
  );
}
