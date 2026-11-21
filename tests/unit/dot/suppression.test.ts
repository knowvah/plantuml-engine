/**
 * `@startdot` under the security profile: `PSystemDot#exportDiagramNow` writes a
 * fixed "This feature has been suppressed" page instead of graphviz's SVG
 * unless the profile allows it (`PSystemDot.java:77-84`). Only INSECURE and
 * INTERNET_WITH_DOTSVG allow it (`SecurityProfile.java:195-202`), so the
 * default LEGACY profile suppresses. Upstream fixed the inverted check in
 * e3d33a8afe5 (plantuml#2885).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { allowDotSvg, SecurityProfile } from '../../../src/core/security/SecurityProfile.js';

const DOC = ['@startdot', 'digraph chain {', '  a -> b -> c -> d -> e', '}', '@enddot'].join('\n');
const ORACLE = 'test-results/dot-cache/dot/chain-expansion';

describe('allowDotSvg', () => {
  it.each([
    [SecurityProfile.INSECURE, true],
    [SecurityProfile.INTERNET_WITH_DOTSVG, true],
    [SecurityProfile.LEGACY, false],
    [SecurityProfile.INTERNET, false],
    [SecurityProfile.ALLOWLIST, false],
    [SecurityProfile.SANDBOX, false],
  ])('%s -> %s', (profile, expected) => {
    expect(allowDotSvg(profile)).toBe(expected);
  });
});

describe('@startdot suppression page', () => {
  it('the default profile writes the jar page byte for byte', () => {
    expect(readFileSync(`${ORACLE}/in.puml`, 'utf8')).toBe(DOC);
    expect(renderSync(DOC)).toBe(readFileSync(`${ORACLE}/in.svg`, 'utf8'));
  });

  it('LEGACY, given explicitly, suppresses too', () => {
    expect(renderSync(DOC, { securityProfile: SecurityProfile.LEGACY })).toContain(
      '>This feature has been suppressed</text>',
    );
  });

  it.each([SecurityProfile.INSECURE, SecurityProfile.INTERNET_WITH_DOTSVG])(
    '%s renders the graph through graphviz',
    (securityProfile) => {
      const svg = renderSync(DOC, { securityProfile });
      expect(svg).not.toContain('This feature has been suppressed');
      expect(svg).toContain('<title>a&#45;&gt;b</title>');
    },
  );
});
