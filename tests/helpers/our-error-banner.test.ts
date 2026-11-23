import { describe, expect, it } from 'vitest';
import { renderSync } from '../../src/index.js';
import { MY_GREEN } from '../../src/core/error/error-text.js';
import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { fullDescription } from '../../src/core/version.js';
import { hasOurErrorBanner } from './our-error-banner.js';

function render(line: string): string {
  return renderSync(`@startuml\n${line}\n@enduml\n`, { measurer: new DeterministicMeasurer() });
}

describe('hasOurErrorBanner', () => {
  it("recognises a real error page's banner", () => {
    expect(hasOurErrorBanner(render('straße'))).toBe(true);
  });

  it('does not take the testdot page, which prints fullDescription() black on white, for an error page', () => {
    const testdot = render('testdot');
    expect(testdot).toContain(`>${fullDescription()}</text>`);
    expect(hasOurErrorBanner(testdot)).toBe(false);
  });

  it('needs the banner fill on the same <text> as the whole description', () => {
    const banner = `<text x="5" fill="${MY_GREEN}">${fullDescription()}</text>`;
    expect(hasOurErrorBanner(`<svg>${banner}</svg>`)).toBe(true);
    expect(hasOurErrorBanner(`<svg><text fill="${MY_GREEN}">x</text><text>${fullDescription()}</text></svg>`)).toBe(
      false,
    );
    expect(hasOurErrorBanner(`<svg><text fill="${MY_GREEN}">${fullDescription()} and more</text></svg>`)).toBe(false);
    expect(hasOurErrorBanner(`<svg><text>${fullDescription()}</text>${banner}</svg>`)).toBe(true);
  });
});
