# T1a — the security-profile registration gate (D1)

## Context

Upstream registers `PSystemPathFactory` only when `SecurityUtils.getSecurityProfile() == SecurityProfile.INSECURE`
(`PSystemBuilder.java:178-179`). The port's registry is a module singleton that `src/registered-plugins.ts` fills once, and
the profile arrives per render as `RenderOptions.securityProfile` (`src/core/render-options.ts:68-73`, default
`DEFAULT_SECURITY_PROFILE` = LEGACY, `src/core/security/SecurityProfile.ts:41`). This task adds the general mechanism.
T2a uses it for `pathPlugin`.

## Task

1. `src/core/dispatcher-types.ts:41-49`: add `readonly securityProfile?: SecurityProfile | undefined` to `ParseOptions`,
   with a doc comment citing `PSystemBuilder.java:178-179`. Add `readonly registeredOnlyUnder?: SecurityProfile` to both
   `SyncPlugin` (`:337-340`) and its async sibling (`:379-380`). Its doc comment: the plugin is registered only under that
   profile, the port's form of a conditional `factories.add`.
2. `src/core/dispatcher.ts#resolve` (`:129-145`): skip a plugin whose `registeredOnlyUnder` is set and differs from
   `options?.securityProfile ?? DEFAULT_SECURITY_PROFILE`. Skip before `isCandidate`, with no attempt and no refusal.
   Extend `resolve`'s doc comment.
3. `src/core/render-options.ts`: export `parseOptionsOf(options: RenderOptions | undefined): ParseOptions`. It returns
   `{ assetStore, clock: renderClock(options), measurer, securityProfile }`. Move `renderClock`'s import there if needed,
   or keep the clock in `index.ts` and pass it in, whichever leaves no import cycle.
4. `src/index.ts:298-300`: replace the inline object with `parseOptionsOf(options)`. The file is at 496 lines and the hook
   blocks at 500, so the net line count must not grow.

## Write-set

`src/core/dispatcher-types.ts`, `src/core/dispatcher.ts`, `src/core/render-options.ts`, `src/index.ts`,
`tests/unit/core/dispatcher-security-gate.test.ts` (new).

## Read-set

`src/core/dispatcher.ts:100-200`, `src/core/dispatcher-types.ts:20-50, 320-390`, `src/index.ts:285-310`,
`src/core/render-options.ts:50-80`, `tests/unit/dispatcher.test.ts` (fixture-registry patterns),
`tests/unit/core/empty-source-factory-base.test.ts`.

## Acceptance (Given/When/Then)

- Given a fresh `DiagramRegistry` holding a gated plugin (`registeredOnlyUnder: INSECURE`) that accepts everything, then
  an ungated plugin that accepts everything, when `resolve` runs with no `securityProfile`, then the ungated plugin owns
  the source. When it runs with `securityProfile: 'INSECURE'`, the gated plugin owns it.
- Given only a gated plugin that refuses with a high-scoring refusal, and an ungated plugin that refuses with a lower one,
  when `resolve` runs under LEGACY, then the merged refusal is the ungated plugin's: the gated one added nothing.
- Given `renderSync('@startuml\n@enduml', { securityProfile: 'INSECURE' })`, then the page equals the one with no options.
  This is the empty-description path, `isEmptyDescription`.
- Given `parseOptionsOf({ securityProfile: 'SANDBOX' })`, then `.securityProfile === 'SANDBOX'`. Given
  `parseOptionsOf(undefined)`, then `.securityProfile` is `undefined`.
- Given the full suite, then no existing test changes.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(dispatcher): gate a plugin on the render's security profile` (`Refs: #178`).
