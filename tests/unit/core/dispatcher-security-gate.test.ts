/**
 * The registry's security-profile registration gate (ipe D1): a plugin that
 * declares `registeredOnlyUnder` is resolved only when the render's
 * `ParseOptions.securityProfile` (default LEGACY) is that profile, the port's
 * form of `PSystemBuilder`'s conditional `factories.add`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:178-179
 */
import { describe, expect, it } from 'vitest';
import { DiagramRegistry, type SyncPlugin } from '../../../src/core/dispatcher.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { refuse } from '../../../src/core/parse-refusal.js';
import { parseOptionsOf } from '../../../src/core/render-options.js';
import { SecurityProfile } from '../../../src/core/security/SecurityProfile.js';
import { renderSync } from '../../../src/index.js';

const SOURCE: UmlSource = { lines: ['anything'], type: 'sequence' };
const GATED_AST = { kind: 'gated' };
const UNGATED_AST = { kind: 'ungated' };
const HIGH_REFUSAL = refuse('syntax', 0, 3, 'gated refusal');
const LOW_REFUSAL = refuse('syntax', 0, 1, 'ungated refusal');

function plugin(answer: unknown, registeredOnlyUnder?: SecurityProfile): SyncPlugin {
  return {
    type: 'sequence',
    ...(registeredOnlyUnder === undefined ? {} : { registeredOnlyUnder }),
    parse: () => answer,
    layoutSync: () => ({}),
    render: () => ({ completeSvg: '<svg/>' }),
  };
}

function registryOf(...plugins: SyncPlugin[]): DiagramRegistry {
  const registry = new DiagramRegistry();
  for (const p of plugins) registry.register(p);
  return registry;
}

describe('DiagramRegistry#resolve — registeredOnlyUnder', () => {
  it('skips a plugin gated on INSECURE when the render names no profile (LEGACY default)', () => {
    const resolution = registryOf(plugin(GATED_AST, 'INSECURE'), plugin(UNGATED_AST)).resolve(SOURCE);
    expect(resolution.ast).toBe(UNGATED_AST);
  });

  it('hands the source to the gated plugin under its own profile', () => {
    const registry = registryOf(plugin(GATED_AST, 'INSECURE'), plugin(UNGATED_AST));
    const resolution = registry.resolve(SOURCE, { securityProfile: SecurityProfile.INSECURE });
    expect(resolution.ast).toBe(GATED_AST);
  });

  it('skips the gated plugin under every other profile', () => {
    const registry = registryOf(plugin(GATED_AST, 'INSECURE'), plugin(UNGATED_AST));
    for (const profile of ['SANDBOX', 'ALLOWLIST', 'INTERNET', 'INTERNET_WITH_DOTSVG', 'LEGACY'] as const) {
      expect(registry.resolve(SOURCE, { securityProfile: profile }).ast).toBe(UNGATED_AST);
    }
  });

  it('adds no refusal to the merge when skipped', () => {
    const registry = registryOf(plugin(HIGH_REFUSAL, 'INSECURE'), plugin(LOW_REFUSAL));
    expect(registry.resolve(SOURCE, { securityProfile: 'LEGACY' }).refusal).toBe(LOW_REFUSAL);
    expect(registry.resolve(SOURCE, { securityProfile: 'INSECURE' }).refusal).toBe(HIGH_REFUSAL);
  });
});

describe('parseOptionsOf', () => {
  it('forwards RenderOptions.securityProfile verbatim', () => {
    expect(parseOptionsOf({ securityProfile: 'SANDBOX' }).securityProfile).toBe('SANDBOX');
  });

  it('leaves securityProfile undefined when no options are given', () => {
    const options = parseOptionsOf(undefined);
    expect(options.securityProfile).toBeUndefined();
    expect(options.assetStore).toBeUndefined();
    expect(options.measurer).toBeUndefined();
  });
});

describe('isEmptyDescription under INSECURE', () => {
  it('draws the same empty-description page as the default profile', () => {
    const empty = '@startuml\n@enduml';
    expect(renderSync(empty, { securityProfile: 'INSECURE' })).toBe(renderSync(empty));
  });
});
