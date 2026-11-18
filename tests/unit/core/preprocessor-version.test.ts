import { describe, expect, it } from 'vitest';
import { preprocess } from '../../../src/core/preprocessor.js';
import { VERSION } from '../../../src/core/version.js';

/**
 * `%version()` through the whole preprocessor, with the default environment
 * `preprocess` builds. Upstream returns `Version.versionString()`
 * (`tim/builtin/GetVersion.java:63-66` -> `version/Version.java:47-49`); this
 * port returns its own version by maintainer ruling #155 (2026-11-09). The
 * legend line is `rekefe-90-baju604`'s.
 */
describe('preprocessor: %version() (ruling #155)', () => {
  it("expands to this port's version", () => {
    expect(preprocess('Version %version()').lines).toEqual([`Version ${VERSION}`]);
  });

  it("expands inside rekefe-90-baju604's legend line", () => {
    const result = preprocess(
      ['legend', '<size:8> Rendered with Plantuml Version %version() </size>', 'end legend'].join('\n'),
    );
    expect(result.lines).toEqual([
      'legend',
      `<size:8> Rendered with Plantuml Version ${VERSION} </size>`,
      'end legend',
    ]);
  });
});
